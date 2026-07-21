"use client";

import chrome from "./home-chrome.module.scss";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className={chrome.page}>
      <h1 className={chrome.title}>Something went wrong</h1>
      <p className={chrome.message}>
        We could not load this page. Try again in a moment.
      </p>
      <button type="button" className={chrome.retry} onClick={reset}>
        Try again
      </button>
    </main>
  );
}
