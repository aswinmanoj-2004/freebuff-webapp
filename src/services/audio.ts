/**
 * Procedural Web Audio API Synthesizer
 * Zero external asset dependencies - eliminates 404s and network latency.
 */

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private isMuted: boolean = false;
  private bgmInterval: number | null = null;
  private bgmActive: boolean = false;

  private init() {
    if (this.ctx) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);
    } catch {
      // AudioContext unavailable or restricted
    }
  }

  private ensureRunning() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMasterVolume(vol: number) {
    this.init();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime, 0.05);
    }
  }

  public setSfxVolume(vol: number) {
    this.init();
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime, 0.05);
    }
  }

  public setMusicVolume(vol: number) {
    this.init();
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime, 0.05);
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    this.init();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.8, this.ctx.currentTime, 0.05);
    }
  }

  // --- Sound Effects ---

  public playClick() {
    if (this.isMuted) return;
    this.ensureRunning();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  public playSelect() {
    if (this.isMuted) return;
    this.ensureRunning();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 chord
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime + idx * 0.04;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.15);
    });
  }

  public playRollDice() {
    if (this.isMuted) return;
    this.ensureRunning();
    if (!this.ctx || !this.sfxGain) return;

    // Series of quick tumbling clicks
    const clicks = 7;
    for (let i = 0; i < clicks; i++) {
      const delay = i * 0.045 + Math.random() * 0.015;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      const now = this.ctx.currentTime + delay;

      osc.type = 'square';
      osc.frequency.setValueAtTime(250 + Math.random() * 300, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.03);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.04);
    }
  }

  public playHop() {
    if (this.isMuted) return;
    this.ensureRunning();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.14);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playPoint() {
    if (this.isMuted) return;
    this.ensureRunning();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  public playWin() {
    if (this.isMuted) return;
    this.ensureRunning();
    if (!this.ctx || !this.sfxGain) return;

    // Victory fanfare arpeggio
    const notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime + idx * 0.09;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.4);
    });
  }

  public playLose() {
    if (this.isMuted) return;
    this.ensureRunning();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [493.88, 440, 392, 329.63];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime + idx * 0.12;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.22);
    });
  }

  public playPop() {
    if (this.isMuted) return;
    this.ensureRunning();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  public playFlap() {
    if (this.isMuted) return;
    this.ensureRunning();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.1);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, now);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.11);
  }

  public playScrew() {
    if (this.isMuted) return;
    this.ensureRunning();
    if (!this.ctx || !this.sfxGain) return;

    // Metallic ratchet click
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.03);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // --- Generative Background Chords / Ambient Music ---

  public startAmbientBgm() {
    if (this.bgmActive) return;
    this.bgmActive = true;
    this.ensureRunning();

    // Procedural ambient chord generator that plays calming warm pads periodically
    const chords = [
      [220, 261.63, 329.63, 392],     // Am7
      [174.61, 220, 261.63, 329.63],  // Fmaj7
      [261.63, 329.63, 392, 493.88],  // Cmaj7
      [196, 246.94, 293.66, 392],     // G
    ];

    let chordIdx = 0;
    const playChord = () => {
      if (!this.bgmActive || this.isMuted || !this.ctx || !this.musicGain) return;
      const currentChord = chords[chordIdx % chords.length];
      chordIdx++;

      currentChord.forEach((freq) => {
        if (!this.ctx || !this.musicGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        const now = this.ctx.currentTime;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 4.5);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        osc.start(now);
        osc.stop(now + 4.8);
      });
    };

    playChord();
    this.bgmInterval = window.setInterval(playChord, 5000);
  }

  public stopAmbientBgm() {
    this.bgmActive = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

export const sound = new AudioSynthesizer();
