import { createPublicClient, http } from 'viem'
import { base, mainnet } from 'viem/chains'

import { requiredEnv } from '@/utils/shared/requiredEnv'

const THIRDWEB_AUTH_PRIVATE_KEY = requiredEnv(
  process.env.THIRDWEB_AUTH_PRIVATE_KEY,
  'THIRDWEB_AUTH_PRIVATE_KEY',
)

export const thirdwebRPCClient = createPublicClient({
  chain: mainnet,
  transport: http('https://ethereum.rpc.thirdweb.com', {
    batch: {
      wait: 100,
    },
    fetchOptions: {
      headers: { 'x-secret-key': THIRDWEB_AUTH_PRIVATE_KEY },
    },
  }),
})

export const thirdwebBaseRPCClient = createPublicClient({
  chain: base,
  transport: http('https://base.rpc.thirdweb.com', {
    batch: {
      wait: 100,
    },
    fetchOptions: {
      headers: { 'x-secret-key': THIRDWEB_AUTH_PRIVATE_KEY },
    },
  }),
})
