"use client";

import { useRouter } from "next/navigation";
import { ImagesIcon, InfoIcon } from "@phosphor-icons/react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

/** Big Info / Media buttons: the selected one filled blue, the other light blue on hover. */
const TRIGGER =
  "h-11 rounded-none font-heading text-lg tracking-wide uppercase text-muted-foreground hover:bg-secondary hover:text-primary data-active:bg-primary data-active:text-primary-foreground data-active:shadow-sm dark:data-active:bg-primary dark:data-active:text-primary-foreground [&_svg:not([class*='size-'])]:size-5";

export function PlayerDetailTabs({
  basePath,
  tab,
  info,
  media,
}: {
  basePath: string;
  tab: "info" | "media";
  info: React.ReactNode;
  media: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => {
        const href = value === "media" ? `${basePath}?tab=media` : basePath;
        router.replace(href, { scroll: false });
      }}
      className="w-full gap-6"
    >
      <TabsList className="bg-card ring-foreground/10 w-full gap-1.5 rounded-none p-1.5 ring-1 group-data-horizontal/tabs:h-auto">
        <TabsTrigger value="info" className={TRIGGER}>
          <InfoIcon />
          Info
        </TabsTrigger>
        <TabsTrigger value="media" className={TRIGGER}>
          <ImagesIcon />
          Media
        </TabsTrigger>
      </TabsList>
      <TabsContent value="info" className="w-full">
        {info}
      </TabsContent>
      <TabsContent value="media" className="w-full">
        {media}
      </TabsContent>
    </Tabs>
  );
}
