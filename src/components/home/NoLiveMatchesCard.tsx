import { Link } from "@tanstack/react-router";

export function NoLiveMatchesCard() {
  return (
    <Link
      to="/matches"
      className="tap group block relative overflow-hidden rounded-3xl bg-[#0c0d10] border border-white/10 shadow-2xl transition-all duration-300 hover:border-[#D9A928]/50 hover:shadow-[0_0_30px_rgba(217,169,40,0.2)] focus:outline-none focus:ring-2 focus:ring-[#D9A928]"
      aria-label="No live matches right now. Click to view upcoming fixtures"
    >
      <img
        src="/no-live-matches.png"
        alt="No live matches right now. Please check back later for live scores and updates. View upcoming fixtures."
        className="w-full h-auto object-cover select-none transition-transform duration-500 group-hover:scale-[1.01]"
        loading="eager"
      />
    </Link>
  );
}
