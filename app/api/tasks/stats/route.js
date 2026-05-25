import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();

    const [total, completed, overdue, byPriorityRaw, categories] =
      await Promise.all([
        prisma.task.count(),
        prisma.task.count({ where: { status: "COMPLETED" } }),
        prisma.task.count({
          where: { status: "PENDING", dueDate: { lt: now, not: null } },
        }),
        prisma.task.groupBy({
          by: ["priority"],
          _count: { _all: true },
        }),
        prisma.category.findMany({
          include: { _count: { select: { tasks: true } } },
          orderBy: { name: "asc" },
        }),
      ]);

    const byPriority = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    for (const row of byPriorityRaw) {
      byPriority[row.priority] = row._count._all;
    }

    const uncategorized = await prisma.task.count({
      where: { categoryId: null },
    });

    const byCategory = categories.map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color,
      count: c._count.tasks,
    }));
    if (uncategorized > 0) {
      byCategory.push({
        id: null,
        name: "Uncategorized",
        color: "#9CA3AF",
        count: uncategorized,
      });
    }

    const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

    return ok({
      total,
      completed,
      pending: total - completed,
      overdue,
      completionRate,
      byPriority,
      byCategory,
    });
  } catch (err) {
    console.error("GET /api/tasks/stats failed", err);
    return fail("Failed to load stats", 500);
  }
}
