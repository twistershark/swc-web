import { mockAddress } from '@/mocks/models/mockAddress'
import { mockUser } from '@/mocks/models/mockUser'
import { mockUserEmailAddress } from '@/mocks/models/mockUserEmailAddress'
import {
  CapitolCanaryCampaignName,
  getCapitolCanaryCampaignID,
} from '@/utils/server/capitolCanary/campaigns'
import { UpsertAdvocateInCapitolCanaryPayloadRequirements } from '@/utils/server/capitolCanary/payloadRequirements'
import { formatCapitolCanaryAdvocateUpdateRequest } from '@/utils/server/capitolCanary/updateAdvocate'
import { faker } from '@faker-js/faker'
import { expect } from '@jest/globals'

it('formats the "update capitol canary advocate" request correctly', () => {
  // Set the seed so that the mocked output is deterministic.
  faker.seed(1)

  const mockedUser = mockUser()
  const mockedAddress = mockAddress()
  const mockedEmailAddress = mockUserEmailAddress()

  mockedUser.capitolCanaryAdvocateId = 68251920
  mockedUser.capitolCanaryInstance = 'STAND_WITH_CRYPTO'

  const payload: UpsertAdvocateInCapitolCanaryPayloadRequirements = {
    campaignId: getCapitolCanaryCampaignID(CapitolCanaryCampaignName.DEFAULT_MEMBERSHIP),
    user: {
      ...mockedUser,
      address: mockedAddress,
    },
    userEmailAddress: mockedEmailAddress,
    opts: {
      isSmsOptin: true,
      shouldSendSmsOptinConfirmation: false,
      isSmsOptout: false,
      isEmailOptin: true,
      isEmailOptout: false,
    },
    metadata: {
      p2aSource: 'source',
      utmSource: 'utmSource',
      utmMedium: 'utmMedium',
      utmCampaign: 'utmCampaign',
      utmTerm: 'utmTerm',
      utmContent: 'utmContent',
      tags: ['tag1', 'tag2'],
    },
  }

  const formattedRequest = formatCapitolCanaryAdvocateUpdateRequest(payload)

  expect(formattedRequest).toMatchInlineSnapshot(`
{
  "address1": "164 Bins Corners",
  "address2": "Suite 904",
  "advocateid": 68251920,
  "campaigns": [
    142628,
  ],
  "city": "New Trycia",
  "country": "GA",
  "email": "Nicklaus_Walker12@gmail.com",
  "emailOptin": 1,
  "emailOptout": 0,
  "firstname": "Mina",
  "lastname": "Abbott",
  "p2aSource": "source",
  "phone": "+19120313363",
  "smsOptin": 1,
  "smsOptinConfirmed": 1,
  "smsOptout": 0,
  "state": "Massachusetts",
  "tags": [
    "tag1",
    "tag2",
  ],
  "utm_campaign": "utmCampaign",
  "utm_content": "utmContent",
  "utm_medium": "utmMedium",
  "utm_source": "utmSource",
  "utm_term": "utmTerm",
  "zip5": "27975",
}
`)
})