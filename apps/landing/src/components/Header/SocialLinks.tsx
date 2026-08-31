import {
  InstagramLogo,
  YoutubeLogo,
  type Icon,
} from "@phosphor-icons/react";

import { socials, type SocialId } from "@/config/socials";
import { cn } from "@/lib/utils";

const icons: Record<SocialId, Icon> = {
  instagram: InstagramLogo,
  youtube: YoutubeLogo,
};

/**
 * Header socials beside the brand mark — no glass shell (#63).
 * Meta opacity language (same as InlineNav).
 */
export default function SocialLinks({ className }: { className?: string }) {
  return (
    <nav
      className={cn("flex items-center gap-1", className)}
      aria-label="Social"
    >
      {socials.map(({ id, label, href }) => {
        const Icon = icons[id];

        return (
          <a
            key={id}
            href={href}
            className="inline-flex size-9 items-center justify-center text-white opacity-[0.32] transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none"
            target="_blank"
            rel="noreferrer"
            aria-label={label}
          >
            <Icon className="size-5" weight="regular" aria-hidden />
          </a>
        );
      })}
    </nav>
  );
}
