# Quiz Editor – Project Plan

This is the internal documentation for building the local-only **Quiz Editor** app using **Next.js 15** with **TypeScript**. All data is stored in a single JSON file (`questions.json`) located at `src/assets/questions.json`. No database or deployment is needed.

---

## ✅ Design Overview

### 📁 File Structure

```
quiz-editor/
├── src/
│   ├── app/
│   │   └── api/questions/         # API routes for all actions
│   ├── assets/
│   │   └── questions.json          # Main source of truth
│   ├── lib/
│   │   └── questionStore.ts       # read/write utility for JSON
│   └── components/                # UI components
├── public/
├── README.md
```

---

## 🧠 Data Model: Question JSON

Each question is a JSON object with the following structure:

```ts
{
  id: string; // UUID
  category: string[];
  question: string;
  question_ar: string;
  type: "Multiple Choice" | "True or False";
  status?: "translated" | "proofread1" | "proofread2" | "published" | "rejected";
  tags?: string[];
  references?: string[];
  answers: Array<{
    id: number;
    answer: string;
    answer_ar: string;
    isCorrect: boolean;
  }>;
  verses: string[];
}
```

---

## 🔁 Workflow Logic

1. **Create** new question

   * Status defaults to `draft` (implicit if `status` is undefined)
   * Status dropdown is disabled in create mode
   * Only `type = "Multiple Choice"` or `"True or False"`

2. **Translate / Proofread / Edit**

   * Status can be updated freely
   * Edits to tags, references, translations are supported

3. **Publish or Reject**

   * After `proofread2`, question can be marked as `published` or `rejected`

---

## 📬 API-First CRUD

All actions happen through API routes:

* `GET /api/questions` – list all
* `POST /api/questions` – create new (UUID generated)
* `PUT /api/questions/:id` – full update
* `PATCH /api/questions/:id` – partial update (status, tags, etc.)
* `DELETE /api/questions/:id` – delete

---

## 🧾 UI Plans

### Question Form

* Reusable form component (create/edit/minor-edit)
* Fields:

  * Type: dropdown (MCQ / T/F)
  * Question text / Arabic text (required)
  * Category: checkbox multiselect (existing + add new)
  * Tags: checkbox multiselect (existing + add new)
  * Verses: comma separated
  * References: string\[]
  * Answers list (2 or 3 max)

    * For T/F: auto-fill answers = \[True, False]
    * At least 1 marked correct

### Main Page (Coming Later)

* Table/List view of all questions
* Filters (multiselect):

  * Status
  * Tags
  * Categories
* Pagination (client-side)
* Action buttons: Edit / Delete / Preview

---

## ⏭️ Next Steps

1. ✅ Create `questions.json` (empty array)
2. ✅ Create `questionStore.ts` for read/write
3. ⏳ Implement API routes (CRUD, UUID)
4. ⏳ Build `<QuestionForm />` component
5. ⏳ Implement main list page with filters

---

## ❓Roles & Constraints

### 👤 UI Expert

* Validation occurs on **submit** only
* Answers shown with checkboxes
* Arabic fields required for `published`

### 🔌 API Integration

* All data handled via API routes
* File writes are full overwrite
* Validation on both UI and backend

### 🧪 Tester View

* All fields required for save except `draft`
* Drafts can be saved with missing values
* Ensure `answers.length` is 2 (T/F) or max 3 (MCQ)
