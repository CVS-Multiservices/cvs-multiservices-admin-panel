import React, { useState, useEffect } from 'react';
import {
  Mail, Lock, Eye, EyeOff,
  ArrowRight, AlertCircle, ShieldAlert,
} from 'lucide-react';
import { authApi } from '../../services/api';
import { Page } from '../../types';
import logo from '../../images/Logo.png';

interface LoginPageProps {
  setIsAuthenticated: (v: boolean) => void;
  setCurrentPage: (page: Page) => void;
  setUserEmail: (email: string) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function LoginPage({
  setIsAuthenticated,
  setCurrentPage,
  setUserEmail,
  showToast,
}: LoginPageProps) {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [rememberMe, setRememberMe]     = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldown, setCooldown]         = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [lockedUntil, setLockedUntil]   = useState<string | null>(null);
  const [mounted, setMounted]           = useState(false);

  // ── Mount animation trigger ─────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // ── Clear error when user edits fields ──────────────────────────────
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError('');
  };

  // ── Client-side validation ───────────────────────────────────────────
  const validate = (): string | null => {
    if (!email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return 'Enter a valid email address';
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  // ── Frontend rate-limit cooldown (30s countdown) ─────────────────────
  const triggerFrontendCooldown = () => {
    const WAIT = 30;
    setCooldown(true);
    setCooldownSeconds(WAIT);
    setError(`Too many failed attempts. Please wait ${WAIT} seconds.`);

    const interval = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCooldown(false);
          setFailedAttempts(0);
          setError('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ── Submit ───────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown) return;

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await authApi.login(
        { email: email.trim().toLowerCase(), password },
        rememberMe
      );

      if (result.success) {
        const cleanEmail = email.trim().toLowerCase();
        setFailedAttempts(0);
        setLockedUntil(null);
        setUserEmail(cleanEmail);
        setIsAuthenticated(true);
        setCurrentPage('dashboard');
        showToast(
          `Welcome back, ${result.user?.name || cleanEmail.split('@')[0]}!`,
          'success'
        );
      } else if (result.locked) {
        setLockedUntil(result.lockUntil || null);
        setError(result.message || 'Account is locked. Try again later.');
      } else {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);

        if (newAttempts >= 5) {
          triggerFrontendCooldown();
        } else {
          setError(
            result.message ||
            `Invalid email or password. ${5 - newAttempts} attempt(s) remaining.`
          );
        }
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || cooldown;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center p-4 relative overflow-hidden">

      {/* ── CSS Animations ── */}
      <style>{`
        @keyframes float-particle {
          0%   { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
          10%  { opacity: 0.15; }
          90%  { opacity: 0.15; }
          100% { transform: translateY(-600px) translateX(100px) rotate(360deg); opacity: 0; }
        }
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1); opacity: 0.15; }
          50%  { transform: scale(1.05); opacity: 0.08; }
          100% { transform: scale(1); opacity: 0.15; }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.1), 0 0 60px rgba(59, 130, 246, 0.05); }
          50%      { box-shadow: 0 0 30px rgba(59, 130, 246, 0.2), 0 0 80px rgba(59, 130, 246, 0.1); }
        }
        @keyframes slide-up-fade {
          0%   { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes slide-down-fade {
          0%   { transform: translateY(-20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes scale-in {
          0%   { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes logo-breathe {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.02); }
        }
        @keyframes border-glow {
          0%, 100% { border-color: rgba(59, 130, 246, 0.2); }
          50%      { border-color: rgba(59, 130, 246, 0.4); }
        }
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(150px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(150px) rotate(-360deg); }
        }
        @keyframes hex-rotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .animate-float-particle { animation: float-particle 10s ease-in-out infinite; }
        .animate-glow-pulse     { animation: glow-pulse 3s ease-in-out infinite; }
        .animate-logo-breathe   { animation: logo-breathe 4s ease-in-out infinite; }
        .animate-border-glow    { animation: border-glow 3s ease-in-out infinite; }
      `}</style>

      {/* ── Background Particles ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: 'radial-gradient(ellipse at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)',
          }}
        />

        {[
          { left: '8%',  delay: 0,   dur: 10, size: 6,  color: 'rgba(59,130,246,0.3)' },
          { left: '22%', delay: 2,   dur: 12, size: 4,  color: 'rgba(139,92,246,0.3)' },
          { left: '38%', delay: 4,   dur: 9,  size: 8,  color: 'rgba(6,182,212,0.3)' },
          { left: '55%', delay: 1,   dur: 11, size: 5,  color: 'rgba(59,130,246,0.3)' },
          { left: '70%', delay: 3,   dur: 10, size: 7,  color: 'rgba(139,92,246,0.3)' },
          { left: '85%', delay: 5,   dur: 8,  size: 4,  color: 'rgba(6,182,212,0.3)' },
          { left: '92%', delay: 2.5, dur: 13, size: 6,  color: 'rgba(59,130,246,0.3)' },
          { left: '15%', delay: 6,   dur: 11, size: 3,  color: 'rgba(139,92,246,0.2)' },
          { left: '45%', delay: 7,   dur: 9,  size: 5,  color: 'rgba(6,182,212,0.2)' },
          { left: '75%', delay: 1.5, dur: 14, size: 4,  color: 'rgba(59,130,246,0.2)' },
        ].map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float-particle"
            style={{
              width: p.size,
              height: p.size,
              left: p.left,
              bottom: '-20px',
              background: p.color,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.dur}s`,
            }}
          />
        ))}

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: i === 0 ? 'rgba(59,130,246,0.2)' : i === 1 ? 'rgba(139,92,246,0.15)' : 'rgba(6,182,212,0.15)',
                animation: `orbit ${20 + i * 8}s linear infinite`,
                animationDelay: `${i * 3}s`,
              }}
            />
          ))}
        </div>

        {[
          { top: '10%', left: '85%', size: 60, delay: 0 },
          { top: '70%', left: '8%',  size: 80, delay: 1.5 },
          { top: '40%', left: '92%', size: 50, delay: 3 },
        ].map((h, i) => (
          <div
            key={i}
            className="absolute opacity-[0.04]"
            style={{
              top: h.top,
              left: h.left,
              animation: `hex-rotate ${30 + i * 10}s linear infinite`,
              animationDelay: `${h.delay}s`,
            }}
          >
            <svg width={h.size} height={h.size} viewBox="0 0 100 100" fill="none">
              <polygon
                points="50,5 90,25 90,75 50,95 10,75 10,25"
                stroke="rgba(59,130,246,0.5)"
                strokeWidth="1.5"
                fill="none"
              />
            </svg>
          </div>
        ))}

        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* ── Main Content ── */}
      <div className="w-full max-w-md relative z-10">

        {/* ── Logo Section ── */}
        <div
          className="text-center mb-8"
          style={{
            animation: mounted ? 'slide-down-fade 0.8s ease-out forwards' : 'none',
            opacity: mounted ? 1 : 0,
          }}
        >
          <div className="flex justify-center mb-5">
            <div className="relative group">
              <div
                className="absolute -inset-3 rounded-2xl opacity-20 blur-xl pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.4), rgba(139,92,246,0.3), rgba(6,182,212,0.3))',
                  animation: 'pulse-ring 3s ease-in-out infinite',
                }}
              />

              <div
                className="relative overflow-hidden rounded-2xl animate-logo-breathe animate-border-glow"
                style={{
                  background: '#ffffff',
                  border: '1.5px solid rgba(59,130,246,0.2)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 20px rgba(59,130,246,0.1)',
                  padding: '12px 20px',
                  maxWidth: '420px',
                  width: '100%',
                }}
              >
                <img
                  src={logo}
                  alt="CVS Multi Services Pvt. Ltd."
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '96px',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />

                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    animation: 'shimmer 2s ease-in-out infinite',
                  }}
                />
              </div>

              <div
                className="absolute -inset-1 rounded-2xl opacity-10 pointer-events-none"
                style={{
                  border: '1.5px solid rgba(59,130,246,0.4)',
                  animation: 'pulse-ring 4s ease-in-out infinite',
                  animationDelay: '1s',
                }}
              />
            </div>
          </div>

          <p
            className="text-slate-400 text-sm font-medium tracking-widest uppercase"
            style={{
              animation: mounted ? 'slide-up-fade 0.8s ease-out 0.3s both' : 'none',
            }}
          >
            Authorised Admin Panel
          </p>
        </div>

        {/* ── Card ── */}
        <div
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl animate-glow-pulse"
          style={{
            animation: mounted
              ? 'scale-in 0.6s ease-out 0.2s both, glow-pulse 3s ease-in-out 0.8s infinite'
              : 'none',
          }}
        >
          <h2
            className="text-xl font-semibold text-white mb-6"
            style={{
              animation: mounted ? 'slide-up-fade 0.5s ease-out 0.4s both' : 'none',
            }}
          >
            Sign In
          </h2>

          <form onSubmit={handleLogin} className="space-y-5" noValidate>

            {error && (
              <div
                className="flex items-start gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm"
                style={{ animation: 'slide-up-fade 0.3s ease-out' }}
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {cooldown && (
              <div className="space-y-1" style={{ animation: 'slide-up-fade 0.3s ease-out' }}>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Cooling down...</span>
                  <span>{cooldownSeconds}s remaining</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all duration-1000"
                    style={{ width: `${(cooldownSeconds / 30) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {lockedUntil && !cooldown && (
              <div
                className="flex items-start gap-2 p-3 bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-300 text-sm"
                style={{ animation: 'slide-up-fade 0.3s ease-out' }}
              >
                <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  Account locked until{' '}
                  <span className="font-semibold">
                    {new Date(lockedUntil).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  . Too many failed attempts.
                </span>
              </div>
            )}

            {failedAttempts > 0 && failedAttempts < 5 && !cooldown && (
              <div className="flex gap-1.5 justify-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                      i < failedAttempts ? 'bg-red-500' : 'bg-white/10'
                    }`}
                    style={{ transitionDelay: `${i * 100}ms` }}
                  />
                ))}
              </div>
            )}

            {/* Email */}
            <div
              style={{
                animation: mounted ? 'slide-up-fade 0.5s ease-out 0.5s both' : 'none',
              }}
            >
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none transition-colors duration-300 group-focus-within:text-blue-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  autoComplete="email"
                  autoFocus
                  disabled={isDisabled}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/[0.07] hover:border-white/20"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div
              style={{
                animation: mounted ? 'slide-up-fade 0.5s ease-out 0.6s both' : 'none',
              }}
            >
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none transition-colors duration-300 group-focus-within:text-blue-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  autoComplete="current-password"
                  disabled={isDisabled}
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/[0.07] hover:border-white/20"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors duration-300"
                >
                  {showPassword
                    ? <EyeOff className="w-5 h-5" />
                    : <Eye className="w-5 h-5" />
                  }
                </button>
              </div>
            </div>

            {/* Remember Me + Forgot Password */}
            <div
              className="flex items-center justify-between"
              style={{
                animation: mounted ? 'slide-up-fade 0.5s ease-out 0.7s both' : 'none',
              }}
            >
              <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer select-none hover:text-slate-300 transition-colors duration-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-600 bg-white/5 text-blue-500 focus:ring-blue-500"
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => setCurrentPage('forgot-password')}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-300"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit */}
            <div
              style={{
                animation: mounted ? 'slide-up-fade 0.5s ease-out 0.8s both' : 'none',
              }}
            >
              <button
                type="submit"
                disabled={isDisabled}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : cooldown ? (
                  <span>Please wait {cooldownSeconds}s...</span>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ── Footer ── */}
        <p
          className="text-center text-slate-500 text-xs mt-6"
          style={{
            animation: mounted ? 'slide-up-fade 0.5s ease-out 1s both' : 'none',
          }}
        >
          Secure admin access · CVS Multi Services
        </p>
      </div>
    </div>
  );
}