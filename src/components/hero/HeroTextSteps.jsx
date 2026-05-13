import { motion } from 'framer-motion';

export default function HeroTextSteps({ step, opacity, y }) {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center"
      style={{ opacity, y }}
    >
      <div className="bg-bg/60 backdrop-blur-md rounded-modal p-6 md:p-8 border border-border/30">
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-display font-bold text-text mb-3 leading-tight">
          {step.title}
        </h1>
        <p className="text-sm md:text-base text-muted max-w-xl mx-auto leading-relaxed">
          {step.sub}
        </p>
      </div>
    </motion.div>
  );
}
