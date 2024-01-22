'use server'
import 'server-only'

import {
  UserAndMethodOfMatch,
  getMaybeUserAndMethodOfMatch,
} from '@/utils/server/getMaybeUserAndMethodOfMatch'
import { prismaClient } from '@/utils/server/prismaClient'
import { getServerAnalytics, getServerPeopleAnalytics } from '@/utils/server/serverAnalytics'
import { getUserSessionId } from '@/utils/server/serverUserSessionId'
import { getLogger } from '@/utils/shared/logger'
import { UserActionCallCampaignName } from '@/utils/shared/userActionCampaigns'
import { User, UserAction, UserActionType } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { subDays } from 'date-fns'
import { z } from 'zod'

import { getClientUser } from '@/clientModels/clientUser/clientUser'
import {
  mapLocalUserToUserDatabaseFields,
  parseLocalUserFromCookies,
} from '@/utils/server/serverLocalUser'
import { mapPersistedLocalUserToAnalyticsProperties } from '@/utils/shared/localUser'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import { createActionCallCongresspersonInputValidationSchema } from './inputValidationSchema'

export type CreateActionCallCongresspersonInput = z.infer<
  typeof createActionCallCongresspersonInputValidationSchema
>

interface SharedDependencies {
  localUser: ReturnType<typeof parseLocalUserFromCookies>
  sessionId: ReturnType<typeof getUserSessionId>
  analytics: ReturnType<typeof getServerAnalytics>
  peopleAnalytics: ReturnType<typeof getServerPeopleAnalytics>
}

const logger = getLogger(`actionCreateUserActionCallCongressperson`)
export async function actionCreateUserActionCallCongressperson(
  input: CreateActionCallCongresspersonInput,
) {
  logger.info('triggered')

  const validatedInput = createActionCallCongresspersonInputValidationSchema.safeParse(input)
  if (!validatedInput.success) {
    return {
      errors: validatedInput.error.flatten().fieldErrors,
    }
  }

  const localUser = parseLocalUserFromCookies()
  const sessionId = getUserSessionId()

  const userMatch = await getMaybeUserAndMethodOfMatch({
    include: { primaryUserCryptoAddress: true },
  })
  const peopleAnalytics = getServerPeopleAnalytics({
    localUser,
    ...userMatch,
  })
  const user = userMatch.user || (await createUser({ localUser, sessionId, peopleAnalytics }))

  const analytics = getServerAnalytics({
    ...userMatch,
    localUser,
  })

  const recentUserAction = await getRecentUserActionByUserId(user.id)
  if (recentUserAction) {
    logSpamActionSubmissions({
      validatedInput,
      userAction: recentUserAction,
      userId: user.id,
      sharedDependencies: { analytics },
    })
    return { user: getClientUser(user) }
  }

  const { updatedUser } = await createActionAndUpdateUser({
    user,
    validatedInput: validatedInput.data,
    userMatch,
    sharedDependencies: { sessionId, analytics, peopleAnalytics },
  })

  // TODO: Mint "Call" NFT

  return { user: getClientUser(updatedUser) }
}

async function createUser(
  sharedDependencies: Pick<SharedDependencies, 'localUser' | 'sessionId' | 'peopleAnalytics'>,
) {
  const { localUser, sessionId } = sharedDependencies
  const createdUser = await prismaClient.user.create({
    data: {
      isPubliclyVisible: false,
      userSessions: { create: { id: sessionId } },
      ...mapLocalUserToUserDatabaseFields(localUser),
    },
    include: {
      primaryUserCryptoAddress: true,
    },
  })
  logger.info('created user')

  if (localUser?.persisted) {
    sharedDependencies.peopleAnalytics?.setOnce(
      mapPersistedLocalUserToAnalyticsProperties(localUser.persisted),
    )
  }

  return createdUser
}

async function getRecentUserActionByUserId(userId: User['id']) {
  return prismaClient.userAction.findFirst({
    where: {
      datetimeCreated: {
        lte: subDays(new Date(), 1),
      },
      actionType: UserActionType.CALL,
      campaignName: UserActionCallCampaignName.DEFAULT,
      userId: userId,
    },
    include: {
      userActionEmail: true,
    },
  })
}

function logSpamActionSubmissions({
  validatedInput,
  userAction,
  userId,
  sharedDependencies,
}: {
  validatedInput: z.SafeParseSuccess<
    z.infer<typeof createActionCallCongresspersonInputValidationSchema>
  >
  userAction: UserAction
  userId: User['id']
  sharedDependencies: Pick<SharedDependencies, 'analytics'>
}) {
  sharedDependencies.analytics.trackUserActionCreatedIgnored({
    actionType: UserActionType.CALL,
    campaignName: UserActionCallCampaignName.DEFAULT,
    reason: 'Too Many Recent',
    ...convertAddressToAnalyticsProperties(validatedInput.data.address),
  })
  Sentry.captureMessage(
    `duplicate ${UserActionType.CALL} user action for campaign ${UserActionCallCampaignName.DEFAULT} submitted`,
    {
      extra: { validatedInput: validatedInput.data, userAction },
      user: { id: userId },
    },
  )
}

async function createActionAndUpdateUser<U extends User>({
  user,
  validatedInput,
  userMatch,
  sharedDependencies,
}: {
  user: U
  validatedInput: z.infer<typeof createActionCallCongresspersonInputValidationSchema>
  userMatch: UserAndMethodOfMatch
  sharedDependencies: Pick<SharedDependencies, 'sessionId' | 'analytics' | 'peopleAnalytics'>
}) {
  const userAction = await prismaClient.userAction.create({
    data: {
      user: { connect: { id: user.id } },
      actionType: UserActionType.CALL,
      campaignName: validatedInput.campaignName,
      ...('userCryptoAddress' in userMatch
        ? {
            userCryptoAddress: { connect: { id: userMatch.userCryptoAddress.id } },
          }
        : { userSession: { connect: { id: sharedDependencies.sessionId } } }),
      userActionCall: {
        create: {
          recipientDtsiSlug: validatedInput.dtsiSlug,
          recipientPhoneNumber: validatedInput.phoneNumber,
          address: {
            connectOrCreate: {
              where: { googlePlaceId: validatedInput.address.googlePlaceId },
              create: validatedInput.address,
            },
          },
        },
      },
    },
    include: {
      userActionCall: true,
    },
  })

  const updatedUser = await prismaClient.user.update({
    where: { id: user.id },
    data: {
      address: {
        connect: {
          id: userAction.userActionCall!.addressId,
        },
      },
    },
    include: {
      primaryUserCryptoAddress: true,
    },
  })
  logger.info('created user action and updated user')

  sharedDependencies.analytics.trackUserActionCreated({
    actionType: UserActionType.CALL,
    campaignName: validatedInput.campaignName,
    'Recipient DTSI Slug': validatedInput.dtsiSlug,
    'Recipient Phone Number': validatedInput.phoneNumber,
    ...convertAddressToAnalyticsProperties(validatedInput.address),
  })
  sharedDependencies.peopleAnalytics.set({
    ...convertAddressToAnalyticsProperties(validatedInput.address),
  })

  return { userAction, updatedUser }
}