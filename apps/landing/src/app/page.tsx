import type { Metadata } from "next";

// Components
import Canvas from "@/components/Canvas";

export const metadata: Metadata = {
  title: "DTM Ones | The name talent trusts",
  description: "Basketball talent agency built on trust.",
};

export default async function Page() {
  return <Canvas />;
}
