import { inngest } from '@/inngest/inngest'
import { runBin } from '@/bin/runBin'
import { AirdropPayload } from '@/utils/server/nft/payload'
import { AIRDROP_NFT_INNGEST_EVENT_NAME } from '@/inngest/functions/airdropNFT'
import { prismaClient } from '@/utils/server/prismaClient'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { NFTCurrency, NFTMintStatus, UserActionOptInType, UserActionType } from '@prisma/client'
import { UserActionOptInCampaignName } from '@/utils/shared/userActionCampaigns'
import { NFT_CONTRACT_ADDRESS } from '@/utils/server/nft/contractAddress'
import { NFTSlug } from '@/utils/shared/nft'
import { Decimal } from '@prisma/client/runtime/library'

const LOCAL_USER_CRYPTO_ADDRESS = requiredEnv(
  process.env.LOCAL_USER_CRYPTO_ADDRESS,
  'process.env.LOCAL_USER_CRYPTO_ADDRESS',
)

/*
Run this script only after you have the app running on localhost:3000
*/
async function smokeTestAirdropNFTWithInngest() {
  const user = await prismaClient.user.findFirstOrThrow({
    where: { primaryUserCryptoAddress: { cryptoAddress: LOCAL_USER_CRYPTO_ADDRESS } },
  })

  const action = await prismaClient.userAction.create({
    data: {
      user: { connect: { id: user.id } },
      nftMint: {
        create: {
          nftSlug: NFTSlug.SWC_SHIELD,
          status: NFTMintStatus.REQUESTED,
          costAtMint: 0.0,
          contractAddress: NFT_CONTRACT_ADDRESS[NFTSlug.SWC_SHIELD],
          costAtMintCurrencyCode: NFTCurrency.ETH,
          costAtMintUsd: new Decimal(0),
        },
      },
      actionType: UserActionType.OPT_IN,
      campaignName: UserActionOptInCampaignName.DEFAULT,
      userActionOptIn: {
        create: {
          optInType: UserActionOptInType.SWC_SIGN_UP_AS_SUBSCRIBER,
        },
      },
    },
  })

  const payload: AirdropPayload = {
    nftMintId: action.nftMintId!,
    contractAddress: NFT_CONTRACT_ADDRESS[NFTSlug.SWC_SHIELD],
    recipientWalletAddress: LOCAL_USER_CRYPTO_ADDRESS,
  }

  await inngest.send({
    name: AIRDROP_NFT_INNGEST_EVENT_NAME,
    data: payload,
  })
}

runBin(smokeTestAirdropNFTWithInngest)