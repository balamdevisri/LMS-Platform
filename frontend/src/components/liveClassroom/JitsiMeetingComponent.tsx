import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface JitsiProps {
  roomName: string;
  displayName: string;
  userEmail?: string;
  isInstructor?: boolean;
  onLeave?: () => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export const JitsiMeetingComponent: React.FC<JitsiProps> = ({
  roomName,
  displayName,
  userEmail = '',
  isInstructor = false,
  onLeave,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const onLeaveRef = useRef(onLeave);

  useEffect(() => {
    onLeaveRef.current = onLeave;
  }, [onLeave]);

  useEffect(() => {
    const loadJitsiScript = () => {
      if (window.JitsiMeetExternalAPI) {
        initJitsi();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = () => {
        initJitsi();
      };
      script.onerror = () => {
        setLoadError(true);
        setLoading(false);
      };
      document.body.appendChild(script);
    };

    const initJitsi = () => {
      if (!containerRef.current || !window.JitsiMeetExternalAPI) return;

      // Clean existing instance only if room changes
      if (apiRef.current) {
        try {
          apiRef.current.dispose();
        } catch (e) {}
      }

      const sanitizedRoom = roomName ? roomName.replace(/[^a-zA-Z0-9-_]/g, '') : 'kaizenq-live-room';

      const options = {
        roomName: sanitizedRoom,
        width: '100%',
        height: '100%',
        parentNode: containerRef.current,
        userInfo: {
          email: userEmail,
          displayName: `${displayName} ${isInstructor ? '(Lead Mentor)' : '(Student)'}`,
        },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          disableDeepLinking: true,
          prejoinPageEnabled: false,
          enableWelcomePage: false,
          enableClosePage: false,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone',
            'camera',
            'closedcaptions',
            'desktop',
            'fullscreen',
            'furl',
            'chat',
            'raisehand',
            'videoquality',
            'filmstrip',
            'whiteboard',
            'mute-everyone',
            'invite',
            'tileview',
            'hangup',
          ],
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          DEFAULT_BACKGROUND: '#090d16',
        },
      };

      try {
        const api = new window.JitsiMeetExternalAPI('meet.jit.si', options);
        apiRef.current = api;
        setLoading(false);

        api.addEventListener('videoConferenceJoined', () => {
          toast.success(`Joined Jitsi Live Session: "${sanitizedRoom}"`);
        });

        api.addEventListener('readyToClose', () => {
          if (onLeaveRef.current) onLeaveRef.current();
        });

        api.addEventListener('videoConferenceLeft', () => {
          if (onLeaveRef.current) onLeaveRef.current();
        });
      } catch (err) {
        console.warn('Jitsi Meet initialization notice:', err);
        setLoadError(true);
        setLoading(false);
      }
    };

    loadJitsiScript();

    return () => {
      if (apiRef.current) {
        try {
          apiRef.current.dispose();
        } catch (e) {}
        apiRef.current = null;
      }
    };
  }, [roomName, displayName, userEmail, isInstructor]);

  return (
    <div className="w-full h-full min-h-[480px] sm:min-h-[560px] bg-slate-950 relative rounded-3xl overflow-hidden">
      {loading && (
        <div className="absolute inset-0 z-20 bg-slate-950 flex flex-col items-center justify-center text-white font-['Sora'] space-y-3">
          <div className="w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-300">Connecting to Jitsi Enterprise Video Engine...</p>
        </div>
      )}

      {loadError ? (
        <iframe
          src={`https://meet.jit.si/${roomName || 'kaizenq-live-room'}#config.prejoinPageEnabled=false`}
          allow="camera; microphone; display-capture; autoplay; clipboard-write; encrypted-media"
          className="w-full h-full border-0 min-h-[480px]"
          title="Jitsi Fallback Classroom Stream"
        />
      ) : (
        <div ref={containerRef} className="w-full h-full min-h-[480px] sm:min-h-[560px]" />
      )}
    </div>
  );
};
