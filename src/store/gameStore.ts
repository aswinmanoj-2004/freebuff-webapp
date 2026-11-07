import { create } from 'zustand';

export type GameCategory = 'all' | 'board' | 'logic' | 'arcade' | 'math';

export interface GameMetadata {
  id: string;
  title: string;
  category: GameCategory;
  categoryLabel: string;
  difficulty: 'Casual' | 'Medium' | 'Challenging' | 'Expert';
  shortDesc: string;
  rulesDesc: string;
  tags: string[];
  features: string[];
  isAvailableInPhaseA: boolean;
  accentColor: string; // Tailwind color token
  phaseBadge: string;
}

export const GAME_CATALOG: GameMetadata[] = [
  {
    id: 'snake-ladder',
    title: 'Snake & Ladder',
    category: 'board',
    categoryLabel: 'Board & Dice',
    difficulty: 'Casual',
    shortDesc: 'Classic race with realistic animated snakes that bite and ladders you climb rung by rung.',
    rulesDesc: 'Roll the animated dice to hop your pawn from tile 1 to 100. Climb ladders rung by rung; beware of real slithering snakes that swallow and slide you down! Play vs AI or Pass & Play.',
    tags: ['Animated Snakes', 'Climb Ladders', 'Dice Roll', 'AI vs Player', '2-Player'],
    features: ['Step-by-Step Pawn Hops', 'Snake Eat Animation', 'Ladder Climb Animation', 'Interactive Rolling Dice'],
    isAvailableInPhaseA: true,
    accentColor: 'emerald',
    phaseBadge: 'Playable',
  },
  {
    id: 'tic-tac-toe',
    title: 'Tic Tac Toe',
    category: 'board',
    categoryLabel: 'Board & Logic',
    difficulty: 'Medium',
    shortDesc: 'Comic pop-art X/O grid with smart Minimax AI tiers and animated winning slashes.',
    rulesDesc: 'Align 3 marks vertically, horizontally, or diagonally. Challenge Easy, Medium, or Unbeatable Minimax AI, or pass-and-play with a friend.',
    tags: ['Minimax AI', 'Comic Grid', '3x3 Board', 'Difficulty Modes'],
    features: ['3 AI Difficulties', 'Animated Brush Strokes', 'Win-line Slash', 'Instant Play'],
    isAvailableInPhaseA: true,
    accentColor: 'cyan',
    phaseBadge: 'Playable',
  },
  {
    id: 'flappy-bird',
    title: 'Flappy Bird',
    category: 'arcade',
    categoryLabel: 'Arcade & Skill',
    difficulty: 'Challenging',
    shortDesc: 'Classic comic arcade flight dodging pipes through dynamic evolving day-to-night biomes.',
    rulesDesc: 'Tap or press Space to flap upwards and dodge pipe obstacles. Every 10 pipes cross into new atmospheric biomes with checkpoints!',
    tags: ['Arcade Flight', 'Biome Changes', 'Checkpoints', 'High Score'],
    features: ['5 Biome Crossfades', 'Smooth Physics', 'Checkpoint Celebrations', 'Wing Flap SFX'],
    isAvailableInPhaseA: true,
    accentColor: 'amber',
    phaseBadge: 'Playable',
  },
  {
    id: 'sudoku',
    title: 'Sudoku Master',
    category: 'logic',
    categoryLabel: 'Logic & Puzzle',
    difficulty: 'Challenging',
    shortDesc: 'Classic 9×9 numeric grid with pencil drafting, mistake-checking, and smart hints.',
    rulesDesc: 'Fill the 9x9 grid so each row, column, and 3x3 block contains digits 1-9. Use pencil notes and hints to deduce candidate cells.',
    tags: ['Number Puzzle', 'Pencil Notes', 'Mistake Guard', 'Brain Trainer'],
    features: ['Tactile Numpad', 'Pencil Drafting', 'Auto-conflict Highlight', 'Timer & Score'],
    isAvailableInPhaseA: true,
    accentColor: 'violet',
    phaseBadge: 'Playable',
  },
  {
    id: 'word-city',
    title: 'Word City Crossword',
    category: 'logic',
    categoryLabel: 'Logic & Words',
    difficulty: 'Medium',
    shortDesc: 'Solve crossword anagrams to construct vibrant city skyscrapers and landmarks.',
    rulesDesc: 'Connect letters to form valid words. Each completed word builds towering skyscrapers and expands your metropolis.',
    tags: ['Vocabulary', 'City Building', 'Architecture', 'Anagrams'],
    features: ['Skyline Construction', 'Expanding Metropolis', 'Dictionary Engine', 'Letter Wheel'],
    isAvailableInPhaseA: true,
    accentColor: 'sky',
    phaseBadge: 'Playable',
  },
  {
    id: 'nuts-bolts',
    title: 'Nuts & Bolts Puzzle',
    category: 'logic',
    categoryLabel: 'Physics & Logic',
    difficulty: 'Challenging',
    shortDesc: 'Unscrew colored bolts in the right sequence to release and drop overlapping plates.',
    rulesDesc: 'Examine the multi-layered mechanical structure. Unscrew bolts one by one into open holes so overlapping plates drop free.',
    tags: ['Mechanical', 'Sequence Order', 'Physics Logic', 'Level Progress'],
    features: ['Tactile Bolt Turning', 'Kinematic Falling Plates', 'Order-of-Operation', 'Smooth Drops'],
    isAvailableInPhaseA: true,
    accentColor: 'indigo',
    phaseBadge: 'Playable',
  },
  {
    id: 'blocky-blast',
    title: 'Blocky Blast',
    category: 'arcade',
    categoryLabel: 'Puzzle & Arcade',
    difficulty: 'Casual',
    shortDesc: 'Place geometric block shapes onto an 8×8 grid and trigger line-clearing blasts.',
    rulesDesc: 'Drop block shapes onto an 8x8 grid. Clear full rows and columns simultaneously for mega combo score multipliers.',
    tags: ['Combo Multipliers', 'Line Clear', 'Spatial Grid', 'Relaxing'],
    features: ['Shape Placement', 'Row & Column Clears', 'Dynamic Combos', 'Endless Play'],
    isAvailableInPhaseA: true,
    accentColor: 'rose',
    phaseBadge: 'Playable',
  },
  {
    id: 'game-2048',
    title: '2048 Puzzle',
    category: 'math',
    categoryLabel: 'Math & Logic',
    difficulty: 'Medium',
    shortDesc: 'Slide comic numerical tiles to merge matching values up to 2048 and beyond.',
    rulesDesc: 'Swipe or press arrow keys to slide all tiles in a direction. When two tiles of the same number collide, they merge into double value.',
    tags: ['Exponential Math', 'Tile Merging', 'High Score', 'Pop Art'],
    features: ['Tactile Sliding', 'Color Progression Scale', 'Keyboard & D-pad', 'Smooth Audio'],
    isAvailableInPhaseA: true,
    accentColor: 'amber',
    phaseBadge: 'Playable',
  },
  {
    id: 'memory-match',
    title: 'Memory Match',
    category: 'logic',
    categoryLabel: 'Memory & Brain',
    difficulty: 'Casual',
    shortDesc: 'Flip mystery collectible cards to locate matching pairs with fewest moves.',
    rulesDesc: 'Tap two cards to reveal their secret emblems. Match all identical pairs to clear the board and earn high ranks.',
    tags: ['Visual Memory', 'Card Flipping', 'Brain Training', 'Pairs'],
    features: ['Card Flip Animation', 'Emblem Matches', 'Move Counter', 'Tactile Sound'],
    isAvailableInPhaseA: true,
    accentColor: 'teal',
    phaseBadge: 'Playable',
  },
  {
    id: 'minesweeper',
    title: 'Minesweeper',
    category: 'logic',
    categoryLabel: 'Logic & Deduction',
    difficulty: 'Challenging',
    shortDesc: 'Reveal safe comic sectors using deduction and mark danger zones with flags.',
    rulesDesc: 'Click tiles to uncover numbers indicating adjacent mines. Toggle Flag mode to safely mark suspected explosive locations.',
    tags: ['Deductive Logic', 'Flagging', 'Minefield', 'Risk & Reward'],
    features: ['Safe Sector Reveals', 'Flag Marking', 'First-Click Safe Guarantee', 'Detonation Alerts'],
    isAvailableInPhaseA: true,
    accentColor: 'red',
    phaseBadge: 'Playable',
  },
  {
    id: 'math-quiz',
    title: 'Math Blitz',
    category: 'math',
    categoryLabel: 'Math & Speed',
    difficulty: 'Medium',
    shortDesc: 'Rapid-fire mental arithmetic racing against a decaying energy bar timer.',
    rulesDesc: 'Solve addition, subtraction, and multiplication challenges before the clock runs out. Correct answer streaks grant bonus time!',
    tags: ['Mental Math', 'Speed Reaction', 'Streak Multiplier', 'Quick Rounds'],
    features: ['Dynamic Time Pressure', 'Streak Multipliers', 'Adaptive Questions', 'Instant Feedback'],
    isAvailableInPhaseA: true,
    accentColor: 'emerald',
    phaseBadge: 'Playable',
  },
  {
    id: 'connect-four',
    title: 'Connect Four',
    category: 'board',
    categoryLabel: 'Board Strategy',
    difficulty: 'Medium',
    shortDesc: 'Drop colored discs into a vertical grid against smart Bot AI or a friend.',
    rulesDesc: 'Take turns dropping tokens down vertical columns. First player to connect four tokens in a straight row wins.',
    tags: ['Vertical Grid', 'Drop Strategy', 'Pass & Play', 'Smart Bot'],
    features: ['Animated Disc Drops', 'Winning Beam Indicator', 'Local 2-Player', 'Bot Opponent'],
    isAvailableInPhaseA: true,
    accentColor: 'blue',
    phaseBadge: 'Playable',
  },
  {
    id: 'slide-puzzle',
    title: '15 Slide Puzzle',
    category: 'logic',
    categoryLabel: 'Sliding Puzzle',
    difficulty: 'Challenging',
    shortDesc: 'Classic sliding puzzle arranging numbers 1 to 15 in numerical order.',
    rulesDesc: 'Slide tiles into the empty space to arrange numbers 1 through 15 sequentially with minimal moves.',
    tags: ['15-Puzzle', 'Move Efficiency', 'Smooth Sliding', 'Solvability Guard'],
    features: ['Smooth Tile Translation', 'Move Counter', 'Always Solvable', 'Tactile Audio'],
    isAvailableInPhaseA: true,
    accentColor: 'purple',
    phaseBadge: 'Playable',
  },
];

interface GameState {
  catalog: GameMetadata[];
  activeGameId: string | null;
  activeCategory: GameCategory;
  searchQuery: string;
  isPaused: boolean;
  score: number;
  timeElapsed: number;
  
  // Actions
  setActiveCategory: (cat: GameCategory) => void;
  setSearchQuery: (query: string) => void;
  selectGame: (gameId: string | null) => void;
  setPaused: (paused: boolean) => void;
  setScore: (score: number) => void;
  incrementScore: (delta: number) => void;
  resetGameSession: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  catalog: GAME_CATALOG,
  activeGameId: null,
  activeCategory: 'all',
  searchQuery: '',
  isPaused: false,
  score: 0,
  timeElapsed: 0,

  setActiveCategory: (cat) => set({ activeCategory: cat }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  selectGame: (gameId) => set({ activeGameId: gameId, isPaused: false, score: 0, timeElapsed: 0 }),
  setPaused: (paused) => set({ isPaused: paused }),
  setScore: (score) => set({ score }),
  incrementScore: (delta) => set((s) => ({ score: s.score + delta })),
  resetGameSession: () => set({ score: 0, timeElapsed: 0, isPaused: false }),
}));
