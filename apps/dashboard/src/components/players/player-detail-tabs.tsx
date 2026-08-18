"use client";

import { useRouter } from "next/navigation";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export function PlayerDetailTabs({
  playerId,
  tab,
  info,
  media,
}: {
  playerId: string;
  tab: "info" | "media";
  info: React.ReactNode;
  media: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => {
        const href =
          value === "media"
            ? `/players/${playerId}?tab=media`
            : `/players/${playerId}`;
        router.replace(href, { scroll: false });
      }}
      className="gap-8"
    >
      <TabsList variant="line">
        <TabsTrigger value="info">Info</TabsTrigger>
        <TabsTrigger value="media">Media</TabsTrigger>
      </TabsList>
      <TabsContent value="info" className="flex flex-col gap-8">
        {info}
      </TabsContent>
      <TabsContent value="media">{media}</TabsContent>
    </Tabs>
  );
}
