import { LiveStatus, type LiveClass } from '../types';

export const formatDuration = (totalSeconds: number): string => {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const isClassActive = (liveClass: LiveClass): boolean => {
  return liveClass.status === LiveStatus.Live;
};

export const filterClassesByRole = (classes: LiveClass[], userRole: string, userId: string): LiveClass[] => {
  if (userRole === 'admin') return classes;
  if (userRole === 'instructor') {
    return classes.filter((c) => c.instructorId === userId || c.createdBy === userId);
  }
  return classes.filter((c) => c.status === LiveStatus.Live || c.status === LiveStatus.Scheduled);
};
