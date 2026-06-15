"use client";

import { ProfileSection } from "@vllnt/ui";

export default function ProfileSectionPreview() {
  return (
    <ProfileSection
      dict={{ profile: { name: "John Doe", tagline: "Full-stack developer" } }}
      imageAlt="Profile"
      imageSource="/profile.png"
      socialLinks={[{ href: "https://github.com", label: "GitHub" }]}
    />
  );
}
