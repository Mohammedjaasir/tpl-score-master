/**
 * TPL 2026 — Official Statistics & Awards Methodology Specification
 * Version: 1.0
 * Authority: Tournament Play Committee & Technical Scoring Rules
 * Reference: https://tpl.valgrowlabs.com/rules
 * 
 * Centralized, permanent, auditable record defining the exact mathematical
 * formula, data sources, qualification rules, tie-breakers, and edge-case
 * handling for every statistic, award, ranking, and leaderboard in TPL 2026.
 */

export const METHODOLOGY_VERSION = "1.0";
export const METHODOLOGY_LAST_UPDATED = "2026-08-29T20:00:00Z";
export const OFFICIAL_RULES_REFERENCE_URL = "https://tpl.valgrowlabs.com/rules";

export type MetricScope = "MATCH" | "TOURNAMENT" | "BOTH";
export type MetricCategory =
  | "BATTING"
  | "BOWLING"
  | "FIELDING"
  | "STANDINGS_AND_NRR"
  | "AWARDS"
  | "RECORDS";

export interface MetricMethodology {
  key: string;
  name: string;
  category: MetricCategory;
  description: string;
  scope: MetricScope;
  sourceData: string;
  formula: string;
  qualification: string;
  rankingRule: string;
  tieBreakRule: string;
  roundingRule: string;
  edgeCases: string;
  methodologyVersion: string;
}

export const TPL_STATISTICS_METHODOLOGY: Record<string, MetricMethodology> = {
  // ── BATTING METRICS ────────────────────────────────────────────────────────
  runs: {
    key: "runs",
    name: "Batting Runs",
    category: "BATTING",
    description: "Total runs scored off the bat by an individual batter.",
    scope: "BOTH",
    sourceData: "balls.runs_off_bat grouped by striker_id.",
    formula: "SUM(runs_off_bat)",
    qualification: "None. Available for every batter who faced a ball or was dismissed.",
    rankingRule: "Descending (highest total runs first).",
    tieBreakRule: "Higher Batting Average -> Higher Strike Rate -> Fewer Innings Played.",
    roundingRule: "Integer (no decimals).",
    edgeCases: "Extras (wides, no-ball penalties, byes, leg-byes) are strictly excluded from batter runs.",
    methodologyVersion: "v1.0",
  },
  balls_faced: {
    key: "balls_faced",
    name: "Legal Balls Faced",
    category: "BATTING",
    description: "Total count of legal deliveries faced by the batter.",
    scope: "BOTH",
    sourceData: "balls.is_legal delivery count where striker_id matches batter.",
    formula: "COUNT(deliveries where extra_type != 'wide')",
    qualification: "None.",
    rankingRule: "N/A (informational metric).",
    tieBreakRule: "N/A",
    roundingRule: "Integer (no decimals).",
    edgeCases: "Wides do not count as a ball faced. No-balls do count as a ball faced.",
    methodologyVersion: "v1.0",
  },
  fours: {
    key: "fours",
    name: "Fours (4s)",
    category: "BATTING",
    description: "Count of boundary fours scored off the bat.",
    scope: "BOTH",
    sourceData: "balls.runs_off_bat == 4 without wide penalty.",
    formula: "COUNT(deliveries where runs_off_bat == 4)",
    qualification: "None.",
    rankingRule: "Descending (most fours first).",
    tieBreakRule: "Higher total runs scored -> Fewer innings.",
    roundingRule: "Integer.",
    edgeCases: "Overthrow boundaries off bat count as 4s. Extra byes/leg-bye boundaries do not count as batter 4s.",
    methodologyVersion: "v1.0",
  },
  sixes: {
    key: "sixes",
    name: "Sixes (6s)",
    category: "BATTING",
    description: "Count of maximum sixes hit over the boundary off the bat.",
    scope: "BOTH",
    sourceData: "balls.runs_off_bat == 6 without wide penalty.",
    formula: "COUNT(deliveries where runs_off_bat == 6)",
    qualification: "None.",
    rankingRule: "Descending (most sixes first).",
    tieBreakRule: "Higher total runs scored -> Fewer innings.",
    roundingRule: "Integer.",
    edgeCases: "Extras cannot produce batter sixes.",
    methodologyVersion: "v1.0",
  },
  strike_rate: {
    key: "strike_rate",
    name: "Batting Strike Rate",
    category: "BATTING",
    description: "Average number of runs scored per 100 legal balls faced.",
    scope: "BOTH",
    sourceData: "Total batter runs / Total legal balls faced.",
    formula: "(Total Batter Runs / Legal Balls Faced) * 100",
    qualification: "Normal display: 0+ balls. Best Striker Award: Min 5 balls (Match), Min 15 balls (Tournament).",
    rankingRule: "Descending (highest strike rate first).",
    tieBreakRule: "Higher total runs scored -> Fewer balls faced.",
    roundingRule: "2 decimal places (e.g. 162.50).",
    edgeCases: "0 balls faced -> Display 0.00 or '-' (protected against division by zero).",
    methodologyVersion: "v1.0",
  },
  batting_average: {
    key: "batting_average",
    name: "Batting Average",
    category: "BATTING",
    description: "Average runs scored per dismissal.",
    scope: "BOTH",
    sourceData: "Total runs / Total times dismissed.",
    formula: "Total Runs / MAX(1, Dismissals) (If 0 dismissals, average equals total runs)",
    qualification: "Tournament Best Average: Minimum 2 innings played.",
    rankingRule: "Descending (highest average first).",
    tieBreakRule: "Higher total runs scored -> Higher strike rate.",
    roundingRule: "2 decimal places (e.g. 45.00).",
    edgeCases: "Unbeaten batter with 0 dismissals is not divided by zero; average equals total runs with not-out indicator (*).",
    methodologyVersion: "v1.0",
  },
  boundary_runs: {
    key: "boundary_runs",
    name: "Boundary Runs",
    category: "BATTING",
    description: "Total runs accumulated strictly through 4s and 6s.",
    scope: "BOTH",
    sourceData: "Sum of (4s * 4) + (6s * 6).",
    formula: "(Fours * 4) + (Sixes * 6)",
    qualification: "None.",
    rankingRule: "Descending.",
    tieBreakRule: "Higher total runs.",
    roundingRule: "Integer.",
    edgeCases: "Running runs are excluded.",
    methodologyVersion: "v1.0",
  },

  // ── BOWLING METRICS ────────────────────────────────────────────────────────
  overs_bowled: {
    key: "overs_bowled",
    name: "Overs Bowled",
    category: "BOWLING",
    description: "Total completed overs plus remainder legal deliveries.",
    scope: "BOTH",
    sourceData: "Count of legal balls bowled.",
    formula: "FLOOR(legal_balls / 6) + '.' + (legal_balls % 6)",
    qualification: "None.",
    rankingRule: "Descending by total legal balls.",
    tieBreakRule: "N/A",
    roundingRule: "Standard cricket notation (e.g. 2.4 overs).",
    edgeCases: "Wides and no-balls do not advance the legal ball count.",
    methodologyVersion: "v1.0",
  },
  runs_conceded: {
    key: "runs_conceded",
    name: "Bowling Runs Conceded",
    category: "BOWLING",
    description: "All runs charged against the bowler (runs off bat + wides + no-balls).",
    scope: "BOTH",
    sourceData: "balls.runs_off_bat + balls.extra_runs (where extra_type is wide or noball).",
    formula: "SUM(runs_off_bat + bowler_extras)",
    qualification: "None.",
    rankingRule: "Ascending (fewer runs conceded ranks higher when wickets are equal).",
    tieBreakRule: "N/A",
    roundingRule: "Integer.",
    edgeCases: "Byes and leg-byes are team extras and are NOT charged to the bowler.",
    methodologyVersion: "v1.0",
  },
  wickets: {
    key: "wickets",
    name: "Bowler Wickets Taken",
    category: "BOWLING",
    description: "Dismissals credited directly to the bowler (Bowled, Caught, LBW, Stumped, Hit Wicket).",
    scope: "BOTH",
    sourceData: "balls.is_wicket == true where wicket_type in ('Bowled', 'Caught', 'LBW', 'Stumped', 'Hit Wicket').",
    formula: "COUNT(qualifying bowler dismissals)",
    qualification: "None.",
    rankingRule: "Descending (most wickets first).",
    tieBreakRule: "Lower Economy Rate -> Lower Bowling Average -> Fewer Runs Conceded.",
    roundingRule: "Integer.",
    edgeCases: "Run-outs are credited to the fielding team, never to the bowler.",
    methodologyVersion: "v1.0",
  },
  economy: {
    key: "economy",
    name: "Bowling Economy Rate",
    category: "BOWLING",
    description: "Average runs conceded per 6 legal deliveries bowled.",
    scope: "BOTH",
    sourceData: "Total runs conceded / (Total legal balls / 6).",
    formula: "(Runs Conceded / Legal Balls Bowled) * 6",
    qualification: "Tournament Best Economy: Minimum 2 overs (12 legal balls).",
    rankingRule: "Ascending (lower economy rate first).",
    tieBreakRule: "More wickets taken -> More legal balls bowled.",
    roundingRule: "2 decimal places (e.g. 4.50).",
    edgeCases: "0 legal balls bowled -> Display 0.00 (protected against division by zero).",
    methodologyVersion: "v1.0",
  },
  bowling_average: {
    key: "bowling_average",
    name: "Bowling Average",
    category: "BOWLING",
    description: "Runs conceded per wicket taken.",
    scope: "BOTH",
    sourceData: "Total runs conceded / Total wickets taken.",
    formula: "Runs Conceded / Wickets Taken",
    qualification: "Tournament Best Bowling Average: Minimum 2 wickets taken.",
    rankingRule: "Ascending (lower average is better).",
    tieBreakRule: "Lower economy rate -> More wickets taken.",
    roundingRule: "2 decimal places (e.g. 12.50).",
    edgeCases: "0 wickets taken -> Display '-' (N/A), never NaN or Infinity.",
    methodologyVersion: "v1.0",
  },
  bowling_strike_rate: {
    key: "bowling_strike_rate",
    name: "Bowling Strike Rate",
    category: "BOWLING",
    description: "Legal deliveries bowled per wicket taken.",
    scope: "BOTH",
    sourceData: "Legal balls bowled / Wickets taken.",
    formula: "Legal Balls / Wickets Taken",
    qualification: "Minimum 2 wickets taken.",
    rankingRule: "Ascending (fewer balls per wicket is better).",
    tieBreakRule: "Lower bowling economy.",
    roundingRule: "2 decimal places (e.g. 6.00).",
    edgeCases: "0 wickets -> Display '-' (N/A).",
    methodologyVersion: "v1.0",
  },
  best_bowling_figures: {
    key: "best_bowling_figures",
    name: "Best Bowling in an Innings (BBI)",
    category: "BOWLING",
    description: "Single match best bowling performance.",
    scope: "BOTH",
    sourceData: "Single match bowler wicket and runs conceded figures.",
    formula: "MAX(Wickets) with MIN(Runs Conceded)",
    qualification: "At least 1 ball bowled.",
    rankingRule: "1. Most Wickets -> 2. Fewer Runs Conceded -> 3. Lower Economy.",
    tieBreakRule: "Chronological first match if figures are identical.",
    roundingRule: "Standard notation: W/R (e.g. 4/12).",
    edgeCases: "A 3/10 figure strictly outranks 2/4 because wickets are the primary criterion.",
    methodologyVersion: "v1.0",
  },

  // ── FIELDING METRICS ───────────────────────────────────────────────────────
  catches: {
    key: "catches",
    name: "Catches Taken",
    category: "FIELDING",
    description: "Dismissals where fielder caught a batted ball before grounding.",
    scope: "BOTH",
    sourceData: "balls.wicket_type == 'Caught' with valid fielder_id.",
    formula: "COUNT(caught dismissals by fielder_id)",
    qualification: "None.",
    rankingRule: "Descending.",
    tieBreakRule: "More total dismissals -> Fewer matches played.",
    roundingRule: "Integer.",
    edgeCases: "Fielder selection is strictly mandatory in scorer workflow.",
    methodologyVersion: "v1.0",
  },
  run_outs: {
    key: "run_outs",
    name: "Run Outs Effected",
    category: "FIELDING",
    description: "Dismissals where fielder broke the wicket while batter was out of ground.",
    scope: "BOTH",
    sourceData: "balls.wicket_type == 'Run Out' with valid fielder_id.",
    formula: "COUNT(run-out dismissals by fielder_id)",
    qualification: "None.",
    rankingRule: "Descending.",
    tieBreakRule: "More total fielding dismissals.",
    roundingRule: "Integer.",
    edgeCases: "Credited exclusively to fielder, not bowler.",
    methodologyVersion: "v1.0",
  },
  stumpings: {
    key: "stumpings",
    name: "Stumpings",
    category: "FIELDING",
    description: "Dismissals by wicketkeeper putting down the wicket with batter out of crease.",
    scope: "BOTH",
    sourceData: "balls.wicket_type == 'Stumped' with valid fielder_id.",
    formula: "COUNT(stumped dismissals by fielder_id)",
    qualification: "None.",
    rankingRule: "Descending.",
    tieBreakRule: "More total dismissals.",
    roundingRule: "Integer.",
    edgeCases: "Credited as wicket to bowler and dismissal to keeper.",
    methodologyVersion: "v1.0",
  },

  // ── STANDINGS, POINTS & NRR ────────────────────────────────────────────────
  match_points: {
    key: "match_points",
    name: "Tournament Points",
    category: "STANDINGS_AND_NRR",
    description: "Official points awarded for match outcomes.",
    scope: "TOURNAMENT",
    sourceData: "Completed matches status and result.",
    formula: "Win: 2 pts, Tie: 1 pt, No Result / Abandoned: 1 pt, Loss: 0 pts",
    qualification: "Official scheduled tournament matches.",
    rankingRule: "Descending by total points.",
    tieBreakRule: "1. Points -> 2. Net Run Rate (NRR) -> 3. Head-to-Head -> 4. Most Wins.",
    roundingRule: "Integer.",
    edgeCases: "Points are awarded only after match status is marked COMPLETED or NO_RESULT.",
    methodologyVersion: "v1.0",
  },
  net_run_rate: {
    key: "net_run_rate",
    name: "Net Run Rate (NRR)",
    category: "STANDINGS_AND_NRR",
    description: "Difference between tournament runs scored per over faced and runs conceded per over bowled.",
    scope: "TOURNAMENT",
    sourceData: "Aggregated team innings runs, legal balls faced, and overs bowled.",
    formula: "(Total Runs Scored / Total Overs Faced) - (Total Runs Conceded / Total Overs Bowled)",
    qualification: "Completed innings in group stage.",
    rankingRule: "Descending (positive NRR is superior).",
    tieBreakRule: "Head-to-head match outcome.",
    roundingRule: "3 decimal places with sign (e.g. +1.425, -0.850).",
    edgeCases: "Official TPL Rule: If a team is bowled out (all out) before completing their allocated overs, their runs are divided by the FULL scheduled quota of overs (e.g. 5.0 overs in a 5-over match).",
    methodologyVersion: "v1.0",
  },

  // ── AWARDS & MVP FORMULAS ──────────────────────────────────────────────────
  match_mvp: {
    key: "match_mvp",
    name: "Match MVP & Player Impact Score",
    category: "AWARDS",
    description: "Holistic multi-discipline algorithm evaluating individual performance in a single match.",
    scope: "MATCH",
    sourceData: "Deliveries, dismissals, and winning outcome of the current match.",
    formula: "Batting Points + Bowling Points + Fielding Points + Winning Context Bonus",
    qualification: "Must have participated in the match (batted, bowled, or fielded).",
    rankingRule: "Descending by total Impact Points.",
    tieBreakRule: "1. Winning Team Player -> 2. More Wickets -> 3. More Runs -> 4. Lower Economy -> 5. Higher Strike Rate -> 6. More Catches -> 7. Canonical Player ID.",
    roundingRule: "Integer points.",
    edgeCases: "Cross-Discipline Weights: Batting: 1 pt/run, +1 pt/four, +2 pts/six, +10 pts for 30+ runs, +25 pts for 50+ runs, +50 pts for 100+ runs, SR bonus. Bowling: 25 pts/wicket, +15 pts for 3W haul, +30 pts for 5W haul, +20 pts/maiden, economy bonus (+15 for econ <= 5.0, +10 for econ <= 6.5). Fielding: 10 pts/catch, 15 pts/runout, 15 pts/stumping. Winning context: +10 pts for players on the winning team.",
    methodologyVersion: "v1.0",
  },
  man_of_the_match: {
    key: "man_of_the_match",
    name: "Man of the Match (MOTM)",
    category: "AWARDS",
    description: "Official award presented to the top performer of a completed match.",
    scope: "MATCH",
    sourceData: "Match MVP Score (#1 ranked player) -> Scorer Confirmation / Official Override.",
    formula: "Top ranked player from Match MVP Impact Score algorithm.",
    qualification: "Match must be in COMPLETED phase.",
    rankingRule: "Match MVP #1 ranking.",
    tieBreakRule: "Deterministic tie-breaking hierarchy (Winning team -> Wickets -> Runs -> ID).",
    roundingRule: "N/A (Player identity).",
    edgeCases: "Scorer confirmation auto-selects MVP #1. If tournament referee overrides, both the auto-calculated MVP and official selection are retained for audit transparency.",
    methodologyVersion: "v1.0",
  },
  orange_cap: {
    key: "orange_cap",
    name: "Orange Cap (Top Run Scorer)",
    category: "AWARDS",
    description: "Awarded to the leading run scorer in the tournament.",
    scope: "TOURNAMENT",
    sourceData: "Aggregate batter runs across all completed tournament matches.",
    formula: "SUM(batter_runs)",
    qualification: "At least 1 run scored.",
    rankingRule: "1. Most Total Runs -> 2. Higher Batting Average -> 3. Higher Strike Rate -> 4. Fewer Innings.",
    tieBreakRule: "Higher Strike Rate -> Canonical Player ID.",
    roundingRule: "Integer runs.",
    edgeCases: "Live match runs update dynamically but award is officially conferred upon tournament conclusion.",
    methodologyVersion: "v1.0",
  },
  purple_cap: {
    key: "purple_cap",
    name: "Purple Cap (Top Wicket Taker)",
    category: "AWARDS",
    description: "Awarded to the leading wicket taker in the tournament.",
    scope: "TOURNAMENT",
    sourceData: "Aggregate bowler wickets across all completed tournament matches.",
    formula: "SUM(bowler_wickets)",
    qualification: "At least 1 wicket taken.",
    rankingRule: "1. Most Wickets -> 2. Lower Economy Rate -> 3. Lower Bowling Average -> 4. Fewer Runs Conceded.",
    tieBreakRule: "Lower Economy -> Canonical Player ID.",
    roundingRule: "Integer wickets.",
    edgeCases: "Run-outs are excluded.",
    methodologyVersion: "v1.0",
  },
  best_striker_award: {
    key: "best_striker_award",
    name: "Best Striker Award",
    category: "AWARDS",
    description: "Awarded to the batter with the highest qualified batting strike rate.",
    scope: "TOURNAMENT",
    sourceData: "Batter runs and legal balls faced across tournament matches.",
    formula: "(Total Runs / Legal Balls Faced) * 100",
    qualification: "Minimum 15 legal balls faced in tournament matches.",
    rankingRule: "Descending by Strike Rate.",
    tieBreakRule: "Higher total runs scored -> Fewer balls faced.",
    roundingRule: "2 decimal places (e.g. 187.50).",
    edgeCases: "Batters below the 15-ball qualification threshold are excluded to avoid 1-ball anomalies (e.g. 1 ball 6 runs = 600 SR).",
    methodologyVersion: "v1.0",
  },
  best_all_rounder_award: {
    key: "best_all_rounder_award",
    name: "Best All-Rounder Award",
    category: "AWARDS",
    description: "Recognizes the top dual-impact player with substantial contributions in both batting and bowling.",
    scope: "TOURNAMENT",
    sourceData: "Runs, wickets, and fielding dismissals across tournament matches.",
    formula: "(Runs * 1) + (Wickets * 25) + (Fielding Dismissals * 10)",
    qualification: "Must have contributed both batting runs and bowling wickets/catches.",
    rankingRule: "Descending by All-Rounder Index.",
    tieBreakRule: "More wickets taken -> More runs scored.",
    roundingRule: "Integer score.",
    edgeCases: "Guarantees cross-discipline balance (e.g. 50 runs + 3 wkts ranks higher than 60 runs + 0 wkts).",
    methodologyVersion: "v1.0",
  },
  tournament_mvp: {
    key: "tournament_mvp",
    name: "Tournament MVP",
    category: "AWARDS",
    description: "Total accumulated Match MVP impact points earned across all matches in the tournament.",
    scope: "TOURNAMENT",
    sourceData: "SUM(Match MVP points) for each player across completed matches.",
    formula: "SUM(Match MVP Points)",
    qualification: "Must have played at least 1 match.",
    rankingRule: "Descending by total tournament MVP points.",
    tieBreakRule: "More Man of the Match awards -> More total wickets -> More total runs.",
    roundingRule: "Integer points.",
    edgeCases: "Accumulates point-for-point from every individual match calculation.",
    methodologyVersion: "v1.0",
  },
  man_of_the_tournament: {
    key: "man_of_the_tournament",
    name: "Man of the Tournament",
    category: "AWARDS",
    description: "Premier tournament accolade honoring the most impactful and consistent player.",
    scope: "TOURNAMENT",
    sourceData: "Tournament MVP points + Match wins impact + MOTM awards.",
    formula: "#1 ranked player on the Tournament MVP Leaderboard.",
    qualification: "All completed tournament matches.",
    rankingRule: "1. Highest Tournament MVP Points -> 2. Most MOTM Awards -> 3. Cross-discipline impact.",
    tieBreakRule: "Deterministic tie-breaking hierarchy.",
    roundingRule: "N/A (Player identity).",
    edgeCases: "Cannot be awarded based solely on batting runs; multi-discipline impact, consistency, and winning contribution are foundational.",
    methodologyVersion: "v1.0",
  },
};

/**
 * Returns the formal methodology documentation for a specific metric key.
 */
export function getMetricMethodology(key: string): MetricMethodology | undefined {
  return TPL_STATISTICS_METHODOLOGY[key];
}

/**
 * Returns all methodologies grouped by category.
 */
export function getAllMethodologiesByCategory(): Record<MetricCategory, MetricMethodology[]> {
  const grouped: Record<MetricCategory, MetricMethodology[]> = {
    BATTING: [],
    BOWLING: [],
    FIELDING: [],
    STANDINGS_AND_NRR: [],
    AWARDS: [],
    RECORDS: [],
  };

  Object.values(TPL_STATISTICS_METHODOLOGY).forEach((item) => {
    grouped[item.category].push(item);
  });

  return grouped;
}
