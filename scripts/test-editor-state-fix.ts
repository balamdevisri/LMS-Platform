import { gitCourseModules } from '../frontend/src/data/gitCourseFullData';

interface LearningUnitItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: 'Reading' | 'Video' | 'Quiz' | 'Assignment';
  videoUrl?: string;
  readingContent?: string;
  conceptTheory?: string;
  learningObjectives?: string[];
  codeExamples?: any[];
  keyPoints?: string[];
  practiceQuestions?: any[];
  resourceLinks?: any[];
  quizQuestions?: any[];
  assignmentInstructions?: string;
  notes?: string;
  isDraft?: boolean;
  lastSavedAt?: string;
}

// Simulated UnitContentEditor hook lifecycle matching frontend/src/components/admin/UnitContentEditor.tsx
class UnitContentEditorSimulation {
  public isOpen: boolean;
  public unit: LearningUnitItem | null;
  public onSave: (updatedUnit: LearningUnitItem, isDraft?: boolean) => Promise<void> | void;

  // Refs
  public lastLoadedUnitIdRef: { current: string | null };
  public isDirtyRef: { current: boolean };

  // State
  public title: string = '';
  public description: string = '';
  public duration: string = '15 mins';
  public type: 'Reading' | 'Video' | 'Quiz' | 'Assignment' = 'Reading';
  public videoUrl: string = '';
  public objectives: string[] = [''];
  public conceptTheory: string = '';
  public codeExamples: any[] = [];
  public keyPoints: string[] = [];
  public practiceQuestions: any[] = [];
  public resourceLinks: any[] = [];
  public quizQuestions: any[] = [];
  public assignmentInstructions: string = '';
  public notes: string = '';
  public isDirty: boolean = false;
  public activeTab: 'editor' | 'preview' = 'editor';

  constructor(isOpen: boolean, unit: LearningUnitItem | null, onSave: (u: LearningUnitItem, d?: boolean) => any) {
    this.isOpen = isOpen;
    this.unit = unit;
    this.onSave = onSave;
    this.lastLoadedUnitIdRef = { current: unit?.id || null };
    this.isDirtyRef = { current: false };

    if (isOpen && unit) {
      this.title = unit.title || '';
      this.description = unit.description || '';
      this.duration = unit.duration || '15 mins';
      this.type = unit.type || 'Reading';
      this.videoUrl = unit.videoUrl || '';
      this.objectives = unit.learningObjectives && unit.learningObjectives.length > 0 ? unit.learningObjectives : [''];
      this.conceptTheory = unit.conceptTheory || unit.readingContent || '';
      this.codeExamples = unit.codeExamples || [];
      this.keyPoints = unit.keyPoints || [];
      this.practiceQuestions = unit.practiceQuestions || [];
      this.resourceLinks = unit.resourceLinks || [];
      this.quizQuestions = unit.quizQuestions || [];
      this.assignmentInstructions = unit.assignmentInstructions || '';
      this.notes = unit.notes || '';
      this.isDirty = false;
      this.activeTab = 'editor';
    }
  }

  public markDirty() {
    this.isDirtyRef.current = true;
    if (!this.isDirty) this.isDirty = true;
  }

  // Exact logic implemented in UnitContentEditor.tsx
  public handleUnitEffect(newUnitProp: LearningUnitItem | null) {
    this.unit = newUnitProp;
    if (!this.unit) {
      this.lastLoadedUnitIdRef.current = null;
      return;
    }

    const previousUnitId = this.lastLoadedUnitIdRef.current;
    const isNewUnit = previousUnitId !== this.unit.id;

    console.log('[EDITOR-INIT]', {
      unitId: this.unit.id,
      previousUnitId,
      isDirty: this.isDirtyRef.current,
      isNewUnit,
    });

    if (isNewUnit) {
      console.log('[EDITOR-RESET]', {
        unitId: this.unit.id,
        reason: previousUnitId === null ? 'initial_mount' : 'unit_switched',
      });
      this.lastLoadedUnitIdRef.current = this.unit.id;
      this.isDirtyRef.current = false;
      this.isDirty = false;
      this.title = this.unit.title || '';
      this.description = this.unit.description || '';
      this.duration = this.unit.duration || '15 mins';
      this.type = this.unit.type || 'Reading';
      this.videoUrl = this.unit.videoUrl || '';
      this.objectives = this.unit.learningObjectives && this.unit.learningObjectives.length > 0 ? this.unit.learningObjectives : [''];
      this.conceptTheory = this.unit.conceptTheory || this.unit.readingContent || '';
      this.codeExamples = this.unit.codeExamples || [];
      this.keyPoints = this.unit.keyPoints || [];
      this.practiceQuestions = this.unit.practiceQuestions || [];
      this.resourceLinks = this.unit.resourceLinks || [];
      this.quizQuestions = this.unit.quizQuestions || [];
      this.assignmentInstructions = this.unit.assignmentInstructions || '';
      this.notes = this.unit.notes || '';
      this.activeTab = 'editor';
    } else if (!this.isDirtyRef.current) {
      console.log('[EDITOR-RESET]', {
        unitId: this.unit.id,
        reason: 'clean_state_sync',
      });
      this.title = this.unit.title || '';
      this.description = this.unit.description || '';
      this.duration = this.unit.duration || '15 mins';
      this.type = this.unit.type || 'Reading';
      this.videoUrl = this.unit.videoUrl || '';
      this.objectives = this.unit.learningObjectives && this.unit.learningObjectives.length > 0 ? this.unit.learningObjectives : [''];
      this.conceptTheory = this.unit.conceptTheory || this.unit.readingContent || '';
      this.codeExamples = this.unit.codeExamples || [];
      this.keyPoints = this.unit.keyPoints || [];
      this.practiceQuestions = this.unit.practiceQuestions || [];
      this.resourceLinks = this.unit.resourceLinks || [];
      this.quizQuestions = this.unit.quizQuestions || [];
      this.assignmentInstructions = this.unit.assignmentInstructions || '';
      this.notes = this.unit.notes || '';
    } else {
      console.log('[EDITOR-RESET]', {
        unitId: this.unit.id,
        reason: 'skipped_due_to_unsaved_changes',
      });
    }
  }

  public async handleSave(isDraft = false) {
    const updatedUnit: LearningUnitItem = {
      ...this.unit!,
      id: this.unit!.id,
      title: this.title.trim(),
      description: this.description.trim(),
      duration: this.duration.trim() || '15 mins',
      type: this.type,
      videoUrl: this.type === 'Video' ? this.videoUrl.trim() : undefined,
      readingContent: this.conceptTheory.trim(),
      conceptTheory: this.conceptTheory.trim(),
      isDraft,
      lastSavedAt: new Date().toISOString(),
    };

    await this.onSave(updatedUnit, isDraft);
    this.isDirtyRef.current = false;
    this.isDirty = false;
    this.lastLoadedUnitIdRef.current = updatedUnit.id;
  }
}

async function testWorkflow() {
  console.log('================================================================================');
  console.log('           TESTING UNIT CONTENT EDITOR STATE RETENTION & SWITCHING               ');
  console.log('================================================================================\n');

  const unitA = gitCourseModules[0].topics[0].learningUnits[0]; // git-unit-1-notes
  const unitB = gitCourseModules[1].topics[0].learningUnits[0]; // Module 2 unit
  const NEW_CONTENT = 'NEW_MANUAL_CONTENT_2026';

  let savedUnitA: LearningUnitItem | null = null;
  const onSave = async (u: LearningUnitItem, isDraft?: boolean) => {
    savedUnitA = u;
  };

  // 1. Open Unit A
  console.log('>>> 1. Open git-unit-1-notes');
  const editor = new UnitContentEditorSimulation(true, unitA, onSave);
  console.log(`  Initial conceptTheory length: ${editor.conceptTheory.length}`);
  console.log(`  Initial isDirty: ${editor.isDirty}\n`);

  // 2. Select All and Delete
  console.log('>>> 2. Select All & Delete');
  editor.conceptTheory = '';
  editor.markDirty();
  console.log('[EDITOR-CHANGE]', { unitId: unitA.id, field: 'conceptTheory', valueSnippet: '""' });
  console.log(`  conceptTheory after delete: "${editor.conceptTheory}"`);
  console.log(`  isDirty: ${editor.isDirty}\n`);

  // 3. Paste NEW_MANUAL_CONTENT_2026
  console.log('>>> 3. Paste NEW_MANUAL_CONTENT_2026');
  editor.conceptTheory = NEW_CONTENT;
  editor.markDirty();
  console.log('[EDITOR-CHANGE]', { unitId: unitA.id, field: 'conceptTheory', valueSnippet: NEW_CONTENT });
  console.log(`  conceptTheory after paste: "${editor.conceptTheory}"`);
  console.log(`  isDirty: ${editor.isDirty}\n`);

  // 4. Click elsewhere / parent re-renders with new unit prop reference (WITHOUT saving)
  console.log('>>> 4. Parent re-renders / focus changes (simulate passing fresh unit object with OLD data)');
  const freshUnitAFromParent = JSON.parse(JSON.stringify(unitA)); // has OLD content
  editor.handleUnitEffect(freshUnitAFromParent);
  console.log(`  conceptTheory AFTER parent re-render: "${editor.conceptTheory}"`);
  if (editor.conceptTheory === NEW_CONTENT) {
    console.log('  ✅ SUCCESS: NEW_MANUAL_CONTENT_2026 was NOT overwritten by parent re-render!\n');
  } else {
    throw new Error('❌ FAILED: Content was overwritten!');
  }

  // 5. Switch to Unit B
  console.log('>>> 5. Switch to Unit B (git-unit-2)');
  editor.handleUnitEffect(unitB);
  console.log(`  Unit B title: "${editor.title}"`);
  console.log(`  Unit B conceptTheory snippet: "${editor.conceptTheory.slice(0, 40).replace(/\n/g, ' ')}..."`);
  console.log(`  isDirty after switch: ${editor.isDirty}`);
  if (editor.title === unitB.title && !editor.isDirty) {
    console.log('  ✅ SUCCESS: Unit B loaded freshly and correctly!\n');
  } else {
    throw new Error('❌ FAILED: Unit B did not load correctly!');
  }

  // 6. Switch back to Unit A
  console.log('>>> 6. Switch back to Unit A (git-unit-1-notes)');
  editor.handleUnitEffect(unitA);
  console.log(`  Unit A reloaded title: "${editor.title}"`);
  console.log(`  Unit A reloaded isDirty: ${editor.isDirty}\n`);

  // 7. Edit Unit A again and Save Draft
  console.log('>>> 7. Edit Unit A and Save Draft');
  editor.conceptTheory = NEW_CONTENT;
  editor.markDirty();
  await editor.handleSave(true);
  console.log(`  Saved Unit readingContent: "${savedUnitA!.readingContent}"`);
  console.log(`  Editor isDirty after save: ${editor.isDirty}`);
  console.log(`  Editor conceptTheory after save: "${editor.conceptTheory}"`);
  if (savedUnitA!.readingContent === NEW_CONTENT && !editor.isDirty) {
    console.log('  ✅ SUCCESS: Save Draft succeeded and state remains clean!\n');
  } else {
    throw new Error('❌ FAILED: Save Draft failed!');
  }

  console.log('================================================================================');
  console.log('                   ALL UNIT CONTENT EDITOR TESTS PASSED!                        ');
  console.log('================================================================================');
}

testWorkflow().catch((err) => {
  console.error(err);
  process.exit(1);
});
