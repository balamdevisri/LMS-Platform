import React, { useRef, useEffect } from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { JITSI_DOMAIN, getJitsiConfig } from '../../config/jitsiConfig';

export interface JitsiClassroomProps {
  roomName: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  role: 'instructor' | 'student';
  onReady?: (api?: any) => void;
  onConferenceJoined?: () => void;
  onConferenceLeft?: () => void;
}

export const JitsiClassroom: React.FC<JitsiClassroomProps> = ({
  roomName,
  displayName,
  email,
  avatarUrl,
  role,
  onReady,
  onConferenceJoined,
  onConferenceLeft,
}) => {
  const apiRef = useRef<any>(null);

  const jitsiConfig = getJitsiConfig({
    roomName,
    displayName,
    email,
    avatarUrl,
    role,
  });

  const handleApiReady = (externalApi: any) => {
    apiRef.current = externalApi;
    console.log('[JITSI] API ready');

    if (onReady) onReady(externalApi);

    externalApi.addEventListener('videoConferenceJoined', () => {
      console.log('[JITSI] Conference joined');
      if (onConferenceJoined) onConferenceJoined();
    });

    externalApi.addEventListener('videoConferenceLeft', () => {
      console.log('[JITSI] Conference left');
      if (onConferenceLeft) onConferenceLeft();
    });

    externalApi.addEventListener('readyToClose', () => {
      console.log('[JITSI] Ready to close');
      if (onConferenceLeft) onConferenceLeft();
    });
  };

  useEffect(() => {
    return () => {
      if (apiRef.current) {
        try {
          console.log('[JITSI] Destroying Jitsi instance');
          apiRef.current.dispose();
        } catch (e) {
          console.warn('[JITSI] Disposal notice:', e);
        }
        apiRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full h-full min-h-[480px] sm:min-h-[560px] bg-slate-950 relative rounded-3xl overflow-hidden shadow-2xl">
      <JitsiMeeting
        domain={JITSI_DOMAIN}
        roomName={jitsiConfig.roomName}
        configOverwrite={jitsiConfig.configOverwrite}
        interfaceConfigOverwrite={jitsiConfig.interfaceConfigOverwrite}
        userInfo={jitsiConfig.userInfo}
        onApiReady={handleApiReady}
        getIFrameRef={(iframeRef) => {
          if (iframeRef) {
            iframeRef.style.height = '100%';
            iframeRef.style.width = '100%';
            iframeRef.style.borderRadius = '1.5rem';
          }
        }}
        spinner={() => (
          <div className="absolute inset-0 z-20 bg-slate-950 flex flex-col items-center justify-center text-white font-sans space-y-3">
            <div className="w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold text-slate-300">Connecting to KaizenQ Jitsi Video Engine...</p>
          </div>
        )}
      />
    </div>
  );
};

export default JitsiClassroom;
