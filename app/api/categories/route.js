import { prisma } from "@/lib/prisma";
import { ok, fail, validateCategoryPayload } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { tasks: true } } },
      orderBy: { name: "asc" },
    });
    return ok(categories);
  } catch (err) {
    console.error("GET /api/categories failed", err);
    return fail("Failed to load categories", 500);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { errors, data } = validateCategoryPayload(body);
    if (errors.length) return fail(errors.join("; "), 400);

    const existing = await prisma.category.findUnique({
      where: { name: data.name },
    });
    if (existing) return fail("A category with that name already exists", 400);

    const category = await prisma.category.create({ data });
    return ok(category, 201);
  } catch (err) {
    if (err instanceof SyntaxError) return fail("Invalid JSON body", 400);
    console.error("POST /api/categories failed", err);
    return fail("Failed to create category", 500);
  }
}
