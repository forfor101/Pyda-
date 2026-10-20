import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  ShieldCheck,
  Download,
  Eye,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Lock,
  Building2,
  FileBadge,
  Sparkles,
  ExternalLink,
  ChevronRight,
  X,
  FileDown,
  Printer,
  Shield,
  Clock,
  UserCheck,
  Check,
  Plus,
  PenTool,
  Stamp,
  Phone,
  MessageSquare,
  Send,
  Radio,
  Share2,
  CheckSquare,
  Square,
  Layers,
  Truck,
  Car,
  Receipt,
  ClipboardList,
  Box
} from 'lucide-react';
import jsPDF from 'jspdf';
import { VaultDocument, VaultDocumentType, CustomerUser, SignatureRecord } from '../types';
import { useCms } from '../context/CmsContext';
import { useAuth } from '../context/AuthContext';
import { IssueInsuranceModal } from './IssueInsuranceModal';
import { SmsGatewayLogModal } from './SmsGatewayLogModal';
import { BulkPrintPackageModal } from './BulkPrintPackageModal';
import { DocumentPrintPreviewModal } from './DocumentPrintPreviewModal';
import { ExportPackingSlipModal } from './ExportPackingSlipModal';
import { downloadConsolidatedPackage, printConsolidatedPackage } from '../utils/vaultPdfPackage';
import { downloadProformaInvoicePdf } from '../utils/proformaInvoiceGenerator';
import { downloadPackingSlipPdf, PackingSlipData } from '../utils/packingSlipGenerator';
import { downloadCarHirePdf } from '../utils/carHireInvoiceGenerator';
import { INITIAL_INVENTORY_ITEMS } from '../data/companyData';
import { SAMPLE_CAR_HIRE_VAULT_DOCS } from '../data/carHireData';

interface DocumentVaultProps {
  currentUser: CustomerUser;
  onOpenQuoteModal?: () => void;
  onOpenSignModal?: (doc?: VaultDocument) => void;
  onOpenCarHireModal?: (tripType?: 'intra_state' | 'inter_state') => void;
  initialDocId?: string;
}

const VAULT_STORAGE_KEY = 'megatrend_customer_vault_docs';

export const DocumentVault: React.FC<DocumentVaultProps> = ({
  currentUser,
  onOpenQuoteModal,
  onOpenSignModal,
  onOpenCarHireModal,
  initialDocId,
}) => {
  const { cms } = useCms();
  const { userDocuments } = useAuth();
  const phone = cms.company?.phones?.[0] || '08062466212';

  // Initial seed documents
  const defaultVaultDocs: VaultDocument[] = [
    ...SAMPLE_CAR_HIRE_VAULT_DOCS,
    {
      id: 'DOC-INS-2026-904',
      title: 'Goods-In-Transit (GIT) Marine & Road Insurance Certificate',
      docType: 'insurance_certificate',
      referenceNumber: 'NIA-GIT-POL-84920-A',
      issuedDate: '2026-08-20',
      expiryDate: '2026-09-30',
      status: 'active',
      fileSize: '420 KB',
      underwriterOrIssuer: 'Leadway Assurance Plc & AIICO Insurance Consortium',
      coverageAmountNaira: 35000000,
      originCity: 'Victoria Island, Lagos',
      destinationCity: 'Maitama, Abuja',
      signatories: ['Dr. Babatunde Sanusi (Chief Underwriter, Leadway)', 'T. Adeleke (Authorized Client)'],
      summaryText: 'Official Goods-In-Transit All-Risk Certificate granting 100% full replacement value indemnity for high-value residential furniture, executive IT infrastructure, and fine art with Zero Deductible.',
      verifiedStampCode: 'NIA-CERT-VERIFIED-2026-904',
      tags: ['Insurance', 'Leadway', 'All-Risk', 'Zero-Deductible'],
    },
    {
      id: 'DOC-PSL-2026-512',
      title: 'Consignment Packing Slip & Inventory Manifest - Ref #PSL-PYDA-2026-512',
      docType: 'packing_slip',
      referenceNumber: 'PSL-PYDA-2026-512',
      issuedDate: '2026-08-22',
      status: 'active',
      fileSize: '385 KB',
      underwriterOrIssuer: 'Pyda Logistics Dispatch & Inventory Marshall Office',
      coverageAmountNaira: 18500000,
      originCity: 'Plot 14, Victoria Island, Lagos Hub',
      destinationCity: 'Maitama District, Abuja, FCT',
      signatories: [
        'M. Ibrahim (Senior Inventory Marshall)',
        'Captain S. Bello (Lead Convoy Captain)',
        'Dr. Yerima Forfor (Consignee Handover)',
      ],
      summaryText:
        'Official Relocation Consignment Packing Slip & Inventory Manifest (#PSL-PYDA-2026-512) detailing 52 standard manifest units (14.8 CBM total volume). Carrier: 10-Ton Heavy Logistics Truck (Hydraulic Liftgate). Security Tamper-Evident Seals: PYDA-SEAL-88910 through SEAL-88915. Validated with full Goods-In-Transit zero-loss replacement indemnity.',
      verifiedStampCode: 'PKI-PSL-SEAL-88912',
      tags: ['Packing Slip', 'Manifest', 'Inventory', 'Transit-Audit', 'Tamper-Seal'],
      clientName: 'Dr. Yerima Forfor',
      clientCompany: 'Apex Corporate Chambers',
      clientPhone: '+234 803 892 1102',
      recommendedVehicle: '10-Ton Heavy Logistics Truck (Hydraulic Liftgate)',
      totalCbm: 14.8,
      totalPieces: 52,
      sealNumbers: ['PYDA-SEAL-88910 to SEAL-88915'],
      vehicleType: '10-Ton Heavy Logistics Truck',
      driverName: 'Captain S. Bello (Pyda Fleet)',
      inspectorName: 'M. Ibrahim (Senior Inventory Marshall)',
      packingSlipRef: 'PSL-PYDA-2026-512',
      inventoryItems: INITIAL_INVENTORY_ITEMS,
    },
    {
      id: 'DOC-BOL-2026-782',
      title: 'Official Straight Bill of Lading (BOL) - Consignment #MGT-LAG-ABJ-891',
      docType: 'bill_of_lading',
      referenceNumber: 'BOL-MGT-LAGABJ-782',
      issuedDate: '2026-08-22',
      expiryDate: '2026-09-22',
      status: 'active',
      fileSize: '540 KB',
      underwriterOrIssuer: 'Pyda Movers Highway Haulage Directorate',
      coverageAmountNaira: 30000000,
      originCity: 'Plot 14, Victoria Island, Lagos Hub',
      destinationCity: 'Maitama District, Abuja, FCT',
      signatories: ['Carrier: Captain Bello (Lead Convoy Captain)', 'Shipper: Dr. Yerima Forfor (Authorized Client)'],
      summaryText: 'Official Non-Negotiable Straight Bill of Lading issued under Carriage of Goods by Road Act. Consignment comprising 74 weather-sealed crates, executive IT assets, tamper seal #SEAL-99482, and GPS transponder #MGT-SAT-889.',
      verifiedStampCode: 'BOL-LEGAL-DISPATCH-782',
      tags: ['Bill of Lading', 'BOL', 'Waybill', 'Highway Transit', 'Verified'],
    },
    {
      id: 'DOC-INS-2026-912',
      title: 'Goods-In-Transit (GIT) Gold All-Risk Marine & Cargo Policy',
      docType: 'insurance_certificate',
      referenceNumber: 'NIA-GIT-POL-99214-B',
      issuedDate: '2026-08-21',
      expiryDate: '2026-10-21',
      status: 'active',
      fileSize: '460 KB',
      underwriterOrIssuer: 'Leadway Assurance Plc & AIICO Consortium',
      coverageAmountNaira: 20000000,
      originCity: 'Victoria Island, Lagos Hub',
      destinationCity: 'Maitama, Abuja FCT',
      signatories: ['Chief Underwriter (Leadway Assurance)', 'T. Adeleke (Authorized Client)'],
      summaryText: 'Official Goods-In-Transit Gold All-Risk Certificate guaranteeing full cargo indemnity, zero deductible, and 48-hour express claim resolution.',
      verifiedStampCode: 'NIA-CERT-VERIFIED-2026-912',
      tags: ['Insurance', 'Leadway', 'All-Risk', 'Gold Policy'],
    },
    {
      id: 'DOC-MSA-2026-318',
      title: 'Signed Master Relocation & Commercial Haulage Service Agreement',
      docType: 'moving_agreement',
      referenceNumber: 'MSA-PYDA-2026-089',
      issuedDate: '2026-08-19',
      expiryDate: '2027-08-19',
      status: 'signed',
      fileSize: '680 KB',
      underwriterOrIssuer: 'Pyda Logistics Legal & Compliance Directorate',
      coverageAmountNaira: 15000000,
      originCity: 'Lagos Corporate Hub',
      destinationCity: 'Nationwide Delivery Network',
      signatories: ['Engr. O. Bello (VP Operations, Pyda)', 'Chief Emeka Adeleke (Managing Director)'],
      summaryText: 'Executed bilateral Master Service Agreement establishing SLAs, guaranteed dispatch timelines, tamper-proof chain-of-custody protocols, and professional white-glove uncrating standards.',
      verifiedStampCode: 'LEGAL-EXEC-MGT-2026-88',
      tags: ['Agreement', 'Contract', 'Corporate SLA', 'Signed'],
    },
    {
      id: 'DOC-WBL-2026-441',
      title: 'Tamper-Proof Electronic Waybill & Consignment Handover Manifest',
      docType: 'waybill_manifest',
      referenceNumber: 'WBL-LAG-ABJ-90482',
      issuedDate: '2026-08-22',
      status: 'active',
      fileSize: '310 KB',
      underwriterOrIssuer: 'Pyda Central Dispatch Office (Lagos Branch)',
      coverageAmountNaira: 25000000,
      originCity: 'Plot 14, Victoria Island, Lagos',
      destinationCity: 'Maitama District, Abuja, FCT',
      signatories: ['Captain S. Danjuma (Lead Convoy Captain)', 'M. Ibrahim (Site Loading Supervisor)'],
      summaryText: 'Official dispatch manifest detailing 68 sealed cartons, 14 padded furniture modules, GPS tracking transponder #GPS-889, and tamper seal serial numbers #SEAL-99482 through #SEAL-99486.',
      verifiedStampCode: 'WAYBILL-DISPATCH-90482-OK',
      tags: ['Waybill', 'Tamper-Seal', 'Manifest', 'Active Transit'],
    },
    {
      id: 'DOC-REC-2026-105',
      title: 'Official Moving Invoice & 100% Tax Clearance Receipt',
      docType: 'payment_receipt',
      referenceNumber: 'INV-MGT-2026-7731',
      issuedDate: '2026-08-20',
      status: 'settled',
      fileSize: '250 KB',
      underwriterOrIssuer: 'Pyda Movers Finance & Accounts',
      coverageAmountNaira: 1450000,
      originCity: 'Lagos',
      destinationCity: 'Abuja',
      signatories: ['F. Ogundimu (Chief Financial Officer)'],
      summaryText: 'Payment confirmation for Corporate Executive Relocation Package including hydraulic liftgate haulage, 5-layer weather barrier wrapping, and full GIT insurance premium.',
      verifiedStampCode: 'FIRS-TIN-RECEIPT-VERIFIED',
      tags: ['Invoice', 'Settled', 'Receipt', 'Tax-Compliant'],
    },
  ];

  // Vault Documents State
  const [localDocuments, setLocalDocuments] = useState<VaultDocument[]>(() => {
    try {
      const saved = localStorage.getItem(VAULT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge default BOL & Packing Slip if missing from previous session
          let result = [...parsed];
          const hasBol = result.some(
            (d: VaultDocument) =>
              d.docType === 'bill_of_lading' ||
              d.id === 'DOC-BOL-2026-782' ||
              d.title.toLowerCase().includes('bill of lading')
          );
          if (!hasBol) {
            const bolDoc = defaultVaultDocs.find((d) => d.id === 'DOC-BOL-2026-782');
            if (bolDoc) result = [bolDoc, ...result];
          }
          const hasPackingSlip = result.some(
            (d: VaultDocument) =>
              d.docType === 'packing_slip' ||
              d.id === 'DOC-PSL-2026-512' ||
              d.title.toLowerCase().includes('packing slip')
          );
          if (!hasPackingSlip) {
            const pslDoc = defaultVaultDocs.find((d) => d.id === 'DOC-PSL-2026-512');
            if (pslDoc) result = [pslDoc, ...result];
          }
          const hasCarHire = result.some(
            (d: VaultDocument) =>
              d.docType === 'car_hire_invoice' ||
              d.docType === 'car_hire_receipt' ||
              d.id === 'DOC-CHI-2026-891'
          );
          if (!hasCarHire) {
            result = [...SAMPLE_CAR_HIRE_VAULT_DOCS, ...result];
          }
          return result;
        }
      }
    } catch {}

    return defaultVaultDocs;
  });

  const { saveDocumentToCloud } = useAuth();

  // Combine Firestore and local documents
  const documents = useMemo(() => {
    if (userDocuments && userDocuments.length > 0) {
      return userDocuments;
    }
    return localDocuments;
  }, [userDocuments, localDocuments]);

  // Filter & Search State
  const [selectedType, setSelectedType] = useState<'all' | VaultDocumentType | 'car_hire'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewDoc, setPreviewDoc] = useState<VaultDocument | null>(null);

  // Synchronize new documents added dynamically (e.g. from QuoteCalculatorModal auto-proforma)
  useEffect(() => {
    const handleVaultDocAdded = (event: any) => {
      const addedDoc = event?.detail as VaultDocument | undefined;
      try {
        const saved = localStorage.getItem(VAULT_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setLocalDocuments(parsed);
          }
        } else if (addedDoc) {
          setLocalDocuments((prev) => [addedDoc, ...prev.filter((d) => d.id !== addedDoc.id)]);
        }
      } catch (e) {}

      if (addedDoc) {
        setPreviewDoc(addedDoc);
        setToastMessage({
          type: 'success',
          text: `Pro-Forma Commercial Invoice #${addedDoc.referenceNumber} has been vaulted and is ready to view or download!`,
        });
        setTimeout(() => setToastMessage(null), 6000);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === VAULT_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setLocalDocuments(parsed);
        } catch {}
      }
    };

    window.addEventListener('vault_document_added', handleVaultDocAdded);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('vault_document_added', handleVaultDocAdded);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Open initial doc if requested
  useEffect(() => {
    if (initialDocId) {
      const match = documents.find((d) => d.id === initialDocId);
      if (match) {
        setPreviewDoc(match);
      }
    }
  }, [initialDocId, documents]);

  // Multi-Selection State for Bulk Print / Export
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [isBulkPrintModalOpen, setIsBulkPrintModalOpen] = useState<boolean>(false);

  // Live Print-Friendly Preview Modal State
  const [printPreviewDoc, setPrintPreviewDoc] = useState<VaultDocument | null>(null);
  const [isPrintPreviewModalOpen, setIsPrintPreviewModalOpen] = useState<boolean>(false);
  const [isPackingSlipModalOpen, setIsPackingSlipModalOpen] = useState<boolean>(false);

  const handleOpenPrintPreview = (doc: VaultDocument) => {
    setPrintPreviewDoc(doc);
    setIsPrintPreviewModalOpen(true);
  };

  // SMS Gateway & Modal States
  const [isIssueModalOpen, setIsIssueModalOpen] = useState<boolean>(false);
  const [isSmsLogModalOpen, setIsSmsLogModalOpen] = useState<boolean>(false);
  const [resendingDocId, setResendingDocId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  // Sync to localStorage / Cloud
  const saveDocsToStorage = async (updatedDocs: VaultDocument[]) => {
    setLocalDocuments(updatedDocs);
    try {
      localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(updatedDocs));
    } catch (e) {
      console.error('Failed to save vault docs', e);
    }
  };

  // Resend SMS text alert for any certificate
  const handleResendSms = async (doc: VaultDocument, customPhone?: string) => {
    setResendingDocId(doc.id);
    const targetPhone = customPhone || doc.smsRecipientPhone || currentUser.phone || '08062466212';
    try {
      const response = await fetch('/api/sms/notify-insurance-certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cert: doc,
          recipientPhone: targetPhone,
          recipientName: currentUser.fullName,
          vaultUrl: `${window.location.origin}/?view=dashboard&tab=vault`,
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        const updated = documents.map((d) =>
          d.id === doc.id
            ? {
                ...d,
                smsNotificationSent: true,
                smsRecipientPhone: targetPhone,
                smsDispatchedAt: new Date().toISOString(),
                smsMessageSid: data.result?.messageSid,
              }
            : d
        );
        saveDocsToStorage(updated);
        if (previewDoc && previewDoc.id === doc.id) {
          setPreviewDoc({
            ...previewDoc,
            smsNotificationSent: true,
            smsRecipientPhone: targetPhone,
            smsDispatchedAt: new Date().toISOString(),
            smsMessageSid: data.result?.messageSid,
          });
        }
        setToastMessage({
          type: 'success',
          text: `SMS alert dispatched to ${targetPhone} via ${data.result?.provider?.toUpperCase() || 'TWILIO'} gateway!`,
        });
      } else {
        setToastMessage({
          type: 'error',
          text: `SMS dispatch failed: ${data.message || 'Error'}`,
        });
      }
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: `Network error dispatching SMS alert: ${err.message}`,
      });
    } finally {
      setResendingDocId(null);
      setTimeout(() => setToastMessage(null), 6000);
    }
  };

  const handleCertificateIssued = (
    newCert: VaultDocument,
    smsStatus?: { sent: boolean; recipient: string; provider: string; messageSid?: string }
  ) => {
    saveDocsToStorage([newCert, ...documents]);
    setPreviewDoc(newCert);
    if (smsStatus?.sent) {
      setToastMessage({
        type: 'success',
        text: `Policy #${newCert.referenceNumber} created & SMS notification sent to ${smsStatus.recipient} via ${smsStatus.provider.toUpperCase()} Gateway!`,
      });
    } else {
      setToastMessage({
        type: 'info',
        text: `Insurance policy #${newCert.referenceNumber} created and saved in Document Vault.`,
      });
    }
    setTimeout(() => setToastMessage(null), 6000);
  };

  // Multi-Selection Helper Functions
  const toggleSelectDoc = (docId: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const handleSelectAllFiltered = () => {
    const allFilteredIds = filteredDocs.map((d) => d.id);
    const allSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedDocIds.includes(id));
    if (allSelected) {
      setSelectedDocIds((prev) => prev.filter((id) => !allFilteredIds.includes(id)));
    } else {
      setSelectedDocIds((prev) => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  const handleClearSelection = () => {
    setSelectedDocIds([]);
  };

  const handleSelectCategory = (category: 'insurance' | 'bol' | 'invoice' | 'packing_slip' | 'car_hire' | 'all') => {
    if (category === 'all') {
      setSelectedDocIds(documents.map((d) => d.id));
    } else if (category === 'car_hire') {
      const ids = documents
        .filter(
          (d) =>
            d.docType === 'car_hire_invoice' ||
            d.docType === 'car_hire_receipt' ||
            d.serviceType === 'car_hire' ||
            d.title.toLowerCase().includes('car hire') ||
            (d.tags && d.tags.some((t) => t.toLowerCase().includes('car hire')))
        )
        .map((d) => d.id);
      setSelectedDocIds(ids);
    } else if (category === 'invoice') {
      const ids = documents
        .filter(
          (d) =>
            d.docType === 'proforma_invoice' ||
            (d.tags && d.tags.some((t) => t.toLowerCase().includes('invoice') || t.toLowerCase().includes('pro-forma'))) ||
            d.title.toLowerCase().includes('pro-forma') ||
            d.title.toLowerCase().includes('invoice')
        )
        .map((d) => d.id);
      setSelectedDocIds(ids);
    } else if (category === 'packing_slip') {
      const ids = documents
        .filter(
          (d) =>
            d.docType === 'packing_slip' ||
            (d.tags && d.tags.some((t) => t.toLowerCase().includes('packing slip') || t.toLowerCase().includes('manifest'))) ||
            d.title.toLowerCase().includes('packing slip')
        )
        .map((d) => d.id);
      setSelectedDocIds(ids);
    } else if (category === 'insurance') {
      const ids = documents
        .filter(
          (d) =>
            d.docType === 'insurance_certificate' ||
            (d.tags && d.tags.some((t) => t.toLowerCase().includes('insurance'))) ||
            d.title.toLowerCase().includes('insurance')
        )
        .map((d) => d.id);
      setSelectedDocIds(ids);
    } else if (category === 'bol') {
      const ids = documents
        .filter(
          (d) =>
            d.docType === 'bill_of_lading' ||
            (d.tags && d.tags.some((t) => t.toLowerCase().includes('lading') || t.toLowerCase().includes('bol'))) ||
            d.title.toLowerCase().includes('bill of lading') ||
            d.title.toLowerCase().includes('bol') ||
            d.docType === 'waybill_manifest'
        )
        .map((d) => d.id);
      setSelectedDocIds(ids);
    }
  };

  // Selected Documents memo
  const selectedDocs = useMemo(() => {
    return documents.filter((d) => selectedDocIds.includes(d.id));
  }, [documents, selectedDocIds]);

  const selectedValuation = useMemo(() => {
    return selectedDocs.reduce((sum, d) => sum + (d.coverageAmountNaira || 0), 0);
  }, [selectedDocs]);

  const handleDirectBulkDownload = () => {
    if (selectedDocs.length === 0) {
      setIsBulkPrintModalOpen(true);
      return;
    }
    try {
      const { packageRef } = downloadConsolidatedPackage(selectedDocs, currentUser, {
        companyPhone: phone,
      });
      setToastMessage({
        type: 'success',
        text: `Consolidated Package #${packageRef} (${selectedDocs.length} documents) compiled & downloaded!`,
      });
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: `Failed to compile package: ${err.message}`,
      });
    }
    setTimeout(() => setToastMessage(null), 6000);
  };

  const handleDirectBulkPrint = () => {
    if (selectedDocs.length === 0) {
      setIsBulkPrintModalOpen(true);
      return;
    }
    try {
      const { packageRef } = printConsolidatedPackage(selectedDocs, currentUser, {
        companyPhone: phone,
      });
      setToastMessage({
        type: 'success',
        text: `Consolidated Package #${packageRef} (${selectedDocs.length} documents) sent to print engine!`,
      });
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: `Failed to print package: ${err.message}`,
      });
    }
    setTimeout(() => setToastMessage(null), 6000);
  };

  const handlePackageExported = (packageRef: string, count: number, mode: 'download' | 'print') => {
    setToastMessage({
      type: 'success',
      text: `Package #${packageRef} (${count} documents) ${mode === 'download' ? 'compiled & downloaded' : 'opened for printing'}!`,
    });
    setTimeout(() => setToastMessage(null), 6000);
  };

  // Filtered Documents
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      let matchesType = false;
      if (selectedType === 'all') {
        matchesType = true;
      } else if (selectedType === 'car_hire') {
        matchesType =
          doc.docType === 'car_hire_invoice' ||
          doc.docType === 'car_hire_receipt' ||
          doc.serviceType === 'car_hire' ||
          doc.title.toLowerCase().includes('car hire') ||
          (doc.tags && doc.tags.some((t) => t.toLowerCase().includes('car hire')));
      } else if (selectedType === 'proforma_invoice') {
        matchesType =
          doc.docType === 'proforma_invoice' ||
          doc.title.toLowerCase().includes('pro-forma') ||
          doc.title.toLowerCase().includes('invoice') ||
          (doc.tags && doc.tags.some((t) => t.toLowerCase().includes('invoice') || t.toLowerCase().includes('pro-forma')));
      } else if (selectedType === 'packing_slip') {
        matchesType =
          doc.docType === 'packing_slip' ||
          doc.title.toLowerCase().includes('packing slip') ||
          (doc.tags && doc.tags.some((t) => t.toLowerCase().includes('packing slip') || t.toLowerCase().includes('manifest')));
      } else if (selectedType === 'bill_of_lading') {
        matchesType =
          doc.docType === 'bill_of_lading' ||
          doc.title.toLowerCase().includes('bill of lading') ||
          doc.title.toLowerCase().includes('bol') ||
          (doc.tags && doc.tags.some((t) => t.toLowerCase().includes('lading') || t.toLowerCase().includes('bol')));
      } else if (selectedType === 'insurance_certificate') {
        matchesType =
          doc.docType === 'insurance_certificate' ||
          (doc.tags && doc.tags.some((t) => t.toLowerCase().includes('insurance'))) ||
          doc.title.toLowerCase().includes('insurance');
      } else {
        matchesType = doc.docType === selectedType;
      }

      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        doc.title.toLowerCase().includes(q) ||
        doc.referenceNumber.toLowerCase().includes(q) ||
        doc.summaryText.toLowerCase().includes(q) ||
        (doc.tags && doc.tags.some((t) => t.toLowerCase().includes(q)));
      return matchesType && matchesSearch;
    });
  }, [documents, selectedType, searchQuery]);

  // Generate & Download Formal Document PDF
  const handleDownloadPdf = (docData: VaultDocument) => {
    if (
      docData.docType === 'car_hire_invoice' ||
      docData.docType === 'car_hire_receipt' ||
      docData.serviceType === 'car_hire' ||
      docData.title.toLowerCase().includes('car hire')
    ) {
      const isReceipt = docData.docType === 'car_hire_receipt' || docData.status === 'settled';
      downloadCarHirePdf(docData, isReceipt, phone);
      return;
    }

    if (docData.docType === 'proforma_invoice' || docData.title.toLowerCase().includes('pro-forma')) {
      downloadProformaInvoicePdf(docData, phone);
      return;
    }

    if (docData.docType === 'packing_slip' || docData.title.toLowerCase().includes('packing slip')) {
      const packingData: PackingSlipData = {
        packingSlipRef: docData.packingSlipRef || docData.referenceNumber,
        issuedDate: docData.issuedDate,
        dispatchDate: docData.issuedDate,
        clientName: docData.clientName || currentUser.fullName || 'Valued Consignee',
        clientCompany: docData.clientCompany || currentUser.companyName,
        clientPhone: docData.clientPhone || currentUser.phone || phone,
        clientEmail: docData.clientEmail || currentUser.email,
        originAddress: docData.originCity || 'Plot 14, Victoria Island, Lagos Hub',
        destinationAddress: docData.destinationCity || 'Maitama District, Abuja FCT',
        serviceType: docData.serviceType || 'Corporate Executive Relocation',
        assignedVehicle: docData.recommendedVehicle || docData.vehicleType || '10-Ton Heavy Logistics Truck (Hydraulic Liftgate)',
        driverName: docData.driverName || 'Captain S. Bello (Pyda Fleet)',
        inspectorName: docData.inspectorName || 'M. Ibrahim (Senior Inventory Marshall)',
        tamperSealRange: docData.sealNumbers?.join(', ') || 'PYDA-SEAL-88910 to SEAL-88915',
        items: docData.inventoryItems && docData.inventoryItems.length > 0 ? docData.inventoryItems : INITIAL_INVENTORY_ITEMS,
        surveyPhotosCount: docData.surveyPhotosCount,
        totalCbm: docData.totalCbm || 14.8,
        handlingInstructions: docData.handlingInstructions,
        pkiVerificationCode: docData.verifiedStampCode,
      };
      downloadPackingSlipPdf(packingData, phone);
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const timestamp = new Date().toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // 1. Header Banner & Branding
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 42, 'F');

    // Amber Accent Line
    doc.setFillColor(245, 158, 11); // amber-500
    doc.rect(0, 42, pageWidth, 2.5, 'F');

    // Title
    doc.setTextColor(245, 158, 11);
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text('PYDA MOVERS & LOGISTICS NIGERIA', 14, 16);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Client Document Vault • Legally Certified Executed Copy', 14, 23);
    doc.text(`Security Verification: ${docData.verifiedStampCode} | Issued: ${docData.issuedDate}`, 14, 29);
    doc.text(`Official Corporate Hotline: ${phone} | legal@pydamovers.ng`, 14, 35);

    // Reference Pill
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(pageWidth - 76, 10, 62, 22, 2, 2, 'F');
    doc.setTextColor(245, 158, 11);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('DOCUMENT REF / CERT', pageWidth - 72, 17);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9.5);
    doc.text(docData.referenceNumber, pageWidth - 72, 26);

    let currentY = 54;

    // Document Title Heading
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(docData.title, 14, currentY);
    currentY += 6;

    // Status Badge
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Document Category: ${docData.docType.replace('_', ' ').toUpperCase()} | Status: ${docData.status.toUpperCase()}`, 14, currentY);
    currentY += 6;

    // 2. Executive Specification Card
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, currentY, 182, 54, 2, 2, 'FD');

    const col1X = 18;
    const col2X = 108;
    let gridY = currentY + 8;

    // Column 1
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('PRIMARY BENEFICIARY / CLIENT', col1X, gridY);
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(currentUser.fullName, col1X, gridY + 5.5);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('ISSUING AUTHORITY / UNDERWRITER', col1X, gridY + 14);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(docData.underwriterOrIssuer || 'Pyda Logistics Legal Office', col1X, gridY + 19.5);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('TRANSIT ROUTE / JURISDICTION', col1X, gridY + 28);
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${docData.originCity || 'Lagos Hub'} ➔ ${docData.destinationCity || 'Destination Depot'}`, col1X, gridY + 33.5);

    // Column 2
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('COVERAGE / VALUATION LIMIT', col2X, gridY);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(217, 119, 6); // amber-600
    doc.text(
      docData.coverageAmountNaira
        ? `₦${docData.coverageAmountNaira.toLocaleString('en-NG')}`
        : 'Full Comprehensive Cover',
      col2X,
      gridY + 5.5
    );

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('EFFECTIVE VALIDITY PERIOD', col2X, gridY + 14);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(`From: ${docData.issuedDate} ${docData.expiryDate ? `to ${docData.expiryDate}` : '(Permanent Record)'}`, col2X, gridY + 19.5);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('DIGITAL AUTHENTICATION SEAL', col2X, gridY + 28);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 150, 105);
    doc.text(`CERTIFIED: ${docData.verifiedStampCode}`, col2X, gridY + 33.5);

    currentY += 62;

    // 3. Document Summary & Covenant Text Box
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Document Provisions, Schedule & Legal Stipulations', 14, currentY);
    currentY += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const splitSummary = doc.splitTextToSize(docData.summaryText, 180);
    doc.text(splitSummary, 14, currentY);
    currentY += splitSummary.length * 5 + 4;

    // Standard Legal Clauses Table
    doc.setFillColor(241, 245, 249);
    doc.rect(14, currentY, 182, 6.5, 'F');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('CORE COVENANT & COMPLIANCE STIPULATIONS', 18, currentY + 4.5);
    currentY += 6.5;

    const clauses = [
      ['Zero-Loss Guarantee', 'Full replacement indemnity without sub-limits on insured electronics, furniture, or fine cargo.'],
      ['Chain of Custody', 'Strict driver telematics and dual-custody verification at both origin loading and destination uncrating.'],
      ['Fast-Track Settlement', 'Direct 48-72 hour claims settlement protocol with Leadway Assurance and AIICO Insurance.'],
      ['Regulatory Compliance', 'Fully licensed under Nigerian Insurers Association (NIA) & National Transport Commission.'],
    ];

    clauses.forEach(([title, desc], idx) => {
      const rowBg = idx % 2 === 0 ? 255 : 250;
      doc.setFillColor(rowBg, rowBg, rowBg);
      doc.rect(14, currentY, 182, 6.5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`• ${title}:`, 18, currentY + 4.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(desc, 56, currentY + 4.5);

      currentY += 6.5;
    });

    currentY += 6;

    // 4. Signatories & Verification Seals
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Executed Signatures & Electronic Endorsements', 14, currentY);
    currentY += 5;

    // Two Signature Blocks
    const sigBoxWidth = 88;
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    
    // Left Box
    doc.roundedRect(14, currentY, sigBoxWidth, 24, 2, 2, 'FD');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('AUTHORIZED CARRIER & UNDERWRITER', 18, currentY + 5.5);
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(docData.signatories?.[0] || 'Pyda Legal Directorate', 18, currentY + 12);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(5, 150, 105);
    doc.text('✓ Digitally Signed & Sealed (PKI Encrypted)', 18, currentY + 18);

    // Right Box
    doc.roundedRect(108, currentY, sigBoxWidth, 24, 2, 2, 'FD');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('CLIENT / AUTHORIZED REPRESENTATIVE', 112, currentY + 5.5);
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(docData.signatories?.[1] || currentUser.fullName, 112, currentY + 12);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(5, 150, 105);
    doc.text('✓ Verified Client Signature Recorded', 112, currentY + 18);

    currentY += 30;

    // Footer Stamp
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(`Pyda Movers Document Vault Certificate • Generated ${timestamp}`, 14, currentY);
    doc.text(`Official Stamp: ${docData.verifiedStampCode}`, pageWidth - 78, currentY);

    // Save File
    doc.save(`Pyda_${docData.referenceNumber}.pdf`);
  };

  // Quick Generate New Insurance Certificate
  const handleGenerateSampleCert = () => {
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const newCert: VaultDocument = {
      id: `DOC-INS-2026-${randomId}`,
      title: 'Goods-In-Transit (GIT) Gold All-Risk Marine & Cargo Policy',
      docType: 'insurance_certificate',
      referenceNumber: `NIA-GIT-POL-${randomId}-NG`,
      issuedDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active',
      fileSize: '460 KB',
      underwriterOrIssuer: 'Leadway Assurance Plc & AIICO Consortium',
      coverageAmountNaira: 20000000,
      originCity: currentUser.defaultCity || 'Lagos',
      destinationCity: 'Abuja Federal Capital Territory',
      signatories: ['Chief Underwriter (Leadway)', currentUser.fullName],
      summaryText: 'Official Goods-In-Transit Gold All-Risk Certificate guaranteeing full cargo indemnity, zero deductible, and 48-hour express claim resolution.',
      verifiedStampCode: `NIA-CERT-${randomId}-SECURE`,
      tags: ['Insurance', 'Gold All-Risk', 'Leadway', 'Express'],
    };

    saveDocsToStorage([newCert, ...documents]);
    setPreviewDoc(newCert);
  };

  return (
    <div className="space-y-6" id="client-document-vault">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 shadow-2xl animate-in slide-in-from-top-2 border ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300'
              : toastMessage.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/40 text-rose-300'
              : 'bg-amber-950/90 border-amber-500/40 text-amber-300'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs font-bold">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <Phone className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>

          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-xl font-black text-white">Client Document Vault</h3>
            <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>PKI Verified</span>
            </span>
            <span className="bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 hidden sm:flex">
              <Phone className="w-2.5 h-2.5" />
              <span>SMS Gateway Active</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Encrypted repository of your Goods-In-Transit (GIT) insurance policies, contracts, and manifests with automated Twilio SMS text alerts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Live Print-Friendly Preview Button */}
          <button
            type="button"
            onClick={() => {
              const targetDoc =
                (selectedDocIds.length > 0 && documents.find((d) => d.id === selectedDocIds[0])) ||
                filteredDocs[0] ||
                documents[0];
              if (targetDoc) handleOpenPrintPreview(targetDoc);
            }}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-slate-300 hover:text-amber-400 font-bold text-xs px-3.5 py-2.5 rounded-xl shadow flex items-center gap-1.5 transition-all active:scale-95"
            id="open-vault-print-preview-btn"
            title="Open Live Print-Friendly Preview modal before committing to physical printer"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>Print Preview</span>
          </button>

          {/* Bulk Print Package Button */}
          <button
            type="button"
            onClick={() => setIsBulkPrintModalOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 border border-amber-500/50 hover:border-amber-400 text-amber-400 hover:text-amber-300 font-bold text-xs px-3.5 py-2.5 rounded-xl shadow flex items-center gap-1.5 transition-all active:scale-95 relative"
            id="open-bulk-print-modal-vault-btn"
            title="Export or print multiple selected Insurance Certificates and Bills of Lading as a consolidated package"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>Bulk Print Package</span>
            {selectedDocIds.length > 0 && (
              <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-full font-mono ml-0.5">
                {selectedDocIds.length}
              </span>
            )}
          </button>

          {/* Export Packing Slip Button */}
          <button
            type="button"
            onClick={() => setIsPackingSlipModalOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-slate-300 hover:text-amber-400 font-bold text-xs px-3.5 py-2.5 rounded-xl shadow flex items-center gap-1.5 transition-all active:scale-95"
            id="open-export-packing-slip-vault-btn"
            title="Export your Inventory Planner manifest as a certified, professional PDF packing slip"
          >
            <ClipboardList className="w-3.5 h-3.5 text-amber-400" />
            <span>Export Packing Slip</span>
          </button>

          {/* SMS Gateway Hub Button */}
          <button
            type="button"
            onClick={() => setIsSmsLogModalOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-bold text-xs px-3 py-2.5 rounded-xl shadow flex items-center gap-1.5 transition-all active:scale-95"
            id="sms-gateway-logs-vault-btn"
            title="View SMS text delivery logs and gateway configuration"
          >
            <Phone className="w-3.5 h-3.5 text-blue-400" />
            <span>SMS Gateway</span>
          </button>

          {onOpenCarHireModal && (
            <button
              type="button"
              onClick={() => onOpenCarHireModal()}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow flex items-center gap-1.5 transition-all active:scale-95"
              id="new-car-hire-doc-vault-btn"
            >
              <Car className="w-3.5 h-3.5" />
              <span>+ New Car Hire Invoice/Receipt</span>
            </button>
          )}

          {onOpenSignModal && (
            <button
              type="button"
              onClick={() => onOpenSignModal()}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-2.5 rounded-xl shadow flex items-center gap-1.5 transition-all active:scale-95"
              id="open-sign-modal-vault-btn"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Sign Contract & Manifest</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsIssueModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-2.5 rounded-xl shadow flex items-center gap-1.5 transition-all active:scale-95"
            id="generate-vault-cert-btn"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Issue Insurance Policy</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-lg">
        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
          {[
            { id: 'all', label: 'All Documents' },
            { id: 'car_hire', label: 'Car Hire (Invoices & Receipts)' },
            { id: 'proforma_invoice', label: 'Pro-Forma Invoices' },
            { id: 'packing_slip', label: 'Packing Slips & Manifests' },
            { id: 'insurance_certificate', label: 'Insurance Certificates' },
            { id: 'bill_of_lading', label: 'Bill of Lading (BOL)' },
            { id: 'waybill_manifest', label: 'Waybills & Manifests' },
            { id: 'moving_agreement', label: 'Moving Agreements' },
            { id: 'payment_receipt', label: 'Payment Receipts' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedType(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedType === tab.id
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search policy / ref number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl pl-9 pr-3 py-2 outline-none focus:border-amber-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Bulk Selection & Action Control Strip */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-md">
        <div className="flex flex-wrap items-center gap-2">
          {/* Select All Toggle Checkbox */}
          <button
            type="button"
            onClick={handleSelectAllFiltered}
            className="flex items-center gap-2 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-800 transition-colors"
            id="select-all-filtered-docs-btn"
          >
            {filteredDocs.length > 0 && filteredDocs.every((d) => selectedDocIds.includes(d.id)) ? (
              <CheckSquare className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            ) : (
              <Square className="w-4 h-4 text-slate-500" />
            )}
            <span>Select All in View ({filteredDocs.length})</span>
          </button>

          {/* Quick Category Selectors */}
          <span className="text-slate-600 text-xs font-bold hidden sm:inline">•</span>
          <button
            type="button"
            onClick={() => handleSelectCategory('car_hire')}
            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-[11px] font-bold px-2.5 py-1.5 rounded-xl border border-emerald-500/30 transition-colors flex items-center gap-1"
          >
            <Car className="w-3 h-3 text-[#83b735]" />
            <span>+ Car Hire Docs</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelectCategory('invoice')}
            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-[11px] font-bold px-2.5 py-1.5 rounded-xl border border-emerald-500/30 transition-colors"
          >
            + All Invoices
          </button>
          <button
            type="button"
            onClick={() => handleSelectCategory('insurance')}
            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[11px] font-bold px-2.5 py-1.5 rounded-xl border border-amber-500/30 transition-colors"
          >
            + All Insurance Certs
          </button>
          <button
            type="button"
            onClick={() => handleSelectCategory('bol')}
            className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-[11px] font-bold px-2.5 py-1.5 rounded-xl border border-blue-500/30 transition-colors"
          >
            + All Bill of Lading (BOL)
          </button>

          {selectedDocIds.length > 0 && (
            <button
              type="button"
              onClick={handleClearSelection}
              className="text-slate-400 hover:text-rose-400 text-xs font-bold px-2 py-1 transition-colors"
            >
              Clear Selection
            </button>
          )}
        </div>

        {/* Selected Summary & Direct Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 justify-end">
          {selectedDocIds.length > 0 ? (
            <>
              <div className="text-right mr-1 hidden lg:block">
                <span className="text-[11px] font-mono font-bold text-amber-400 block">
                  {selectedDocIds.length} doc{selectedDocIds.length !== 1 ? 's' : ''} selected
                </span>
                {selectedValuation > 0 && (
                  <span className="text-[10px] text-slate-400 block font-mono">
                    Valuation: ₦{selectedValuation.toLocaleString('en-NG')}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsBulkPrintModalOpen(true)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5 shadow active:scale-95 transition-all"
                title="Open Bulk Print Package customizer"
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Configure Package</span>
              </button>

              <button
                type="button"
                onClick={handleDirectBulkPrint}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5 shadow active:scale-95 transition-all"
                title="Send selected documents to printer"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>Print ({selectedDocIds.length})</span>
              </button>

              <button
                type="button"
                onClick={handleDirectBulkDownload}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl shadow flex items-center gap-1.5 active:scale-95 transition-all"
                title="Download consolidated PDF package"
              >
                <FileDown className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Export Consolidated PDF ({selectedDocIds.length})</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsBulkPrintModalOpen(true)}
              className="text-[11px] text-slate-400 hover:text-amber-400 font-bold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Open Bulk Print & Export Package Window</span>
            </button>
          )}
        </div>
      </div>

      {/* Document Grid */}
      {filteredDocs.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
            <FileBadge className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-white text-sm">No Documents Found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">No documents matching your search filter. Generate a new insurance certificate or check back once your move agreement is finalized.</p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedType('all')}
            className="bg-slate-800 text-slate-300 font-bold text-xs px-4 py-2 rounded-xl"
          >
            Clear Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredDocs.map((doc) => {
            const isCarHire =
              doc.docType === 'car_hire_invoice' ||
              doc.docType === 'car_hire_receipt' ||
              doc.serviceType === 'car_hire' ||
              doc.title.toLowerCase().includes('car hire');
            const isInvoice =
              doc.docType === 'proforma_invoice' ||
              (doc.tags && doc.tags.some((t) => t.toLowerCase().includes('invoice') || t.toLowerCase().includes('pro-forma'))) ||
              doc.title.toLowerCase().includes('pro-forma') ||
              doc.title.toLowerCase().includes('invoice');
            const isPackingSlip =
              doc.docType === 'packing_slip' ||
              (doc.tags && doc.tags.some((t) => t.toLowerCase().includes('packing slip') || t.toLowerCase().includes('manifest'))) ||
              doc.title.toLowerCase().includes('packing slip');
            const isInsurance =
              doc.docType === 'insurance_certificate' ||
              (doc.tags && doc.tags.some((t) => t.toLowerCase().includes('insurance'))) ||
              doc.title.toLowerCase().includes('insurance');
            const isBol =
              doc.docType === 'bill_of_lading' ||
              (doc.tags && doc.tags.some((t) => t.toLowerCase().includes('lading') || t.toLowerCase().includes('bol'))) ||
              doc.title.toLowerCase().includes('bill of lading') ||
              doc.title.toLowerCase().includes('bol');
            const isAgreement = doc.docType === 'moving_agreement';
            const isWaybill = doc.docType === 'waybill_manifest';
            const isSelected = selectedDocIds.includes(doc.id);

            return (
              <div
                key={doc.id}
                className={`border rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/20 border-amber-500/60 ring-1 ring-amber-500/30'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      {/* Checkbox for Bulk Print selection */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectDoc(doc.id);
                        }}
                        className={`p-1 mt-0.5 rounded-lg transition-colors shrink-0 ${
                          isSelected
                            ? 'text-amber-400 hover:text-amber-300'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                        }`}
                        title={isSelected ? 'Deselect from Bulk Print package' : 'Select for Bulk Print package'}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-amber-400 fill-amber-400/20" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                        )}
                      </button>

                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                        isCarHire
                          ? 'bg-emerald-500/20 text-[#83b735] border border-emerald-500/30'
                          : isInvoice
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isPackingSlip
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : isInsurance
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : isBol
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : isAgreement
                          ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {isCarHire ? (
                          <Car className="w-5 h-5 text-[#83b735]" />
                        ) : isInvoice ? (
                          <Receipt className="w-5 h-5 text-emerald-400" />
                        ) : isPackingSlip ? (
                          <ClipboardList className="w-5 h-5 text-amber-400" />
                        ) : isInsurance ? (
                          <ShieldCheck className="w-5 h-5" />
                        ) : isBol ? (
                          <Truck className="w-5 h-5" />
                        ) : isAgreement ? (
                          <FileBadge className="w-5 h-5" />
                        ) : (
                          <FileText className="w-5 h-5" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-black text-amber-400 block uppercase truncate">
                            {doc.referenceNumber}
                          </span>
                          {isCarHire && (
                            <span className="bg-emerald-500/20 text-[#83b735] text-[9px] font-bold px-1.5 py-0.2 rounded font-mono uppercase">
                              {doc.carHireTripType === 'inter_state' ? 'Inter-State' : 'Intra-State'}{' '}
                              {doc.docType === 'car_hire_receipt' ? 'Receipt' : 'Invoice'}
                            </span>
                          )}
                          {!isCarHire && isInvoice && (
                            <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-bold px-1.5 py-0.2 rounded font-mono uppercase">
                              Pro-Forma
                            </span>
                          )}
                          {isPackingSlip && (
                            <span className="bg-amber-500/20 text-amber-300 text-[9px] font-bold px-1.5 py-0.2 rounded font-mono uppercase">
                              Packing Slip
                            </span>
                          )}
                          {isBol && (
                            <span className="bg-blue-500/20 text-blue-300 text-[9px] font-bold px-1.5 py-0.2 rounded font-mono uppercase">
                              BOL
                            </span>
                          )}
                          {isInsurance && (
                            <span className="bg-amber-500/20 text-amber-300 text-[9px] font-bold px-1.5 py-0.2 rounded font-mono uppercase">
                              Insurance
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm sm:text-base font-extrabold text-white leading-snug">
                          {doc.title}
                        </h4>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize shrink-0 ${
                      doc.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : doc.status === 'signed'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {doc.status}
                    </span>
                  </div>

                  {/* Summary Text */}
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {doc.summaryText}
                  </p>

                  {/* Metadata Pill Box */}
                  <div className="bg-slate-950 rounded-2xl p-3.5 border border-slate-850 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>{isInvoice ? 'Billing Entity:' : isPackingSlip ? 'Inventory Marshall:' : 'Underwriter / Authority:'}</span>
                      <span className="text-slate-200 font-medium truncate max-w-[60%] text-right">{doc.underwriterOrIssuer}</span>
                    </div>

                    {isPackingSlip && doc.totalCbm && (
                      <div className="flex justify-between text-slate-400">
                        <span>Manifest Volume / Items:</span>
                        <span className="text-amber-400 font-bold font-mono">
                          {doc.totalCbm} CBM ({doc.totalPieces || doc.inventoryItems?.length || 0} items)
                        </span>
                      </div>
                    )}

                    {doc.coverageAmountNaira && (
                      <div className="flex justify-between text-slate-400">
                        <span>{isInvoice ? 'Commercial Total (NGN):' : 'Coverage / Insured Sum:'}</span>
                        <span className="text-amber-400 font-bold font-mono">
                          ₦{doc.coverageAmountNaira.toLocaleString('en-NG')}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-400">
                      <span>Issued Date:</span>
                      <span className="text-slate-200 font-mono">{doc.issuedDate}</span>
                    </div>

                    <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800 text-[11px]">
                      <span>Digital PKI Seal:</span>
                      <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>{doc.verifiedStampCode}</span>
                      </span>
                    </div>

                    {/* SMS Gateway Status Pill */}
                    {isInsurance && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px]">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-blue-400" />
                          <span>SMS Gateway:</span>
                        </span>
                        {doc.smsNotificationSent ? (
                          <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                            <span>✓ Alert Sent ({doc.smsRecipientPhone || currentUser.phone})</span>
                          </span>
                        ) : (
                          <span className="text-amber-400 font-mono font-bold">
                            Pending Dispatch
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Tag list */}
                  {doc.tags && doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {doc.tags.map((tag) => (
                        <span key={tag} className="text-[10px] bg-slate-950 text-slate-400 px-2 py-0.5 rounded-md border border-slate-800">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setPreviewDoc(doc)}
                    className="flex-1 min-w-[75px] bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-2 px-2 rounded-xl border border-slate-700 flex items-center justify-center gap-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>View</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenPrintPreview(doc)}
                    className="flex-1 min-w-[75px] bg-slate-800 hover:bg-slate-750 text-amber-400 hover:text-amber-300 font-bold text-xs py-2 px-2 rounded-xl border border-slate-700/80 hover:border-amber-500/40 flex items-center justify-center gap-1 transition-all"
                    title="Live Print-Friendly Preview"
                    id={`print-preview-btn-${doc.id}`}
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>

                  {/* Direct SMS Notification Trigger / Resend Button */}
                  {isInsurance && (
                    <button
                      type="button"
                      onClick={() => handleResendSms(doc)}
                      disabled={resendingDocId === doc.id}
                      className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 font-bold text-xs py-2 px-2.5 rounded-xl flex items-center justify-center gap-1 transition-all active:scale-95 disabled:opacity-50"
                      title="Dispatch or resend SMS text alert with policy link to client phone"
                    >
                      {resendingDocId === doc.id ? (
                        <div className="w-3.5 h-3.5 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Phone className="w-3.5 h-3.5 text-blue-400" />
                      )}
                      <span>{doc.smsNotificationSent ? 'Resend' : 'SMS'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDownloadPdf(doc)}
                    className="flex-1 min-w-[85px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-2 px-2 rounded-xl flex items-center justify-center gap-1 transition-all shadow active:scale-98"
                    id={`download-doc-btn-${doc.id}`}
                  >
                    <FileDown className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Document Detail Preview Modal */}
      {previewDoc && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-mono text-xs font-black text-amber-400 uppercase">
                    {previewDoc.referenceNumber}
                  </span>
                  <h3 className="text-lg font-black text-white">{previewDoc.title}</h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Document Details Body */}
            <div className="space-y-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 font-bold block">Document Type</span>
                    <span className="text-white font-bold capitalize">{previewDoc.docType.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block">Coverage Sum Insured</span>
                    <span className="text-amber-400 font-mono font-bold text-sm">
                      {previewDoc.coverageAmountNaira ? `₦${previewDoc.coverageAmountNaira.toLocaleString('en-NG')}` : 'Full Replacement'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block">Issuing Authority</span>
                    <span className="text-slate-200">{previewDoc.underwriterOrIssuer}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block">Issued Date</span>
                    <span className="text-slate-200 font-mono">{previewDoc.issuedDate}</span>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-white mb-1.5">
                  {previewDoc.docType === 'proforma_invoice' || previewDoc.title.toLowerCase().includes('pro-forma')
                    ? 'Commercial Pro-Forma Scope & Overview'
                    : 'Executive Covenants & Scope of Cover'}
                </h5>
                <p className="text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  {previewDoc.summaryText}
                </p>
              </div>

              {/* Itemized Consignment Packing Manifest for Packing Slips */}
              {(previewDoc.docType === 'packing_slip' || previewDoc.inventoryItems || previewDoc.title.toLowerCase().includes('packing slip')) && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400 flex items-center gap-1.5 text-xs">
                      <ClipboardList className="w-4 h-4 text-amber-400" />
                      <span>Certified Consignment Packing Slip & Inventory Manifest</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-500/20 text-amber-300 border-amber-500/40 font-mono">
                      {previewDoc.totalCbm || 14.8} CBM • {previewDoc.totalPieces || previewDoc.inventoryItems?.length || 52} Units
                    </span>
                  </div>

                  {/* Transit Specifications */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-[11px]">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Allocated Heavy Fleet</span>
                      <span className="text-slate-200 font-bold truncate block">
                        {previewDoc.recommendedVehicle || previewDoc.vehicleType || '10-Ton Logistics Truck'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Security Tamper Seals</span>
                      <span className="text-amber-400 font-mono font-bold truncate block">
                        {previewDoc.sealNumbers?.join(', ') || 'SEAL-88910 to SEAL-88915'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Senior Marshall</span>
                      <span className="text-slate-200 font-medium truncate block">
                        {previewDoc.inspectorName || 'M. Ibrahim (Certified)'}
                      </span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {(previewDoc.inventoryItems || INITIAL_INVENTORY_ITEMS).map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="flex items-center justify-between bg-slate-900/60 hover:bg-slate-900 px-3 py-2 rounded-xl border border-slate-800/80 text-[11px]"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono text-[10px] text-slate-500 w-5">#{idx + 1}</span>
                          <span className="font-bold text-white truncate">{item.name}</span>
                          <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono uppercase">
                            {item.category}
                          </span>
                          {item.fragile && (
                            <span className="text-[9px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1.5 py-0.2 rounded font-bold">
                              Fragile
                            </span>
                          )}
                          {item.disassemblyRequired && (
                            <span className="text-[9px] bg-blue-500/20 text-blue-300 border border-blue-500/40 px-1.5 py-0.2 rounded font-bold">
                              Disassembly
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 shrink-0 font-mono text-[10px]">
                          <span className="text-amber-400 font-bold">Qty: {item.quantity}</span>
                          <span className="text-slate-400">{(item.cbm * item.quantity).toFixed(2)} CBM</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Itemized Commercial Breakdown for Car Hire Invoices & Receipts */}
              {(previewDoc.docType === 'car_hire_invoice' ||
                previewDoc.docType === 'car_hire_receipt' ||
                previewDoc.serviceType === 'car_hire' ||
                previewDoc.carHireTripType) && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#83b735] flex items-center gap-1.5 text-xs">
                      <Car className="w-4 h-4 text-[#83b735]" />
                      <span>
                        {previewDoc.carHireTripType === 'inter_state'
                          ? 'Inter-State Highway Transit'
                          : 'Intra-State City Charter'}{' '}
                        Specification
                      </span>
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border font-mono ${
                        previewDoc.docType === 'car_hire_receipt' || previewDoc.status === 'settled'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {previewDoc.docType === 'car_hire_receipt' || previewDoc.status === 'settled'
                        ? 'PAID IN FULL • TAX CLEARED'
                        : 'PRO-FORMA INVOICE • UNPAID'}
                    </span>
                  </div>

                  {/* Vehicle & Chauffeur Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-[11px]">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Assigned Luxury Fleet</span>
                      <span className="text-slate-200 font-bold truncate block">
                        {previewDoc.carHireVehicle || 'Executive Fleet Vehicle'}
                      </span>
                      <span className="text-amber-400 font-mono text-[10px]">
                        Plate: {previewDoc.carHirePlateNumber || 'ABJ-482-XY'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Assigned Chauffeur</span>
                      <span className="text-slate-200 font-medium truncate block">
                        {previewDoc.carHireChauffeurName || 'Vetted Senior Driver'}
                      </span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        Tel: {previewDoc.carHireChauffeurPhone || phone}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Charter Duration & Dates</span>
                      <span className="text-slate-200 font-bold block">
                        {previewDoc.carHireTotalDays || 1} Day{((previewDoc.carHireTotalDays || 1) > 1) ? 's' : ''}
                      </span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        {previewDoc.carHirePickupDate || previewDoc.issuedDate} → {previewDoc.carHireReturnDate || previewDoc.issuedDate}
                      </span>
                    </div>
                  </div>

                  {/* Financial Line Items */}
                  <div className="space-y-1.5 bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-[11px]">
                    <div className="flex justify-between text-slate-300 py-1 border-b border-slate-800/80">
                      <span>Base Vehicle Daily Charter Rate</span>
                      <span className="font-mono text-slate-200">
                        ₦{(
                          (previewDoc.carHireSubtotalNaira ||
                            Math.round((previewDoc.coverageAmountNaira || 150000) * 0.9)) -
                          (previewDoc.carHireTollNaira || 15000)
                        ).toLocaleString('en-NG')}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300 py-1 border-b border-slate-800/80">
                      <span>Highway Toll Passes & Express Lane Corridors</span>
                      <span className="font-mono text-slate-200">
                        ₦{(previewDoc.carHireTollNaira || (previewDoc.carHireTripType === 'inter_state' ? 20000 : 5000)).toLocaleString('en-NG')}
                      </span>
                    </div>
                    {previewDoc.carHireSecurityEscort && (
                      <div className="flex justify-between text-amber-300 py-1 border-b border-slate-800/80">
                        <span>Armed MOPOL Tactical Security Escort Convoy</span>
                        <span className="font-mono text-amber-400 font-bold">
                          ₦{((previewDoc.carHireTotalDays || 1) * 120000).toLocaleString('en-NG')}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-400 pt-1.5">
                      <span>Subtotal (Net Charter):</span>
                      <span className="font-mono text-slate-200 font-bold">
                        ₦{(previewDoc.carHireSubtotalNaira || Math.round((previewDoc.coverageAmountNaira || 150000) * 0.9)).toLocaleString('en-NG')}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Federal Statutory VAT (7.5%):</span>
                      <span className="font-mono text-emerald-400 font-bold">
                        ₦{(previewDoc.carHireVatNaira || Math.round((previewDoc.coverageAmountNaira || 150000) * 0.075)).toLocaleString('en-NG')}
                      </span>
                    </div>
                    <div className="flex justify-between text-white font-bold pt-2 border-t border-slate-700 text-xs">
                      <span>Total Amount (NGN):</span>
                      <span className="font-mono font-black text-[#83b735] text-sm">
                        ₦{(previewDoc.coverageAmountNaira || 150000).toLocaleString('en-NG')}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Itemized Commercial Breakdown for Pro-Forma Invoices */}
              {!previewDoc.carHireTripType &&
                previewDoc.serviceType !== 'car_hire' &&
                previewDoc.docType !== 'car_hire_invoice' &&
                previewDoc.docType !== 'car_hire_receipt' &&
                (previewDoc.docType === 'proforma_invoice' ||
                  previewDoc.quoteBreakdown ||
                  previewDoc.title.toLowerCase().includes('pro-forma')) && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-xs">
                      <Receipt className="w-4 h-4 text-emerald-400" />
                      <span>Itemized Schedule of Logistics & Freight Charges</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-mono">
                      VAT 7.5% Included
                    </span>
                  </div>

                  <div className="space-y-1.5 bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-[11px]">
                    <div className="flex justify-between text-slate-300 py-1 border-b border-slate-800/80">
                      <span>Base Relocation Crew & Loading Logistics</span>
                      <span className="font-mono text-slate-200">
                        ₦{(previewDoc.quoteBreakdown?.baseRateNaira || 180000).toLocaleString('en-NG')}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300 py-1 border-b border-slate-800/80">
                      <span>Inter-State Distance Freight Surcharge</span>
                      <span className="font-mono text-slate-200">
                        ₦{(previewDoc.quoteBreakdown?.distanceCostNaira || 345000).toLocaleString('en-NG')}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300 py-1 border-b border-slate-800/80">
                      <span>Access Difficulty & Terrain Surcharge</span>
                      <span className="font-mono text-slate-200">
                        ₦{(previewDoc.quoteBreakdown?.accessSurchargeNaira || 45000).toLocaleString('en-NG')}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300 py-1 border-b border-slate-800/80">
                      <span>Export Crating & Heavy Packing Materials</span>
                      <span className="font-mono text-slate-200">
                        ₦{(previewDoc.quoteBreakdown?.packingMaterialsNaira || 120000).toLocaleString('en-NG')}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300 py-1 border-b border-slate-800/80">
                      <span>Goods-In-Transit (GIT) Comprehensive Insurance</span>
                      <span className="font-mono text-slate-200">
                        ₦{(previewDoc.quoteBreakdown?.insuranceCostNaira || 65000).toLocaleString('en-NG')}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-400 pt-1.5">
                      <span>Subtotal (Net Freight & Logistics):</span>
                      <span className="font-mono text-slate-200 font-bold">
                        ₦{((previewDoc.quoteBreakdown?.subtotalNaira || previewDoc.coverageAmountNaira || 755000)).toLocaleString('en-NG')}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Value Added Tax (VAT 7.5%):</span>
                      <span className="font-mono text-slate-200 font-bold">
                        ₦{(Math.round((previewDoc.quoteBreakdown?.subtotalNaira || previewDoc.coverageAmountNaira || 755000) * 0.075)).toLocaleString('en-NG')}
                      </span>
                    </div>
                    <div className="flex justify-between text-emerald-400 pt-2 border-t border-slate-700 font-bold text-xs">
                      <span>Commercial Grand Total:</span>
                      <span className="font-mono font-black text-sm">
                        ₦{(previewDoc.quoteBreakdown?.totalPayableNaira || Math.round((previewDoc.coverageAmountNaira || 755000) * 1.075)).toLocaleString('en-NG')}
                        <span className="text-[10px] text-slate-400 font-normal ml-1">
                          (~${(previewDoc.quoteBreakdown?.totalPayableUsd || Math.round(((previewDoc.coverageAmountNaira || 755000) * 1.075) / 1450)).toLocaleString('en-US')})
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Corporate Bank Settlement Accounts */}
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1.5 text-[11px]">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                      Corporate Banking Settlement Accounts:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-850">
                        <span className="text-slate-400 block text-[10px]">Zenith Bank PLC (NGN)</span>
                        <span className="font-mono font-bold text-white text-xs">1018482910</span>
                        <span className="text-[10px] text-slate-500 block truncate">Megatrend Movers Logistics Nig Ltd</span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-850">
                        <span className="text-slate-400 block text-[10px]">First Bank of Nigeria (NGN)</span>
                        <span className="font-mono font-bold text-white text-xs">2038491029</span>
                        <span className="text-[10px] text-slate-500 block truncate">Megatrend Movers Logistics Nig Ltd</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SMS Notification Gateway Dispatch Details */}
              {previewDoc.docType === 'insurance_certificate' && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-blue-500/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-400 flex items-center gap-1.5 text-xs">
                      <Phone className="w-4 h-4 text-blue-400" />
                      <span>Twilio SMS Notification Gateway</span>
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        previewDoc.smsNotificationSent
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {previewDoc.smsNotificationSent ? 'Dispatched' : 'Ready to Send'}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <div className="space-y-0.5 text-slate-300 w-full">
                      <p>
                        Target Recipient:{' '}
                        <strong className="text-white font-mono">
                          {previewDoc.smsRecipientPhone || currentUser.phone || '08062466212'}
                        </strong>
                      </p>
                      {previewDoc.smsDispatchedAt && (
                        <p className="text-slate-400 text-[10px] font-mono">
                          Dispatched: {new Date(previewDoc.smsDispatchedAt).toLocaleString('en-GB')}
                        </p>
                      )}
                      {previewDoc.smsMessageSid && (
                        <p className="text-slate-500 text-[9px] font-mono">
                          SID: {previewDoc.smsMessageSid}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleResendSms(previewDoc)}
                      disabled={resendingDocId === previewDoc.id}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shrink-0 transition-all disabled:opacity-50"
                    >
                      {resendingDocId === previewDoc.id ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>{previewDoc.smsNotificationSent ? 'Resend SMS Text' : 'Dispatch SMS Alert'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Render Signature Record if Available */}
              {previewDoc.signatureRecord ? (
                <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400 flex items-center gap-1.5 text-xs">
                      <Stamp className="w-4 h-4 text-amber-400" />
                      <span>Executed Digital Signature Record</span>
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Legally Binding
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    {previewDoc.signatureRecord.signatureDataUrl && (
                      <div className="bg-white/10 p-2 rounded-lg max-w-[200px] shrink-0">
                        <img
                          src={previewDoc.signatureRecord.signatureDataUrl}
                          alt="Executed digital signature"
                          className="max-h-12 object-contain"
                        />
                      </div>
                    )}
                    <div className="space-y-1 text-slate-300 w-full">
                      <p className="font-bold text-white text-xs">
                        {previewDoc.signatureRecord.signedByName} <span className="text-slate-400 font-normal">({previewDoc.signatureRecord.signedRole})</span>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Signed: <span className="text-slate-200 font-mono">{previewDoc.signatureRecord.signedAt}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        PKI Seal: {previewDoc.signatureRecord.pkiVerificationCode} • Hash: {previewDoc.signatureRecord.ipHash}
                      </p>
                    </div>
                  </div>
                </div>
              ) : previewDoc.signatories && previewDoc.signatories.length > 0 ? (
                <div>
                  <h5 className="font-bold text-white mb-1.5">Recorded Signatures & Endorsements</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {previewDoc.signatories.map((sig, idx) => (
                      <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-slate-200 font-medium">{sig}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-2xl flex items-center justify-between text-emerald-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" />
                  <div>
                    <span className="font-bold block">PKI Authentication Validated</span>
                    <span className="text-[10px] text-emerald-300/80 font-mono">{previewDoc.verifiedStampCode}</span>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-md">
                  Tamper Proof
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
              <div>
                {!previewDoc.signatureRecord && previewDoc.docType === 'moving_agreement' && onOpenSignModal && (
                  <button
                    type="button"
                    onClick={() => {
                      const docToSign = previewDoc;
                      setPreviewDoc(null);
                      onOpenSignModal(docToSign);
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow flex items-center gap-1.5 transition-all"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Sign this Agreement Now</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-4 py-2.5 rounded-xl"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const d = previewDoc;
                    setPreviewDoc(null);
                    handleOpenPrintPreview(d);
                  }}
                  className="bg-slate-800 hover:bg-slate-750 text-amber-400 hover:text-amber-300 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
                  id="vault-preview-to-print-btn"
                  title="Open Live Print-Friendly Preview"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>Print Preview</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleDownloadPdf(previewDoc);
                    setPreviewDoc(null);
                  }}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow flex items-center gap-1.5 transition-all"
                  id="vault-download-doc-btn"
                >
                  <FileDown className="w-4 h-4 stroke-[2.5]" />
                  <span>
                    {previewDoc.docType === 'car_hire_invoice' ||
                    previewDoc.docType === 'car_hire_receipt' ||
                    previewDoc.title.toLowerCase().includes('car hire')
                      ? previewDoc.docType === 'car_hire_receipt' || previewDoc.status === 'settled'
                        ? 'Download Car Hire Receipt (PDF)'
                        : 'Download Car Hire Invoice (PDF)'
                      : previewDoc.docType === 'proforma_invoice' || previewDoc.title.toLowerCase().includes('pro-forma')
                      ? 'Download Pro-Forma Invoice (PDF)'
                      : 'Download PDF'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Issue Insurance Policy Modal with Live SMS Gateway */}
      <IssueInsuranceModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        currentUser={currentUser}
        onCertificateIssued={handleCertificateIssued}
      />

      {/* SMS Gateway Hub & Diagnostics Modal */}
      <SmsGatewayLogModal
        isOpen={isSmsLogModalOpen}
        onClose={() => setIsSmsLogModalOpen(false)}
      />

      {/* Floating Bottom Selection Action Bar */}
      {selectedDocIds.length > 0 && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border border-amber-500/50 backdrop-blur-md rounded-2xl px-4 py-3 shadow-2xl flex flex-wrap items-center justify-between gap-4 max-w-2xl w-[92vw] animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-sm shrink-0 font-mono">
              {selectedDocIds.length}
            </div>
            <div>
              <span className="font-bold text-white text-xs block">
                {selectedDocIds.length} Document{selectedDocIds.length !== 1 ? 's' : ''} Selected
              </span>
              <span className="text-[11px] text-amber-400/90 font-mono">
                {selectedValuation > 0 ? `Total: ₦${selectedValuation.toLocaleString('en-NG')} NGN` : 'Ready for consolidation'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearSelection}
              className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1.5 transition-colors"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={() => {
                const target = selectedDocs[0] || documents[0];
                if (target) handleOpenPrintPreview(target);
              }}
              className="bg-slate-800 hover:bg-slate-750 text-amber-400 hover:text-amber-300 font-bold text-xs px-3 py-2 rounded-xl border border-slate-750 flex items-center gap-1.5 transition-all active:scale-95"
              title="Open Live Print-Friendly Preview for selected documents"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Preview Print</span>
            </button>

            <button
              type="button"
              onClick={handleDirectBulkPrint}
              className="bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs px-3 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all active:scale-95"
              title="Print package directly"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              type="button"
              onClick={() => setIsBulkPrintModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl shadow flex items-center gap-1.5 transition-all active:scale-95"
              id="floating-consolidate-package-btn"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Consolidate Package</span>
            </button>
          </div>
        </div>
      )}

      {/* Bulk Print & Consolidated Package Modal */}
      <BulkPrintPackageModal
        isOpen={isBulkPrintModalOpen}
        onClose={() => setIsBulkPrintModalOpen(false)}
        allDocuments={documents}
        selectedDocIds={selectedDocIds}
        onToggleDoc={toggleSelectDoc}
        onSelectAll={handleSelectAllFiltered}
        onClearSelection={handleClearSelection}
        onSelectCategory={handleSelectCategory}
        currentUser={currentUser}
        companyPhone={phone}
        onPackageExported={handlePackageExported}
        onPreviewDocument={handleOpenPrintPreview}
      />

      {/* Dedicated Live Print-Friendly Preview Modal */}
      <DocumentPrintPreviewModal
        isOpen={isPrintPreviewModalOpen}
        onClose={() => {
          setIsPrintPreviewModalOpen(false);
          setPrintPreviewDoc(null);
        }}
        document={printPreviewDoc}
        allDocuments={documents}
        onSelectDocument={(d) => setPrintPreviewDoc(d)}
        currentUser={currentUser}
        companyPhone={phone}
        onDownloadPdf={handleDownloadPdf}
      />

      {/* Export Inventory Packing Slip Modal */}
      <ExportPackingSlipModal
        isOpen={isPackingSlipModalOpen}
        onClose={() => setIsPackingSlipModalOpen(false)}
        currentUser={currentUser}
        companyPhone={phone}
        saveToCloudFn={saveDocumentToCloud}
        onPackingSlipSaved={(newDoc) => {
          setLocalDocuments((prev) => [newDoc, ...prev.filter((d) => d.id !== newDoc.id)]);
          setToastMessage({
            type: 'success',
            text: `Packing slip ${newDoc.referenceNumber} generated and saved to Document Vault!`,
          });
          setTimeout(() => setToastMessage(null), 6000);
        }}
      />
    </div>
  );
};
