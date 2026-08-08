import { liveClassRepository } from '../repositories/liveClass.repository';
import { LiveClass, LiveStatus, MeetingProvider } from '../types';

export class LiveClassService {
  async createLiveClass(data: Omit<LiveClass, 'classId' | 'createdAt' | 'updatedAt' | 'meetingRoomId'> & { meetingRoomId?: string }): Promise<LiveClass> {
    const classId = `live_class_${Date.now()}`;
    const courseSlug = (data.courseName || 'batch').toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const roomId = data.meetingRoomId || `kaizenq-${courseSlug}-${Date.now().toString().slice(-4)}`;
    const meetingUrl = data.meetingUrl || `https://meet.jit.si/${roomId}`;

    const newClass: LiveClass = {
      ...data,
      classId,
      meetingProvider: data.meetingProvider || MeetingProvider.JITSI,
      meetingRoomId: roomId,
      meetingUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return await liveClassRepository.create(newClass);
  }

  async getLiveClass(classId: string): Promise<LiveClass | null> {
    return await liveClassRepository.findById(classId);
  }

  async updateLiveClass(classId: string, updates: Partial<LiveClass>): Promise<void> {
    await liveClassRepository.update(classId, updates);
  }

  async deleteLiveClass(classId: string): Promise<void> {
    await liveClassRepository.delete(classId);
  }

  async getUpcomingClasses(): Promise<LiveClass[]> {
    return await liveClassRepository.findUpcoming();
  }

  async getLiveClassesByInstructor(instructorId: string): Promise<LiveClass[]> {
    return await liveClassRepository.findByInstructor(instructorId);
  }

  async getLiveClassesByCourse(courseId: string): Promise<LiveClass[]> {
    return await liveClassRepository.findByCourse(courseId);
  }

  async startSession(classId: string): Promise<void> {
    await liveClassRepository.update(classId, {
      status: LiveStatus.Live,
      startTime: new Date().toISOString()
    });
  }

  async endSession(classId: string): Promise<void> {
    await liveClassRepository.update(classId, {
      status: LiveStatus.Completed,
      endTime: new Date().toISOString()
    });
  }
}

export const liveClassService = new LiveClassService();
