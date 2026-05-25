import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api";

export const dynamic = "force-dynamic";

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
