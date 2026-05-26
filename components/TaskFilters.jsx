"use client";

export default function TaskFilters({ filters, onChange, categories }) {
  function set(key, value) {
    onChange({ ...filters, [key]: value });
  }

  // Helper to determine if a filter is active to style it differently
  const isSearchActive = filters.search.trim().length > 0;
  const isStatusActive = filters.status !== "";
  const isPriorityActive = filters.priority !== "";
  const isCategoryActive = filters.categoryId !== "";

  return (
    <div className="relative mb-10 group/filters">
      {/* Subtle animated glowing backdrop */}
      <div className="absolute -inset-1 bg-gradient-to-r from-brand-500/20 via-purple-500/20 to-brand-500/20 rounded-3xl blur-md opacity-50 group-hover/filters:opacity-100 transition duration-1000 group-hover/filters:duration-200"></div>
      
      <div className="relative bg-white/90 backdrop-blur-2xl shadow-xl shadow-brand-900/5 border border-white/50 rounded-2xl p-4 sm:p-5 transition-all duration-300">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className={`h-5 w-5 transition-colors duration-300 ${isSearchActive ? 'text-brand-500' : 'text-slate-400 group-focus-within:text-brand-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => set("search", e.target.value)}
              placeholder="Search tasks..."
              className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all shadow-sm placeholder:text-slate-400 ${
                isSearchActive 
                  ? 'bg-brand-50/50 border-brand-200 text-brand-900 border' 
                  : 'bg-slate-50/50 hover:bg-slate-100/50 border-slate-200 border text-slate-800'
              }`}
            />
          </div>

          {/* Status Filter */}
          <div className="relative group">
            <select
              value={filters.status}
              onChange={(e) => set("status", e.target.value)}
              className={`w-full appearance-none pl-4 pr-10 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all shadow-sm cursor-pointer ${
                isStatusActive
                  ? 'bg-brand-50/50 border-brand-200 text-brand-700 border'
                  : 'bg-slate-50/50 hover:bg-slate-100/50 border-slate-200 border text-slate-700'
              }`}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
              <svg className={`w-4 h-4 transition-colors ${isStatusActive ? 'text-brand-500' : 'text-slate-400 group-hover:text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          {/* Priority Filter */}
          <div className="relative group">
            <select
              value={filters.priority}
              onChange={(e) => set("priority", e.target.value)}
              className={`w-full appearance-none pl-4 pr-10 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all shadow-sm cursor-pointer ${
                isPriorityActive
                  ? 'bg-brand-50/50 border-brand-200 text-brand-700 border'
                  : 'bg-slate-50/50 hover:bg-slate-100/50 border-slate-200 border text-slate-700'
              }`}
            >
              <option value="">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
              <svg className={`w-4 h-4 transition-colors ${isPriorityActive ? 'text-brand-500' : 'text-slate-400 group-hover:text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          {/* Category Filter */}
          <div className="relative group">
            <select
              value={filters.categoryId}
              onChange={(e) => set("categoryId", e.target.value)}
              className={`w-full appearance-none pl-4 pr-10 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all shadow-sm cursor-pointer ${
                isCategoryActive
                  ? 'bg-brand-50/50 border-brand-200 text-brand-700 border'
                  : 'bg-slate-50/50 hover:bg-slate-100/50 border-slate-200 border text-slate-700'
              }`}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
              <svg className={`w-4 h-4 transition-colors ${isCategoryActive ? 'text-brand-500' : 'text-slate-400 group-hover:text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
