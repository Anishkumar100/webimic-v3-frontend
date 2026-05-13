import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Users, CreditCard, Key } from 'lucide-react';
import ApiKeyPanel from '../components/dashboard/ApiKeyPanel';
import { settingsBilling } from '../assets/index';
import { api } from '../lib/api.js';
import { useAuthStore } from '../store/useAuthStore';

const tabs = [
  { id: 'profile', label: 'Profile', Icon: User },
  { id: 'team', label: 'Team', Icon: Users },
  { id: 'billing', label: 'Billing', Icon: CreditCard },
  { id: 'api', label: 'API', Icon: Key },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('api');
  const [profile, setProfile] = useState({ name: '', email: '', company: '' });
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const refreshMe = useAuthStore((s) => s.refreshMe);

  useEffect(() => {
    const load = async () => {
      try {
        const [profileData, usageData] = await Promise.all([
          api.get('/v1/settings/profile'),
          api.get('/v1/settings/usage'),
        ]);
        setProfile({
          name: profileData.name || '',
          email: profileData.email || '',
          company: profileData.company || '',
        });
        setUsage(usageData);
      } catch {
        // Page-level error UI can be added later.
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    setMessage('');
    try {
      await api.patch('/v1/settings/profile', profile);
      await refreshMe();
      setMessage('Profile updated successfully.');
    } catch (e) {
      setMessage(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pt-20 px-5 sm:px-6 lg:px-8 pb-12 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="pt-4">
        <h1 className="text-xl font-display font-bold text-text mb-6">Settings</h1>
      </motion.div>

      <div className="flex items-center gap-0.5 bg-[rgba(255,255,255,0.02)] rounded-xl p-1 mb-7 border border-[rgba(255,255,255,0.04)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id ? 'text-text' : 'text-muted hover:text-text'
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="settings-tab"
                className="absolute inset-0 bg-[rgba(255,255,255,0.05)] rounded-lg border border-[rgba(255,255,255,0.06)]"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <tab.Icon className="w-3.5 h-3.5 relative z-10" strokeWidth={1.5} />
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {activeTab === 'profile' && (
            <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,18,0.4)] p-6 space-y-5">
              <h2 className="text-[15px] font-display font-semibold text-text">Profile</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-muted mb-1.5 uppercase tracking-wider">Display Name</label>
                  <input type="text" value={profile.name} onChange={(e) => setProfile((s) => ({ ...s, name: e.target.value }))} className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-lg px-4 py-2.5 text-[13px] text-text focus:outline-none focus:border-[rgba(124,111,255,0.3)] transition-all" />
                </div>
                <div>
                  <label className="block text-[11px] text-muted mb-1.5 uppercase tracking-wider">Email</label>
                  <input type="email" value={profile.email} onChange={(e) => setProfile((s) => ({ ...s, email: e.target.value }))} className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-lg px-4 py-2.5 text-[13px] text-text focus:outline-none focus:border-[rgba(124,111,255,0.3)] transition-all" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-muted mb-1.5 uppercase tracking-wider">Company</label>
                  <input type="text" value={profile.company} onChange={(e) => setProfile((s) => ({ ...s, company: e.target.value }))} className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-lg px-4 py-2.5 text-[13px] text-text focus:outline-none focus:border-[rgba(124,111,255,0.3)] transition-all" />
                </div>
              </div>
              {message && <p className="text-[12px] text-muted">{message}</p>}
              <motion.button disabled={saving || loading} onClick={saveProfile} className="btn-primary text-[12px] disabled:opacity-50" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>{saving ? 'Saving...' : 'Save Changes'}</motion.button>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,18,0.4)] p-6 space-y-4">
              <h2 className="text-[15px] font-display font-semibold text-text">Team Members</h2>
              {[
                { name: 'Alice Chen', role: 'Admin', initials: 'AC' },
                { name: 'Bob Park', role: 'Editor', initials: 'BP' },
                { name: 'Charlie Kim', role: 'Viewer', initials: 'CK' },
              ].map((m) => (
                <div key={m.name} className="flex items-center justify-between py-3 border-b border-[rgba(255,255,255,0.04)] last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/60 to-teal/60 flex items-center justify-center text-[10px] font-bold text-white">
                      {m.initials}
                    </div>
                    <div>
                      <span className="text-[13px] text-text block leading-tight">{m.name}</span>
                      <span className="text-[11px] text-faint">{m.role}</span>
                    </div>
                  </div>
                  <button className="text-[11px] text-muted hover:text-text transition-colors">Edit</button>
                </div>
              ))}
              <motion.button className="btn-secondary text-[12px]" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>Invite Member</motion.button>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-5">
              <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,18,0.4)] p-6">
                <h2 className="text-[15px] font-display font-semibold text-text mb-4">Current Plan</h2>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-base font-display font-bold text-text">{usage?.plan ? `${usage.plan[0].toUpperCase()}${usage.plan.slice(1)} Plan` : 'Plan'}</p>
                    <p className="text-[13px] text-muted">
                      {usage?.renewsAt ? `Renews ${new Date(usage.renewsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Usage summary'}
                    </p>
                  </div>
                  <motion.button disabled className="btn-secondary text-[12px] opacity-60 cursor-not-allowed" whileHover={{ scale: 1.02 }}>Change Plan</motion.button>
                </div>
                <div className="h-1.5 bg-[rgba(255,255,255,0.04)] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-teal rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${Math.min(100, usage?.percentUsed || 0)}%` }}
                    transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <p className="text-[11px] text-muted mt-2">
                  {usage ? `${usage.jobsUsedThisMonth} of ${usage.monthlyJobLimit === null || usage.monthlyJobLimit === undefined ? 'unlimited' : usage.monthlyJobLimit} jobs used this month` : 'Loading usage...'}
                </p>
              </div>
              {settingsBilling && (
                <motion.div className="rounded-xl overflow-hidden border border-[rgba(255,255,255,0.06)]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                  <img src={settingsBilling} alt="Settings and billing UI" className="w-full h-auto" />
                </motion.div>
              )}
            </div>
          )}

          {activeTab === 'api' && <ApiKeyPanel />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
