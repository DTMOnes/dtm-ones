export type RosterPreviewPlayer = {
  name: string;
  position: string;
  image: string;
};

export const rosterPreviewPlayers: RosterPreviewPlayer[] = [
  {
    name: "Marcus Alvarez",
    position: "Point Guard",
    image: "/assets/images/1.jpeg",
  },
  {
    name: "Darius Cole",
    position: "Shooting Guard",
    image: "/assets/images/2.jpg",
  },
  {
    name: "Emiliano Varga",
    position: "Small Forward",
    image: "/assets/images/3.jpg",
  },
  {
    name: "Khalid Mensah",
    position: "Power Forward",
    image: "/assets/images/4.jpg",
  },
];

export const rosterGalleryImages = [
  "/assets/images/1.jpeg",
  "/assets/images/2.jpg",
  "/assets/images/3.jpg",
  "/assets/images/4.jpg",
  "/assets/images/5.jpg",
  "/assets/images/6.png",
  "/assets/images/7.png",
  "/assets/images/8.jpg",
  "/assets/images/9.webp",
  "/assets/images/10.jpg",
  "/assets/images/11.jpeg",
  "/assets/images/12.png",
] as const;
