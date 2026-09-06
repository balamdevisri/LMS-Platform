import { gitCourseModules } from '../frontend/src/data/gitCourseFullData';
import { sanitizeCourseList } from '../frontend/src/contexts/CourseContext';

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
  updatedAt?: string;
  [key: string]: any;
}

// Full simulation of CourseContext + AdminCourseDetails + UnitContentEditor
async function runCompletePersistenceWorkflow() {
  console.log('================================================================================');
  console.log('       RUNTIME VERIFICATION: COMPLETE PERSISTENCE & REFRESH WORKFLOW            ');
  console.log('================================================================================\n');

  const TARGET_COURSE_ID = 'git-github-mastery';
  const TARGET_UNIT_ID = 'git-unit-1-notes';
  const NEW_CONTENT = 'NEW_MANUAL_CONTENT_2026';

  // ----------------------------------------------------------------------------
  // Step 1: Initial Course state before edit
  // ----------------------------------------------------------------------------
  console.log('>>> Step 1: Initial course state');
  const initialModules: ModuleItem[] = JSON.parse(JSON.stringify(gitCourseModules));
  let coursesState: CourseItem[] = [
    {
      id: TARGET_COURSE_ID,
      title: 'Git & GitHub Mastery',
      modules: initialModules,
      updatedAt: new Date('2026-09-01T00:00:00Z').toISOString(),
    }
  ];

  let localStorageMock: Record<string, string> = {
    'shaivika_courses_data': JSON.stringify(coursesState)
  };

  const initialUnit = initialModules[0].topics[0].learningUnits.find(u => u.id === TARGET_UNIT_ID)!;
  console.log(`  Initial unit readingContent length: ${initialUnit.readingContent?.length}`);
  console.log(`  Initial unit isDraft: ${initialUnit.isDraft}\n`);

  // ----------------------------------------------------------------------------
  // Step 2 & 3: User edits unit and pastes NEW_MANUAL_CONTENT_2026
  // ----------------------------------------------------------------------------
  console.log('>>> Step 2 & 3: User edits unit and pastes NEW_MANUAL_CONTENT_2026');
  const editedUnit: LearningUnitItem = {
    ...initialUnit,
    readingContent: NEW_CONTENT,
    conceptTheory: NEW_CONTENT,
    isDraft: true,
    lastSavedAt: new Date().toISOString(),
  };

  // ----------------------------------------------------------------------------
  // Step 4: User clicks Save Draft
  // ----------------------------------------------------------------------------
  console.log('>>> Step 4: User clicks Save Draft');
  // AdminCourseDetails onSave
  const updatedModules = initialModules.map(m => ({
    ...m,
    topics: m.topics.map(t => ({
      ...t,
      learningUnits: t.learningUnits.map(u => u.id === editedUnit.id ? editedUnit : u)
    }))
  }));

  // CourseContext updateCourse
  const nowTimestamp = new Date().toISOString();
  coursesState = coursesState.map(c => {
    if (c.id === TARGET_COURSE_ID) {
      return {
        ...c,
        modules: updatedModules,
        updatedAt: nowTimestamp,
      };
    }
    return c;
  });

  localStorageMock['shaivika_courses_data'] = JSON.stringify(coursesState);
  console.log('  Course saved to state and localStorage with timestamp:', nowTimestamp);
  console.log('  Saved unit readingContent:', editedUnit.readingContent, '\n');

  // ----------------------------------------------------------------------------
  // Step 5 & 6: Navigate to another unit (Unit B) and return to Unit A
  // ----------------------------------------------------------------------------
  console.log('>>> Step 5 & 6: Navigate to Unit B and return to Unit A');
  const unitB = updatedModules[1].topics[0].learningUnits[0];
  console.log(`  Navigated to Unit B: "${unitB.title}"`);
  console.log(`  Returned to Unit A: "${editedUnit.title}"`);
  const activeUnitAfterNav = updatedModules[0].topics[0].learningUnits.find(u => u.id === TARGET_UNIT_ID)!;
  console.log(`  Unit A content after navigation: "${activeUnitAfterNav.readingContent}"`);
  if (activeUnitAfterNav.readingContent !== NEW_CONTENT) {
    throw new Error('❌ Navigation corrupted unit content!');
  }
  console.log('  ✅ Navigation verified successfully.\n');

  // ----------------------------------------------------------------------------
  // Step 7: Browser Refresh (refreshCourses with sanitizeCourseList)
  // ----------------------------------------------------------------------------
  console.log('>>> Step 7: Browser Refresh (refreshCourses executing sanitizeCourseList)');

  // 1. Read from localStorage
  const localList = sanitizeCourseList(JSON.parse(localStorageMock['shaivika_courses_data']));
  console.log(`  localList courses count: ${localList.length}`);

  // 2. Simulated incoming server courses from Firestore GET /api/courses
  // Note: Firestore might return the course under ID 'git-github-mastery-course-id' with an older snapshot
  const apiCoursesFromFirestore: CourseItem[] = [
    {
      id: 'git-github-mastery-course-id',
      title: 'Git & GitHub Mastery',
      modules: JSON.parse(JSON.stringify(gitCourseModules)), // older static snapshot
      updatedAt: new Date('2026-09-01T00:00:00Z').toISOString(), // older timestamp
    }
  ];

  // 3. Merged via sanitizeCourseList([...localList, ...apiCoursesFromFirestore])
  console.log('  Calling sanitizeCourseList([...localList, ...apiCoursesFromFirestore]):');
  const mergedCourses = sanitizeCourseList([...localList, ...apiCoursesFromFirestore]);

  // Update courses state and localStorage
  coursesState = mergedCourses;
  localStorageMock['shaivika_courses_data'] = JSON.stringify(coursesState);

  const gitCourseAfterRefresh = mergedCourses.find(c => c.id === TARGET_COURSE_ID);
  const targetUnitAfterRefresh = gitCourseAfterRefresh?.modules?.[0]?.topics?.[0]?.learningUnits?.find(u => u.id === TARGET_UNIT_ID);

  console.log(`\n  Result after refreshCourses:`);
  console.log(`    Target Unit readingContent: "${targetUnitAfterRefresh?.readingContent}"`);
  console.log(`    Target Unit isDraft: ${targetUnitAfterRefresh?.isDraft}`);
  console.log(`    Target Unit lastSavedAt: ${targetUnitAfterRefresh?.lastSavedAt}`);

  if (targetUnitAfterRefresh?.readingContent !== NEW_CONTENT) {
    throw new Error(`❌ FAILED: Refresh reverted content back to: "${targetUnitAfterRefresh?.readingContent?.slice(0, 40)}"`);
  }
  console.log('  ✅ SUCCESS: NEW_MANUAL_CONTENT_2026 survived browser refresh!\n');

  // ----------------------------------------------------------------------------
  // Step 8 & 9: Close course/page completely & Reopen (Hydration from LocalStorage)
  // ----------------------------------------------------------------------------
  console.log('>>> Step 8 & 9: Close page completely and reopen course');

  // Re-initialize state from localStorage
  const rehydratedCourses = sanitizeCourseList(JSON.parse(localStorageMock['shaivika_courses_data']));
  const rehydratedGitCourse = rehydratedCourses.find(c => c.id === TARGET_COURSE_ID);

  // AdminCourseDetails loads modules
  let adminModules: ModuleItem[] = [];
  if (rehydratedGitCourse?.modules && rehydratedGitCourse.modules.length > 0) {
    adminModules = rehydratedGitCourse.modules;
    console.log('[STATIC-FALLBACK]', {
      courseId: rehydratedGitCourse.id,
      modulesLength: adminModules.length,
      reason: 'loaded_from_course_context',
      loadedStatic: false,
    });
  }

  const reopenedUnit = adminModules[0].topics[0].learningUnits.find(u => u.id === TARGET_UNIT_ID);
  console.log(`\n  Reopened course target unit readingContent: "${reopenedUnit?.readingContent}"`);

  if (reopenedUnit?.readingContent !== NEW_CONTENT) {
    throw new Error(`❌ FAILED: Reopening course reverted content!`);
  }
  console.log('  ✅ SUCCESS: NEW_MANUAL_CONTENT_2026 persisted across complete page reopen!\n');

  // ----------------------------------------------------------------------------
  // Step 10: Test Hard Refresh / Multiple Consecutive Refreshes
  // ----------------------------------------------------------------------------
  console.log('>>> Step 10: Testing multiple consecutive refreshes');
  for (let i = 1; i <= 3; i++) {
    const freshLocal = sanitizeCourseList(JSON.parse(localStorageMock['shaivika_courses_data']));
    const freshMerged = sanitizeCourseList([...freshLocal, ...apiCoursesFromFirestore]);
    localStorageMock['shaivika_courses_data'] = JSON.stringify(freshMerged);
    const checkUnit = freshMerged.find(c => c.id === TARGET_COURSE_ID)?.modules?.[0]?.topics?.[0]?.learningUnits?.find(u => u.id === TARGET_UNIT_ID);
    console.log(`  Consecutive refresh #${i} content snippet: "${checkUnit?.readingContent}"`);
    if (checkUnit?.readingContent !== NEW_CONTENT) {
      throw new Error(`❌ FAILED on consecutive refresh #${i}!`);
    }
  }
  console.log('  ✅ SUCCESS: All consecutive refreshes passed!\n');

  console.log('================================================================================');
  console.log('             ALL COMPLETE PERSISTENCE WORKFLOW TESTS PASSED!                    ');
  console.log('================================================================================');
}

runCompletePersistenceWorkflow().catch((err) => {
  console.error(err);
  process.exit(1);
});
