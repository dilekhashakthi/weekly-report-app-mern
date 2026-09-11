const CONFIG = {
  draft: { label: 'Draft', dot: 'bg-status-draft', text: 'text-status-draft', bg: 'bg-gray-100' },
  submitted: { label: 'Submitted', dot: 'bg-status-submitted', text: 'text-status-submitted', bg: 'bg-blue-50' },
  needs_correction: {
    label: 'Needs Correction',
    dot: 'bg-status-correction',
    text: 'text-status-correction',
    bg: 'bg-amber-50',
  },
  approved: { label: 'Approved', dot: 'bg-status-approved', text: 'text-status-approved', bg: 'bg-green-50' },
  not_started: { label: 'Not Started', dot: 'bg-gray-300', text: 'text-gray-500', bg: 'bg-gray-50' },
};

const StatusBadge = ({ status, className = '' }) => {
  const cfg = CONFIG[status] || CONFIG.not_started;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${cfg.bg} ${cfg.text} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

export default StatusBadge;
