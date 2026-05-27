import { prisma } from "@/lib/prisma";
import { ok, fail, validateCategoryPayload } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function PUT(request, { params }) {
  try {
    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return fail("Invalid category id", 400);
    }

    const body = await request.json();
    const { errors, data } = validateCategoryPayload(body);
    if (errors.length) return fail(errors.join("; "), 400);

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) return fail("Category not found", 404);

    // If renaming, make sure the new name isn't already taken by another category.
    if (data.name && data.name !== existing.name) {
      const clash = await prisma.category.findUnique({
        where: { name: data.name },
      });
      if (clash && clash.id !== id) {
        return fail("A category with that name already exists", 400);
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data,
      include: { _count: { select: { tasks: true } } },
    });
    return ok(updated);
  } catch (err) {
    if (err instanceof SyntaxError) return fail("Invalid JSON body", 400);
    console.error("PUT /api/categories/[id] failed", err);
    return fail("Failed to update category", 500);
  }
}

export async function DELETE(_request, { params }) {
  try {
    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return fail("Invalid category id", 400);
    }

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) return fail("Category not found", 404);

    // Per the spec, tasks survive — onDelete: SetNull in schema handles this.
    await prisma.category.delete({ where: { id } });
    return ok({ id });
  } catch (err) {
    console.error("DELETE /api/categories/[id] failed", err);
    return fail("Failed to delete category", 500);
  }
}
