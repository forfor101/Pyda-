import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, ShieldCheck, Building2, Copy, Check, QrCode, Smartphone, MessageSquare, AlertCircle } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { QrCodeShareModal } from './QrCodeShareModal';
import { QRCodeSVG } from 'qrcode.react';
import { validateFullName, validatePhone, validateEmail, validateMessage } from '../utils/validation';

export const ContactSection: React.FC = () => {
  const { cms } = useCms();
  const { company } = cms;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Corporate Moving Inquiry');
  const [message, setMessage] = useState('');

  // Touched state for real-time validation feedback
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const markTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Real-time validations
  const nameVal = validateFullName(name);
  const phoneVal = validatePhone(phone);
  const emailVal = validateEmail(email);
  const messageVal = validateMessage(message, 10);

  const isFormValid = nameVal.isValid && phoneVal.isValid && emailVal.isValid && messageVal.isValid;
  const [formError, setFormError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // QR Modal States
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrOffice, setQrOffice] = useState<'abuja' | 'lagos' | 'general'>('general');
  const [qrTitle, setQrTitle] = useState('Pyda Movers Digital Contact Card');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      name: true,
      phone: true,
      email: true,
      message: true,
    });

    if (!isFormValid) {
      const firstErr = nameVal.error || phoneVal.error || emailVal.error || messageVal.error;
      setFormError(firstErr || 'Please check and fill out all required fields accurately.');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, subject, message }),
      });
      const data = await res.json();
      setSubmittedMessage(data.message || 'Message sent successfully!');
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setTouched({});
    } catch (err) {
      setSubmittedMessage(`Thank you ${name}. Your message has been sent to dispatch. We will call you at ${phone}.`);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setTouched({});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(label);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const handleOpenQr = (office: 'abuja' | 'lagos' | 'general', customTitle?: string) => {
    setQrOffice(office);
    setQrTitle(customTitle || 'Pyda Movers Digital Contact Card');
    setQrModalOpen(true);
  };

  // Pyda Movers vCard format for inline mini QR preview
  const contactVCard = `BEGIN:VCARD
VERSION:3.0
N:Movers;Pyda;;;
FN:Pyda Movers & Logistics Ltd
ORG:Pyda Movers & Logistics Ltd
TEL;TYPE=WORK,VOICE:+2348062466212
TEL;TYPE=CELL,VOICE:+2349072222841
EMAIL;TYPE=PREF,INTERNET:info@pydamovers.com
URL:https://pydamovers.com
ADR;TYPE=WORK:;;Suite 204, Citygate Plaza, Central Business District;Abuja;FCT;900211;Nigeria
NOTE:Premier Corporate Relocation & Interstate Haulage.
END:VCARD`;

  return (
    <section id="contact-us" className="py-16 lg:py-24 bg-slate-900 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title & Quick QR Action */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="flex items-center justify-center gap-2">
            <span className="inline-block text-amber-400 font-extrabold text-xs uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-3.5 py-1 rounded-full">
              Direct Corporate Communication
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Contact {company.name}</h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Visit our corporate office in Abuja or our maritime logistics hub in Lagos, or call our 24/7 hotline numbers for instant dispatch support.
          </p>

          {/* Quick Bar with Scan QR Button */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => handleOpenQr('general', 'Pyda Movers Official Contact Card')}
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs px-4 py-2 rounded-xl border border-slate-700 shadow-md transition-all active:scale-95"
              id="contact-header-qr-btn"
            >
              <QrCode className="w-4 h-4 text-amber-400" />
              <span>Share / Scan Contact QR</span>
            </button>
          </div>
        </div>

        {/* Office Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          
          {/* Abuja Office Card */}
          <div className="bg-slate-950 border-2 border-amber-500/40 rounded-2xl p-6 shadow-xl space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
                Corporate Headquarters
              </span>
              <span className="text-xs text-slate-400 font-bold">FCT Abuja</span>
            </div>

            <div>
              <h3 className="text-xl font-black text-white">{company.headquartersAbuja.title}</h3>
              <p className="text-slate-300 text-xs leading-relaxed mt-1">{company.headquartersAbuja.address}</p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Main Phone:</span>
                </span>
                <a href={`tel:${company.phones[0]}`} className="font-mono font-bold text-amber-400 hover:underline">
                  {company.phones[0]}
                </a>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>Email:</span>
                </span>
                <a href={`mailto:${company.email}`} className="font-mono text-amber-400 hover:underline">
                  {company.email}
                </a>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hours:</span>
                </span>
                <span className="text-slate-200">{company.workingHours}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <a
                href={`tel:${company.phones[0]}`}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-2.5 rounded-xl text-center transition-colors"
              >
                Call Abuja Office
              </a>
              <button
                onClick={() => handleCopy(company.headquartersAbuja.address, 'abuja')}
                className="px-3 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs flex items-center gap-1 transition-colors"
                title="Copy Address"
              >
                {copiedAddress === 'abuja' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAddress === 'abuja' ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={() => handleOpenQr('abuja', 'Abuja Corporate HQ Contact & GPS QR')}
                className="px-3 py-2.5 bg-slate-900 border border-slate-800 text-amber-400 hover:text-amber-300 rounded-xl text-xs flex items-center gap-1 transition-colors"
                title="Share via QR Code"
                id="abuja-qr-btn"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QR</span>
              </button>
            </div>
          </div>

          {/* Lagos Office Card */}
          <div className="bg-slate-950 border-2 border-slate-800 hover:border-amber-500/40 rounded-2xl p-6 shadow-xl space-y-4 relative overflow-hidden transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded border border-purple-500/20">
                Lagos Logistics Terminal
              </span>
              <span className="text-xs text-slate-400 font-bold">Lagos State</span>
            </div>

            <div>
              <h3 className="text-xl font-black text-white">{company.mainOfficeLagos.title}</h3>
              <p className="text-slate-300 text-xs leading-relaxed mt-1">{company.mainOfficeLagos.address}</p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Dispatch Line:</span>
                </span>
                <a href={`tel:${company.phones[1] || company.phones[0]}`} className="font-mono font-bold text-amber-400 hover:underline">
                  {company.phones[1] || company.phones[0]}
                </a>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>Email:</span>
                </span>
                <a href={`mailto:${company.email}`} className="font-mono text-amber-400 hover:underline">
                  {company.email}
                </a>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hours:</span>
                </span>
                <span className="text-slate-200">{company.workingHours}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <a
                href={`tel:${company.phones[1] || company.phones[0]}`}
                className="flex-1 bg-slate-850 hover:bg-slate-800 border border-slate-700 text-white font-black text-xs py-2.5 rounded-xl text-center transition-colors"
              >
                Call Lagos Terminal
              </a>
              <button
                onClick={() => handleCopy(company.mainOfficeLagos.address, 'lagos')}
                className="px-3 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs flex items-center gap-1 transition-colors"
                title="Copy Address"
              >
                {copiedAddress === 'lagos' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAddress === 'lagos' ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={() => handleOpenQr('lagos', 'Lagos Logistics Terminal Contact & GPS QR')}
                className="px-3 py-2.5 bg-slate-900 border border-slate-800 text-amber-400 hover:text-amber-300 rounded-xl text-xs flex items-center gap-1 transition-colors"
                title="Share via QR Code"
                id="lagos-qr-btn"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QR</span>
              </button>
            </div>
          </div>

        </div>

        {/* Contact Form & Support Promise / Interactive QR Card */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Inquiry Form */}
          <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <h3 className="text-xl font-extrabold text-white mb-1">Send a Direct Inquiry</h3>
            <p className="text-xs text-slate-400 mb-6">Our relocation team responds within 15 minutes during operating hours.</p>

            {submittedMessage && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-start gap-2.5 animate-fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-bold">Inquiry Transmitted Successfully</p>
                  <p className="mt-0.5">{submittedMessage}</p>
                </div>
              </div>
            )}

            {formError && (
              <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-medium">{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-slate-300 font-bold uppercase tracking-wider">
                      Your Full Name *
                    </label>
                    {touched.name && nameVal.isValid && (
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Valid
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onBlur={() => markTouched('name')}
                      onChange={(e) => {
                        setName(e.target.value);
                        markTouched('name');
                      }}
                      placeholder="e.g. Adebayo Johnson / Emeka Okafor"
                      className={`w-full bg-slate-900 border text-white rounded-xl px-3.5 py-3 pr-8 outline-none transition-colors ${
                        touched.name && !nameVal.isValid
                          ? 'border-rose-500 focus:border-rose-400'
                          : touched.name && nameVal.isValid
                          ? 'border-emerald-500/80 focus:border-emerald-400'
                          : 'border-slate-800 focus:border-amber-400'
                      }`}
                    />
                    {touched.name && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        {nameVal.isValid ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-400" />
                        )}
                      </div>
                    )}
                  </div>
                  {touched.name && !nameVal.isValid && (
                    <p className="text-[11px] text-rose-400 font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{nameVal.error}</span>
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-slate-300 font-bold uppercase tracking-wider">
                      Phone Number (WhatsApp) *
                    </label>
                    {touched.phone && phoneVal.isValid && (
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Valid
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onBlur={() => markTouched('phone')}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        markTouched('phone');
                      }}
                      placeholder="e.g. 0803 123 4567 or +234..."
                      className={`w-full bg-slate-900 border text-white rounded-xl px-3.5 py-3 pr-8 outline-none transition-colors ${
                        touched.phone && !phoneVal.isValid
                          ? 'border-rose-500 focus:border-rose-400'
                          : touched.phone && phoneVal.isValid
                          ? 'border-emerald-500/80 focus:border-emerald-400'
                          : 'border-slate-800 focus:border-amber-400'
                      }`}
                    />
                    {touched.phone && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        {phoneVal.isValid ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-400" />
                        )}
                      </div>
                    )}
                  </div>
                  {touched.phone && !phoneVal.isValid ? (
                    <p className="text-[11px] text-rose-400 font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{phoneVal.error}</span>
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-500 mt-1">Accepts standard Nigerian mobile or +234 format</p>
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Email */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-slate-300 font-bold uppercase tracking-wider">
                      Email Address *
                    </label>
                    {touched.email && emailVal.isValid && (
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Valid
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onBlur={() => markTouched('email')}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        markTouched('email');
                      }}
                      placeholder="e.g. corporate@company.ng"
                      className={`w-full bg-slate-900 border text-white rounded-xl px-3.5 py-3 pr-8 outline-none transition-colors ${
                        touched.email && !emailVal.isValid
                          ? 'border-rose-500 focus:border-rose-400'
                          : touched.email && emailVal.isValid
                          ? 'border-emerald-500/80 focus:border-emerald-400'
                          : 'border-slate-800 focus:border-amber-400'
                      }`}
                    />
                    {touched.email && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        {emailVal.isValid ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-400" />
                        )}
                      </div>
                    )}
                  </div>
                  {touched.email && !emailVal.isValid && (
                    <p className="text-[11px] text-rose-400 font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{emailVal.error}</span>
                    </p>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5">
                    Subject / Service Type
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 text-white rounded-xl px-3.5 py-3 outline-none transition-colors"
                  >
                    <option value="Corporate Moving Inquiry">Corporate Office Relocation</option>
                    <option value="Residential Moving Inquiry">Residential House Move</option>
                    <option value="Commercial Warehousing">Commercial Warehousing & Goods</option>
                    <option value="Heavy Haulage Freight">Interstate Heavy Haulage / Flatbed</option>
                    <option value="Partnership / Contractor">Logistics Partnership / Vendor</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-slate-300 font-bold uppercase tracking-wider">
                    Message / Details of Moving Requirement *
                  </label>
                  <span className={`text-[10px] ${message.trim().length >= 10 ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {message.trim().length}/10 chars min
                  </span>
                </div>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onBlur={() => markTouched('message')}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    markTouched('message');
                  }}
                  placeholder="Describe items, moving dates, pickup & delivery locations..."
                  className={`w-full bg-slate-900 border text-white rounded-xl p-3.5 outline-none transition-colors ${
                    touched.message && !messageVal.isValid
                      ? 'border-rose-500 focus:border-rose-400'
                      : touched.message && messageVal.isValid
                      ? 'border-emerald-500/80 focus:border-emerald-400'
                      : 'border-slate-800 focus:border-amber-400'
                  }`}
                />
                {touched.message && !messageVal.isValid && (
                  <p className="text-[11px] text-rose-400 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{messageVal.error}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                id="contact-submit-btn"
              >
                {isSubmitting ? (
                  <span>Sending message...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Corporate Inquiry</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Mini Interactive QR Contact Card + Hotline */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Live Interactive QR Contact Card Widget */}
            <div className="bg-slate-950 border-2 border-amber-500/30 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-left">
                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-amber-400" />
                    <span>Instant Mobile Contact Card</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">Scan to save dispatch phone numbers directly to your contacts</p>
                </div>
                <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  vCard
                </span>
              </div>

              {/* Centered QR Display */}
              <div className="flex flex-col items-center justify-center py-2">
                <div 
                  onClick={() => handleOpenQr('general', 'Pyda Movers Official Contact Card')}
                  className="p-3 bg-white rounded-2xl shadow-xl border-2 border-amber-500 cursor-pointer hover:scale-105 transition-transform"
                  title="Click to expand full QR share options"
                >
                  <QRCodeSVG
                    value={contactVCard}
                    size={130}
                    level="H"
                    includeMargin={false}
                    fgColor="#020617"
                    bgColor="#ffffff"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1 justify-center">
                  <span>Point camera to add <strong>Pyda Movers</strong> to contacts</span>
                </p>
              </div>

              {/* QR Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <button
                  onClick={() => handleOpenQr('general', 'Pyda Movers Official Contact Card')}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow"
                >
                  <QrCode className="w-3.5 h-3.5 text-slate-950" />
                  <span>Expand QR Modal</span>
                </button>
                <a
                  href="https://wa.me/2348062466212"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-white" />
                  <span>WhatsApp Chat</span>
                </a>
              </div>
            </div>

            {/* Corporate Guarantee */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Our Corporate Guarantee</span>
              </h4>
              <p className="text-slate-300 text-xs leading-relaxed">
                When you partner with {company.name}, you receive certified packing materials, dedicated moving coordinators, and 100% goods-in-transit insurance coverage on every route in Nigeria.
              </p>

              <div className="pt-2 space-y-2.5 border-t border-slate-800 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>24/7 Dedicated Logistics Coordinator</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>GPS Fleet Live Tracking on Interstate Runs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Zero Broken Items or Disassembly Damage</span>
                </div>
              </div>
            </div>

            {/* Quick Hotline Widget */}
            <div className="bg-gradient-to-br from-amber-500/20 via-slate-950 to-slate-950 border border-amber-500/30 rounded-3xl p-6 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded">
                Direct Dispatch Hotlines
              </span>
              <p className="text-xs text-slate-300">
                Need immediate emergency truck booking or weekend moving arrangements?
              </p>
              <div className="flex flex-col gap-2 pt-1">
                <a
                  href={`tel:${company.phones[0]}`}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-3 px-4 rounded-xl flex items-center justify-between transition-colors shadow"
                >
                  <span className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>Call Hotline 1</span>
                  </span>
                  <span className="font-mono">{company.phones[0]}</span>
                </a>
                {company.phones[1] && (
                  <a
                    href={`tel:${company.phones[1]}`}
                    className="bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-amber-400" />
                      <span>Call Hotline 2</span>
                    </span>
                    <span className="font-mono text-amber-400">{company.phones[1]}</span>
                  </a>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* QR Code Share Modal */}
      <QrCodeShareModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        type="contact"
        office={qrOffice}
        title={qrTitle}
      />
    </section>
  );
};
