import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Smartphone, 
  Monitor, 
  Copy, 
  Check, 
  Send, 
  Eye, 
  FileText, 
  Code, 
  Printer, 
  Download, 
  RefreshCw, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  ExternalLink,
  AlertCircle,
  Sliders,
  BadgeCheck,
  Briefcase,
  Phone
} from 'lucide-react';
import { QuoteRequestData, ShipmentTrackStatus } from '../types';

export type EmailTemplateType = 
  | 'quote_confirmation' 
  | 'shipment_dispatched' 
  | 'shipment_delivered' 
  | 'cargo_inspection' 
  | 'contact_receipt' 
  | 'job_application';

export interface MockApplicantData {
  fullName?: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  licenseClass?: string;
  cityState?: string;
}

interface MockEmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTemplate?: EmailTemplateType;
  quoteData?: QuoteRequestData | null;
  shipmentData?: ShipmentTrackStatus | null;
  applicantData?: MockApplicantData | null;
  onSendTestEmail?: (recipient: string, templateType: EmailTemplateType) => Promise<boolean>;
  showToast?: (msg: string) => void;
}

export const MockEmailPreviewModal: React.FC<MockEmailPreviewModalProps> = ({
  isOpen,
  onClose,
  initialTemplate = 'quote_confirmation',
  quoteData = null,
  shipmentData = null,
  applicantData = null,
  onSendTestEmail,
  showToast
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplateType>(initialTemplate);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [displayFormat, setDisplayFormat] = useState<'rendered' | 'plaintext' | 'html'>('rendered');
  const [isCopied, setIsCopied] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testRecipient, setTestRecipient] = useState('yerimaforfor@gmail.com');
  const [testFeedback, setTestFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Editable preview parameters
  const [clientName, setClientName] = useState(quoteData?.fullName || applicantData?.fullName || 'Yerima Forfor');
  const [clientEmail, setClientEmail] = useState(quoteData?.email || applicantData?.email || 'yerimaforfor@gmail.com');
  const [clientPhone, setClientPhone] = useState(quoteData?.phone || applicantData?.phone || '0806 246 6212');
  const [originRoute, setOriginRoute] = useState(
    quoteData?.originLga && quoteData?.originState 
      ? `${quoteData.originLga}, ${quoteData.originState}`
      : (quoteData?.originCity || applicantData?.cityState || 'Ikeja, Lagos State')
  );
  const [destRoute, setDestRoute] = useState(
    quoteData?.destinationLga && quoteData?.destinationState
      ? `${quoteData.destinationLga}, ${quoteData.destinationState}`
      : (quoteData?.destinationCity || 'Central Business District, Abuja FCT')
  );
  const [estimatedCost, setEstimatedCost] = useState(
    quoteData?.estimatedCostNaira ? String(quoteData.estimatedCostNaira) : '450000'
  );
  const [trackingNumber, setTrackingNumber] = useState(
    shipmentData?.trackingNumber || (quoteData?.id ? `TRK-${quoteData.id.replace(/[^a-zA-Z0-9]/g, '').slice(-8)}` : 'TRK-LAG-ABJ-882')
  );
  const [vehicleAssigned, setVehicleAssigned] = useState(
    shipmentData?.driverInfo?.truckPlate 
      ? `DAF 30-Ton Heavy Hauler (${shipmentData.driverInfo.truckPlate})`
      : 'DAF 30-Ton Enclosed Heavy Hauler (KJA-884-XG)'
  );
  const [driverName, setDriverName] = useState(
    shipmentData?.driverInfo?.name || 'Usman Kabir (Senior Fleet Captain)'
  );
  const [jobTitle, setJobTitle] = useState(
    applicantData?.jobTitle || 'Senior Articulated Truck Driver (30-Ton Fleet)'
  );
  const [ticketSubject, setTicketSubject] = useState('Corporate Relocation Consultation');

  // Sync when initialTemplate updates
  useEffect(() => {
    if (initialTemplate) {
      setSelectedTemplate(initialTemplate);
    }
  }, [initialTemplate]);

  // Sync quote data updates
  useEffect(() => {
    if (quoteData) {
      setClientName(quoteData.fullName || 'Valued Client');
      setClientEmail(quoteData.email || 'yerimaforfor@gmail.com');
      setClientPhone(quoteData.phone || '0806 246 6212');
      setOriginRoute(
        quoteData.originLga && quoteData.originState 
          ? `${quoteData.originLga}, ${quoteData.originState}` 
          : (quoteData.originCity || 'Ikeja, Lagos State')
      );
      setDestRoute(
        quoteData.destinationLga && quoteData.destinationState 
          ? `${quoteData.destinationLga}, ${quoteData.destinationState}` 
          : (quoteData.destinationCity || 'Central Business District, Abuja FCT')
      );
      setEstimatedCost(quoteData.estimatedCostNaira ? String(quoteData.estimatedCostNaira) : '450000');
      if (quoteData.id) {
        setTrackingNumber(`TRK-${quoteData.id.replace(/[^a-zA-Z0-9]/g, '').slice(-8)}`);
      }
    }
  }, [quoteData]);

  // Sync shipment data updates
  useEffect(() => {
    if (shipmentData) {
      setTrackingNumber(shipmentData.trackingNumber || 'TRK-LAG-ABJ-882');
      if (shipmentData.driverInfo?.name) setDriverName(shipmentData.driverInfo.name);
      if (shipmentData.driverInfo?.truckPlate) {
        setVehicleAssigned(`DAF 30-Ton Heavy Hauler (${shipmentData.driverInfo.truckPlate})`);
      }
      if (shipmentData.origin) setOriginRoute(shipmentData.origin);
      if (shipmentData.destination) setDestRoute(shipmentData.destination);
    }
  }, [shipmentData]);

  // Sync applicant data updates
  useEffect(() => {
    if (applicantData) {
      if (applicantData.fullName) setClientName(applicantData.fullName);
      if (applicantData.email) setClientEmail(applicantData.email);
      if (applicantData.phone) setClientPhone(applicantData.phone);
      if (applicantData.jobTitle) setJobTitle(applicantData.jobTitle);
      if (applicantData.cityState) setOriginRoute(applicantData.cityState);
    }
  }, [applicantData]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formattedCostNaira = `₦${Number(estimatedCost || 0).toLocaleString()}`;
  const currentDateFormatted = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const currentTimeFormatted = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  // Template Definitions & Dynamic Generators
  const getTemplateMeta = () => {
    switch (selectedTemplate) {
      case 'quote_confirmation':
        return {
          subject: `🚚 Quotation Confirmation - Relocation Ref #${quoteData?.id || 'QUOTE-77102'} | Pyda Movers`,
          previewText: `Official Freight & Relocation quotation for ${clientName}: ${originRoute} ➔ ${destRoute}. Estimated Investment: ${formattedCostNaira}.`,
          title: 'Quotation Confirmation',
          badge: 'Automated Dispatch Trigger: On Quote Submit',
          to: `${clientName} <${clientEmail}>`,
          refNumber: quoteData?.id ? `QUOTE-${quoteData.id.slice(-6)}` : 'QUOTE-77102',
        };
      case 'shipment_dispatched':
        return {
          subject: `🛰️ Convoy In-Transit Alert - Live Satellite Tracking #${trackingNumber} | Pyda Movers`,
          previewText: `Your cargo has departed from ${originRoute} headed to ${destRoute}. Live convoy tracking link inside.`,
          title: 'Shipment Dispatched & Live Tracking',
          badge: 'Automated Dispatch Trigger: On Convoy Departure',
          to: `${clientName} <${clientEmail}>`,
          refNumber: trackingNumber,
        };
      case 'shipment_delivered':
        return {
          subject: `📦 Delivery Confirmed & Electronic POD Receipt #${trackingNumber} | Pyda Movers`,
          previewText: `Consignment successfully offloaded and verified at ${destRoute}. Electronic Proof of Delivery inside.`,
          title: 'Delivery Completed & Proof of Delivery (E-POD)',
          badge: 'Automated Dispatch Trigger: On Receiver Sign-off',
          to: `${clientName} <${clientEmail}>`,
          refNumber: `POD-${trackingNumber.replace('TRK-', '')}`,
        };
      case 'cargo_inspection':
        return {
          subject: `🛡️ Pre-Transit Digital Cargo Survey Certification #INSP-2026-9041 | Pyda Movers`,
          previewText: `Digital Cargo Inspection & Multi-Layer Wood Crating Certification completed for ${clientName}. 100% GIT protection active.`,
          title: 'Cargo Digital Inspection & Crating Certificate',
          badge: 'Automated Dispatch Trigger: On Survey Upload',
          to: `${clientName} <${clientEmail}>`,
          refNumber: 'INSP-2026-9041',
        };
      case 'contact_receipt':
        return {
          subject: `📬 Inquiry Receipt: ${ticketSubject} [Ticket #MSG-172382] | Pyda Movers`,
          previewText: `Thank you for contacting Pyda Movers & Logistics. A senior logistics coordinator will call you back within 2 hours.`,
          title: 'Customer Inquiry / Ticket Receipt',
          badge: 'Automated Dispatch Trigger: On Contact Form Submit',
          to: `${clientName} <${clientEmail}>`,
          refNumber: 'MSG-172382',
        };
      case 'job_application':
        return {
          subject: `💼 Application Received: ${jobTitle} [Ref #APP-8841] | Pyda Movers HR`,
          previewText: `Thank you for applying to Pyda Movers & Logistics Ltd. Your application is under review by our Fleet HR Division.`,
          title: 'Career Application Acknowledgment',
          badge: 'Automated Dispatch Trigger: On Job Application',
          to: `${clientName} <${clientEmail}>`,
          refNumber: 'APP-8841',
        };
    }
  };

  const meta = getTemplateMeta();

  // Generate HTML String for Copy / Raw view
  const generateRawHtml = () => {
    let specificBodyHtml = '';

    if (selectedTemplate === 'quote_confirmation') {
      specificBodyHtml = `
      <div class="ref-badge">REFERENCE #${meta.refNumber}</div>
      <h2 class="greeting">Dear ${clientName},</h2>
      <p class="intro-text">
        Thank you for choosing <strong>Pyda Movers & Logistics Ltd</strong>. We have received your formal quotation inquiry. Below are your verified corridor details, equipment allotment, and estimated investment covering all 36 Nigerian States + FCT:
      </p>
      <div class="detail-card">
        <div class="detail-row"><span class="detail-label">Corridor Route</span><span class="detail-value">${originRoute} ➔ ${destRoute}</span></div>
        <div class="detail-row"><span class="detail-label">Service Category</span><span class="detail-value">Interstate Haulage & Premium Crating</span></div>
        <div class="detail-row"><span class="detail-label">Assigned Fleet</span><span class="detail-value">${vehicleAssigned}</span></div>
        <div class="detail-row"><span class="detail-label">Fleet Captain / Escort</span><span class="detail-value">${driverName}</span></div>
        <div class="detail-row"><span class="detail-label">Wood Crating</span><span class="detail-value">✅ Included (Custom Packaging)</span></div>
        <div class="detail-row"><span class="detail-label">Goods-In-Transit Cover</span><span class="detail-value">✅ 100% Comprehensive GIT Active</span></div>
      </div>
      <div class="price-banner">
        <div class="price-label">Comprehensive Estimated Investment</div>
        <div class="price-value">${formattedCostNaira}</div>
        <div style="font-size: 11px; color: #94a3b8;">Includes certified trucks, satellite telematics, experienced riggers & transit insurance</div>
      </div>
      <p class="intro-text" style="font-size: 13px;">
        <strong>What Happens Next:</strong><br/>
        Our senior dispatch coordinator will reach out to you directly at <strong>${clientPhone}</strong> to confirm site clearance, corridor permits, and loading schedule.
      </p>
      <a href="tel:08062466212" class="cta-btn">📞 Connect with Senior Dispatcher (0806 246 6212)</a>
      <div class="guarantee-note">
        <strong>Guaranteed Security:</strong> Every interstate haulage assignment is monitored in real-time by 24/7 satellite speed limiters and comprehensive goods-in-transit liability protection.
      </div>`;
    } else if (selectedTemplate === 'shipment_dispatched') {
      specificBodyHtml = `
      <div class="ref-badge">LIVE TELEMETRY #${meta.refNumber}</div>
      <h2 class="greeting">Dear ${clientName},</h2>
      <p class="intro-text">
        Your scheduled freight convoy has officially departed from our logistics hub and is currently in-transit under active satellite tracking escort. Below is your live dispatch telemetry and driver contact details:
      </p>
      <div class="detail-card">
        <div class="detail-row"><span class="detail-label">Consignment Status</span><span class="detail-value" style="color: #f59e0b;">IN-TRANSIT (GPS ACTIVE)</span></div>
        <div class="detail-row"><span class="detail-label">Departure Terminal</span><span class="detail-value">${originRoute}</span></div>
        <div class="detail-row"><span class="detail-label">Destination Terminal</span><span class="detail-value">${destRoute}</span></div>
        <div class="detail-row"><span class="detail-label">Assigned Vehicle</span><span class="detail-value">${vehicleAssigned}</span></div>
        <div class="detail-row"><span class="detail-label">Fleet Captain / Escort</span><span class="detail-value">${driverName} (+234 806 246 6212)</span></div>
        <div class="detail-row"><span class="detail-label">Telemetry Ping</span><span class="detail-value">Every 60 Seconds via Transponder</span></div>
        <div class="detail-row"><span class="detail-label">Speed Limiter</span><span class="detail-value">Enforced Max 65 km/h Interstate Corridor</span></div>
      </div>
      <div class="price-banner">
        <div class="price-label">Live Convoy Telemetry</div>
        <div class="price-value">EN ROUTE (ON SCHEDULE)</div>
        <div style="font-size: 11px; color: #94a3b8;">Corridor ETA: 18 - 24 Hours • Satellite Speed Limiters Active</div>
      </div>
      <p class="intro-text" style="font-size: 13px;">
        <strong>Receiver Notice:</strong><br/>
        The receiving party at ${destRoute} will receive a telephone notification 2 hours prior to arrival for terminal gate pass and offload preparation.
      </p>
      <a href="https://pydamovers.com/track" class="cta-btn">🛰️ View Live Satellite Convoy Map</a>
      <div class="guarantee-note">
        <strong>Armed & Satellite Escort:</strong> Escorted by certified long-haul drivers with 24/7 central operations room monitoring and dedicated highway assistance.
      </div>`;
    } else if (selectedTemplate === 'shipment_delivered') {
      specificBodyHtml = `
      <div class="ref-badge">DELIVERY CONFIRMATION #${meta.refNumber}</div>
      <h2 class="greeting">Dear ${clientName},</h2>
      <p class="intro-text">
        We are delighted to confirm that your consignment has been successfully offloaded, inspected, and verified at the destination terminal. Electronic Proof of Delivery (E-POD) has been registered.
      </p>
      <div class="detail-card">
        <div class="detail-row"><span class="detail-label">Consignment Status</span><span class="detail-value" style="color: #10b981;">DELIVERED & VERIFIED</span></div>
        <div class="detail-row"><span class="detail-label">Delivery Destination</span><span class="detail-value">${destRoute}</span></div>
        <div class="detail-row"><span class="detail-label">Delivered On</span><span class="detail-value">${currentDateFormatted} at ${currentTimeFormatted}</span></div>
        <div class="detail-row"><span class="detail-label">Assigned Fleet</span><span class="detail-value">${vehicleAssigned}</span></div>
        <div class="detail-row"><span class="detail-label">Cargo Condition</span><span class="detail-value">100% Intact / Zero-Damage Verified</span></div>
        <div class="detail-row"><span class="detail-label">Security Seal ID</span><span class="detail-value">SEAL-PYDA-9941 (TAMPER-EVIDENT)</span></div>
      </div>
      <div class="price-banner">
        <div class="price-label">Consignment Milestone</div>
        <div class="price-value">DELIVERY COMPLETE</div>
        <div style="font-size: 11px; color: #94a3b8;">Zero-Damage Guarantee Fulfilled • Sign-off Logged in Document Vault</div>
      </div>
      <p class="intro-text" style="font-size: 13px;">
        <strong>Document Vault:</strong><br/>
        Your verified Electronic Proof of Delivery (E-POD) and receiver sign-off docket are permanently archived in your client portal.
      </p>
      <a href="https://pydamovers.com/portal" class="cta-btn">📄 Access Electronic POD in Document Vault</a>
      <div class="guarantee-note">
        <strong>Zero-Damage Guarantee:</strong> Backed by comprehensive carrier liability and corporate client satisfaction guarantee.
      </div>`;
    } else if (selectedTemplate === 'cargo_inspection') {
      specificBodyHtml = `
      <div class="ref-badge">INSPECTION CERTIFICATE #${meta.refNumber}</div>
      <h2 class="greeting">Dear ${clientName},</h2>
      <p class="intro-text">
        Your pre-transit digital cargo inspection report has been finalized by our certified logistics survey riggers. Multi-layer wood crating and tamper-evident security seals have been verified.
      </p>
      <div class="detail-card">
        <div class="detail-row"><span class="detail-label">Inspection Terminal</span><span class="detail-value">Lagos Maritime Hub / Abuja HQ</span></div>
        <div class="detail-row"><span class="detail-label">Lead Survey Engineer</span><span class="detail-value">Engr. Chidi Okafor (NIS Certified Lead Surveyor)</span></div>
        <div class="detail-row"><span class="detail-label">Packaging Standard</span><span class="detail-value">Triple-Wall Treated Hardwood & Custom Poly Foam</span></div>
        <div class="detail-row"><span class="detail-label">Tamper-Evident Seals</span><span class="detail-value">SEAL-PYDA-9941 / SEAL-PYDA-9942</span></div>
        <div class="detail-row"><span class="detail-label">Fragile Cargo Items</span><span class="detail-value">Server Cabinets, IT Hardware, Executive Furniture</span></div>
        <div class="detail-row"><span class="detail-label">GIT Valuation Cover</span><span class="detail-value">✅ 100% Comprehensive Liability Active</span></div>
      </div>
      <div class="price-banner">
        <div class="price-label">Survey Result</div>
        <div class="price-value">100% VERIFIED & CRATED</div>
        <div style="font-size: 11px; color: #94a3b8;">Approved for pneumatic air-ride heavy trailer transport</div>
      </div>
      <a href="https://pydamovers.com/portal" class="cta-btn">🛡️ View Digital Inspection Photo Dossier</a>
      <div class="guarantee-note">
        <strong>Certified Packaging:</strong> All crating procedures meet Nigerian and international freight safety standards for delicate commercial assets.
      </div>`;
    } else if (selectedTemplate === 'contact_receipt') {
      specificBodyHtml = `
      <div class="ref-badge">TICKET ID #${meta.refNumber}</div>
      <h2 class="greeting">Hello ${clientName},</h2>
      <p class="intro-text">
        We have received your message regarding <strong>"${ticketSubject}"</strong>. Our client services and fleet operations team is reviewing your requirements.
      </p>
      <div class="detail-card">
        <div class="detail-row"><span class="detail-label">Inquiry Topic</span><span class="detail-value">${ticketSubject}</span></div>
        <div class="detail-row"><span class="detail-label">Target Route</span><span class="detail-value">${originRoute} ➔ ${destRoute}</span></div>
        <div class="detail-row"><span class="detail-label">Client Phone</span><span class="detail-value">${clientPhone}</span></div>
        <div class="detail-row"><span class="detail-label">Priority Desk</span><span class="detail-value">Corporate Accounts & Freight Desk</span></div>
        <div class="detail-row"><span class="detail-label">Response Window</span><span class="detail-value">Within 15–30 Minutes</span></div>
      </div>
      <div class="price-banner">
        <div class="price-label">Support Ticket Status</div>
        <div class="price-value">PRIORITY QUEUE ACTIVE</div>
        <div style="font-size: 11px; color: #94a3b8;">A dedicated senior logistics coordinator has been assigned</div>
      </div>
      <p class="intro-text" style="font-size: 13px;">
        <strong>Direct Contact:</strong><br/>
        If your relocation or freight requirement is urgent, contact our 24/7 central dispatch room directly via phone or WhatsApp.
      </p>
      <a href="tel:08062466212" class="cta-btn">📞 Call Operations Desk (0806 246 6212)</a>`;
    } else if (selectedTemplate === 'job_application') {
      specificBodyHtml = `
      <div class="ref-badge">APPLICATION REF #${meta.refNumber}</div>
      <h2 class="greeting">Dear ${clientName},</h2>
      <p class="intro-text">
        Thank you for submitting your employment application for <strong>${jobTitle}</strong> at Pyda Movers & Logistics Ltd. Your application has been logged and is under review by our Fleet HR Division.
      </p>
      <div class="detail-card">
        <div class="detail-row"><span class="detail-label">Position Applied</span><span class="detail-value">${jobTitle}</span></div>
        <div class="detail-row"><span class="detail-label">Candidate Contact</span><span class="detail-value">${clientPhone} • ${clientEmail}</span></div>
        <div class="detail-row"><span class="detail-label">Operational Base</span><span class="detail-value">Abuja Corporate HQ & Lagos Terminals</span></div>
        <div class="detail-row"><span class="detail-label">Fleet Division</span><span class="detail-value">Interstate Heavy Articulated Haulage</span></div>
        <div class="detail-row"><span class="detail-label">License Class</span><span class="detail-value">Class G Heavy Articulated & FRSC Clear</span></div>
        <div class="detail-row"><span class="detail-label">HR Review Stage</span><span class="detail-value" style="color: #10b981;">Under Review by Fleet HR Coordinator</span></div>
      </div>
      <div class="price-banner">
        <div class="price-label">Recruitment Status</div>
        <div class="price-value">APPLICATION LOGGED</div>
        <div style="font-size: 11px; color: #94a3b8;">Shortlisted candidates will be contacted for practical road test</div>
      </div>
      <p class="intro-text" style="font-size: 13px;">
        <strong>Recruitment Protocol:</strong><br/>
        Our HR team will verify your guarantors and driver credentials. Qualified applicants will be invited for practical road testing at our Abuja HQ or Lagos Terminal.
      </p>
      <a href="tel:08062466212" class="cta-btn">📞 Fleet HR Recruitment Desk (0806 246 6212)</a>`;
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${meta.subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #090e1a; margin: 0; padding: 24px; color: #1e293b; }
    .email-container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 16px 40px rgba(0,0,0,0.3); border: 1px solid #1e293b; }
    .email-header { background: #090e1a; padding: 32px 24px; text-align: center; border-bottom: 4px solid #f59e0b; }
    .brand-title { color: #f59e0b; font-size: 22px; font-weight: 900; letter-spacing: 1.5px; margin: 0; text-transform: uppercase; }
    .brand-sub { color: #94a3b8; font-size: 11px; margin-top: 6px; text-transform: uppercase; letter-spacing: 2px; }
    .content-body { padding: 32px 28px; background: #ffffff; }
    .ref-badge { display: inline-block; background: #fef3c7; color: #92400e; font-weight: 800; font-size: 11px; padding: 4px 14px; border-radius: 20px; margin-bottom: 16px; letter-spacing: 0.5px; border: 1px solid #fde68a; }
    .greeting { font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 12px; }
    .intro-text { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px; }
    .detail-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px 20px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 9px 0; border-bottom: 1px dashed #e2e8f0; font-size: 13px; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #64748b; font-weight: 600; }
    .detail-value { color: #0f172a; font-weight: 800; text-align: right; }
    .price-banner { background: linear-gradient(135deg, #090e1a 0%, #1e293b 100%); color: #ffffff; border-radius: 14px; padding: 22px; text-align: center; margin: 24px 0; border: 1px solid #334155; }
    .price-label { font-size: 11px; color: #f59e0b; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px; }
    .price-value { font-size: 26px; font-weight: 900; color: #ffffff; margin: 6px 0; font-family: monospace; letter-spacing: -0.5px; }
    .cta-btn { display: block; text-align: center; background: #f59e0b; color: #090e1a; font-weight: 900; font-size: 14px; text-decoration: none; padding: 15px 24px; border-radius: 12px; margin: 24px 0 16px 0; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(245,158,11,0.25); }
    .guarantee-note { font-size: 12px; color: #64748b; background: #fffbeb; border: 1px solid #fef3c7; padding: 14px; border-radius: 10px; line-height: 1.5; margin-top: 16px; }
    .footer { background: #0f172a; padding: 28px 24px; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.6; border-top: 1px solid #1e293b; }
    .footer-title { font-weight: 800; color: #ffffff; margin-bottom: 4px; font-size: 12px; }
    .footer-contacts { font-weight: 700; color: #f59e0b; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1 class="brand-title">PYDA MOVERS & LOGISTICS</h1>
      <div class="brand-sub">Registered Trademark & Corporate Freight Operations</div>
    </div>
    <div class="content-body">
      ${specificBodyHtml}
    </div>
    <div class="footer">
      <div class="footer-title">Pyda Movers & Logistics Ltd (RC 1790283)</div>
      <div>Abuja Corporate HQ: Suite A204, Citygate Plaza, Central Business District, Abuja FCT</div>
      <div>Lagos Maritime Terminal: 374/376 Old Ojo Road, Alakija, Satellite Town, Lagos</div>
      <div class="footer-contacts">Hotlines: +234 806 246 6212 | +234 802 560 9972 | dispatch@pydamovers.com</div>
      <div style="margin-top: 10px; color: #64748b;">© 2026 Pyda Movers & Logistics Ltd. All rights reserved.</div>
    </div>
  </div>
</body>
</html>`;
  };

  const generatePlainText = () => {
    let bodyText = '';

    if (selectedTemplate === 'quote_confirmation') {
      bodyText = `Dear ${clientName},

Thank you for choosing Pyda Movers & Logistics Ltd. We have received your formal quotation inquiry.

CORRIDOR SPECIFICATIONS:
* Corridor Route: ${originRoute} -> ${destRoute}
* Service Category: Interstate Haulage & Premium Crating
* Assigned Fleet: ${vehicleAssigned}
* Lead Captain / Driver: ${driverName}
* Wood Crating: Included (Certified Multi-Layer Hardwood)
* Goods-in-Transit Cover: 100% Comprehensive GIT Liability Protection
* Comprehensive Estimated Investment: ${formattedCostNaira}

WHAT HAPPENS NEXT:
Our senior logistics coordinator will call you directly at ${clientPhone} to confirm site access and loading schedule.`;
    } else if (selectedTemplate === 'shipment_dispatched') {
      bodyText = `Dear ${clientName},

Your freight convoy has officially departed from our logistics hub and is currently in-transit under active satellite tracking escort.

CONVOY TELEMETRY:
* Status: IN-TRANSIT (GPS ACTIVE)
* Departure Hub: ${originRoute}
* Destination Hub: ${destRoute}
* Assigned Hauler: ${vehicleAssigned}
* Convoy Captain: ${driverName}
* Transponder Ping: Every 60 Seconds
* Speed Governor: Enforced Max 65 km/h Interstate Corridor

RECEIVER NOTICE:
The receiving party at ${destRoute} will be called 2 hours prior to arrival for gate access.`;
    } else if (selectedTemplate === 'shipment_delivered') {
      bodyText = `Dear ${clientName},

Your consignment has been successfully offloaded, inspected, and verified at the destination terminal. Electronic Proof of Delivery (E-POD) has been registered.

DELIVERY CONFIRMATION:
* Status: DELIVERED & VERIFIED (ZERO-DAMAGE)
* Final Terminal: ${destRoute}
* Delivery Timestamp: ${currentDateFormatted} at ${currentTimeFormatted}
* Assigned Fleet: ${vehicleAssigned}
* Cargo Condition: 100% Intact / Seals Verified Unbroken
* Security Seal ID: SEAL-PYDA-9941 (TAMPER-EVIDENT)

DOCUMENT VAULT:
Your verified Electronic Proof of Delivery (E-POD) docket has been archived in your client portal.`;
    } else if (selectedTemplate === 'cargo_inspection') {
      bodyText = `Dear ${clientName},

Your pre-transit digital cargo inspection report has been finalized by our certified logistics survey riggers.

SURVEY CERTIFICATION:
* Inspection Terminal: Lagos Maritime Terminal / Abuja HQ
* Lead Surveyor: Engr. Chidi Okafor (NIS Certified Lead Surveyor)
* Packaging Standard: Triple-Wall Treated Hardwood & Custom Poly Foam
* Tamper-Evident Seals: SEAL-PYDA-9941 / SEAL-PYDA-9942
* GIT Valuation Cover: 100% Comprehensive Liability Active
* Cargo Status: Approved for Pneumatic Air-Ride Road Transit`;
    } else if (selectedTemplate === 'contact_receipt') {
      bodyText = `Hello ${clientName},

Thank you for contacting Pyda Movers & Logistics regarding "${ticketSubject}".

SUPPORT TICKET DETAILS:
* Ticket ID: #${meta.refNumber}
* Topic: ${ticketSubject}
* Route Focus: ${originRoute} -> ${destRoute}
* Client Contact: ${clientPhone}
* Priority Routing: Tier-1 Corporate Accounts Desk
* Response SLA: Within 15-30 Minutes

Our dispatch coordinator will call you back shortly.`;
    } else if (selectedTemplate === 'job_application') {
      bodyText = `Dear ${clientName},

Thank you for submitting your employment application for ${jobTitle} at Pyda Movers & Logistics Ltd.

APPLICATION DOSSIER:
* Application Ref: #${meta.refNumber}
* Position Applied: ${jobTitle}
* Candidate Contact: ${clientPhone} | ${clientEmail}
* Base Terminal: Abuja HQ & Lagos Terminals
* License Verification: Class G Heavy Articulated Clear
* Review Stage: Under Review by Fleet HR Coordinator

Shortlisted drivers will be invited for practical road testing.`;
    }

    return `===========================================================
PYDA MOVERS & LOGISTICS - TRANSACTIONAL NOTIFICATION
Registered Trademark & Corporate Freight Operations
===========================================================
Subject: ${meta.subject}
Date: ${currentDateFormatted} at ${currentTimeFormatted}
From: Pyda Movers Dispatch <dispatch@pydamovers.com>
To: ${meta.to}
Security: TLS 1.3 Verified Sender (SPF/DKIM: PASS)
-----------------------------------------------------------

${bodyText}

Need immediate dispatch assistance?
Call 24/7 Operations: +234 806 246 6212 / +234 802 560 9972
Email: dispatch@pydamovers.com
Web: https://pydamovers.com

===========================================================
Pyda Movers & Logistics Ltd (RC 1790283)
Abuja HQ: Suite A204, Citygate Plaza, CBD, Abuja FCT
Lagos Terminal: 374/376 Old Ojo Road, Alakija, Satellite Town, Lagos
(c) 2026 Pyda Movers & Logistics Ltd. All rights reserved.
===========================================================`;
  };

  const handleCopy = () => {
    const content = displayFormat === 'html' ? generateRawHtml() : generatePlainText();
    navigator.clipboard.writeText(content);
    setIsCopied(true);
    if (showToast) showToast('Email content copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([generateRawHtml()], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email_preview_${selectedTemplate}_${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    if (showToast) showToast('HTML file downloaded successfully');
  };

  const handleDispatchTest = async () => {
    if (!testRecipient) return;
    setIsSendingTest(true);
    setTestFeedback(null);

    try {
      if (onSendTestEmail) {
        const ok = await onSendTestEmail(testRecipient, selectedTemplate);
        if (ok) {
          setTestFeedback({ success: true, message: `Mock email dispatched to ${testRecipient}` });
        } else {
          setTestFeedback({ success: false, message: 'Server failed to send email' });
        }
      } else {
        const res = await fetch('/api/email/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipient: testRecipient }),
        });
        const data = await res.json();
        if (data.success) {
          setTestFeedback({ success: true, message: `Test email dispatched to ${testRecipient}` });
          if (showToast) showToast(`Email dispatched to ${testRecipient}`);
        } else {
          setTestFeedback({ success: false, message: data.error || 'Failed to dispatch email' });
        }
      }
    } catch (err: any) {
      setTestFeedback({ success: false, message: err.message || 'Network error occurred' });
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[94vh] relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ==================================================== */}
        {/* MODAL EXECUTIVE HEADER */}
        {/* ==================================================== */}
        <div className="bg-slate-950 px-5 sm:px-7 py-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-white">Automated Client Email Previewer</h3>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <BadgeCheck className="w-3 h-3 text-emerald-400" />
                    <span>SPF / DKIM Verified</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Inspect exact visual rendering of transactional email notifications before customer delivery.
                </p>
              </div>
            </div>
          </div>

          {/* Right Action Controls: View Mode & Close */}
          <div className="flex items-center gap-2 self-start md:self-center">
            {/* View Mode Switcher: Desktop vs Mobile */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setViewMode('desktop')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'desktop' 
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Preview Desktop Email Rendering (640px Container)"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('mobile')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'mobile' 
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Preview Mobile Email Rendering (380px Smartphone Chassis)"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>

            {/* Customizer Toggle */}
            <button
              type="button"
              onClick={() => setIsCustomizing(!isCustomizing)}
              className={`p-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                isCustomizing 
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' 
                  : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
              }`}
              title="Toggle Live Parameter Customizer"
            >
              <Sliders className="w-4 h-4" />
              <span className="hidden md:inline">Parameters</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
              aria-label="Close Email Preview Modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ==================================================== */}
        {/* TEMPLATE SELECTOR TABS & FORMAT SWITCHER */}
        {/* ==================================================== */}
        <div className="bg-slate-950/70 border-b border-slate-800 px-5 sm:px-7 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          
          {/* Template Selection Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'quote_confirmation', label: 'Quotation Confirmation', icon: FileText },
              { id: 'shipment_dispatched', label: 'In-Transit Convoy Alert', icon: Truck },
              { id: 'shipment_delivered', label: 'Delivery & POD Receipt', icon: CheckCircle2 },
              { id: 'cargo_inspection', label: 'Cargo Survey Certificate', icon: ShieldCheck },
              { id: 'contact_receipt', label: 'Support Inquiry Ticket', icon: Mail },
              { id: 'job_application', label: 'HR Job Application', icon: Briefcase },
            ].map((t) => {
              const Icon = t.icon;
              const isActive = selectedTemplate === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTemplate(t.id as EmailTemplateType)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border shrink-0 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Format Toggle: Rendered vs Plaintext vs HTML */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 self-end sm:self-center shrink-0">
            <button
              type="button"
              onClick={() => setDisplayFormat('rendered')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                displayFormat === 'rendered' ? 'bg-slate-800 text-amber-400 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Rendered
            </button>
            <button
              type="button"
              onClick={() => setDisplayFormat('plaintext')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                displayFormat === 'plaintext' ? 'bg-slate-800 text-amber-400 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Plain Text
            </button>
            <button
              type="button"
              onClick={() => setDisplayFormat('html')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                displayFormat === 'html' ? 'bg-slate-800 text-amber-400 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code className="w-3 h-3" />
              <span>HTML</span>
            </button>
          </div>
        </div>

        {/* ==================================================== */}
        {/* COLLAPSIBLE LIVE PARAMETER CUSTOMIZER */}
        {/* ==================================================== */}
        {isCustomizing && (
          <div className="bg-slate-950/90 border-b border-slate-800 px-5 sm:px-7 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs shrink-0 animate-fade-in">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">Client / Applicant Name</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-400 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">Client Email</label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-400 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">Phone Number</label>
              <input
                type="text"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-400 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">Origin City / Hub</label>
              <input
                type="text"
                value={originRoute}
                onChange={(e) => setOriginRoute(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-400 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">Destination City / Hub</label>
              <input
                type="text"
                value={destRoute}
                onChange={(e) => setDestRoute(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-400 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">Estimated Cost (₦)</label>
              <input
                type="number"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-400 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">Assigned Fleet Truck</label>
              <input
                type="text"
                value={vehicleAssigned}
                onChange={(e) => setVehicleAssigned(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-400 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">Fleet Captain / Escort</label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-400 outline-none"
              />
            </div>
            {selectedTemplate === 'job_application' && (
              <div className="col-span-2">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">Job Title</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-400 outline-none"
                />
              </div>
            )}
            {selectedTemplate === 'contact_receipt' && (
              <div className="col-span-2">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">Ticket Subject</label>
                <input
                  type="text"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-400 outline-none"
                />
              </div>
            )}
            <div className="col-span-2 sm:col-span-4 flex justify-end pt-1">
              <button
                type="button"
                onClick={() => {
                  setClientName(quoteData?.fullName || applicantData?.fullName || 'Yerima Forfor');
                  setClientEmail(quoteData?.email || applicantData?.email || 'yerimaforfor@gmail.com');
                  setClientPhone(quoteData?.phone || applicantData?.phone || '0806 246 6212');
                  setOriginRoute(quoteData?.originCity || 'Ikeja, Lagos State');
                  setDestRoute(quoteData?.destinationCity || 'Central Business District, Abuja FCT');
                  setEstimatedCost(quoteData?.estimatedCostNaira ? String(quoteData.estimatedCostNaira) : '450000');
                  setVehicleAssigned('DAF 30-Ton Enclosed Heavy Hauler (KJA-884-XG)');
                  setDriverName('Usman Kabir (Senior Fleet Captain)');
                  setJobTitle(applicantData?.jobTitle || 'Senior Articulated Truck Driver (30-Ton Fleet)');
                  setTicketSubject('Corporate Relocation Consultation');
                }}
                className="py-1.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Parameter Defaults</span>
              </button>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* EMAIL METADATA CHROME BAR (APPLE MAIL / GMAIL STYLE) */}
        {/* ==================================================== */}
        <div className="bg-slate-950/80 px-5 sm:px-7 py-3 border-b border-slate-800 space-y-1.5 text-xs font-mono shrink-0">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <div className="flex items-center gap-1.5 font-sans">
              <span className="font-bold text-slate-200">From:</span>
              <span className="text-amber-400 font-mono font-bold">Pyda Movers Dispatch &lt;dispatch@pydamovers.com&gt;</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-sans font-bold uppercase">
                TLS 1.3
              </span>
            </div>
            <span className="text-slate-500 font-sans text-[10px]">
              {currentDateFormatted} at {currentTimeFormatted}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <div className="flex items-center gap-1.5 font-sans truncate">
              <span className="font-bold text-slate-200">To:</span>
              <span className="text-white font-mono truncate">{meta.to}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-sans hidden sm:inline">
              MIME: multipart/alternative • SPF: PASS • DKIM: PASS
            </span>
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            <span className="font-bold text-slate-200 font-sans">Subject:</span>
            <span className="text-white font-sans font-black text-xs sm:text-sm truncate">
              {meta.subject}
            </span>
          </div>
        </div>

        {/* ==================================================== */}
        {/* MAIN PREVIEW CANVAS */}
        {/* ==================================================== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950/40 flex justify-center items-start">
          
          {/* Format 1: Rendered HTML Email (Desktop or Mobile Shell) */}
          {displayFormat === 'rendered' && (
            <div 
              className={`transition-all duration-300 w-full ${
                viewMode === 'mobile' 
                  ? 'max-w-[390px] border-[8px] border-slate-800 rounded-[40px] shadow-2xl p-1 bg-slate-900 overflow-hidden' 
                  : 'max-w-2xl'
              }`}
            >
              {/* Mobile Phone Status Bar */}
              {viewMode === 'mobile' && (
                <div className="bg-slate-900 text-slate-400 px-4 pt-2 pb-1.5 flex items-center justify-between text-[10px] font-sans border-b border-slate-800">
                  <span>9:41 AM</span>
                  <div className="w-16 h-3.5 bg-slate-800 rounded-full" />
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                    <span>5G</span>
                  </div>
                </div>
              )}

              {/* Email Content Container */}
              <div className="bg-white text-slate-900 rounded-2xl overflow-hidden shadow-2xl font-sans border border-slate-200">
                
                {/* Email Branded Header */}
                <div className="bg-[#090e1a] text-white p-6 sm:p-8 text-center border-b-4 border-amber-500 relative">
                  <div className="inline-block mb-1">
                    <h1 className="text-xl sm:text-2xl font-black text-amber-400 tracking-wider uppercase">
                      PYDA MOVERS & LOGISTICS
                    </h1>
                    <p className="text-[10px] text-slate-300 uppercase tracking-widest font-semibold mt-0.5">
                      Pan-African Haulage, Heavy Freight & Interstate Relocations
                    </p>
                  </div>
                  <div className="text-[9px] text-slate-400 mt-2 font-mono">
                    Federal Trademark Registration RC 1790283 • Verified Nigerian Carrier
                  </div>
                </div>

                {/* Email Body Content */}
                <div className="p-6 sm:p-8 space-y-5 text-left">
                  
                  {/* Reference Tag & Greeting */}
                  <div className="flex items-center justify-between">
                    <span className="inline-block bg-amber-100 text-amber-900 font-extrabold px-3 py-1 rounded-full text-[11px] border border-amber-200">
                      REFERENCE #{meta.refNumber}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Date: {currentDateFormatted}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      Dear {clientName},
                    </h2>
                    <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-relaxed">
                      {selectedTemplate === 'quote_confirmation' && (
                        <>Thank you for choosing <strong>Pyda Movers & Logistics Ltd</strong>. We have received your formal quotation inquiry. Below are your route specifications, estimated investment, and equipment allotments covering all 36 Nigerian States + FCT:</>
                      )}
                      {selectedTemplate === 'shipment_dispatched' && (
                        <>Your scheduled freight convoy has officially departed and is currently in-transit under active satellite escort. Below is your live dispatch telemetry and driver contact details:</>
                      )}
                      {selectedTemplate === 'shipment_delivered' && (
                        <>We are delighted to confirm that your consignment has been successfully offloaded, inspected, and verified at the destination terminal. Electronic Proof of Delivery (E-POD) has been registered.</>
                      )}
                      {selectedTemplate === 'cargo_inspection' && (
                        <>Your pre-transit digital cargo inspection report has been finalized by our certified logistics survey riggers. Multi-layer wood crating and tamper-evident security seals have been verified.</>
                      )}
                      {selectedTemplate === 'contact_receipt' && (
                        <>We have received your message regarding <strong>"{ticketSubject}"</strong>. Our senior operations desk has assigned priority routing to your ticket. A specialist coordinator will contact you shortly.</>
                      )}
                      {selectedTemplate === 'job_application' && (
                        <>Thank you for submitting your employment application for <strong>{jobTitle}</strong> at Pyda Movers & Logistics Ltd. Your application is under review by our Fleet HR Division.</>
                      )}
                    </p>
                  </div>

                  {/* Transactional Details Card Box Tailored Per Template */}
                  {selectedTemplate === 'quote_confirmation' && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-2.5 text-xs text-slate-700">
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                        <span className="font-semibold text-slate-500">Corridor Route:</span>
                        <strong className="text-slate-900 font-bold">{originRoute} ➔ {destRoute}</strong>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                        <span className="font-semibold text-slate-500">Service Category:</span>
                        <strong className="text-slate-900 font-bold uppercase">Interstate Haulage & Premium Crating</strong>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                        <span className="font-semibold text-slate-500">Assigned Fleet Vehicle:</span>
                        <strong className="text-slate-900 font-bold">{vehicleAssigned}</strong>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                        <span className="font-semibold text-slate-500">Lead Driver / Convoy Captain:</span>
                        <strong className="text-slate-900 font-bold">{driverName}</strong>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                        <span className="font-semibold text-slate-500">Multi-Layer Wood Crating:</span>
                        <span className="font-bold text-emerald-700">✅ Included (Custom Packaging)</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="font-semibold text-slate-500">Goods-In-Transit (GIT) Cover:</span>
                        <span className="font-bold text-emerald-700">✅ 100% Comprehensive Liability Active</span>
                      </div>
                    </div>
                  )}

                  {selectedTemplate === 'shipment_dispatched' && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-2.5 text-xs text-slate-700">
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                        <span className="font-semibold text-slate-500">Consignment Status:</span>
                        <strong className="text-amber-600 font-black uppercase">IN-TRANSIT (GPS ACTIVE)</strong>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                        <span className="font-semibold text-slate-500">Departure Hub:</span>
                        <strong className="text-slate-900 font-bold">{originRoute}</strong>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                        <span className="font-semibold text-slate-500">Destination Hub:</span>
                        <strong className="text-slate-900 font-bold">{destRoute}</strong>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                        <span className="font-semibold text-slate-500">Assigned Fleet Truck:</span>
                        <strong className="text-slate-900 font-bold">{vehicleAssigned}</strong>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                        <span className="font-semibold text-slate-500">Lead Driver & Contact:</span>
                        <strong className="text-slate-900 font-bold">{driverName} (+234 806 246 6212)</strong>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                        <span className="font-semibold text-slate-500">Telemetry Ping:</span>
                        <span className="font-bold text-slate-900">Every 60 Seconds via Transponder</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="font-semibold text-slate-500">Corridor Speed Limiter:</span>
                        <span className="font-bold text-emerald-700">Enforced Max 65 km/h Highway Corridor</span>
                      </div>
                    </div>
                  )}

                  {selectedTemplate === 'shipment_delivered' && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-2.5 text-xs text-slate-700">
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                        <span className="font-semibold text-slate-500">Consignment Status:</span>
                        <strong className="text-emerald-700 font-black uppercase">DELIVERED & VERIFIED</strong>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                        <span className="font-semibold text-slate-500">Delivered Location:</span>
                        <strong className="text-slate-900 font-bold">{destRoute}</strong>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                        <span className="font-semibold text-slate-500">Completion Timestamp:</span>
                        <strong className="text-slate-900 font-bold">{currentDateFormatted} at {currentTimeFormatted}</strong>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                        <span className="font-semibold text-slate-500">Assigned Fleet Truck:</span>
                        <strong className="text-slate-900 font-bold">{vehicleAssigned}</strong>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                        <span className="font-semibold text-slate-500">Cargo Condition:</span>
                        <strong className="text-emerald-700 font-bold">100% Intact / Zero-Damage Verified</strong>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="font-semibold text-slate-500">Security Seal ID:</span>
                        <span className="font-bold text-slate-900 font-mono">SEAL-PYDA-9941 (TAMPER-EVIDENT)</span>
                      </div>
                    </div>
                  )}

                  {selectedTemplate === 'cargo_inspection' && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-2.5 text-xs text-slate-700">
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                        <span className="font-semibold text-slate-500">Inspection Station:</span>
                        <strong className="text-slate-900 font-bold">Lagos Maritime Hub / Abuja Terminal</strong>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                        <span className="font-semibold text-slate-500">Surveying Engineer:</span>
                        <strong className="text-slate-900 font-bold">Engr. Chidi Okafor (NIS Certified Lead Surveyor)</strong>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                        <span className="font-semibold text-slate-500">Crating Standards:</span>
                        <strong className="text-slate-900 font-bold">Triple-Wall Treated Hardwood & Custom Poly Foam</strong>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                        <span className="font-semibold text-slate-500">Tamper-Evident Seals:</span>
                        <span className="font-bold text-slate-900 font-mono">SEAL-PYDA-9941 / SEAL-PYDA-9942</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                        <span className="font-semibold text-slate-500">Fragile Cargo Items:</span>
                        <strong className="text-slate-900 font-bold">Server Racks, IT Hardware, Executive Workstations</strong>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="font-semibold text-slate-500">GIT Valuation Policy:</span>
                        <span className="font-bold text-emerald-700">✅ 100% Comprehensive Liability Active</span>
                      </div>
                    </div>
                  )}

                  {selectedTemplate === 'contact_receipt' && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-2.5 text-xs text-slate-700">
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                        <span className="font-semibold text-slate-500">Inquiry Topic:</span>
                        <strong className="text-slate-900 font-bold">{ticketSubject}</strong>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                        <span className="font-semibold text-slate-500">Target Relocation Corridor:</span>
                        <strong className="text-slate-900 font-bold">{originRoute} ➔ {destRoute}</strong>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                        <span className="font-semibold text-slate-500">Contact Number:</span>
                        <strong className="text-slate-900 font-bold">{clientPhone}</strong>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                        <span className="font-semibold text-slate-500">Priority Desk:</span>
                        <strong className="text-slate-900 font-bold">Corporate Accounts & Freight Desk</strong>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="font-semibold text-slate-500">Response SLA:</span>
                        <span className="font-bold text-emerald-700">Within 15–30 Minutes</span>
                      </div>
                    </div>
                  )}

                  {selectedTemplate === 'job_application' && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-2.5 text-xs text-slate-700">
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                        <span className="font-semibold text-slate-500">Position Applied:</span>
                        <strong className="text-slate-900 font-bold">{jobTitle}</strong>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                        <span className="font-semibold text-slate-500">Candidate Contact:</span>
                        <strong className="text-slate-900 font-bold">{clientPhone} • {clientEmail}</strong>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                        <span className="font-semibold text-slate-500">Operational Base:</span>
                        <strong className="text-slate-900 font-bold">Abuja Corporate HQ & Lagos Terminals</strong>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                        <span className="font-semibold text-slate-500">Fleet Division:</span>
                        <strong className="text-slate-900 font-bold">Interstate Heavy Articulated Haulage</strong>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                        <span className="font-semibold text-slate-500">Driver License Class:</span>
                        <span className="font-bold text-slate-900">Class G Heavy Articulated & FRSC Clear</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="font-semibold text-slate-500">HR Review Stage:</span>
                        <span className="font-bold text-emerald-700">Under Review by Fleet HR Coordinator</span>
                      </div>
                    </div>
                  )}

                  {/* Highlight Price or Status Banner */}
                  <div className="bg-[#090e1a] text-white p-5 rounded-2xl text-center space-y-1 shadow-lg border border-slate-800">
                    <div className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                      {selectedTemplate === 'quote_confirmation' && 'Comprehensive Estimated Investment'}
                      {selectedTemplate === 'shipment_dispatched' && 'Live Convoy Status & Speed Governor'}
                      {selectedTemplate === 'shipment_delivered' && 'Consignment Milestone Fulfilled'}
                      {selectedTemplate === 'cargo_inspection' && 'Pre-Transit Rigging Certification'}
                      {selectedTemplate === 'contact_receipt' && 'Corporate Support Queue'}
                      {selectedTemplate === 'job_application' && 'Recruitment Application Docket'}
                    </div>
                    <div className="text-2xl sm:text-3xl font-black font-mono text-white">
                      {selectedTemplate === 'quote_confirmation' && formattedCostNaira}
                      {selectedTemplate === 'shipment_dispatched' && 'IN-TRANSIT (GPS ACTIVE)'}
                      {selectedTemplate === 'shipment_delivered' && 'DELIVERY COMPLETED'}
                      {selectedTemplate === 'cargo_inspection' && '100% VERIFIED & CRATED'}
                      {selectedTemplate === 'contact_receipt' && 'PRIORITY QUEUE ACTIVE'}
                      {selectedTemplate === 'job_application' && 'APPLICATION LOGGED'}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {selectedTemplate === 'quote_confirmation' && 'Includes certified trucks, satellite telematics, experienced riggers & transit insurance'}
                      {selectedTemplate === 'shipment_dispatched' && 'Real-time telemetry updated via satellite transponder every 60 seconds'}
                      {selectedTemplate === 'shipment_delivered' && 'Zero-Damage Guarantee verified • Signed docket in Document Vault'}
                      {selectedTemplate === 'cargo_inspection' && 'Approved for heavy trailer loading under pneumatic air-ride suspension'}
                      {selectedTemplate === 'contact_receipt' && 'A dedicated senior logistics coordinator has been assigned'}
                      {selectedTemplate === 'job_application' && 'Shortlisted drivers will be invited for practical road testing'}
                    </p>
                  </div>

                  {/* What Happens Next Guidance */}
                  <div className="text-xs text-slate-600 leading-relaxed space-y-1.5">
                    <p className="font-bold text-slate-900">
                      What Happens Next:
                    </p>
                    <p>
                      {selectedTemplate === 'quote_confirmation' && (
                        <>Our senior dispatch coordinator will reach out to you at <strong className="text-slate-900">{clientPhone}</strong> to confirm site clearance, corridor permits, and loading schedule.</>
                      )}
                      {selectedTemplate === 'shipment_dispatched' && (
                        <>The receiving contact at <strong className="text-slate-900">{destRoute}</strong> will receive an arrival call 2 hours prior to arrival for terminal gate clearance.</>
                      )}
                      {selectedTemplate === 'shipment_delivered' && (
                        <>Your electronic Proof of Delivery (E-POD) has been saved permanently to your account's Document Vault for billing and auditing.</>
                      )}
                      {selectedTemplate === 'cargo_inspection' && (
                        <>Consignment is staged in our secure bay awaiting scheduled trailer coupling and departure on the northern interstate corridor.</>
                      )}
                      {selectedTemplate === 'contact_receipt' && (
                        <>An operations lead will contact you via WhatsApp or phone at <strong className="text-slate-900">{clientPhone}</strong> within 15–30 minutes.</>
                      )}
                      {selectedTemplate === 'job_application' && (
                        <>Fleet HR will review your driving credentials, guarantor verification, and invite you for a 30-ton trailer road test.</>
                      )}
                    </p>
                  </div>

                  {/* Primary CTA Button */}
                  <div className="pt-2">
                    {selectedTemplate === 'shipment_dispatched' ? (
                      <a 
                        href="https://pydamovers.com/track"
                        className="block text-center bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider py-4 px-6 rounded-xl shadow-lg transition-transform active:scale-95"
                      >
                        🛰️ Open Satellite Telematics & Live Map
                      </a>
                    ) : selectedTemplate === 'shipment_delivered' ? (
                      <a 
                        href="https://pydamovers.com/portal"
                        className="block text-center bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider py-4 px-6 rounded-xl shadow-lg transition-transform active:scale-95"
                      >
                        📄 Download Verified Electronic POD Receipt
                      </a>
                    ) : selectedTemplate === 'cargo_inspection' ? (
                      <a 
                        href="https://pydamovers.com/portal"
                        className="block text-center bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider py-4 px-6 rounded-xl shadow-lg transition-transform active:scale-95"
                      >
                        🛡️ View Digital Inspection Photo Dossier
                      </a>
                    ) : selectedTemplate === 'job_application' ? (
                      <a 
                        href="tel:08062466212"
                        className="block text-center bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider py-4 px-6 rounded-xl shadow-lg transition-transform active:scale-95"
                      >
                        📞 Contact Fleet HR Recruitment Desk (0806 246 6212)
                      </a>
                    ) : (
                      <a 
                        href="tel:08062466212"
                        className="block text-center bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider py-4 px-6 rounded-xl shadow-lg transition-transform active:scale-95"
                      >
                        📞 Connect with Senior Dispatcher (0806 246 6212)
                      </a>
                    )}
                  </div>

                  {/* Security Guarantee Badge */}
                  <div className="bg-amber-50 border border-amber-200/80 p-3.5 rounded-xl text-slate-800 text-[11px] flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">Guaranteed Security & Satellite Surveillance:</strong> Every interstate haulage assignment is monitored in real-time by digital speed limiters, 24/7 CCTV fleet monitoring, and licensed escort vehicles.
                    </div>
                  </div>

                </div>

                {/* Email Footer */}
                <div className="bg-slate-950 text-slate-400 p-6 sm:p-7 text-center text-xs space-y-2 border-t border-slate-800">
                  <p className="font-bold text-white text-xs">
                    Pyda Movers & Logistics Ltd (RC 1790283)
                  </p>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Abuja Corporate HQ: Suite A204, Citygate Plaza, Central Business District, Abuja FCT<br />
                    Lagos Maritime Terminal: 374/376 Old Ojo Road, Alakija, Satellite Town, Lagos
                  </p>
                  <div className="pt-2 font-bold text-amber-400 text-[11px]">
                    Hotlines: +234 806 246 6212 | +234 802 560 9972 | dispatch@pydamovers.com
                  </div>
                  <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-500">
                    You received this automated transactional notification regarding your logistics engagement with Pyda Movers & Logistics.
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Format 2: Plain Text Fallback */}
          {displayFormat === 'plaintext' && (
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed select-all">
                {generatePlainText()}
              </pre>
            </div>
          )}

          {/* Format 3: Raw HTML Code with Syntax Box */}
          {displayFormat === 'html' && (
            <div className="w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl relative space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                <span className="font-mono text-[11px]">MIME text/html • 620px Responsive Table Template</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied' : 'Copy HTML Code'}</span>
                </button>
              </div>
              <pre className="font-mono text-[11px] text-amber-300/90 whitespace-pre-wrap overflow-x-auto max-h-[500px] leading-relaxed select-all p-3 bg-slate-900 rounded-xl border border-slate-850">
                {generateRawHtml()}
              </pre>
            </div>
          )}

        </div>

        {/* ==================================================== */}
        {/* MODAL FOOTER & INTERACTIVE TEST DISPATCH BAR */}
        {/* ==================================================== */}
        <div className="bg-slate-950 border-t border-slate-800 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          
          {/* Quick Test Sender Form */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider shrink-0 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-amber-400" />
              <span>Send Live Test:</span>
            </span>
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                placeholder="your-email@example.com"
                className="bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white outline-none w-56 sm:w-64"
              />
              <button
                type="button"
                onClick={handleDispatchTest}
                disabled={isSendingTest || !testRecipient}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow-md shrink-0 cursor-pointer"
              >
                {isSendingTest ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Test</span>
                  </>
                )}
              </button>
            </div>

            {testFeedback && (
              <span className={`text-xs font-bold flex items-center gap-1 ${
                testFeedback.success ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {testFeedback.success ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                <span>{testFeedback.message}</span>
              </span>
            )}
          </div>

          {/* Export & Action Buttons */}
          <div className="flex items-center gap-2 self-end md:self-center">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy plain text or HTML to clipboard"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadHtml}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download standalone HTML file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download HTML</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print preview"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
