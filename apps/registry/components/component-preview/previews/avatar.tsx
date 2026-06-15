"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@vllnt/ui";

export default function AvatarPreview() {
  return (
    <div className="flex gap-4">
      <Avatar>
        <AvatarImage alt="User" src="https://github.com/shadcn.png" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    </div>
  );
}
