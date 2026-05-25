import { prisma } from "@/lib/prisma";
import { ok, fail, validateTaskPayload } from "@/lib/api";

export const dynamic = "force-dynamic";

function parseId(idStr) {
  const id = Number(idStr);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

export async function GET(_request, { params }) {
  try {
    const id = parseId(params.id);
    if (id === null) return fail("Invalid task id", 400);

    const task = await prisma.task.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!task) return fail("Task not found", 404);
    return ok(task);
  } catch (err) {
    console.error("GET /api/tasks/[id] failed", err);
    return fail("Failed to load task", 500);
  }
}

export async function PUT(request, { params }) {
  try {
    const id = parseId(params.id);
    if (id === null) return fail("Invalid task id", 400);

    const body = await request.json();
    const { errors, data } = validateTaskPayload(body, { partial: true });
    if (errors.length) return fail(errors.join("; "), 400);

    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) return fail("Task not found", 404);

    if (data.categoryId) {
      const cat = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });
      if (!cat) return fail("Category not found", 400);
    }

    const task = await prisma.task.update({
      where: { id },
      data,
      include: { category: true },
    });
    return ok(task);
  } catch (err) {
    if (err instanceof SyntaxError) return fail("Invalid JSON body", 400);
    console.error("PUT /api/tasks/[id] failed", err);
    return fail("Failed to update task", 500);
  }
}

export async function DELETE(_request, { params }) {
  try {
    const id = parseId(params.id);
    if (id === null) return fail("Invalid task id", 400);

    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) return fail("Task not found", 404);

    await prisma.task.delete({ where: { id } });
    return ok({ id });
  } catch (err) {
    console.error("DELETE /api/tasks/[id] failed", err);
    return fail("Failed to delete task", 500);
  }
}
