"use client";

const PRIORITY_STYLES = {
  HIGH: "bg-red-50 text-red-700 border border-red-200/60",
  MEDIUM: "bg-amber-50 text-amber-700 border border-amber-200/60",
  LOW: "bg-slate-50 text-slate-700 border border-slate-200/60",
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
    <div className={`group flex items-start gap-4 bg-white hover:bg-slate-50/40 border border-slate-200 hover:border-brand-300/50 rounded-2xl p-5 hover:shadow-md transition-all duration-300 ${completed ? "opacity-75 grayscale-[0.3]" : ""}`}>
      <button
        type="button"
        onClick={() => onToggle(task)}
        className={
          "mt-0.5 h-6 w-6 shrink-0 rounded-full border-2 flex items-center justify-center transition-all duration-300 " +
          (completed
            ? "bg-brand-500 border-brand-500 text-white shadow-sm shadow-brand-500/20"
            : "border-slate-300 hover:border-brand-500 hover:bg-brand-50")
        }
        aria-label={completed ? "Mark pending" : "Mark complete"}
      >
        {completed ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : ""}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 flex-wrap mb-1">
          <div
            className={
              "font-semibold text-base transition-colors duration-200 " +
              (completed ? "line-through text-slate-400" : "text-slate-900 group-hover:text-brand-950")
            }
          >
            {task.title}
          </div>
          <span className={"pill px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold shadow-sm " + PRIORITY_STYLES[task.priority]}>
            {task.priority}
          </span>
          {task.category && (
            <span
              className="pill px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold shadow-sm"
              style={{
                backgroundColor: task.category.color + "15",
                color: task.category.color,
                borderColor: task.category.color + "30",
                borderWidth: "1px",
              }}
            >
              {task.category.name}
            </span>
          )}
          {overdue && (
            <span className="pill px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold shadow-sm bg-red-50 text-red-600 border border-red-200/60 animate-pulse">
              Overdue
            </span>
          )}
        </div>

        {task.description && (
          <div className="text-sm text-slate-500 mt-1.5 leading-relaxed line-clamp-2 pr-4">
            {task.description}
          </div>
        )}

        {task.dueDate && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-3 font-medium">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Due {formatDate(task.dueDate)}
          </div>
        )}
      </div>

      <div className="flex flex-col items-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
            title="Edit task"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(task)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete task"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
