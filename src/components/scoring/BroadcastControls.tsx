import { useState } from "react";
import { obsHandlerService, type GraphicType } from "@/lib/obsHandlerService";
import { Tv, Play, Square, Users, Calendar, Trophy, CheckSquare, RefreshCw, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BroadcastControlsProps {
  matchId: string;
}

export function BroadcastControls({ matchId }: BroadcastControlsProps) {
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleAction = (label: string, action: () => void) => {
    action();
    setLastAction(label);
    setTimeout(() => {
      setLastAction(null);
    }, 2000);
  };

  const showGraphic = (type: GraphicType, label: string) => {
    handleAction(`SHOW ${label}`, () => {
      obsHandlerService.broadcastState(matchId, { type }, "SCORER");
    });
  };

  const clearGraphic = () => {
    handleAction("CLEAR GRAPHIC", () => {
      obsHandlerService.clearGraphic(matchId, "SCORER");
    });
  };

  return (
    <div className="bg-card border rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
      <div className="bg-muted/30 px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tv className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-sm uppercase tracking-widest text-foreground">
            Broadcast Controls
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">
            OBS CONNECTED
          </span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-4">
        {/* Core Actions */}
        <div>
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
            Primary
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => showGraphic("LIVE_SCORE", "SCOREBOARD")}
              className="tap flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-colors"
            >
              <Play className="w-3 h-3" />
              SCOREBOARD
            </button>
            <button
              onClick={() => showGraphic("IDLE", "SCOREBOARD")}
              className="tap flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-[10px] font-black uppercase tracking-widest hover:bg-secondary/80 transition-colors"
            >
              <Square className="w-3 h-3" />
              HIDE SCORE
            </button>
          </div>
        </div>

        {/* Break Graphics */}
        <div>
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
            Break Graphics
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => showGraphic("SQUADS", "SQUADS")}
              className="tap flex items-center gap-2 px-3 py-2 rounded-lg border bg-card text-card-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-accent transition-colors"
            >
              <Users className="w-3 h-3 text-muted-foreground" />
              TEAM SQUADS
            </button>
            <button
              onClick={() => showGraphic("UPCOMING", "UPCOMING")}
              className="tap flex items-center gap-2 px-3 py-2 rounded-lg border bg-card text-card-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-accent transition-colors"
            >
              <Calendar className="w-3 h-3 text-muted-foreground" />
              UPCOMING
            </button>
            <button
              onClick={() => showGraphic("PLAYER_AWARDS", "AWARDS")}
              className="tap flex items-center gap-2 px-3 py-2 rounded-lg border bg-card text-card-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-accent transition-colors"
            >
              <Trophy className="w-3 h-3 text-muted-foreground" />
              AWARDS
            </button>
            <button
              onClick={() => showGraphic("MATCH_RESULT", "RESULT")}
              className="tap flex items-center gap-2 px-3 py-2 rounded-lg border bg-card text-card-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-accent transition-colors"
            >
              <CheckSquare className="w-3 h-3 text-muted-foreground" />
              MATCH RESULT
            </button>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t flex items-center gap-2">
          <button
            onClick={clearGraphic}
            className="tap flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 border border-red-200 text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-colors"
          >
            <XCircle className="w-3 h-3" />
            CLEAR GRAPHIC
          </button>
        </div>

        {lastAction && (
          <div className="text-center text-[10px] font-bold text-primary animate-in fade-in slide-in-from-bottom-2 uppercase tracking-widest">
            {lastAction} SENT
          </div>
        )}
      </div>
    </div>
  );
}
