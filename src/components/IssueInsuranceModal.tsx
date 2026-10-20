import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Sparkles,
  Phone,
  MessageSquare,
  Send,
  Building2,
  MapPin,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  Stamp,
  Radio,
  FileCheck2
} from 'lucide-react';
import { CustomerUser, VaultDocument } from '../types';

interface IssueInsuranceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CustomerUser;
  onCertificateIssued: (cert: VaultDocument, smsStatus?: { sent: boolean; recipient: string; provider: string; messageSid?: string }) => void;
}

export const IssueInsuranceModal: React.FC<IssueInsuranceModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onCertificateIssued,
}) => {
  const [tier, setTier] = useState<'gold' | 'diamond' | 'commercial'>('gold');
  const [coverageNaira, setCoverageNaira] = useState<number>(25000000);
  const [underwriter, setUnderwriter] = useState<string>('Leadway Assurance Plc & AIICO Consortium');
  const [originCity, setOriginCity] = useState<string>(currentUser.defaultCity || 'Lagos (Island/Mainland)');
  const [destinationCity, setDestinationCity] = useState<string>('Abuja (Federal Capital Territory)');
  const [cargoDescription, setCargoDescription] = useState<string>('High-Value Corporate & Residential Household Goods, Sensitive Electronics & Furniture');
  
  // SMS Notification Gateway States
  const [sendSmsAlert, setSendSmsAlert] = useState<boolean>(true);
  const [recipientPhone, setRecipientPhone] = useState<string>(currentUser.phone || '08062466212');
  const [recipientName, setRecipientName] = useState<string>(currentUser.fullName || 'Valued Client');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const getPolicyTitle = () => {
    switch (tier) {
      case 'gold':
        return 'Goods-In-Transit (GIT) Gold All-Risk Marine & Cargo Policy';
      case 'diamond':
        return 'Diamond Executive Interstate Haulage & High-Value Cargo Policy';
      case 'commercial':
        return 'Commercial Enterprise & Heavy Equipment Transit Indemnity';
      default:
        return 'Goods-In-Transit (GIT) All-Risk Insurance Policy';
    }
  };

  const handleQuickPreset = (val: number) => {
    setCoverageNaira(val);
  };

  const handleGenerateAndDispatch = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const randomId = Math.floor(1000 + Math.random() * 9000);
    const refNum = `NIA-GIT-POL-${randomId}-NG`;
    const stampCode = `NIA-CERT-${randomId}-SECURE`;

    const newCert: VaultDocument = {
      id: `DOC-INS-2026-${randomId}`,
      title: getPolicyTitle(),
      docType: 'insurance_certificate',
      referenceNumber: refNum,
      issuedDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active',
      fileSize: '480 KB',
      underwriterOrIssuer: underwriter,
      coverageAmountNaira: coverageNaira,
      originCity,
      destinationCity,
      signatories: ['Chief Underwriting Officer (Leadway)', currentUser.fullName],
      summaryText: `Official Goods-In-Transit Certificate guaranteeing ₦${Number(coverageNaira).toLocaleString()} full cargo indemnity, zero deductible, and 48-hour express claim settlement.`,
      verifiedStampCode: stampCode,
      tags: ['Insurance', 'Gold All-Risk', 'Underwritten', 'SMS Notified'],
      smsNotificationSent: false,
    };

    let smsResult: any = { sent: false, recipient: recipientPhone, provider: 'none' };

    // If SMS alert is requested, call SMS Notification Gateway
    if (sendSmsAlert && recipientPhone.trim()) {
      try {
        const response = await fetch('/api/sms/notify-insurance-certificate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cert: newCert,
            recipientPhone: recipientPhone.trim(),
            recipientName: recipientName.trim() || currentUser.fullName,
            vaultUrl: `${window.location.origin}/?view=dashboard&tab=vault`,
          }),
        });

        const resData = await response.json();
        if (response.ok && resData.success) {
          smsResult = {
            sent: true,
            recipient: recipientPhone.trim(),
            provider: resData.result?.provider || 'twilio',
            messageSid: resData.result?.messageSid,
          };
          newCert.smsNotificationSent = true;
          newCert.smsRecipientPhone = recipientPhone.trim();
          newCert.smsDispatchedAt = new Date().toISOString();
          newCert.smsMessageSid = resData.result?.messageSid;
        } else {
          console.warn('[SMS Gateway Warning]:', resData.message);
          smsResult = {
            sent: false,
            recipient: recipientPhone.trim(),
            provider: 'error',
            error: resData.message,
          };
        }
      } catch (err: any) {
        console.error('[SMS Dispatch Error]:', err);
      }
    }

    setIsSubmitting(false);
    onCertificateIssued(newCert, smsResult);
    onClose();
  };

  const previewSmsText = `Pyda Movers: Hello ${recipientName || currentUser.fullName}, Your Goods-In-Transit Insurance Policy #NIA-GIT-POL-xxxx-NG (₦${Number(coverageNaira).toLocaleString()} All-Risk Cover by ${underwriter.split('&')[0].trim()}) has been issued. View & download in Document Vault: ${window.location.origin}/?view=dashboard&tab=vault • Hotline: 0806 246 6212`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Issue Goods-In-Transit (GIT) Policy</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  NIA Certified
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Underwritten by Leadway Assurance & AIICO Consortium with instant SMS alerts.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* Policy Tier Picker */}
          <div>
            <label className="font-bold text-slate-200 block mb-2">Select Protection Tier</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  id: 'gold',
                  title: 'Gold All-Risk',
                  cap: '₦25,000,000 Cover',
                  badge: 'Most Popular',
                  defaultNaira: 25000000
                },
                {
                  id: 'diamond',
                  title: 'Diamond Interstate',
                  cap: '₦50,000,000 Cover',
                  badge: 'Full Replacement',
                  defaultNaira: 50000000
                },
                {
                  id: 'commercial',
                  title: 'Commercial Haulage',
                  cap: '₦100,000,000 Cover',
                  badge: 'Enterprise Cargo',
                  defaultNaira: 100000000
                }
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => {
                    setTier(item.id as any);
                    setCoverageNaira(item.defaultNaira);
                  }}
                  className={`p-3 rounded-2xl text-left border transition-all ${
                    tier === item.id
                      ? 'bg-amber-500/15 border-amber-500/60 text-white shadow-md'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-white">{item.title}</span>
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-400 font-mono font-bold">{item.cap}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Insured Cargo Value (₦) */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-200">Insured Cargo Declared Sum</label>
              <span className="text-amber-400 font-mono font-bold text-sm">
                ₦{Number(coverageNaira).toLocaleString()}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {[5000000, 15000000, 25000000, 50000000, 100000000].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => handleQuickPreset(preset)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-colors ${
                    coverageNaira === preset
                      ? 'bg-amber-500 text-slate-950 border-amber-500'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  ₦{(preset / 1000000).toFixed(0)}M
                </button>
              ))}
            </div>

            <input
              type="number"
              value={coverageNaira}
              onChange={(e) => setCoverageNaira(Math.max(100000, Number(e.target.value) || 0))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
              placeholder="Enter custom insured sum..."
            />
          </div>

          {/* Route & Underwriter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-200 block mb-1.5">Pick-up Origin</label>
              <input
                type="text"
                value={originCity}
                onChange={(e) => setOriginCity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                placeholder="e.g. Lagos (Island/Mainland)"
              />
            </div>

            <div>
              <label className="font-bold text-slate-200 block mb-1.5">Drop-off Destination</label>
              <input
                type="text"
                value={destinationCity}
                onChange={(e) => setDestinationCity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                placeholder="e.g. Abuja FCT"
              />
            </div>
          </div>

          {/* Underwriter Consortium */}
          <div>
            <label className="font-bold text-slate-200 block mb-1.5">Underwriting Authority</label>
            <select
              value={underwriter}
              onChange={(e) => setUnderwriter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="Leadway Assurance Plc & AIICO Consortium">Leadway Assurance Plc & AIICO Consortium</option>
              <option value="AIICO Insurance Plc (Marine & Transit Underwriting)">AIICO Insurance Plc (Marine & Transit Underwriting)</option>
              <option value="Pyda Marine & Heavy Haulage Syndicate">Pyda Marine & Heavy Haulage Syndicate</option>
              <option value="Sovereign Trust Insurance Plc">Sovereign Trust Insurance Plc</option>
            </select>
          </div>

          {/* Cargo Description */}
          <div>
            <label className="font-bold text-slate-200 block mb-1.5">Insured Consignment & Cargo Specification</label>
            <input
              type="text"
              value={cargoDescription}
              onChange={(e) => setCargoDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
              placeholder="e.g. Household Furniture, 4K Electronics, Fragile Glassware"
            />
          </div>

          {/* ==================================================== */}
          {/* SMS NOTIFICATION GATEWAY INTEGRATION (TWILIO) */}
          {/* ==================================================== */}
          <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-4 space-y-3.5 shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-white text-xs flex items-center gap-2">
                    <span>SMS Notification Gateway (Twilio)</span>
                    <span className="text-[9px] bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded-full border border-blue-500/30">
                      Live Text Alerts
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Notify customer via direct SMS text message once certificate is ready for download.
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendSmsAlert}
                  onChange={(e) => setSendSmsAlert(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {sendSmsAlert && (
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Recipient Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        value={recipientPhone}
                        onChange={(e) => setRecipientPhone(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                        placeholder="e.g. 08062466212 or +234..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Customer Salutation Name
                    </label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                      placeholder="e.g. Chief Aliu Danjuma"
                    />
                  </div>
                </div>

                {/* SMS Text Message Live Preview */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1 font-bold text-amber-400">
                      <MessageSquare className="w-3 h-3" />
                      <span>SMS Text Preview (Sender: PYDA)</span>
                    </span>
                    <span>~160 Chars • GSM Standard</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                    {previewSmsText}
                  </p>
                </div>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleGenerateAndDispatch}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl shadow-lg active:scale-95 transition-all flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                <span>Generating & Dispatching SMS...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Issue Certificate & Dispatch SMS Alert</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
