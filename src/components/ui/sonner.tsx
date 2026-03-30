"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--color-background, #ffffff)",
          "--normal-text": "var(--color-foreground, #0a0a0a)",
          "--normal-border": "var(--color-border, #e5e5e5)",
          "--border-radius": "var(--radius-lg, 0.75rem)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
