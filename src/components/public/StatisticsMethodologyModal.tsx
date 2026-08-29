import { useState } from "react";
import {
  TPL_STATISTICS_METHODOLOGY,
  getAllMethodologiesByCategory,
  METHODOLOGY_VERSION,
  METHODOLOGY_LAST_UPDATED,
  OFFICIAL_RULES_REFERENCE_URL,
  type MetricCategory,
  type MetricMethodology,
} from "@/lib/scoring/statistics-methodology";
import {
  BookOpen,
  X,
  Trophy,
  Flame,
  Target,
  Shield,
  Activity,
  Award,
  ExternalLink,
  ChevronRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: MetricCategory;
}

export function StatisticsMethodologyModal({ isOpen, onClose, initialCategory = "AWARDS" }: Props) {
  const [activeCategory, setActiveCategory] = useState<MetricCategory>(initialCategory);
  const grouped = getAllMethodologiesByCategory();

  if (!isOpen) return null;

  const categories: Array<{ id: MetricCategory; label: string; icon: any }> = [
    { id: "AWARDS", label: "Official Awards & MVP", icon: Trophy },
    { id: "BATTING", label: "Batting Formulas", icon: Flame },
    { id: "BOWLING", label: "Bowling Formulas", icon: Target },
    { id: "FIELDING", label: "Fielding Metrics", icon: Shield },
    { id: "STANDINGS_AND_NRR", label: "Points & NRR", icon: Activity },
  ];

  const currentMetrics = grouped[activeCategory] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121316] border-2 border-[#D9A928]/40 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-black via-[#1E1B11] to-black border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[#D9A928]/20 flex items-center justify-center text-[#D9A928] border border-[#D9A928]/30">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#D9A928] bg-[#D9A928]/10 px-2 py-0.5 rounded-full border border-[#D9A928]/20">
                  Version {METHODOLOGY_VERSION}
                </span>
                <span className="text-[10px] text-white/50 font-bold uppercase">
                  Audited & Deterministic
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-wide text-white mt-0.5">
                Official Statistics & Awards Methodology
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="tap h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Category Navigation Bar */}
        <div className="flex items-center gap-2 p-3 bg-black/40 border-b border-white/10 overflow-x-auto no-scrollbar">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`tap shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  isActive
                    ? "bg-[#D9A928] text-black shadow-md"
                    : "bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/10"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 max-h-[60vh]">
          {currentMetrics.map((metric) => (
            <div
              key={metric.key}
              className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-2.5 hover:border-[#D9A928]/40 transition-colors"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black uppercase text-[#D9A928]">
                    {metric.name}
                  </h3>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/10 text-white/60 uppercase">
                    {metric.scope} SCOPE
                  </span>
                </div>
                <span className="text-[10px] font-mono text-white/40">{metric.methodologyVersion}</span>
              </div>

              <p className="text-xs text-white/80 leading-relaxed font-medium">
                {metric.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[9px] font-black uppercase text-[#D9A928] block mb-0.5">
                    Mathematical Formula
                  </span>
                  <p className="text-xs font-mono text-white font-bold">{metric.formula}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[9px] font-black uppercase text-amber-400 block mb-0.5">
                    Qualification Threshold
                  </span>
                  <p className="text-xs text-white/90 font-medium">{metric.qualification}</p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-1 text-[11px] text-white/70">
                <p>
                  <strong className="text-white/90">Source Data:</strong> {metric.sourceData}
                </p>
                <p>
                  <strong className="text-white/90">Tie-Breaking:</strong> {metric.tieBreakRule}
                </p>
                <p>
                  <strong className="text-white/90">Edge Cases / Rules:</strong> {metric.edgeCases}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-black border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-[11px] text-white/60">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#D9A928]" />
            <span>All formulas strictly evaluated from authoritative match deliveries.</span>
          </div>

          <a
            href={OFFICIAL_RULES_REFERENCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="tap inline-flex items-center gap-1.5 font-bold text-[#D9A928] hover:underline"
          >
            <span>Official TPL Rules Page</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
