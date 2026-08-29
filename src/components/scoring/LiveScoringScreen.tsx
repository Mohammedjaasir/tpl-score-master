import { useState } from "react";
import type { MatchStore } from "@/lib/scoring/store";
import { lookup } from "@/lib/repositories";
import { ScoreHeader } from "@/components/scoring/ScoreHeader";
import { BatterPanel } from "@/components/scoring/BatterPanel";
import { BowlerPanel } from "@/components/scoring/BowlerPanel";
import { ScoringButtons } from "@/components/scoring/ScoringButtons";
import { RecentBalls } from "@/components/scoring/RecentBalls";
import { OverSummary } from "@/components/scoring/OverSummary";
import { PartnershipPanel } from "@/components/scoring/Partnership";
import { FallOfWickets } from "@/components/scoring/FallOfWickets";
import { UndoBar } from "@/components/scoring/UndoBar";
import { BowlerModal } from "@/components/scoring/BowlerModal";
import { AdjustOversModal } from "@/components/scoring/AdjustOversModal";
import { CloudRain } from "lucide-react";

interface Props {
  store: MatchStore;
}

export function LiveScoringScreen({ store }: Props) {
  const { state, innings, match, doc, activeBowlerId, record, undo, setBowler, updateSetup } = store;
  const [manualBowlerModal, setManualBowlerModal] = useState(false);
  const [oversModalOpen, setOversModalOpen] = useState(false);

  if (!state || !innings || !match) return null;

  const currentInnings = state.innings[state.currentInningsIndex];
  const isChase = state.currentInningsIndex === 1;

  // Determine bowling XI
  const bowlingTeamId = innings.bowlingTeamId;
  const bowlingXI =
    state.setup.playingXI[bowlingTeamId]?.playerIds ?? lookup.playersOf(bowlingTeamId).map((p) => p.id);

  // Needs bowler selection: required if over ended or opening over and no bowler selected
  const needsBowlerModal = innings.needsBowler && !activeBowlerId;
  const isModalOpen = needsBowlerModal || manualBowlerModal;
  const isOverStart = innings.legalBalls % 6 === 0;
  const canChangeBowler = !innings.isComplete && isOverStart;

  const canScore = !!activeBowlerId && !!innings.strikerId && !!innings.nonStrikerId && !innings.isComplete;
  const canUndo = doc.deliveries.filter((d) => d.inningsIndex === state.currentInningsIndex).length > 0;

  const handleAdjustOvers = (newOvers: number, reason: string) => {
    if (isChase) {
      updateSetup({
        secondInningsReducedOvers: newOvers,
        targetRevisionReason: reason,
      });
    } else {
      updateSetup({
        reducedOvers: newOvers,
        targetRevisionReason: reason,
      });
    }
  };

  return (
    <div className="flex flex-col min-h-0">
      {/* Sticky score header */}
      <div className="sticky top-0 z-30">
        <ScoreHeader innings={innings} matchOvers={innings.maxOvers || match.overs} />
      </div>

      {/* Desktop layout: 2 columns */}
      <div className="flex-1 mx-auto w-full max-w-6xl">
        <div className="flex flex-col lg:flex-row lg:gap-6 lg:px-4 lg:py-6">

          {/* === LEFT COLUMN: Scoring console === */}
          <div className="flex-1 flex flex-col gap-4 px-4 pt-4 pb-4 lg:px-0 lg:pt-0">

            {/* Innings badge & Weather Action */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  {isChase ? "2nd Innings — Chasing" : "1st Innings"}
                </span>
                {isChase && currentInnings?.target && (
                  <span className="text-xs text-muted-foreground font-bold">
                    Target: {currentInnings.target} {currentInnings.isTargetRevised ? "(ARR)" : ""}
                  </span>
                )}
              </div>

              <button
                onClick={() => setOversModalOpen(true)}
                className="tap flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-wider"
              >
                <CloudRain className="h-3 w-3" />
                <span>Adjust Overs</span>
              </button>
            </div>

            {/* Batters */}
            <BatterPanel
              strikerId={innings.strikerId}
              nonStrikerId={innings.nonStrikerId}
              batters={innings.batters}
            />

            {/* Bowler */}
            <BowlerPanel
              bowlerId={activeBowlerId}
              bowlers={innings.bowlers}
              canChangeBowler={canChangeBowler}
              onChangeBowler={() => setManualBowlerModal(true)}
            />

            {/* Recent balls (mobile only — desktop shows in right column) */}
            <div className="lg:hidden">
              <RecentBalls balls={innings.recentBalls} />
            </div>

            {/* Scoring buttons */}
            <div className="mt-2">
              <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-3">
                Score Ball
              </p>
              <ScoringButtons
                innings={innings}
                bowlingXI={bowlingXI}
                onRecord={record}
                disabled={!canScore}
              />
            </div>

            {/* Undo */}
            <UndoBar onUndo={undo} canUndo={canUndo} />
          </div>

          {/* === RIGHT COLUMN: Info panels === */}
          <div className="flex flex-col gap-4 px-4 pb-6 lg:w-80 lg:shrink-0 lg:px-0">
            {/* Recent balls (desktop only) */}
            <div className="hidden lg:block">
              <RecentBalls balls={innings.recentBalls} />
            </div>

            {/* Partnership */}
            <PartnershipPanel partnership={innings.partnership} innings={innings} />

            {/* This over */}
            <OverSummary overGroups={innings.overGroups} currentOverOnly={true} />

            {/* Recent overs */}
            {innings.overGroups.length > 1 && (
              <OverSummary overGroups={innings.overGroups} currentOverOnly={false} />
            )}

            {/* Fall of wickets */}
            <FallOfWickets fow={innings.fallOfWickets} />
          </div>
        </div>
      </div>

      {/* Bowler selection modal */}
      {isModalOpen && (
        <BowlerModal
          bowlingXI={bowlingXI}
          bowlers={innings.bowlers}
          previousBowlerId={innings.previousBowlerId}
          currentBowlerId={activeBowlerId ?? undefined}
          onSelect={(id) => {
            setBowler(id);
            setManualBowlerModal(false);
          }}
          onClose={activeBowlerId ? () => setManualBowlerModal(false) : undefined}
          isOverEnd={innings.overGroups.length > 0}
        />
      )}

      {/* Rain Delay / Weather Adjusted Overs modal */}
      <AdjustOversModal
        isOpen={oversModalOpen}
        onClose={() => setOversModalOpen(false)}
        currentOvers={innings.maxOvers || match.overs}
        originalOvers={match.overs}
        isChase={isChase}
        onApply={handleAdjustOvers}
      />
    </div>
  );
}
