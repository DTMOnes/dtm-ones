"use client";

import chrome from "./roster-chrome.module.scss";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className={chrome.page}>
      <div className={chrome.inner}>
        <h1 className={chrome.title}>Roster</h1>
        <p className={chrome.message}>
          Something went wrong while loading the roster. Try again in a moment.
        </p>
        <button type="button" className={chrome.retry} onClick={reset}>
          Try again
        </button>
      </div>
    </main>
  );
}
