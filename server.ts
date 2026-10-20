import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { 
  sendQuoteConfirmationEmail, 
  sendAdminQuoteAlert, 
  sendContactConfirmationEmail, 
  sendAdminContactAlert, 
  sendJobApplicationConfirmationEmail,
  sendEmail,
  emailDispatchLogs, 
  getEmailProviderConfig,
  setRuntimeEmailProvider,
  generateQuoteConfirmationEmailHtml,
  generateContactReceiptEmailHtml,
  generateJobApplicationReceiptEmailHtml
} from "./server/emailService.ts";
import {
  subscribeToNewsletter,
  getAllSubscribers,
  unsubscribeFromNewsletter,
  deleteSubscriber,
  getNewsletterStats,
  getMailchimpConfig,
  testMailchimpApi,
  broadcastBulkEmailCampaign,
  sendTestNewsletterEmail,
  getAllCampaigns,
  deleteCampaign
} from "./server/newsletterService.ts";
import {
  recordSecurityEvent,
  getSecurityAuditLogs,
  getSecurityAuditStats,
  clearSecurityAuditLogs,
  exportSecurityLogsCsv
} from "./server/securityService.ts";
import {
  generateSitemapXml,
  generateRobotsTxt,
  writeSitemapFiles,
  getSitemapSummary,
  SITE_ROUTES
} from "./server/sitemapService.ts";
import {
  sendSms,
  sendInsuranceCertificateSms,
  sendShipmentStatusSms,
  getSmsProviderConfig,
  getSmsDispatchLogs,
  clearSmsLogs,
  broadcastBatchSms,
  getBatchSmsCampaigns,
  deleteBatchSmsCampaign
} from "./server/smsService.ts";
import {
  triggerMilestoneAlert,
  runAutomatedMaintenanceMilestoneCheck,
  maintenanceAlertLogs,
  loadMaintenanceSettings,
  saveMaintenanceSettings,
  MONITORED_FLEET_UNITS,
  generateMaintenanceMilestoneEmailHtml
} from "./server/maintenanceAlertService.ts";
import {
  analyzeCargoImagesWithGeminiVision,
  saveInspectionReport,
  getAllInspectionReports,
  getInspectionReportById,
  deleteInspectionReport
} from "./server/cargoInspectionService.ts";
import {
  generateSmartPackingWithGemini,
  getAllPackingPlans,
  getPackingPlanById,
  savePackingPlan,
  calculateRuleBasedPackingPlan,
  calculatePackingDensityAnalysis
} from "./server/smartPackingService.ts";
import {
  calculateBackendQuote,
  getPricingBenchmarks,
  CURRENT_PRICING_RULES,
  type QuoteCalculationRequest
} from "./server/pricingService.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure storage directory exists
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error("Could not create data dir:", err);
  }
}

const CMS_FILE_PATH = path.join(DATA_DIR, "cms-persistence.json");
const LEADS_FILE_PATH = path.join(DATA_DIR, "leads-mock-db.json");

function getLeadsDatabase(): any[] {
  try {
    if (fs.existsSync(LEADS_FILE_PATH)) {
      const raw = fs.readFileSync(LEADS_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn("[Leads DB Read Warning]:", err);
  }
  return [];
}

function saveLeadsDatabase(leads: any[]) {
  try {
    fs.writeFileSync(LEADS_FILE_PATH, JSON.stringify(leads, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Leads DB Save Warning]:", err);
  }
}

// In-memory quotes and contact messages storage for demo persistence
const quotesDatabase: any[] = [
  {
    id: 'QUOTE-77102',
    serviceType: 'corporate',
    fullName: 'Chief Aliu Danjuma',
    companyName: 'Sahara Logistics Ltd',
    email: 'aliu@saharalogistics.ng',
    phone: '08062466212',
    originCity: 'Lagos (Island/Mainland/Satellite)',
    destinationCity: 'Abuja (FCT)',
    movingDate: '2026-08-25',
    propertySize: '1500 sqm Office',
    needsPacking: true,
    needsStorage: false,
    needsInsurance: true,
    estimatedCostNaira: 1850000,
    status: 'approved',
    createdAt: new Date().toISOString(),
  }
];

const contactMessages: any[] = [];

const jobApplicationsDatabase: any[] = [
  {
    id: 'APP-90142',
    jobId: 'job-driver-heavy-01',
    jobTitle: 'Heavy-Duty Interstate Truck Driver (Class G)',
    fullName: 'Musa Abdullahi Garba',
    email: 'musa.garba84@gmail.com',
    phone: '08034567890',
    cityState: 'Abuja FCT (Kubwa)',
    licenseClass: 'Class G (Articulated / Heavy Vehicle)',
    yearsExperience: '5+ Years',
    currentEmployer: 'Dangote Transport & Logistics (Former)',
    availableStartDate: '2026-09-01',
    hasGuarantor: true,
    resumeOrBioNotes: 'Over 6 years accident-free interstate heavy freight driving between Lagos-Kano and Abuja-Port Harcourt. Familiar with satellite speed limiters and electronic logbooks.',
    status: 'interview_scheduled',
    appliedAt: '2026-08-14T09:30:00Z',
    adminNotes: 'Excellent driving record. Scheduled for physical verification & road test at Abuja HQ.',
  },
  {
    id: 'APP-90143',
    jobId: 'job-warehouse-forklift-03',
    jobTitle: 'Warehouse Cargo & Forklift Operations Specialist',
    fullName: 'Emeka Christian Okon',
    email: 'emeka.okon.logistics@yahoo.com',
    phone: '08129876543',
    cityState: 'Lagos State (Festac Town / Alakija)',
    licenseClass: 'Certified Forklift Operator (Toyota & Linde)',
    yearsExperience: '3-5 Years',
    currentEmployer: 'Apapa Container Freight Station',
    availableStartDate: 'Immediate',
    hasGuarantor: true,
    resumeOrBioNotes: 'Experienced in 40ft container de-stuffing, pallet racking up to 6 tiers, and barcode inventory scanning with zero damage record.',
    status: 'under_review',
    appliedAt: '2026-08-15T14:15:00Z',
    adminNotes: 'Guarantor letters verified. Forklift license valid through 2028.',
  },
];

// Load persistent CMS data from disk if available
let serverCmsData: any = null;
if (fs.existsSync(CMS_FILE_PATH)) {
  try {
    const raw = fs.readFileSync(CMS_FILE_PATH, "utf-8");
    serverCmsData = JSON.parse(raw);
  } catch (e) {
    console.warn("Failed to load existing cms-persistence.json", e);
  }
}

function saveCmsToDisk(data: any) {
  try {
    fs.writeFileSync(CMS_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write CMS data to disk", err);
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Support up to 50MB for image data URLs / photo uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "online", 
      company: "Pyda Movers & Logistics",
      phones: ["08062466212", "08025609972"],
      offices: ["Abuja (Suite A204 Citygate Plaza)", "Lagos (374/376 Old Ojo Rd Alakija)"]
    });
  });

  // CMS API: Get current CMS configuration
  app.get("/api/cms", (req, res) => {
    res.json({ success: true, cms: serverCmsData });
  });

  // CMS API: Update/Save full CMS configuration
  app.put("/api/cms", (req, res) => {
    const { cms } = req.body;
    if (cms) {
      serverCmsData = cms;
      saveCmsToDisk(cms);
      return res.json({ 
        success: true, 
        message: "Site CMS settings saved & persisted to server disk.", 
        lastUpdated: new Date().toISOString() 
      });
    }
    res.status(400).json({ success: false, message: "No CMS data provided" });
  });

  // Media / Photo Upload endpoint
  app.post("/api/upload", (req, res) => {
    const { dataUrl, name, category, sizeFormatted } = req.body;
    if (!dataUrl) {
      return res.status(400).json({ success: false, message: "Missing image data" });
    }

    const newMedia = {
      id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name || `Photo-${Date.now()}`,
      url: dataUrl,
      category: category || 'general',
      sizeFormatted: sizeFormatted || 'Unknown',
      uploadedAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    };

    if (serverCmsData && Array.isArray(serverCmsData.mediaLibrary)) {
      serverCmsData.mediaLibrary.unshift(newMedia);
      saveCmsToDisk(serverCmsData);
    }

    res.status(201).json({ success: true, media: newMedia });
  });

  // ==========================================
  // DIGITAL CARGO INSPECTION & GEMINI VISION
  // ==========================================
  app.post("/api/cargo-inspection/analyze", async (req, res) => {
    try {
      const { photos, inspectionLocation, moveCategory } = req.body;
      if (!Array.isArray(photos) || photos.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: "Please provide at least one photo for cargo inspection analysis." 
        });
      }

      const result = await analyzeCargoImagesWithGeminiVision(photos, {
        inspectionLocation,
        moveCategory,
      });

      return res.json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      console.error("[API Cargo Inspection Error]:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to process cargo inspection",
      });
    }
  });

  app.post("/api/cargo-inspection/save", (req, res) => {
    try {
      const { report } = req.body;
      if (!report || !report.id) {
        return res.status(400).json({ success: false, message: "Valid inspection report required" });
      }
      const saved = saveInspectionReport(report);
      return res.json({ success: true, report: saved });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  app.get("/api/cargo-inspection/list", (req, res) => {
    try {
      const reports = getAllInspectionReports();
      return res.json({ success: true, reports });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  app.get("/api/cargo-inspection/:id", (req, res) => {
    try {
      const report = getInspectionReportById(req.params.id);
      if (!report) {
        return res.status(404).json({ success: false, message: "Inspection report not found" });
      }
      return res.json({ success: true, report });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  app.delete("/api/cargo-inspection/:id", (req, res) => {
    try {
      const deleted = deleteInspectionReport(req.params.id);
      return res.json({ success: deleted });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // ==========================================
  // SMART PACKING ASSISTANT (GEMINI AI ENGINE)
  // ==========================================
  app.post("/api/smart-packing/suggest", async (req, res) => {
    try {
      const { totalCbm, totalWeightKg, items, inspectionRefId, inspectionTitle, moveCategory, specialInstructions } = req.body;
      
      const plan = await generateSmartPackingWithGemini({
        totalCbm: typeof totalCbm === 'number' ? totalCbm : 3.5,
        totalWeightKg,
        inspectionRefId,
        inspectionTitle,
        items: Array.isArray(items) ? items : [],
        moveCategory,
        specialInstructions,
      });

      return res.json({
        success: true,
        plan,
      });
    } catch (error: any) {
      console.error("[API Smart Packing Suggestion Error]:", error);
      // Fallback rule-based packaging plan
      try {
        const fallbackPlan = calculateRuleBasedPackingPlan(req.body);
        return res.json({
          success: true,
          plan: fallbackPlan,
        });
      } catch (fallbackErr: any) {
        return res.status(500).json({
          success: false,
          message: error.message || "Failed to generate smart packing plan",
        });
      }
    }
  });

  app.post("/api/smart-packing/density-analysis", (req, res) => {
    try {
      const { totalCbm, boxes, items, appliedSwapIds } = req.body;
      const densityAnalysis = calculatePackingDensityAnalysis(
        typeof totalCbm === 'number' ? totalCbm : 4.5,
        Array.isArray(boxes) ? boxes : [],
        Array.isArray(items) ? items : [],
        Array.isArray(appliedSwapIds) ? appliedSwapIds : []
      );
      return res.json({ success: true, densityAnalysis });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post("/api/smart-packing/save", (req, res) => {
    try {
      const { plan } = req.body;
      if (!plan || !plan.id) {
        return res.status(400).json({ success: false, message: "Valid packing plan required" });
      }
      const saved = savePackingPlan(plan);
      return res.json({ success: true, plan: saved });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  app.get("/api/smart-packing/list", (req, res) => {
    try {
      const plans = getAllPackingPlans();
      return res.json({ success: true, plans });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  app.get("/api/smart-packing/:id", (req, res) => {
    try {
      const plan = getPackingPlanById(req.params.id);
      if (!plan) {
        return res.status(404).json({ success: false, message: "Packing plan not found" });
      }
      return res.json({ success: true, plan });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // Real-Time Dispatch Traffic API
  app.get("/api/dispatch/traffic/incidents", (req, res) => {
    try {
      return res.json({
        success: true,
        source: "External Traffic Gateway (CARTO / Overpass / Pyda Radar)",
        lastUpdated: new Date().toISOString(),
        incidents: [
          {
            id: 'inc-lagos-ibadan-01',
            type: 'roadworks',
            severity: 'heavy',
            title: 'Lagos-Ibadan Expressway Expansion',
            description: 'Bridge expansion joint rehabilitation around Kara Bridge & Berger corridor. Inward Lagos reduced to single dual lane.',
            corridor: 'Lagos-Ibadan Expressway (A1 Corridor)',
            coordinates: { lat: 6.6418, lng: 3.3915 },
            estimatedDelayMinutes: 45,
            speedLimitKmh: 100,
            currentFlowSpeedKmh: 18,
            alternativeRouteName: 'Ikorodu-Sagamu Hinterland Bypass',
            reportedAt: '12 mins ago',
            verifiedBy: 'Federal Road Safety Corps (FRSC) & Pyda Dispatch Radar',
          },
          {
            id: 'inc-lokoja-bridge-02',
            type: 'bridge_bottleneck',
            severity: 'moderate',
            title: 'Niger-Benue Confluence Weighbridge Queue',
            description: 'Heavy freight axle-load weight screening bottleneck prior to Jamata bridge crossing.',
            corridor: 'Lokoja-Abuja Highway (A2 Corridor)',
            coordinates: { lat: 7.8223, lng: 6.7612 },
            estimatedDelayMinutes: 25,
            speedLimitKmh: 80,
            currentFlowSpeedKmh: 32,
            alternativeRouteName: 'Federal Dual Express Priority Haul Lane',
            reportedAt: '24 mins ago',
            verifiedBy: 'Pyda Central Telematics Center',
          },
          {
            id: 'inc-apapa-port-03',
            type: 'port_queue',
            severity: 'critical',
            title: 'Apapa Marine & Tin Can Port Terminal Staging Backlog',
            description: 'Barge container offloading delay causing freight tractor queue on Mile 2 - Oshodi Expressway interchange.',
            corridor: 'Apapa-Oshodi Freight Corridor',
            coordinates: { lat: 6.4524, lng: 3.3392 },
            estimatedDelayMinutes: 90,
            speedLimitKmh: 60,
            currentFlowSpeedKmh: 8,
            alternativeRouteName: 'Amuwo Odofin Industrial Rail Link',
            reportedAt: '5 mins ago',
            verifiedBy: 'NPA Electronic Call-Up System & Satellite Telematics',
          },
          {
            id: 'inc-asaba-onitsha-04',
            type: 'congestion',
            severity: 'heavy',
            title: 'Second Niger Bridge Interchange Toll Slowdown',
            description: 'High commercial vehicle transit volume across Asaba-Onitsha commercial artery during morning peak.',
            corridor: 'Mid-West to South-East Artery (A232 Corridor)',
            coordinates: { lat: 6.1650, lng: 6.7537 },
            estimatedDelayMinutes: 35,
            speedLimitKmh: 90,
            currentFlowSpeedKmh: 24,
            alternativeRouteName: 'Second Niger Bridge Western Bypass Spur',
            reportedAt: '18 mins ago',
            verifiedBy: 'Pyda Regional Escort Unit',
          },
          {
            id: 'inc-kaduna-tollgate-05',
            type: 'accident',
            severity: 'moderate',
            title: 'Cleared Heavy Vehicle Breakdown at Kakau Gate',
            description: 'Disabled private tipper cleared onto emergency shoulder. Traffic resuming moderate transit speed.',
            corridor: 'Abuja-Kaduna Expressway',
            coordinates: { lat: 10.3805, lng: 7.3865 },
            estimatedDelayMinutes: 15,
            speedLimitKmh: 100,
            currentFlowSpeedKmh: 52,
            alternativeRouteName: 'Direct Main Express Carriageway',
            reportedAt: '35 mins ago',
            verifiedBy: 'Highway Safety Patrol Escort',
          },
        ],
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post("/api/dispatch/traffic/reroute", (req, res) => {
    try {
      const { truckId, incidentId } = req.body;
      return res.json({
        success: true,
        message: `Truck ${truckId} reroute dispatched successfully around bottleneck ${incidentId}.`,
        reroutedAt: new Date().toISOString(),
        timeSavedMinutes: 35,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // Pricing Configuration & Published Benchmarks
  app.get("/api/pricing/config", (_req, res) => {
    try {
      const config = getPricingBenchmarks();
      res.json({ success: true, ...config });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Calculate Moving Quote (Backend Pricing Formula Execution)
  app.post("/api/pricing/calculate", (req, res) => {
    try {
      const calculationRequest: QuoteCalculationRequest = req.body;
      const calculation = calculateBackendQuote(calculationRequest);
      res.json({
        success: true,
        calculation,
        rules: CURRENT_PRICING_RULES,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  });

  // Submit Quote (Automated Email Confirmation to Client + Admin Alert)
  app.post("/api/quote", async (req, res) => {
    const data = req.body;
    const newQuoteId = `QUOTE-${Math.floor(10000 + Math.random() * 90000)}`;

    // If logistics specs are present, run backend formula verification
    let verifiedCalculation = null;
    if (data.originStateId && data.originLgaName && data.destinationStateId && data.destinationLgaName) {
      try {
        verifiedCalculation = calculateBackendQuote({
          originStateId: data.originStateId,
          originLgaName: data.originLgaName,
          destinationStateId: data.destinationStateId,
          destinationLgaName: data.destinationLgaName,
          serviceType: data.serviceType || 'residential',
          propertySize: data.propertySize || '1-Bedroom Apartment Move',
          needsPacking: data.needsPacking,
          needsStorage: data.needsStorage,
          needsInsurance: data.needsInsurance,
          insuranceTier: data.insuranceTier,
          floorLevel: data.floorLevel,
          hasElevator: data.hasElevator,
          acUnitsCount: data.acUnitsCount,
          tvMountCount: data.tvMountCount,
          needsCleaning: data.needsCleaning,
        });
      } catch (err: any) {
        console.warn("[Server] Backend quote verification notice:", err.message);
      }
    }

    const newQuote = {
      ...data,
      id: newQuoteId,
      status: 'pending',
      fixedPriceGuaranteeApplied: true,
      fuelBenchmark: CURRENT_PRICING_RULES.fuelBenchmarks,
      verifiedCalculation,
      createdAt: new Date().toISOString(),
    };
    quotesDatabase.unshift(newQuote);

    // Automated client confirmation email dispatch
    let emailResult: any = { success: false, messageId: null };
    if (newQuote.email) {
      try {
        emailResult = await sendQuoteConfirmationEmail(newQuote);
        // Also dispatch admin notification
        sendAdminQuoteAlert(newQuote).catch((e) => console.warn("Admin quote alert error:", e.message));
      } catch (err: any) {
        console.error("[Server] Automated quote email dispatch error:", err.message);
      }
    }

    res.status(201).json({
      success: true,
      message: "Quote request submitted successfully. A formal confirmation email with your quote breakdown has been dispatched.",
      quote: newQuote,
      emailConfirmation: {
        sent: emailResult.success,
        recipient: newQuote.email,
        messageId: emailResult.messageId,
        provider: emailResult.provider,
      },
    });
  });

  // Get Quotes list
  app.get("/api/quotes", (req, res) => {
    res.json({ quotes: quotesDatabase });
  });

  // Update Quote Status
  app.patch("/api/quotes/:id", (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;
    const quote = quotesDatabase.find((q) => q.id === id);
    if (quote) {
      if (status) quote.status = status;
      if (notes !== undefined) quote.adminNotes = notes;
      quote.updatedAt = new Date().toISOString();
      return res.json({ success: true, quote });
    }
    return res.status(404).json({ success: false, message: "Quote not found" });
  });

  // Contact Message endpoint (Automated Email Receipt to Client + Admin Alert)
  app.post("/api/contact", async (req, res) => {
    const { name, email, phone, subject, message } = req.body;
    const newMsg = {
      id: `MSG-${Date.now()}`,
      name,
      email,
      phone,
      subject,
      message,
      receivedAt: new Date().toISOString(),
    };
    contactMessages.unshift(newMsg);

    // Automated client confirmation email
    let emailResult: any = { success: false, messageId: null };
    if (email) {
      try {
        emailResult = await sendContactConfirmationEmail(newMsg);
        // Admin alert
        sendAdminContactAlert(newMsg).catch((e) => console.warn("Admin contact alert error:", e.message));
      } catch (err: any) {
        console.error("[Server] Automated contact confirmation email error:", err.message);
      }
    }

    res.json({
      success: true,
      message: "Thank you for reaching out to Pyda Movers & Logistics. A confirmation email has been sent to " + email + ", and a representative will contact you shortly at " + phone,
      ticketId: newMsg.id,
      emailConfirmation: {
        sent: emailResult.success,
        recipient: email,
        messageId: emailResult.messageId,
        provider: emailResult.provider,
      },
    });
  });

  // Get Contact Messages list (Admin)
  app.get("/api/contact/messages", (req, res) => {
    res.json({ success: true, messages: contactMessages });
  });

  // Careers: Submit Job Application (with automated confirmation email)
  app.post("/api/careers/apply", async (req, res) => {
    const data = req.body;
    const appId = data.id || `APP-${Math.floor(10000 + Math.random() * 90000)}`;
    const newApp = {
      ...data,
      id: appId,
      status: data.status || 'submitted',
      appliedAt: data.appliedAt || new Date().toISOString(),
    };
    jobApplicationsDatabase.unshift(newApp);

    // If serverCmsData exists, persist there too
    if (serverCmsData && Array.isArray(serverCmsData.jobApplications)) {
      serverCmsData.jobApplications.unshift(newApp);
      saveCmsToDisk(serverCmsData);
    }

    // Send confirmation email
    if (newApp.email) {
      sendJobApplicationConfirmationEmail(newApp).catch((e) => console.warn("Job application email error:", e.message));
    }

    res.status(201).json({
      success: true,
      message: "Your application has been received by Pyda Movers HR & Fleet Recruitment team. Confirmation email dispatched.",
      application: newApp,
    });
  });

  // Careers: Get all applications (Admin)
  app.get("/api/careers/applications", (req, res) => {
    res.json({ success: true, applications: jobApplicationsDatabase });
  });

  // Email API: Get email service config & active provider
  app.get("/api/email/config", (req, res) => {
    const config = getEmailProviderConfig();
    res.json({
      success: true,
      config,
      totalDispatched: emailDispatchLogs.length,
    });
  });

  // Email API: Update/override active email provider
  app.post("/api/email/config", (req, res) => {
    const { provider } = req.body;
    if (['resend', 'sendgrid', 'smtp', 'native_engine'].includes(provider)) {
      setRuntimeEmailProvider(provider);
    } else if (provider === null || provider === 'auto') {
      setRuntimeEmailProvider(null);
    }
    const config = getEmailProviderConfig();
    res.json({
      success: true,
      config,
      totalDispatched: emailDispatchLogs.length,
    });
  });

  // Email API: Get recent email dispatch audit logs
  app.get("/api/email/logs", (req, res) => {
    res.json({
      success: true,
      logs: emailDispatchLogs,
    });
  });

  // Email API: Test email dispatch
  app.post("/api/email/test", async (req, res) => {
    const { recipient } = req.body;
    const targetEmail = recipient || getEmailProviderConfig().adminEmail;
    try {
      const result = await sendEmail({
        to: targetEmail,
        subject: "Pyda Movers Email Gateway Test - Automated Verification",
        html: `
          <div style="font-family: sans-serif; padding: 25px; background: #0f172a; color: #ffffff; border-radius: 12px;">
            <h2 style="color: #f59e0b; margin-top: 0;">✅ Pyda Movers Email Service Online</h2>
            <p>This is an automated test email verifying that transactional notifications (Quote Confirmations & Contact Form Receipts) are operating properly.</p>
            <p style="color: #cbd5e1; font-size: 12px;">Dispatched at: ${new Date().toISOString()}</p>
          </div>
        `,
        text: "Pyda Movers Email Service Test - Operational.",
      });

      res.json({
        success: true,
        message: `Test email dispatched to ${targetEmail}`,
        result,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Email API: Resend Quote Confirmation Email
  app.post("/api/email/resend-quote/:id", async (req, res) => {
    const { id } = req.params;
    const quote = quotesDatabase.find((q) => q.id === id);
    if (!quote) {
      return res.status(404).json({ success: false, message: "Quote not found" });
    }
    if (!quote.email) {
      return res.status(400).json({ success: false, message: "Quote has no email address associated" });
    }

    try {
      const result = await sendQuoteConfirmationEmail(quote);
      res.json({
        success: true,
        message: `Quotation confirmation email resent to ${quote.email}`,
        result,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Email API: Generate Mock Email Preview HTML & Subject
  app.post("/api/email/preview", (req, res) => {
    const { type, data } = req.body;
    let html = "";
    let subject = "";

    if (type === "contact_receipt") {
      html = generateContactReceiptEmailHtml(data || {});
      subject = `Pyda Movers - Message Received: ${data?.subject || "Corporate Inquiry"}`;
    } else if (type === "job_application") {
      html = generateJobApplicationReceiptEmailHtml(data || {});
      subject = `Pyda Movers HR - Application Received for ${data?.jobTitle || "Logistics Role"}`;
    } else {
      html = generateQuoteConfirmationEmailHtml(data || {});
      subject = `Pyda Movers & Logistics - Quotation Confirmation #${data?.id || "QUOTE-77102"}`;
    }

    res.json({ success: true, html, subject });
  });

  // Careers: Update application status (Admin)
  app.patch("/api/careers/applications/:id", (req, res) => {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    const appItem = jobApplicationsDatabase.find((a) => a.id === id);
    if (appItem) {
      if (status) appItem.status = status;
      if (adminNotes !== undefined) appItem.adminNotes = adminNotes;
      appItem.updatedAt = new Date().toISOString();

      if (serverCmsData && Array.isArray(serverCmsData.jobApplications)) {
        const found = serverCmsData.jobApplications.find((a: any) => a.id === id);
        if (found) {
          if (status) found.status = status;
          if (adminNotes !== undefined) found.adminNotes = adminNotes;
          saveCmsToDisk(serverCmsData);
        }
      }
      return res.json({ success: true, application: appItem });
    }
    return res.status(404).json({ success: false, message: "Application not found" });
  });

  // Careers: Delete application (Admin)
  app.delete("/api/careers/applications/:id", (req, res) => {
    const { id } = req.params;
    const idx = jobApplicationsDatabase.findIndex((a) => a.id === id);
    if (idx !== -1) {
      jobApplicationsDatabase.splice(idx, 1);
      if (serverCmsData && Array.isArray(serverCmsData.jobApplications)) {
        serverCmsData.jobApplications = serverCmsData.jobApplications.filter((a: any) => a.id !== id);
        saveCmsToDisk(serverCmsData);
      }
      return res.json({ success: true, message: "Application deleted" });
    }
    return res.status(404).json({ success: false, message: "Application not found" });
  });

  // =========================================================================
  // FLEET MAINTENANCE MILESTONE AUTOMATED EMAIL ALERT ENDPOINTS
  // =========================================================================

  // 1. Get current fleet milestone status & telemetry
  app.get("/api/fleet/maintenance-alerts/status", (req, res) => {
    try {
      const settings = loadMaintenanceSettings();
      const unitsWithStatus = MONITORED_FLEET_UNITS.map((truck) => {
        const kmRemaining = truck.milestoneTargetKm - truck.currentOdometerKm;
        const isOverdue = kmRemaining <= 0;
        const isDueSoon = kmRemaining <= (settings.thresholdKm || 500);
        return {
          ...truck,
          kmRemaining,
          urgency: isOverdue ? 'critical_overdue' : isDueSoon ? 'due_soon' : 'upcoming_milestone',
          isDueForAlert: isOverdue || isDueSoon,
        };
      });

      res.json({
        success: true,
        units: unitsWithStatus,
        settings,
        stats: {
          totalMonitored: MONITORED_FLEET_UNITS.length,
          dueOrOverdueCount: unitsWithStatus.filter(u => u.isDueForAlert).length,
          totalAlertsDispatched: maintenanceAlertLogs.length,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Get maintenance alert dispatch logs
  app.get("/api/fleet/maintenance-alerts/logs", (req, res) => {
    res.json({
      success: true,
      logs: maintenanceAlertLogs,
    });
  });

  // 3. Trigger / Dispatch milestone email alert for a specific truck
  app.post("/api/fleet/maintenance-alerts/trigger", async (req, res) => {
    try {
      const { truckId, recipientEmail, customOdometerKm } = req.body;
      if (!truckId) {
        return res.status(400).json({ success: false, message: "truckId is required" });
      }

      const result = await triggerMilestoneAlert({
        truckId,
        recipientEmail,
        customOdometerKm: customOdometerKm ? Number(customOdometerKm) : undefined,
      });

      res.json({
        success: result.success,
        message: result.success 
          ? `Milestone alert successfully dispatched to ${result.alert.recipientEmail}`
          : `Alert dispatch error: ${result.error}`,
        alert: result.alert,
        messageId: result.messageId,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 4. Run automated milestone check across all trucks
  app.post("/api/fleet/maintenance-alerts/check-all", async (req, res) => {
    try {
      const summary = await runAutomatedMaintenanceMilestoneCheck();
      res.json({
        success: true,
        message: `Automated scan completed: ${summary.scannedCount} units audited, ${summary.alertsTriggered} milestone alerts triggered.`,
        summary,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 5. Update maintenance alert preferences & settings
  app.post("/api/fleet/maintenance-alerts/settings", (req, res) => {
    try {
      const updated = saveMaintenanceSettings(req.body);
      res.json({
        success: true,
        message: "Maintenance alert settings updated successfully",
        settings: updated,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 6. Preview rendered HTML email for an alert
  app.get("/api/fleet/maintenance-alerts/preview/:truckId", (req, res) => {
    try {
      const truck = MONITORED_FLEET_UNITS.find(t => t.truckId === req.params.truckId) || MONITORED_FLEET_UNITS[0];
      const kmRemaining = truck.milestoneTargetKm - truck.currentOdometerKm;
      const html = generateMaintenanceMilestoneEmailHtml({
        id: `PREVIEW-${truck.unitCode}`,
        truckId: truck.truckId,
        unitCode: truck.unitCode,
        plateNumber: truck.plateNumber,
        makeModel: truck.makeModel,
        tonnage: truck.tonnage,
        fleetOwnerName: truck.fleetOwnerName,
        recipientEmail: truck.ownerEmail || 'yerimaforfor@gmail.com',
        recipientPhone: truck.ownerPhone,
        currentOdometerKm: truck.currentOdometerKm,
        milestoneTargetKm: truck.milestoneTargetKm,
        kmRemaining,
        urgency: kmRemaining <= 0 ? 'critical_overdue' : kmRemaining <= 500 ? 'due_soon' : 'upcoming_milestone',
        serviceType: truck.serviceType,
        serviceCode: truck.serviceCode,
        scheduledDate: truck.scheduledDate,
        workshopFacility: truck.workshopFacility,
        workshopCity: truck.workshopCity,
        leadTechnician: truck.leadTechnician,
        technicianPhone: truck.technicianPhone,
        oilPressureSummary: truck.oilPressureSummary,
        tpmsSummary: truck.tpmsSummary,
        status: 'simulated',
        dispatchedAt: new Date().toISOString(),
      });
      res.setHeader("Content-Type", "text/html");
      res.send(html);
    } catch (err: any) {
      res.status(500).send(`Error generating preview: ${err.message}`);
    }
  });

  // 7. Reschedule fleet vehicle maintenance date (via Interactive Drag-and-Drop Calendar)
  app.post("/api/fleet/maintenance/reschedule", (req, res) => {
    try {
      const { truckId, newDate, newDateISO, dueInDays, notes } = req.body;
      const truck = MONITORED_FLEET_UNITS.find(t => t.truckId === truckId || t.unitCode === truckId);
      if (truck) {
        truck.scheduledDate = newDate;
      }
      res.json({
        success: true,
        message: `Maintenance service date updated to ${newDate} for unit ${truckId}`,
        rescheduled: {
          truckId,
          newDate,
          newDateISO,
          dueInDays,
          notes: notes || 'Rescheduled via Interactive Fleet Maintenance Calendar',
          updatedAt: new Date().toISOString()
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ==========================================
  // NEWSLETTER & MAILING LIST API ENDPOINTS
  // ==========================================

  // 1. Subscribe to Newsletter (with Mailchimp sync & automated welcome email)
  app.post("/api/newsletter/subscribe", async (req, res) => {
    const { email, fullName, interest, source, notes } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email address is required." });
    }

    try {
      const result = await subscribeToNewsletter({
        email,
        fullName,
        interest,
        source: source || 'footer_form',
        notes
      });

      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || "Failed to process newsletter subscription." });
    }
  });

  // 2. Get All Subscribers (Admin / Mailing list)
  app.get("/api/newsletter/subscribers", (req, res) => {
    const subscribers = getAllSubscribers();
    res.json({ success: true, subscribers, total: subscribers.length });
  });

  // 3. Get Newsletter & Mailchimp Stats
  app.get("/api/newsletter/stats", (req, res) => {
    const stats = getNewsletterStats();
    res.json({ success: true, stats });
  });

  // 4. Get Mailchimp Config Status
  app.get("/api/newsletter/config", (req, res) => {
    const config = getMailchimpConfig();
    res.json({ success: true, config });
  });

  // 5. Test Mailchimp API Connection
  app.post("/api/newsletter/test-mailchimp", async (req, res) => {
    try {
      const result = await testMailchimpApi();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message, message: "Error contacting Mailchimp API." });
    }
  });

  // 6. Unsubscribe from Newsletter
  app.post("/api/newsletter/unsubscribe", async (req, res) => {
    const { email, id } = req.body;
    const target = email || id;
    if (!target) {
      return res.status(400).json({ success: false, message: "Email or ID required to unsubscribe." });
    }

    try {
      const result = await unsubscribeFromNewsletter(target);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 7. Delete Subscriber permanently (Admin)
  app.delete("/api/newsletter/subscribers/:id", (req, res) => {
    const { id } = req.params;
    const result = deleteSubscriber(id);
    if (result.success) {
      return res.json(result);
    }
    return res.status(404).json(result);
  });

  // 8. Broadcast Email Campaign to Subscribers (Bulk Send Engine using SMTP)
  app.post("/api/newsletter/broadcast", async (req, res) => {
    try {
      const { 
        title, 
        subject, 
        previewText, 
        bodyContent, 
        bodyHtml, 
        targetInterest, 
        bannerBadge, 
        ctaText, 
        ctaUrl, 
        templateId 
      } = req.body;

      const content = bodyContent || bodyHtml;
      if (!subject || !content) {
        return res.status(400).json({ success: false, message: "Email subject and body content are required." });
      }

      const result = await broadcastBulkEmailCampaign({
        title,
        subject,
        previewText: previewText || subject,
        bodyContent: content,
        targetInterest: targetInterest || 'all',
        bannerBadge,
        ctaText,
        ctaUrl,
        templateId,
      });

      res.json(result);
    } catch (err: any) {
      console.error("[Newsletter Broadcast API Error]:", err);
      res.status(500).json({ success: false, message: err.message || "Failed to broadcast newsletter." });
    }
  });

  // 9. Send Test Campaign Email (Pre-flight SMTP verification)
  app.post("/api/newsletter/test-broadcast", async (req, res) => {
    try {
      const {
        testRecipient,
        subject,
        previewText,
        bodyContent,
        bodyHtml,
        bannerBadge,
        ctaText,
        ctaUrl
      } = req.body;

      const content = bodyContent || bodyHtml;
      if (!subject || !content) {
        return res.status(400).json({ success: false, message: "Email subject and body content are required." });
      }

      const result = await sendTestNewsletterEmail({
        testRecipient,
        subject,
        previewText,
        bodyContent: content,
        bannerBadge,
        ctaText,
        ctaUrl
      });

      res.json(result);
    } catch (err: any) {
      console.error("[Newsletter Test Email Error]:", err);
      res.status(500).json({ success: false, message: err.message || "Failed to dispatch test email." });
    }
  });

  // 10. Get All Sent Newsletter Campaigns
  app.get("/api/newsletter/campaigns", (req, res) => {
    const campaigns = getAllCampaigns();
    res.json({ success: true, campaigns });
  });

  // 11. Delete Campaign Log
  app.delete("/api/newsletter/campaigns/:id", (req, res) => {
    const { id } = req.params;
    const result = deleteCampaign(id);
    if (result.success) {
      return res.json(result);
    }
    return res.status(404).json(result);
  });

  // ==========================================
  // SECURITY AUDIT & FAILED LOGIN LOGGING APIS
  // ==========================================

  // 12. Get Security Audit Logs and Telemetry Statistics
  app.get("/api/security/logs", (req, res) => {
    try {
      const { action, severity, search, limit } = req.query;
      const logs = getSecurityAuditLogs({
        action: action as string,
        severity: severity as string,
        search: search as string,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });
      const stats = getSecurityAuditStats();
      res.json({ success: true, logs, stats });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 13. Record Security Attempt (Failed Login, Success, Token Bypass, Passkey Change)
  app.post("/api/security/log-attempt", (req, res) => {
    try {
      const {
        action,
        description,
        attemptMasked,
        attemptMethod,
        failureReason,
        severity,
        requestPath,
        locationHint,
        metadata
      } = req.body;

      if (!action || !description) {
        return res.status(400).json({ success: false, message: "Action and description are required." });
      }

      const log = recordSecurityEvent({
        action,
        description,
        req,
        attemptMasked,
        attemptMethod,
        failureReason,
        severity,
        requestPath,
        locationHint,
        metadata,
      });

      const stats = getSecurityAuditStats();
      res.json({ success: true, log, stats });
    } catch (err: any) {
      console.error("[Security Logging API Error]:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 14. Export Security Logs as CSV
  app.get("/api/security/export-csv", (req, res) => {
    try {
      const csv = exportSecurityLogsCsv();
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="pyda-security-audit-${Date.now()}.csv"`);
      res.send(csv);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 15. Purge Security Audit Trail
  app.delete("/api/security/logs", (req, res) => {
    try {
      const { clearedBy } = req.body || {};
      clearSecurityAuditLogs(clearedBy || "Admin Dashboard User");
      const stats = getSecurityAuditStats();
      res.json({ success: true, message: "Security audit logs cleared successfully.", stats });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // ==========================================
  // SEO & SITEMAP XML / ROBOTS.TXT ROUTES
  // ==========================================

  // 16. Dynamic / Direct sitemap.xml Endpoint for Web Crawlers & Search Engines
  app.get("/sitemap.xml", (req, res) => {
    try {
      const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
      const host = req.headers["x-forwarded-host"] || req.headers.host || "pydamovers.com";
      const dynamicBaseUrl = `${protocol}://${host}`;
      
      const xml = generateSitemapXml(dynamicBaseUrl);
      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400");
      res.send(xml);
    } catch (err: any) {
      console.error("[Sitemap Generation Error]:", err);
      res.status(500).send("Error generating sitemap.xml");
    }
  });

  // 17. Direct robots.txt with Auto-Linked Sitemap
  app.get("/robots.txt", (req, res) => {
    try {
      const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
      const host = req.headers["x-forwarded-host"] || req.headers.host || "pydamovers.com";
      const dynamicBaseUrl = `${protocol}://${host}`;
      
      const robots = generateRobotsTxt(dynamicBaseUrl);
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.send(robots);
    } catch (err: any) {
      res.status(500).send("Error serving robots.txt");
    }
  });

  // 18. SEO & Sitemap Status API for Admin Hub
  app.get("/api/seo/sitemap", (req, res) => {
    try {
      const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
      const host = req.headers["x-forwarded-host"] || req.headers.host || "pydamovers.com";
      const dynamicBaseUrl = `${protocol}://${host}`;
      
      const summary = getSitemapSummary(dynamicBaseUrl);
      res.json({ success: true, ...summary });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 19. On-Demand Sitemap File Re-generation Trigger
  app.post("/api/seo/sitemap/generate", (req, res) => {
    try {
      const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
      const host = req.headers["x-forwarded-host"] || req.headers.host || "pydamovers.com";
      const dynamicBaseUrl = `${protocol}://${host}`;

      const targetDirs = ["public"];
      if (fs.existsSync(path.join(process.cwd(), "dist"))) {
        targetDirs.push("dist");
      }

      const result = writeSitemapFiles(targetDirs, dynamicBaseUrl);
      const summary = getSitemapSummary(dynamicBaseUrl);
      res.json({
        success: true,
        message: `Sitemap successfully generated with ${result.routesCount} indexable routes.`,
        ...result,
        summary
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // ==========================================
  // SMS NOTIFICATION GATEWAY (TWILIO) APIS
  // ==========================================

  // 20. Get SMS Gateway Status & Provider Configuration
  app.get("/api/sms/config", (req, res) => {
    try {
      const config = getSmsProviderConfig();
      const logs = getSmsDispatchLogs();
      res.json({
        success: true,
        config,
        totalDispatched: logs.length,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 21. Get SMS Dispatch History & Audit Logs
  app.get("/api/sms/logs", (req, res) => {
    try {
      const logs = getSmsDispatchLogs();
      res.json({ success: true, logs });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 22. Clear SMS Dispatch Logs
  app.delete("/api/sms/logs", (req, res) => {
    try {
      clearSmsLogs();
      res.json({ success: true, message: "SMS dispatch audit logs cleared successfully." });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 23. Send Generic SMS
  app.post("/api/sms/send", async (req, res) => {
    try {
      const { to, message, docReference, docType, senderId } = req.body;
      if (!to || !message) {
        return res.status(400).json({ success: false, message: "Phone number 'to' and 'message' text are required." });
      }

      const result = await sendSms({
        to,
        message,
        docReference,
        docType,
        senderId,
      });

      res.json(result);
    } catch (err: any) {
      console.error("[SMS Dispatch API Error]:", err);
      res.status(500).json({ success: false, message: err.message || "Failed to dispatch SMS." });
    }
  });

  // 24. Dedicated Endpoint: Notify User of Issued Insurance Certificate via SMS (Twilio Gateway)
  app.post("/api/sms/notify-insurance-certificate", async (req, res) => {
    try {
      const { cert, recipientPhone, recipientName, vaultUrl } = req.body;

      if (!cert || !cert.referenceNumber) {
        return res.status(400).json({ success: false, message: "Insurance certificate details and reference number are required." });
      }

      const targetPhone = recipientPhone || "08062466212";

      // Derive base vault url if not supplied
      const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
      const host = req.headers["x-forwarded-host"] || req.headers.host || "pydamovers.com";
      const derivedVaultUrl = vaultUrl || `${protocol}://${host}/?view=dashboard&tab=vault`;

      const result = await sendInsuranceCertificateSms({
        cert,
        recipientPhone: targetPhone,
        recipientName,
        vaultUrl: derivedVaultUrl,
      });

      res.json({
        success: result.success,
        message: result.success
          ? `SMS alert dispatched to ${targetPhone} via ${result.provider.toUpperCase()} SMS Gateway.`
          : `Failed to dispatch SMS: ${result.error}`,
        result,
      });
    } catch (err: any) {
      console.error("[Insurance SMS Notification API Error]:", err);
      res.status(500).json({ success: false, message: err.message || "Failed to process insurance certificate SMS notification." });
    }
  });

  // 25. Test SMS Gateway Connection
  app.post("/api/sms/test", async (req, res) => {
    try {
      const { phone, message } = req.body;
      const targetPhone = phone || "08062466212";
      const testBody = message || `Pyda Movers SMS Gateway Test: Operational verification at ${new Date().toLocaleTimeString('en-GB')}. Your Document Vault is secure.`;

      const result = await sendSms({
        to: targetPhone,
        message: testBody,
        docReference: 'TEST-SMS-GATEWAY',
        docType: 'system_test',
      });

      res.json({
        success: result.success,
        message: `Test SMS dispatched to ${targetPhone}`,
        result,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 25b. Toggle Real-Time SMS Notifications for Active Shipment via Twilio Gateway
  app.post("/api/sms/toggle-shipment-notifications", async (req, res) => {
    try {
      const { trackingId, enabled, recipientPhone, recipientName, shipment } = req.body;
      if (!trackingId) {
        return res.status(400).json({ success: false, message: "trackingId is required" });
      }

      const targetPhone = recipientPhone || "08062466212";

      if (enabled) {
        // Dispatch enrollment verification SMS via Twilio gateway
        const result = await sendShipmentStatusSms({
          trackingId,
          recipientPhone: targetPhone,
          recipientName: recipientName || "Valued Client",
          status: shipment?.status || "In Transit",
          currentLocation: shipment?.currentLocation || "En Route Corridor",
          progressPercent: shipment?.progressPercent || 50,
          origin: shipment?.origin || "Origin Depot",
          destination: shipment?.destination || "Destination Hub",
          driverName: shipment?.driverName || "Fleet Convoy Captain",
          driverPhone: shipment?.driverPhone,
          estimatedArrival: shipment?.estimatedArrival,
          vehiclePlate: shipment?.vehiclePlate,
          isToggleEnrollment: true,
        });

        return res.json({
          success: true,
          enabled: true,
          trackingId,
          recipientPhone: targetPhone,
          message: `Real-time SMS alerts activated for Convoy #${trackingId}. Enrollment notice dispatched via ${result.provider.toUpperCase()} Gateway.`,
          result,
        });
      } else {
        return res.json({
          success: true,
          enabled: false,
          trackingId,
          recipientPhone: targetPhone,
          message: `Real-time SMS notifications paused for Convoy #${trackingId}.`,
        });
      }
    } catch (err: any) {
      console.error("[Shipment SMS Toggle Error]:", err);
      res.status(500).json({ success: false, message: err.message || "Failed to update shipment SMS preferences." });
    }
  });

  // 25c. Dispatch On-Demand Live Shipment Checkpoint SMS via Twilio Gateway
  app.post("/api/sms/notify-shipment-status", async (req, res) => {
    try {
      const { trackingId, recipientPhone, recipientName, shipment } = req.body;
      if (!trackingId) {
        return res.status(400).json({ success: false, message: "trackingId is required" });
      }

      const targetPhone = recipientPhone || "08062466212";

      const result = await sendShipmentStatusSms({
        trackingId,
        recipientPhone: targetPhone,
        recipientName: recipientName || "Valued Client",
        status: shipment?.status || "In Transit",
        currentLocation: shipment?.currentLocation || "Highway Checkpoint",
        progressPercent: shipment?.progressPercent || 50,
        origin: shipment?.origin || "Origin Depot",
        destination: shipment?.destination || "Destination Hub",
        driverName: shipment?.driverName || "Fleet Convoy Captain",
        driverPhone: shipment?.driverPhone,
        estimatedArrival: shipment?.estimatedArrival,
        vehiclePlate: shipment?.vehiclePlate,
        isToggleEnrollment: false,
      });

      res.json({
        success: result.success,
        trackingId,
        recipientPhone: targetPhone,
        message: result.success
          ? `Live convoy status SMS dispatched to ${targetPhone} via ${result.provider.toUpperCase()} Gateway.`
          : `Failed to dispatch status SMS: ${result.error}`,
        result,
      });
    } catch (err: any) {
      console.error("[Shipment Status SMS Error]:", err);
      res.status(500).json({ success: false, message: err.message || "Failed to dispatch shipment status SMS." });
    }
  });

  // ==========================================
  // BATCH NOTIFICATIONS (TWILIO BROADCAST ENGINE)
  // ==========================================

  // 25d. Get All Active Clients for Batch SMS Broadcasting
  app.get("/api/sms/active-clients", (req, res) => {
    try {
      const activeClients: any[] = [];
      const seenPhones = new Set<string>();

      // 1. Gather Active In-Transit & Dispatched Shipments
      const shipmentsList = (serverCmsData && Array.isArray(serverCmsData.shipments))
        ? serverCmsData.shipments
        : [];

      // If serverCmsData.shipments is empty, provide the standard active shipments
      const effectiveShipments = shipmentsList.length > 0 ? shipmentsList : [
        {
          trackingId: 'TEMA-84920',
          clientName: 'National FMCG Distribution Fleet',
          serviceType: 'General Haulage (30-Ton Trailer)',
          origin: 'Lagos Hub (Old Ojo Rd)',
          destination: 'Abuja HQ (Citygate Plaza)',
          currentLocation: 'Lokoja Transit Hub, Kogi State (A2 Highway)',
          status: 'In Transit',
          progressPercent: 68,
          driverContact: '08036249911 (Musa Ibrahim)',
          driverName: 'Musa Ibrahim',
          driverPhone: '08036249911',
          vehiclePlate: 'KJA-842-XB (Lagos)',
        },
        {
          trackingId: 'TEMA-91024',
          clientName: 'United Bank Executive Office Move',
          serviceType: 'Corporate Relocation (IT & Executive Furniture)',
          origin: 'Victoria Island, Lagos',
          destination: 'Maitama, Abuja',
          currentLocation: 'Abuja Citygate Approach / Lugbe Expressway',
          status: 'In Transit',
          progressPercent: 92,
          driverContact: '08029983110 (Segun Babatunde)',
          driverName: 'Segun Babatunde',
          driverPhone: '08029983110',
          vehiclePlate: 'ABC-109-YY (Abuja)',
        },
        {
          trackingId: 'TEMA-77319',
          clientName: 'Shell Nigeria Marine Industrial Haulage',
          serviceType: 'Heavy Commercial Haulage (40ft Flatbed)',
          origin: 'Apapa Marine Port, Lagos',
          destination: 'Onne Oil & Gas Free Zone, Rivers State',
          currentLocation: 'Benin-Ore Expressway Corridor, Edo State',
          status: 'In Transit',
          progressPercent: 45,
          driverContact: '08051239844 (Alh. Danladi)',
          driverName: 'Alhaji Danladi',
          driverPhone: '08051239844',
          vehiclePlate: 'RSH-554-PH (Rivers)',
        },
        {
          trackingId: 'TEMA-65201',
          clientName: 'Dangote Agro Projects Regional Consignment',
          serviceType: 'Interstate Freight Haulage',
          origin: 'Sharada Industrial Estate, Kano',
          destination: 'Central Business District, Abuja',
          currentLocation: 'Kaduna Transit Checkpoint, Kaduna State',
          status: 'In Transit',
          progressPercent: 60,
          driverContact: '08062466212 (Yerima Forfor)',
          driverName: 'Captain Yerima Forfor',
          driverPhone: '08062466212',
          vehiclePlate: 'KN-992-SHA (Kano)',
        }
      ];

      for (const ship of effectiveShipments) {
        // Derive client phone or driver contact
        const phone = ship.smsNotificationPhone || ship.driverPhone || (ship.driverContact ? ship.driverContact.split(' ')[0] : '08062466212');
        const cleanPhone = phone.replace(/[^0-9+]/g, '');

        if (!seenPhones.has(cleanPhone)) {
          seenPhones.add(cleanPhone);
          activeClients.push({
            id: `client-ship-${ship.trackingId}`,
            name: ship.clientName,
            phone: cleanPhone,
            company: ship.clientName,
            category: 'in_transit',
            activeConsignment: ship.trackingId,
            route: `${ship.origin} ➔ ${ship.destination}`,
            currentLocation: ship.currentLocation,
            driverName: ship.driverName,
            driverPhone: ship.driverPhone,
            status: `${ship.status} (${ship.progressPercent || 50}%)`,
            selected: true,
          });
        }
      }

      // 2. Gather Active / Booked Quotes
      for (const quote of quotesDatabase) {
        if (quote.phone) {
          const cleanPhone = quote.phone.replace(/[^0-9+]/g, '');
          if (!seenPhones.has(cleanPhone)) {
            seenPhones.add(cleanPhone);
            activeClients.push({
              id: `client-quote-${quote.id}`,
              name: quote.fullName,
              phone: cleanPhone,
              email: quote.email,
              company: quote.companyName || 'Private Moving Client',
              category: quote.serviceType === 'corporate' || quote.serviceType === 'commercial' ? 'corporate' : 'residential',
              activeConsignment: quote.id,
              route: `${quote.originCity} ➔ ${quote.destinationCity}`,
              currentLocation: 'Scheduled for Loading / Pre-Move Site Survey',
              status: `Booked Move (${quote.status || 'Active'})`,
              selected: true,
            });
          }
        }
      }

      // 3. Established Key Commercial Accounts & Corporate Clients
      const verifiedCorporatePartners = [
        {
          id: 'client-corp-01',
          name: 'Chief Dr. Ernest Agu',
          phone: '08025609972',
          email: 'ernest.agu@megatrendmovers.com',
          company: 'Megatrend Logistics Freight Directorate',
          category: 'corporate',
          activeConsignment: 'MTM-CONTRACT-2026',
          route: 'Lagos ⇄ Abuja Nationwide Fleet Corridor',
          currentLocation: 'Regional Dispatch Hub',
          status: 'Contract Active',
          selected: true,
        },
        {
          id: 'client-corp-02',
          name: 'Funmilayo Adeleke',
          phone: '08037194022',
          email: 'f.adeleke@megatrendmovers.com',
          company: 'Nigerian Ports Logistics & Freight Syndicate',
          category: 'corporate',
          activeConsignment: 'TEMA-PORT-09',
          route: 'Apapa Marine Terminal ➔ Ikeja Cargo Hub',
          currentLocation: 'Terminal Staging Area',
          status: 'Active Haulage Account',
          selected: true,
        },
        {
          id: 'client-res-01',
          name: 'Barrister Aisha Bello-Mohammed',
          phone: '08034567891',
          email: 'aisha.mohammed@lawfirm.ng',
          company: 'Diplomatic Residential Relocation',
          category: 'residential',
          activeConsignment: 'TEMA-RES-4412',
          route: 'Ikoyi, Lagos ➔ Maitama, Abuja',
          currentLocation: 'Packing & Crate Staging Complete',
          status: 'In Transit Preparation',
          selected: true,
        }
      ];

      for (const partner of verifiedCorporatePartners) {
        const cleanPhone = partner.phone.replace(/[^0-9+]/g, '');
        if (!seenPhones.has(cleanPhone)) {
          seenPhones.add(cleanPhone);
          activeClients.push({
            ...partner,
            phone: cleanPhone,
          });
        }
      }

      res.json({
        success: true,
        total: activeClients.length,
        inTransitCount: activeClients.filter((c) => c.category === 'in_transit').length,
        corporateCount: activeClients.filter((c) => c.category === 'corporate').length,
        residentialCount: activeClients.filter((c) => c.category === 'residential').length,
        clients: activeClients,
      });
    } catch (err: any) {
      console.error("[Active Clients API Error]:", err);
      res.status(500).json({ success: false, message: err.message || "Failed to load active clients." });
    }
  });

  // 25e. Broadcast Batch Notification via Twilio Gateway
  app.post("/api/sms/broadcast", async (req, res) => {
    try {
      const {
        title,
        category = 'weather_delay',
        urgency = 'high',
        messageTemplate,
        targetAudience = 'all_active',
        recipients = [],
        includeTestPhone,
        dispatchedBy = 'Operations Dispatcher',
      } = req.body;

      if (!messageTemplate || !messageTemplate.trim()) {
        return res.status(400).json({ success: false, message: "Broadcast SMS message template is required." });
      }

      if (!Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json({ success: false, message: "At least one active client recipient is required." });
      }

      const broadcastResult = await broadcastBatchSms({
        title: title || `Batch Broadcast - ${new Date().toLocaleDateString()}`,
        category,
        urgency,
        messageTemplate: messageTemplate.trim(),
        targetAudience,
        recipients,
        includeTestPhone,
        dispatchedBy,
      });

      res.json({
        success: broadcastResult.success,
        message: `Batch SMS broadcast dispatched to ${broadcastResult.dispatchedCount} active clients simultaneously via ${broadcastResult.provider.toUpperCase()} Gateway.`,
        ...broadcastResult,
      });
    } catch (err: any) {
      console.error("[Batch SMS Broadcast API Error]:", err);
      res.status(500).json({ success: false, message: err.message || "Failed to broadcast batch SMS notification." });
    }
  });

  // 25f. Get All Batch Broadcast Campaigns History
  app.get("/api/sms/broadcast/campaigns", (req, res) => {
    try {
      const campaigns = getBatchSmsCampaigns();
      res.json({ success: true, campaigns, total: campaigns.length });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 25g. Delete Batch Broadcast Campaign Log
  app.delete("/api/sms/broadcast/campaigns/:id", (req, res) => {
    try {
      const { id } = req.params;
      const success = deleteBatchSmsCampaign(id);
      if (success) {
        return res.json({ success: true, message: `Campaign #${id} deleted from audit history.` });
      }
      return res.status(404).json({ success: false, message: "Campaign record not found." });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 25h. Send Pre-flight Test Batch Message to Admin Phone
  app.post("/api/sms/broadcast/test", async (req, res) => {
    try {
      const { phone, messageTemplate, category = 'weather_delay', urgency = 'high' } = req.body;
      const targetPhone = phone || "08062466212";

      if (!messageTemplate) {
        return res.status(400).json({ success: false, message: "Message template text is required." });
      }

      // Populate dummy merge variables for realistic simulation
      let sampleMessage = messageTemplate
        .replace(/{{clientName}}/gi, 'Chief Yerima (Test Client)')
        .replace(/{{name}}/gi, 'Chief Yerima')
        .replace(/{{company}}/gi, 'National FMCG Distribution')
        .replace(/{{trackingId}}/gi, 'TEMA-84920')
        .replace(/{{origin}}/gi, 'Lagos Hub')
        .replace(/{{destination}}/gi, 'Abuja HQ')
        .replace(/{{currentLocation}}/gi, 'Lokoja Highway Transit Hub')
        .replace(/{{driverPhone}}/gi, '08036249911')
        .replace(/{{driverName}}/gi, 'Captain Musa Ibrahim')
        .replace(/{{hotline}}/gi, '0806 246 6212');

      if (urgency === 'high' && !sampleMessage.toLowerCase().includes('alert') && !sampleMessage.toLowerCase().includes('urgent')) {
        sampleMessage = `[URGENT LOGISTICS ADVISORY] ${sampleMessage}`;
      }

      const result = await sendSms({
        to: targetPhone,
        message: `[PRE-FLIGHT TEST] ${sampleMessage}`,
        docReference: 'PREFLIGHT-BATCH-TEST',
        docType: `test_batch_${category}`,
        senderId: 'PYDA',
      });

      res.json({
        success: result.success,
        message: `Pre-flight test SMS dispatched to ${targetPhone} via ${result.provider.toUpperCase()} Gateway.`,
        result,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || "Failed to dispatch test batch SMS." });
    }
  });

  // 26. Get Testimonials with Pagination, Category Filtering & Search from local mock database
  const TESTIMONIALS_FILE_PATH = path.join(DATA_DIR, "testimonials-mock-db.json");
  const getTestimonialsDatabase = () => {
    try {
      if (fs.existsSync(TESTIMONIALS_FILE_PATH)) {
        const raw = fs.readFileSync(TESTIMONIALS_FILE_PATH, "utf-8");
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn("Could not read testimonials file, using fallback:", e);
    }
    return { testimonials: [], totalCount: 0 };
  };

  app.get("/api/testimonials", (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 6;
      const category = (req.query.category as string) || "all";
      const search = ((req.query.search as string) || "").trim().toLowerCase();
      const sortBy = (req.query.sortBy as string) || "helpful";

      const dbData = getTestimonialsDatabase();
      let allItems: any[] = dbData.testimonials || [];

      // Filter by category
      if (category && category !== "all") {
        allItems = allItems.filter((item) => item.category === category);
      }

      // Filter by search query
      if (search) {
        allItems = allItems.filter((item) =>
          item.author.toLowerCase().includes(search) ||
          item.company.toLowerCase().includes(search) ||
          item.city.toLowerCase().includes(search) ||
          item.quote.toLowerCase().includes(search) ||
          item.serviceTitle.toLowerCase().includes(search) ||
          (item.moveHighlight && item.moveHighlight.toLowerCase().includes(search)) ||
          (item.tags && item.tags.some((t: string) => t.toLowerCase().includes(search)))
        );
      }

      // Sorting
      if (sortBy === "helpful") {
        allItems.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
      } else if (sortBy === "rating") {
        allItems.sort((a, b) => b.rating - a.rating);
      }

      const totalCount = allItems.length;
      const startIndex = (page - 1) * limit;
      const paginatedItems = allItems.slice(startIndex, startIndex + limit);
      const hasMore = startIndex + limit < totalCount;

      // Category breakdown counts
      const rawAll = dbData.testimonials || [];
      const categories = [
        { id: "all", label: "All Reviews", count: rawAll.length },
        { id: "corporate", label: "Corporate Relocation", count: rawAll.filter((t: any) => t.category === "corporate").length },
        { id: "residential", label: "Residential Moves", count: rawAll.filter((t: any) => t.category === "residential").length },
        { id: "commercial", label: "Commercial & Retail", count: rawAll.filter((t: any) => t.category === "commercial").length },
        { id: "haulage", label: "Heavy Haulage", count: rawAll.filter((t: any) => t.category === "haulage").length },
      ];

      res.json({
        success: true,
        testimonials: paginatedItems,
        totalCount,
        page,
        limit,
        hasMore,
        categories,
        averageRating: dbData.averageRating || 4.98,
        verifiedRatio: dbData.verifiedRatio || "100%",
      });
    } catch (err: any) {
      console.error("[Testimonials API Error]:", err);
      res.status(500).json({ success: false, message: err.message || "Failed to query testimonials." });
    }
  });

  // 27. Submit New Testimonial Review
  app.post("/api/testimonials", (req, res) => {
    try {
      const { category, serviceTitle, quote, author, role, company, city, rating, avatar, moveHighlight, tags } = req.body;
      if (!author || !quote || !serviceTitle) {
        return res.status(400).json({ success: false, message: "Author name, service title, and review quote are required." });
      }

      const dbData = getTestimonialsDatabase();
      const newTestimonial = {
        id: `test-${Date.now()}`,
        category: category || "residential",
        serviceTitle: serviceTitle || "Residential Move",
        quote: quote.trim(),
        author: author.trim(),
        role: role?.trim() || "Verified Client",
        company: company?.trim() || "Residential Move",
        city: city?.trim() || "Nigeria",
        rating: Number(rating) || 5,
        avatar: avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        verified: true,
        moveHighlight: moveHighlight?.trim() || "Verified Move",
        date: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        helpfulCount: 1,
        tags: tags || ["Verified Move"],
      };

      const updatedList = [newTestimonial, ...(dbData.testimonials || [])];
      const updatedData = {
        ...dbData,
        testimonials: updatedList,
        totalCount: updatedList.length,
        lastUpdated: new Date().toISOString(),
      };

      fs.writeFileSync(TESTIMONIALS_FILE_PATH, JSON.stringify(updatedData, null, 2), "utf-8");

      res.status(201).json({
        success: true,
        message: "Testimonial submitted successfully and added to verified review database.",
        testimonial: newTestimonial,
      });
    } catch (err: any) {
      console.error("[Submit Testimonial Error]:", err);
      res.status(500).json({ success: false, message: err.message || "Failed to submit testimonial." });
    }
  });

  // 28. Upvote Testimonial Helpfulness
  app.post("/api/testimonials/:id/helpful", (req, res) => {
    try {
      const { id } = req.params;
      const dbData = getTestimonialsDatabase();
      const testimonials = dbData.testimonials || [];
      const target = testimonials.find((t: any) => t.id === id);

      if (target) {
        target.helpfulCount = (target.helpfulCount || 0) + 1;
        fs.writeFileSync(TESTIMONIALS_FILE_PATH, JSON.stringify(dbData, null, 2), "utf-8");
        return res.json({ success: true, helpfulCount: target.helpfulCount });
      }

      res.status(404).json({ success: false, message: "Testimonial not found." });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // ==========================================
  // WHATSAPP LEAD CONVERSION TRACKING APIS
  // ==========================================

  // 29. Log Inbound WhatsApp Click Conversion
  app.post("/api/leads/whatsapp-click", (req, res) => {
    try {
      const {
        pageUrl,
        pagePath,
        pageTitle,
        source,
        sourceLabel,
        whatsappNumber,
        inquiryMessage,
        deviceType,
        referrer,
        estimatedValueNaira,
        notes,
      } = req.body || {};

      const leads = getLeadsDatabase();
      const newLead = {
        id: `lead-wa-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        pageUrl: pageUrl || "https://pydamovers.com",
        pagePath: pagePath || "/",
        pageTitle: pageTitle || "Home Page (Hero & Overview)",
        source: source || "direct_link",
        sourceLabel: sourceLabel || "Direct WhatsApp Link",
        whatsappNumber: (whatsappNumber || "2348062466212").replace(/\D/g, ""),
        inquiryMessage: inquiryMessage || undefined,
        status: "new_lead",
        deviceType: deviceType || "desktop",
        referrer: referrer || "Direct",
        notes: notes || "Logged via website WhatsApp integration click tracking.",
        estimatedValueNaira: estimatedValueNaira ? Number(estimatedValueNaira) : undefined,
      };

      leads.unshift(newLead);
      saveLeadsDatabase(leads);

      res.status(201).json({
        success: true,
        message: "WhatsApp lead conversion logged successfully.",
        lead: newLead,
      });
    } catch (err: any) {
      console.error("[Log WhatsApp Lead Error]:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 30. Get All WhatsApp Lead Conversions & Page Analytics
  app.get("/api/leads/whatsapp-conversions", (req, res) => {
    try {
      const leads = getLeadsDatabase();
      const total = leads.length;

      // Calculate today's clicks
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const todayClicks = leads.filter((l: any) => new Date(l.timestamp).getTime() >= startOfToday).length;

      // Status breakdown
      const statusCounts: Record<string, number> = {
        new_lead: 0,
        contacted: 0,
        quote_sent: 0,
        booked: 0,
        archived: 0,
      };

      // Page attribution mapping
      const pageMap: Record<string, { count: number; title: string; lastInquiry: string; sources: Record<string, number> }> = {};

      for (const lead of leads) {
        if (lead.status && statusCounts[lead.status] !== undefined) {
          statusCounts[lead.status]++;
        } else {
          statusCounts.new_lead++;
        }

        const path = lead.pagePath || "/";
        const title = lead.pageTitle || path;
        if (!pageMap[path]) {
          pageMap[path] = { count: 0, title, lastInquiry: lead.timestamp, sources: {} };
        }
        pageMap[path].count++;
        if (new Date(lead.timestamp) > new Date(pageMap[path].lastInquiry)) {
          pageMap[path].lastInquiry = lead.timestamp;
        }
        const src = lead.sourceLabel || lead.source || "Direct";
        pageMap[path].sources[src] = (pageMap[path].sources[src] || 0) + 1;
      }

      const pageMetrics = Object.entries(pageMap)
        .map(([path, data]) => {
          let topSource = "Direct";
          let maxCount = 0;
          for (const [src, c] of Object.entries(data.sources)) {
            if (c > maxCount) {
              maxCount = c;
              topSource = src;
            }
          }
          return {
            pagePath: path,
            pageTitle: data.title,
            clickCount: data.count,
            percentage: total > 0 ? Math.round((data.count / total) * 100) : 0,
            lastInquiryAt: data.lastInquiry,
            topSource,
          };
        })
        .sort((a, b) => b.clickCount - a.clickCount);

      res.json({
        success: true,
        totalClicks: total,
        todayClicks,
        statusCounts,
        pageMetrics,
        leads,
      });
    } catch (err: any) {
      console.error("[Get WhatsApp Leads Error]:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 31. Update Lead Status & Notes
  app.patch("/api/leads/whatsapp-conversions/:id", (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body || {};
      const leads = getLeadsDatabase();
      const target = leads.find((l: any) => l.id === id);

      if (!target) {
        return res.status(404).json({ success: false, message: "Lead not found." });
      }

      Object.assign(target, updates);
      saveLeadsDatabase(leads);

      res.json({ success: true, message: "Lead updated successfully.", lead: target });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 32. Delete Lead Conversion
  app.delete("/api/leads/whatsapp-conversions/:id", (req, res) => {
    try {
      const { id } = req.params;
      let leads = getLeadsDatabase();
      const initialLength = leads.length;
      leads = leads.filter((l: any) => l.id !== id);

      if (leads.length === initialLength) {
        return res.status(404).json({ success: false, message: "Lead not found." });
      }

      saveLeadsDatabase(leads);
      res.json({ success: true, message: "Lead deleted successfully." });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 33. Export Leads Table to CSV
  app.get("/api/leads/whatsapp-conversions/export-csv", (req, res) => {
    try {
      const leads = getLeadsDatabase();
      const headers = [
        "Lead ID",
        "Timestamp (UTC)",
        "Page Path",
        "Page Title",
        "Source Touchpoint",
        "WhatsApp Target",
        "Status",
        "Estimated Value (NGN)",
        "Assigned Staff",
        "Device",
        "Referrer",
        "Inquiry Message",
        "Internal Notes"
      ];

      const csvRows = [headers.join(",")];

      for (const lead of leads) {
        const safe = (str: any) => `"${String(str || "").replace(/"/g, '""')}"`;
        const row = [
          safe(lead.id),
          safe(lead.timestamp),
          safe(lead.pagePath),
          safe(lead.pageTitle),
          safe(lead.sourceLabel || lead.source),
          safe(lead.whatsappNumber),
          safe(lead.status),
          safe(lead.estimatedValueNaira || 0),
          safe(lead.assignedStaff || "Unassigned"),
          safe(lead.deviceType || "desktop"),
          safe(lead.referrer || "Direct"),
          safe(lead.inquiryMessage || ""),
          safe(lead.notes || "")
        ];
        csvRows.push(row.join(","));
      }

      const csvContent = csvRows.join("\r\n");
      const filename = `pyda_whatsapp_lead_conversions_${new Date().toISOString().split("T")[0]}.csv`;

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(csvContent);
    } catch (err: any) {
      console.error("[Export Leads CSV Error]:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 34. Clear Lead Conversions
  app.post("/api/leads/whatsapp-conversions/clear", (req, res) => {
    try {
      saveLeadsDatabase([]);
      res.json({ success: true, message: "Lead conversions cleared successfully." });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Automatically write initial sitemap files on server startup
  try {
    writeSitemapFiles(["public"]);
  } catch (err) {
    console.warn("[Sitemap Startup Warning]:", err);
  }

  // Vite Middleware in Dev, Static serve in Production
  const distPath = path.join(process.cwd(), 'dist');
  const isProduction = process.env.NODE_ENV === "production" || (process.env.NODE_ENV !== "development" && fs.existsSync(path.join(distPath, 'index.html')));

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Pyda Movers server running on http://localhost:${PORT}`);
  });

  // Automated CAN-bus maintenance milestone check daemon
  // Runs periodically in the background to inspect odometer readings against scheduled intervals
  setInterval(async () => {
    try {
      const settings = loadMaintenanceSettings();
      if (settings.autoAlertsEnabled) {
        console.log("[MaintenanceAlertDaemon] Running scheduled mileage milestone check...");
        await runAutomatedMaintenanceMilestoneCheck();
      }
    } catch (err) {
      console.error("[MaintenanceAlertDaemon] Error in scheduled milestone check:", err);
    }
  }, 6 * 60 * 60 * 1000); // Audit every 6 hours
}

startServer().catch((err) => {
  console.error("Fatal error starting Pyda Movers server:", err);
  process.exit(1);
});
