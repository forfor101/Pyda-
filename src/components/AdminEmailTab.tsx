import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Clock, 
  FileText, 
  ShieldCheck, 
  Server, 
  Eye, 
  ExternalLink,
  Sparkles,
  Inbox,
  Check,
  RotateCw,
  Maximize2
} from 'lucide-react';
import { MockEmailPreviewModal, EmailTemplateType } from './MockEmailPreviewModal';

interface EmailDispatchLog {
  id: string;
  type: 'quote_confirmation' | 'contact_receipt' | 'job_application' | 'test_email' | 'admin_notification';
  recipient: string;
  subject: string;
  status: 'delivered' | 'sent' | 'simulated' | 'failed';
  provider: 'resend' | 'sendgrid' | 'smtp' | 'native_engine';
  messageId?: string;
  error?: string;
  dispatchedAt: string;
  previewSnippet?: string;
}

interface AdminEmailTabProps {
  showToast: (msg: string) => void;
  onOpenMockPreview?: (template?: EmailTemplateType) => void;
}

export const AdminEmailTab: React.FC<AdminEmailTabProps> = ({ showToast, onOpenMockPreview }) => {
  const [config, setConfig] = useState<any>(null);
  const [logs, setLogs] = useState<EmailDispatchLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [testRecipient, setTestRecipient] = useState('yerimaforfor@gmail.com');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [activePreview, setActivePreview] = useState<'quote' | 'contact' | 'career'>('quote');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTemplate, setModalTemplate] = useState<EmailTemplateType>('quote_confirmation');

  const handleOpenPreview = (template: EmailTemplateType = 'quote_confirmation') => {
    if (onOpenMockPreview) {
      onOpenMockPreview(template);
    } else {
      setModalTemplate(template);
      setIsModalOpen(true);
    }
  };

  const fetchEmailData = async () => {
    setLoading(true);
    try {
      const [configRes, logsRes] = await Promise.all([
        fetch('/api/email/config'),
        fetch('/api/email/logs'),
      ]);

      if (configRes.ok) {
        const cData = await configRes.json();
        setConfig(cData.config);
      }
      if (logsRes.ok) {
        const lData = await logsRes.json();
        setLogs(lData.logs || []);
      }
    } catch (err) {
      console.warn('Unable to fetch email logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmailData();
    const interval = setInterval(fetchEmailData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipient) return;

    setIsSendingTest(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient: testRecipient }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({
          success: true,
          message: data.message,
          messageId: data.result?.messageId,
          provider: data.result?.provider,
        });
        showToast(`Verification test email dispatched to ${testRecipient}`);
        fetchEmailData();
      } else {
        setTestResult({
          success: false,
          error: data.error || 'Failed to dispatch email',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        error: err.message || 'Network error occurred during email test',
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSwitchProvider = async (newProvider: string) => {
    try {
      const res = await fetch('/api/email/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: newProvider }),
      });
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
        showToast(`Delivery engine set to ${newProvider.replace('_', ' ').toUpperCase()}`);
      }
    } catch (err: any) {
      console.warn('Could not update provider', err);
    }
  };

  return (
    <div className="pt-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Mail className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl sm:text-2xl font-black text-white">Automated Email Notification Service</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Real-time transactional email delivery engine. Automatically dispatches branded quote breakdowns and formal inquiry confirmations to clients with instant dispatcher routing.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-center">
          <button
            type="button"
            onClick={() => handleOpenPreview('quote_confirmation')}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            title="Launch Full Email Preview Inspector"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Mock Email Preview Modal</span>
          </button>

          <button
            onClick={fetchEmailData}
            disabled={loading}
            className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Activity</span>
          </button>
        </div>
      </div>

      {/* Grid: Mail Engine Status & Interactive Test Sender */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Gateway Status Card */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <span>Mail Gateway Configuration</span>
            </h3>
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Active</span>
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Active Delivery Provider:</span>
              <span className="font-bold text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                {config?.provider ? config.provider.replace('_', ' ') : 'Transactional Engine'}
              </span>
            </div>

            <div className="py-2 border-b border-slate-800/60 space-y-1.5">
              <span className="text-slate-400 block text-[11px]">Select Active Mail Engine:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'native_engine', label: 'Native Engine (HA)' },
                  { id: 'resend', label: 'Resend API', disabled: !config?.hasResend },
                  { id: 'sendgrid', label: 'SendGrid API', disabled: !config?.hasSendgrid },
                  { id: 'smtp', label: 'SMTP Transport', disabled: !config?.hasSmtp },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    disabled={p.disabled}
                    onClick={() => handleSwitchProvider(p.id)}
                    title={p.disabled ? `${p.label} requires valid credentials in .env` : `Switch to ${p.label}`}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                      config?.provider === p.id
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-sm'
                        : p.disabled
                        ? 'bg-slate-950/40 text-slate-600 border-slate-900 cursor-not-allowed opacity-60'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Sender Identity:</span>
              <span className="font-mono text-slate-200 text-[11px] truncate max-w-[200px]" title={config?.emailFrom}>
                {config?.emailFrom || 'Pyda Movers <dispatch@pydamovers.com>'}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Admin Notification Alert:</span>
              <span className="font-mono text-slate-200 text-[11px] font-bold text-emerald-300">
                {config?.adminEmail || 'yerimaforfor@gmail.com'}
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">Total Dispatched In Session:</span>
              <span className="font-mono text-white font-black text-sm">{logs.length} Emails</span>
            </div>
          </div>

          {/* Trigger Rules */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2.5 text-[11px] text-slate-300">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Automated Dispatch Triggers</span>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>New Quote Request:</strong> Sends formal HTML quotation + cost estimate + dispatch hotline.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Contact Form:</strong> Sends ticket receipt + expected response time (&lt; 2 hrs).</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Admin Notification:</strong> Dispatches real-time booking alert to Yerima / Dispatch inbox.</span>
            </div>
          </div>
        </div>

        {/* Live Test Sender Card */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-amber-400" />
              <span>Diagnostic Email Dispatch Verification</span>
            </h3>
            <span className="text-xs text-slate-400">Interactive Test</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Test the end-to-end email pipeline by triggering an automated transactional verification message to any inbox.
          </p>

          <form onSubmit={handleSendTestEmail} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Target Recipient Email Address
              </label>
              <input
                type="email"
                required
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                placeholder="e.g. yerimaforfor@gmail.com"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl px-4 py-3 text-xs outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSendingTest}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSendingTest ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Dispatching Test Email...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Verification Test Email</span>
                </>
              )}
            </button>
          </form>

          {/* Test Result Banner */}
          {testResult && (
            <div className={`p-4 rounded-2xl border text-xs animate-fade-in ${
              testResult.success 
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
                : 'bg-red-950/60 border-red-500/40 text-red-300'
            }`}>
              <div className="flex items-start gap-2.5">
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold">{testResult.success ? 'Email Dispatched Successfully' : 'Dispatch Failed'}</p>
                  <p className="mt-0.5">{testResult.message || testResult.error}</p>
                  {testResult.messageId && (
                    <p className="font-mono text-[10px] text-slate-400 mt-1">Message-ID: &lt;{testResult.messageId}&gt;</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Transactional Email Dispatch Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl space-y-4 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Inbox className="w-4 h-4 text-amber-400" />
              <span>Real-Time Email Dispatch Audit Logs</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live audit trail of confirmation emails sent to clients and internal dispatch alerts.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 self-start">
            {logs.length} Total Messages Logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-black tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3.5">Log ID / Message-ID</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Recipient</th>
                <th className="p-3.5">Subject</th>
                <th className="p-3.5">Provider</th>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 font-sans">
                    No email dispatches recorded yet in this session. Submit a quote or send a test email above to see live activity.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="p-3.5 font-bold text-amber-400">{log.messageId || log.id}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold uppercase ${
                        log.type === 'quote_confirmation'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : log.type === 'contact_receipt'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : log.type === 'job_application'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {log.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 text-white font-sans font-bold">{log.recipient}</td>
                    <td className="p-3.5 font-sans text-slate-300 truncate max-w-[220px]" title={log.subject}>
                      {log.subject}
                    </td>
                    <td className="p-3.5 uppercase text-slate-400">{log.provider}</td>
                    <td className="p-3.5 text-slate-500 font-sans text-[10px]">
                      {new Date(log.dispatchedAt).toLocaleTimeString()} ({new Date(log.dispatchedAt).toLocaleDateString()})
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="inline-flex items-center gap-1 bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase">
                        <Check className="w-3 h-3" />
                        <span>{log.status}</span>
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          const typeMap: Record<string, EmailTemplateType> = {
                            quote_confirmation: 'quote_confirmation',
                            contact_receipt: 'contact_receipt',
                            job_application: 'job_application',
                          };
                          handleOpenPreview(typeMap[log.type] || 'quote_confirmation');
                        }}
                        className="p-1.5 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 rounded-lg transition-colors cursor-pointer"
                        title="Preview email notification in modal"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Email Template Preview Showcase */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-400" />
              <span>Interactive Client Email Template Preview</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Review how confirmation emails render on client desktop and mobile screens.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const map: Record<string, EmailTemplateType> = {
                  quote: 'quote_confirmation',
                  contact: 'contact_receipt',
                  career: 'job_application',
                };
                handleOpenPreview(map[activePreview] || 'quote_confirmation');
              }}
              className="px-3.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Open full interactive preview modal with Desktop & Mobile frames"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Full Preview Modal</span>
            </button>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActivePreview('quote')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activePreview === 'quote' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                Quote Confirmation
              </button>
              <button
                onClick={() => setActivePreview('contact')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activePreview === 'contact' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                Contact Form Receipt
              </button>
              <button
                onClick={() => setActivePreview('career')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activePreview === 'career' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                Career Application
              </button>
            </div>
          </div>
        </div>

        {/* Render Mock Preview Box */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 max-w-xl mx-auto text-slate-900 shadow-2xl bg-white overflow-hidden">
          {activePreview === 'quote' && (
            <div className="space-y-4 text-left font-sans">
              <div className="bg-slate-950 text-white p-4 rounded-xl text-center border-b-2 border-amber-500">
                <h4 className="font-black text-amber-400 text-base tracking-wider">PYDA MOVERS & LOGISTICS</h4>
                <p className="text-[10px] text-slate-300 uppercase tracking-widest">Official Freight & Moving Quotation</p>
              </div>

              <div className="text-xs space-y-2 pt-2">
                <span className="inline-block bg-amber-100 text-amber-800 font-extrabold px-2.5 py-0.5 rounded text-[10px]">
                  REF #QUOTE-77102
                </span>
                <h5 className="font-black text-slate-900 text-sm">Dear Valued Client / Yerima Forfor,</h5>
                <p className="text-slate-600 text-xs">
                  Thank you for choosing <strong>Pyda Movers & Logistics Ltd</strong>. Below are your formal moving specifications:
                </p>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between"><span>Service:</span><strong className="text-slate-900">Interstate Heavy Freight</strong></div>
                  <div className="flex justify-between"><span>Corridor:</span><strong className="text-slate-900">Lagos ➔ Abuja FCT</strong></div>
                  <div className="flex justify-between"><span>Scheduled Date:</span><strong className="text-slate-900">2026-08-20</strong></div>
                  <div className="flex justify-between"><span>Multi-Layer Crating:</span><strong className="text-emerald-700">✅ Included</strong></div>
                  <div className="flex justify-between"><span>Goods-in-Transit Cover:</span><strong className="text-emerald-700">✅ Included (100%)</strong></div>
                </div>

                <div className="bg-slate-900 text-white p-3 rounded-xl text-center">
                  <div className="text-[10px] text-amber-400 uppercase font-bold">Estimated Cost (Subject to Survey)</div>
                  <div className="text-xl font-black font-mono">₦450,000</div>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-[11px] text-amber-900">
                  <strong>Dispatcher Callback:</strong> Our senior coordinator will call you at 0806 246 6212 within 15 minutes.
                </div>
              </div>
            </div>
          )}

          {activePreview === 'contact' && (
            <div className="space-y-4 text-left font-sans">
              <div className="bg-slate-950 text-white p-4 rounded-xl text-center border-b-2 border-amber-500">
                <h4 className="font-black text-amber-400 text-base tracking-wider">PYDA MOVERS & LOGISTICS</h4>
                <p className="text-[10px] text-slate-300 uppercase tracking-widest">Inquiry Receipt & Customer Care</p>
              </div>

              <div className="text-xs space-y-2 pt-2">
                <span className="inline-block bg-blue-100 text-blue-800 font-extrabold px-2.5 py-0.5 rounded text-[10px]">
                  TICKET #MSG-172382910
                </span>
                <h5 className="font-black text-slate-900 text-sm">Hello Valued Client,</h5>
                <p className="text-slate-600 text-xs">
                  We have received your corporate inquiry regarding <strong>"Corporate Office Relocation"</strong>.
                </p>

                <div className="bg-slate-50 border-l-4 border-amber-500 p-3 rounded text-xs text-slate-700 italic">
                  "Need to relocate 80 executive workstations from Victoria Island Lagos to CBD Abuja next weekend."
                </div>

                <p className="text-slate-600 text-xs">
                  Our dispatch operations team will call you back on WhatsApp / phone at <strong>0803 123 4567</strong> or reply to your email within 2 hours.
                </p>
              </div>
            </div>
          )}

          {activePreview === 'career' && (
            <div className="space-y-4 text-left font-sans">
              <div className="bg-slate-950 text-white p-4 rounded-xl text-center border-b-2 border-emerald-500">
                <h4 className="font-black text-emerald-400 text-base tracking-wider">PYDA MOVERS RECRUITMENT</h4>
                <p className="text-[10px] text-slate-300 uppercase tracking-widest">Career Application Confirmation</p>
              </div>

              <div className="text-xs space-y-2 pt-2">
                <h5 className="font-black text-slate-900 text-sm">Application Confirmed: Babatunde Adeleke</h5>
                <p className="text-slate-600 text-xs">
                  Thank you for applying for <strong>Senior Heavy Duty Articulated Truck Driver</strong> at Pyda Movers & Logistics.
                </p>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs text-slate-700">
                  <strong>Status:</strong> Under Review by Fleet HR Coordinator (Abuja HQ)
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mock Email Preview Modal */}
      <MockEmailPreviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTemplate={modalTemplate}
        showToast={showToast}
      />
    </div>
  );
};
