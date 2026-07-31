# Quiz System Design Document

## 1. Overview

A quiz builder web application for creating category-based quizzes with questions focused on Slovakia but covering multiple knowledge domains. The app runs as a static site on GitHub Pages, with users building quizzes in the browser and exporting them as markdown files.

## 2. Architecture

### 2.1 Tech Stack

- **Astro** (static mode) — site framework, no adapter, no server runtime
- **React/TypeScript** — interactive components via islands
- **IndexedDB** — persistent quiz sessions (localStorage has 5MB cap, IndexedDB has ~50MB+)
- **html2pdf.js** — client-side PDF generation (~300KB minified)

### 2.2 File Structure

```
quiz/
├── questions/
│   ├── geography/
│   │   └── questions.json               # Structured JSON: all geography questions
│   ├── history/
│   │   └── questions.json
│   └── ...
├── dates/
│   └── 2024-08-01/
│       └── quiz.md                       # Generated quiz (commit & push updates History tab)
├── astro-site/
│   ├── astro.config.mjs                 # Astro config with React integration
│   ├── package.json                     # Runtime dependencies + dev deps
│   ├── src/
│   │   ├── config/colors.ts             # Design tokens
│   │   ├── data/
│   │   │   ├── questions.ts             # Parse JSON files → questionIndex (build-time)
│   │   │   └── categories.ts            # Derive categories from questions/ dirs (build-time)
│   │   ├── types/question.ts            # TypeScript interfaces
│   │   ├── stores/quizStore.ts          # IndexedDB-backed quiz state
│   │   ├── components/
│   │   │   ├── LibraryView.astro        # Tab 1: browse question bank
│   │   │   ├── BuilderView.astro        # Tab 2: build quiz, export
│   │   │   ├── PreviewView.astro        # Tab 3: render markdown, PDF export
│   │   │   ├── HistoryView.astro        # Tab 4: view past quizzes (from committed dates/)
│   │   │   └── Navigation.astro         # Tab bar
│   │   └── pages/index.astro            # SPA router, 4 tabs (hash-based)
│   └── public/app.css
├── .github/workflows/deploy.yml
└── README.md
```

### 2.3 Data Flow

```
┌─────────────────┐      ┌──────────────┐      ┌─────────────┐
│  questions/     │      │  astro build │      │  dates/     │
│  *.json         │─────▶│  (build)     │─────▶│  *.md       │
│  (mutable)      │      │  embed data  │      │  (immutable │
└─────────────────┘      └──────────────┘      │  history)   │
     ▲                                        └─────────────┘
     │                                                 ▲
     │                  ┌──────────────┐               │
     │                  │  GitHub Pages│               │
     │                  │  (static)    │               │
     │                  └──────────────┘               │
     │                       ▲           │              │
     │                       │           │              │
     │                       │           │              │
     │                       │           │              │
     │                       ▼           │              │
     │      ┌───────────────────────┐    │              │
     │      │  IndexedDB            │    │              │
     │      │  (quiz sessions)      │    │              │
     │      │  user's browser       │    │              │
     │      └───────────────────────┘    │              │
     │           ▲                       │              │
     │           │                       │              │
     │           │                       │              │
     │           ▼                       │              │
     │  ┌─────────────────┐              │              │
     │  │  User Action     │              │              │
     │  │  export / download│              │              │
     │  └─────────────────┘              │              │
     │                                   │              │
     │                                   ▼              │
     │                           dates/{date}/quiz.md   │
     │                           (commit & push)        │
     └─────────────────────────────────────────────────┘
```

**Key workflow:**
1. User creates quiz in Builder tab → IndexedDB (persists locally)
2. User clicks Export/Download → downloads `quiz-YYYY-MM-DD.md`
3. User moves file to `dates/2024-08-01/quiz.md` and commits to git
4. Push to main triggers build → History tab includes the quiz

### 2.2.1 Astro Config

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
});
```
- Uses React islands integration for interactive tab views
- Static output mode (no adapter, no server runtime)

### 2.2.2 Tab Routing

Hash-based routing (`#library`, `#builder`, `#preview`, `#history`). Works in static sites, no server needed. Astro renders all 4 views on one page; JS visibility toggling per hash. Browser URL and back-button work naturally.

### 2.2.3 Dependencies

| Package | Purpose |
|---------|---------|
| `astro` | Static site framework |
| `@astrojs/react` | React islands integration |
| `react`, `react-dom` | UI library |
| `marked` (v5) | Client-side markdown rendering |
| `idb` | IndexedDB wrapper (800 bytes) |
| `html2pdf.js` | Client-side PDF generation |
| `@types/react`, `@types/react-dom` | TypeScript types |

## 3. Interfaces

### 3.1 Question JSON (input)

```json
{
  "category": "geography",
  "questions": [
    {
      "id": "geo_q1",
      "type": "multiple_choice",
      "difficulty": "intermediate",
      "question": "What is the longest river in Slovakia?",
      "options": ["Dunaj", "Váh", "Hron", "Nitra"],
      "answer": "Váh",
      "notes": "Váh is 403 km, the longest entirely within Slovakia."
    },
    {
      "id": "geo_q2",
      "type": "write_in",
      "difficulty": "intermediate",
      "question": "In which year did the Velvet Revolution take place?",
      "answer": "1989",
      "notes": "November–December 1989."
    }
  ]
}
```

**Fields:**
- `category` (string): folder name (e.g., `geography`, `history`)
- `questions` (array): list of question objects
- `question[].id` (string): globally unique identifier (validated at build time)
- `question[].type` (string): `"multiple_choice"` or `"write_in"`
- `question[].difficulty` (string): `"beginner"`, `"intermediate"`, `"advanced"`
- `question[].question` (string): the question text
- `question[].options` (array, optional for `multiple_choice` only): list of answer options
- `question[].answer` (string): the correct answer
- `question[].notes` (string, optional): additional context

### 3.2 Questions Directory Structure

Each category folder contains one `questions.json` file:
```
questions/
├── geography/
│   └── questions.json
├── history/
│   └── questions.json
├── science/
│   └── questions.json
└── culture/
    └── questions.json
```

### 3.3 Quiz Markdown (output)

```markdown
# Quiz — 2024-08-01
- **Date:** 2024-08-01
- **Total Questions:** 25

## Geography
### Q1
- **Type:** multiple_choice
- **Difficulty:** intermediate
- **Question:** What is the longest river in Slovakia?
  - A) Dunaj
  - B) Váh
  - C) Hron
  - D) Nitra
- **Answer:** B) Váh
- **Notes:** Váh is 403 km.

## History
### Q2
- **Type:** write_in
- **Difficulty:** intermediate
- **Question:** In which year did the Velvet Revolution take place?
- **Answer:** 1989
- **Notes:** November–December 1989.
```

### 3.4 IndexedDB (quiz sessions)

IndexedDB is used instead of localStorage because:
- localStorage has a ~5MB cap; IndexedDB has ~50MB+
- For small quiz banks (~200 questions max), localStorage might suffice but IndexedDB won't fail silently
- IndexedDB supports structured clone (objects, arrays) natively

**IndexedDB Schema:**
```ts
interface QuizSession {
  id: string;           // "2024-08-01" (user-specified date/name)
  name: string;         // human-readable name (e.g., "Mid-August Pop Quiz")
  questions: QuestionRef[];
  createdAt: number;
  updatedAt: number;
}

interface QuestionRef {
  id: string;           // e.g., "geo_q1"
  originalData: Question; // snapshot of question as stored when selected
  order: number;        // display order in quiz
}
```

**localStorage key (fallback if IndexedDB unavailable):**
```
quiz_sessions: JSON string of Map<sessionId, QuizSession>
```

### 3.5 quizStore Interface (stores/quizStore.ts)

Abstracts IndexedDB via the `idb` wrapper (800 bytes). Provides Promise-based API:

```ts
interface QuizStore {
  saveSession(session: QuizSession): Promise<void>;
  getSession(id: string): Promise<QuizSession | null>;
  getAllSessions(): Promise<QuizSession[]>;
  deleteSession(id: string): Promise<void>;
  addQuestionToSession(sessionId: string, question: QuestionRef, order: number): Promise<void>;
  reorderQuestions(sessionId: string, questionIds: string[]): Promise<void>;
  removeQuestionFromSession(sessionId: string, questionId: string): Promise<void>;
}
```

## 4. UI Tabs

### 4.1 Library Tab

Purpose: Browse the question bank to see what's available.

Components:
- `CategorySidebar` (desktop): Collapsible tree — categories → questions list. Click category → see questions.
- `CategoryBreakdown` (mobile): Select category from dropdown or tap-to-navigate (master-detail).
- `QuestionCard`: Shows question preview (type icon, first ~50 characters of question), answer (truncated), usage count.
- `QuestionCounters`: Total questions per category, total across all categories (built at build time).

Behavior:
- Static data loaded from `questions/**/*.json` at build time
- No edit, add, or delete capabilities (immutable source of truth in files)

### 4.2 Builder Tab

Purpose: Build a quiz session by selecting, arranging, and exporting questions.

Components:
- `QuestionQueue` (desktop right panel, mobile bottom section): Selected questions in order, draggable to reorder (desktop), tap to reorder (mobile).
- `DateInput`: Native `<input type="date">` (zero deps). ISO format: YYYY-MM-DD. Default: tomorrow.
- `SessionManager`: Name quiz, save (to IndexedDB), load existing session, delete session.
- `PreviewInline`: Live preview of selected questions as they're added (markdown preview).
- `ExportActions`:
  - "Download .md" button → generates markdown, triggers browser download
  - "Copy to Clipboard" button → copies markdown to clipboard, shows success toast
  - "Export PDF" button → generates PDF via html2pdf.js, triggers download
- `InfoBanner` (post-export): After export, shows "What's next?" steps clearly.
  ```
  ✅ Quiz export successful!
  Next:
    1. Move file to: dates/2024-08-01/quiz.md
    2. git add dates/ && git commit -m "Quiz quiz"
    3. git push
  [Copy Path] [Got it!]
  ```
- `MobileNav`: Collapsible drawer on mobile (instead of sidebar), bottom sticky export bar.

Behavior:
- All state managed client-side in IndexedDB
- Build-time validation catches issues before they reach users
- Drag-to-reorder on desktop with native sortable library (e.g., `@dnd-kit/core` or similar)
- Tap-to-select on mobile (no drag)

### 4.3 Preview Tab

Purpose: Render a quiz in human-readable format (from pasted/loaded content).

Components:
- `MarkdownRenderer`: Client-side markdown-to-HTML using `marked` (v5, tree-sitter-based, fast).
- `PDFExport`: Button to download current view as PDF via html2pdf.js.
- `AddToBuilder`: Button to add current preview to Builder tab.

Behavior:
- User can paste markdown or upload `.md` file
- Renders in side-by-side (desktop) or stacked (mobile) layout
- "Add to Builder" parses markdown → returns to Builder tab

### 4.4 History Tab

Purpose: View past quizzes that have been committed to the repo.

Components:
- `QuizList`: Chronological list of quizzes from `dates/**/*.md`
- `QuizRow`: Date, question count, "View" button
- `QuizViewer`: Full view of a past quiz (rendered markdown).

Behavior:
- Built at build time: uses Astro `Astro.glob('dates/**/*.md')` to read all files and embed content at build time. No API route needed.
```ts
// In HistoryView.astro (client-side)
import.meta.glob('dates/**/*.md', { query: '?raw' })
// → each file's markdown content available at runtime
```
- Historical record is immutable.

## 5. Color Palette & Design

### 5.1 Design Tokens

```ts
// src/config/colors.ts
export const colors = {
  primary: '#813405',       // Burgundy / deep brown
  secondary: '#d45113',     // Orange-red
  highlight: '#f9a03f',     // Gold / warm amber
  light: '#f8dda4',         // Cream / warm pale yellow
  lightest: '#ddf9c1',      // Pale green
  text: '#1e1e1e',          // Near-black
  border: '#d4c5a9',        // Warm gray-tan
  background: '#fdfbf5',    // Off-white (generated)
  surface: '#ffffff',       // Cards
  surfaceElevated: '#f5f2e8', // Elevated cards
  success: '#5a9e5a',       // Green (for export success, etc.)
  warning: '#f9a03f',       // Gold
  error: '#d45113',         // Orange-red
  muted: '#6a6a6a',         // Secondary text
}
```

### 5.2 Design Principles (post-taste-guideline integration)

- Clean, warm, editorial aesthetic — no gradients, clean typography
- Generous spacing, clear hierarchy
- Card-based layout with subtle elevation
- Responsive: mobile-first approach, 44px minimum touch targets
- Accessibility: WCAG AA contrast ratios, keyboard navigation support

## 6. Validation & Error Handling

### 6.1 Unique ID Validation (at build time)

During `astro build`:
1. Parse all `questions/**/*.json` files
2. Collect all `id` fields from all questions
3. Validate uniqueness — if any ID appears in multiple files, fail build
4. Error message: `Build failed: Duplicate question ID 'geo_q1' found in questions/geography/questions.json and questions/history/questions.json`

### 6.2 JSON Validation

At build time:
- Each `questions/**/*.json` must be valid JSON (fail build if not)
- Each JSON must have `category` and `questions` fields
- Each question must have at least: `id`, `question`, `type`, `answer`

In CI (via GitHub workflow):
```yaml
- name: Validate JSON structure
  run: |
    jq . questions/**/*.json > /dev/null
    jq -e '.id and .question and .type and .answer' questions/**/*.json > /dev/null
```

At load time (UI):
- If IndexedDB load fails (corrupted data), show error and clear cache
- If question ID not found in Builder tab, handle gracefully (show placeholder)

### 6.3 Error States

| Scenario | UI Handler |
|----------|-----------|
| JSON parse error | Fail build, clear error message shows filename and reason |
| Duplicate ID | Fail build, shows which ID and files are affected |
| Missing `questions/` folder | Build fails, clear error message |
| IndexedDB error | Show "Offline mode" fallback, suggest localStorage or manual backup |
| Clipboard API unavailable (non-HTTPS, old browsers) | Fallback: download file instead of copy |
| html2pdf.js fails during generation | Show error toast, offer to copy markdown instead |

## 7. Mobile UX

### 7.1 Navigation

| Mode | Implementation |
|------|---------------|
| Desktop (≥1024px) | Horizontal tabs with 4 columns, left sidebar for Library |
| Tablet (768-1023px) | Horizontal tabs, full-width content, Library as collapsible drawer |
| Mobile (<768px) | Horizontal scrollable tabs, bottom sticky navigation, master-detail for Library |

### 7.2 Selection

| Mode | Implementation |
|------|---------------|
| Desktop | Drag-and-drop — use sortable library (e.g., `@dnd-kit/core`) |
| Mobile | Tap-to-select (add to queue), long-press to reorder via drag handles |
| Touch | 44px minimum touch targets, swipe to move between tabs |

### 7.3 Layout

- Library: master-detail pattern, single column, tap category → expand questions below
- Builder: full-width question queue, date picker at top, export bar at bottom (sticky)
- Preview: single column, full width, scrollable content
- History: list view, tap to view, swipe to delete (optional)

## 8. GitHub Pages Deployment

### 8.1 Deploy Workflow

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
    paths: ['astro-site/**']

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  validate-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Validate JSON structure
        run: |
          find questions -name "questions.json" | while read file; do
            jq . "$file" > /dev/null || { echo "Invalid JSON: $file"; exit 1; }
            jq -e '.id and .question and .type and .answer' "$file" > /dev/null || { echo "Missing required fields in: $file"; exit 1; }
          done

      - name: Validate unique IDs
        run: |
          find questions -name "questions.json" -exec jq -r '.questions[].id' {} \; | sort | uniq -d | if read dup; then
            echo "Duplicate question ID found: $dup"
            exit 1
          fi

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm ci
        working-directory: astro-site

      - name: Build
        run: npx astro build
        working-directory: astro-site

      - uses: actions/upload-pages-artifact@v3
        with:
          path: astro-site/dist/

      - uses: actions/deploy-pages@v4
```

### 8.2 Manual Deployment

```bash
cd astro-site && npm run build
# Preview locally: npx astro dev
# Commit: git add . && git commit -m "Deploy update" && git push origin main
# GitHub action auto-deploys to GitHub Pages
```

## 9. Implementation Phases

| # | Phase | Deliverables | Verify |
|---|-------|-------------|--------|
| 1 | **Foundation** | Astro project setup, color tokens, index.astro, 4-tab navigation, mobile CSS | `npm run dev` works, tabs switch, mobile responsive |
| 2 | **Data Layer** | JSON parser, IndexedDB store, build-time ID validation | Can load questions, add/remove/reorder in store, validate JSON, catch duplicate IDs |
| 3 | **Library Tab** | Category tree/breakdown, question cards, read-only browsing | Shows all questions, categories correct, counts accurate |
| 4 | **Builder Tab** | Question queue, inline preview, drag-to-reorder, tap-to-add, copy-to-clipboard + download | Adds/removes/reorders correctly, both export options work |
| 5 | **Export/Preview** | Markdown rendering, info banner after export, PDF via html2pdf.js | Generates correct markdown, PDF downloads, tip shows post-export |
| 6 | **History Tab** | Build-time `dates/` parsing, quiz rendering (client-side markdown → HTML) | Shows committed quizzes, renders markdown correctly |
| 7 | **Mobile First** | Master-detail layout, tap-to-select, 44px touch targets, bottom sticky actions | Touch-friendly, no broken layouts at ≤768px |
| 8 | **README** | Document export→commit workflow, quickstart guide, contributing guide | Anyone can follow steps, README covers all use cases |
| 9 | **CI/CD** | Deploy workflow, JSON validation + ID check in CI, sample questions | Push to main → auto-deploy succeeds, fails on invalid JSON |
| 10 | **Polish** | Taste-guided design polish, loading states, error states, transitions | UI feels professional, smooth interactions |

## 10. Assumptions

1. **User is comfortable with git** — they need to commit files to `dates/` manually. This is a design choice: static hosting means no server-side file writes.
2. **IndexedDB is better than localStorage** — for quiz banks >200 questions, localStorage risks hitting the ~5MB limit silently.
3. **GitHub Pages is sufficient hosting** — no server runtime needed, free forever, easy git workflow.
4. **html2pdf.js is adequate for PDF** — for simple quiz layout with questions, it's sufficient. Complex layouts may require server-side PDF generation.
5. **Mobile users won't drag-drop** — master-detail pattern replaces the sidebar tree; tap-to-select replaces drag-to-add.
6. **Questions are added via files** — no UI for adding/editing questions, only building quizzes. This keeps the web app purely client-side.

## 11. Non-Goals (Deferred)

- No server-side rendering (static only)
- No real-time collaboration
- No multi-user support (it's local to browser)
- No question editing/addition in UI (files only)
- No authentication
- No mobile app
- No integration with external quiz platforms

## 12. Success Criteria

1. **Zero runtime dependencies** — Astro static build works on any file server (GitHub Pages, Netlify, etc.)
2. **Build-time validation** — invalid JSON or duplicate IDs stop the build with clear errors
3. **Full quiz builder UX** — users can build a quiz in 3 steps: select → arrange → export
4. **Mobile usable** — 44px touch targets, master-detail on phones, no broken layouts
5. **Export works** — download `.md`, copy to clipboard, PDF download all function on HTTPS
6. **History reflects repo state** — committed quizzes appear in History tab after build
7. **Self-documenting** — README covers workflow, UI has post-export instructions

## 13. Testing Strategy

### Unit tests (Vitest, built into Astro)
- **JSON parser:** Valid JSON loads correctly, malformed JSON throws error, missing required fields (`id`, `question`, `type`, `answer`) throws error.
- **ID validator:** Collects all IDs across all files, detects duplicates, produces correct error message with file names.
- **Markdown renderer:** `marked()` parses quiz markdown correctly, special characters escape safely.

### E2E test (Playwright)
- **Full builder flow:** Select 3 questions from different categories → reorder → set date → export → verify file download contains correct markdown → verify file name.
- **History flow:** Create a quiz file in `dates/` dir → refresh → verify it appears in History tab with correct date and question count.

## 14. README Content Outline

- `README.md` structure:
  - `# Quiz Builder`
  - `## Quick Start — 3 steps to run a quiz`
  - `## How to Create a Quiz` (export flow from UI)
  - `## How to View Past Quizzes` (commit & push to see in History tab)
  - `## How to Add a Category` (create folder, add questions.json, push)
  - `## How to Add a Question` (JSON structure)
  - `## How to Remove a Question`
  - `## GitHub Pages Deployment` (automated on push)
  - `## Project Structure` (brief file tree)
  - `## Contributing` (question format, validation)
