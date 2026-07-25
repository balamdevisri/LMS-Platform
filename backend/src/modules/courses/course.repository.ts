import { db } from '../../firebase';
import { ICourse, CreateCourseDTO, UpdateCourseDTO, CourseFilterOptions, CoursePaginationResult } from '../../../../shared/types/course';

export class CourseRepository {
  private collectionName = 'courses';

  private get collection() {
    if (!db || typeof db.collection !== 'function') {
      return null;
    }
    return db.collection(this.collectionName);
  }

  async create(data: CreateCourseDTO): Promise<ICourse> {
    const docRef = this.collection ? this.collection.doc() : null;
    const now = new Date().toISOString();
    const id = docRef ? docRef.id : data.id || `course_${Date.now()}`;

    const newCourse: ICourse = {
      ...data,
      id,
      slug: data.slug || this.generateSlug(data.title),
      enrollmentCount: 0,
      rating: 5.0,
      ratingCount: 0,
      banner: data.banner || '',
      syllabus: data.syllabus || [],
      tags: data.tags || [],
      skills: data.skills || [],
      prerequisites: data.prerequisites || [],
      learningOutcomes: data.learningOutcomes || [],
      createdAt: now,
      updatedAt: now,
    };

    if (docRef) {
      await docRef.set(newCourse);
    }
    return newCourse;
  }

  async findById(id: string): Promise<ICourse | null> {
    if (!this.collection) return null;
    const docSnap = await this.collection.doc(id).get();
    if (!docSnap.exists) return null;
    return docSnap.data() as ICourse;
  }

  async findBySlug(slug: string): Promise<ICourse | null> {
    if (!this.collection) return null;
    const snapshot = await this.collection.where('slug', '==', slug).limit(1).get();
    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as ICourse;
  }

  async update(id: string, updates: UpdateCourseDTO): Promise<ICourse | null> {
    if (!this.collection) return null;
    const docRef = this.collection.doc(id);
    const existing = await this.findById(id);
    if (!existing) return null;

    const updatedData: Partial<ICourse> = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (updates.title && !updates.slug) {
      updatedData.slug = this.generateSlug(updates.title);
    }

    await docRef.update(updatedData);
    return { ...existing, ...updatedData } as ICourse;
  }

  async delete(id: string): Promise<boolean> {
    if (!this.collection) return false;
    await this.collection.doc(id).delete();
    return true;
  }

  async findAll(options: CourseFilterOptions = {}): Promise<CoursePaginationResult> {
    if (!this.collection) {
      return { courses: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    }

    let query: any = this.collection;

    if (options.status && options.status !== 'all') {
      query = query.where('status', '==', options.status);
    }
    if (options.category && options.category !== 'All') {
      query = query.where('category', '==', options.category);
    }
    if (options.level && options.level !== 'all') {
      query = query.where('level', '==', options.level);
    }
    if (options.featured) {
      query = query.where('featured', '==', true);
    }

    const snapshot = await query.get();
    let courses: ICourse[] = snapshot.docs.map((doc: any) => doc.data() as ICourse);

    // In-memory filter for search terms (keyword in title, description, skills, category)
    if (options.search) {
      const term = options.search.toLowerCase();
      courses = courses.filter(
        (c) =>
          c.title.toLowerCase().includes(term) ||
          c.shortDescription.toLowerCase().includes(term) ||
          c.category.toLowerCase().includes(term) ||
          c.skills.some((s) => s.toLowerCase().includes(term))
      );
    }

    // In-memory sorting
    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder || 'desc';
    courses.sort((a, b) => {
      let valA = (a as any)[sortBy] ?? '';
      let valB = (b as any)[sortBy] ?? '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const page = options.page || 1;
    const limit = options.limit || 10;
    const total = courses.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedCourses = courses.slice((page - 1) * limit, page * limit);

    return {
      courses: paginatedCourses,
      total,
      page,
      limit,
      totalPages,
    };
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
