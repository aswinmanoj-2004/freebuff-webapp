# FreeBuff 3D — 3D Game Hub & Arcade

A high-performance 3D gaming hub built with React, Three.js, React Three Fiber, Tailwind CSS, and Web Audio API synthesis, featuring classic logic, math, and puzzle games with full user authentication, real-time stats, and sleek futuristic dark glass styling.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions have been confirmed via Phase 1 clarification:

- **Authentication & Database**: Firebase Authentication (Email/Password + Google Sign-In) with Firestore for persistent player profiles, high scores, and game histories, augmented with an instant Guest Play mode for immediate accessibility.
- **Visual Aesthetic**: *Futuristic Dark Glass* — deep slate/obsidian canvas (`#0b0f19`), frosted translucent glass cards (`bg-slate-900/70` with subtle border glow), crisp emerald accents (`#10b981`), and strict 60-30-10 color balance.
- **Audio Architecture**: Procedural Web Audio API engine capable of synthesizing dynamic retro chimes, dice rolls, tile hops, jumps, clearing sounds, victory fanfares, and ambient sci-fi background hums with zero external network asset 404 vulnerabilities.
- **Phased Delivery Strategy**: As explicitly requested by the user, we will execute in structured phases:
  - **Phase (a) (Current Target)**: Project setup, dependencies, Firebase Auth + Guest mode, Sound Synthesizer Engine, Responsive Dark Glass Hub layout, 3D Hero interactive canvas, Profile & Settings panels.
  - **Phase (b)**: Snake & Ladder 3D + Tic Tac Toe 3D (with Minimax AI and Pass-and-Play).
  - **Phase (c)**: Flappy Bird 3D with procedural environments (Day, Sunset, Night, Space, Storm cross-fades) and checkpoints.
  - **Phase (d)**: Sudoku 3D, Word City Crossword, Nuts & Bolts, Blocky Blast, and extended logic suite (2048, Memory Match, Minesweeper, Math Quiz, Slide Puzzle).
  - **Phase (e)**: Leaderboards, polish, accessibility toggles, and performance optimization.

---

### 1. Overview & Core Concept

- **What It Does**: FreeBuff 3D provides an immersive arcade web portal where users can play diverse 3D logic, puzzle, and skill games directly in the browser with desktop and mobile touch support.
- **Target Audience**: Casual gamers, puzzle enthusiasts, students, and retro arcade fans seeking quick, visually stunning, distraction-free browser games without intrusive ads or download friction.
- **Key Value**: Rich, physical 3D presentation (smooth orbits, dynamic lighting, tactile physics and piece-hopping) coupled with instant loading, persistent high scores, responsive controls, and unified sound design.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Entry & Onboarding**: Visitors land on the FreeBuff 3D Hub. Unauthenticated users can instantly test games via Guest Mode or create an account with Email/Password (featuring password-strength meter) or Google One-Tap.
2. **Hub Navigation**: A 3D interactive showcase header with floating geometric gaming artifacts, followed by a categorized game grid (Arcade, Logic & Puzzle, Board & Strategy, Quick Math).
3. **Gameplay Loop**: Clicking a game seamlessly transitions to a dedicated 3D arena wrapped in a unified `GameShell`. The shell provides a non-intrusive collapsible bottom control dock (camera angles, pause, restart, sound slider, guide/rules modal).
4. **Scoring & Completion**: Game results trigger celebratory Web Audio fanfares and record high scores, accuracy, and win rates to the player's profile and global leaderboards.
5. **Profile & Customization**: Players view lifetime achievements, game-by-game statistics, win-loss ratios, audio preferences, and display settings.

#### Visual Identity & Design System
- **Canvas Palette**: Dominant deep space obsidian (`#070a13` / `bg-slate-950`), secondary card backings in frosted dark glass (`rgba(15, 23, 42, 0.75)` with `backdrop-blur-md` and `border-slate-800/80`).
- **Accent Hierarchy**: 10% emerald highlight (`#10b981` / `emerald-500`) for primary interactive triggers, active tab states, and positive score indicators; cyan (`#06b6d4`) for secondary interactive cues.
- **Typography Pairing**: Clean geometric display font (`Plus Jakarta Sans` / `Outfit`) for titles and brand presence, paired with tabular monospace numerals (`tabular-nums`) for timers, scores, and dice outcomes.
- **Zero-Slop Rule**: Clean typography separators (`·`, `/`), unboxed metadata, zero mechanical code comments in UI copy, and zero floating pulse dots.
- **Ergonomics**: Viewport-safe collapsible bottom dock for game controls to keep the 3D viewport 100% unobstructed.

---

### 3. Key Product Decisions & Trade-Offs

- **Procedural 3D & Procedural Audio**:
  - *Decision*: Build 3D boards, pieces, dice, and audio synthetically using Three.js procedural geometries (`THREE.Group`, `ExtrudeGeometry`, `MeshStandardMaterial`) and the Web Audio API (`AudioContext`, `OscillatorNode`, `GainNode`, `BiquadFilterNode`).
  - *Rationale*: Eliminates missing 3D model assets, broken CDN URLs, and slow asset loading while guaranteeing immediate 60 FPS startup on all devices.
- **Zustand + Firebase Auth**:
  - *Decision*: Centralized Zustand stores for user session, active game state, global sound settings, and achievements, with Firebase Auth integration and localStorage fallback for seamless offline or guest play.
  - *Rationale*: Prevents auth lockouts in restricted iframe environments while providing enterprise-grade cloud persistence when connected.
- **Unified GameShell Wrapper**:
  - *Decision*: Wrap all games in a standardized shell component providing pause/resume, camera reset, sound controls, fullscreen, rules modal, and victory dialogs.
  - *Rationale*: Keeps individual game code clean, modular, and maintainable while ensuring a consistent UX across all 12+ games.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FreeBuff 3D Game Hub                            │
├────────────────────────────────────────────────────────────────────────┤
│  Top Bar: [Brand Wordmark]  ──  [Games | Leaderboard | Profile]  ──  [Auth Action]  │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌───────────────────────┐   ┌──────────────────────────────────────┐  │
│  │ 3D Hero Ambient Scene │   │ Game Catalog (Filters: Board/Logic/  │  │
│  │ (R3F floating relics) │   │ Arcade/Math, Search, Tilt 3D Cards)  │  │
│  └───────────────────────┘   └──────────────────────────────────────┘  │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│                       Dedicated Game Experience                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ GameShell HUD: Score, Timer, Best Score, Pause, Rules, Exit      │  │
│  │ ┌──────────────────────────────────────────────────────────────┐ │  │
│  │ │                  Three.js 3D Viewport                        │ │  │
│  │ │      (Snake & Ladder / TicTacToe / Flappy / Sudoku / ...)    │ │  │
│  │ └──────────────────────────────────────────────────────────────┘ │  │
│  │ Collapsible Bottom Dock: [Sound] [Cam Preset] [Reset] [Undo]     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────────────┤
│ State Layer: [authStore] [audioEngine] [gameStore] [settingsStore]     │
│ Persistence: [Firebase Auth + Firestore] <---> [Local Cache Fallback]  │
└────────────────────────────────────────────────────────────────────────┘
```

#### State & Data Models
- **User Profile**: `uid`, `displayName`, `email`, `avatarSeed`, `gamesPlayed`, `wins`, `totalScore`, `statsPerGame: { [gameId]: { highscore, wins, losses, lastPlayed } }`.
- **Audio Engine**: Synthesized channels (Master, SFX, Ambient BGM) with master mute, volume sliders, and sound triggers: `playClick`, `playRollDice`, `playHop`, `playScore`, `playWin`, `playLose`, `playFlap`, `playScrew`.
- **Game Definition**: `id`, `title`, `category`, `badge`, `description`, `icon`, `component`, `difficulty`, `modes`.

---

### 5. Phase (a) Implementation Roadmap

1. **Package Installation & Foundation**:
   - Install `three`, `@react-three/fiber`, `@react-three/drei`, `zustand`, `firebase`, `canvas-confetti`, and corresponding type definitions.
   - Configure Tailwind CSS v4 custom dark mode variants and glassmorphism design tokens.
2. **Audio Synthesizer Engine (`/src/services/audio.ts`)**:
   - Zero-dependency Web Audio API synthesizer for rich procedural sound effects and ambient chimes.
3. **Authentication & User Store (`/src/store/authStore.ts`)**:
   - Email/password registration, password strength validation, Google login support, and immediate guest mode login.
4. **Auth Modals & Profile (`/src/components/auth/...`)**:
   - Glassmorphic modal for Sign In, Sign Up, and Forgot Password; player profile drawer with stats overview.
5. **Interactive 3D Hub & Hero Showcase (`/src/components/home/...`)**:
   - 3D interactive hero banner with floating interactive dice and geometric shapes.
   - Responsive game catalog grid featuring 3D tilt hover cards, category tabs, and search.
6. **Unified GameShell & Settings**:
   - Collapsible bottom dock, pause/rules overlays, audio sliders, and navigation bar following the Top Bar Contract.
