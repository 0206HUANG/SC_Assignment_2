const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

async function main() {
  // Wipe existing data so seed is idempotent.
  await prisma.task.deleteMany();
  await prisma.category.deleteMany();

  const [work, personal, study] = await Promise.all([
    prisma.category.create({ data: { name: "Work", color: "#3B82F6" } }),
    prisma.category.create({ data: { name: "Personal", color: "#10B981" } }),
    prisma.category.create({ data: { name: "Study", color: "#F59E0B" } }),
  ]);

  await prisma.task.createMany({
    data: [
      {
        title: "Finish quarterly report",
        description: "Compile sales numbers and email to the team.",
        dueDate: daysFromNow(2),
        priority: "HIGH",
        status: "PENDING",
        categoryId: work.id,
      },
      {
        title: "Reply to client emails",
        description: "Inbox is at 30+ unread.",
        dueDate: daysFromNow(1),
        priority: "MEDIUM",
        status: "PENDING",
        categoryId: work.id,
      },
      {
        title: "Submit expense report",
        dueDate: daysFromNow(-3),
        priority: "HIGH",
        status: "PENDING",
        categoryId: work.id,
      },
      {
        title: "Grocery shopping",
        description: "Eggs, bread, milk, coffee.",
        dueDate: daysFromNow(0),
        priority: "LOW",
        status: "PENDING",
        categoryId: personal.id,
      },
      {
        title: "Book dentist appointment",
        dueDate: daysFromNow(7),
        priority: "MEDIUM",
        status: "PENDING",
        categoryId: personal.id,
      },
      {
        title: "Renew gym membership",
        priority: "LOW",
        status: "COMPLETED",
        categoryId: personal.id,
      },
      {
        title: "Read chapter 4 of Designing Data-Intensive Applications",
        description: "Encoding and evolution.",
        dueDate: daysFromNow(5),
        priority: "MEDIUM",
        status: "PENDING",
        categoryId: study.id,
      },
      {
        title: "Complete Next.js tutorial",
        priority: "HIGH",
        status: "COMPLETED",
        categoryId: study.id,
      },
      {
        title: "Clean up desktop files",
        priority: "LOW",
        status: "COMPLETED",
      },
      {
        title: "Plan weekend trip",
        description: "Pick a destination and book a hotel.",
        dueDate: daysFromNow(10),
        priority: "MEDIUM",
        status: "PENDING",
        categoryId: personal.id,
      },
    ],
  });

  const taskCount = await prisma.task.count();
  const catCount = await prisma.category.count();
  console.log(`Seeded ${catCount} categories and ${taskCount} tasks.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
