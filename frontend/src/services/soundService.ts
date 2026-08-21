class SoundService {
  private mutedKey = 'shaivika_sounds_muted';

  public isMuted(): boolean {
    try {
      const saved = localStorage.getItem(this.mutedKey);
      return saved === 'true';
    } catch {
      return false;
    }
  }

  public setMuted(muted: boolean): void {
    try {
      localStorage.setItem(this.mutedKey, String(muted));
    } catch (e) {
      console.warn('Failed to save sound mute state', e);
    }
  }

  public play(type: 'select' | 'success' | 'xp' | 'badge' | 'error' | 'unlock'): void {
    if (this.isMuted()) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      switch (type) {
        case 'select': {
          // Short clean click synth
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);
          gain.gain.setValueAtTime(0.04, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.09);
          break;
        }
        case 'success': {
          // Short positive musical chord (C5 -> E5 -> G5)
          const playTone = (freq: number, delay: number, duration: number) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
            gain.gain.setValueAtTime(0.05, ctx.currentTime + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + delay);
            osc.stop(ctx.currentTime + delay + duration);
          };
          playTone(523.25, 0, 0.12); // C5
          playTone(659.25, 0.04, 0.12); // E5
          playTone(783.99, 0.08, 0.2); // G5
          break;
        }
        case 'xp': {
          // Quick rising reward sound
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(350, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.18);
          gain.gain.setValueAtTime(0.05, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.2);
          break;
        }
        case 'error': {
          // Low flat buzzer
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(130, ctx.currentTime);
          gain.gain.setValueAtTime(0.04, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.21);
          break;
        }
        case 'unlock': {
          // Soft transition sweep
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(450, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.12);
          gain.gain.setValueAtTime(0.04, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.13);
          break;
        }
        case 'badge': {
          // Triumphant arpeggio
          const playTone = (freq: number, delay: number, duration: number) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
            gain.gain.setValueAtTime(0.05, ctx.currentTime + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + delay);
            osc.stop(ctx.currentTime + delay + duration);
          };
          playTone(523.25, 0, 0.1); // C5
          playTone(659.25, 0.06, 0.1); // E5
          playTone(783.99, 0.12, 0.1); // G5
          playTone(1046.5, 0.18, 0.35); // C6
          break;
        }
      }
    } catch (e) {
      console.warn('Web Audio Context play failed:', e);
    }
  }
}

export const soundService = new SoundService();
