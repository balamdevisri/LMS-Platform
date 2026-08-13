import { frontendLiveClassRepository } from '../repositories/liveClass.repository';
import { LiveStatus, MeetingProvider, type LiveClass } from '../types';

export class FrontendLiveClassService {
  subscribeLiveClasses(callback: (classes: LiveClass[]) => void): () => void {
    return frontendLiveClassRepository.subscribeLiveClasses(callback);
  }

  subscribeLiveClassById(classId: string, callback: (liveClass: LiveClass | null) => void): () => void {
    return frontendLiveClassRepository.subscribeLiveClassById(classId, callback);
  }

  async createLiveClass(data: Omit<LiveClass, 'classId' | 'createdAt' | 'updatedAt' | 'meetingRoomId'> & { meetingRoomId?: string }): Promise<LiveClass> {
    const classId = `live_class_${Date.now()}`;
    const courseSlug = (data.courseName || 'batch').toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const roomId = data.meetingRoomId || `kaizenq-${courseSlug}-${Date.now().toString().slice(-4)}`;
    const meetingUrl = data.meetingUrl || `/live-classroom/room/${classId}`;

    const newClass: LiveClass = {
      ...data,
      classId,
      meetingProvider: data.meetingProvider || MeetingProvider.KAIZENQ,
      meetingRoomId: roomId,
      meetingUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await frontendLiveClassRepository.createLiveClass(newClass);
    return newClass;
  }

  async updateLiveClass(classId: string, updates: Partial<LiveClass>): Promise<void> {
    await frontendLiveClassRepository.updateLiveClass(classId, updates);
  }

  async deleteLiveClass(classId: string): Promise<void> {
    await frontendLiveClassRepository.deleteLiveClass(classId);
  }

  async startLiveClass(classId: string): Promise<void> {
    await frontendLiveClassRepository.updateLiveClass(classId, {
      status: LiveStatus.Live,
      startTime: new Date().toISOString()
    });
  }

  async endLiveClass(classId: string): Promise<void> {
    await frontendLiveClassRepository.updateLiveClass(classId, {
      status: LiveStatus.Completed,
      endTime: new Date().toISOString()
    });
  }
}

export const frontendLiveClassService = new FrontendLiveClassService();
