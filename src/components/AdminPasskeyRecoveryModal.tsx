import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  Mail, 
  HelpCircle, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ArrowRight, 
  RotateCw, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Send,
  Sparkles,
  Smartphone,
  ShieldAlert
} from 'lucide-react';
import { useCms, DEFAULT_ADMIN_PASSKEY } from '../context/CmsContext';

interface AdminPasskeyRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (newPasskey: string) => void;
}

export const AdminPasskeyRecoveryModal: React.FC<AdminPasskeyRecoveryModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
}) => {
  const { cms, resetPasskey, recordSecurityLog } = useCms();

  const [recoveryMethod, setRecoveryMethod] = useState<'otp' | 'question' | 'token'>('otp');
  const [step, setStep] = useState<'verify' | 'set_new_passkey' | 'success'>('verify');

  // OTP State
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [copiedOtp, setCopiedOtp] = useState(false);

  // Security Question State
  const [questionAnswer, setQuestionAnswer] = useState('');

  // Emergency Token State
  const [emergencyTokenInput, setEmergencyTokenInput] = useState('');

  // New Passkey State
  const [newPasskey, setNewPasskey] = useState('');
  const [confirmPasskey, setConfirmPasskey] = useState('');
  const [showNewPasskey, setShowNewPasskey] = useState(false);
  const [showConfirmPasskey, setShowConfirmPasskey] = useState(false);

  // Errors & Alerts
  const [errorMessage, setErrorMessage] = useState('');
  const [successInfo, setSuccessInfo] = useState('');

  // Recovery email
  const recoveryEmail = cms.security?.recoveryEmail || 'yerimaforfor@gmail.com';
  const recoveryPhone = cms.security?.recoveryPhone || '+234 806 246 6212';
  const securityQuestion = cms.security?.securityQuestion || 'What is the founding brand name or Abuja HQ operational city?';

  // Mask email for display
  const maskedEmail = recoveryEmail.replace(/(.{2})(.*)(?=@)/, (_, a, b) => a + '*'.repeat(Math.max(b.length, 3)));

  // Countdown timer effect
  useEffect(() => {
    let interval: any;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Reset modal state when opened
  useEffect(() => {
    if (isOpen) {
      setStep('verify');
      setRecoveryMethod('otp');
      setEnteredOtp('');
      setGeneratedOtp('');
      setOtpSent(false);
      setOtpTimer(0);
      setQuestionAnswer('');
      setEmergencyTokenInput('');
      setNewPasskey('');
      setConfirmPasskey('');
      setErrorMessage('');
      setSuccessInfo('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Send OTP
  const handleSendOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpSent(true);
    setOtpTimer(180); // 3 minutes
    setErrorMessage('');
    setSuccessInfo(`6-digit verification code dispatched to ${recoveryEmail}`);
    recordSecurityLog('passkey_reset_otp', `Recovery OTP requested for admin email ${recoveryEmail}`);
  };

  // Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredOtp.trim()) {
      setErrorMessage('Please enter the 6-digit code sent to your email.');
      return;
    }
    if (enteredOtp.trim() === generatedOtp) {
      setErrorMessage('');
      setSuccessInfo('Identity verified successfully! Set your new master passkey below.');
      setStep('set_new_passkey');
    } else {
      setErrorMessage('Invalid verification code. Please check and try again.');
      recordSecurityLog('login_failed', 'Failed recovery attempt: Invalid 6-digit OTP code entered.', {
        attemptMasked: '•••••• [6 digits]',
        attemptMethod: 'recovery_wizard',
        failureReason: 'invalid_otp',
        severity: 'warning',
      });
    }
  };

  // Verify Security Question
  const handleVerifyQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAnswer = questionAnswer.trim().toLowerCase();
    const configuredAnswer = (cms.security?.securityAnswer || 'Pyda').trim().toLowerCase();
    
    // Check match with configured answer or default keywords
    const isDefaultQuestion = securityQuestion.includes('founding brand') || securityQuestion.includes('Abuja');
    const isDefaultMatch = isDefaultQuestion && (cleanAnswer.includes('pyda') || cleanAnswer.includes('megatrend') || cleanAnswer.includes('abuja') || cleanAnswer.includes('2018') || cleanAnswer.includes('citygate'));

    if (cleanAnswer === configuredAnswer || isDefaultMatch) {
      setErrorMessage('');
      setSuccessInfo('Security question answer verified! Set your new passkey below.');
      recordSecurityLog('passkey_reset_question', 'Admin verified identity via security question.');
      setStep('set_new_passkey');
    } else {
      setErrorMessage('Incorrect answer. Please check your spelling or try another recovery method.');
      recordSecurityLog('login_failed', 'Failed recovery attempt: Incorrect security question answer.', {
        attemptMasked: `${'•'.repeat(Math.min(questionAnswer.length, 10))} [${questionAnswer.length} chars]`,
        attemptMethod: 'recovery_wizard',
        failureReason: 'invalid_qa',
        severity: 'warning',
      });
    }
  };

  // Verify Emergency Token
  const handleVerifyEmergencyToken = (e: React.FormEvent) => {
    e.preventDefault();
    const token = emergencyTokenInput.trim();
    const validToken = cms.security?.emergencyRecoveryToken || 'MT-RECOVER-SECURE-2026';

    if (token === validToken) {
      setErrorMessage('');
      setSuccessInfo('Emergency token verified! Set your new master passkey.');
      recordSecurityLog('passkey_reset_token', 'Admin identity verified using offline Emergency Master Recovery Token.');
      setStep('set_new_passkey');
    } else {
      setErrorMessage('Invalid emergency token. Ensure you entered the full token including prefixes.');
      recordSecurityLog('login_failed', 'Failed recovery attempt: Unrecognized Emergency Master Recovery Token.', {
        attemptMasked: `${'•'.repeat(Math.min(token.length, 12))} [${token.length} chars]`,
        attemptMethod: 'emergency_token',
        failureReason: 'invalid_token',
        severity: 'critical',
      });
    }
  };

  // Direct Factory Reset to default passkey
  const handleFactoryResetPasskey = () => {
    if (window.confirm('Reset the Admin passkey back to the default master passkey (*Ybc530dam#)?')) {
      resetPasskey('', 'Factory passkey restored via Emergency Master Recovery');
      recordSecurityLog('factory_reset', 'Passkey restored to master factory default (*Ybc530dam#)');
      onSuccessLogin(DEFAULT_ADMIN_PASSKEY);
    }
  };

  // Password Strength Calculator
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Empty', color: 'bg-slate-700', text: 'text-slate-500' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500', text: 'text-red-400' };
    if (score <= 3) return { score: 2, label: 'Medium', color: 'bg-amber-500', text: 'text-amber-400' };
    if (score <= 4) return { score: 3, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-400' };
    return { score: 4, label: 'Very Strong', color: 'bg-cyan-400', text: 'text-cyan-400' };
  };

  const strength = getPasswordStrength(newPasskey);

  // Handle Set New Passkey
  const handleSaveNewPasskey = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPasskey.length < 6) {
      setErrorMessage('Passkey must be at least 6 characters long.');
      return;
    }
    if (newPasskey !== confirmPasskey) {
      setErrorMessage('Passkeys do not match. Please re-enter.');
      return;
    }

    resetPasskey(newPasskey, `Passkey reset completed via ${recoveryMethod.toUpperCase()}`);
    setStep('success');
  };

  const handleCopyOtp = () => {
    navigator.clipboard.writeText(generatedOtp);
    setCopiedOtp(true);
    setEnteredOtp(generatedOtp);
    setTimeout(() => setCopiedOtp(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden text-white max-h-[90vh] overflow-y-auto">
        
        {/* Glow accent */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center border border-amber-500/30 shadow-inner">
              <KeyRound className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>Admin Passkey Recovery</span>
                <span className="bg-amber-500/20 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-500/30">
                  SECURE RESET
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Recover access to Pyda Movers CMS Management Portal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global Error or Success notification */}
        {errorMessage && (
          <div className="p-3.5 bg-red-950/50 border border-red-800/80 rounded-2xl text-xs text-red-300 flex items-center gap-2 font-medium animate-shake">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successInfo && (
          <div className="p-3 bg-emerald-950/50 border border-emerald-800/80 rounded-2xl text-xs text-emerald-300 flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successInfo}</span>
          </div>
        )}

        {/* STEP 1: VERIFICATION METHOD SELECTION */}
        {step === 'verify' && (
          <div className="space-y-5">
            {/* Method Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setRecoveryMethod('otp');
                  setErrorMessage('');
                }}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  recoveryMethod === 'otp'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email OTP</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRecoveryMethod('question');
                  setErrorMessage('');
                }}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  recoveryMethod === 'question'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Security Q&A</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRecoveryMethod('token');
                  setErrorMessage('');
                }}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  recoveryMethod === 'token'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>Master Token</span>
              </button>
            </div>

            {/* METHOD 1: EMAIL OTP */}
            {recoveryMethod === 'otp' && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      Registered Admin Email
                    </span>
                    <span className="text-[11px] text-amber-400 font-bold">
                      Verified Dispatch Contact
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm font-mono font-bold text-white bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span>{maskedEmail}</span>
                  </div>

                  {!otpSent ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send 6-Digit Verification Passcode</span>
                    </button>
                  ) : (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-amber-400 font-bold flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Passcode Sent to Inbox!</span>
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          Expires in: {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                        </span>
                      </div>

                      {/* Interactive simulated email inbox helper banner */}
                      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">Simulation Code:</span>
                          <span className="text-sm font-mono font-black text-amber-400 tracking-widest bg-slate-950 px-2 py-0.5 rounded border border-amber-500/20">
                            {generatedOtp}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyOtp}
                          className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[11px] rounded-lg border border-amber-500/30 flex items-center gap-1 transition-all"
                        >
                          {copiedOtp ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedOtp ? 'Pasted!' : 'Auto-Fill'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {otpSent && (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        Enter 6-Digit Passcode
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        placeholder="e.g. 849201"
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-center text-xl font-mono font-black tracking-widest py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                        autoFocus
                      />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        disabled={otpTimer > 120}
                        onClick={handleSendOtp}
                        className="text-xs text-slate-400 hover:text-amber-400 disabled:opacity-40 disabled:hover:text-slate-400 font-bold underline flex items-center gap-1"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>Resend Passcode</span>
                      </button>

                      <button
                        type="submit"
                        className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-2 transition-transform active:scale-95"
                      >
                        <span>Verify & Continue</span>
                        <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* METHOD 2: SECURITY QUESTION */}
            {recoveryMethod === 'question' && (
              <form onSubmit={handleVerifyQuestion} className="space-y-4">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                    Security Verification Prompt
                  </span>
                  <p className="text-sm font-bold text-white leading-relaxed">
                    {securityQuestion}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Hint: Default answer is <span className="font-mono text-slate-300">Pyda</span> or <span className="font-mono text-slate-300">Abuja</span>.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Your Secret Answer
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter answer..."
                    value={questionAnswer}
                    onChange={(e) => setQuestionAnswer(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  <span>Verify Secret Answer</span>
                </button>
              </form>
            )}

            {/* METHOD 3: EMERGENCY MASTER RECOVERY TOKEN */}
            {recoveryMethod === 'token' && (
              <form onSubmit={handleVerifyEmergencyToken} className="space-y-4">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Emergency Master Recovery Token</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Enter the offline master recovery token provided during site deployment to bypass standard authentication.
                  </p>
                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Default Token: <code className="text-slate-300 font-mono">MT-RECOVER-SECURE-2026</code></span>
                    <button
                      type="button"
                      onClick={() => setEmergencyTokenInput('MT-RECOVER-SECURE-2026')}
                      className="text-amber-400 hover:underline font-bold"
                    >
                      Fill Default
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Emergency Serial Token
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="MT-RECOVER-SECURE-XXXX"
                    value={emergencyTokenInput}
                    onChange={(e) => setEmergencyTokenInput(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors uppercase"
                    autoFocus
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
                  >
                    <Key className="w-4 h-4 stroke-[2.5]" />
                    <span>Verify Token & Set New Passkey</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleFactoryResetPasskey}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Instant Factory Reset to Default (*Ybc530dam#)</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* STEP 2: SET NEW PASSKEY */}
        {step === 'set_new_passkey' && (
          <form onSubmit={handleSaveNewPasskey} className="space-y-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Identity verified. Create a new strong passkey for future admin logins.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                New Admin Passkey
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showNewPasskey ? 'text' : 'password'}
                  required
                  placeholder="Enter new passkey (min 6 chars)..."
                  value={newPasskey}
                  onChange={(e) => setNewPasskey(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowNewPasskey(!showNewPasskey)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showNewPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength indicator */}
              {newPasskey && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Passkey Strength:</span>
                    <span className={`font-bold ${strength.text}`}>{strength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex gap-1">
                    <div className={`h-full flex-1 ${strength.score >= 1 ? strength.color : 'bg-slate-800'}`} />
                    <div className={`h-full flex-1 ${strength.score >= 2 ? strength.color : 'bg-slate-800'}`} />
                    <div className={`h-full flex-1 ${strength.score >= 3 ? strength.color : 'bg-slate-800'}`} />
                    <div className={`h-full flex-1 ${strength.score >= 4 ? strength.color : 'bg-slate-800'}`} />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Confirm New Passkey
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPasskey ? 'text' : 'password'}
                  required
                  placeholder="Re-enter new passkey..."
                  value={confirmPasskey}
                  onChange={(e) => setConfirmPasskey(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPasskey(!showConfirmPasskey)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showConfirmPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep('verify')}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
              >
                Back
              </button>

              <button
                type="submit"
                className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                <span>Save New Passkey & Unlock Portal</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: SUCCESS CONFIRMATION */}
        {step === 'success' && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">Passkey Successfully Reset!</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Your new admin credentials have been saved. You can now access the Pyda Movers CMS dashboard.
              </p>
            </div>

            <button
              onClick={() => onSuccessLogin(newPasskey)}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4 stroke-[2.5]" />
              <span>Log In Directly to Admin CMS</span>
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Encrypted Session Protocol</span>
          </span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-bold"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
