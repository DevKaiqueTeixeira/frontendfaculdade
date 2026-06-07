"use client";

import { Toaster } from "sonner";

export function NotifyProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      expand
      duration={4000}
    />
  );
}
