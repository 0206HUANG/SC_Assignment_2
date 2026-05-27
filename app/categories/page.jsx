"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const PRESET_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#64748B",
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create form state.
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [submitting, setSubmitting] = useState(false);

  // Inline-edit state: which category id is currently being edited, plus its
  // working draft fields. Only one category can be in edit mode at a time.
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("#3B82F6");
  const [editError, setEditError] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/categories");
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to load");
      setCategories(body.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to create");
      setName("");
      setColor("#3B82F6");
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(cat) {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color || "#3B82F6");
    setEditError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditError(null);
  }

  async function saveEdit(cat) {
    setSavingEdit(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, color: editColor }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to update");
      cancelEdit();
      load();
    } catch (err) {
      setEditError(err.message);
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(cat) {
    const count = cat._count?.tasks ?? 0;
    const impact =
      count === 0
        ? `Delete category "${cat.name}"?`
        : `Delete category "${cat.name}"? ${count} ${
            count === 1 ? "task" : "tasks"
          } in this category will become uncategorized (they will NOT be deleted).`;
    if (!confirm(impact)) return;
    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to delete");
      }
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Categories</h1>
        <p className="text-sm text-slate-500 mt-1">
          Organize tasks with color-coded categories. Click a category to view
          its tasks, or edit to rename or change the color.
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="bg-white border border-slate-200 rounded-lg p-4 mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-end gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Errands"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-9 w-12 border border-slate-300 rounded-md cursor-pointer"
              />
              <div className="flex gap-1">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    aria-label={`Pick ${c}`}
                    className={
                      "h-6 w-6 rounded-full border-2 " +
                      (color.toLowerCase() === c.toLowerCase()
                        ? "border-slate-800"
                        : "border-transparent")
                    }
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-3 py-2 text-sm rounded-md bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {submitting ? "Adding…" : "+ Add category"}
          </button>
        </div>
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mt-3">
            {error}
          </div>
        )}
      </form>

      {loading ? (
        <div className="text-sm text-slate-500 py-12 text-center">Loading…</div>
      ) : categories.length === 0 ? (
        <div className="text-sm text-slate-500 py-12 text-center bg-white border border-dashed border-slate-300 rounded-lg">
          No categories yet. Create one above.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((c) =>
            editingId === c.id ? (
              // ---- Inline edit mode ----
              <div
                key={c.id}
                className="bg-white border border-brand-300 ring-2 ring-brand-500/20 rounded-lg p-4"
              >
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Color
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="color"
                        value={editColor}
                        onChange={(e) => setEditColor(e.target.value)}
                        className="h-8 w-10 border border-slate-300 rounded-md cursor-pointer"
                      />
                      <div className="flex gap-1">
                        {PRESET_COLORS.map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setEditColor(preset)}
                            aria-label={`Pick ${preset}`}
                            className={
                              "h-5 w-5 rounded-full border-2 " +
                              (editColor.toLowerCase() === preset.toLowerCase()
                                ? "border-slate-800"
                                : "border-transparent")
                            }
                            style={{ backgroundColor: preset }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  {editError && (
                    <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-2 py-1.5">
                      {editError}
                    </div>
                  )}
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      disabled={savingEdit}
                      className="px-3 py-1.5 text-xs rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => saveEdit(c)}
                      disabled={savingEdit || !editName.trim()}
                      className="px-3 py-1.5 text-xs rounded-md bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50"
                    >
                      {savingEdit ? "Saving…" : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // ---- Default display mode ----
              <div
                key={c.id}
                className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between gap-3"
              >
                <Link
                  href={`/tasks?categoryId=${c.id}`}
                  className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-80 transition-opacity"
                  title={`View tasks in "${c.name}"`}
                >
                  <span
                    className="h-4 w-4 rounded-full shrink-0"
                    style={{ backgroundColor: c.color }}
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <div className="font-medium text-sm text-slate-900 truncate">
                      {c.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {c._count?.tasks ?? 0}{" "}
                      {(c._count?.tasks ?? 0) === 1 ? "task" : "tasks"}
                    </div>
                  </div>
                </Link>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => startEdit(c)}
                    className="text-xs text-slate-500 hover:text-brand-600"
                  >
                    Edit
                  </button>
                  <span className="text-slate-300" aria-hidden>
                    |
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(c)}
                    className="text-xs text-slate-500 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
