"use client";

import { useCallback, useEffect, useState } from "react";
import TaskCard from "@/components/TaskCard";
import TaskForm from "@/components/TaskForm";
import TaskFilters from "@/components/TaskFilters";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    priority: "",
    categoryId: "",
  });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Tasks</h1>
          <p className="text-sm text-slate-500 mt-1">
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleNew}
          className="px-3 py-2 text-sm rounded-md bg-brand-600 text-white hover:bg-brand-700"
        >
          + New task
        </button>
      </div>

      <TaskFilters
        filters={filters}
        onChange={setFilters}
        categories={categories}
      />

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-slate-500 py-12 text-center">Loading…</div>
      ) : tasks.length === 0 ? (
        <div className="text-sm text-slate-500 py-12 text-center bg-white border border-dashed border-slate-300 rounded-lg">
          No tasks match your filters. Try clearing them or creating a new task.
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
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
