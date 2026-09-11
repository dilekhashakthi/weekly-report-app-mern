export function startOfWeekMonday(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function toISODate(date) {
  return new Date(date).toISOString().slice(0, 10);
}

export function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(date) {
  if (!date) return '';
  return new Date(date).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatWeekLabel(weekStart, weekEnd) {
  if (!weekStart) return '';
  const s = new Date(weekStart);
  const e = weekEnd ? new Date(weekEnd) : addDays(s, 4);
  const sameMonth = s.getMonth() === e.getMonth();
  const startStr = s.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const endStr = e.toLocaleDateString(undefined, sameMonth ? { day: 'numeric' } : { month: 'short', day: 'numeric' });
  return `${startStr} – ${endStr}, ${e.getFullYear()}`;
}
