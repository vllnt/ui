import Image from "next/image";
import Link from "next/link";

import type { HeadingTag } from "../../lib/types";
import { Button } from "../button/button";

type ProfileDict = {
  profile: {
    name: string;
    tagline: string;
  };
};

type SocialLink = {
  href: string;
  label: string;
};

type ProfileSectionProps = {
  /** Heading tag for the profile name. Defaults to `h3`. */
  as?: HeadingTag;
  compact?: boolean;
  dict: ProfileDict;
  imageAlt?: string;
  imageSource?: string;
  socialLinks?: SocialLink[];
};

export function ProfileSection({
  as: Heading = "h3",
  compact = false,
  dict,
  imageAlt,
  imageSource = "/profile.png",
  socialLinks,
}: ProfileSectionProps) {
  const displayImageAlt = imageAlt ?? `${dict.profile.name} Profile`;
  const showImage = !compact && Boolean(imageSource);
  const showSocialLinks =
    !compact && Boolean(socialLinks && socialLinks.length > 0);

  return (
    <div className="text-center space-y-4">
      {showImage ? (
        <div className="relative size-24 mx-auto overflow-hidden rounded-md">
          <Image
            alt={displayImageAlt}
            className="w-full h-full object-cover rounded-md"
            height={96}
            priority={true}
            src={imageSource}
            width={96}
          />
        </div>
      ) : null}

      <div className="space-y-2">
        <Heading className={`font-semibold ${compact ? "text-lg" : "text-xl"}`}>
          {dict.profile.name}
        </Heading>
        <p className="text-sm text-muted-foreground">
          {compact ? dict.profile.tagline : `> ${dict.profile.tagline}`}
        </p>
      </div>

      {showSocialLinks ? (
        <div className="flex flex-wrap justify-center items-center gap-2">
          {socialLinks?.map((link) => (
            <Link
              href={link.href}
              key={link.href}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Button className="w-32" size="sm" variant="outline">
                {link.label}
              </Button>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
