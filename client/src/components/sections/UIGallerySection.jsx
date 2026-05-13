import { motion } from 'framer-motion';
import SectionShell from '../layout/SectionShell';
import SectionHeading from '../common/SectionHeading';
import {
  dashboardOverview, jobDetailToken, jobListEmpty,
  settingsBilling, sampleReport, productUIStrategy, reverseEngVis,
} from '../../assets/index';

const screens = [
  { image: dashboardOverview, title: 'Dashboard Overview', span: 'lg:col-span-2' },
  { image: jobDetailToken, title: 'Job Detail — Token Catalog', span: '' },
  { image: sampleReport, title: 'Sample Report Preview', span: '' },
  { image: productUIStrategy, title: 'Product UI Strategy', span: '' },
  { image: reverseEngVis, title: 'Reverse-Engineering Flow', span: '' },
  { image: settingsBilling, title: 'Settings & Billing', span: 'lg:col-span-2' },
  { image: jobListEmpty, title: 'Empty State', span: '' },
].filter((s) => s.image);

export default function UIGallerySection() {
  return (
    <SectionShell id="ui-gallery" className="glow-violet">
      <SectionHeading
        tag="Product Preview"
        title="Designed for clarity and speed"
        description="Every screen in Webimic is crafted for fast, focused workflows — from job submission to PDF export."
      />

      {/* Masonry-style grid — no horizontal scroll */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
        {screens.map((screen, i) => (
          <motion.div
            key={screen.title}
            className={`${screen.span} perspective-[1000px] h-full`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="glow-card block h-full">
              <div className="glow-card-inner bg-[#0a0a18] rounded-xl overflow-hidden border border-white/5 h-full group">
                <motion.div
                  className="relative h-full flex flex-col"
                  whileHover={{ rotateY: i % 2 === 0 ? 3 : -3, rotateX: 3, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <img
                    src={screen.image}
                    alt={screen.title}
                    className="w-full h-auto flex-1 object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                    loading="lazy"
                  />
                  {/* Title overlay with godly glow */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                    <p className="text-[14px] font-display font-bold text-white tracking-wide group-hover:text-primary transition-colors">{screen.title}</p>
                  </div>
                  {/* Hover extreme overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-teal/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}
