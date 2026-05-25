import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "Task Manager",
  description: "A minimal task manager built with Next.js, Prisma, and Tailwind.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
