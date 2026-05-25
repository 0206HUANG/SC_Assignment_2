"use client";

const PRIORITY_STYLES = {
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  LOW: "bg-slate-100 text-slate-700",
};

function formatDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isOverdue(task) {
  if (!task.dueDate || task.status === "COMPLETED") return false;
  return new Date(task.dueDate).getTime() < Date.now();
}

export default function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const completed = task.status === "COMPLETED";
  const overdue = isOverdue(task);

  return (
    <div className="flex items-start gap-3 bg-white border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <button
        type="button"
        onClick={() => onToggle(task)}
        className={
          "mt-0.5 h-5 w-5 shrink-0 rounded-full border flex items-center justify-center transition-colors " +
          (completed
            ? "bg-emerald-500 border-emerald-500 text-white"
            : "border-slate-300 hover:border-brand-500")
        }
        aria-label={completed ? "Mark pending" : "Mark complete"}
      >
        {completed ? "✓" : ""}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className={
              "font-medium text-sm " +
              (completed ? "line-through text-slate-400" : "text-slate-900")
            }
          >
            {task.title}
          </div>
          <span className={"pill " + PRIORITY_STYLES[task.priority]}>
            {task.priority}
          </span>
          {task.category && (
            <span
              className="pill"
              style={{
                backgroundColor: task.category.color + "20",
                color: task.category.color,
              }}
            >
              {task.category.name}
            </span>
          )}
          {overdue && (
            <span className="pill bg-red-50 text-red-600 border border-red-200">
              Overdue
            </span>
          )}
        </div>

        {task.description && (
          <div className="text-sm text-slate-600 mt-1 line-clamp-2">
            {task.description}
          </div>
        )}

        {task.dueDate && (
          <div className="text-xs text-slate-500 mt-2">
            Due {formatDate(task.dueDate)}
          </div>
        )}
      </div>

      <div className="flex flex-col items-end gap-1">
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="text-xs text-slate-500 hover:text-brand-600"
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(task)}
            className="text-xs text-slate-500 hover:text-red-600"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
