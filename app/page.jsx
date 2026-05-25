"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TaskCard from "@/components/TaskCard";

function StatCard({ label, value, accent }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className={"text-2xl font-semibold mt-1 " + (accent ?? "text-slate-900")}>
        {value}
      </div>
    </div>
  );
}

function Bar({ label, count, total, color }) {
  const pct = total === 0 ? 0 : Math.round((count / total) * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
        <span className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: color }}
            aria-hidden
          />
          {label}
        </span>
        <span>
          {count} ({pct}%)
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

const PRIORITY_COLORS = {
  HIGH: "#EF4444",
  MEDIUM: "#F59E0B",
  LOW: "#94A3B8",
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, tasksRes] = await Promise.all([
        fetch("/api/tasks/stats"),
        fetch("/api/tasks?status=PENDING"),
      ]);
      const statsBody = await statsRes.json();
      const tasksBody = await tasksRes.json();
      if (!statsRes.ok) throw new Error(statsBody.error || "Stats failed");
      if (!tasksRes.ok) throw new Error(tasksBody.error || "Tasks failed");
      setStats(statsBody.data);
      setRecent(tasksBody.data.slice(0, 5));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleToggle(task) {
    const next = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    await fetch(`/api/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    load();
  }

  async function handleDelete(task) {
    if (!confirm(`Delete "${task.title}"?`)) return;
    await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          A snapshot of your tasks.
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
          {error}
        </div>
      )}

      {loading || !stats ? (
        <div className="text-sm text-slate-500 py-12 text-center">Loading…</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard label="Total" value={stats.total} />
            <StatCard
              label="Completed"
              value={stats.completed}
              accent="text-emerald-600"
            />
            <StatCard
              label="Overdue"
              value={stats.overdue}
              accent="text-red-600"
            />
            <StatCard
              label="Completion rate"
              value={`${stats.completionRate}%`}
              accent="text-brand-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="font-medium text-sm text-slate-900 mb-3">
                By priority
              </div>
              <div className="space-y-3">
                {["HIGH", "MEDIUM", "LOW"].map((p) => (
                  <Bar
                    key={p}
                    label={p[0] + p.slice(1).toLowerCase()}
                    count={stats.byPriority[p] || 0}
                    total={stats.total}
                    color={PRIORITY_COLORS[p]}
                  />
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="font-medium text-sm text-slate-900 mb-3">
                By category
              </div>
              {stats.byCategory.length === 0 ? (
                <div className="text-xs text-slate-500">No categories yet.</div>
              ) : (
                <div className="space-y-3">
                  {stats.byCategory.map((c) => (
                    <Bar
                      key={c.id ?? "uncategorized"}
                      label={c.name}
                      count={c.count}
                      total={stats.total}
                      color={c.color}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium text-sm text-slate-900">
                Up next
              </div>
              <Link
                href="/tasks"
                className="text-xs text-brand-600 hover:underline"
              >
                View all →
              </Link>
            </div>
            {recent.length === 0 ? (
              <div className="text-sm text-slate-500 py-6 text-center">
                Nothing pending. 🎉
              </div>
            ) : (
              <div className="space-y-2">
                {recent.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
