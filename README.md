# Quiz Builder

A quiz builder web application for creating category-based quizzes with questions focused on Slovakia but covering multiple knowledge domains. Runs as a static site on GitHub Pages.

## Quick Start — 3 steps to run a quiz

1. **Build your quiz:** Open the app, navigate to Builder tab, select questions, set date
2. **Export:** Click "Export .md", get `quiz-YYYY-MM-DD.md`
3. **Commit:** Move file to `dates/2024-08-01/quiz.md`, run `git add dates/ && git commit -m "Quiz" && git push`

## How to View Past Quizzes

Past quizzes appear in the **History** tab after you commit them to git and push. The app loads them at runtime via the CDN on page load.

## How to Add Categories and Questions

1. Create a folder under `questions/` with the category name
2. Add a file named `questions.json` with the question data
3. Commit and push to make the questions visible in the app

### Question JSON Format

Each `questions.json` file must follow this structure:

```json
{
  "category": "geography",
  "questions": [
    {
      "id": "geo_1",
      "type": "multiple_choice",
      "difficulty": "intermediate",
      "question": "What is the capital of Slovakia?",
      "options": ["Bratislava", "Kosice", "Presov", "Banska Bystrica"],
      "answer": "Bratislava",
      "notes": "Bratislava is the largest city and capital of Slovakia."
    }
  ]
}
```

### Question Fields

| Field | Required | Values |
|-------|----------|--------|
| `id` | Yes | Globally unique identifier string |
| `type` | Yes | `"multiple_choice"` or `"write_in"` |
| `difficulty` | Yes | `"beginner"`, `"intermediate"`, or `"advanced"` |
| `question` | Yes | The question text |
| `options` | Yes, if `type` is `multiple_choice` | Array of answer options |
| `answer` | Yes | The correct answer |
| `notes` | No | Optional additional context |

## How to Remove a Question

Simply open the `questions/your-category/questions.json` file and remove the question object, then commit and push.

## How to Remove a Category

Delete the entire `questions/category-name/` folder, then commit and push.

## GitHub Pages Deployment

The site auto-deploys to GitHub Pages on every push to `main` that includes changes to:
- `astro-site/` directory
- `questions/` directory (triggers JSON validation)
- `dates/` directory (updates History tab data)

## Project Structure

```
quiz/
├── astro-site/            # Main web app (Astro + React)
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page layouts (index.astro)
│   │   └── ...
│   └── dist/              # Built output (auto-generated)
├── questions/             # Question bank (JSON)
│   ├── geography/
│   │   └── questions.json
│   └── ...
├── dates/                 # Past quizzes (Markdown)
│   ├── 2024-08-01/
│   │   └── quiz.md
│   └── ...
├── docs/                  # Design docs and plans
├── tests/                 # Unit tests
└── .github/workflows/deploy.yml
```

## Contributing Guide

Add questions following the `questions/<category>/questions.json` structure. All IDs must be globally unique across categories. Use existing question IDs as templates.

## Tech Stack

- **Frontend:** Astro (static site), React, TypeScript
- **Data:** JSON for question source, Markdown for quiz output
- **Deployment:** GitHub Pages (auto-deploy on push)
- **Testing:** Vitest (unit), Playwright (E2E)
