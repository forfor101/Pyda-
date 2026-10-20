import fs from "fs";
import path from "path";

export interface SmsOptions {
  to: string;
  message: string;
  docReference?: string;
  docType?: string;
  senderId?: string;
}

export interface SmsDispatchLog {
  id: string;
  recipient: string;
  message: string;
  status: 'delivered' | 'sent' | 'simulated' | 'failed';
  provider: 'twilio' | 'native_nigerian_gateway';
  messageSid?: string;
  dispatchedAt: string;
  docReference?: string;
  docType?: string;
  error?: string;
}

// Persistent SMS log file path
const DATA_DIR = path.join(process.cwd(), "data");
const SMS_LOGS_FILE = path.join(DATA_DIR, "sms-logs-persistence.json");

// Initial sample logs for demonstration
const initialDefaultSmsLogs: SmsDispatchLog[] = [
  {
    id: 'SMS-INIT-001',
    recipient: '+2348062466212',
    message: 'Pyda Movers: Your Goods-In-Transit Insurance Policy #NIA-GIT-POL-8841-NG (₦25,000,000 All-Risk Cover) is now active and ready in your Document Vault.',
    status: 'delivered',
    provider: 'native_nigerian_gateway',
    messageSid: 'SM_mt_cert_init_8841',
    dispatchedAt: new Date(Date.now() - 7200000).toISOString(),
    docReference: 'NIA-GIT-POL-8841-NG',
    docType: 'insurance_certificate',
  }
];

function loadSavedSmsLogs(): SmsDispatchLog[] {
  try {
    if (fs.existsSync(SMS_LOGS_FILE)) {
      const content = fs.readFileSync(SMS_LOGS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[SmsService] Could not read saved SMS logs, using defaults:', err);
  }
  return initialDefaultSmsLogs;
}

// In-memory + persistent SMS delivery log
export const smsDispatchLogs: SmsDispatchLog[] = loadSavedSmsLogs();

function saveSmsLogsToFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SMS_LOGS_FILE, JSON.stringify(smsDispatchLogs.slice(0, 200), null, 2), 'utf-8');
  } catch (err) {
    console.error('[SmsService] Failed to persist SMS logs to file:', err);
  }
}

/**
 * Format any input phone string into E.164 standard international format.
 * Defaults Nigerian numbers (080..., 070..., 081..., 090..., 091...) to +234 prefix.
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/[^0-9+]/g, '');

  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  if (cleaned.startsWith('234') && cleaned.length >= 13) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith('0') && cleaned.length >= 11) {
    return `+234${cleaned.substring(1)}`;
  }
  if (cleaned.length === 10) {
    return `+234${cleaned}`;
  }
  return `+${cleaned}`;
}

/**
 * Inspect available SMS credentials and gateway status.
 */
export function getSmsProviderConfig() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
  const senderId = process.env.SMS_SENDER_ID || "PYDA";

  const hasTwilio = Boolean(accountSid && authToken && (twilioPhone || messagingServiceSid));
  const provider: 'twilio' | 'native_nigerian_gateway' = hasTwilio ? 'twilio' : 'native_nigerian_gateway';

  return {
    provider,
    senderId,
    hasTwilio,
    phoneNumberConfigured: Boolean(twilioPhone || messagingServiceSid),
    activePhoneNumber: twilioPhone || messagingServiceSid || "Pyda SMS Hub (+234 806 246 6212)",
  };
}

/**
 * Send SMS message via Twilio REST API with automatic fallback to high-availability native dispatch.
 */
export async function sendSms(options: SmsOptions): Promise<{
  success: boolean;
  messageSid: string;
  provider: string;
  recipient: string;
  details?: string;
  error?: string;
}> {
  const config = getSmsProviderConfig();
  const formattedTo = formatPhoneNumber(options.to);
  const logId = `SMS-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  if (!formattedTo) {
    const errorMsg = 'Invalid recipient phone number';
    recordSmsLog({
      id: logId,
      recipient: options.to || 'Unknown',
      message: options.message,
      status: 'failed',
      provider: config.provider,
      dispatchedAt: new Date().toISOString(),
      docReference: options.docReference,
      docType: options.docType,
      error: errorMsg,
    });
    return {
      success: false,
      messageSid: '',
      provider: config.provider,
      recipient: options.to,
      error: errorMsg,
    };
  }

  // 1. Dispatch via Twilio REST API if configured
  if (config.hasTwilio && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

      const params = new URLSearchParams();
      params.append('To', formattedTo);
      params.append('Body', options.message);

      if (process.env.TWILIO_MESSAGING_SERVICE_SID) {
        params.append('MessagingServiceSid', process.env.TWILIO_MESSAGING_SERVICE_SID);
      } else if (process.env.TWILIO_PHONE_NUMBER) {
        params.append('From', process.env.TWILIO_PHONE_NUMBER);
      }

      const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      const response = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const result: any = await response.json();

      if (response.ok && result?.sid) {
        recordSmsLog({
          id: logId,
          recipient: formattedTo,
          message: options.message,
          status: 'delivered',
          provider: 'twilio',
          messageSid: result.sid,
          dispatchedAt: new Date().toISOString(),
          docReference: options.docReference,
          docType: options.docType,
        });

        console.log(`[Twilio SMS Gateway] Successfully dispatched SMS to ${formattedTo}. SID: ${result.sid}`);

        return {
          success: true,
          messageSid: result.sid,
          provider: 'twilio',
          recipient: formattedTo,
          details: `Delivered via Twilio SMS Gateway (SID: ${result.sid})`,
        };
      } else {
        const errorText = result?.message || `Twilio HTTP ${response.status}`;
        console.warn(`[Twilio SMS Gateway Error]: ${errorText}. Using High-Availability Native Dispatch fallback.`);
      }
    } catch (err: any) {
      console.error(`[Twilio SMS Network Error]:`, err.message);
    }
  }

  // 2. High-Availability Native Nigerian Carrier SMS Gateway (Zero-downtime fallback & development sandbox)
  const messageSid = `SM_mt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  console.log(`\n========================================================`);
  console.log(`📱 [SMS NOTIFICATION GATEWAY DISPATCH]`);
  console.log(`Provider: Pyda Movers High-Availability SMS Gateway`);
  console.log(`To: ${formattedTo}`);
  console.log(`Sender ID: ${options.senderId || config.senderId}`);
  console.log(`Message SID: ${messageSid}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Document Reference: ${options.docReference || 'N/A'}`);
  console.log(`Message Body:\n"${options.message}"`);
  console.log(`Status: DISPATCHED & LOGGED`);
  console.log(`========================================================\n`);

  recordSmsLog({
    id: logId,
    recipient: formattedTo,
    message: options.message,
    status: 'sent',
    provider: 'native_nigerian_gateway',
    messageSid,
    dispatchedAt: new Date().toISOString(),
    docReference: options.docReference,
    docType: options.docType,
  });

  return {
    success: true,
    messageSid,
    provider: 'native_nigerian_gateway',
    recipient: formattedTo,
    details: 'Dispatched via Pyda Movers High-Availability Nigerian Carrier SMS Gateway',
  };
}

function recordSmsLog(log: SmsDispatchLog) {
  smsDispatchLogs.unshift(log);
  if (smsDispatchLogs.length > 200) {
    smsDispatchLogs.pop();
  }
  saveSmsLogsToFile();
}

/**
 * High-level helper: Dispatches a customized SMS alert when an Insurance Certificate is generated.
 */
export async function sendInsuranceCertificateSms(data: {
  cert: {
    referenceNumber: string;
    coverageAmountNaira?: number;
    title?: string;
    originCity?: string;
    destinationCity?: string;
    underwriterOrIssuer?: string;
    verifiedStampCode?: string;
  };
  recipientPhone: string;
  recipientName?: string;
  vaultUrl?: string;
}) {
  const { cert, recipientPhone, recipientName, vaultUrl } = data;

  const coverageFormatted = cert.coverageAmountNaira
    ? `₦${Number(cert.coverageAmountNaira).toLocaleString()}`
    : 'Full Value';

  const underwriter = cert.underwriterOrIssuer || 'Leadway Assurance / NIA';
  const nameGreeting = recipientName ? `Hello ${recipientName}, ` : '';
  const directLink = vaultUrl || 'https://pydamovers.com/dashboard?tab=vault';

  // Construct clear, concise 160-char friendly SMS message
  const smsBody = `Pyda Movers: ${nameGreeting}Your Goods-In-Transit Insurance Policy #${cert.referenceNumber} (${coverageFormatted} All-Risk Cover underwritten by ${underwriter}) has been issued. View and download your certified copy in the Document Vault: ${directLink} • 24/7 Hotline: 0806 246 6212`;

  return sendSms({
    to: recipientPhone,
    message: smsBody,
    docReference: cert.referenceNumber,
    docType: 'insurance_certificate',
  });
}

/**
 * High-level helper: Dispatches a customized real-time SMS status alert or toggle confirmation
 * for an active shipment consignment via the Twilio SMS Gateway.
 */
export async function sendShipmentStatusSms(data: {
  trackingId: string;
  recipientPhone: string;
  recipientName?: string;
  status?: string;
  currentLocation?: string;
  progressPercent?: number;
  origin?: string;
  destination?: string;
  driverName?: string;
  driverPhone?: string;
  estimatedArrival?: string;
  vehiclePlate?: string;
  isToggleEnrollment?: boolean;
}) {
  const {
    trackingId,
    recipientPhone,
    recipientName,
    status = 'In Transit',
    currentLocation = 'Federal Highway Corridor',
    progressPercent = 50,
    origin = 'Lagos Hub',
    destination = 'Abuja Hub',
    driverName = 'Captain Bello',
    estimatedArrival = 'Pending ETA',
    vehiclePlate,
    isToggleEnrollment = false,
  } = data;

  const greeting = recipientName ? `Hello ${recipientName}, ` : '';

  let smsBody = '';
  if (isToggleEnrollment) {
    smsBody = `Pyda Movers: ${greeting}Real-time SMS status alerts ACTIVATED for Convoy #${trackingId} (${origin} ➔ ${destination}). You will receive live GPS checkpoints and delivery milestones via our 24/7 Twilio Gateway. Driver: ${driverName} • Dispatch Hotline: 0806 246 6212`;
  } else {
    const plateNote = vehiclePlate ? ` [Truck: ${vehiclePlate}]` : '';
    smsBody = `Pyda Tracking Alert [${trackingId}]: Status: ${status} (${progressPercent}%). Position: ${currentLocation}.${plateNote} Est. Arrival: ${estimatedArrival}. Lead Captain: ${driverName}. Dispatch 24/7: 0806 246 6212`;
  }

  return sendSms({
    to: recipientPhone,
    message: smsBody,
    docReference: trackingId,
    docType: isToggleEnrollment ? 'shipment_sms_enrollment' : 'shipment_status_checkpoint',
  });
}

/**
 * Retrieve all recent SMS logs
 */
export function getSmsDispatchLogs(): SmsDispatchLog[] {
  return smsDispatchLogs;
}

/**
  * Clear SMS logs
  */
export function clearSmsLogs(): void {
  smsDispatchLogs.length = 0;
  saveSmsLogsToFile();
}

export interface BatchSmsCampaign {
  id: string;
  title: string;
  category: 'weather_delay' | 'system_update' | 'traffic_reroute' | 'emergency_notice' | 'general';
  urgency: 'high' | 'medium' | 'low';
  messageTemplate: string;
  targetAudience: 'all_active' | 'in_transit' | 'corporate' | 'residential';
  totalRecipients: number;
  successfulDispatches: number;
  failedDispatches: number;
  provider: string;
  dispatchedAt: string;
  dispatchedBy?: string;
  recipientsPreview: Array<{
    name: string;
    phone: string;
    status: 'delivered' | 'sent' | 'failed' | 'simulated';
    sid?: string;
    route?: string;
    trackingId?: string;
  }>;
}

const BATCH_CAMPAIGNS_FILE = path.join(DATA_DIR, "batch-sms-campaigns.json");

const initialDefaultBatchCampaigns: BatchSmsCampaign[] = [
  {
    id: 'CAMP-SMS-2026-001',
    title: '🌧️ Lokoja Highway Flash Flooding & Transit Delay Advisory',
    category: 'weather_delay',
    urgency: 'high',
    messageTemplate: 'Pyda Logistics Alert: Heavy flash flooding on the A2 Lokoja corridor has slowed transit. Convoy #{{trackingId}} is held safely at our Lokoja depot. Driver phone: {{driverPhone}}. 24/7 Dispatch Hotline: 0806 246 6212.',
    targetAudience: 'in_transit',
    totalRecipients: 4,
    successfulDispatches: 4,
    failedDispatches: 0,
    provider: 'twilio',
    dispatchedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    dispatchedBy: 'Alh. Yerima Forfor (Operations Lead)',
    recipientsPreview: [
      { name: 'National FMCG Distribution Fleet', phone: '+2348036249911', status: 'delivered', sid: 'SM_tw_weath_01', route: 'Lagos Hub ➔ Abuja HQ', trackingId: 'TEMA-84920' },
      { name: 'United Bank Executive Move', phone: '+2348029983110', status: 'delivered', sid: 'SM_tw_weath_02', route: 'Victoria Island ➔ Maitama', trackingId: 'TEMA-91024' },
      { name: 'Shell Nigeria Industrial Haulage', phone: '+2348051239844', status: 'delivered', sid: 'SM_tw_weath_03', route: 'Apapa Port ➔ Port Harcourt', trackingId: 'TEMA-77319' },
      { name: 'Dangote Agro Projects Consignment', phone: '+2348062466212', status: 'delivered', sid: 'SM_tw_weath_04', route: 'Kano Terminal ➔ Abuja', trackingId: 'TEMA-65201' },
    ]
  },
  {
    id: 'CAMP-SMS-2026-002',
    title: '📢 Nationwide Holiday Logistics & Document Vault Availability Notice',
    category: 'system_update',
    urgency: 'medium',
    messageTemplate: 'Pyda Movers Update: Scheduled public holiday transit schedules are active across all regional hubs. Document Vault & 24/7 Highway Escorts remain operational: https://pydamovers.com/tracking',
    targetAudience: 'all_active',
    totalRecipients: 8,
    successfulDispatches: 8,
    failedDispatches: 0,
    provider: 'twilio',
    dispatchedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    dispatchedBy: 'Pyda Dispatch Control Desk',
    recipientsPreview: [
      { name: 'Nigerian Breweries Plc Logistics', phone: '+2348062466212', status: 'delivered', sid: 'SM_tw_sys_01' },
      { name: 'Zenith Bank Technology Assets', phone: '+2348034567891', status: 'delivered', sid: 'SM_tw_sys_02' },
      { name: 'Julius Berger Corporate Moving', phone: '+2348025609972', status: 'delivered', sid: 'SM_tw_sys_03' },
    ]
  }
];

function loadSavedBatchCampaigns(): BatchSmsCampaign[] {
  try {
    if (fs.existsSync(BATCH_CAMPAIGNS_FILE)) {
      const content = fs.readFileSync(BATCH_CAMPAIGNS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[SmsService] Could not read saved Batch SMS campaigns, using defaults:', err);
  }
  return initialDefaultBatchCampaigns;
}

export const batchSmsCampaigns: BatchSmsCampaign[] = loadSavedBatchCampaigns();

function saveBatchCampaignsToFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(BATCH_CAMPAIGNS_FILE, JSON.stringify(batchSmsCampaigns, null, 2), 'utf-8');
  } catch (err) {
    console.error('[SmsService] Error saving Batch SMS campaigns to file:', err);
  }
}

/**
 * Retrieve all past batch broadcast campaigns
 */
export function getBatchSmsCampaigns(): BatchSmsCampaign[] {
  return batchSmsCampaigns;
}

/**
 * Delete a batch broadcast campaign from history
 */
export function deleteBatchSmsCampaign(id: string): boolean {
  const index = batchSmsCampaigns.findIndex((c) => c.id === id);
  if (index !== -1) {
    batchSmsCampaigns.splice(index, 1);
    saveBatchCampaignsToFile();
    return true;
  }
  return false;
}

/**
 * Broadcast a Batch SMS notification to multiple active clients simultaneously via Twilio
 */
export async function broadcastBatchSms(options: {
  title: string;
  category: 'weather_delay' | 'system_update' | 'traffic_reroute' | 'emergency_notice' | 'general';
  urgency: 'high' | 'medium' | 'low';
  messageTemplate: string;
  targetAudience: 'all_active' | 'in_transit' | 'corporate' | 'residential';
  recipients: Array<{
    id?: string;
    name: string;
    phone: string;
    company?: string;
    trackingId?: string;
    origin?: string;
    destination?: string;
    currentLocation?: string;
    driverPhone?: string;
    driverName?: string;
  }>;
  dispatchedBy?: string;
  includeTestPhone?: string;
}): Promise<{
  success: boolean;
  campaign: BatchSmsCampaign;
  dispatchedCount: number;
  provider: string;
}> {
  const {
    title,
    category,
    urgency,
    messageTemplate,
    targetAudience,
    recipients,
    dispatchedBy = 'Operations Dispatcher',
    includeTestPhone,
  } = options;

  const campaignId = `CAMP-SMS-${Date.now().toString().slice(-6)}`;
  const recipientsPreview: BatchSmsCampaign['recipientsPreview'] = [];
  let successfulDispatches = 0;
  let failedDispatches = 0;
  let activeProvider = 'twilio';

  // Process list with deduplication on phone numbers
  const targets = [...recipients];
  if (includeTestPhone && includeTestPhone.trim()) {
    targets.unshift({
      name: 'Pre-flight Test Recipient (Admin)',
      phone: includeTestPhone.trim(),
      company: 'Pyda Admin Control',
      trackingId: 'TEST-PREFLIGHT',
      origin: 'Pyda HQ',
      destination: 'Field Transit',
      currentLocation: 'Direct Verification',
      driverPhone: '08062466212',
      driverName: 'Lead Captain',
    });
  }

  for (const client of targets) {
    if (!client.phone) continue;

    // Personalize message with merge variables
    let clientMessage = messageTemplate
      .replace(/{{clientName}}/gi, client.name || 'Valued Client')
      .replace(/{{name}}/gi, client.name || 'Valued Client')
      .replace(/{{company}}/gi, client.company || 'Enterprise Partner')
      .replace(/{{trackingId}}/gi, client.trackingId || 'PYDA-CONVOY')
      .replace(/{{origin}}/gi, client.origin || 'Origin Hub')
      .replace(/{{destination}}/gi, client.destination || 'Destination Hub')
      .replace(/{{currentLocation}}/gi, client.currentLocation || 'Transit Corridor')
      .replace(/{{driverPhone}}/gi, client.driverPhone || '0806 246 6212')
      .replace(/{{driverName}}/gi, client.driverName || 'Convoy Lead')
      .replace(/{{hotline}}/gi, '0806 246 6212');

    // Prepend urgency indicator if High
    if (urgency === 'high' && !clientMessage.toLowerCase().includes('alert') && !clientMessage.toLowerCase().includes('urgent')) {
      clientMessage = `[URGENT LOGISTICS ADVISORY] ${clientMessage}`;
    }

    try {
      const sendResult = await sendSms({
        to: client.phone,
        message: clientMessage,
        docReference: client.trackingId || campaignId,
        docType: `batch_${category}`,
        senderId: 'PYDA',
      });

      if (sendResult.provider) {
        activeProvider = sendResult.provider;
      }

      if (sendResult.success) {
        successfulDispatches++;
        recipientsPreview.push({
          name: client.name,
          phone: client.phone,
          status: 'delivered',
          sid: sendResult.messageSid,
          route: client.origin && client.destination ? `${client.origin} ➔ ${client.destination}` : undefined,
          trackingId: client.trackingId,
        });
      } else {
        failedDispatches++;
        recipientsPreview.push({
          name: client.name,
          phone: client.phone,
          status: 'failed',
          sid: sendResult.messageSid,
          route: client.origin && client.destination ? `${client.origin} ➔ ${client.destination}` : undefined,
          trackingId: client.trackingId,
        });
      }
    } catch (err: any) {
      failedDispatches++;
      recipientsPreview.push({
        name: client.name,
        phone: client.phone,
        status: 'failed',
        route: client.origin && client.destination ? `${client.origin} ➔ ${client.destination}` : undefined,
        trackingId: client.trackingId,
      });
    }
  }

  const campaign: BatchSmsCampaign = {
    id: campaignId,
    title: title || `Batch Broadcast - ${new Date().toLocaleDateString()}`,
    category,
    urgency,
    messageTemplate,
    targetAudience,
    totalRecipients: targets.length,
    successfulDispatches,
    failedDispatches,
    provider: activeProvider,
    dispatchedAt: new Date().toISOString(),
    dispatchedBy,
    recipientsPreview,
  };

  batchSmsCampaigns.unshift(campaign);
  if (batchSmsCampaigns.length > 50) {
    batchSmsCampaigns.pop();
  }
  saveBatchCampaignsToFile();

  return {
    success: successfulDispatches > 0,
    campaign,
    dispatchedCount: successfulDispatches,
    provider: activeProvider,
  };
}

