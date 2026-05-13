import Badge from '../common/Badge';

const statusConfig = {
  completed: { label: 'Completed', color: 'completed' },
  processing: { label: 'Processing', color: 'processing' },
  queued: { label: 'Queued', color: 'queued' },
  failed: { label: 'Failed', color: 'failed' },
};

export default function JobStatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.queued;
  return <Badge color={config.color} dot>{config.label}</Badge>;
}
