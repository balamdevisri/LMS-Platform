import { CourseRepository } from './course.repository';
import { ICourse, CreateCourseDTO, UpdateCourseDTO, CourseFilterOptions, CoursePaginationResult } from '../../types/course';
import { CreateCourseSchema, UpdateCourseSchema } from '../../validators/course.validator';

export class CourseService {
  private repository: CourseRepository;

  constructor() {
    this.repository = new CourseRepository();
  }

  async createCourse(dto: CreateCourseDTO): Promise<ICourse> {
    const validated = CreateCourseSchema.parse(dto);

    let slug = validated.slug;
    if (!slug) {
      slug = this.generateSlug(validated.title);
    }

    // Ensure slug uniqueness
    const existing = await this.repository.findBySlug(slug);
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    return this.repository.create({
      ...validated,
      slug,
    } as CreateCourseDTO);
  }

  async getCourseById(id: string): Promise<ICourse | null> {
    return this.repository.findById(id);
  }

  async getCourseBySlug(slug: string): Promise<ICourse | null> {
    return this.repository.findBySlug(slug);
  }

  async getCourses(options: CourseFilterOptions = {}): Promise<CoursePaginationResult> {
    return this.repository.findAll(options);
  }

  async updateCourse(id: string, updates: UpdateCourseDTO): Promise<ICourse | null> {
    const reqSampleUnit = (updates as any).modules?.[0]?.topics?.[0]?.learningUnits?.[0];
    console.log(`[BACKEND-PUT-TRACE] 5. Backend PUT received: id="${id}", targetUnitId="${reqSampleUnit?.id}", readingContentSnippet="${reqSampleUnit?.readingContent?.slice(0, 100)}"`);
    
    const validated = UpdateCourseSchema.parse(updates);
    const valSampleUnit = (validated as any).modules?.[0]?.topics?.[0]?.learningUnits?.[0];
    console.log(`[BACKEND-PUT-TRACE] 6. AFTER Zod validation: targetUnitId="${valSampleUnit?.id}", readingContentSnippet="${valSampleUnit?.readingContent?.slice(0, 100)}"`);

    let existing = await this.repository.findById(id);
    let docId = id;
    if (!existing) {
      existing = await this.repository.findBySlug(id);
      if (existing) docId = existing.id;
    }

    if (!existing) {
      console.log(`[BACKEND-PUT-TRACE] Course with ID/slug "${id}" not in Firestore yet. Creating new persistent document with ID "${docId}"...`);
      const newCourse = await this.repository.create({
        ...validated,
        id: docId,
        title: validated.title || id,
        shortDescription: validated.shortDescription || 'Course track',
        description: validated.description || 'Course track overview',
        thumbnail: validated.thumbnail || '/assets/images/linux_course_thumbnail.webp',
        category: validated.category || 'Development',
        duration: validated.duration || '20 Hours',
        instructor: validated.instructor || { name: 'Kaizen Q Team' },
        skills: validated.skills || ['Development'],
        learningOutcomes: validated.learningOutcomes || ['Learning Outcomes'],
        status: validated.status || 'published',
        modules: (validated as any).modules || [],
      } as any);
      return newCourse;
    }

    console.log(`[BACKEND-PUT-TRACE] 7. BEFORE Firestore update: target docId="${docId}"`);
    const updated = await this.repository.update(docId, validated as UpdateCourseDTO);

    const readBack = await this.repository.findById(docId);
    const readBackUnit = readBack?.modules?.[0]?.topics?.[0]?.learningUnits?.[0];
    console.log(`[BACKEND-PUT-TRACE] 8. AFTER Firestore update: docId="${docId}", targetUnitId="${readBackUnit?.id}", readingContent="${readBackUnit?.readingContent}"`);
    return updated;
  }

  async deleteCourse(id: string): Promise<boolean> {
    let existing = await this.repository.findById(id);
    let docId = id;
    if (!existing) {
      existing = await this.repository.findBySlug(id);
      if (existing) docId = existing.id;
    }
    if (!existing) {
      throw new Error(`Course with ID ${id} not found.`);
    }
    return this.repository.delete(docId);
  }

  async publishCourse(id: string): Promise<ICourse | null> {
    return this.updateCourse(id, { status: 'published' });
  }

  async unpublishCourse(id: string): Promise<ICourse | null> {
    return this.updateCourse(id, { status: 'draft' });
  }

  async archiveCourse(id: string): Promise<ICourse | null> {
    return this.updateCourse(id, { status: 'archived' });
  }

  async duplicateCourse(id: string): Promise<ICourse> {
    let existing = await this.repository.findById(id);
    if (!existing) {
      existing = await this.repository.findBySlug(id);
    }
    if (!existing) {
      throw new Error(`Course with ID ${id} not found.`);
    }

    const copyTitle = `${existing.title} (Copy)`;
    const copySlug = `${existing.slug}-copy-${Date.now().toString().slice(-4)}`;

    const { id: _, createdAt, updatedAt, enrollmentCount, ...rest } = existing;

    return this.repository.create({
      ...rest,
      title: copyTitle,
      slug: copySlug,
      status: 'draft',
    });
  }

  async getCourseModules(courseIdOrSlug: string) {
    let resolvedId = courseIdOrSlug;
    try {
      const course = (await this.getCourseById(courseIdOrSlug)) || (await this.getCourseBySlug(courseIdOrSlug));
      if (course) {
        if (course.modules && Array.isArray(course.modules) && course.modules.length > 0) {
          console.log(`[BACKEND-GET-MODULES-TRACE] Returning ${course.modules.length} modules directly from course doc "${course.id}"`);
          return course.modules;
        }
        if (course.id) {
          resolvedId = String(course.id);
        }
      }
    } catch (e) {}

    const { courseContentService } = await import('../../services/course/courseContent.service');
    const subModules = await courseContentService.getCourseModules(resolvedId);
    if (subModules && subModules.length > 0) return subModules;
    return [];
  }

  async getModuleLessons(courseIdOrSlug: string, moduleId: string, options?: any) {
    let resolvedId = courseIdOrSlug;
    try {
      const course = (await this.getCourseById(courseIdOrSlug)) || (await this.getCourseBySlug(courseIdOrSlug));
      if (course && course.id) {
        resolvedId = String(course.id);
      }
    } catch (e) {}

    const { courseContentService } = await import('../../services/course/courseContent.service');
    return courseContentService.getModuleLessons(resolvedId, moduleId, options);
  }

  async bulkImportCourse(payload: any, adminId: string) {
    const courseData = payload.course || payload;
    if (!courseData || !courseData.title) {
      throw new Error('Invalid course JSON: root must contain course object with a non-empty title.');
    }

    const title = String(courseData.title).trim();
    const shortDesc = courseData.shortDescription || courseData.description || `${title} comprehensive learning curriculum.`;
    const fullDesc = courseData.description || shortDesc;

    // Create the base course
    const createdCourse = await this.createCourse({
      title,
      shortDescription: shortDesc.length >= 10 ? shortDesc : `${shortDesc} curriculum track.`,
      description: fullDesc.length >= 20 ? fullDesc : `${fullDesc} - comprehensive course modules, topics, and practice units.`,
      thumbnail: courseData.thumbnail || '/assets/images/linux_course_thumbnail.webp',
      category: courseData.category || 'Computer Science & Engineering',
      level: (courseData.level || 'all_levels') as any,
      duration: courseData.duration || '20 Hours',
      language: courseData.language || 'English',
      price: typeof courseData.price === 'number' ? courseData.price : 0,
      instructor: {
        id: adminId || 'admin_kaizenq',
        name: courseData.instructorName || (typeof courseData.instructor === 'object' ? courseData.instructor.name : courseData.instructor) || 'KaizenQ Faculty',
        role: 'Senior Technical Instructor',
      },
      skills: Array.isArray(courseData.skills) && courseData.skills.length > 0 ? courseData.skills : [title, 'Software Engineering'],
      prerequisites: Array.isArray(courseData.prerequisites) ? courseData.prerequisites : ['Basic computer literacy'],
      learningOutcomes: Array.isArray(courseData.learningOutcomes) && courseData.learningOutcomes.length > 0
        ? courseData.learningOutcomes
        : [`Master core ${title} fundamentals and hands-on practice.`],
      status: 'published',
      visibility: 'public',
      featured: true,
      tags: Array.isArray(courseData.tags) ? courseData.tags : [title.toLowerCase().replace(/\s+/g, '-')],
    });

    const rawModules = Array.isArray(courseData.modules) ? courseData.modules : [];
    const stats = await this.processAndSaveModules(createdCourse.id, rawModules);

    return {
      courseId: createdCourse.id,
      courseTitle: createdCourse.title,
      slug: createdCourse.slug,
      created: stats.created,
      skipped: stats.skipped,
      totalModules: stats.totalModules,
    };
  }

  async bulkImportToCourse(courseId: string, payload: any, _adminId: string) {
    const existing = await this.repository.findById(courseId);
    if (!existing) {
      throw new Error(`Course with ID "${courseId}" not found.`);
    }

    const rawModules = Array.isArray(payload.modules)
      ? payload.modules
      : Array.isArray(payload)
      ? payload
      : payload.course?.modules || [];

    if (!Array.isArray(rawModules) || rawModules.length === 0) {
      throw new Error('No modules found in JSON payload to import.');
    }

    const stats = await this.processAndSaveModules(courseId, rawModules);

    return {
      courseId,
      courseTitle: existing.title,
      created: stats.created,
      skipped: stats.skipped,
      totalModules: stats.totalModules,
    };
  }

  private async processAndSaveModules(courseId: string, rawModules: any[]) {
    const createdStats = { modules: 0, topics: 0, units: 0, resources: 0 };
    const skippedStats = { modules: 0, topics: 0, units: 0 };

    const existingCourse = await this.repository.findById(courseId);
    const existingModules: any[] = Array.isArray(existingCourse?.modules) ? [...existingCourse.modules] : [];

    const processedModules: any[] = [...existingModules];

    for (let mIdx = 0; mIdx < rawModules.length; mIdx++) {
      const rawMod = rawModules[mIdx];
      if (!rawMod || !rawMod.title) continue;

      const modTitle = String(rawMod.title).trim();
      let modEntry = processedModules.find(
        (m) => String(m.title).trim().toLowerCase() === modTitle.toLowerCase()
      );

      if (!modEntry) {
        modEntry = {
          id: rawMod.id || `mod-${Date.now()}-${mIdx + 1}`,
          title: modTitle,
          description: rawMod.description || `${modTitle} curriculum section.`,
          duration: rawMod.duration || '4 Hours',
          order: typeof rawMod.order === 'number' ? rawMod.order : processedModules.length + 1,
          topics: [],
        };
        processedModules.push(modEntry);
        createdStats.modules++;
      } else {
        skippedStats.modules++;
      }

      const rawTopics = Array.isArray(rawMod.topics) ? rawMod.topics : [];
      if (!Array.isArray(modEntry.topics)) modEntry.topics = [];

      for (let tIdx = 0; tIdx < rawTopics.length; tIdx++) {
        const rawTopic = rawTopics[tIdx];
        if (!rawTopic || !rawTopic.title) continue;

        const topicTitle = String(rawTopic.title).trim();
        let topicEntry = modEntry.topics.find(
          (t: any) => String(t.title).trim().toLowerCase() === topicTitle.toLowerCase()
        );

        if (!topicEntry) {
          topicEntry = {
            id: rawTopic.id || `topic-${Date.now()}-${mIdx + 1}-${tIdx + 1}`,
            title: topicTitle,
            description: rawTopic.description || `${topicTitle} topic overview.`,
            estimatedDuration: rawTopic.duration || rawTopic.estimatedDuration || '45 mins',
            order: typeof rawTopic.order === 'number' ? rawTopic.order : modEntry.topics.length + 1,
            learningUnits: [],
          };
          modEntry.topics.push(topicEntry);
          createdStats.topics++;
        } else {
          skippedStats.topics++;
        }

        const rawUnits = Array.isArray(rawTopic.units)
          ? rawTopic.units
          : Array.isArray(rawTopic.learningUnits)
          ? rawTopic.learningUnits
          : [];

        if (!Array.isArray(topicEntry.learningUnits)) topicEntry.learningUnits = [];

        for (let uIdx = 0; uIdx < rawUnits.length; uIdx++) {
          const rawUnit = rawUnits[uIdx];
          if (!rawUnit || !rawUnit.title) continue;

          const unitTitle = String(rawUnit.title).trim();
          const existingUnit = topicEntry.learningUnits.find(
            (u: any) => String(u.title).trim().toLowerCase() === unitTitle.toLowerCase()
          );

          if (existingUnit) {
            skippedStats.units++;
            continue;
          }

          // Sanitize resources
          const rawRes = Array.isArray(rawUnit.resources)
            ? rawUnit.resources
            : Array.isArray(rawUnit.resourceLinks)
            ? rawUnit.resourceLinks
            : [];

          const sanitizedResources = rawRes
            .filter((r: any) => r && r.title && r.url)
            .map((r: any, rIdx: number) => {
              const urlStr = String(r.url).trim();
              const isSafe = urlStr.startsWith('https://') || urlStr.startsWith('http://') || urlStr.startsWith('/');
              const typeStr = (r.type || 'link').toLowerCase();
              return {
                id: r.id || `res-${Date.now()}-${rIdx + 1}`,
                title: String(r.title).trim(),
                url: isSafe ? urlStr : 'https://',
                type: ['pdf', 'link', 'video', 'github', 'download', 'doc'].includes(typeStr) ? typeStr : 'link',
                description: r.description ? String(r.description).trim() : '',
                displayOrder: rIdx + 1,
              };
            });

          createdStats.resources += sanitizedResources.length;

          const newUnit = {
            id: rawUnit.id || `unit-${Date.now()}-${mIdx + 1}-${tIdx + 1}-${uIdx + 1}`,
            title: unitTitle,
            description: rawUnit.description || `${unitTitle} study lesson.`,
            duration: rawUnit.duration || '15 mins',
            type: rawUnit.type || 'Reading',
            conceptTheory: rawUnit.content || rawUnit.conceptTheory || rawUnit.readingContent || `## ${unitTitle}\n\n${rawUnit.description || 'Welcome to this lesson.'}`,
            readingContent: rawUnit.content || rawUnit.readingContent || rawUnit.conceptTheory || `## ${unitTitle}\n\n${rawUnit.description || 'Welcome to this lesson.'}`,
            learningObjectives: Array.isArray(rawUnit.learningObjectives) ? rawUnit.learningObjectives : [unitTitle],
            codeExamples: Array.isArray(rawUnit.codeExamples) ? rawUnit.codeExamples : [],
            keyPoints: Array.isArray(rawUnit.keyPoints) ? rawUnit.keyPoints : [],
            practiceQuestions: Array.isArray(rawUnit.practiceQuestions) ? rawUnit.practiceQuestions : [],
            resourceLinks: sanitizedResources,
            order: typeof rawUnit.order === 'number' ? rawUnit.order : topicEntry.learningUnits.length + 1,
          };

          topicEntry.learningUnits.push(newUnit);
          createdStats.units++;
        }
      }
    }

    // Persist updated modules to Firestore course document
    await this.repository.update(courseId, {
      modules: processedModules,
    } as any);

    return {
      created: createdStats,
      skipped: skippedStats,
      totalModules: processedModules.length,
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
