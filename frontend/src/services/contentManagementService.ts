// ================= TYPES & INTERFACES =================

export interface ResourceItem {
  id: string;
  name: string;
  description: string;
  category: 'PDF' | 'DOCX' | 'PPTX' | 'XLSX' | 'ZIP' | 'Image' | 'Source Code' | 'External Link';
  fileSize: string;
  downloadPermission: boolean;
  fileUrl?: string;
}

export interface ValidationItem {
  id: string;
  label: string;
  status: 'success' | 'warning' | 'error';
  message: string;
}

// ================= SERVICES =================

// 1. CONTENT SERVICE (Tree reordering & deep editing operations)
export class ContentService {
  /**
   * Helper to reorder modules in a course
   */
  reorderModule(modules: any[], moduleId: string, direction: 'up' | 'down'): any[] {
    const idx = modules.findIndex(m => m.id === moduleId);
    if (idx === -1) return modules;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= modules.length) return modules;
    
    const reordered = [...modules];
    const temp = reordered[idx];
    reordered[idx] = reordered[targetIdx];
    reordered[targetIdx] = temp;
    return reordered;
  }

  /**
   * Helper to reorder topics inside a module
   */
  reorderTopic(topics: any[], topicId: string, direction: 'up' | 'down'): any[] {
    const idx = topics.findIndex(t => t.id === topicId);
    if (idx === -1) return topics;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= topics.length) return topics;

    const reordered = [...topics];
    const temp = reordered[idx];
    reordered[idx] = reordered[targetIdx];
    reordered[targetIdx] = temp;
    return reordered;
  }

  /**
   * Helper to reorder learning units inside a topic
   */
  reorderLesson(lessons: any[], lessonId: string, direction: 'up' | 'down'): any[] {
    const idx = lessons.findIndex(u => u.id === lessonId);
    if (idx === -1) return lessons;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= lessons.length) return lessons;

    const reordered = [...lessons];
    const temp = reordered[idx];
    reordered[idx] = reordered[targetIdx];
    reordered[targetIdx] = temp;
    return reordered;
  }
}

// 2. LESSON EDITOR SERVICE (Draft tracking & autosave simulation)
export class LessonEditorService {
  private autosaveTimeout: any = null;

  triggerAutosave(onSave: () => void, setStatus: (status: 'idle' | 'saving' | 'saved') => void) {
    setStatus('saving');
    if (this.autosaveTimeout) clearTimeout(this.autosaveTimeout);

    this.autosaveTimeout = setTimeout(() => {
      onSave();
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 1500);
    }, 1000);
  }

  clear() {
    if (this.autosaveTimeout) clearTimeout(this.autosaveTimeout);
  }
}

// 3. RESOURCE SERVICE (Mock sizes & categories formatter)
export class ResourceService {
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getIconForCategory(category: string): string {
    switch (category) {
      case 'PDF': return 'FileText';
      case 'DOCX':
      case 'PPTX':
      case 'XLSX': return 'Briefcase';
      case 'ZIP': return 'Archive';
      case 'Image': return 'Image';
      case 'Source Code': return 'Code';
      default: return 'Link';
    }
  }
}

// 4. MEDIA SERVICE (Regex Video URL checker)
export class MediaService {
  validateVideoUrl(url: string): { isValid: boolean; provider: 'youtube' | 'vimeo' | 'custom' | null; embedUrl: string } {
    if (!url) return { isValid: false, provider: null, embedUrl: '' };

    // YouTube regex pattern check
    const ytRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const ytMatch = url.match(ytRegex);
    if (ytMatch) {
      return {
        isValid: true,
        provider: 'youtube',
        embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`
      };
    }

    // Vimeo regex pattern check
    const vimeoRegex = /^(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return {
        isValid: true,
        provider: 'vimeo',
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[3]}`
      };
    }

    // Custom check: must look like an http/https resource
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return { isValid: true, provider: 'custom', embedUrl: url };
    }

    return { isValid: false, provider: null, embedUrl: '' };
  }
}

// 5. PUBLISH SERVICE (Checklist validators)
export class PublishService {
  validateLesson(lesson: any): ValidationItem[] {
    const checklist: ValidationItem[] = [];

    // 1. Validate Title
    if (!lesson.title || lesson.title.trim().length === 0) {
      checklist.push({
        id: 'title',
        label: 'Lesson Title',
        status: 'error',
        message: 'Title is required before publishing.'
      });
    } else {
      checklist.push({
        id: 'title',
        label: 'Lesson Title',
        status: 'success',
        message: 'Title is configured.'
      });
    }

    // 2. Validate Description
    if (!lesson.description || lesson.description.trim().length === 0) {
      checklist.push({
        id: 'desc',
        label: 'Lesson Description',
        status: 'warning',
        message: 'Add a brief description to introduce learners to this lesson.'
      });
    } else {
      checklist.push({
        id: 'desc',
        label: 'Lesson Description',
        status: 'success',
        message: 'Description is configured.'
      });
    }

    // 3. Type Specific Validations
    if (lesson.type === 'Video') {
      const mediaService = new MediaService();
      const val = mediaService.validateVideoUrl(lesson.videoUrl || '');
      if (!lesson.videoUrl) {
        checklist.push({
          id: 'video',
          label: 'Video Link URL',
          status: 'error',
          message: 'Video content type requires a valid streaming video URL.'
        });
      } else if (!val.isValid) {
        checklist.push({
          id: 'video',
          label: 'Video Link URL',
          status: 'error',
          message: 'Configured video link URL is invalid.'
        });
      } else {
        checklist.push({
          id: 'video',
          label: 'Video Link URL',
          status: 'success',
          message: `Streaming player is ready (${val.provider}).`
        });
      }
    } else if (lesson.type === 'Reading') {
      if (!lesson.readingContent || lesson.readingContent.trim().length < 30) {
        checklist.push({
          id: 'reading',
          label: 'Reading Content',
          status: 'warning',
          message: 'Reading text is empty or very brief. Add rich text layout instructions.'
        });
      } else {
        checklist.push({
          id: 'reading',
          label: 'Reading Content',
          status: 'success',
          message: 'Rich text study instructions are populated.'
        });
      }
    } else if (lesson.type === 'Quiz') {
      if (!lesson.quizQuestions || lesson.quizQuestions.length === 0) {
        checklist.push({
          id: 'quiz',
          label: 'Evaluation Quiz Questions',
          status: 'error',
          message: 'Evaluation quizzes require at least one question option.'
        });
      } else {
        checklist.push({
          id: 'quiz',
          label: 'Evaluation Quiz Questions',
          status: 'success',
          message: `${lesson.quizQuestions.length} graded assessment questions attached.`
        });
      }
    } else if (lesson.type === 'Assignment') {
      if (!lesson.assignmentInstructions || lesson.assignmentInstructions.trim().length === 0) {
        checklist.push({
          id: 'assignment',
          label: 'Assignment Instructions',
          status: 'error',
          message: 'Homework assignments require written instructions.'
        });
      } else {
        checklist.push({
          id: 'assignment',
          label: 'Assignment Instructions',
          status: 'success',
          message: 'Instructions are populated.'
        });
      }
    }

    return checklist;
  }
}
