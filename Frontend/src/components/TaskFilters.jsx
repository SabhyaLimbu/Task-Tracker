const TABS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'archived', label: 'Archived' },
];

const TaskFilters = ({
  filter,
  onFilterChange,
  search,
  onSearchChange,
  sort,
  onSortChange,
  priorityFilter,
  onPriorityFilterChange,
  dueFilter,
  onDueFilterChange,
  counts,
  onClearCompleted,
  onExportCsv,
  onExportPdf,
}) => (
  <div className="filters">
    <div className="filter-tabs" role="tablist" aria-label="Filter tasks">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={filter === tab.key}
          className={`filter-tab${filter === tab.key ? ' active' : ''}`}
          onClick={() => onFilterChange(tab.key)}
        >
          {tab.label} <span className="filter-count">{counts[tab.key]}</span>
        </button>
      ))}
    </div>

    <div className="filter-tools">
      <input
        type="search"
        className="search-input"
        aria-label="Search tasks"
        placeholder="Search tasks..."
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      <select
        className="select-input"
        aria-label="Filter by priority"
        value={priorityFilter}
        onChange={(event) => onPriorityFilterChange(event.target.value)}
      >
        <option value="all">Any priority</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
      <select
        className="select-input"
        aria-label="Filter by due date"
        value={dueFilter}
        onChange={(event) => onDueFilterChange(event.target.value)}
      >
        <option value="any">Any date</option>
        <option value="overdue">Overdue</option>
        <option value="today">Due today</option>
        <option value="week">Next 7 days</option>
        <option value="none">No due date</option>
      </select>
      <select
        className="select-input"
        aria-label="Sort tasks"
        value={sort}
        onChange={(event) => onSortChange(event.target.value)}
      >
        <option value="default">Sort: My order</option>
        <option value="due">Sort: Due date</option>
        <option value="priority">Sort: Priority</option>
      </select>
    </div>

    <div className="filter-links">
      {filter !== 'archived' && counts.completed > 0 && (
        <button type="button" className="link-btn" onClick={onClearCompleted}>
          Clear completed
        </button>
      )}
      <button type="button" className="link-btn" onClick={onExportCsv}>
        Export CSV
      </button>
      <button type="button" className="link-btn" onClick={onExportPdf}>
        Export PDF
      </button>
    </div>
  </div>
);

export default TaskFilters;