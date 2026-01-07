import { useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function useDebouncedValue(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}

function GameCard({ game }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition">
      <div className="relative aspect-[2/3] bg-black/20">
  {/* blurred background layer */}
  <img
  src={game.imageUrl}
  alt={game.name}
  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
  loading="lazy"
/>
</div>
      <div className="p-3">
        <div className="min-h-[2.5rem] text-sm text-white/90">
          {game.name}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="text-lg font-semibold text-white">
            €{Number(game.priceEur).toFixed(2)}
          </div>
          <div className="text-xs text-white/60">
            {(game.platform ?? "PC")} · {(game.region ?? "EU")}
          </div>
        </div>

        <div className="mt-2 text-xs text-white/50">{game.store ?? "Eneba"}</div>
      </div>
    </div>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 350);

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const endpoint = useMemo(() => {
    const q = debouncedQuery.trim();
    return q ? `${API_URL}/list?search=${encodeURIComponent(q)}` : `${API_URL}/list`;
  }, [debouncedQuery]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setGames(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setError("Could not load games. Is backend running?");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [endpoint]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#3b1b6e] via-[#2b1458] to-[#150b2e]">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-white">
            <div className="text-2xl font-semibold">Eneba Game Search</div>
            <div className="text-sm text-white/70">
              Search games using a simple API
            </div>
          </div>

          <div className="w-full sm:w-[420px]">
            <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-4 py-3">
              <span className="text-white/60">🔎</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search games…"
                className="w-full bg-transparent outline-none text-white placeholder:text-white/50"
              />
            </div>

            <div className="mt-2 text-xs text-white/50">
              {loading ? "Searching…" : `Results: ${games.length}`}
            </div>

            {error && (
              <div className="mt-2 rounded-lg border border-red-400/30 bg-red-400/10 p-2 text-sm text-red-100">
                {error}
              </div>
            )}
          </div>
        </header>

        <main className="mt-6">
          {!loading && games.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-white/70">
              No results for{" "}
              <span className="text-white">"{debouncedQuery.trim()}"</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {games.map((g) => (
                <GameCard key={g.id} game={g} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
