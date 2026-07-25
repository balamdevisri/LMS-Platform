import { CourseRepository } from './course.repository';
import { ICourse, CreateCourseDTO, UpdateCourseDTO, CourseFilterOptions, CoursePaginationResult } from '../../../../shared/types/course';
import { CreateCourseSchema, UpdateCourseSchema } from '../../../../shared/validators/course.validator';

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
    const validated = UpdateCourseSchema.parse(updates);
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error(`Course with ID ${id} not found.`);
    }

    return this.repository.update(id, validated as UpdateCourseDTO);
  }

  async deleteCourse(id: string): Promise<boolean> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error(`Course with ID ${id} not found.`);
    }
    return this.repository.delete(id);
  }

  async publishCourse(id: string): Promise<ICourse | null> {
    return this.repository.update(id, { status: 'published' });
  }

  async unpublishCourse(id: string): Promise<ICourse | null> {
    return this.repository.update(id, { status: 'draft' });
  }

  async archiveCourse(id: string): Promise<ICourse | null> {
    return this.repository.update(id, { status: 'archived' });
  }

  async duplicateCourse(id: string): Promise<ICourse> {
    const existing = await this.repository.findById(id);
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

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
