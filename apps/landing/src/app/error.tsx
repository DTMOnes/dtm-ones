"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main>
      <h1>Something went wrong</h1>
      <p>We could not load this page. Try again in a moment.</p>
      <button type="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
