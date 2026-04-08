# PaddleUp Reference

## What It Is

PaddleUp is a pickleball group tracking web app. It tracks games, ELO ratings, achievements, and leaderboards within friend groups or leagues. Built as a mobile-first PWA-ready app with the "Kinetic Court" design system.

**Live:** https://paddleup-six.vercel.app
**Repo:** https://github.com/marcus-t117/paddleup

## Tech Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 with custom Kinetic Court token system
- Plus Jakarta Sans (headlines) + Be Vietnam Pro (body) + Material Symbols Outlined
- LocalStorage for all data persistence (no backend)
- Vercel deployment (auto-deploys from master)

## Design System: The Kinetic Court

Light mode. High-contrast palette with Pickleball Lime (#96fc00) as the energy accent on warm surfaces (#f5f7f2).

**Key rules:**
- No 1px borders for sectioning. Boundaries via background colour shifts only.
- No dividers in lists. 12px vertical spacing between items.
- No pure black. Use inverse-surface (#0c0f0c).
- Minimum 1rem border radius. Buttons use full (9999px).
- Glassmorphism for header/nav: 80% opacity + 24px backdrop blur.
- Tonal layering for depth, not box-shadows.
- Interactive cards scale(1.02) on hover.

**Colour tokens:** See `app/globals.css` for the full token set (primary, secondary, tertiary, surface hierarchy, error, outline).

**Typography:** Plus Jakarta Sans for headlines (extrabold, tight tracking). Be Vietnam Pro for body/labels. Label pattern: uppercase, extra-wide tracking, 10-12px.

## Features

### ELO Rating System
- Standard ELO formula. K-factor 32 for players with <20 games, 16 for established.
- Tiers: Rookie (<1000), Competitor (1000-1499), Advanced (1500-1999), Pro (2000+).
- Weekly change tracking displayed on the dashboard hero card.
- Tappable ELO card opens a line chart with y-axis labels and touch scrub.

### Multi-League Support
- Users can create and switch between multiple leagues.
- Each league has independent ELO, stats, badges, and match history.
- League switcher pill bar on Dashboard and League Rankings page.
- Create League modal: name input + member multi-select from global player pool.
- Current user auto-included in new leagues. All members start at 1000 ELO.
- Log page shows "Logging to: [league name]" context.

### Game Logging
- Singles and doubles support.
- Singles: opponent field with autocomplete from league members.
- Doubles: partner field + two opponent fields when toggled.
- Score steppers (tap +/- buttons).
- Optional venue field.
- Auto-creates new players if name not recognised (shows "New player" indicator).
- Case-insensitive name matching prevents duplicates.
- ELO delta animation on submit. Badge unlock notifications.

### Leaderboard (League Page)
- Top 3 podium with elevated centre winner.
- Current user highlighted in lime-green card with rank.
- Ranked list with avatar initials, W/L form dots, ELO, and recent form text.

### Achievements / Badges
- 12 badges across bronze, silver, gold, and platinum tiers.
- Each badge has a unique gradient, ring colour, and glow effect.
- Unlocked badges show full colour. Locked badges are greyed with lock icon.
- Progress tracking on locked badges (current/target with fill bar).
- Badge gallery on Awards page. "Next Badge" tracker on Dashboard.
- Automatic unlock detection after every logged game.

**Badge list:**
| Badge | Description | Tier |
|---|---|---|
| Flash Serve | Win your first game | Bronze |
| Hot Streak | Win 3 games in a row | Bronze |
| Inferno | Win 5 games in a row | Silver |
| Season Vet | Play 20 games | Silver |
| Perfect Week | Win 5 games in 7 days | Silver |
| Dink King | Win 10 close games (11-9 or 11-10) | Gold |
| Iron Defence | Win 5 games where opponent scores under 5 | Gold |
| ATP Master | Reach Advanced tier (1500 ELO) | Gold |
| Giant Killer | Beat a player 200+ ELO above you | Gold |
| Community Legend | Play with 10 different partners | Platinum |
| Century Club | Play 100 games | Platinum |
| Court Dominator | Reach Pro tier (2000 ELO) | Platinum |

### XP / Level System
- XP earned per game: base 50, +30 for wins, +15 per streak game, +50 for upsets.
- Levels 1-50 with tier names (Fresh Paddle through Hall of Famer).
- Level progress bar on Awards page.

### Dashboard
- League switcher pills.
- Welcome greeting + player name.
- Bento stats grid: ELO hero card (tappable for chart), Match Wins, Hot Streak.
- Upcoming Match countdown (demo/placeholder).
- Recent Log feed (last 3 games).
- Next Badge tracker with progress-based icon opacity and glow.
- Badge progress bar.

### Match History (Log Page)
- Hero CTA with "Dominate the Court" and active league indicator.
- Season win rate and active streak stats.
- Chronological match log with victory/loss cards.
- Tappable opponent avatars show full name, ELO, and tier in a tooltip.
- Badge unlock cards inline when badges are earned.

## Pages

| Route | Page | Description |
|---|---|---|
| `/` | Dashboard | Stats overview, recent games, badge progress |
| `/league` | League Rankings | Leaderboard with podium and ranked list |
| `/log` | Match Log | Log games and view match history |
| `/awards` | Awards | Badges, XP, levels, progress tracking |

## Data Model

### Player (identity, global)
`id, name, createdAt, isUser` + stats fields resolved from LeagueMembership at read time.

### Game
`id, date, type, leagueId, playerIds[], opponentIds[], playerScore, opponentScore, winner, eloChanges, venue, createdAt`

### League
`id, name, createdAt, isDefault, memberIds[]`

### LeagueMembership (per-player, per-league stats)
`leagueId, playerId, elo, eloHistory[], wins, losses, currentStreak, bestStreak, gamesPlayed, xp, level, recentForm[], badges[]`

## File Structure

```
paddleup/
  app/
    globals.css          # Tailwind v4 + Kinetic Court tokens
    layout.tsx           # Root layout, fonts, providers
    page.tsx             # Dashboard
    league/page.tsx      # League Rankings
    log/page.tsx         # Match Log + game logging
    awards/page.tsx      # Badges and achievements
  components/
    header.tsx           # Frosted glass top bar
    nav.tsx              # Bottom tab bar (4 tabs)
    providers.tsx        # Client-side context wrapper
    league-switcher.tsx  # Horizontal pill bar for league switching
    create-league-modal.tsx  # Create league bottom sheet
    elo-hero.tsx         # Dashboard ELO card
    elo-chart.tsx        # ELO history chart with scrub
    stat-card.tsx        # Reusable stat display
    streak-card.tsx      # Hot streak with fire icon
    match-countdown.tsx  # Upcoming match (demo)
    activity-item.tsx    # Dashboard recent log item
    podium.tsx           # Top 3 leaderboard
    leaderboard-row.tsx  # Ranked player row
    log-game-modal.tsx   # Game logging form
    match-result-card.tsx  # Match history card with tappable avatars
    badge-circle.tsx     # Badge visual (unlocked/locked)
    badge-progress.tsx   # Badge progress card
    badge-unlock-card.tsx  # Inline badge unlock notification
  contexts/
    league-context.tsx   # League state provider
  hooks/
    use-players.ts       # Player CRUD, league-scoped
    use-games.ts         # Game logging, league-scoped
  lib/
    elo.ts               # ELO calculation (singles + doubles)
    xp.ts                # XP calculation
    badges.ts            # Badge definitions + checker
    storage.ts           # LocalStorage abstraction
    sample-data.ts       # Seed data generator
    utils.ts             # Date, tier, level helpers
    constants.ts         # Tokens, thresholds, storage keys
  types/
    index.ts             # All TypeScript interfaces
```

## Sample Data

Pre-seeded with 9 sample players (Alex, Lily, Darrich, Alfonso, Ting, Jules Navarro, Mei-Lin Wu, Coach Rick, Sam Okoro) and the user (Marcus T.) with 12 games of match history in the default "Elite Division" league.

Data version system (`DATA_VERSION` in constants.ts) forces localStorage reseed when bumped.

## Deployment

Push to `master` triggers auto-deploy via Vercel GitHub integration. No environment variables needed. Static export compatible.
