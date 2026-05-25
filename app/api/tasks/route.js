import { prisma } from "@/lib/prisma";
import {
  ok,
  fail,
  validateTaskPayload,
  PRIORITIES,
  STATUSES,
} from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");

    const where = {};

    if (status) {
      if (!STATUSES.includes(status)) {
        return fail(`status must be one of ${STATUSES.join(", ")}`, 400);
      }
      where.status = status;
    }

    if (priority) {
      if (!PRIORITIES.includes(priority)) {
        return fail(`priority must be one of ${PRIORITIES.join(", ")}`, 400);
      }
      where.priority = priority;
    }

    if (categoryId) {
      const cid = Number(categoryId);
      if (!Number.isInteger(cid) || cid <= 0) {
        return fail("categoryId must be a positive integer", 400);
      }
      where.categoryId = cid;
    }

    if (search && search.trim() !== "") {
      const q = search.trim();
      // SQLite's LIKE is case-insensitive for ASCII by default, so
      // we don't need Prisma's `mode: "insensitive"` (which SQLite
      // doesn't support anyway).
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      include: { category: true },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
    });

    return ok(tasks);
  } catch (err) {
    console.error("GET /api/tasks failed", err);
    return fail("Failed to load tasks", 500);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { errors, data } = validateTaskPayload(body);
    if (errors.length) return fail(errors.join("; "), 400);

    if (data.categoryId) {
      const exists = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });
      if (!exists) return fail("Category not found", 400);
    }

    const task = await prisma.task.create({
      data,
      include: { category: true },
    });
    return ok(task, 201);
  } catch (err) {
    if (err instanceof SyntaxError) return fail("Invalid JSON body", 400);
    console.error("POST /api/tasks failed", err);
    return fail("Failed to create task", 500);
  }
}
