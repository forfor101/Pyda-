import fs from "fs";
import path from "path";
import { sendEmail, getEmailProviderConfig } from "./emailService.ts";

export interface MaintenanceMilestoneAlert {
  id: string;
  truckId: string;
  unitCode: string;
  plateNumber: string;
  makeModel: string;
  tonnage: string;
  fleetOwnerName: string;
  recipientEmail: string;
  recipientPhone: string;
  currentOdometerKm: number;
  milestoneTargetKm: number;
  kmRemaining: number;
  urgency: 'critical_overdue' | 'due_soon' | 'upcoming_milestone';
  serviceType: string;
  serviceCode: string;
  scheduledDate: string;
  workshopFacility: string;
  workshopCity: string;
  leadTechnician: string;
  technicianPhone: string;
  oilPressureSummary: string;
  tpmsSummary: string;
  status: 'delivered' | 'sent' | 'simulated' | 'failed';
  dispatchedAt: string;
  messageId?: string;
  error?: string;
}

export interface MaintenanceSettings {
  autoAlertsEnabled: boolean;
  thresholdKm: number; // e.g. 500 km before milestone
  defaultOwnerEmail: string;
  includeHealthSnapshot: boolean;
  alertIntervalHours: number;
  lastAutomaticScanAt?: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const ALERTS_LOG_FILE = path.join(DATA_DIR, "maintenance-alert-logs.json");
const SETTINGS_FILE = path.join(DATA_DIR, "maintenance-alert-settings.json");

// Default initial settings
const defaultSettings: MaintenanceSettings = {
  autoAlertsEnabled: true,
  thresholdKm: 500,
  defaultOwnerEmail: process.env.ADMIN_NOTIFICATION_EMAIL || "yerimaforfor@gmail.com",
  includeHealthSnapshot: true,
  alertIntervalHours: 24,
  lastAutomaticScanAt: new Date().toISOString(),
};

// Seed baseline mock truck telemetry for milestone tracking
export const MONITORED_FLEET_UNITS = [
  {
    truckId: 'health-fl-108',
    unitCode: 'MTM-FL-108',
    plateNumber: 'KJA-842-XB (Lagos)',
    makeModel: 'Mercedes-Benz Actros 3340 (6x4)',
    tonnage: '30 Tons Heavy Trailer',
    fleetOwnerName: 'Chief Usman Kabir (Pyda Premier Partner)',
    ownerEmail: process.env.ADMIN_NOTIFICATION_EMAIL || 'yerimaforfor@gmail.com',
    ownerPhone: '0803 624 9911',
    currentOdometerKm: 214580,
    milestoneTargetKm: 215000,
    kmRemaining: 420,
    serviceType: 'Service B: 15,000 km Brake Overhaul, Air Dryer & Synthetic Lube Service',
    serviceCode: 'PYDA-SVC-B-08',
    scheduledDate: 'September 24, 2026',
    workshopFacility: 'Pyda Central Heavy Maintenance Bay, Idu Industrial Yard',
    workshopCity: 'Abuja (Idu Industrial)',
    leadTechnician: 'Engr. Babatunde Lawal (Master Heavy Diesel Diagnostician)',
    technicianPhone: '0806 246 6212',
    oilPressureSummary: '27.4 PSI (Low Galley Pressure Advisory under load)',
    tpmsSummary: 'Drive Axle 1 Inner Right: 84 PSI (Slow Bead Leak Flagged)',
  },
  {
    truckId: 'health-rig-08',
    unitCode: 'MTM-RIG-08',
    plateNumber: 'RIV-901-PH (Rivers)',
    makeModel: 'Mack Granite 6x4 Heavy Lowbed',
    tonnage: '25 Tons Heavy Rig',
    fleetOwnerName: 'Mr. Abubakar Umoru (Trans-Amadi Fleet Partner)',
    ownerEmail: process.env.ADMIN_NOTIFICATION_EMAIL || 'yerimaforfor@gmail.com',
    ownerPhone: '0806 246 6212',
    currentOdometerKm: 189000,
    milestoneTargetKm: 188940,
    kmRemaining: -60, // Overdue by 60 KM
    serviceType: 'EMERGENCY SERVICE: Low Oil Pressure Diagnostic & Crankcase Flush',
    serviceCode: 'PYDA-EMERGENCY-01',
    scheduledDate: 'IMMEDIATE DISPATCH',
    workshopFacility: 'South-West Mobile Fleet Rapid Intervention Unit #2',
    workshopCity: 'Lagos (Amuwo Odofin) / Ore Corridor',
    leadTechnician: 'Engr. Taiwo Adeleke (Mobile Intervention Unit Lead)',
    technicianPhone: '0806 246 6212',
    oilPressureSummary: '18.2 PSI (CRITICAL: 60% Torque Derate Active)',
    tpmsSummary: 'Trailer Steer Right: 96 PSI / 78°C (Thermal Warning)',
  },
  {
    truckId: 'health-hvy-202',
    unitCode: 'MTM-HVY-202',
    plateNumber: 'KAN-312-TY (Kano)',
    makeModel: 'DAF XF 480 Super Space Cab (40T)',
    tonnage: '40 Tons Heavy Hauler',
    fleetOwnerName: 'Alhaji Aliyu Garba & Sons Ltd',
    ownerEmail: process.env.ADMIN_NOTIFICATION_EMAIL || 'yerimaforfor@gmail.com',
    ownerPhone: '0802 560 9972',
    currentOdometerKm: 341200,
    milestoneTargetKm: 342620,
    kmRemaining: 1420,
    serviceType: 'Service A: 5,000 km Trans-Sahel High-Mileage Lube & Intercooler Torque',
    serviceCode: 'PYDA-SVC-A-15',
    scheduledDate: 'September 29, 2026',
    workshopFacility: 'Trans-Sahel & Northern Railhead Terminal Workshop',
    workshopCity: 'Kano (Sharada Phase 2)',
    leadTechnician: 'Engr. Mohammed Sanusi',
    technicianPhone: '0802 560 9972',
    oilPressureSummary: '41.2 PSI (Nominal Operating Envelope)',
    tpmsSummary: '10/10 Tires Optimal (110 PSI Steer / Drive Duals)',
  },
  {
    truckId: 'health-corp-04',
    unitCode: 'MTM-CORP-04',
    plateNumber: 'ABJ-719-LK (Abuja)',
    makeModel: 'MAN TGL 12.220 Air-Ride Box',
    tonnage: '10 Tons Medium Box Hauler',
    fleetOwnerName: 'Mr. Sabo Jashua (Corporate Logistics Investor)',
    ownerEmail: process.env.ADMIN_NOTIFICATION_EMAIL || 'yerimaforfor@gmail.com',
    ownerPhone: '0806 246 6212',
    currentOdometerKm: 98400,
    milestoneTargetKm: 101520,
    kmRemaining: 3120,
    serviceType: 'Service A: 5,000 km Preventative Inspection, Air Suspension & Tail-Lift Test',
    serviceCode: 'PYDA-SVC-A-12',
    scheduledDate: 'October 12, 2026',
    workshopFacility: 'Pyda Central Heavy Maintenance Bay, Idu Industrial Yard',
    workshopCity: 'Abuja (Idu Industrial)',
    leadTechnician: 'Engr. Danjuma Bello',
    technicianPhone: '0806 246 6212',
    oilPressureSummary: '44.8 PSI (Optimal Main Galley Pressure)',
    tpmsSummary: '6/6 Tires Optimal (110 PSI Air-Ride)',
  }
];

function loadSavedAlertLogs(): MaintenanceMilestoneAlert[] {
  try {
    if (fs.existsSync(ALERTS_LOG_FILE)) {
      const content = fs.readFileSync(ALERTS_LOG_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn("[MaintenanceAlerts] Could not read alert logs file, starting fresh:", err);
  }
  return [];
}

function saveAlertLogsToFile(logs: MaintenanceMilestoneAlert[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(ALERTS_LOG_FILE, JSON.stringify(logs.slice(0, 200), null, 2), "utf-8");
  } catch (err) {
    console.error("[MaintenanceAlerts] Failed to save alert logs:", err);
  }
}

export function loadMaintenanceSettings(): MaintenanceSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const content = fs.readFileSync(SETTINGS_FILE, "utf-8");
      const parsed = JSON.parse(content);
      return { ...defaultSettings, ...parsed };
    }
  } catch (err) {
    console.warn("[MaintenanceAlerts] Could not read settings file, using defaults:", err);
  }
  return defaultSettings;
}

export function saveMaintenanceSettings(settings: Partial<MaintenanceSettings>): MaintenanceSettings {
  const current = loadMaintenanceSettings();
  const updated = { ...current, ...settings };
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), "utf-8");
  } catch (err) {
    console.error("[MaintenanceAlerts] Failed to save settings:", err);
  }
  return updated;
}

// In-memory logs
export let maintenanceAlertLogs: MaintenanceMilestoneAlert[] = loadSavedAlertLogs();

// Generate HTML email template for Maintenance Milestone
export function generateMaintenanceMilestoneEmailHtml(alert: MaintenanceMilestoneAlert): string {
  const isOverdue = alert.urgency === 'critical_overdue';
  const isDueSoon = alert.urgency === 'due_soon';

  const accentColor = isOverdue ? '#ef4444' : isDueSoon ? '#f59e0b' : '#10b981';
  const badgeText = isOverdue ? 'CRITICAL MILEAGE OVERDUE ALERT' : isDueSoon ? 'SCHEDULED MAINTENANCE MILESTONE DUE' : 'UPCOMING FLEET MILESTONE NOTICE';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Maintenance Milestone Alert - ${alert.unitCode}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #090e1a; margin: 0; padding: 20px 10px; color: #1e293b; }
    .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 35px rgba(0,0,0,0.4); border: 1px solid #e2e8f0; }
    .header { background: #0f172a; padding: 30px 24px; text-align: center; border-bottom: 5px solid ${accentColor}; }
    .logo { color: #f59e0b; font-size: 20px; font-weight: 900; letter-spacing: 1.5px; margin: 0; text-transform: uppercase; }
    .sub-logo { color: #94a3b8; font-size: 11px; margin-top: 5px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
    
    .badge-bar { background: ${accentColor}; color: #ffffff; text-align: center; font-size: 11px; font-weight: 900; letter-spacing: 1.5px; padding: 8px 16px; text-transform: uppercase; }
    
    .content { padding: 28px 24px; }
    .greeting { font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 12px; }
    .intro-text { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px; }
    
    .stat-grid { display: table; width: 100%; margin: 18px 0; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; border-collapse: separate; overflow: hidden; }
    .stat-row { display: table-row; }
    .stat-cell { display: table-cell; padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; vertical-align: middle; }
    .stat-cell.header-cell { width: 40%; font-weight: 700; color: #64748b; background: #f1f5f9; }
    .stat-cell.value-cell { font-weight: 800; color: #0f172a; font-family: monospace, sans-serif; font-size: 13px; }
    
    .milestone-highlight-box { background: ${isOverdue ? '#fef2f2' : '#fffbeb'}; border-left: 5px solid ${accentColor}; padding: 18px; margin: 20px 0; border-radius: 0 12px 12px 0; }
    .milestone-title { font-size: 14px; font-weight: 900; color: ${accentColor}; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px; }
    .milestone-desc { font-size: 13px; color: #334155; line-height: 1.5; margin: 0; }
    
    .telemetry-box { background: #0f172a; color: #ffffff; border-radius: 12px; padding: 16px; margin: 20px 0; }
    .telemetry-title { font-size: 12px; font-weight: 800; color: #f59e0b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
    .telemetry-item { font-size: 12px; margin-bottom: 6px; color: #cbd5e1; }
    .telemetry-item strong { color: #ffffff; }

    .workshop-card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 20px 0; }
    .workshop-title { font-size: 13px; font-weight: 800; color: #166534; margin-bottom: 6px; }
    .workshop-text { font-size: 12px; color: #15803d; line-height: 1.5; margin: 0; }

    .cta-btn { display: block; text-align: center; background: #f59e0b; color: #0f172a; font-weight: 900; font-size: 14px; text-decoration: none; padding: 14px 24px; border-radius: 10px; margin: 24px 0 12px 0; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3); }
    .cta-subtext { text-align: center; font-size: 11px; color: #64748b; margin-top: 0; }
    
    .guarantee-badge { background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 12px; text-align: center; font-size: 11px; color: #475569; font-weight: 600; margin-top: 20px; }

    .footer { background: #0f172a; padding: 24px; text-align: center; font-size: 11px; color: #64748b; line-height: 1.6; border-top: 1px solid #1e293b; }
    .footer strong { color: #cbd5e1; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo">PYDA MOVERS & LOGISTICS</h1>
      <div class="sub-logo">Fleet Engineering & Automated Telematics Directorate</div>
    </div>

    <div class="badge-bar">
      ${badgeText}
    </div>

    <div class="content">
      <h2 class="greeting">Attention: ${alert.fleetOwnerName},</h2>
      <p class="intro-text">
        This is an automated telematics notification regarding your commercial truck registered under Pyda Fleet Management. Real-time CAN-bus odometer telemetry confirms that your vehicle has reached a critical maintenance milestone threshold.
      </p>

      <div class="milestone-highlight-box">
        <div class="milestone-title">${alert.serviceType}</div>
        <p class="milestone-desc">
          <strong>Service Code:</strong> ${alert.serviceCode}<br>
          <strong>Mileage Delta:</strong> ${alert.kmRemaining <= 0 ? `<span style="color: #ef4444; font-weight: 900;">OVERDUE BY ${Math.abs(alert.kmRemaining)} KM</span>` : `<span style="color: #166534; font-weight: 900;">${alert.kmRemaining} KM REMAINING</span> (Target: ${alert.milestoneTargetKm.toLocaleString()} KM)`}<br>
          <strong>Scheduled Pitstop Date:</strong> ${alert.scheduledDate}
        </p>
      </div>

      <div class="stat-grid">
        <div class="stat-row">
          <div class="stat-cell header-cell">Vehicle Unit Code</div>
          <div class="stat-cell value-cell">${alert.unitCode}</div>
        </div>
        <div class="stat-row">
          <div class="stat-cell header-cell">Registration Plate</div>
          <div class="stat-cell value-cell">${alert.plateNumber}</div>
        </div>
        <div class="stat-row">
          <div class="stat-cell header-cell">Chassis Make & Model</div>
          <div class="stat-cell value-cell">${alert.makeModel} (${alert.tonnage})</div>
        </div>
        <div class="stat-row">
          <div class="stat-cell header-cell">Live Odometer Reading</div>
          <div class="stat-cell value-cell" style="color: #f59e0b; font-size: 14px;">${alert.currentOdometerKm.toLocaleString()} KM</div>
        </div>
        <div class="stat-row">
          <div class="stat-cell header-cell">Target Milestone Interval</div>
          <div class="stat-cell value-cell">${alert.milestoneTargetKm.toLocaleString()} KM</div>
        </div>
      </div>

      <div class="telemetry-box">
        <div class="telemetry-title">📡 Live CAN-Bus Diagnostic Health Snapshot</div>
        <div class="telemetry-item">• <strong>Oil Galley Telemetry:</strong> ${alert.oilPressureSummary}</div>
        <div class="telemetry-item">• <strong>TPMS Tire Pressure Sensor:</strong> ${alert.tpmsSummary}</div>
        <div class="telemetry-item">• <strong>FRSC AI Speed Limiter:</strong> Active (80 km/h Statutory Highway Ceiling)</div>
      </div>

      <div class="workshop-card">
        <div class="workshop-title">📍 Authorized Pyda Workshop Facility Bay</div>
        <p class="workshop-text">
          <strong>Facility:</strong> ${alert.workshopFacility}<br>
          <strong>Region / City:</strong> ${alert.workshopCity}<br>
          <strong>Lead Master Diagnostician:</strong> ${alert.leadTechnician}<br>
          <strong>Direct Bay Line:</strong> ${alert.technicianPhone}
        </p>
      </div>

      <div class="guarantee-badge">
        🛡️ <strong>100% Pyda Fleet Agreement Coverage:</strong> All synthetic engine flushes, OEM filters, air dryer cartridges, and brake relinings are fully covered under your Master Management Contract with <strong>ZERO investor out-of-pocket charges</strong>.
      </div>

      <a href="https://pydamovers.com/#vehicle-health-monitor" class="cta-btn">
        🚀 View Live Telematics in Vehicle Health Monitor
      </a>
      <p class="cta-subtext">Access real-time OBD diagnostic trouble codes, tire pressures, and confirm workshop bay intake.</p>
    </div>

    <div class="footer">
      <div><strong>Pyda Movers & Logistics Ltd — Fleet Telematics Directorate</strong></div>
      <div>Abuja Central Bay: Suite A204 Citygate Plaza, CBD & Idu Industrial Yard | Lagos Maritime Depot: Old Ojo Rd Alakija</div>
      <div>Technical Escalation Hotline: +234 806 246 6212 | Email: ${alert.recipientEmail}</div>
      <div style="margin-top: 8px; color: #475569;">Ref: ${alert.id} • Generated via Automated CAN-Bus Daemon</div>
    </div>
  </div>
</body>
</html>
  `;
}

// Trigger / Dispatch Milestone Alert for a single truck
export async function triggerMilestoneAlert(params: {
  truckId: string;
  recipientEmail?: string;
  customOdometerKm?: number;
}): Promise<{ success: boolean; alert: MaintenanceMilestoneAlert; messageId?: string; error?: string }> {
  const truck = MONITORED_FLEET_UNITS.find(t => t.truckId === params.truckId) || MONITORED_FLEET_UNITS[0];
  const settings = loadMaintenanceSettings();

  const currentKm = params.customOdometerKm !== undefined ? params.customOdometerKm : truck.currentOdometerKm;
  const kmRemaining = truck.milestoneTargetKm - currentKm;

  let urgency: 'critical_overdue' | 'due_soon' | 'upcoming_milestone' = 'upcoming_milestone';
  if (kmRemaining <= 0) {
    urgency = 'critical_overdue';
  } else if (kmRemaining <= (settings.thresholdKm || 500)) {
    urgency = 'due_soon';
  }

  const toEmail = params.recipientEmail || settings.defaultOwnerEmail || truck.ownerEmail || 'yerimaforfor@gmail.com';
  const alertId = `MAINT-ALERT-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const alertRecord: MaintenanceMilestoneAlert = {
    id: alertId,
    truckId: truck.truckId,
    unitCode: truck.unitCode,
    plateNumber: truck.plateNumber,
    makeModel: truck.makeModel,
    tonnage: truck.tonnage,
    fleetOwnerName: truck.fleetOwnerName,
    recipientEmail: toEmail,
    recipientPhone: truck.ownerPhone,
    currentOdometerKm: currentKm,
    milestoneTargetKm: truck.milestoneTargetKm,
    kmRemaining,
    urgency,
    serviceType: truck.serviceType,
    serviceCode: truck.serviceCode,
    scheduledDate: truck.scheduledDate,
    workshopFacility: truck.workshopFacility,
    workshopCity: truck.workshopCity,
    leadTechnician: truck.leadTechnician,
    technicianPhone: truck.technicianPhone,
    oilPressureSummary: truck.oilPressureSummary,
    tpmsSummary: truck.tpmsSummary,
    status: 'sent',
    dispatchedAt: new Date().toISOString(),
  };

  const subjectPrefix = urgency === 'critical_overdue' ? '🚨 [CRITICAL OVERDUE]' : urgency === 'due_soon' ? '⚠️ [MAINTENANCE DUE]' : '📋 [FLEET MILESTONE]';
  const subject = `${subjectPrefix} Maintenance Milestone Alert: ${truck.unitCode} (${currentKm.toLocaleString()} KM / Target ${truck.milestoneTargetKm.toLocaleString()} KM) | Pyda Fleet`;

  const html = generateMaintenanceMilestoneEmailHtml(alertRecord);
  const text = `Pyda Fleet Maintenance Milestone Alert\nVehicle: ${truck.unitCode} (${truck.plateNumber})\nOdometer: ${currentKm.toLocaleString()} KM (Target: ${truck.milestoneTargetKm.toLocaleString()} KM, ${kmRemaining <= 0 ? `Overdue by ${Math.abs(kmRemaining)} KM` : `${kmRemaining} KM remaining`})\nService: ${truck.serviceType}\nWorkshop: ${truck.workshopFacility}\nHotline: ${truck.technicianPhone}`;

  try {
    const sendResult = await sendEmail({
      to: toEmail,
      subject,
      html,
      text,
    });

    alertRecord.status = sendResult.success ? 'delivered' : 'simulated';
    alertRecord.messageId = sendResult.messageId;

    // Record to persistent storage
    maintenanceAlertLogs.unshift(alertRecord);
    saveAlertLogsToFile(maintenanceAlertLogs);

    return {
      success: true,
      alert: alertRecord,
      messageId: sendResult.messageId,
    };
  } catch (err: any) {
    console.error("[MaintenanceAlerts] Dispatch error:", err);
    alertRecord.status = 'failed';
    alertRecord.error = err.message;
    maintenanceAlertLogs.unshift(alertRecord);
    saveAlertLogsToFile(maintenanceAlertLogs);

    return {
      success: false,
      alert: alertRecord,
      error: err.message,
    };
  }
}

// Automated Scan Daemon: Inspects all monitored units and triggers alerts for due/overdue milestones
export async function runAutomatedMaintenanceMilestoneCheck(): Promise<{
  scannedCount: number;
  alertsTriggered: number;
  results: Array<{ unitCode: string; kmRemaining: number; triggered: boolean; message?: string }>;
}> {
  const settings = loadMaintenanceSettings();
  const threshold = settings.thresholdKm || 500;
  const results: Array<{ unitCode: string; kmRemaining: number; triggered: boolean; message?: string }> = [];
  let triggeredCount = 0;

  for (const truck of MONITORED_FLEET_UNITS) {
    const kmRemaining = truck.milestoneTargetKm - truck.currentOdometerKm;
    const isDue = kmRemaining <= threshold;

    if (isDue) {
      const dispatch = await triggerMilestoneAlert({
        truckId: truck.truckId,
        recipientEmail: settings.defaultOwnerEmail,
      });

      if (dispatch.success) {
        triggeredCount++;
        results.push({
          unitCode: truck.unitCode,
          kmRemaining,
          triggered: true,
          message: `Alert dispatched (${kmRemaining <= 0 ? 'Overdue' : 'Due Soon'})`,
        });
      } else {
        results.push({
          unitCode: truck.unitCode,
          kmRemaining,
          triggered: false,
          message: dispatch.error || 'Failed to dispatch',
        });
      }
    } else {
      results.push({
        unitCode: truck.unitCode,
        kmRemaining,
        triggered: false,
        message: `Milestone is in ${kmRemaining} KM (Beyond ${threshold} KM threshold)`,
      });
    }
  }

  saveMaintenanceSettings({ lastAutomaticScanAt: new Date().toISOString() });

  return {
    scannedCount: MONITORED_FLEET_UNITS.length,
    alertsTriggered: triggeredCount,
    results,
  };
}
