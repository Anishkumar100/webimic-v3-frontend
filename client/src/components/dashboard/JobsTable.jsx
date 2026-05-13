import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useJobsStore } from '../../store/useJobsStore';

const statusStyles = {
  completed: 'bg-teal/[0.08] text-teal border-teal/[0.12]',
  processing: 'bg-primary/[0.08] text-primary border-primary/[0.12]',
  queued: 'bg-info/[0.08] text-info border-info/[0.12]',
  failed: 'bg-danger/[0.08] text-danger border-danger/[0.12]',
};

export default function JobsTable({ jobs }) {
  const navigate = useNavigate();
  const { retryJob, deleteJob } = useJobsStore();
  return (
    <div className="rounded-xl border border-white/[0.06] bg-surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-white/[0.04]">
              <th className="text-left px-5 py-3 font-display font-semibold text-faint text-[10px] uppercase tracking-[0.1em]">Name</th>
              <th className="text-left px-5 py-3 font-display font-semibold text-faint text-[10px] uppercase tracking-[0.1em] hidden sm:table-cell">URL</th>
              <th className="text-left px-5 py-3 font-display font-semibold text-faint text-[10px] uppercase tracking-[0.1em]">Status</th>
              <th className="text-left px-5 py-3 font-display font-semibold text-faint text-[10px] uppercase tracking-[0.1em] hidden lg:table-cell">Date</th>
              <th className="text-right px-5 py-3 font-display font-semibold text-faint text-[10px] uppercase tracking-[0.1em]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job, i) => {
              const badge = statusStyles[job.status] || statusStyles.queued;
              return (
                <motion.tr
                  key={job.id}
                  className="border-b border-white/[0.03] cursor-pointer hover:bg-white/[0.02] group"
                  onClick={() => navigate(`/app/jobs/${job.id}`)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ x: 2 }}
                >
                  <td className="px-5 py-3.5"><span className="font-display font-semibold text-text group-hover:text-primary transition-colors">{job.name}</span></td>
                  <td className="px-5 py-3.5 hidden sm:table-cell"><span className="text-muted text-[12px] font-mono truncate block max-w-[180px]">{job.url}</span></td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell"><span className="text-muted text-[12px]">{new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex justify-end gap-3">
                      {job.status === 'failed' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            retryJob(job.id);
                          }}
                          className="text-primary hover:text-primary/80 text-[11px] font-semibold"
                        >
                          Retry
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Are you sure you want to delete this job?')) {
                            deleteJob(job.id);
                          }
                        }}
                        className="text-danger hover:text-danger/80 text-[11px] font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
