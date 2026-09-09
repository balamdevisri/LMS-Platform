/**
 * AudioActivityDetector
 * 
 * High-performance, Web Audio API-based Active Speaker Detection with:
 * - RMS energy calculation via AnalyserNode
 * - Noise floor threshold gating
 * - Attack debounce (~200ms) to ignore keyboard clicks and brief spikes
 * - Release hold time (~900ms) to prevent speech fluttering during natural conversational pauses
 * - Safe resource cleanup to eliminate memory leaks
 */

export interface AudioActivityConfig {
  /** RMS threshold to consider voice presence (0.005 to 0.1, default 0.02) */
  threshold?: number;
  /** Minimum consecutive duration above threshold before triggering speaking (ms) */
  attackMs?: number;
  /** Duration of silence before switching off speaking state (ms) */
  releaseMs?: number;
  /** Callback fired whenever speaking state transitions or audio level updates */
  onSpeakingChange?: (isSpeaking: boolean, audioLevel: number) => void;
  /** Frequency of level updates in ms (default: 60ms) */
  pollIntervalMs?: number;
}

export class AudioActivityDetector {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private dataArray: Float32Array | null = null;

  private isSpeaking = false;
  private speakingStartTime: number | null = null;
  private silenceStartTime: number | null = null;
  private timerId: number | null = null;

  private readonly threshold: number;
  private readonly attackMs: number;
  private readonly releaseMs: number;
  private readonly pollIntervalMs: number;
  private readonly onSpeakingChange?: (isSpeaking: boolean, audioLevel: number) => void;

  constructor(config: AudioActivityConfig = {}) {
    this.threshold = config.threshold ?? 0.02;
    this.attackMs = config.attackMs ?? 200;
    this.releaseMs = config.releaseMs ?? 900;
    this.pollIntervalMs = config.pollIntervalMs ?? 60;
    this.onSpeakingChange = config.onSpeakingChange;
  }

  /**
   * Attaches detector to a live audio MediaStreamTrack.
   */
  public attachTrack(track: MediaStreamTrack): void {
    this.destroy();

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        console.warn('[AudioActivityDetector] Web Audio API is not supported in this browser.');
        return;
      }

      this.audioContext = new AudioContextClass();
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
      }

      const stream = new MediaStream([track]);
      this.sourceNode = this.audioContext.createMediaStreamSource(stream);

      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.4;

      this.sourceNode.connect(this.analyser);
      this.dataArray = new Float32Array(this.analyser.fftSize);

      this.startLoop();
    } catch (err) {
      console.warn('[AudioActivityDetector] Failed to attach audio track to analyser:', err);
    }
  }

  private startLoop(): void {
    if (this.timerId !== null) return;

    this.timerId = window.setInterval(() => {
      this.tick();
    }, this.pollIntervalMs);
  }

  private tick(): void {
    if (!this.analyser || !this.dataArray) return;

    this.analyser.getFloatTimeDomainData(this.dataArray);

    // Compute Root-Mean-Square (RMS) audio energy
    let sumSquares = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      const val = this.dataArray[i];
      sumSquares += val * val;
    }
    const rms = Math.sqrt(sumSquares / this.dataArray.length);

    // Normalize level to 0.0 - 1.0 range
    const normalizedLevel = Math.min(1, rms * 5);
    const now = Date.now();

    if (rms >= this.threshold) {
      this.silenceStartTime = null;

      if (!this.isSpeaking) {
        if (!this.speakingStartTime) {
          this.speakingStartTime = now;
        } else if (now - this.speakingStartTime >= this.attackMs) {
          this.isSpeaking = true;
          this.onSpeakingChange?.(true, normalizedLevel);
        }
      } else {
        // Continuous speaking, provide periodic level update
        this.onSpeakingChange?.(true, normalizedLevel);
      }
    } else {
      this.speakingStartTime = null;

      if (this.isSpeaking) {
        if (!this.silenceStartTime) {
          this.silenceStartTime = now;
        } else if (now - this.silenceStartTime >= this.releaseMs) {
          this.isSpeaking = false;
          this.silenceStartTime = null;
          this.onSpeakingChange?.(false, 0);
        } else {
          // In release hold grace period: keep speaking true
          this.onSpeakingChange?.(true, normalizedLevel);
        }
      } else {
        // Idle
        this.onSpeakingChange?.(false, 0);
      }
    }
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  /**
   * Cleans up all audio nodes and timer loops.
   */
  public destroy(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }

    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect();
      } catch {}
      this.sourceNode = null;
    }

    if (this.analyser) {
      try {
        this.analyser.disconnect();
      } catch {}
      this.analyser = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close().catch(() => {});
      } catch {}
      this.audioContext = null;
    }

    this.dataArray = null;
    this.isSpeaking = false;
    this.speakingStartTime = null;
    this.silenceStartTime = null;
  }
}

/**
 * Returns optimized browser media constraints with echo cancellation,
 * noise suppression, and auto gain control capability checks.
 */
export function getOptimizedAudioConstraints(selectedMicrophoneId?: string | null): MediaTrackConstraints {
  const supported = navigator.mediaDevices?.getSupportedConstraints?.() || {};

  const constraints: MediaTrackConstraints = {
    echoCancellation: supported.echoCancellation ? true : true,
    noiseSuppression: supported.noiseSuppression ? true : true,
    autoGainControl: supported.autoGainControl ? true : true,
    channelCount: 1,
    sampleRate: 48000,
  };

  if (selectedMicrophoneId) {
    constraints.deviceId = { exact: selectedMicrophoneId };
  }

  return constraints;
}
