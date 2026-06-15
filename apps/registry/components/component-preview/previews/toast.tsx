"use client";

import { Toast, ToastDescription, ToastTitle } from "@vllnt/ui";

export default function ToastPreview() {
  return (
    <div className="space-y-2">
      <Toast>
        <ToastTitle>Toast Title</ToastTitle>
        <ToastDescription>Toast description goes here.</ToastDescription>
      </Toast>
    </div>
  );
}
