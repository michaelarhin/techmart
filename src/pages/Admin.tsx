import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Check, X, Loader2, Inbox } from 'lucide-react';
import { getPendingVerifications, reviewVerification } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import { fadeUp, EASE } from '../lib/motion';

interface PendingRow {
  user_id: string;
  ghana_card_number: string | null;
  ghana_card_image: string | null;
  created_at: string;
  profiles?: { full_name: string | null; email: string | null; phone: string | null; location: string | null };
}

const Admin = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<PendingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const isAdmin = !!profile?.is_admin;

  useEffect(() => {
    const load = async () => {
      if (!isAdmin) {
        setLoading(false);
        return;
      }
      const { data } = await getPendingVerifications();
      setRows((data as unknown as PendingRow[]) || []);
      setLoading(false);
    };
    load();
  }, [isAdmin]);

  const handleReview = async (userId: string, approve: boolean) => {
    setBusy(userId);
    const { error } = await reviewVerification(userId, approve);
    setBusy(null);
    if (error) {
      toast('Could not update verification', 'error');
      return;
    }
    setRows((prev) => prev.filter((r) => r.user_id !== userId));
    toast(approve ? 'Seller approved' : 'Submission rejected');
  };

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen pt-28 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-extrabold text-ink mb-2">Sign in required</h1>
        <button onClick={() => navigate('/auth')} className="btn-navy px-6 py-3 rounded-full mt-2">Sign in</button>
      </div>
    );
  }

  if (!authLoading && !isAdmin) {
    return (
      <div className="min-h-screen pt-28 flex flex-col items-center justify-center text-center px-4">
        <span className="w-16 h-16 rounded-2xl surface grid place-items-center text-ink-faint mb-5">
          <ShieldCheck className="w-7 h-7" />
        </span>
        <h1 className="text-2xl font-extrabold text-ink mb-2">Admins only</h1>
        <p className="text-ink-muted mb-6 max-w-sm">This area is for reviewing seller verifications. Ask an existing admin to grant you access.</p>
        <button onClick={() => navigate('/')} className="btn-navy px-6 py-3 rounded-full">Back home</button>
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-28 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-7">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Admin</span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-ink mt-1">Verification queue</h1>
          <p className="text-ink-muted mt-1 text-lg">Review Ghana Card submissions and approve trusted sellers.</p>
        </motion.div>

        {loading ? (
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-40 rounded-3xl surface-muted animate-pulse" />)}
          </div>
        ) : rows.length === 0 ? (
          <div className="surface rounded-4xl text-center py-16">
            <span className="w-14 h-14 mx-auto rounded-2xl surface-muted grid place-items-center text-ink-faint mb-4">
              <Inbox className="w-7 h-7" />
            </span>
            <h3 className="text-lg font-bold text-ink mb-1">All caught up</h3>
            <p className="text-ink-muted">No pending verifications right now.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence>
              {rows.map((r) => (
                <motion.div
                  key={r.user_id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="surface rounded-3xl p-5 flex flex-col sm:flex-row gap-5"
                >
                  {r.ghana_card_image && (
                    <a href={r.ghana_card_image} target="_blank" rel="noopener noreferrer" className="shrink-0">
                      <img src={r.ghana_card_image} alt="Ghana Card" className="w-full sm:w-48 h-32 object-cover rounded-2xl border border-line" />
                    </a>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-ink">{r.profiles?.full_name || 'Unnamed user'}</h3>
                    <div className="text-sm text-ink-muted mt-1 space-y-0.5">
                      {r.profiles?.email && <p className="truncate">{r.profiles.email}</p>}
                      {r.profiles?.phone && <p>{r.profiles.phone}</p>}
                      {r.profiles?.location && <p>{r.profiles.location}</p>}
                      <p className="font-mono text-ink-soft">{r.ghana_card_number}</p>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleReview(r.user_id, true)}
                        disabled={busy === r.user_id}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 text-sm font-semibold transition-colors disabled:opacity-50"
                      >
                        {busy === r.user_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Approve
                      </button>
                      <button
                        onClick={() => handleReview(r.user_id, false)}
                        disabled={busy === r.user_id}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 text-sm font-semibold transition-colors disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
