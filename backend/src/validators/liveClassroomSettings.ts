// Shared Data Contracts: Live Classroom Settings & Lifecycle States

export type LiveClassLifecycleStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'PUBLISHED'
  | 'NOTIFIED'
  | 'LIVE'
  | 'PAUSED'
  | 'ENDED'
  | 'ARCHIVED';

export type ChatInteractionMode = 'everyone' | 'instructor_only' | 'moderators_only' | 'disabled';
export type QaInteractionMode = 'everyone' | 'moderators_only' | 'disabled';
export type AnnouncementPriority = 'INFO' | 'IMPORTANT' | 'URGENT';
export type TargetAudienceType = 'all' | 'enrolled_students' | 'selected_batch' | 'selected_section' | 'selected_students';

export interface ClassroomInteractionSettings {
  chat: {
    enabled: boolean;
    mode: ChatInteractionMode;
    slowModeSeconds: number;
  };
  qa: {
    enabled: boolean;
    mode: QaInteractionMode;
    allowAnonymous: boolean;
  };
  polls: {
    enabled: boolean;
  };
  quiz: {
    enabled: boolean;
  };
  raiseHand: {
    enabled: boolean;
  };
  reactions: {
    enabled: boolean;
  };
  studentQuestions: {
    enabled: boolean;
  };
  screenInteraction: {
    enabled: boolean;
  };
  notes: {
    enabled: boolean;
  };
  resourceSharing: {
    enabled: boolean;
  };
  attendance: {
    enabled: boolean;
  };
  codePractice: {
    enabled: boolean;
  };
  aiTutor: {
    enabled: boolean;
  };
  studentMic: {
    enabled: boolean;
  };
  studentCamera: {
    enabled: boolean;
  };
  studentScreenShare: {
    enabled: boolean;
  };
  privateQuestions: {
    enabled: boolean;
  };
  peerInteraction: {
    enabled: boolean;
  };
  isLocked: boolean; // Classroom entry access lock (Private session)
  updatedAt?: string;
  updatedBy?: string;
}

export const DEFAULT_CLASSROOM_SETTINGS: ClassroomInteractionSettings = {
  chat: {
    enabled: true,
    mode: 'everyone',
    slowModeSeconds: 0,
  },
  qa: {
    enabled: true,
    mode: 'everyone',
    allowAnonymous: false,
  },
  polls: {
    enabled: true,
  },
  quiz: {
    enabled: true,
  },
  raiseHand: {
    enabled: true,
  },
  reactions: {
    enabled: true,
  },
  studentQuestions: {
    enabled: true,
  },
  screenInteraction: {
    enabled: true,
  },
  notes: {
    enabled: true,
  },
  resourceSharing: {
    enabled: true,
  },
  attendance: {
    enabled: true,
  },
  codePractice: {
    enabled: true,
  },
  aiTutor: {
    enabled: true,
  },
  studentMic: {
    enabled: false, // Default off for students
  },
  studentCamera: {
    enabled: false, // Default off for students
  },
  studentScreenShare: {
    enabled: false, // Default off for students
  },
  privateQuestions: {
    enabled: true,
  },
  peerInteraction: {
    enabled: true,
  },
  isLocked: false,
};

export interface LiveClassAuthoritativeState {
  sessionId: string;
  status: LiveClassLifecycleStatus;
  instructorId: string;
  instructorName?: string;
  participantCount: number;
  settings: ClassroomInteractionSettings;
  activePoll?: any | null;
  activeAnnouncement?: any | null;
  pinnedQuestion?: any | null;
  raisedHandsCount: number;
  connectionState: 'connected' | 'reconnecting' | 'disconnected';
  updatedAt: string;
}
