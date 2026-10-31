import Icon from './Icon';
import {
  NEXT_PRIORITY,
  PRIORITY_LABEL,
  REPEAT_LABEL,
  isDueToday,
  isOverdue,
} from '../utils/taskUtils';

const TaskItem = ({
  task,
  info = {},
  archivedView = false,
  draggable = false,
  dragging = false,
  dragOver = false,
  onDragStartItem,
  onDragOverItem,
  onDropItem,
  onDragEndItem,
  onDelete,
  onEdit,
  onToggle,
  onArchive,
  onRestore,
  onMetaChange,
}) => {
  const priority = info.priority || 'medium';
  const repeat = info.repeat || 'none';
  const overdue = isOverdue(task, info);
  const dueToday = isDueToday(task, info);

  const classes = [
    'task-item',
    task.completed && 'completed',
    overdue && 'is-overdue',
    dragging && 'dragging',
    dragOver && 'drag-over',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      draggable={draggable}
      onDragStart={(event) => {
        if (!draggable) return;
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', task._id);
        onDragStartItem(task._id);
      }}
      onDragOver={(event) => {
        if (!draggable) return;
        event.preventDefault();
        onDragOverItem(task._id);
      }}
      onDrop={(event) => {
        if (!draggable) return;
        event.preventDefault();
        onDropItem(task._id);
      }}
      onDragEnd={() => draggable && onDragEndItem()}
    >
      {draggable && (
        <span className="drag-handle" title="Drag to reorder" aria-hidden="true">
          ⋮⋮
        </span>
      )}

      <label className="task-main">
        <input
          type="checkbox"
          checked={!!task.completed}
          disabled={archivedView}
          onChange={() => onToggle(task._id)}
        />
        <span className="task-title">{task.title}</span>
      </label>

      <div className="task-meta">
        <button
          type="button"
          className={`chip priority-${priority}`}
          title="Click to change priority"
          disabled={archivedView}
          onClick={() =>
            onMetaChange(task._id, { priority: NEXT_PRIORITY[priority] })
          }
        >
          {PRIORITY_LABEL[priority]}
        </button>

        <input
          type="date"
          className={`due-input${overdue ? ' overdue' : ''}${dueToday ? ' today' : ''}`}
          aria-label="Due date"
          title={overdue ? 'Overdue' : dueToday ? 'Due today' : 'Due date'}
          value={info.due || ''}
          disabled={archivedView}
          onChange={(event) => onMetaChange(task._id, { due: event.target.value })}
        />

        <select
          className={`repeat-select${repeat !== 'none' ? ' on' : ''}`}
          aria-label="Repeat"
          title="Repeat: a new task is created when you complete this one"
          value={repeat}
          disabled={archivedView}
          onChange={(event) => onMetaChange(task._id, { repeat: event.target.value })}
        >
          {Object.entries(REPEAT_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {value === 'none' ? 'Repeat' : label}
            </option>
          ))}
        </select>
      </div>

      <div className="task-actions">
        {!archivedView && (
          <button
            type="button"
            className="icon-btn"
            aria-label="Edit task"
            title="Edit"
            onClick={() => onEdit(task._id)}
          >
            <Icon name="edit" />
          </button>
        )}
        {archivedView ? (
          <button
            type="button"
            className="icon-btn archive"
            aria-label="Restore task"
            title="Restore"
            onClick={() => onRestore(task._id)}
          >
            <Icon name="restore" />
          </button>
        ) : (
          <button
            type="button"
            className="icon-btn archive"
            aria-label="Archive task"
            title="Archive"
            onClick={() => onArchive(task._id)}
          >
            <Icon name="archive" />
          </button>
        )}
        <button
          type="button"
          className="icon-btn delete"
          aria-label="Delete task"
          title="Delete"
          onClick={() => onDelete(task._id)}
        >
          <Icon name="trash" />
        </button>
      </div>
    </div>
  );
};

export default TaskItem;