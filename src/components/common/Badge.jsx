const colorMap = {
  primary: 'bg-primary-soft text-primary border border-primary-border',
  teal: 'bg-teal-soft text-teal border border-teal/20',
  danger: 'bg-danger/10 text-danger border border-danger/20',
  warning: 'bg-warning/10 text-warning border border-warning/20',
  info: 'bg-info/10 text-info border border-info/20',
  muted: 'bg-surface-2 text-muted border border-border',
  completed: 'bg-teal-soft text-teal border border-teal/20',
  processing: 'bg-primary-soft text-primary border border-primary-border',
  queued: 'bg-warning/10 text-warning border border-warning/20',
  failed: 'bg-danger/10 text-danger border border-danger/20',
};

export default function Badge({ children, color = 'muted', className = '', dot = false }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-chip text-xs font-medium ${colorMap[color] || colorMap.muted} ${className}`}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${color === 'completed' || color === 'teal' ? 'bg-teal' : color === 'processing' || color === 'primary' ? 'bg-primary animate-glow-pulse' : color === 'danger' || color === 'failed' ? 'bg-danger' : color === 'warning' || color === 'queued' ? 'bg-warning' : 'bg-muted'}`} />
      )}
      {children}
    </span>
  );
}
