import React from "react"

interface A11yWrapperProps {
  children: React.ReactNode
  ariaHidden?: boolean
  role?: string
  tabIndex?: number
  className?: string
}

/**
 * A wrapper component that properly handles ARIA hidden elements
 * When ariaHidden is true, it ensures all children are not focusable
 */
export function A11yWrapper({ children, ariaHidden = false, role, tabIndex, className }: A11yWrapperProps) {
  // If aria-hidden is true, we need to ensure the element and all its children
  // are not focusable by setting tabIndex=-1
  const ariaProps = ariaHidden
    ? {
        "aria-hidden": "true",
        tabIndex: -1,
      }
    : {}

  // Add any additional props
  const additionalProps = {
    ...(role ? { role } : {}),
    ...(tabIndex !== undefined && !ariaHidden ? { tabIndex } : {}),
  }

  return (
    <div className={className} {...ariaProps} {...additionalProps}>
      {ariaHidden
        ? // If aria-hidden, we need to clone all children and ensure they're not focusable
          React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, {
                tabIndex: -1,
                "aria-hidden": true,
              })
            }
            return child
          })
        : children}
    </div>
  )
}
