import chrome from "./home-chrome.module.scss";

export default function Loading() {
  return (
    <main className={chrome.loading} aria-busy="true" aria-label="Loading page">
      <span className={chrome.spinner} />
    </main>
  );
}
