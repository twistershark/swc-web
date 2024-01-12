'use client'

import React, { useMemo } from 'react'

import { Button } from '@/components/ui/button'
import { NavbarLoggedInSessionPopoverContent } from './navbarLoggedInSessionPopoverContent'
import { useResponsivePopover } from '@/components/ui/responsivePopover'
import { getSensitiveDataUserDisplayName } from '@/utils/web/userUtils'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useDialog } from '@/hooks/useDialog'

export function NavbarLoggedInSessionButton() {
  const { Popover, PopoverContent, PopoverTrigger } = useResponsivePopover()
  const dialogProps = useDialog(false)

  const { data } = useApiResponseForUserFullProfileInfo()
  const user = data?.user

  return (
    <Popover {...dialogProps}>
      <PopoverTrigger asChild>
        <Button variant="secondary" className="min-w-[96px]">
          <div>{user && getSensitiveDataUserDisplayName(user)}</div>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="p-0">
        <NavbarLoggedInSessionPopoverContent
          onClose={() => dialogProps.onOpenChange(false)}
          user={user}
        />
      </PopoverContent>
    </Popover>
  )
}
