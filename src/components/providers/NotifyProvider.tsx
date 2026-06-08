"use client";

import { Toaster } from "sonner";

export function NotifyProvider() {
  return (
    <Toaster
      position="top-center"
      richColors
      closeButton
      expand
      duration={4000}
    />
  );
}
