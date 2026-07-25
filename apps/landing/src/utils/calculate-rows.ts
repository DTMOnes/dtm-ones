export function calculateRows(totalCards: number): number[] {
  if (totalCards <= 0) return [];

  const hexCount = (n: number) => 3 * n * (n - 1) + 1;

  // Smallest hexagon that fits, then check if the one below is closer
  let n = 1;
  while (hexCount(n) < totalCards) n++;
  if (n > 1 && totalCards - hexCount(n - 1) <= hexCount(n) - totalCards) n--;

  // Ideal hexagon rows: n, n+1, ..., 2n-1, ..., n+1, n
  const rowCount = 2 * n - 1;
  const mid = n - 1;
  const rows = Array.from(
    { length: rowCount },
    (_, i) => 2 * n - 1 - Math.abs(i - mid),
  );

  // Row indices ordered from the middle outwards
  const fromMiddle = [mid];
  for (let d = 1; d <= mid; d++) fromMiddle.push(mid - d, mid + d);
  const fromEdges = [...fromMiddle].reverse();

  let diff = totalCards - hexCount(n);

  // Surplus cards: fatten rows starting at the middle
  for (let k = 0; diff > 0; k++) {
    rows[fromMiddle[k % rowCount]]++;
    diff--;
  }

  // Missing cards: slim rows starting at the tips
  for (let k = 0; diff < 0; k++) {
    const idx = fromEdges[k % rowCount];
    if (rows[idx] > 1) {
      rows[idx]--;
      diff++;
    }
  }

  return rows;
}
