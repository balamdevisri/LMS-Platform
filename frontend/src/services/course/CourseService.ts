import { db } from '@/firebase';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { CourseItem } from '@/contexts/CourseContext';

export class CourseService {
  /**
   * Helper to normalize a Firestore document into a CourseItem object.
   */
  static normalizeCourse(docId: string, data: any): CourseItem {
    const instructorName = typeof data.instructor === 'object' && data.instructor !== null
      ? (data.instructor.name || 'Kaizen Q Team')
      : (data.instructor || 'Kaizen Q Team');
    
    const statusVal = data.status && data.status.toLowerCase() === 'published' ? 'Published' : 'Draft';
    
    const studentsVal = typeof data.students === 'string'
      ? data.students
      : (typeof data.studentsEnrolled === 'number' ? String(data.studentsEnrolled) : '0');

    const syllabusVal = Array.isArray(data.syllabus)
      ? data.syllabus
      : (data.title === 'Git & GitHub Mastery'
        ? [
            'Module 1: Version Control & Git Basics',
            'Module 2: GitHub Foundations',
            'Module 3: Advanced Git',
            'Module 4: Repository Management',
            'Module 5: GitHub Actions',
            'Module 6: Modern GitHub Ecosystem'
          ]
        : [
            'Module 1: Fundamental Concepts & Environment Setup',
            'Module 2: Core Command Line & Configuration',
            'Module 3: Advanced Optimization & Security',
            'Module 4: Final Capstone Assessment'
          ]);

    return {
      ...data,
      id: data.id || docId,
      title: data.title || 'Untitled Technical Course',
      subtitle: data.subtitle || (data.title === 'Git & GitHub Mastery' ? '⚡ Git & GitHub Mastery' : '🐧 Linux Essentials'),
      instructor: instructorName,
      role: data.role || (data.title === 'Git & GitHub Mastery' ? 'Senior Technical Instructor' : 'Linux Systems Architect & AI Specialist'),
      avatar: data.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      rating: typeof data.rating === 'number' ? data.rating : 5.0,
      reviews: typeof data.reviews === 'number' ? data.reviews : (typeof data.totalRatings === 'number' ? data.totalRatings : 180),
      students: studentsVal,
      duration: data.duration || '20 Hours',
      category: data.category || 'Development Tools',
      level: data.level || 'Beginner to Advanced',
      badge: data.badge || (data.title === 'Git & GitHub Mastery' ? 'New Track' : 'Featured Track'),
      tracks: data.tracks || (data.title === 'Git & GitHub Mastery' ? '6 Modules (20 Hours)' : '4 Modules (32 Hours)'),
      status: statusVal,
      thumbnail: data.thumbnail || data.bannerImage || 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=1200&q=80',
      description: data.description || 'Enterprise technical course.',
      syllabus: syllabusVal,
      createdAt: data.createdAt ? (typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate().toISOString() : data.createdAt) : new Date().toISOString(),
    } as CourseItem;
  }

  /**
   * Fetches all courses from the Firestore collection.
   */
  static async getCourses(): Promise<CourseItem[]> {
    if (!db) {
      console.warn('Firestore database is not initialized. Using empty/local courses fallback.');
      return [];
    }
    const querySnapshot = await getDocs(collection(db, 'courses'));
    const loaded: CourseItem[] = [];
    querySnapshot.forEach((docSnap) => {
      loaded.push(CourseService.normalizeCourse(docSnap.id, docSnap.data()));
    });
    return loaded;
  }

  /**
   * Sets/creates a course document.
   */
  static async addCourse(course: CourseItem): Promise<void> {
    if (!db) return;
    const docRef = doc(db, 'courses', String(course.id));
    await setDoc(docRef, {
      ...course,
      createdAt: new Date(),
    });
  }

  /**
   * Updates partial fields of a course in Firestore.
   */
  static async updateCourse(id: number | string, data: Partial<CourseItem>): Promise<void> {
    if (!db) return;
    const docRef = doc(db, 'courses', String(id));
    await updateDoc(docRef, data);
  }

  /**
   * Deletes a course from Firestore.
   */
  static async deleteCourse(id: number | string): Promise<void> {
    if (!db) return;
    const docRef = doc(db, 'courses', String(id));
    await deleteDoc(docRef);
  }
}

export default CourseService;
