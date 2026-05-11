import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'secondary' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    
    let variantStyles = ""
    switch (variant) {
      case 'default': variantStyles = "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"; break;
      case 'destructive': variantStyles = "bg-red-500 text-white hover:bg-red-600"; break;
      case 'outline': variantStyles = "border border-slate-200 bg-transparent hover:bg-slate-100 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-gray-100"; break;
      case 'secondary': variantStyles = "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"; break;
      case 'ghost': variantStyles = "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:text-gray-100"; break;
      case 'link': variantStyles = "text-blue-600 underline-offset-4 hover:underline dark:text-blue-400"; break;
    }
    
    let sizeStyles = ""
    switch (size) {
      case 'default': sizeStyles = "h-10 px-4 py-2"; break;
      case 'sm': sizeStyles = "h-9 rounded-md px-3"; break;
      case 'lg': sizeStyles = "h-11 rounded-md px-8"; break;
      case 'icon': sizeStyles = "h-10 w-10"; break;
    }
    
    return (
      <Comp
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className || ''}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
