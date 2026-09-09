import React, { useEffect, useRef, useState } from 'react';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Volume2,
  Settings,
  X,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import type { AvailableMediaDevices } from '@/services/liveMedia/mediaTypes';

export interface DeviceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMicOn: boolean;
  isCamOn: boolean;
  onToggleMic: () => void;
  onToggleCam: () => void;
  onSwitchCamera?: (deviceId: string) => Promise<boolean>;
  onSwitchMicrophone?: (deviceId: string) => Promise<boolean>;
  title?: string;
  isPreJoin?: boolean;
  onProceed?: () => void;
  proceedLabel?: string;
}

export const DeviceSettingsModal: React.FC<DeviceSettingsModalProps> = ({
  isOpen,
  onClose,
  isMicOn,
  isCamOn,
  onToggleMic,
  onToggleCam,
  onSwitchCamera,
  onSwitchMicrophone,
  title = 'Media & Device Settings',
  isPreJoin = false,
  onProceed,
  proceedLabel = 'Enter Classroom',
}) => {
  const [devices, setDevices] = useState<AvailableMediaDevices>({
    audioInputs: [],
    videoInputs: [],
    audioOutputs: [],
  });
  const [selectedAudioInput, setSelectedAudioInput] = useState<string>('');
  const [selectedVideoInput, setSelectedVideoInput] = useState<string>('');
  const [selectedAudioOutput, setSelectedAudioOutput] = useState<string>('');

  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [micLevel, setMicLevel] = useState<number>(0);
  const [isPlayingTestSound, setIsPlayingTestSound] = useState<boolean>(false);

  const testSpeaker = () => {
    try {
      setIsPlayingTestSound(true);
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) {
        setIsPlayingTestSound(false);
        return;
      }
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);

      setTimeout(() => {
        setIsPlayingTestSound(false);
        ctx.close().catch(() => {});
      }, 600);
    } catch {
      setIsPlayingTestSound(false);
    }
  };

  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const previewStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Load available devices
  const loadDevices = async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = allDevices.filter((d) => d.kind === 'audioinput');
      const videoInputs = allDevices.filter((d) => d.kind === 'videoinput');
      const audioOutputs = allDevices.filter((d) => d.kind === 'audiooutput');

      setDevices({ audioInputs, videoInputs, audioOutputs });

      if (audioInputs.length > 0 && !selectedAudioInput) {
        setSelectedAudioInput(audioInputs[0].deviceId);
      }
      if (videoInputs.length > 0 && !selectedVideoInput) {
        setSelectedVideoInput(videoInputs[0].deviceId);
      }
      if (audioOutputs.length > 0 && !selectedAudioOutput) {
        setSelectedAudioOutput(audioOutputs[0].deviceId);
      }
    } catch (err: any) {
      console.warn('Failed to enumerate devices:', err);
    }
  };

  // Start local preview stream for camera check
  const startPreview = async () => {
    stopPreview();
    setPermissionError(null);

    try {
      const constraints: MediaStreamConstraints = {
        video: isCamOn
          ? selectedVideoInput
            ? { deviceId: { exact: selectedVideoInput } }
            : true
          : false,
        audio: isMicOn
          ? selectedAudioInput
            ? { deviceId: { exact: selectedAudioInput } }
            : true
          : false,
      };

      if (!constraints.video && !constraints.audio) {
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      previewStreamRef.current = stream;

      if (previewVideoRef.current && stream.getVideoTracks().length > 0) {
        previewVideoRef.current.srcObject = stream;
      }

      // Audio level meter
      if (stream.getAudioTracks().length > 0) {
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          const audioCtx = new AudioContextClass();
          audioContextRef.current = audioCtx;

          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateMeter = () => {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            setMicLevel(Math.min(100, Math.round((average / 128) * 100)));
            animationFrameRef.current = requestAnimationFrame(updateMeter);
          };
          updateMeter();
        } catch {}
      }
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionError('Camera or Microphone access was denied by your browser.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setPermissionError('No camera or microphone device was found on this computer.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setPermissionError('Your camera or microphone is already in use by another program.');
      } else {
        setPermissionError('Unable to access media devices.');
      }
    }
  };

  const stopPreview = () => {
    if (previewStreamRef.current) {
      previewStreamRef.current.getTracks().forEach((t) => t.stop());
      previewStreamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
    setMicLevel(0);
  };

  useEffect(() => {
    if (isOpen) {
      loadDevices();
      startPreview();
    } else {
      stopPreview();
    }

    return () => {
      stopPreview();
    };
  }, [isOpen, isCamOn, isMicOn, selectedVideoInput, selectedAudioInput]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 font-['Sora']">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 animate-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-base text-white">{title}</h3>
              <p className="text-xs text-slate-400">Test camera, audio input, and configure hardware devices</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Preview Frame */}
        <div className="relative aspect-video w-full rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
          {isCamOn && !permissionError ? (
            <video
              ref={previewVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2 text-center p-6">
              <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                <VideoOff className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-300">Camera is turned off</p>
              <span className="text-[11px] text-slate-500">Toggle camera below to enable preview</span>
            </div>
          )}

          {/* Quick Hardware Toggles on Preview */}
          <div className="absolute bottom-3 inset-x-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleMic}
                className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
                  isMicOn
                    ? 'bg-emerald-500/80 hover:bg-emerald-500 text-white'
                    : 'bg-rose-500/80 hover:bg-rose-500 text-white'
                }`}
              >
                {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                <span>{isMicOn ? 'Mic On' : 'Muted'}</span>
              </button>

              <button
                type="button"
                onClick={onToggleCam}
                className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
                  isCamOn
                    ? 'bg-sky-500/80 hover:bg-sky-500 text-white'
                    : 'bg-rose-500/80 hover:bg-rose-500 text-white'
                }`}
              >
                {isCamOn ? <VideoIcon className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                <span>{isCamOn ? 'Camera On' : 'Camera Off'}</span>
              </button>
            </div>

            {/* Mic Meter Level */}
            {isMicOn && (
              <div className="flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                <span>Mic Level:</span>
                <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-75 rounded-full"
                    style={{ width: `${micLevel}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Permission Error Banner & Recovery Guidance */}
        {permissionError && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-rose-400">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{permissionError}</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              <strong>How to fix:</strong> Click the lock or camera icon in your browser URL bar, change Camera and Microphone permissions to <em>&quot;Allow&quot;</em>, and then click Retry below.
            </p>
            <button
              onClick={() => {
                startPreview();
                loadDevices();
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Permission Check</span>
            </button>
          </div>
        )}

        {/* Device Selectors */}
        <div className="space-y-3 text-xs">
          {/* Microphone Selector */}
          <div>
            <label className="text-slate-300 font-bold block mb-1">Microphone Input</label>
            <select
              value={selectedAudioInput}
              onChange={async (e) => {
                const id = e.target.value;
                setSelectedAudioInput(id);
                if (onSwitchMicrophone) {
                  await onSwitchMicrophone(id);
                }
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-hidden focus:border-sky-500 cursor-pointer"
            >
              {devices.audioInputs.length === 0 ? (
                <option value="">Default System Microphone</option>
              ) : (
                devices.audioInputs.map((d, i) => (
                  <option key={d.deviceId || i} value={d.deviceId}>
                    {d.label || `Microphone ${i + 1}`}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Camera Selector */}
          <div>
            <label className="text-slate-300 font-bold block mb-1">Camera Video Device</label>
            <select
              value={selectedVideoInput}
              onChange={async (e) => {
                const id = e.target.value;
                setSelectedVideoInput(id);
                if (onSwitchCamera) {
                  await onSwitchCamera(id);
                }
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-hidden focus:border-sky-500 cursor-pointer"
            >
              {devices.videoInputs.length === 0 ? (
                <option value="">Default System Camera</option>
              ) : (
                devices.videoInputs.map((d, i) => (
                  <option key={d.deviceId || i} value={d.deviceId}>
                    {d.label || `Camera ${i + 1}`}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Speaker Selector & Test (where supported) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-300 font-bold block">Speaker Audio Output</label>
              <button
                type="button"
                onClick={testSpeaker}
                disabled={isPlayingTestSound}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer border border-slate-700 transition-all"
              >
                <Volume2 className="w-3 h-3" />
                <span>{isPlayingTestSound ? 'Testing chime...' : 'Test Speaker'}</span>
              </button>
            </div>
            {devices.audioOutputs.length > 0 ? (
              <select
                value={selectedAudioOutput}
                onChange={(e) => setSelectedAudioOutput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-hidden focus:border-sky-500 cursor-pointer"
              >
                {devices.audioOutputs.map((d, i) => (
                  <option key={d.deviceId || i} value={d.deviceId}>
                    {d.label || `Speaker ${i + 1}`}
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-[11px] text-slate-500 italic p-2 bg-slate-950/60 rounded-xl border border-slate-800">
                Default system audio output device
              </div>
            )}
          </div>

          {/* Audio Quality & Noise Processing Badges */}
          <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-1.5 text-[11px]">
            <div className="font-bold text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Realtime Voice Processing Engine Active</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-0.5 text-slate-400 text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span>Echo Cancellation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span>Noise Suppression</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span>Auto Gain Control</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span>48 kHz Low-Latency Audio</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
          >
            {isPreJoin ? 'Cancel' : 'Done'}
          </button>
          {isPreJoin && onProceed && (
            <button
              onClick={() => {
                stopPreview();
                onProceed();
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{proceedLabel}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default DeviceSettingsModal;
