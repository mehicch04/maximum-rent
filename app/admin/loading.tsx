/**
 * Instant skeleton shown while any /admin route fetches its data on the server.
 * Removes the "blank screen while waiting" feeling on login and navigation.
 */
export default function AdminLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="h-8 w-52 animate-pulse rounded-lg bg-surface-muted" />
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-surface-muted" />
        ))}
      </div>
      <div className="mt-8 space-y-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-surface-muted" />
        ))}
      </div>
    </div>
  );
}
