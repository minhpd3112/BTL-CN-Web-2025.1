"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      position="top-right"
      expand={true}
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        style: {
          padding: '16px',
          gap: '12px',
          borderRadius: '10px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
        },
        className: 'toast-enter',
      }}
      {...props}
    />
  );
};

export { Toaster };
