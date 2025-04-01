"use client"

import * as React from "react"

interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
  ref?: React.Ref<HTMLElement>
}

const Slot = React.forwardRef<HTMLElement, SlotProps>(
  ({ children, ...props }, ref) => {
    if (React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement, {
        ...props,
        ref: ref || (children as any).ref,
      })
    }
    return <span ref={ref} {...props}>{children}</span>
  }
)

Slot.displayName = "Slot"

export { Slot }