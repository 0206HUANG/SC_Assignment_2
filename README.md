# Task Manager

A full-stack task management web application built with Next.js, Prisma, and Tailwind CSS. Users can create, organize, filter, and track tasks across custom categories, with a dashboard summarizing progress at a glance.

## Features

| # | Feature | Contributor |
|---|---------|-------------|
| 1 | Create Task | **bosheng** |
| 2 | List, Filter & Search Tasks | **hafiy** |
| 3 | Update Task (edit, mark complete, delete) | **azry** |
| 4 | Category Management | **qinhao** |
| 5 | Dashboard Statistics | **zaf** |

### 1. Create Task — bosheng
Add a new task with a title, optional description, due date, priority (HIGH / MEDIUM / LOW), and category. Input is validated on both the client form and the API layer.

### 2. List, Filter & Search Tasks — hafiy
Browse all tasks with combined filters: by status (pending / completed), priority, category, and free-text search across the title and description.

### 3. Update Task — azry
Edit any task's details, toggle its status between pending and completed, or remove it. All updates are persisted through the REST API.

### 4. Category Management — qinhao
Create, rename, recolor, and delete categories. Deleting a category leaves existing tasks intact (their category is simply cleared).

### 5. Dashboard Statistics — zaf
Snapshot of total / completed / overdue tasks, the overall completion rate, and breakdowns by priority and category. Also lists the next pending items.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** JavaScript (JSX)
- **Database:** SQLite via Prisma ORM
- **Styling:** Tailwind CSS
- **Runtime:** Node.js

## Project Structure

```
.
├── app/
│   ├── api/
│   │   ├── categories/        # Category CRUD endpoints
│   │   └── tasks/             # Task CRUD + stats endpoints
│   ├── categories/            # Category management page
│   ├── tasks/                 # Task list / filter / search page
│   ├── layout.jsx
│   └── page.jsx               # Dashboard
├── components/
│   ├── Sidebar.jsx
│   ├── TaskCard.jsx
│   ├── TaskFilters.jsx
│   └── TaskForm.jsx
├── prisma/
│   ├── schema.prisma          # Category & Task models
│   ├── migrations/
│   ├── seed.js                # Sample data
│   └── dev.db                 # SQLite database file
├── next.config.js
├── tailwind.config.js
└── package.json
```

## Data Models

```prisma
model Category {
  id        Int      @id @default(autoincrement())
  name      String   @unique
  color     String   @default("#3B82F6")
  createdAt DateTime @default(now())
  tasks     Task[]
}

model Task {
  id          Int       @id @default(autoincrement())
  title       String
  description String?
  dueDate     DateTime?
  priority    String    @default("MEDIUM")  // HIGH | MEDIUM | LOW
  status      String    @default("PENDING") // PENDING | COMPLETED
  categoryId  Int?
  category    Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

## Getting Started

### Prerequisites
- Node.js 18 or later
- npm

### Installation

```bash
# 1. Install dependencies (also runs `prisma generate`)
npm install

# 2. Configure the database connection
#    Create a .env file in the project root with:
#    DATABASE_URL="file:./dev.db"

# 3. Apply migrations
npx prisma migrate dev

# 4. (Optional) Seed sample categories and tasks
npm run seed

# 5. Start the dev server
npm run dev
```

The app will be available at <http://localhost:3000>.

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production server |
| `npm run lint` | Run Next.js linting |
| `npm run seed` | Populate the database with sample data |

## API Reference

### Tasks
- `GET    /api/tasks` — List tasks (supports `status`, `priority`, `categoryId`, `q` query params)
- `POST   /api/tasks` — Create a new task
- `GET    /api/tasks/[id]` — Retrieve one task
- `PUT    /api/tasks/[id]` — Update a task
- `DELETE /api/tasks/[id]` — Delete a task
- `GET    /api/tasks/stats` — Dashboard statistics

### Categories
- `GET    /api/categories` — List categories
- `POST   /api/categories` — Create a category
- `PUT    /api/categories/[id]` — Update a category
- `DELETE /api/categories/[id]` — Delete a category

## Team

| Member | Responsibility |
|--------|----------------|
| bosheng | Create Task |
| hafiy | List, Filter & Search Tasks |
| azry | Update Task |
| qinhao | Category Management |
| zaf | Dashboard Statistics |
