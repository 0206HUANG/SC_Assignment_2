"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const TITLE_MAX = 200;
const DESC_MAX = 1000;

function toDateInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  // yyyy-mm-dd in local time
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10);
}

function todayInput() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10);
}

const empty = {
  title: "",
  description: "",
  dueDate: "",
  priority: "MEDIUM",
  status: "PENDING",
  categoryId: "",
};

export default function TaskForm({ open, initial, categories, onClose, onSaved }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [titleTouched, setTitleTouched] = useState(false);
  const titleRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        title: initial.title ?? "",
        description: initial.description ?? "",
        dueDate: toDateInput(initial.dueDate),
        priority: initial.priority ?? "MEDIUM",
        status: initial.status ?? "PENDING",
        categoryId: initial.categoryId ? String(initial.categoryId) : "",
      });
    } else {
      setForm(empty);
    }
    setError(null);
    setTitleTouched(false);
  }, [open, initial]);

  // Autofocus the title input when the modal opens.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => titleRef.current?.focus(), 30);
    return () => clearTimeout(t);
  }, [open]);

  // Esc to close; Ctrl/Cmd+Enter to submit.
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        document
          .getElementById("task-form")
          ?.requestSubmit();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const editing = Boolean(initial?.id);
  const trimmedTitle = form.title.trim();
  const titleEmpty = trimmedTitle === "";
  const titleTooLong = form.title.length > TITLE_MAX;
  const descTooLong = form.description.length > DESC_MAX;

  const today = todayInput();
  const duePastWarning =
    !editing && form.dueDate && form.dueDate < today;

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setTitleTouched(true);
    if (titleEmpty || titleTooLong || descTooLong) return;
    setSaving(true);
    setError(null);

    const payload = {
      title: trimmedTitle,
      description: form.description.trim() || null,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      priority: form.priority,
      status: form.status,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
    };

    try {
      const url = editing ? `/api/tasks/${initial.id}` : "/api/tasks";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Save failed");
      onSaved(body.data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onClose();
  }

  const titleInvalid = titleTouched && (titleEmpty || titleTooLong);
  const submitDisabled = saving || titleEmpty || titleTooLong || descTooLong;

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 z-40 flex items-center justify-center p-4"
      onMouseDown={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-form-title"
    >
      <div className="bg-white rounded-lg w-full max-w-lg shadow-xl">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 id="task-form-title" className="font-semibold text-slate-900">
            {editing ? "Edit task" : "New task"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form id="task-form" onSubmit={handleSubmit} className="p-5 space-y-4" noValidate>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="task-title" className="block text-xs font-medium text-slate-600">
                Title <span className="text-red-500">*</span>
              </label>
              <span
                className={
                  "text-xs " +
                  (titleTooLong ? "text-red-600" : "text-slate-400")
                }
              >
                {form.title.length}/{TITLE_MAX}
              </span>
            </div>
            <input
              id="task-title"
              ref={titleRef}
              type="text"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              onBlur={() => setTitleTouched(true)}
              aria-invalid={titleInvalid || undefined}
              className={
                "w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 " +
                (titleInvalid
                  ? "border-red-400 focus:ring-red-400/40"
                  : "border-slate-300 focus:ring-brand-500/50")
              }
              placeholder="What needs to be done?"
            />
            {titleInvalid && (
              <div className="text-xs text-red-600 mt-1">
                {titleEmpty ? "Title is required." : `Title must be ${TITLE_MAX} characters or fewer.`}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="task-desc" className="block text-xs font-medium text-slate-600">
                Description
              </label>
              <span
                className={
                  "text-xs " +
                  (descTooLong ? "text-red-600" : "text-slate-400")
                }
              >
                {form.description.length}/{DESC_MAX}
              </span>
            </div>
            <textarea
              id="task-desc"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
              className={
                "w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 " +
                (descTooLong
                  ? "border-red-400 focus:ring-red-400/40"
                  : "border-slate-300 focus:ring-brand-500/50")
              }
              placeholder="Optional details"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="task-due" className="block text-xs font-medium text-slate-600 mb-1">
                Due date
              </label>
              <input
                id="task-due"
                type="date"
                value={form.dueDate}
                onChange={(e) => update("dueDate", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
              {duePastWarning && (
                <div className="text-xs text-amber-600 mt-1">
                  Due date is in the past — task will start as overdue.
                </div>
              )}
            </div>
            <div>
              <label htmlFor="task-priority" className="block text-xs font-medium text-slate-600 mb-1">
                Priority
              </label>
              <select
                id="task-priority"
                value={form.priority}
                onChange={(e) => update("priority", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              >
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="task-category" className="block text-xs font-medium text-slate-600">
                  Category
                </label>
                {categories.length === 0 && (
                  <Link
                    href="/categories"
                    onClick={onClose}
                    className="text-xs text-brand-600 hover:underline"
                  >
                    + Create one
                  </Link>
                )}
              </div>
              <select
                id="task-category"
                value={form.categoryId}
                onChange={(e) => update("categoryId", e.target.value)}
                disabled={categories.length === 0}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">— None —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="task-status" className="block text-xs font-medium text-slate-600 mb-1">
                Status
              </label>
              <select
                id="task-status"
                value={form.status}
                onChange={(e) => update("status", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              >
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-400 hidden sm:block">
              Press <kbd className="px-1 py-0.5 border border-slate-300 rounded">Esc</kbd> to close,{" "}
              <kbd className="px-1 py-0.5 border border-slate-300 rounded">Ctrl</kbd>+
              <kbd className="px-1 py-0.5 border border-slate-300 rounded">Enter</kbd> to save
            </div>
            <div className="flex gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-sm rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitDisabled}
                className="px-3 py-1.5 text-sm rounded-md bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving…" : editing ? "Save changes" : "Create task"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
