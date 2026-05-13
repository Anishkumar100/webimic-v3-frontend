import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Copy, Check, RefreshCw } from 'lucide-react';
import IconButton from '../common/IconButton';

export default function ApiKeyPanel() {
  const [key] = useState('wmk_live_7f3a9c2b1e8d4a6f0c5e');
  const [masked, setMasked] = useState(true);
  const [copied, setCopied] = useState(false);

  const displayKey = masked ? key.slice(0, 8) + '\u2022'.repeat(16) : key;

  const handleCopy = () => {
    navigator.clipboard?.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,18,0.4)] p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h3 className="text-[15px] font-display font-semibold text-text mb-4">API Key</h3>

      <div className="flex items-center gap-2 mb-5">
        <div className="flex-1 bg-[rgba(255,255,255,0.03)] rounded-lg px-4 py-2.5 font-mono text-[13px] text-muted border border-[rgba(255,255,255,0.06)]">
          {displayKey}
        </div>
        <IconButton label={masked ? 'Show key' : 'Hide key'} onClick={() => setMasked(!masked)}>
          {masked ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </IconButton>
        <IconButton label="Copy key" onClick={handleCopy}>
          {copied ? <Check className="w-3.5 h-3.5 text-teal" /> : <Copy className="w-3.5 h-3.5" />}
        </IconButton>
      </div>

      <div className="mb-6">
        <motion.button
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-medium text-danger/80 bg-danger/[0.05] border border-danger/10 hover:bg-danger/10 transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <RefreshCw className="w-3 h-3" /> Regenerate Key
        </motion.button>
      </div>

      <div>
        <p className="text-[11px] text-muted mb-2 font-medium uppercase tracking-wider">Quick start</p>
        <pre className="bg-[rgba(0,0,0,0.3)] rounded-lg p-4 text-[12px] text-muted overflow-x-auto border border-[rgba(255,255,255,0.04)] leading-relaxed">
{`curl -X POST https://api.webimic.com/v1/jobs \\
  -H "Authorization: Bearer ${key}" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com"}'`}
        </pre>
      </div>
    </motion.div>
  );
}
