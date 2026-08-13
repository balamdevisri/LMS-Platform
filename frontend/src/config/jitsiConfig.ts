export const JITSI_DOMAIN = import.meta.env.VITE_JITSI_DOMAIN || 'meet.jit.si';

export function generateSecureRoomId(courseSlug?: string): string {
  const cleanSlug = courseSlug
    ? courseSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    : 'classroom';
  
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const timestampSuffix = Date.now().toString(36).slice(-4);
  return `kaizenq-${cleanSlug}-${randomSuffix}${timestampSuffix}`;
}

export interface JitsiConfigOptions {
  roomName: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  role: 'instructor' | 'student';
}

export function getJitsiConfig({ roomName, displayName, email, avatarUrl, role }: JitsiConfigOptions) {
  const isInstructor = role === 'instructor';

  const toolbarButtons = isInstructor
    ? [
        'microphone',
        'camera',
        'closedcaptions',
        'desktop',
        'fullscreen',
        'chat',
        'raisehand',
        'videoquality',
        'filmstrip',
        'whiteboard',
        'mute-everyone',
        'tileview',
        'hangup',
      ]
    : [
        'microphone',
        'camera',
        'closedcaptions',
        'desktop',
        'fullscreen',
        'chat',
        'raisehand',
        'videoquality',
        'filmstrip',
        'tileview',
        'hangup',
      ];

  return {
    domain: JITSI_DOMAIN,
    roomName: roomName || 'kaizenq-default-room',
    configOverwrite: {
      startWithAudioMuted: false,
      startWithVideoMuted: false,
      disableDeepLinking: true,
      prejoinPageEnabled: false,
      enableWelcomePage: false,
      enableClosePage: false,
      requireDisplayName: false,
      hideLobbyButton: true,
      enableLobbyChat: false,
      enableFeaturesBasedOnToken: false,
    },
    interfaceConfigOverwrite: {
      TOOLBAR_BUTTONS: toolbarButtons,
      SHOW_JITSI_WATERMARK: false,
      SHOW_WATERMARK_FOR_GUESTS: false,
      DEFAULT_BACKGROUND: '#090d16',
    },
    userInfo: {
      email: email || '',
      displayName: `${displayName || 'Learner'} (${isInstructor ? 'Lead Instructor' : 'Student'})`,
      avatar: avatarUrl || undefined,
    },
  };
}
