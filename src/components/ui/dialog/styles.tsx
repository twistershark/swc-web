/*
    Decoupling the styles from the actual component specifically so we want leverage them to build server-rendered
    UX that appears to be a modal but is not for out (homepageDialogDeeplink) use case.
*/

import { cn, twNoop } from '@/utils/web/cn'

export const dialogOverlayStyles = twNoop(
  'fixed inset-0 z-50 bg-foreground/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
)
export const dialogContentStyles = twNoop(
  'fixed left-[50%] top-[50%] z-50 grid max-h-dvh w-11/12 md:w-full max-w-vw max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 overflow-y-auto border bg-background shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-3xl',
)
// often times we'll need to remove padding on a dialog if we need UI where we have a fixed footer and scrollable content (each of these respective sections need their own padding/scroll defined)
export const dialogContentPaddingStyles = twNoop('px-6 pb-6 pt-8 md:pt-14')

export const dialogButtonStyles = twNoop(
  'absolute top-2 rounded-sm p-2 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground',
)

export const dialogCloseStyles = cn('right-2', dialogButtonStyles)
