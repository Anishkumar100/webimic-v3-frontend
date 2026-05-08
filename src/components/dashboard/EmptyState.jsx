import { motion } from 'framer-motion';
import Button from '../common/Button';
import { jobListEmpty } from '../../assets/index';
import { Plus } from 'lucide-react';

export default function EmptyState({ title = 'No jobs yet', description = 'Submit your first URL to start reverse-engineering.' }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-20 text-center"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {jobListEmpty && (
        <motion.img
          src={jobListEmpty}
          alt="Empty state"
          className="w-56 h-auto mb-6 rounded-xl border border-[rgba(255,255,255,0.06)] opacity-50"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      <h3 className="text-lg font-display font-bold text-text mb-1.5">{title}</h3>
      <p className="text-[13px] text-muted mb-6 max-w-sm">{description}</p>
      <motion.button className="btn-primary text-[12px]" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
        <Plus className="w-3.5 h-3.5" /> Submit a URL
      </motion.button>
    </motion.div>
  );
}
