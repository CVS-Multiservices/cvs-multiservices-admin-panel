import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Mail, CheckCircle2, AlertCircle,
  Loader2, KeyRound, Lock, Eye, EyeOff,
  ShieldCheck, RefreshCw, Timer,
} from 'lucide-react';
import { authApi } from '../../services/api';
import { Page } from '../../types';

interface ForgotPasswordPageProps {
  setCurrentPage: (page: Page) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

type Step = 'email' | 'otp' | 'reset' | 'success';

export function ForgotPasswordPage({
  setCurrentPage,
  showToast,
}: ForgotPasswordPageProps) {
  // ── State ──────────────────────────────────────────────
  const [step, setStep]                     = useState<Step>('email');
  const [email, setEmail]                   = useState('');
  const [otp, setOtp]                       = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword]       = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew]               = useState(false);
  const [showConfirm, setShowConfirm]       = useState(false);
  const [resetToken, setResetToken]         = useState('');
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');
  const [otpTimer, setOtpTimer]             = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpAttempts, setOtpAttempts]       = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const resendRef = useRef<NodeJS.Timeout | null>(null);

  // ── OTP Expiry Timer ───────────────────────────────────
  useEffect(() => {
    if (otpTimer > 0) {
      timerRef.current = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [otpTimer]);

  // ── Resend Cooldown Timer ──────────────────────────────
  useEffect(() => {
    if (resendCooldown > 0) {
      resendRef.current = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(resendRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (resendRef.current) clearInterval(resendRef.current);
    };
  }, [resendCooldown]);

  // ── Format timer ──────────────────────────────────────
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ── Password Strength ─────────────────────────────────
  const getStrength = (pwd: string) => {
    if (!pwd) return { label: '', color: '', width: '0%' };
    if (pwd.length < 6) return { label: 'Too short', color: '#ef4444', width: '20%' };
    if (pwd.length < 8) return { label: 'Weak', color: '#f97316', width: '40%' };
    const checks = [/[A-Z]/, /[a-z]/, /\d/, /[^A-Za-z0-9]/];
    const score = checks.filter((r) => r.test(pwd)).length;
    if (score <= 2) return { label: 'Fair', color: '#eab308', width: '60%' };
    if (score === 3) return { label: 'Good', color: '#22c55e', width: '80%' };
    return { label: 'Strong', color: '#10b981', width: '100%' };
  };

  const strength = getStrength(newPassword);

  // ── OTP Input Handlers ─────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (error) setError('');

    // Allow only digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Backspace → go to previous
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const digits = pasted.split('');
      setOtp(digits);
      otpRefs.current[5]?.focus();
    }
  };

  // ── Step 1: Send OTP ──────────────────────────────────
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const result = await authApi.sendOtp(email.trim().toLowerCase());

      if (result.success) {
        setStep('otp');
        setOtpTimer(result.expiresIn || 600);
        setResendCooldown(60);
        setOtp(['', '', '', '', '', '']);
        setOtpAttempts(0);
        showToast('Verification code sent to your email!', 'success');
        // Focus first OTP input after render
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else {
        if (result.retryAfter) {
          setResendCooldown(result.retryAfter);
        }
        setError(result.message || 'Failed to send code');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ─────────────────────────────────
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const result = await authApi.verifyOtp(email.trim().toLowerCase(), otpValue);

      if (result.success && result.resetToken) {
        setResetToken(result.resetToken);
        setStep('reset');
        showToast('Code verified! Set your new password.', 'success');
      } else {
        setOtpAttempts((prev) => prev + 1);

        if (result.locked) {
          setError(result.message || 'Too many attempts. Please try again later.');
        } else {
          setError(result.message || 'Invalid code');
          // Clear OTP inputs
          setOtp(['', '', '', '', '', '']);
          otpRefs.current[0]?.focus();
        }
      }
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Reset Password ─────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword) { setError('New password is required'); return; }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }

    setLoading(true);
    try {
      const result = await authApi.resetPassword({
        resetToken,
        newPassword,
      });

      if (result.success) {
        setStep('success');
        showToast('Password reset successfully!', 'success');
      } else {
        setError(result.message || 'Failed to reset password');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setOtp(['', '', '', '', '', '']);
    setError('');
    await handleSendOtp();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Back Button */}
        {step !== 'success' && (
          <button
            onClick={() => {
              if (step === 'otp') setStep('email');
              else if (step === 'reset') setStep('otp');
              else setCurrentPage('login');
            }}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            {step === 'email' ? 'Back to Login' : step === 'otp' ? 'Change Email' : 'Back to Verification'}
          </button>
        )}

        {/* ── Progress Steps ── */}
        {step !== 'success' && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {['email', 'otp', 'reset'].map((s, idx) => (
              <React.Fragment key={s}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s
                    ? 'bg-blue-600 text-white ring-2 ring-blue-400/50'
                    : ['email', 'otp', 'reset'].indexOf(step) > idx
                    ? 'bg-emerald-500/30 text-emerald-400 border border-emerald-500/40'
                    : 'bg-white/10 text-slate-500 border border-white/10'
                }`}>
                  {['email', 'otp', 'reset'].indexOf(step) > idx ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    idx + 1
                  )}
                </div>
                {idx < 2 && (
                  <div className={`w-12 h-0.5 rounded-full transition-all ${
                    ['email', 'otp', 'reset'].indexOf(step) > idx
                      ? 'bg-emerald-500/50'
                      : 'bg-white/10'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl">

          {/* ════════════ STEP 1: EMAIL ════════════ */}
          {step === 'email' && (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-500/20 rounded-2xl mb-4 border border-amber-500/30">
                  <Mail className="w-7 h-7 text-amber-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Forgot Password?
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Enter your admin email and we'll send a 6-digit
                  verification code.
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm mb-5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSendOtp} className="space-y-5" noValidate>
                <div>
                  <label htmlFor="reset-email" className="block text-sm font-medium text-slate-300 mb-2">
                    Registered Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    <input
                      id="reset-email"
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                      autoFocus
                      autoComplete="email"
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
                      placeholder="admin@cvs.com"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition shadow-lg shadow-blue-600/30 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /><span>Sending Code...</span></>
                  ) : (
                    <><KeyRound className="w-4 h-4" /><span>Send Verification Code</span></>
                  )}
                </button>
              </form>
            </>
          )}

          {/* ════════════ STEP 2: OTP ════════════ */}
          {step === 'otp' && (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-500/20 rounded-2xl mb-4 border border-blue-500/30">
                  <KeyRound className="w-7 h-7 text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Enter Verification Code
                </h2>
                <p className="text-slate-400 text-sm">
                  We sent a 6-digit code to{' '}
                  <span className="text-blue-400 font-medium">{email}</span>
                </p>
              </div>

              {/* Timer */}
              {otpTimer > 0 && (
                <div className="flex items-center justify-center gap-2 mb-5">
                  <Timer className="w-4 h-4 text-amber-400" />
                  <span className={`text-sm font-mono font-bold ${
                    otpTimer <= 60 ? 'text-red-400' : 'text-amber-400'
                  }`}>
                    Code expires in {formatTime(otpTimer)}
                  </span>
                </div>
              )}
              {otpTimer === 0 && step === 'otp' && (
                <div className="text-center mb-5">
                  <p className="text-red-400 text-sm">Code expired. Please request a new one.</p>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm mb-5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Attempts indicator */}
              {otpAttempts > 0 && otpAttempts < 5 && (
                <div className="flex gap-1.5 justify-center mb-5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        i < otpAttempts ? 'bg-red-500' : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-6" noValidate>
                {/* OTP Inputs */}
                <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      disabled={loading || otpTimer === 0}
                      className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 bg-white/5 text-white
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${digit ? 'border-blue-500/50' : 'border-white/10'}
                      `}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.join('').length !== 6 || otpTimer === 0}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /><span>Verifying...</span></>
                  ) : (
                    <><ShieldCheck className="w-4 h-4" /><span>Verify Code</span></>
                  )}
                </button>
              </form>

              {/* Resend */}
              <div className="mt-5 text-center">
                <p className="text-slate-500 text-xs mb-2">
                  Didn't receive the code? Check spam folder.
                </p>
                <button
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || loading}
                  className="inline-flex items-center gap-1.5 text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed text-blue-400 hover:text-blue-300"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : 'Resend Code'
                  }
                </button>
              </div>
            </>
          )}

          {/* ════════════ STEP 3: NEW PASSWORD ════════════ */}
          {step === 'reset' && (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-500/20 rounded-2xl mb-4 border border-emerald-500/30">
                  <Lock className="w-7 h-7 text-emerald-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Set New Password
                </h2>
                <p className="text-slate-400 text-sm">
                  Create a strong password for{' '}
                  <span className="text-blue-400 font-medium">{email}</span>
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm mb-5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-5" noValidate>
                {/* New Password */}
                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-slate-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    <input
                      id="new-password"
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); if (error) setError(''); }}
                      autoFocus
                      autoComplete="new-password"
                      disabled={loading}
                      className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
                      placeholder="Min 8 characters"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      aria-label={showNew ? 'Hide' : 'Show'}
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                    >
                      {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {newPassword && (
                    <div className="mt-2 space-y-1">
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-300"
                          style={{ width: strength.width, background: strength.color }} />
                      </div>
                      <p className="text-xs" style={{ color: strength.color }}>{strength.label}</p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    <input
                      id="confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); if (error) setError(''); }}
                      autoComplete="new-password"
                      disabled={loading}
                      className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
                      placeholder="Re-enter password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      aria-label={showConfirm ? 'Hide' : 'Show'}
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                    >
                      {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {confirmPassword && (
                    <p className={`text-xs mt-1.5 ${
                      newPassword === confirmPassword ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition shadow-lg shadow-blue-600/30 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /><span>Resetting...</span></>
                  ) : (
                    <><ShieldCheck className="w-4 h-4" /><span>Reset Password</span></>
                  )}
                </button>
              </form>
            </>
          )}

          {/* ════════════ STEP 4: SUCCESS ════════════ */}
          {step === 'success' && (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-2xl mb-5 border border-emerald-500/30">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-3">
                Password Reset Successful!
              </h2>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Your password has been updated for{' '}
                <span className="text-blue-400 font-medium">{email}</span>.
                You can now log in with your new password.
              </p>
              <button
                onClick={() => setCurrentPage('login')}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Go to Login
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          Secure admin access · CVS Multi Services
        </p>
      </div>
    </div>
  );
}