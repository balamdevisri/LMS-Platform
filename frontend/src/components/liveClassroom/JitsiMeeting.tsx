import React from 'react';
import { JitsiMeetingComponent } from './JitsiMeetingComponent';

export interface JitsiMeetingProps {
  roomName: string;
  displayName: string;
  email?: string;
  userRole?: 'instructor' | 'mentor' | 'student' | 'admin';
  classId?: string;
  onLeave?: () => void;
}

export const JitsiMeeting: React.FC<JitsiMeetingProps> = ({
  roomName,
  displayName,
  email,
  userRole,
  classId,
  onLeave,
}) => {
  const isInstructor = userRole === 'instructor' || userRole === 'admin';
  const sanitizedRoom = roomName || (classId ? `ShaivikaLMS-${classId}` : 'ShaivikaLMS-LiveRoom');

  return (
    <JitsiMeetingComponent
      roomName={sanitizedRoom}
      displayName={displayName}
      userEmail={email}
      isInstructor={isInstructor}
      onLeave={onLeave}
    />
  );
};

export default JitsiMeeting;
