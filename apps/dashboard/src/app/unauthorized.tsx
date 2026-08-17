import Link from "next/link";

export default function Unauthorized() {
  return (
    <main>
      <h2>Unauthorized</h2>
      <p>Please sign in to continue.</p>
      <Link href="/signin">Sign in</Link>
    </main>
  );
}
