import { useENS } from '@thirdweb-dev/react'

import { ClientUser } from '@/clientModels/clientUser/clientUser'
import { ClientUserCryptoAddressWithENSData } from '@/clientModels/clientUser/clientUserCryptoAddress'

export function appendENSHookDataToUser<U extends ClientUser>(
  user: U,
  ensData: ReturnType<typeof useENS>['data'],
): Omit<U, 'primaryUserCryptoAddress'> & {
  primaryUserCryptoAddress: ClientUserCryptoAddressWithENSData | null
} {
  return {
    ...user,
    primaryUserCryptoAddress: user.primaryUserCryptoAddress && {
      ...user.primaryUserCryptoAddress,
      ensName: ensData?.ens || null,
      ensAvatarUrl: ensData?.avatarUrl || null,
    },
  }
}
