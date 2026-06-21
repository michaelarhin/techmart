import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Lock,
  Loader2,
  Check,
  X,
  KeyRound,
} from 'lucide-react';
import { supabase, updateProfile } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { fadeUp, stagger, item, EASE } from '../lib/motion';

const Settings = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();

  // --- profile basics ---
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // --- 2FA ---
  const [totpFactorId, setTotpFactorId] = useState<string | null>(null);
  const [enroll, setEnroll] = useState<{ factorId: string; qr: string; secret: string } | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaBusy, setMfaBusy] = useState(false);
  const [mfaError, setMfaError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setLocation(profile.location || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  const loadFactors = async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    const verified = data?.totp?.find((f) => f.status === 'verified');
    setTotpFactorId(verified?.id ?? null);
  };

  useEffect(() => {
    if (user) loadFactors();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen pt-28 flex flex-col items-center justify-center text-center px-4">
        <span className="w-16 h-16 rounded-2xl surface grid place-items-center text-ink-faint mb-5">
          <User className="w-7 h-7" />
        </span>
        <h1 className="text-2xl font-extrabold text-ink mb-2">Sign in required</h1>
        <p className="text-ink-muted mb-6">Please sign in to manage your settings.</p>
        <button onClick={() => navigate('/auth')} className="btn-navy px-6 py-3 rounded-full transition-colors">
          Sign in
        </button>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileSaved(false);
    await updateProfile(user.id, { full_name: fullName, phone, location, bio });
    await refreshProfile();
    setSavingProfile(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  // --- 2FA actions ---
  const startEnroll = async () => {
    setMfaError(null);
    setMfaBusy(true);
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: `TechMart ${Date.now()}`,
    });
    setMfaBusy(false);
    if (error || !data) {
      setMfaError(error?.message || 'Could not start 2FA setup.');
      return;
    }
    setEnroll({ factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  };

  const confirmEnroll = async () => {
    if (!enroll) return;
    setMfaError(null);
    setMfaBusy(true);
    const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId: enroll.factorId });
    if (cErr || !challenge) {
      setMfaBusy(false);
      setMfaError(cErr?.message || 'Could not verify the code.');
      return;
    }
    const { error: vErr } = await supabase.auth.mfa.verify({
      factorId: enroll.factorId,
      challengeId: challenge.id,
      code: mfaCode,
    });
    setMfaBusy(false);
    if (vErr) {
      setMfaError(vErr.message);
      return;
    }
    await updateProfile(user.id, { two_factor_enabled: true });
    await refreshProfile();
    setEnroll(null);
    setMfaCode('');
    await loadFactors();
  };

  const disable2fa = async () => {
    if (!totpFactorId) return;
    setMfaBusy(true);
    await supabase.auth.mfa.unenroll({ factorId: totpFactorId });
    await updateProfile(user.id, { two_factor_enabled: false });
    await refreshProfile();
    setMfaBusy(false);
    await loadFactors();
  };

  return (
    <div className="pt-24 md:pt-28 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-7">
          <h1 className="text-3xl md:text-4xl font-extrabold text-ink">Settings</h1>
          <p className="text-ink-muted mt-1 text-lg">Manage your profile and security.</p>
        </motion.div>

        <motion.div variants={stagger(0.06)} initial="hidden" animate="show" className="flex flex-col gap-5">
          {/* Two-factor */}
          <motion.section variants={item} className="surface rounded-3xl p-6 sm:p-7">
            <div className="flex items-center gap-3 mb-4">
              <span className={`w-11 h-11 rounded-2xl grid place-items-center ${totpFactorId ? 'bg-emerald-500/15 text-emerald-600' : 'surface-muted text-navy-600'}`}>
                <Lock className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-ink">Two-step verification</h2>
                <p className="text-sm text-ink-muted">Protect your account with an authenticator app.</p>
              </div>
              {totpFactorId && (
                <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-600 text-sm font-semibold">
                  <Check className="w-4 h-4" /> On
                </span>
              )}
            </div>

            {totpFactorId ? (
              <button
                onClick={disable2fa}
                disabled={mfaBusy}
                className="px-5 py-2.5 rounded-full border border-line bg-surface text-ink font-semibold text-sm hover:shadow-pill transition-shadow disabled:opacity-50 inline-flex items-center gap-2"
              >
                {mfaBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                Turn off 2FA
              </button>
            ) : (
              <AnimatePresence mode="wait">
                {!enroll ? (
                  <motion.div key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <button
                      onClick={startEnroll}
                      disabled={mfaBusy}
                      className="btn-navy px-6 py-3 rounded-full transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                    >
                      {mfaBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                      Enable 2FA
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="enroll"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="flex flex-col sm:flex-row gap-6"
                  >
                    <div className="shrink-0">
                      <img src={enroll.qr} alt="Scan with your authenticator app" className="w-40 h-40 rounded-2xl bg-white p-2 border border-line" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-ink-muted mb-2">
                        Scan the QR with Google Authenticator, Authy or 1Password. Can't scan? Enter this key:
                      </p>
                      <code className="block text-xs font-mono bg-canvas rounded-lg px-3 py-2 text-ink-soft break-all mb-3">
                        {enroll.secret}
                      </code>
                      <label className="block text-sm font-semibold text-ink-soft mb-2">Enter the 6-digit code</label>
                      <input
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        className="field w-full px-4 py-3 text-center text-xl font-bold tracking-[0.4em]"
                        maxLength={6}
                      />
                      {mfaError && <p className="text-sm text-red-500 mt-2">{mfaError}</p>}
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={confirmEnroll}
                          disabled={mfaBusy || mfaCode.length !== 6}
                          className="btn-navy px-5 py-2.5 rounded-full text-sm transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                        >
                          {mfaBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          Confirm
                        </button>
                        <button
                          onClick={() => { setEnroll(null); setMfaCode(''); setMfaError(null); }}
                          className="px-5 py-2.5 rounded-full border border-line bg-surface text-ink-soft font-semibold text-sm hover:bg-canvas transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
            {mfaError && !enroll && <p className="text-sm text-red-500 mt-2">{mfaError}</p>}
          </motion.section>

          {/* Profile basics */}
          <motion.section variants={item} className="surface rounded-3xl p-6 sm:p-7">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-11 h-11 rounded-2xl surface-muted text-navy-600 grid place-items-center">
                <User className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-ink">Profile</h2>
                <p className="text-sm text-ink-muted">{profile?.email}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-ink-soft mb-2">Full name</label>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="field w-full px-4 py-3" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-soft mb-2">Phone</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="field w-full px-4 py-3" placeholder="+233…" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-ink-soft mb-2">Location</label>
                <input value={location} onChange={(e) => setLocation(e.target.value)} className="field w-full px-4 py-3" placeholder="Accra, Greater Accra" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-ink-soft mb-2">Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="field w-full px-4 py-3 h-24 resize-none" placeholder="A little about you" />
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="btn-navy px-6 py-3 rounded-full transition-colors disabled:opacity-50 inline-flex items-center gap-2 mt-5"
            >
              {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : profileSaved ? <Check className="w-4 h-4" /> : null}
              {profileSaved ? 'Saved' : 'Save changes'}
            </button>
          </motion.section>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
