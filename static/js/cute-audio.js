/**
 * Scribbleverse Cute Sound FX Engine (Web Audio API)
 * 100% lightweight procedural sound synthesizer. No external audio files needed!
 */

window.CuteAudio = (function () {
  let ctx = null;
  let isMuted = localStorage.getItem('scribbleverse_muted') === 'true';

  function getContext() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        ctx = new AudioCtx();
      }
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx;
  }

  function playTone(freq, type = 'sine', duration = 0.12, volume = 0.15, pitchBend = 0) {
    if (isMuted) return;
    try {
      const audioCtx = getContext();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      if (pitchBend !== 0) {
        osc.frequency.exponentialRampToValueAtTime(
          Math.max(20, freq + pitchBend),
          audioCtx.currentTime + duration
        );
      }

      gain.gain.setValueAtTime(volume, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  }

  return {
    isMuted: () => isMuted,
    toggleMute: () => {
      isMuted = !isMuted;
      localStorage.setItem('scribbleverse_muted', isMuted);
      return isMuted;
    },

    // Cute chirp / pop when clicking Barnaby or buttons
    pop: () => {
      playTone(480, 'sine', 0.08, 0.18, 260);
    },

    // Giggle sound (two quick bouncy notes)
    giggle: () => {
      playTone(520, 'sine', 0.09, 0.15, 180);
      setTimeout(() => playTone(680, 'sine', 0.11, 0.18, 220), 80);
      setTimeout(() => playTone(820, 'sine', 0.14, 0.15, 100), 170);
    },

    // Sparkle / Magic shimmer
    sparkle: () => {
      [650, 780, 920, 1100, 1300].forEach((freq, i) => {
        setTimeout(() => playTone(freq, 'triangle', 0.12, 0.1, 80), i * 55);
      });
    },

    // Stamp placement "thump-pop"
    stamp: () => {
      playTone(180, 'triangle', 0.06, 0.22, -60);
      setTimeout(() => playTone(440, 'sine', 0.08, 0.14, 120), 40);
    },

    // Color swatch click
    swatch: () => {
      playTone(400, 'sine', 0.06, 0.12, 80);
    },

    // Brush stroke soft tickle
    whoosh: () => {
      playTone(320, 'sine', 0.05, 0.05, -50);
    },

    // Confetti fanfare on doodle download
    fanfare: () => {
      const notes = [440, 554, 659, 880];
      notes.forEach((freq, idx) => {
        setTimeout(() => playTone(freq, 'triangle', 0.25, 0.2, 20), idx * 100);
      });
    }
  };
})();
