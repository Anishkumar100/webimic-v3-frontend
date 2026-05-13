import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Copy, Check, RefreshCw, Loader2 } from 'lucide-react';
import IconButton from '../common/IconButton';
import { api } from '../../lib/api.js';

export default function ApiKeyPanel() {
  const [keyData, setKeyData] = useState(null);
  const [newRawKey, setNewRawKey] = useState(null);
  const [masked, setMasked] = useState(true);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/v1/settings/api-key').then(setKeyData).catch(() => {});
  }, []);

  const displayValue = newRawKey || keyData?.keyPrefix || 'wmk_live_...';
  const displayKey = masked && !newRawKey ? displayValue.slice(0, 8) + '\u2022'.repeat(16) : displayValue;

  const handleCopy = () => {
    const valueToCopy = newRawKey || keyData?.keyPrefix || '';
    navigator.clipboard?.writeText(valueToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    setMessage('');
    try {
      const result = await api.post('/v1/settings/api-key/regenerate');
      setNewRawKey(result.rawKey);
      setKeyData((prev) => ({ ...prev, keyPrefix: result.keyPrefix }));
      setMasked(false); // Show the new key immediately
      setMessage('API key regenerated. Save it now.');
    } catch (e) {
      setMessage(e.message);
    }
    setRegenerating(false);
  };

  const handleRevoke = async () => {
    setRevoking(true);
    setMessage('');
    try {
      await api.delete('/v1/settings/api-key');
      setNewRawKey(null);
      setKeyData({ keyPrefix: null, createdAt: null, lastUsedAt: null, totalRequests: 0 });
      setMessage('API key revoked.');
    } catch (e) {
      setMessage(e.message);
    }
    setRevoking(false);
  };

  return (
    <motion.div
      className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,18,0.4)] p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h3 className="text-[15px] font-display font-semibold text-text mb-4">API Key</h3>

      {newRawKey && (
        <div className="mb-4 p-3 bg-teal/[0.05] border border-teal/20 rounded-lg text-[12px] text-teal">
          ⚠️ Save this key now — it won't be shown again!
        </div>
      )}

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
          onClick={handleRegenerate}
          disabled={regenerating}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-medium text-danger/80 bg-danger/[0.05] border border-danger/10 hover:bg-danger/10 transition-all disabled:opacity-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {regenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          {regenerating ? 'Regenerating...' : 'Regenerate Key'}
        </motion.button>
        <motion.button
          onClick={handleRevoke}
          disabled={revoking}
          className="ml-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-medium text-muted bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] transition-all disabled:opacity-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {revoking ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
          {revoking ? 'Revoking...' : 'Revoke Key'}
        </motion.button>
        {message && <p className="mt-3 text-[12px] text-muted">{message}</p>}
      </div>

      <div>
        <p className="text-[11px] text-muted mb-2 font-medium uppercase tracking-wider">Quick start</p>
        <pre className="bg-[rgba(0,0,0,0.3)] rounded-lg p-4 text-[12px] text-muted overflow-x-auto border border-[rgba(255,255,255,0.04)] leading-relaxed">
{`curl -X POST https://api.webimic.com/v1/jobs \\
  -H "Authorization: Bearer ${displayValue}" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com"}'`}
        </pre>
      </div>
    </motion.div>
  );
}
