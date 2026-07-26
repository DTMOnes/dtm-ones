export type GalleryItem =
  | { kind: "image"; id: string; url: string }
  | { kind: "video"; id: string; videoId: string };
