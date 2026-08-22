import { PlayerGallery } from "@/components/players/media/player-gallery";
import { PlayerPresentationImage } from "@/components/players/media/player-presentation-image";
import type { Coach } from "@/types/coach";

export function CoachMedia({ coach }: { coach: Coach }) {
  return (
    <div className="flex flex-col gap-6">
      <PlayerPresentationImage
        clientId={coach.id}
        kind="coach"
        url={coach.presentationImageUrl}
      />
      <PlayerGallery
        clientId={coach.id}
        kind="coach"
        images={coach.gallery}
      />
    </div>
  );
}
