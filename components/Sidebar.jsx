"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard", icon: "▦" },
  { href: "/tasks", label: "Tasks", icon: "✓" },
  { href: "/categories", label: "Categories", icon: "◉" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 hidden md:flex md:flex-col bg-white border-r border-slate-200 py-6 px-4">
      <div className="px-2 mb-8">
        <div className="text-xl font-semibold text-slate-900">TaskFlow</div>
        <div className="text-xs text-slate-500 mt-1">Stay on top of things</div>
      </div>
      <nav className="flex flex-col gap-1">
        {links.map((l) => {
          const active =
            l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors " +
                (active
                  ? "bg-brand-50 text-brand-700 font-medium"
                  : "text-slate-700 hover:bg-slate-100")
              }
            >
              <span className="w-5 text-center">{l.icon}</span>
              {l.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
