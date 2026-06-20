import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, Phone, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { EASE } from '../lib/motion';

type AuthMode = 'email' | 'phone';
type PhoneStep = 'number' | 'otp';

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle, signInWithPhone, verifyOtp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('email');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneStep, setPhoneStep] = useState<PhoneStep>('number');
  const [otpCode, setOtpCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // 2-step verification at sign-in
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [mfaChallengeId, setMfaChallengeId] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState('');

  // After a password sign-in, route through 2FA if the account requires it.
  const proceedAfterSignIn = async () => {
    const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (data && data.nextLevel === 'aal2' && data.nextLevel !== data.currentLevel) {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totp = factors?.totp?.find((f) => f.status === 'verified');
      if (!totp) {
        navigate('/');
        return;
      }
      const { data: challenge } = await supabase.auth.mfa.challenge({ factorId: totp.id });
      setMfaFactorId(totp.id);
      setMfaChallengeId(challenge?.id ?? null);
      setMfaRequired(true);
      return;
    }
    navigate('/');
  };

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaFactorId || !mfaChallengeId) return;
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.mfa.verify({
      factorId: mfaFactorId,
      challengeId: mfaChallengeId,
      code: mfaCode,
    });
    setLoading(false);
    if (error) setError(error.message);
    else navigate('/');
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, fullName);
        if (error) setError(error.message);
        else navigate('/');
      } else {
        const { error } = await signIn(email, password);
        if (error) setError(error.message);
        else await proceedAfterSignIn();
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) setError(error.message);
    } catch {
      setError('Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+233${phoneNumber.replace(/^0/, '')}`;
    try {
      const { error } = await signInWithPhone(formattedPhone);
      if (error) setError(error.message);
      else {
        setPhoneStep('otp');
        setMessage('Verification code sent to your phone');
      }
    } catch {
      setError('Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+233${phoneNumber.replace(/^0/, '')}`;
    try {
      const { error } = await verifyOtp(formattedPhone, otpCode);
      if (error) setError(error.message);
      else navigate('/');
    } catch {
      setError('Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setError(null);
    setMessage(null);
    setPhoneStep('number');
    setOtpCode('');
  };

  const formMotion = {
    initial: { opacity: 0, x: -8 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 8 },
    transition: { duration: 0.3, ease: EASE },
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative w-full max-w-md"
      >
        <Link to="/" className="inline-flex items-center gap-2 text-ink-muted hover:text-ink mb-6 transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="flex items-center justify-center gap-2.5 mb-7">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-navy-600 overflow-hidden">
            <img src="/images/logo.png" alt="TechMart" className="w-6 h-6 object-contain" />
          </span>
          <span className="text-xl font-extrabold tracking-tight text-ink">TechMart</span>
        </div>

        <div className="surface rounded-4xl p-8">
          {mfaRequired ? (
            <div>
              <div className="text-center mb-6">
                <span className="w-14 h-14 mx-auto rounded-2xl surface-muted grid place-items-center text-navy-600 mb-3">
                  <ShieldCheck className="w-7 h-7" />
                </span>
                <h1 className="text-2xl font-extrabold text-ink mb-1.5">Two-step verification</h1>
                <p className="text-ink-muted">Enter the 6-digit code from your authenticator app.</p>
              </div>
              {error && (
                <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
              )}
              <form onSubmit={handleMfaVerify} className="space-y-4">
                <input
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="field w-full px-4 py-4 text-center text-2xl font-bold tracking-[0.5em]"
                  placeholder="000000"
                  maxLength={6}
                  autoFocus
                />
                <button type="submit" disabled={loading || mfaCode.length !== 6} className="w-full py-3 btn-navy rounded-2xl transition-colors disabled:opacity-50">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" />Verifying…</span>
                  ) : 'Verify & continue'}
                </button>
              </form>
            </div>
          ) : (
          <>
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-ink mb-1.5">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-ink-muted">
              {isSignUp ? 'Join the community in a minute.' : 'Sign in to pick up where you left off.'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 border border-line bg-surface hover:shadow-pill text-ink font-semibold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className="relative flex items-center my-6">
            <div className="flex-1 border-t border-line" />
            <span className="px-4 text-sm text-ink-faint">or</span>
            <div className="flex-1 border-t border-line" />
          </div>

          <div className="flex gap-1 p-1 surface-muted rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => { setAuthMode('email'); resetForm(); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                authMode === 'email' ? 'bg-surface text-ink shadow-pill' : 'text-ink-muted hover:text-ink'
              }`}
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('phone'); resetForm(); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                authMode === 'phone' ? 'bg-surface text-ink shadow-pill' : 'text-ink-muted hover:text-ink'
              }`}
            >
              <Phone className="w-4 h-4" />
              Phone
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm"
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {authMode === 'email' && (
              <motion.form key="email-form" {...formMotion} onSubmit={handleEmailSubmit} className="space-y-4">
                {isSignUp && (
                  <div>
                    <label className="block text-sm font-semibold text-ink-soft mb-2">Full name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-faint" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="field w-full pl-12 pr-4 py-3"
                        placeholder="Your full name"
                        required={isSignUp}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-ink-soft mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-faint" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="field w-full pl-12 pr-4 py-3"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-ink-soft mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-faint" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="field w-full pl-12 pr-12 py-3"
                      placeholder="Enter password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-ink-faint mt-1.5">Minimum 6 characters</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 btn-navy rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing…
                    </span>
                  ) : isSignUp ? 'Create account' : 'Sign in'}
                </button>
              </motion.form>
            )}

            {authMode === 'phone' && phoneStep === 'number' && (
              <motion.form key="phone-form" {...formMotion} onSubmit={handlePhoneSendOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-ink-soft mb-2">Phone number</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted text-sm font-semibold">+233</span>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="field w-full pl-16 pr-4 py-3"
                      placeholder="XX XXX XXXX"
                      required
                    />
                  </div>
                  <p className="text-xs text-ink-faint mt-1.5">We'll text you a verification code.</p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !phoneNumber.trim()}
                  className="w-full py-3 btn-navy rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending code…
                    </span>
                  ) : 'Send verification code'}
                </button>
              </motion.form>
            )}

            {authMode === 'phone' && phoneStep === 'otp' && (
              <motion.form key="otp-form" {...formMotion} onSubmit={handlePhoneVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-ink-soft mb-2">Verification code</label>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="field w-full px-4 py-4 text-center text-2xl font-bold tracking-[0.5em]"
                    placeholder="000000"
                    maxLength={6}
                    required
                    autoFocus
                  />
                  <p className="text-xs text-ink-faint mt-2">
                    Enter the 6-digit code sent to +233{phoneNumber}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length !== 6}
                  className="w-full py-3 btn-navy rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying…
                    </span>
                  ) : 'Verify & sign in'}
                </button>

                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => { setPhoneStep('number'); setOtpCode(''); setError(null); setMessage(null); }}
                    className="text-ink-muted hover:text-ink transition-colors font-medium"
                  >
                    ← Change number
                  </button>
                  <button
                    type="button"
                    onClick={handlePhoneSendOtp}
                    disabled={loading}
                    className="text-navy-600 hover:text-navy-500 transition-colors disabled:opacity-50 font-semibold"
                  >
                    Resend code
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {authMode === 'email' && (
            <div className="mt-6 text-center">
              <p className="text-ink-muted text-sm">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                <button
                  type="button"
                  onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                  className="ml-2 text-navy-600 hover:text-navy-500 font-semibold transition-colors"
                >
                  {isSignUp ? 'Sign in' : 'Sign up'}
                </button>
              </p>
            </div>
          )}
          </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
