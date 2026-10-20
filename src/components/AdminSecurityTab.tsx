import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  Mail, 
  Phone, 
  HelpCircle, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  RotateCw, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Save, 
  Clock, 
  ShieldAlert, 
  Smartphone, 
  Fingerprint,
  History,
  Trash2,
  Sparkles,
  Download,
  Search,
  Filter,
  RefreshCw,
  Server,
  Globe,
  Monitor,
  Terminal,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  FileSpreadsheet,
  Activity,
  Layers
} from 'lucide-react';
import { useCms, DEFAULT_ADMIN_PASSKEY, DEFAULT_SECURITY_CONFIG } from '../context/CmsContext';
import { SecurityActivityLog, SecurityAuditStats } from '../types';

interface AdminSecurityTabProps {
  showToast: (msg: string) => void;
}

const SECURITY_QUESTION_PRESETS = [
  'What is the founding brand name or Abuja HQ operational city?',
  'What was the founding year of Pyda Movers & Logistics?',
  'What is the primary commercial terminal plaza for the Abuja HQ?',
  'What is the main highway logistics route (e.g. Abuja - Lagos)?',
  'What is your primary fleet dispatcher callsign or code?',
  'Custom Question (Enter your own question below)...',
];

export const AdminSecurityTab: React.FC<AdminSecurityTabProps> = ({ showToast }) => {
  const { 
    cms, 
    updateSecurity, 
    verifyPasskey, 
    resetPasskey, 
    recordSecurityLog, 
    fetchSecurityLogs, 
    clearSecurityLogs 
  } = useCms();

  // Change Passkey Form State
  const [currentPasskeyInput, setCurrentPasskeyInput] = useState('');
  const [newPasskeyInput, setNewPasskeyInput] = useState('');
  const [confirmPasskeyInput, setConfirmPasskeyInput] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passkeyChangeError, setPasskeyChangeError] = useState('');
  const [passkeyChangeSuccess, setPasskeyChangeSuccess] = useState('');

  // Recovery Config Form State
  const [recoveryEmail, setRecoveryEmail] = useState(cms.security?.recoveryEmail || 'yerimaforfor@gmail.com');
  const [recoveryPhone, setRecoveryPhone] = useState(cms.security?.recoveryPhone || '+234 806 246 6212');
  const [selectedQuestion, setSelectedQuestion] = useState(
    SECURITY_QUESTION_PRESETS.includes(cms.security?.securityQuestion || '')
      ? cms.security?.securityQuestion || SECURITY_QUESTION_PRESETS[0]
      : 'Custom Question (Enter your own question below)...'
  );
  const [customQuestionText, setCustomQuestionText] = useState(
    SECURITY_QUESTION_PRESETS.includes(cms.security?.securityQuestion || '')
      ? ''
      : cms.security?.securityQuestion || ''
  );
  const [securityAnswer, setSecurityAnswer] = useState(cms.security?.securityAnswer || 'Pyda');
  const [showAnswer, setShowAnswer] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedIpId, setCopiedIpId] = useState<string | null>(null);

  // Audit Logs State
  const [logFilterAction, setLogFilterAction] = useState<string>('all');
  const [logFilterSeverity, setLogFilterSeverity] = useState<string>('all');
  const [logSearchQuery, setLogSearchQuery] = useState<string>('');
  const [expandedLogIds, setExpandedLogIds] = useState<Record<string, boolean>>({});
  const [serverStats, setServerStats] = useState<SecurityAuditStats | null>(null);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(false);
  const [isSimulatingAttempt, setIsSimulatingAttempt] = useState<boolean>(false);

  // Active passkey status
  const isCustomPasskeyActive = Boolean(cms.security?.customPasskey && cms.security.customPasskey.trim().length > 0);

  // Fetch server logs on mount
  useEffect(() => {
    loadServerLogs();
  }, []);

  const loadServerLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const result = await fetchSecurityLogs();
      if (result && result.stats) {
        setServerStats(result.stats);
      }
    } catch (err) {
      console.warn('Failed to load server security audit logs', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // Password strength calculation
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

  const strength = getPasswordStrength(newPasskeyInput);

  // Handle Passkey Update
  const handleChangePasskey = (e: React.FormEvent) => {
    e.preventDefault();
    setPasskeyChangeError('');
    setPasskeyChangeSuccess('');

    // Check current passkey
    if (!verifyPasskey(currentPasskeyInput, { method: 'admin_modal', source: '/admin-security-settings' })) {
      setPasskeyChangeError('Current passkey is incorrect. Failed attempt recorded in audit log.');
      return;
    }

    if (newPasskeyInput.length < 6) {
      setPasskeyChangeError('New passkey must be at least 6 characters.');
      return;
    }

    if (newPasskeyInput !== confirmPasskeyInput) {
      setPasskeyChangeError('New passkey and confirmation do not match.');
      return;
    }

    resetPasskey(newPasskeyInput, 'Passkey updated via Admin Security Control Hub');
    setCurrentPasskeyInput('');
    setNewPasskeyInput('');
    setConfirmPasskeyInput('');
    setPasskeyChangeSuccess('Admin master passkey successfully updated!');
    showToast('Admin passkey updated successfully.');
  };

  // Restore Default Master Passkey
  const handleRestoreMasterPasskey = () => {
    if (window.confirm('Restore admin passkey to the initial factory default (*Ybc530dam#)?')) {
      resetPasskey('', 'Restored to factory default master passkey');
      setPasskeyChangeError('');
      setPasskeyChangeSuccess('Admin passkey restored to system default (*Ybc530dam#).');
      showToast('Admin passkey restored to factory default.');
    }
  };

  // Save Recovery Configuration
  const handleSaveRecoveryConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const finalQuestion = selectedQuestion.startsWith('Custom')
      ? customQuestionText.trim() || 'What is the founding brand name or Abuja HQ operational city?'
      : selectedQuestion;

    updateSecurity({
      recoveryEmail: recoveryEmail.trim(),
      recoveryPhone: recoveryPhone.trim(),
      securityQuestion: finalQuestion,
      securityAnswer: securityAnswer.trim(),
    });

    recordSecurityLog('passkey_changed', 'Recovery email, phone and security question settings updated', {
      attemptMethod: 'recovery_wizard',
      severity: 'info',
    });
    showToast('Multi-channel recovery settings saved.');
  };

  // Regenerate Emergency Token
  const handleRegenerateToken = () => {
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newToken = `MT-RECOVER-SECURE-${new Date().getFullYear()}-${randomSuffix}`;
    updateSecurity({ emergencyRecoveryToken: newToken });
    recordSecurityLog('passkey_changed', `Emergency offline recovery token regenerated: ${newToken}`, {
      attemptMethod: 'emergency_token',
      severity: 'warning',
    });
    showToast('New Emergency Master Recovery Token generated!');
  };

  const handleCopyToken = () => {
    const token = cms.security?.emergencyRecoveryToken || 'MT-RECOVER-SECURE-2026';
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    showToast('Emergency Recovery Token copied to clipboard.');
    setTimeout(() => setCopiedToken(false), 2500);
  };

  const handleCopyIp = (ip: string, id: string) => {
    navigator.clipboard.writeText(ip);
    setCopiedIpId(id);
    showToast(`IP address ${ip} copied to clipboard.`);
    setTimeout(() => setCopiedIpId(null), 2500);
  };

  // Simulate a test failed login to prove the system works immediately
  const handleSimulateFailedAttempt = async () => {
    setIsSimulatingAttempt(true);
    try {
      await recordSecurityLog('login_failed', 'Audit test: Simulated unauthorized passkey attempt.', {
        attemptMasked: '•'.repeat(8) + ' [Test Mock]',
        attemptMethod: 'admin_modal',
        failureReason: 'incorrect_passkey',
        severity: 'warning',
        requestPath: '/admin/simulate-test',
        metadata: {
          testMode: true,
          simulatedBy: 'Admin User',
          userAgent: navigator.userAgent,
        }
      });
      await loadServerLogs();
      showToast('Simulated failed passkey attempt logged with rich metadata.');
    } finally {
      setIsSimulatingAttempt(false);
    }
  };

  // Export audit logs to CSV
  const handleExportCsv = () => {
    const link = document.createElement('a');
    link.href = '/api/security/export-csv';
    link.setAttribute('download', `security-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Security audit log CSV report exported!');
  };

  // Purge logs
  const handlePurgeLogs = async () => {
    if (window.confirm('Are you sure you want to purge and archive all security audit logs? This action will reset the audit trail.')) {
      await clearSecurityLogs('Admin Console');
      await loadServerLogs();
      showToast('Security audit logs purged.');
    }
  };

  const toggleExpandLog = (id: string) => {
    setExpandedLogIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const activityLogs: SecurityActivityLog[] = cms.security?.activityLogs || [];

  // Filter logs
  const filteredLogs = activityLogs.filter((log) => {
    if (logFilterAction !== 'all') {
      if (logFilterAction === 'login_failed' && log.action !== 'login_failed') return false;
      if (logFilterAction === 'login_success' && log.action !== 'login_success') return false;
      if (logFilterAction === 'passkey_changed' && log.action !== 'passkey_changed') return false;
    }

    if (logFilterSeverity !== 'all' && log.severity !== logFilterSeverity) {
      return false;
    }

    if (logSearchQuery.trim()) {
      const q = logSearchQuery.toLowerCase();
      const matchDesc = log.description?.toLowerCase().includes(q);
      const matchIp = (log.ip || log.ipOrDevice || '').toLowerCase().includes(q);
      const matchAction = log.action?.toLowerCase().includes(q);
      const matchBrowser = log.browser?.toLowerCase().includes(q);
      const matchDevice = log.deviceType?.toLowerCase().includes(q);
      const matchReason = log.failureReason?.toLowerCase().includes(q);
      if (!matchDesc && !matchIp && !matchAction && !matchBrowser && !matchDevice && !matchReason) {
        return false;
      }
    }

    return true;
  });

  // Calculate quick stats
  const totalLogs = activityLogs.length;
  const failedAttempts = activityLogs.filter((l) => l.action === 'login_failed').length;
  const successfulLogins = activityLogs.filter((l) => l.action === 'login_success').length;
  const criticalThreats = activityLogs.filter((l) => l.severity === 'critical').length;
  const uniqueIps = Array.from(new Set(activityLogs.map((l) => l.ip || '127.0.0.1'))).length;

  return (
    <div className="pt-6 space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 p-6 sm:p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-black rounded-full uppercase tracking-wider">
              Access Control & Audit Telemetry
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-black rounded-full uppercase">
              Encrypted Audit Stream
            </span>
            <span className="px-2.5 py-0.5 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-[10px] font-black rounded-full uppercase">
              Metadata Capture: IP • UA • Timestamps
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Admin Passkey & Security Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Manage your master passkey, configure multi-channel recovery routes (Email OTP, SMS, Security Q&A), and audit real-time failed passkey attempts with full client request telemetry.
          </p>
        </div>
      </div>

      {/* Grid: Change Passkey & Recovery Setup */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CARD 1: CHANGE MASTER PASSKEY */}
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-7 rounded-3xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center border border-amber-500/30">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Change Master Passkey</h3>
                  <p className="text-xs text-slate-400">Update current CMS login credentials</p>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                isCustomPasskeyActive
                  ? 'bg-purple-500/20 border-purple-500/30 text-purple-300'
                  : 'bg-amber-500/20 border-amber-500/30 text-amber-300'
              }`}>
                {isCustomPasskeyActive ? 'CUSTOM PASSKEY ACTIVE' : 'DEFAULT PASSKEY (*Ybc530dam#)'}
              </span>
            </div>

            {passkeyChangeError && (
              <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{passkeyChangeError}</span>
              </div>
            )}

            {passkeyChangeSuccess && (
              <div className="p-3 bg-emerald-950/50 border border-emerald-800/80 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{passkeyChangeSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePasskey} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Current Passkey
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    required
                    placeholder="Enter existing passkey..."
                    value={currentPasskeyInput}
                    onChange={(e) => setCurrentPasskeyInput(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  New Master Passkey
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    placeholder="Enter new strong passkey (min 6 chars)..."
                    value={newPasskeyInput}
                    onChange={(e) => setNewPasskeyInput(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {newPasskeyInput && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-slate-400">Passkey Strength:</span>
                      <span className={strength.text}>{strength.label}</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden flex gap-1">
                      <div className={`h-full flex-1 rounded-full transition-all ${strength.score >= 1 ? strength.color : 'bg-slate-800'}`} />
                      <div className={`h-full flex-1 rounded-full transition-all ${strength.score >= 2 ? strength.color : 'bg-slate-800'}`} />
                      <div className={`h-full flex-1 rounded-full transition-all ${strength.score >= 3 ? strength.color : 'bg-slate-800'}`} />
                      <div className={`h-full flex-1 rounded-full transition-all ${strength.score >= 4 ? strength.color : 'bg-slate-800'}`} />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Confirm New Passkey
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    required
                    placeholder="Repeat new passkey..."
                    value={confirmPasskeyInput}
                    onChange={(e) => setConfirmPasskeyInput(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  className="w-full sm:flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Update Admin Passkey</span>
                </button>

                <button
                  type="button"
                  onClick={handleRestoreMasterPasskey}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                  title="Reset back to factory default: *Ybc530dam#"
                >
                  <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Restore Factory Default</span>
                </button>
              </div>
            </form>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Last passkey reset: {cms.security?.lastPasskeyResetDate ? new Date(cms.security.lastPasskeyResetDate).toLocaleDateString() : 'Initial Setup'}</span>
            <span className="font-mono text-slate-400">Security Layer v2.4</span>
          </div>
        </div>

        {/* CARD 2: MULTI-CHANNEL RECOVERY SETTINGS */}
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-7 rounded-3xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-cyan-500/20 text-cyan-400 rounded-xl flex items-center justify-center border border-cyan-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Multi-Channel Recovery Routes</h3>
                <p className="text-xs text-slate-400">Email OTP, SMS Phone & Security Question</p>
              </div>
            </div>

            <form onSubmit={handleSaveRecoveryConfig} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Recovery Email Address (For OTP Verification)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. yerimaforfor@gmail.com"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Recovery Phone Number (For SMS Alerts)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +234 806 246 6212"
                    value={recoveryPhone}
                    onChange={(e) => setRecoveryPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Security Challenge Question
                </label>
                <select
                  value={selectedQuestion}
                  onChange={(e) => setSelectedQuestion(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors"
                >
                  {SECURITY_QUESTION_PRESETS.map((q, idx) => (
                    <option key={idx} value={q}>{q}</option>
                  ))}
                </select>

                {selectedQuestion.startsWith('Custom') && (
                  <input
                    type="text"
                    required
                    placeholder="Type your custom security question..."
                    value={customQuestionText}
                    onChange={(e) => setCustomQuestionText(e.target.value)}
                    className="w-full mt-2 px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Secret Answer
                </label>
                <div className="relative">
                  <HelpCircle className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showAnswer ? 'text' : 'password'}
                    required
                    placeholder="Enter security question answer..."
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAnswer(!showAnswer)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showAnswer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Recovery & Q&A Settings</span>
              </button>
            </form>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Used automatically by the "Forgot Passkey" recovery wizard on the login screen.</span>
          </div>
        </div>

      </div>

      {/* CARD 3: EMERGENCY MASTER RECOVERY TOKEN */}
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-7 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 text-red-400 rounded-xl flex items-center justify-center border border-red-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Emergency Master Offline Recovery Token</h3>
              <p className="text-xs text-slate-400">
                Offline cryptographic token to bypass standard login in critical recovery scenarios
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyToken}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedToken ? 'Copied!' : 'Copy Token'}</span>
            </button>

            <button
              onClick={handleRegenerateToken}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Regenerate</span>
            </button>
          </div>
        </div>

        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span className="font-mono text-sm sm:text-base font-black text-amber-400 tracking-wider break-all">
            {cms.security?.emergencyRecoveryToken || 'MT-RECOVER-SECURE-2026'}
          </span>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Store Securely Offline
          </span>
        </div>
      </div>

      {/* CARD 4: COMPREHENSIVE SECURITY AUDIT & FAILED PASSKEY LOGGING SYSTEM */}
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6">
        
        {/* Header & Quick Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center border border-purple-500/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">Security & Failed Login Audit System</h3>
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-md text-[10px] font-black uppercase">
                  Telemetry Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Audits all passkey authentication attempts, captures failed input lengths, IP origins, browser headers & request metadata
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSimulateFailedAttempt}
              disabled={isSimulatingAttempt}
              className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors active:scale-95"
              title="Test the security logging system with a simulated failed passkey attempt"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSimulatingAttempt ? 'Logging...' : 'Simulate Test Failed Attempt'}</span>
            </button>

            <button
              onClick={loadServerLogs}
              disabled={isLoadingLogs}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLogs ? 'animate-spin text-amber-400' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handlePurgeLogs}
              className="px-3 py-2 bg-slate-800 hover:bg-red-950 text-red-400 text-xs font-bold rounded-xl border border-slate-700 hover:border-red-800 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge</span>
            </button>
          </div>
        </div>

        {/* Audit Analytics KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Events</span>
              <Activity className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {totalLogs}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Recorded in audit stream</div>
          </div>

          <div className="bg-slate-950 border border-red-900/30 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-red-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Failed Logins</span>
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-red-400">
              {failedAttempts}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {failedAttempts > 0 ? `${Math.round((failedAttempts / Math.max(totalLogs, 1)) * 100)}% of total attempts` : 'Zero failed attempts'}
            </div>
          </div>

          <div className="bg-slate-950 border border-emerald-900/30 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-emerald-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Verified Logins</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400">
              {successfulLogins}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Authorized passkey unlocks</div>
          </div>

          <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-cyan-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Unique IPs</span>
              <Globe className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-cyan-400">
              {uniqueIps}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Distinct client sources</div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row gap-3 pt-1">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search audit trail by IP address, browser, OS, failure reason, or keywords..."
              value={logSearchQuery}
              onChange={(e) => setLogSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-colors"
            />
            {logSearchQuery && (
              <button
                onClick={() => setLogSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Action Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setLogFilterAction('all')}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                logFilterAction === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              All Events ({totalLogs})
            </button>

            <button
              onClick={() => setLogFilterAction('login_failed')}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                logFilterAction === 'login_failed'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-950 text-red-400 hover:text-red-300 border border-red-900/40'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Failed Logins ({failedAttempts})</span>
            </button>

            <button
              onClick={() => setLogFilterAction('login_success')}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                logFilterAction === 'login_success'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-950 text-emerald-400 hover:text-emerald-300 border border-emerald-900/40'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Successful ({successfulLogins})</span>
            </button>

            <button
              onClick={() => setLogFilterAction('passkey_changed')}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                logFilterAction === 'passkey_changed'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Passkey Resets
            </button>
          </div>
        </div>

        {/* Severity Filter Dropdown / Row */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase text-slate-500">Filter Severity:</span>
            <div className="flex items-center gap-1">
              {(['all', 'critical', 'warning', 'info'] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setLogFilterSeverity(sev)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    logFilterSeverity === sev
                      ? sev === 'critical'
                        ? 'bg-red-500 text-white'
                        : sev === 'warning'
                        ? 'bg-amber-500 text-slate-950'
                        : sev === 'info'
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-purple-600 text-white'
                      : 'bg-slate-950 text-slate-500 hover:text-slate-300 border border-slate-800'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          <span className="text-[11px] font-medium text-slate-500">
            Showing {filteredLogs.length} of {totalLogs} event(s)
          </span>
        </div>

        {/* Security Logs List */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center bg-slate-950 border border-slate-800/80 rounded-2xl space-y-2">
              <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-300">No security audit logs match the current filters</p>
              <p className="text-xs text-slate-500">Try adjusting your search criteria or trigger a test event above.</p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isSuccess = log.action === 'login_success';
              const isFail = log.action === 'login_failed';
              const isCritical = log.severity === 'critical';
              const isWarning = log.severity === 'warning';
              const isExpanded = Boolean(expandedLogIds[log.id]);

              return (
                <div
                  key={log.id}
                  className={`bg-slate-950 border rounded-2xl transition-all ${
                    isFail 
                      ? isCritical 
                        ? 'border-red-800/80 bg-red-950/20' 
                        : 'border-red-900/40 bg-slate-950'
                      : isSuccess
                      ? 'border-emerald-900/30 bg-slate-950'
                      : 'border-slate-800 bg-slate-950'
                  }`}
                >
                  {/* Primary Row */}
                  <div className="p-4 flex flex-col md:flex-row md:items-start justify-between gap-3 text-xs">
                    
                    <div className="space-y-2 flex-1">
                      {/* Badge and Title */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Action Badge */}
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          isSuccess
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : isFail
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {log.action.replace('_', ' ')}
                        </span>

                        {/* Severity Badge */}
                        {log.severity && (
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                            isCritical
                              ? 'bg-red-600 text-white'
                              : isWarning
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {log.severity}
                          </span>
                        )}

                        {/* Failure Reason Badge */}
                        {log.failureReason && (
                          <span className="px-2 py-0.5 bg-red-950 border border-red-800/60 text-red-300 rounded text-[10px] font-mono">
                            Reason: {log.failureReason.replace('_', ' ')}
                          </span>
                        )}

                        {/* Masked Input Badge if failed */}
                        {log.attemptMasked && (
                          <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-300 rounded text-[10px] font-mono">
                            Attempt: {log.attemptMasked}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-slate-200 text-xs sm:text-sm font-medium leading-relaxed">
                        {log.description}
                      </p>

                      {/* Metadata Chips: IP, Browser, OS, Device, Path */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {/* IP Address with Copy */}
                        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg text-[11px] font-mono text-cyan-400">
                          <Globe className="w-3 h-3 text-slate-500" />
                          <span>{log.ip || '127.0.0.1'}</span>
                          <button
                            onClick={() => handleCopyIp(log.ip || '127.0.0.1', log.id)}
                            className="text-slate-500 hover:text-white ml-1"
                            title="Copy IP"
                          >
                            {copiedIpId === log.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>

                        {/* Device & Browser */}
                        {(log.deviceType || log.browser) && (
                          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg text-[11px] text-slate-300">
                            <Monitor className="w-3 h-3 text-slate-500" />
                            <span>{log.deviceType || 'Client'}</span>
                            {log.browser && <span>• {log.browser}</span>}
                            {log.os && <span>({log.os})</span>}
                          </div>
                        )}

                        {/* Request Path */}
                        {log.requestPath && (
                          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg text-[11px] font-mono text-slate-400">
                            <Terminal className="w-3 h-3 text-slate-500" />
                            <span>{log.requestPath}</span>
                          </div>
                        )}

                        {/* Method */}
                        {log.attemptMethod && (
                          <div className="bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg text-[10px] font-bold text-slate-400 uppercase">
                            Method: {log.attemptMethod.replace('_', ' ')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timestamp & Toggle Dropdown */}
                    <div className="flex md:flex-col items-center md:items-end justify-between gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-900">
                      <div className="text-right">
                        <div className="text-[11px] font-bold font-mono text-slate-300">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>

                      <button
                        onClick={() => toggleExpandLog(log.id)}
                        className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                      >
                        <span>{isExpanded ? 'Hide Raw Meta' : 'Inspect Meta'}</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>

                  </div>

                  {/* Expandable JSON / Raw Metadata Inspector */}
                  {isExpanded && (
                    <div className="p-4 bg-slate-950 border-t border-slate-900 rounded-b-2xl space-y-2 animate-fadeIn">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5 text-purple-400" />
                          <span>Full Audit Event Payload & Request Headers</span>
                        </span>
                        <span className="font-mono text-[10px] text-slate-500">ID: {log.id}</span>
                      </div>

                      <pre className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-[11px] font-mono text-purple-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                        {JSON.stringify({
                          id: log.id,
                          action: log.action,
                          timestamp: log.timestamp,
                          severity: log.severity,
                          failureReason: log.failureReason,
                          attemptMasked: log.attemptMasked,
                          attemptMethod: log.attemptMethod,
                          clientIp: log.ip,
                          deviceType: log.deviceType,
                          browser: log.browser,
                          os: log.os,
                          userAgent: log.userAgent,
                          requestPath: log.requestPath,
                          metadata: log.metadata,
                        }, null, 2)}
                      </pre>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

        {/* Footer Security Policy Note */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Audit logs are preserved server-side in persistent storage and synchronized in real-time.</span>
          </div>
          <span className="text-[11px] text-slate-500">Auto-pruning active past 1,000 security events</span>
        </div>

      </div>

    </div>
  );
};
