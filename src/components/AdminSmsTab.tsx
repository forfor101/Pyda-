import React, { useState, useEffect } from 'react';
import {
  Phone,
  MessageSquare,
  Send,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Smartphone,
  Radio,
  ExternalLink,
  Search,
  Filter,
  Key,
  Download,
  Copy,
  Check,
  Sparkles
} from 'lucide-react';
import { SmsDispatchLog, SmsGatewayConfig } from '../types';

interface AdminSmsTabProps {
  onOpenBatchNotifications?: () => void;
}

export const AdminSmsTab: React.FC<AdminSmsTabProps> = ({ onOpenBatchNotifications }) => {
  const [logs, setLogs] = useState<SmsDispatchLog[]>([]);
  const [config, setConfig] = useState<SmsGatewayConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Test SMS Sandbox States
  const [testPhone, setTestPhone] = useState<string>('08062466212');
  const [testMessage, setTestMessage] = useState<string>('Pyda Movers: Your Goods-In-Transit Insurance Policy #NIA-GIT-POL-84920-A has been generated and is ready in your Document Vault.');
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; sid?: string } | null>(null);

  const fetchLogsAndConfig = async () => {
    setIsLoading(true);
    try {
      const [configRes, logsRes] = await Promise.all([
        fetch('/api/sms/config'),
        fetch('/api/sms/logs'),
      ]);

      if (configRes.ok) {
        const configData = await configRes.json();
        setConfig(configData.config);
      }

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData.logs || []);
      }
    } catch (err) {
      console.error('Failed to load SMS config or logs in Admin:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogsAndConfig();
  }, []);

  const handleSendTestSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone.trim() || !testMessage.trim()) return;

    setIsSendingTest(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/sms/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: testPhone.trim(),
          message: testMessage.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: `SMS dispatched successfully to ${testPhone}`,
          sid: data.result?.messageSid,
        });
        fetchLogsAndConfig();
      } else {
        setTestResult({
          success: false,
          message: data.message || 'Failed to dispatch SMS test message.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Network error while attempting SMS dispatch.',
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleClearLogs = async () => {
    if (!window.confirm('Are you sure you want to clear all SMS dispatch logs?')) return;
    try {
      await fetch('/api/sms/logs', { method: 'DELETE' });
      fetchLogsAndConfig();
    } catch (err) {
      console.error('Failed to clear SMS logs:', err);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleExportCsv = () => {
    if (logs.length === 0) return;
    const headers = ['ID,Recipient,SenderID,DocumentReference,DocumentType,Status,Provider,DispatchedAt,Message'];
    const rows = logs.map((l) =>
      `"${l.id}","${l.recipient}","${l.senderId || 'PYDA'}","${l.docReference || ''}","${l.docType || ''}","${l.status}","${l.provider}","${l.dispatchedAt}","${(l.message || '').replace(/"/g, '""')}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Pyda_SMS_Dispatch_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = logs.filter((log) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      log.recipient.toLowerCase().includes(q) ||
      log.message.toLowerCase().includes(q) ||
      (log.docReference && log.docReference.toLowerCase().includes(q)) ||
      log.provider.toLowerCase().includes(q);

    const matchesFilter =
      filterType === 'all' ||
      (filterType === 'insurance' && log.docType === 'insurance_certificate') ||
      (filterType === 'delivered' && log.status === 'delivered') ||
      (filterType === 'failed' && log.status === 'failed');

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="pt-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Phone className="w-5 h-5 text-amber-400" />
              <span>SMS Notification Gateway (Twilio & Carrier Service)</span>
            </h2>
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                config?.provider === 'twilio'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
              }`}
            >
              <Radio className="w-2.5 h-2.5 animate-pulse" />
              <span>{config?.provider === 'twilio' ? 'Twilio Live Gateway' : 'High-Availability Native Gateway'}</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real-time automated text alerts for Insurance Certificates, Goods-In-Transit policies, digital waybill manifests, and Document Vault download access.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogsAndConfig}
            disabled={isLoading}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
            title="Refresh SMS statistics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={logs.length === 0}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Batch Notifications Feature Callout Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/30 p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Batch Notifications & Logistics Weather Alerts</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-slate-950 uppercase">New</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl leading-relaxed">
              Need to broadcast flood delays along the Lokoja corridor, severe harmattan haze warnings, or public holiday fleet schedules to all active clients simultaneously via Twilio?
            </p>
          </div>
        </div>

        {onOpenBatchNotifications && (
          <button
            onClick={onOpenBatchNotifications}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap shrink-0"
          >
            <span>Open Batch Broadcaster</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1">
          <span className="text-xs text-slate-400 font-bold block">Gateway Mode</span>
          <p className="text-base font-black text-white uppercase">
            {config?.provider === 'twilio' ? 'Twilio Cloud' : 'Native High-Avail'}
          </p>
          <span className="text-[11px] text-emerald-400 font-mono">
            {config?.hasTwilio ? '• Live REST API Active' : '• 100% Zero-Loss Resilience'}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1">
          <span className="text-xs text-slate-400 font-bold block">Alphanumeric Sender ID</span>
          <p className="text-base font-black text-amber-400 font-mono tracking-wider">
            {config?.senderId || 'PYDA'}
          </p>
          <span className="text-[11px] text-slate-400">Approved GSM Sender</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1">
          <span className="text-xs text-slate-400 font-bold block">Total Dispatched</span>
          <p className="text-base font-black text-white font-mono">{logs.length} SMS</p>
          <span className="text-[11px] text-emerald-400 font-mono">100% Handled</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1">
          <span className="text-xs text-slate-400 font-bold block">Twilio Credentials</span>
          <p className="text-base font-black text-slate-200">
            {config?.hasTwilio ? 'Configured' : 'Fallback Mode'}
          </p>
          <span className="text-[11px] text-slate-400">via .env / Secrets</span>
        </div>
      </div>

      {/* Grid: Test Sandbox + Environment Reference */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test SMS Sandbox */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-amber-400" />
              <span>Live SMS Dispatch Sandbox</span>
            </h3>
            <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded-full font-mono">
              E.164 GSM Format
            </span>
          </div>

          <form onSubmit={handleSendTestSms} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Recipient Mobile (+234 / 080...)
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="08062466212"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Sender Header Preview
                </label>
                <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-mono text-xs font-bold">
                  {config?.senderId || 'PYDA'}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Message Content
              </label>
              <textarea
                rows={3}
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                required
              />
              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                <span>Character Count: {testMessage.length}</span>
                <span>GSM Standard (~160 chars / segment)</span>
              </div>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-2xl flex items-center justify-between gap-3 text-xs ${
                  testResult.success
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{testResult.message}</span>
                </div>
                {testResult.sid && (
                  <span className="font-mono text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">
                    SID: {testResult.sid}
                  </span>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isSendingTest}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl shadow flex items-center gap-1.5 transition-all active:scale-95"
            >
              {isSendingTest ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Dispatching via Gateway...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Live Test SMS</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Twilio Configuration Guide & Docs */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-400" />
            <span>Twilio Environment Keys</span>
          </h3>

          <p className="text-xs text-slate-400 leading-relaxed">
            The SMS Notification Gateway reads standard Twilio credentials from system environment variables with automatic zero-downtime fallback.
          </p>

          <div className="space-y-2 font-mono text-[11px]">
            {[
              { key: 'TWILIO_ACCOUNT_SID', val: config?.accountSid || 'ACxxxxxxxxxxxxxxxxxxxxxxx' },
              { key: 'TWILIO_AUTH_TOKEN', val: config?.hasTwilio ? '••••••••••••••••' : 'your_auth_token' },
              { key: 'TWILIO_PHONE_NUMBER', val: config?.phoneNumber || '+1234567890' },
              { key: 'TWILIO_SENDER_ID', val: config?.senderId || 'PYDA' },
            ].map((item) => (
              <div
                key={item.key}
                className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between"
              >
                <div className="space-y-0.5 truncate mr-2">
                  <span className="text-amber-400 block font-bold text-[10px]">{item.key}</span>
                  <span className="text-slate-400 truncate block text-[10px]">{item.val}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(item.key, item.key)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors shrink-0"
                >
                  {copiedKey === item.key ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-2xl text-[11px] text-blue-300 space-y-1">
            <span className="font-bold block flex items-center gap-1 text-blue-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Nigerian Carrier Compliance</span>
            </span>
            <p className="text-slate-400">
              Phone numbers are automatically normalized to E.164 standard (+234...).
            </p>
          </div>
        </div>
      </div>

      {/* SMS Dispatch History Table */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-white">SMS Dispatch Audit Trail</h3>
            <span className="bg-slate-800 text-slate-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
              {filteredLogs.length} Records
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Buttons */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {[
                { id: 'all', label: 'All' },
                { id: 'insurance', label: 'Insurance' },
                { id: 'delivered', label: 'Delivered' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilterType(f.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                    filterType === f.id
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipient or ref..."
                className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-white text-xs focus:outline-none focus:border-amber-400 w-48"
              />
            </div>

            <button
              onClick={handleClearLogs}
              className="p-2 rounded-xl bg-slate-950 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
              title="Clear all logs"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 bg-slate-950/60 rounded-2xl border border-dashed border-slate-800 space-y-2">
            <Smartphone className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="font-bold text-white text-xs">No SMS Logs Recorded</p>
            <p className="text-[11px] text-slate-500">
              When insurance certificates or quote alerts are issued, dispatch history will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-mono">
                  <th className="pb-3 font-bold">Recipient Mobile</th>
                  <th className="pb-3 font-bold">Doc Reference</th>
                  <th className="pb-3 font-bold">Message Preview</th>
                  <th className="pb-3 font-bold">Provider</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-950/40 transition-colors">
                    <td className="py-3 font-mono font-bold text-amber-400 whitespace-nowrap">
                      {log.recipient}
                    </td>
                    <td className="py-3 font-mono text-[11px] text-slate-300 whitespace-nowrap">
                      {log.docReference || 'N/A'}
                    </td>
                    <td className="py-3 text-slate-300 max-w-xs truncate pr-4 text-[11px]">
                      {log.message}
                    </td>
                    <td className="py-3 uppercase text-[10px] font-mono text-slate-400">
                      {log.provider}
                    </td>
                    <td className="py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          log.status === 'delivered' || log.status === 'sent'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {log.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-[10px] text-slate-500 whitespace-nowrap">
                      {new Date(log.dispatchedAt).toLocaleString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
