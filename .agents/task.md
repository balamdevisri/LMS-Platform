# Tasks

- [x] Create course-specific terminal sandbox components
  - [x] Implement `SQLPracticeTerminal.tsx` with schema visualization & in-memory JS database simulator
  - [x] Implement `PythonInterpreterTerminal.tsx` with interactive Python shell simulation
  - [x] Implement `JavaConsoleTerminal.tsx` with Java source compilation/running simulation
  - [x] Implement `ReactPlaygroundTerminal.tsx` with live rendering of edited component code
- [x] Integrate terminals dynamically in `Terminal.tsx`
- [x] Remove hardcoded paths & adapt `InCourseLearningView.tsx` to load active course lesson data dynamically
- [x] Update `LessonViewer.tsx` to dynamically generate & display Core Study Guide, Key Takeaways, and AI Concept Breakdown from active lesson content
- [x] Update `RightSidebar.tsx` to dynamically load resources and downloads
- [x] Modify `AITutorDrawer.tsx` to dynamically handle questions based on active lesson content, avoiding hardcoded Linux/Git defaults
- [x] Refactor `quizEngine.ts` to dynamically generate quiz questions based *only* on the active lesson's title and content
- [x] Compile and verify the build
- [x] Remove "AI Tutor Insights & Revisions" and "AI Semantic Course Search" widgets from the student dashboard
- [x] Fix and optimize scrolling in course learning views on mobile devices
