import { Shield, Sparkles, Trophy, Handshake, Mail, ArrowRight } from "lucide-react";

export function SponsorsSection() {
  return (
    <section className="flex flex-col gap-5 pt-4">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#D9A928]" />
          <h2 className="text-sm md:text-base font-black uppercase tracking-wider text-[#111111]">
            OFFICIAL TOURNAMENT PARTNERS
          </h2>
        </div>
        <span className="text-[10px] font-extrabold text-[#5F6368] uppercase tracking-wider">
          TPL 2026
        </span>
      </div>

      {/* Main Sponsors Showcase Card */}
      <div className="relative overflow-hidden rounded-3xl bg-[#121316] border border-white/10 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#D9A928]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6">
          {/* Top Row: Title Sponsor & Tournament Patron */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title Partner Slot */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-5 flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#D9A928] bg-black/50 px-2.5 py-1 rounded-full border border-[#D9A928]/30">
                  Title Sponsor
                </span>
                <Trophy className="h-4 w-4 text-[#D9A928]" />
              </div>
              <div>
                <p className="text-lg font-black uppercase text-white tracking-wide">
                  Thunduwa Premier League 2026
                </p>
                <p className="text-xs text-white/60 font-medium mt-1">
                  Official Tournament Organizing Committee & Community Patrons
                </p>
              </div>
            </div>

            {/* Associate Partners Slot */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-5 flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/70 bg-black/50 px-2.5 py-1 rounded-full border border-white/10">
                  Broadcast & Media
                </span>
                <Shield className="h-4 w-4 text-white/60" />
              </div>
              <div>
                <p className="text-lg font-black uppercase text-white tracking-wide">
                  TPL Live Match Broadcast
                </p>
                <p className="text-xs text-white/60 font-medium mt-1">
                  Real-time ball-by-ball scoring, player statistics & tournament live engine
                </p>
              </div>
            </div>
          </div>

          {/* Partnership & Sponsorship Inquiry CTA */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#D9A928]/15 border border-[#D9A928]/30 flex items-center justify-center shrink-0">
                <Handshake className="h-5 w-5 text-[#D9A928]" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-black text-white uppercase">
                  Partner with TPL 2026
                </p>
                <p className="text-[10px] text-white/60 font-medium">
                  Connect your brand with thousands of passionate cricket fans and players
                </p>
              </div>
            </div>

            <a
              href="mailto:contact@tplcricket.com?subject=TPL%202026%20Sponsorship%20Inquiry"
              className="tap inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D9A928] hover:bg-[#E5B537] text-black text-xs font-black uppercase tracking-wider shadow-md transition-all shrink-0"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Sponsor Inquiries</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
