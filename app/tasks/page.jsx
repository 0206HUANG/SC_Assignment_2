"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import TaskCard from "@/components/TaskCard";
import TaskForm from "@/components/TaskForm";
import TaskFilters from "@/components/TaskFilters";

// Wrap in Suspense because useSearchParams requires it during static rendering.
export default function TasksPage() {
  return (
    <Suspense fallback={null}>
      <TasksPageInner />
    </Suspense>
  );
}

function TasksPageInner() {
  const searchParams = useSearchParams();
  // Initial filter values: pull categoryId from URL so links like
  // /tasks?categoryId=3 (from the Categories page) pre-apply the filter.
  const initialCategoryId = searchParams.get("categoryId") || "";

  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    priority: "",
    categoryId: initialCategoryId,
  });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // Keep the filter in sync if the URL changes (e.g. user clicks a different
  // category card while already on /tasks).
  useEffect(() => {
    const fromUrl = searchParams.get("categoryId") || "";
    setFilters((f) => (f.categoryId === fromUrl ? f : { ...f, categoryId: fromUrl }));
  }, [searchParams]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.status) params.set("status", filters.status);
    if (filters.priority) params.set("priority", filters.priority);
    if (filters.categoryId) params.set("categoryId", filters.categoryId);

    try {
      const res = await fetch(`/api/tasks?${params.toString()}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to load");
      setTasks(body.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories");
      const body = await res.json();
      if (res.ok) setCategories(body.data);
    } catch {
      // non-fatal
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  // Debounce search so we don't fire on every keystroke.
  useEffect(() => {
    const id = setTimeout(fetchTasks, 200);
    return () => clearTimeout(id);
  }, [fetchTasks]);

  async function handleToggle(task) {
    const next = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    // Optimistic update.
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: next } : t))
    );
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error("Failed to update");
    } catch {
      // Roll back on failure.
      fetchTasks();
    }
  }

  async function handleDelete(task) {
    if (!confirm(`Delete "${task.title}"?`)) return;
    try {
      const res = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch (err) {
      alert(err.message);
    }
  }

  function handleEdit(task) {
    setEditing(task);
    setFormOpen(true);
  }

  function handleNew() {
    setEditing(null);
    setFormOpen(true);
  }

  function handleSaved() {
    fetchTasks();
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tasks</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"} found
          </p>
        </div>
        <button
          type="button"
          onClick={handleNew}
          className="group flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-brand-600 text-white hover:bg-brand-500 shadow-sm hover:shadow-md hover:shadow-brand-500/20 transition-all duration-200"
        >
          <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Task
        </button>
      </div>

      <TaskFilters
        filters={filters}
        onChange={setFilters}
        categories={categories}
      />

      {error && (
        <div className="flex items-center gap-3 text-sm text-red-600 bg-red-50/50 border border-red-200 rounded-xl px-4 py-3 mb-6 shadow-sm">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <svg className="w-8 h-8 animate-spin text-brand-500 mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-sm font-medium animate-pulse">Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/50 border border-dashed border-slate-300 rounded-2xl">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No tasks found</h3>
          <p className="text-sm text-slate-500 mb-6">Try adjusting your filters or create a new task.</p>
          <button
            type="button"
            onClick={handleNew}
            className="px-4 py-2 text-sm font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
          >
            Create your first task
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task, index) => (
            <div 
              key={task.id} 
              className="animate-fade-up opacity-0"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TaskCard
                task={task}
                onToggle={handleToggle}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}

      <TaskForm
        open={formOpen}
        initial={editing}
        categories={categories}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
      />
    </div>
  );
}
