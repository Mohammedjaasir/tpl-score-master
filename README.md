# TPL Score Master

Build a Responsive TPL Cricket Live Scoring Web Application

Build a modern, premium, mobile-first cricket live scoring web application for TPL 2026.

Use the attached Sportify UI reference image as the primary visual inspiration. Do NOT copy the exact content or branding from Sportify. Instead, recreate its overall visual language: clean white surfaces, bold red/coral accent color, large typography, rounded cards, strong sports imagery, compact mobile layouts, bottom navigation, and a polished modern sports-app feel.

IMPORTANT SCOPE

For this first version, build ONLY the cricket scoring system.

Do NOT build:

Tournament administration

Player management

Team management

Fixture management

Public tournament website

Leaderboards

Sponsorship

Notifications

Advanced analytics

Full Supabase integration

The goal is to create a complete and functional Scorer Experience + Live Match Scoring Interface.

Use realistic mock cricket data for now.

The architecture must be clean enough that we can connect our existing Supabase teams and players later without rebuilding the scoring UI or scoring engine.

1. DESIGN DIRECTION

Use the attached image as visual inspiration.

Visual style

Premium modern sports application

Mobile-first

White background

Black/dark text

Strong coral/red primary accent

Very light gray secondary backgrounds

Rounded cards

Rounded buttons

Large readable numbers

Bold sports typography

Minimal visual clutter

Strong spacing

Smooth transitions

Subtle shadows

Professional rather than playful

The reference image uses a strong red/coral sports identity. Create a similar visual feeling while making the application specifically designed for cricket scoring.

Suggested color system:

Primary: coral/red

Background: white

Secondary background: #F7F7F7 style neutral

Text: near-black

Muted text: gray

Success: subtle green

Warning: amber

Danger/wicket: red

Do not overuse colors.

2. RESPONSIVE REQUIREMENT

This must be a true responsive web application.

Optimize for:

320px mobile

375px mobile

390px mobile

414px mobile

768px tablet

1024px tablet/small desktop

1280px+

Desktop

The scoring interface should feel like a native mobile scoring app, even though it is a web application.

On mobile:

One-handed operation

Large touch targets

Minimal scrolling

Important scoring buttons always accessible

Bottom navigation where appropriate

Sticky scoring controls

Avoid tiny buttons

Avoid dense tables

On desktop:

Use a centered application layout

Maximum content width

Scoring interface can use a two-column layout

Main scoring area on the left

Match/scorecard information on the right

3. APPLICATION STRUCTURE

Create these screens:

Screen 1 — Scorer Home

Show:

TPL 2026 branding

"Live Scoring"

Assigned Matches

Upcoming Matches

Recently Completed Matches

Example cards:

LIVE
TPL 2026 — Match #08

Thunder XI
vs
Warriors CC

Live Now

[CONTINUE SCORING]

Upcoming:

Match #09
Falcons XI vs Kings CC
Today · 4:00 PM

Completed:

Match #07
Titans vs Eagles
Titans won by 6 wickets

The home screen should visually resemble the clean sports-news/home screen style from the reference image.

4. MATCH SELECTION

Create a match card/list screen.

Each match card should show:

Match number

Team logos/initials

Team names

Scheduled time

Venue

Status

Statuses:

UPCOMING

READY

LIVE

COMPLETED

The scorer should be able to select a match.

5. PRE-MATCH SCREEN

After selecting a match, show a polished pre-match screen.

Display:

TPL 2026

MATCH #08

TEAM A
Thunder XI

VS

TEAM B
Warriors CC

Venue:
TPL Cricket Ground

Overs:
20

Then show:

Toss

"Toss Winner"

[Thunder XI]
[Warriors CC]

"Decision"

[BAT]
[BOWL]

After selection, automatically determine the first batting team.

6. PLAYING XI SCREEN

Create a playing XI selection interface.

Show both teams.

Example:

Thunder XI

☑ Player 1
☑ Player 2
☑ Player 3
☑ Player 4
...

Warriors CC

☑ Player 11
☑ Player 12
...

Allow selection of the configured number of players.

Show:

Captain

Wicketkeeper

Playing XI

The current implementation can use mock player data.

IMPORTANT:

Create a clean data abstraction such as:

players
teams
matches
playingXI

so that later these can be replaced with Supabase data.

Do NOT hardcode the scoring engine directly to UI labels.

7. MAIN LIVE SCORING SCREEN

This is the most important screen.

Design it as a professional cricket scoring console.

Mobile layout:

TPL 2026
MATCH #08

LIVE ●

Thunder XI

87 / 4

7.2 overs

CRR 11.78

CURRENT BATTERS

Striker
Player A
32* (21)
4s 3
6s 1

Non-striker
Player B
18* (15)

BOWLER

Player X
1.2 overs
12 runs
1 wicket

RECENT BALLS

0 1 4 W 2 1

SCORING CONTROLS

[ 0 ] [ 1 ] [ 2 ] [ 3 ]

[ 4 ] [ 6 ] [ W ]

[ WD ] [ NB ]

[ BYE ] [ LB ]

[ UNDO LAST BALL ]

Make the scoring buttons extremely easy to tap.

Use large rounded buttons.

The "W" button should be visually prominent.

8. SCORE HEADER

The score header should always be visible.

Show:

Team name
87/4

Overs:
7.2 / 20

Current Run Rate:
11.78

Target:
153

Required Run Rate:
9.43

During the first innings, target/required rate can be hidden.

During the chase, display them.

9. DELIVERY SCORING ENGINE

Implement an actual functional scoring state engine.

Do NOT make the buttons static.

When the scorer presses:

0

Update:

score

ball count

batter balls

bowler balls

recent balls

over state

When pressing:

1 / 2 / 3 / 4 / 6

Update:

team score

striker runs

striker balls

boundary count

bowler conceded runs

over runs

strike

When pressing:

W

Open a wicket modal.

10. WICKET MODAL

Create a beautiful mobile-friendly modal.

Title:

WICKET

Fields:

Dismissed Batter

[Player A ▼]

Dismissal Type

[ Bowled ]
[ Caught ]
[ LBW ]
[ Run Out ]
[ Stumped ]
[ Hit Wicket ]
[ Retired Hurt ]
[ Retired Out ]
[ Timed Out ]
[ Other ]

For caught:

Show:

Fielder

[Select Fielder]

For run out:

Show:

Fielder

[Select Fielder]

Then:

[CONFIRM WICKET]

After confirmation:

Add wicket

Update score

Update batter status

Create new batting position

Continue innings

11. EXTRAS

Support:

Wide

When Wide is selected:

Add extra run

Ball is NOT legal

Over ball count does not increase

Score increases

Allow additional wides if required.

Example:

WD + 1

No Ball

Add no-ball extra

Ball is NOT legal

Batter runs can be added

Strike management should work correctly

Bye

Add bye runs

Batter does not receive runs

Ball is legal

Leg Bye

Add leg bye runs

Batter does not receive runs

Ball is legal

Make the extra workflow fast.

12. STRIKE MANAGEMENT

Implement automatic cricket strike logic.

Handle:

Odd runs

Even runs

End of over

Wickets

New batter

Wide

No-ball

Bye

Leg bye

The scorer should NOT manually manage strike during normal scoring.

The engine should calculate it automatically.

13. OVER MANAGEMENT

Track:

Current over

Legal balls

Total balls

Over runs

Bowler

Wickets

Example:

7.2 overs

Recent over:

7.1 → 1
7.2 → 4

When six legal deliveries are completed:

Automatically move to:

8.0

Then show:

"OVER COMPLETE"

Allow scorer to select the next bowler.

14. BOWLER SELECTION

At the end of an over show:

NEXT OVER

Select Bowler

[Player X]
[Player Y]
[Player Z]

Prevent selecting an invalid bowler according to the configured rules.

For the MVP:

Prevent the same bowler from bowling consecutive overs if required by the match rules

Track overs

Track runs conceded

Track wickets

15. BATTER STATISTICS

Automatically calculate:

Runs

Balls

Fours

Sixes

Strike Rate

Example:

PLAYER A

32* (21)

4s 3
6s 1

SR 152.38

Use live calculations.

16. PARTNERSHIP

Show current partnership:

PARTNERSHIP

48 runs
32 balls

Player A
32*

Player B
18*

Update automatically after every delivery.

17. FALL OF WICKETS

Track:

1 — 23 runs — 3.4 overs
2 — 41 runs — 5.1 overs
3 — 67 runs — 6.3 overs

This should be derived from scoring events.

18. RECENT BALLS

Create a compact recent-ball visualization.

Example:

[0] [1] [4] [W] [2] [WD]

Use small circular/rounded chips.

Show the latest 6–12 deliveries.

19. BALL-BY-BALL VIEW

Create a "Ball by Ball" section.

Example:

OVER 7

7.1
1 RUN

7.2
FOUR

7.3
WIDE

7.3
2 RUNS

7.4
WICKET

Each delivery should show:

Over.ball

Result

Runs

Wicket if applicable

20. UNDO

Create a highly visible:

UNDO LAST BALL

button.

When clicked:

Show confirmation:

Undo last scoring event?

[Cancel]
[Undo]

Undo must restore the previous scoring state.

Do not simply subtract a run.

Restore:

score

wickets

batter statistics

bowler statistics

strike

balls

over state

partnership

recent balls

wicket state

Maintain an event history internally.

21. EDIT DELIVERY

Create an "Edit" option in the ball-by-ball timeline.

Selecting a delivery opens:

EDIT DELIVERY

Current:

7.3 — FOUR

Allow changing the event.

After saving:

Recalculate all dependent scoring state from the event history.

This is important.

The application should treat delivery events as the source of truth rather than manually maintaining unrelated totals.

22. INNINGS BREAK

When innings ends show a strong summary screen.

Example:

INNINGS COMPLETE

Thunder XI

172 / 8

20.0 overs

Run Rate
8.60

TOP BATTER

Player A
67 (42)

TOP BOWLER

Player X
3 / 24

Then:

[START SECOND INNINGS]

23. SECOND INNINGS

Start the chase.

Show:

Warriors CC

TARGET
173

0 / 0

0.0 overs

Need:

173 runs
from 120 balls

Required Run Rate:
8.65

Update this dynamically after every delivery.

24. MATCH COMPLETION

Automatically determine:

Win by runs

Win by wickets

Tie

No result

Example:

THUNDER XI

172 / 8

WARRIORS CC

152 / 5

THUNDER XI WON BY 20 RUNS

Then show:

[VIEW SCORECARD]

[BACK TO MATCHES]

25. SCORECARD

Create a polished responsive scorecard.

Batting

BatterRB4s6sSR

Include:

Dismissal

Runs

Balls

Fours

Sixes

Strike rate

Bowling

BowlerOMRWEcon

On mobile, transform tables into responsive cards where necessary.

26. MOBILE NAVIGATION

Use a bottom navigation inspired by the reference design.

Suggested:

Home
Matches
Live
Scorecard
Profile

However, keep navigation minimal during active scoring.

When a match is LIVE, prioritize the scoring interface and avoid unnecessary navigation away from it.

27. DESKTOP SCORING LAYOUT

On desktop use:

LEFT:

Match header

Score

Batter information

Bowler

Scoring controls

RIGHT:

Current partnership

Recent balls

Ball-by-ball

Over summary

Match information

Make the scoring controls large and easy to use even on desktop.

28. MOCK DATA

For now create realistic mock data.

Example:

Tournament:

TPL 2026

Teams:

Thunder XI
Warriors CC
Falcons XI
Titans CC
Eagles CC
Kings XI
Strikers
Super Giants

Players:

Create 11–15 players per team.

Each player should have:

id
name
shortName
role
photo/avatar
teamId

Roles:

Batsman
Bowler
All-rounder
Wicketkeeper

Create at least one realistic mock match:

Thunder XI vs Warriors CC

20 overs

Status:
LIVE

Populate the UI with a realistic live match state.

29. DATA ARCHITECTURE

Keep the scoring system independent from the current data source.

Create a clean architecture similar to:

components/
scoring/
match/
scorecard/
players/

lib/
scoring/
match/
mock-data/

types/
cricket.ts

The scoring engine should operate on structured data.

Important types should include concepts like:

Match
Team
Player
PlayingXI
Innings
Over
Delivery
Wicket
Extra
BattingState
BowlingState
MatchState

Do not tightly couple these to Supabase yet.

30. FUTURE SUPABASE INTEGRATION

IMPORTANT:

The current version should use mock data.

But design the data access layer so we can later replace:

MockPlayerRepository

with:

SupabasePlayerRepository

and similarly:

MockTeamRepository
→ SupabaseTeamRepository

MockMatchRepository
→ SupabaseMatchRepository

Do NOT create a new player database.

Our real application already has teams and players stored in Supabase.

Later we will connect those existing records to this scoring engine.

The scoring UI should not need to be redesigned when Supabase is connected.

31. EVENT-BASED SCORING

The core architecture must use delivery events.

Conceptually:

User Action
↓
Create Delivery Event
↓
Scoring Engine
↓
Calculate Match State
↓
Update UI

Example delivery:

{
striker,
nonStriker,
bowler,
batterRuns,
extraRuns,
extraType,
legalDelivery,
wicket,
timestamp
}

Do not make the score itself the primary source of truth.

The delivery history should allow the complete match state to be reconstructed.

32. STATE MANAGEMENT

Use a clean state-management approach appropriate for the existing project.

The scoring engine must maintain:

innings score

wickets

current over

legal balls

striker

non-striker

bowler

batting statistics

bowling statistics

partnership

wickets

recent deliveries

innings status

match status

All derived values should update automatically.

33. UX DETAILS

Add:

Smooth button interactions

Press feedback on scoring buttons

Small animations when score changes

Wicket animation/state

Boundary highlight

Over completion notification

Toast messages

Confirmation dialogs for destructive actions

Connection/status indicator placeholder

Loading states

Empty states

Error states

Do not make animations distracting during live scoring.

Speed and reliability are more important than visual effects.

34. OFFLINE-READY ARCHITECTURE

Do not implement full Supabase synchronization yet.

However, structure the scoring state so that it can later support:

Local scoring
↓
Local event queue
↓
Internet available
↓
Sync events
↓
Supabase

The scorer should eventually be able to continue scoring even when internet connectivity temporarily disappears.

For this first version, create the architecture/interface necessary for that future capability without overengineering it.

35. IMPORTANT SCORING RULE

The scoring engine must prioritize correctness over visual polish.

Avoid situations such as:

Incorrect ball count

Incorrect strike

Duplicate deliveries

Incorrect wicket count

Incorrect batter runs

Incorrect bowler runs

Wide counting as a legal ball

No-ball counting as a legal ball

Incorrect over completion

Test the scoring engine with multiple sequences.

36. ACCESSIBILITY

Make the application usable for long scoring sessions.

Use:

Large touch targets

High contrast

Clear typography

No tiny text

Keyboard support on desktop

Visible focus states

Accessible buttons

Proper ARIA labels where needed

The primary scoring controls should be usable without precise mouse movements.

37. RESPONSIVE DESIGN RULE

Do NOT simply shrink the desktop UI on mobile.

Create a genuinely mobile-first layout.

Mobile should be the primary scoring experience.

Desktop should be an enhanced version of the same scoring workflow.

38. VISUAL REFERENCE IMPLEMENTATION

From the supplied reference image, take inspiration from:

Rounded smartphone-style cards

Strong red sports branding

Large bold headings

White card surfaces

Sports-focused content hierarchy

Rounded rectangular buttons

Compact navigation

Clean spacing

Image/card-based content

Modern sports application aesthetic

But adapt everything specifically to:

TPL 2026
Cricket
Live Scoring

Do not use the SPORTIFY name, logo, text, or copyrighted imagery from the reference.

39. BRANDING

Use:

TPL 2026

Primary brand text:

TPL

Secondary:

CRICKET

Example header:

TPL
CRICKET

LIVE SCORING

Create a simple cricket-inspired logo mark using CSS/SVG if necessary.

Keep branding minimal and professional.

40. FINAL EXPECTATION

The final application should feel like a production-quality professional cricket scoring application, not a generic dashboard.

The most important screen is the LIVE SCORING screen.

A scorer should be able to:

Open a match

Confirm teams

Record toss

Select playing XI

Start innings

Select striker

Select non-striker

Select bowler

Score balls

Record extras

Record wickets

Automatically manage strike

Automatically manage overs

Undo a delivery

Edit a previous delivery

Complete an innings

Start the second innings

Complete the match

View the final scorecard

Everything should work using mock data.

CRITICAL IMPLEMENTATION INSTRUCTION

Before writing the UI, understand the scoring state model and implement the scoring engine cleanly.

Do not create a visually impressive static prototype.

Create a functional scoring application with a clean separation between UI, scoring engine, and data repositories, so that the existing Supabase teams and players can be connected later without rewriting the application.

Start by implementing the responsive UI and mock-data scoring engine. After that, ensure all scoring interactions work correctly across mobile and desktop.

## Development

Run locally:

```sh
npm install
npm run dev
```

Build for production:

```sh
npm run build
npm run preview
```

