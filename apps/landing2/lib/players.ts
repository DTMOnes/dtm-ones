export type Player = {
  id: number
  name: string
  position: string
  number: string
  team: string
  image: string
}

export const players: Player[] = [
  {
    id: 1,
    name: "Marcus Reed",
    position: "Point Guard",
    number: "04",
    team: "Free Agent",
    image: "/players/player-1.png",
  },
  {
    id: 2,
    name: "Sienna Cole",
    position: "Shooting Guard",
    number: "11",
    team: "Pro League",
    image: "/players/player-2.png",
  },
  {
    id: 3,
    name: "Andre Vance",
    position: "Center",
    number: "32",
    team: "EuroLeague",
    image: "/players/player-3.png",
  },
  {
    id: 4,
    name: "Tobias Hart",
    position: "Small Forward",
    number: "23",
    team: "Free Agent",
    image: "/players/player-4.png",
  },
  {
    id: 5,
    name: "Nadia Frost",
    position: "Power Forward",
    number: "08",
    team: "Pro League",
    image: "/players/player-5.png",
  },
  {
    id: 6,
    name: "Eli Booker",
    position: "Combo Guard",
    number: "15",
    team: "Draft Prospect",
    image: "/players/player-6.png",
  },
]
