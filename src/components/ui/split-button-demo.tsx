import { Activity, Plus, Sparkles } from "lucide-react";
import { SplitButton, GlassPillButton } from "@/components/ui/split-button";

export function SplitButtonDemo() {
  return (
    <div className="w-full bg-[#090B12] p-8 rounded-3xl border border-white/10 flex flex-col items-center gap-8 shadow-2xl">
      <p className="text-xs uppercase tracking-widest text-[#9A6BFF] font-bold">
        Tactile Glassmorphic Split Button
      </p>

      {/* Button Toolbar Bar matching image */}
      <div className="flex items-center gap-3 bg-[#0c0f1a] p-3 rounded-2xl border border-white/5 shadow-inner">
        <GlassPillButton label="Pause" />
        <SplitButton
          label="New"
          icon={Plus}
          variant="purple"
          onAction={() => alert("New action triggered")}
          onDropdown={() => alert("Dropdown opened")}
        />
        <GlassPillButton icon={Activity} />
      </div>

      {/* TPL Gold Tournament Theme Variant */}
      <div className="flex items-center gap-4">
        <SplitButton
          label="New Match"
          icon={Sparkles}
          variant="gold"
          onAction={() => {}}
        />
        <SplitButton
          label="Add Ball"
          icon={Plus}
          variant="dark"
          onAction={() => {}}
        />
      </div>
    </div>
  );
}
