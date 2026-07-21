import chrome from "./roster-chrome.module.scss";

export default function Loading() {
  return (
    <main className={chrome.page} aria-busy="true" aria-label="Loading roster">
      <div className={chrome.inner}>
        <div className={chrome.skeletonTitle} />
        <div className={chrome.skeletonSubtitle} />
        <div className={chrome.layout}>
          <div className={chrome.skeletonFilters}>
            <div className={chrome.skeletonBar} />
            <div className={chrome.skeletonBar} />
            <div className={chrome.skeletonBar} />
          </div>
          <div className={chrome.skeletonGrid}>
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className={chrome.skeletonCard} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
