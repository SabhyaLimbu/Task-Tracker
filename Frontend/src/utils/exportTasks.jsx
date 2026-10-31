import { PRIORITY_LABEL, REPEAT_LABEL, todayKey } from './taskUtils';

const HEAD = ['Title', 'Status', 'Priority', 'Due date', 'Repeat', 'Created'];

const statusOf = (task, info) => {
  if (info?.archived) return 'Archived';
  return task.completed ? 'Completed' : 'Active';
};

const toRows = (tasks, meta) =>
  tasks.map((task) => {
    const info = meta[task._id] || {};
    return [
      task.title,
      statusOf(task, info),
      PRIORITY_LABEL[info.priority || 'medium'],
      info.due || '',
      REPEAT_LABEL[info.repeat || 'none'],
      task.createdAt ? new Date(task.createdAt).toLocaleDateString() : '',
    ];
  });

// Quote every cell, and neutralise cells that spreadsheets would treat as formulas.
const csvCell = (value) => {
  let text = String(value ?? '');
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};

const escapeHtml = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]
  );

export const exportCsv = (tasks, meta) => {
  const csv = [HEAD, ...toRows(tasks, meta)]
    .map((row) => row.map(csvCell).join(','))
    .join('\r\n');

  // BOM so Excel opens UTF-8 correctly
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `tasks-${todayKey()}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/** Opens a print-friendly page; choose "Save as PDF" in the print dialog. */
export const exportPdf = (tasks, meta) => {
  const win = window.open('', '_blank');
  if (!win) {
    alert('Please allow pop-ups for this site to export as PDF.');
    return;
  }

  const head = HEAD.map((h) => `<th>${escapeHtml(h)}</th>`).join('');
  const body = toRows(tasks, meta)
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`
    )
    .join('');

  win.document.write(`<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Tasks ${todayKey()}</title>
<style>
  body { font-family: Arial, sans-serif; color: #30283a; padding: 24px; }
  h1 { margin: 0 0 4px; font-size: 22px; }
  p { margin: 0 0 18px; color: #918796; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { padding: 8px 10px; border-bottom: 1px solid #eadfe7; text-align: left; }
  th { background: #fff0f7; color: #d93683; }
</style>
</head>
<body>
  <h1>Task Tracker</h1>
  <p>Exported ${escapeHtml(new Date().toLocaleString())} &middot; ${tasks.length} task${tasks.length === 1 ? '' : 's'}</p>
  <table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
</body>
</html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 300);
};