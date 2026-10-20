import React, { useState, useRef } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { 
  X, 
  QrCode, 
  Download, 
  Copy, 
  Check, 
  Smartphone, 
  Share2, 
  ExternalLink, 
  UserCheck, 
  MapPin, 
  MessageSquare, 
  Truck, 
  ShieldCheck,
  Phone,
  Mail,
  Globe
} from 'lucide-react';
import { ShipmentTrackStatus } from '../types';

export type QrCodeType = 'tracking' | 'contact' | 'location' | 'whatsapp';

interface QrCodeShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  type?: QrCodeType;
  shipment?: ShipmentTrackStatus | null;
  office?: 'abuja' | 'lagos' | 'general';
}

export const QrCodeShareModal: React.FC<QrCodeShareModalProps> = ({
  isOpen,
  onClose,
  title,
  type = 'contact',
  shipment,
  office = 'general'
}) => {
  const [activeTab, setActiveTab] = useState<string>(type === 'tracking' ? 'url' : 'vcard');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://megatrendmovers.com';

  // 1. Generate URLs & Payloads
  let trackingUrl = `${originUrl}/#tracking`;
  if (shipment?.trackingId) {
    trackingUrl = `${originUrl}/#tracking?id=${encodeURIComponent(shipment.trackingId)}`;
  }

  // WhatsApp quick text for tracking
  const trackingWhatsAppText = shipment
    ? `Megatrend Movers Tracking Update:\nRef: ${shipment.trackingId}\nClient: ${shipment.clientName}\nStatus: ${shipment.status}\nRoute: ${shipment.origin} ➔ ${shipment.destination}\nTrack live: ${trackingUrl}`
    : `Track live shipments with Megatrend Movers: ${trackingUrl}`;

  const trackingWhatsAppUrl = `https://wa.me/?text=${encodeURIComponent(trackingWhatsAppText)}`;

  // Megatrend Movers vCard format (RFC 6350 / vCard 3.0 standard)
  const contactVCard = `BEGIN:VCARD
VERSION:3.0
N:Movers;Megatrend;;;
FN:Megatrend Movers & Logistics Ltd
ORG:Megatrend Movers & Logistics Ltd
TITLE:Pan-African Relocation & Interstate Haulage
TEL;TYPE=WORK,VOICE:+2348062466212
TEL;TYPE=CELL,VOICE:+2349072222841
EMAIL;TYPE=PREF,INTERNET:info@megatrendmovers.com
EMAIL;TYPE=WORK:dispatch@megatrendmovers.com
URL:https://megatrendmovers.com
ADR;TYPE=WORK:;;Suite 204\\, Citygate Plaza\\, Central Business District;Abuja;FCT;900211;Nigeria
ADR;TYPE=DOM:;;Plot 12\\, Commercial Avenue\\, Satellite Town;Lagos;Lagos State;100001;Nigeria
NOTE:Premier Corporate Relocation\\, Heavy Haulage & Pan-African Transit Logistics.
END:VCARD`;

  const contactWebsiteUrl = `${originUrl}/#contact`;
  const contactWhatsAppUrl = `https://wa.me/2348062466212?text=${encodeURIComponent('Hello Megatrend Movers, I would like to inquire about relocation and logistics services.')}`;

  const abujaMapsUrl = 'https://maps.google.com/?q=Citygate+Plaza+Central+Business+District+Abuja+Nigeria';
  const lagosMapsUrl = 'https://maps.google.com/?q=Commercial+Avenue+Satellite+Town+Lagos+Nigeria';

  // Determine active QR payload based on modal type and active tab
  let qrPayload = '';
  let qrTitle = '';
  let qrSubtitle = '';
  let shareText = '';

  if (type === 'tracking' && shipment) {
    if (activeTab === 'url') {
      qrPayload = trackingUrl;
      qrTitle = `Live GPS Tracking #${shipment.trackingId}`;
      qrSubtitle = 'Scan with phone camera to open real-time satellite telemetry and road checkpoints.';
      shareText = trackingUrl;
    } else if (activeTab === 'whatsapp') {
      qrPayload = trackingWhatsAppUrl;
      qrTitle = 'Share Status via WhatsApp';
      qrSubtitle = 'Scan to pre-fill shipment status directly in WhatsApp on mobile.';
      shareText = trackingWhatsAppText;
    } else {
      qrPayload = trackingUrl;
      qrTitle = `Tracking Ref #${shipment.trackingId}`;
      qrSubtitle = 'Direct mobile access to waypoint radar and driver telematics.';
      shareText = trackingUrl;
    }
  } else {
    // Contact modal
    if (activeTab === 'vcard') {
      qrPayload = contactVCard;
      qrTitle = 'Megatrend Movers vCard';
      qrSubtitle = 'Scan to automatically save full contact details and dispatch numbers to your phone.';
      shareText = 'Megatrend Movers & Logistics Ltd\nPhone: +234 806 246 6212\nEmail: info@megatrendmovers.com\nWeb: https://megatrendmovers.com';
    } else if (activeTab === 'whatsapp') {
      qrPayload = contactWhatsAppUrl;
      qrTitle = 'Direct WhatsApp Dispatch';
      qrSubtitle = 'Scan to start an instant WhatsApp chat with our 24/7 operations team.';
      shareText = contactWhatsAppUrl;
    } else if (activeTab === 'abuja-map') {
      qrPayload = abujaMapsUrl;
      qrTitle = 'Abuja HQ Location (Google Maps)';
      qrSubtitle = 'Scan to get live turn-by-turn navigation to Citygate Plaza, Abuja.';
      shareText = 'Megatrend Movers Abuja HQ: Suite 204, Citygate Plaza, Central Business District, Abuja.';
    } else if (activeTab === 'lagos-map') {
      qrPayload = lagosMapsUrl;
      qrTitle = 'Lagos Hub Location (Google Maps)';
      qrSubtitle = 'Scan for GPS navigation to our Satellite Town Maritime Logistics Hub in Lagos.';
      shareText = 'Megatrend Movers Lagos Hub: Plot 12, Commercial Avenue, Satellite Town, Lagos.';
    } else {
      qrPayload = contactWebsiteUrl;
      qrTitle = 'Megatrend Movers Contact Portal';
      qrSubtitle = 'Scan to open our mobile contact and quote submission hub.';
      shareText = contactWebsiteUrl;
    }
  }

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPng = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current.querySelector('canvas');
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = type === 'tracking' && shipment 
        ? `Megatrend-Tracker-QR-${shipment.trackingId}.png`
        : `Megatrend-Movers-Contact-QR.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md transition-opacity">
      <div 
        className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative text-white animate-in fade-in zoom-in duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white leading-tight">
                {title || (type === 'tracking' ? 'Share Tracking Status' : 'Share Contact via QR Code')}
              </h3>
              <p className="text-xs text-slate-400">
                Instant smartphone camera sync & contact card
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
          {type === 'tracking' ? (
            <>
              <button
                onClick={() => setActiveTab('url')}
                className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'url'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Live Tracker URL</span>
              </button>
              <button
                onClick={() => setActiveTab('whatsapp')}
                className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'whatsapp'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Message</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('vcard')}
                className={`flex-1 py-2 px-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1 text-[11px] sm:text-xs ${
                  activeTab === 'vcard'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Save Contact (vCard)</span>
              </button>
              <button
                onClick={() => setActiveTab('whatsapp')}
                className={`flex-1 py-2 px-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1 text-[11px] sm:text-xs ${
                  activeTab === 'whatsapp'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
              <button
                onClick={() => setActiveTab('abuja-map')}
                className={`flex-1 py-2 px-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1 text-[11px] sm:text-xs ${
                  activeTab === 'abuja-map'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Abuja HQ Map</span>
              </button>
            </>
          )}
        </div>

        {/* QR Code Presentation Box */}
        <div className="flex flex-col items-center justify-center p-6 bg-slate-950 border border-slate-800/80 rounded-2xl space-y-4 text-center">
          
          {/* Visual QR Code Wrapper */}
          <div className="p-4 bg-white rounded-2xl shadow-xl border-4 border-amber-500 flex items-center justify-center relative group">
            {/* SVG Renderer for Display */}
            <QRCodeSVG
              value={qrPayload}
              size={180}
              level="H"
              includeMargin={false}
              fgColor="#020617"
              bgColor="#ffffff"
            />

            {/* Hidden Canvas Element used for PNG download */}
            <div ref={canvasRef} className="hidden">
              <QRCodeCanvas
                value={qrPayload}
                size={512}
                level="H"
                includeMargin={true}
                fgColor="#020617"
                bgColor="#ffffff"
              />
            </div>
          </div>

          {/* QR Context Description */}
          <div className="space-y-1 max-w-sm">
            <h4 className="text-sm font-black text-amber-400">{qrTitle}</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{qrSubtitle}</p>
          </div>

          {/* Quick Details Pill if Tracking */}
          {type === 'tracking' && shipment && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs flex items-center justify-between w-full max-w-sm gap-2">
              <span className="font-bold text-slate-400">Route:</span>
              <span className="font-mono text-amber-400 font-bold truncate">
                {shipment.origin} ➔ {shipment.destination}
              </span>
              <span className="bg-emerald-500/20 text-emerald-400 font-black px-2 py-0.5 rounded text-[10px]">
                {shipment.status}
              </span>
            </div>
          )}

          {/* Quick Details Pill if Contact */}
          {type !== 'tracking' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs w-full max-w-sm text-left space-y-1.5">
              <div className="flex items-center gap-2 text-slate-300 font-semibold">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>+234 806 246 6212 • +234 907 222 2841</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-slate-400">info@megatrendmovers.com</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-slate-400 truncate">Abuja Corporate HQ & Lagos Maritime Terminal</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons: Copy Link & Download PNG */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleCopyText}
            className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-amber-400" />
                <span>Copy Details</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadPng}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-amber-500/20"
          >
            <Download className="w-4 h-4 text-slate-950" />
            <span>Download High-Res QR</span>
          </button>
        </div>

        {/* Mobile Scanning Guide */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          <span>Point your iOS/Android camera at the screen to scan instantly.</span>
        </div>
      </div>
    </div>
  );
};
