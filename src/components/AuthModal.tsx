import React, { useState, useEffect } from "react";
import { X, Check, AlertCircle, Eye, EyeOff, ShieldCheck } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any, token: string) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Validation & Real-time verification states
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: "Very Weak", color: "bg-red-500" });

  // Verification stage
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [tempUserData, setTempUserData] = useState<any>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [fallbackOtp, setFallbackOtp] = useState("");
  const [otpMessage, setOtpMessage] = useState("");
  const [showBackupCode, setShowBackupCode] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Real-time username checker debounce
  useEffect(() => {
    if (isLogin || !username.trim()) {
      setUsernameAvailable(null);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const resp = await fetch("/api/auth/check-username", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: username.trim() }),
        });
        const data = await resp.json();
        setUsernameAvailable(data.available);
      } catch (e) {
        setUsernameAvailable(null);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [username, isLogin]);

  // Real-time password strength checker
  useEffect(() => {
    if (isLogin || !password) {
      return;
    }

    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    let label = "Very Weak";
    let color = "bg-red-500";
    if (score === 2) {
      label = "Weak";
      color = "bg-orange-500";
    } else if (score === 3) {
      label = "Medium";
      color = "bg-yellow-500";
    } else if (score === 4) {
      label = "Strong";
      color = "bg-emerald-500";
    } else if (score === 5) {
      label = "Very Secure";
      color = "bg-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.5)]";
    }

    setPasswordStrength({ score, label, color });
  }, [password, isLogin]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const resp = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.error || "Login failed");
      }

      onSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!usernameAvailable) {
      setError("Please choose an available username.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: cleanUsername, email: cleanEmail, phone: "", password }),
      });
      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setTempUserData(data.tempUser || { username: cleanUsername, email: cleanEmail });
      setEmailSent(data.emailSent);
      setFallbackOtp(data.fallbackOtp || "");
      setOtpMessage(data.message || "");
      setShowBackupCode(false);
      setShowOtpScreen(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const resp = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: tempUserData?.username || username.trim(),
          email: tempUserData?.email || email.trim().toLowerCase(),
          emailCode: emailCode.trim(),
        }),
      });
      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.error || "Verification failed");
      }

      onSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
        {/* Header decoration */}
        <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-blue-500" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          id="close-auth-modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          {!showOtpScreen ? (
            <>
              <div className="mb-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 mb-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold font-display text-white">
                  {isLogin ? "Welcome Back" : "Join SkillSphere"}
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  {isLogin ? "Access your learning feed and community" : "Create an account to start sharing and learning"}
                </p>
              </div>

              {/* Tabs */}
              <div className="flex p-1 mb-6 bg-slate-950 rounded-lg">
                <button
                  onClick={() => { setIsLogin(true); setError(""); }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isLogin ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
                >
                  Log In
                </button>
                <button
                  onClick={() => { setIsLogin(false); setError(""); }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isLogin ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
                >
                  Register
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 mb-4 text-xs font-medium text-red-400 border border-red-500/10 bg-red-500/5 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {isLogin ? (
                /* LOGIN FORM */
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. sarah_codes"
                      required
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Password
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-4 pr-10 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 mt-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-medium rounded-xl transition-all shadow-[0_4px_12px_rgba(16,185,129,0.2)] hover:shadow-[0_4px_20px_rgba(16,185,129,0.3)] cursor-pointer"
                  >
                    {loading ? "Logging in..." : "Log In"}
                  </button>
                </form>
              ) : (
                /* REGISTER FORM */
                <form onSubmit={handleRegisterSubmit} className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Username
                      </label>
                      {username.trim() && (
                        <span className="flex items-center gap-1 text-xs">
                          {isCheckingUsername ? (
                            <span className="text-slate-500 animate-pulse">Checking...</span>
                          ) : usernameAvailable ? (
                            <span className="text-emerald-400 flex items-center gap-0.5 font-medium"><Check className="w-3 h-3" /> Available</span>
                          ) : (
                            <span className="text-red-400 font-medium">Taken</span>
                          )}
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ""))}
                      placeholder="e.g. bio_coder"
                      required
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. you@example.com"
                      required
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Password
                      </label>
                      {password && (
                        <span className="text-xs font-medium text-slate-400">
                          Strength: <span className={passwordStrength.score >= 3 ? "text-emerald-400" : "text-orange-400"}>{passwordStrength.label}</span>
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-4 pr-10 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Strength Indicator Bar */}
                    {password && (
                      <div className="mt-2 space-y-1">
                        <div className="flex gap-1 h-1.5">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`flex-1 rounded-full transition-colors ${level <= passwordStrength.score ? passwordStrength.color : "bg-slate-800"}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !usernameAvailable}
                    className="w-full py-3 mt-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-medium rounded-xl transition-all shadow-[0_4px_12px_rgba(16,185,129,0.2)] hover:shadow-[0_4px_20px_rgba(16,185,129,0.3)] cursor-pointer"
                  >
                    {loading ? "Sending OTP..." : "Get Verification Codes"}
                  </button>
                </form>
              )}
            </>
          ) : (
            /* OTP SCREEN */
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 mb-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold font-display text-white mb-2">Verify Registration</h3>
              <p className="text-sm text-slate-400 mb-6">
                {emailSent 
                  ? `A 6-digit verification code has been sent to your email address: ${tempUserData?.email}. Please check your inbox (including spam) and enter the code below.`
                  : "SMTP email settings are not configured in your AI Studio project. To send real-time email OTPs, please configure SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in Settings."}
              </p>

              {error && (
                <div className="flex items-center gap-2 p-3 mb-4 text-xs font-medium text-red-400 border border-red-500/10 bg-red-500/5 rounded-lg text-left">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleOtpVerify} className="space-y-4">
                <div className="text-left">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Email Verification Code
                    </label>
                    {(!emailSent || showBackupCode) && fallbackOtp && (
                      <span className="text-xs text-amber-400 font-medium">Backup Code: {fallbackOtp}</span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value)}
                    placeholder={(emailSent && !showBackupCode) ? "Enter 6-digit OTP" : fallbackOtp}
                    required
                    maxLength={6}
                    className="w-full px-4 py-2.5 text-center font-mono tracking-widest bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  {emailSent && !showBackupCode && (
                    <div className="mt-2 text-right">
                      <button
                        type="button"
                        onClick={() => setShowBackupCode(true)}
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors cursor-pointer focus:outline-none"
                      >
                        Didn't receive email? Show backup code
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowOtpScreen(false)}
                    className="flex-1 py-3 border border-slate-800 hover:bg-slate-800 text-white font-medium rounded-xl transition-all cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-all shadow-[0_4px_12px_rgba(16,185,129,0.2)] cursor-pointer"
                  >
                    Verify & Sign Up
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
