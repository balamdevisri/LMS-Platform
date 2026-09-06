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

interface ModuleItem {
  id: string;
  title: string;
  description?: string;
  duration?: string;
  topics: Array<{
    id: string;
    title: string;
    description?: string;
    estimatedDuration?: string;
    learningUnits: LearningUnitItem[];
  }>;
}

interface CourseItem {
  id: string | number;
  title: string;
  subtitle?: string;
  modules?: ModuleItem[];
  [key: string]: any;
}

async function runTrace() {
  console.log('================================================================================');
  console.log('           RUNTIME TRACE: EDITING WORKFLOW & OVERWRITE DETECTION               ');
  console.log('================================================================================\n');

  const OLD_CONTENT = gitCourseModules[0].topics[0].learningUnits[0].readingContent || '';
  const NEW_CONTENT = 'NEW_MANUAL_CONTENT_2026';
  const TARGET_UNIT_ID = 'git-unit-1-notes';
  const TARGET_COURSE_ID = 'git-github-mastery';

  console.log(`Target Course: ${TARGET_COURSE_ID}`);
  console.log(`Target Unit:   ${TARGET_UNIT_ID}`);
  console.log(`OLD CONTENT Snippet: "${OLD_CONTENT.slice(0, 50).replace(/\n/g, ' ')}..." (Length: ${OLD_CONTENT.length} chars)`);
  console.log(`NEW CONTENT:         "${NEW_CONTENT}"\n`);

  // ============================================================================
  // STEP 1: OPEN THE UNIT (AdminCourseDetails -> UnitContentEditor)
  // ============================================================================
  console.log('--------------------------------------------------------------------------------');
  console.log('STEP 1: Open the unit');
  console.log('--------------------------------------------------------------------------------');

  // AdminCourseDetails state
  let modules: ModuleItem[] = JSON.parse(JSON.stringify(gitCourseModules));
  let targetUnitInModules = modules[0].topics[0].learningUnits.find(u => u.id === TARGET_UNIT_ID)!;
  let activeUnit: LearningUnitItem | null = JSON.parse(JSON.stringify(targetUnitInModules));

  console.log('[ADMIN-DETAILS-TRACE] openEditUnitDrawer called:');
  console.log(`  activeUnit.id = "${activeUnit.id}"`);
  console.log(`  activeUnit.readingContent length = ${activeUnit.readingContent?.length}`);
  console.log(`  activeUnit.conceptTheory = ${activeUnit.conceptTheory}`);

  // UnitContentEditor initial state mount
  let editor_unitProp = activeUnit;
  let editor_title = editor_unitProp.title || '';
  let editor_conceptTheory = editor_unitProp.conceptTheory || editor_unitProp.readingContent || '';
  let editor_isDirty = false;

  console.log('[UNIT-EDITOR-TRACE] Initial mount:');
  console.log(`  props.unit.id = "${editor_unitProp.id}"`);
  console.log(`  local conceptTheory snippet = "${editor_conceptTheory.slice(0, 45).replace(/\n/g, ' ')}..."`);
  console.log(`  STATE TRANSITION: INITIAL = OLD CONTENT`);
  console.log(`  [OLD -> OLD]`);

  // ============================================================================
  // STEP 2 & 3: SELECT ALL EXISTING READING CONTENT & DELETE IT
  // ============================================================================
  console.log('\n--------------------------------------------------------------------------------');
  console.log('STEP 2 & 3: Select all existing reading content & Delete it');
  console.log('--------------------------------------------------------------------------------');

  // User deletes content in textarea: onChange fires with ''
  editor_conceptTheory = '';
  editor_isDirty = true;

  console.log('[UNIT-EDITOR-TRACE] onChange (after delete):');
  console.log(`  local conceptTheory = "${editor_conceptTheory}" (empty string)`);
  console.log(`  isDirty = ${editor_isDirty}`);
  console.log(`  props.unit.readingContent = still OLD CONTENT (length: ${editor_unitProp.readingContent?.length})`);
  console.log(`  STATE TRANSITION: [OLD -> EMPTY]`);

  // ============================================================================
  // STEP 4: PASTE NEW_MANUAL_CONTENT_2026
  // ============================================================================
  console.log('\n--------------------------------------------------------------------------------');
  console.log('STEP 4: Paste NEW_MANUAL_CONTENT_2026');
  console.log('--------------------------------------------------------------------------------');

  // User pastes new content: onChange fires with NEW_CONTENT
  editor_conceptTheory = NEW_CONTENT;
  editor_isDirty = true;

  console.log('[UNIT-EDITOR-TRACE] onChange (after paste):');
  console.log(`  local conceptTheory = "${editor_conceptTheory}"`);
  console.log(`  isDirty = ${editor_isDirty}`);
  console.log(`  STATE TRANSITION: [EMPTY -> NEW] => "${NEW_CONTENT}"`);

  // ============================================================================
  // STEP 5 & 6: WAIT WITHOUT SAVING & CLICK ELSEWHERE / CHANGE FOCUS
  // ============================================================================
  console.log('\n--------------------------------------------------------------------------------');
  console.log('STEP 5 & 6: Wait without saving & Click elsewhere / change focus');
  console.log('--------------------------------------------------------------------------------');

  console.log('[CHECK] What happens if parent re-renders while editor is dirty before saving?');
  console.log('  In UnitContentEditor.tsx (lines 125-144):');
  console.log('  useEffect(() => {');
  console.log('    if (unit) {');
  console.log('      setConceptTheory(unit.conceptTheory || unit.readingContent || "");');
  console.log('      setIsDirty(false);');
  console.log('    }');
  console.log('  }, [unit]);');

  // Simulating parent re-render passing activeUnit prop reference
  // Case A: If parent re-creates activeUnit object reference (e.g. from parent re-render or context update)
  const simulatedNewUnitPropReference = JSON.parse(JSON.stringify(activeUnit)); // activeUnit in parent still has OLD content!
  
  console.log('\n  [VULNERABILITY POINT 1: UnitContentEditor.tsx:L125-144]');
  console.log(`  If props.unit reference changes in parent before Save:`);
  console.log(`  props.unit.readingContent has OLD CONTENT (length: ${simulatedNewUnitPropReference.readingContent.length})`);
  console.log(`  local editor state was: "${editor_conceptTheory}"`);
  
  // If the useEffect fires:
  const overwrittenValue = simulatedNewUnitPropReference.conceptTheory || simulatedNewUnitPropReference.readingContent || '';
  console.log(`  EFFECT OVERWRITES local editor state with: "${overwrittenValue.slice(0, 40).replace(/\n/g, ' ')}..."`);
  console.log(`  STATE TRANSITION: [NEW -> OLD] via UnitContentEditor.tsx:useEffect([unit])`);

  // ============================================================================
  // STEP 7: SAVE DRAFT (Assuming user saves successfully without premature effect)
  // ============================================================================
  console.log('\n--------------------------------------------------------------------------------');
  console.log('STEP 7: Save Draft (handleSave(true))');
  console.log('--------------------------------------------------------------------------------');

  const compiledLessonContent = editor_conceptTheory.trim();
  const updatedUnit: LearningUnitItem = {
    ...editor_unitProp,
    id: editor_unitProp.id,
    title: editor_title.trim(),
    readingContent: compiledLessonContent,
    conceptTheory: editor_conceptTheory.trim(),
    isDraft: true,
    lastSavedAt: new Date().toISOString()
  };

  console.log('[UNIT-EDITOR-TRACE] handleSave(true) executed:');
  console.log(`  updatedUnit.id = "${updatedUnit.id}"`);
  console.log(`  updatedUnit.readingContent = "${updatedUnit.readingContent}"`);
  console.log(`  updatedUnit.conceptTheory = "${updatedUnit.conceptTheory}"`);
  console.log(`  updatedUnit.isDraft = ${updatedUnit.isDraft}`);

  // AdminCourseDetails onSave
  modules = modules.map(m => ({
    ...m,
    topics: m.topics.map(t => ({
      ...t,
      learningUnits: t.learningUnits.map(u => u.id === updatedUnit.id ? updatedUnit : u)
    }))
  }));

  console.log('\n[ADMIN-DETAILS-TRACE] onSave updated modules array:');
  const savedUnitInModules = modules[0].topics[0].learningUnits.find(u => u.id === TARGET_UNIT_ID)!;
  console.log(`  modules[0].topics[0].learningUnits[0].readingContent = "${savedUnitInModules.readingContent}"`);
  console.log(`  STATE TRANSITION: [NEW -> NEW]`);

  // CourseContext updateCourse
  let courseContextCourses: CourseItem[] = [
    {
      id: TARGET_COURSE_ID,
      title: 'Git & GitHub Mastery',
      modules: modules
    }
  ];
  let localStorageMock: Record<string, string> = {
    'shaivika_courses_data': JSON.stringify(courseContextCourses)
  };

  console.log('\n[COURSE-CONTEXT-TRACE] updateCourse called & written to localStorage:');
  console.log(`  localStorage["shaivika_courses_data"] updated.`);
  console.log(`  STATE TRANSITION: [NEW -> NEW]`);

  // ============================================================================
  // STEP 8, 9, 10, 11: NAVIGATE AWAY, COME BACK, REFRESH, REOPEN
  // ============================================================================
  console.log('\n--------------------------------------------------------------------------------');
  console.log('STEP 8, 9, 10, 11: Navigate away, Refresh page, Reopen course');
  console.log('--------------------------------------------------------------------------------');

  // Let's trace CourseContext initialization and refreshCourses on page reload:
  console.log('\n[PHASE 1: CourseProvider Mount & LocalStorage Parsing]');
  const rawLocal = JSON.parse(localStorageMock['shaivika_courses_data']);
  const unitInLocalStorage = rawLocal[0].modules[0].topics[0].learningUnits.find((u: any) => u.id === TARGET_UNIT_ID);
  console.log(`  Unit readingContent in LocalStorage on reload = "${unitInLocalStorage.readingContent}"`);
  console.log(`  STATE TRANSITION: [NEW -> NEW]`);

  console.log('\n[PHASE 2: refreshCourses() execution]');
  console.log('  CourseContext.tsx lines 1076-1094:');
  console.log('  const loadedResult = await courseService.getCourses();');
  console.log('  const loaded = loadedResult.courses;');
  console.log('  merged = sanitizeCourseList([...localList, ...normalized]);');

  // Inspect sanitizeCourseList behavior
  console.log('\n  [VULNERABILITY POINT 2: CourseContext.tsx:L761-785 in sanitizeCourseList]');
  console.log('  Let us trace sanitizeCourseList when localList has NEW content and API/default has course data:');

  // Suppose API returns courses array from Firestore:
  const apiCourseFromFirestore = {
    id: 'git-github-mastery-course-id',
    title: 'Git & GitHub Mastery',
    modules: gitCourseModules // If Firestore had initial/seeded modules with OLD content
  };

  const localCourseFromStorage = rawLocal[0]; // Has NEW_MANUAL_CONTENT_2026

  // Trace the loop inside sanitizeCourseList:
  const map = new Map<string, any>();
  const listToSanitize = [localCourseFromStorage, apiCourseFromFirestore];

  listToSanitize.forEach((c) => {
    const title = (c.title || '').toLowerCase();
    if (title.includes('git & github') || String(c.id).includes('git-github-mastery')) {
      const key = 'git-github-mastery';
      const existingInMap = map.get(key);
      const effectiveModules = (c.modules && c.modules.length > 0)
        ? c.modules
        : (existingInMap?.modules && existingInMap.modules.length > 0 ? existingInMap.modules : []);
      
      console.log(`    Iterating course ID="${c.id}":`);
      console.log(`      existingInMap before = ${existingInMap ? 'EXISTS (unit content: ' + existingInMap.modules[0].topics[0].learningUnits[0].readingContent + ')' : 'NULL'}`);
      console.log(`      incoming c.modules[0] unit content = "${c.modules[0].topics[0].learningUnits[0].readingContent.slice(0, 30).replace(/\n/g, ' ')}..."`);
      console.log(`      effectiveModules selected = "${effectiveModules[0].topics[0].learningUnits[0].readingContent.slice(0, 30).replace(/\n/g, ' ')}..."`);
      
      map.set(key, {
        ...c,
        id: 'git-github-mastery',
        modules: effectiveModules
      });
    }
  });

  const finalSanitizedCourse = map.get('git-github-mastery');
  const finalUnitContent = finalSanitizedCourse.modules[0].topics[0].learningUnits[0].readingContent;
  console.log(`\n  Final result in CourseContext after sanitizeCourseList:`);
  console.log(`    readingContent = "${finalUnitContent.slice(0, 45).replace(/\n/g, ' ')}..."`);
  if (finalUnitContent !== NEW_CONTENT) {
    console.log(`    STATE TRANSITION: [NEW -> OLD] via CourseContext.tsx:sanitizeCourseList (Line 771-774)`);
  }

  console.log('\n  [VULNERABILITY POINT 3: AdminCourseDetails.tsx:L160-174]');
  console.log('  If course.modules in CourseContext is empty ([]) when AdminCourseDetails loads:');
  console.log('  useEffect(() => {');
  console.log('    if (course?.modules && course.modules.length > 0) {');
  console.log('      setModules(course.modules);');
  console.log('    } else if (course?.id) {');
  console.log('      loadStaticCourseModules(course.id).then((mods) => { setModules(mods); });');
  console.log('    }');
  console.log('  }, [course]);');
  console.log('  loadStaticCourseModules("git-github-mastery") imports gitCourseFullData.ts with OLD content!');
  console.log('  STATE TRANSITION: [EMPTY -> OLD] via loadStaticCourseModules');

  console.log('\n================================================================================');
  console.log('                           SUMMARY OF ROOT CAUSES                               ');
  console.log('================================================================================');
}

runTrace().catch(console.error);
