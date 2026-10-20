export interface LegalDisclosurePoint {
  id: string;
  badge: string;
  title: string;
  summary: string;
  protectiveScope: string;
  iconName: 'ShieldAlert' | 'Lock' | 'AlertTriangle' | 'FileText' | 'Scale' | 'Truck';
}

export interface LegalArticle {
  number: string;
  title: string;
  slug: string;
  keyTakeaway: string;
  clauses: {
    clauseNumber: string;
    subtitle: string;
    content: string;
    strictWarning?: string;
  }[];
}

export interface TermsAndConditionsMetadata {
  companyName: string;
  registrationNumber: string;
  taxIdentificationNumber: string;
  licensingReg: string;
  effectiveDate: string;
  lastRevised: string;
  version: string;
  headquartersAddress: string;
  lagosTerminalAddress: string;
  officialLegalEmail: string;
  complianceHotline: string;
}

export const PYDA_TERMS_METADATA: TermsAndConditionsMetadata = {
  companyName: 'Pyda Movers & Logistics Ltd',
  registrationNumber: 'RC: 1842091',
  taxIdentificationNumber: 'FIRS TIN: 24891029-0001',
  licensingReg: 'FMWH/RL-0892 · FRSC Heavy Haulage Carrier Certified',
  effectiveDate: 'January 1, 2024',
  lastRevised: 'October 12, 2026',
  version: 'Edition 4.6 (Consolidated Commercial & Consumer Protective Code)',
  headquartersAddress: 'Suite A204, AA Rano Citygate Plaza, Airport Road, Abuja FCT, Nigeria',
  lagosTerminalAddress: '374/376 Old Ojo Road, Alakija, Satellite Town Logistics Hub, Lagos State, Nigeria',
  officialLegalEmail: 'legal@pydamovers.com',
  complianceHotline: '+234 806 246 6212',
};

export const KEY_PROTECTIVE_DISCLOSURES: LegalDisclosurePoint[] = [
  {
    id: 'carriers-lien',
    badge: 'Statutory Right',
    title: "Statutory Carrier's Lien & Cargo Retention",
    summary: 'Pyda Movers holds a strict legal lien over all cargo, furniture, and consignments for unpaid freight, demurrage, or storage fees.',
    protectiveScope:
      'Pursuant to Nigerian Commercial Law and the Carriage of Goods by Land Act, Pyda Movers reserves the absolute legal right to withhold offloading or retain physical possession of goods at secure holding depots until all outstanding balances are liquidated in cleared funds. Unclaimed cargo after 60 days may be liquidated to offset accrued liabilities.',
    iconName: 'Lock',
  },
  {
    id: 'pbo-exclusion',
    badge: 'Packing Disclaimer',
    title: 'Owner-Packed (PBO) Zero Liability Exclusion',
    summary: 'No liability for internal damage, chips, or mechanical failure of items packed by the customer or third parties.',
    protectiveScope:
      'Where items are packed by the owner ("Packed By Owner" - PBO), Pyda Movers accepts zero liability for internal structural or cosmetic damage unless catastrophic external destruction of the outer container caused by gross driver misconduct is demonstrated and verified on delivery.',
    iconName: 'AlertTriangle',
  },
  {
    id: 'prohibited-contraband',
    badge: 'Strict Ban & Indemnity',
    title: 'Prohibited Cargo, Cash & Contraband Disclaimer',
    summary: 'Absolute prohibition of cash, bullion, unregistered firearms, narcotics, flammables, or illicit goods.',
    protectiveScope:
      'Customers are strictly prohibited from loading cash, jewellery, hazardous chemicals, or contraband. The customer agrees to defend, indemnify, and hold harmless Pyda Movers against all state fines, police arrests, truck seizures, and legal expenses arising from undisclosed prohibited articles.',
    iconName: 'ShieldAlert',
  },
  {
    id: 'liability-caps',
    badge: 'Liability Cap',
    title: 'Standard Carrier Liability Limited to ₦1,000/kg',
    summary: 'Standard carriage is strictly limited to ₦1,000/kg (max ₦50,000/job) unless Enhanced GIT Insurance is purchased.',
    protectiveScope:
      'Unless the customer formally declares item valuation and remits the corresponding Enhanced Goods-in-Transit (GIT) insurance premium underwritten by our consortium underwriters prior to dispatch, maximum liability for proven carrier negligence is strictly capped at statutory carriage minimums.',
    iconName: 'Scale',
  },
  {
    id: 'force-majeure',
    badge: 'Regional Disclaimer',
    title: 'Highway Force Majeure & Non-State Disruptions',
    summary: 'Relief from liability for floods, bridge collapses, civil commotion, curfews, and highway security incidents.',
    protectiveScope:
      'Pyda Movers is completely indemnified and relieved of delivery schedule guarantees and transit damage liabilities occasioned by Acts of God, highway armed robberies beyond reasonable security escort, communal clashes, military blockades, road collapses, or government fuel supply halts.',
    iconName: 'Truck',
  },
  {
    id: 'claim-deadline',
    badge: 'Time-Barred Claims',
    title: 'Strict 48-Hour Damage Notification Window',
    summary: 'Damage or shortages must be marked on the delivery waybill immediately and claimed within 48 hours.',
    protectiveScope:
      'Visible exterior discrepancies must be recorded upon delivery before dispatch personnel depart. Formal written claims with photographic evidence and purchase invoices must be received within 48 hours for local moves or 7 days for interstate corridors. All subsequent claims are irrevocably time-barred.',
    iconName: 'FileText',
  },
];

export const TERMS_ARTICLES: LegalArticle[] = [
  {
    number: 'ARTICLE 1',
    title: 'Scope of Engagement, Corporate Identity & Definitions',
    slug: 'scope-and-definitions',
    keyTakeaway: 'Defines the legal parties, corporate registration, and scope of logistics contracts.',
    clauses: [
      {
        clauseNumber: '1.1',
        subtitle: 'The Contracting Carrier',
        content:
          'These Standard Trading Conditions and Protective Carrier Disclosures govern all contracts, agreements, quotations, operations, and services executed by Pyda Movers & Logistics Ltd (RC: 1842091, FIRS TIN: 24891029-0001), hereinafter referred to as "Pyda Movers", "the Carrier", "we", or "us".',
      },
      {
        clauseNumber: '1.2',
        subtitle: 'The Shipper / Customer',
        content:
          'The party commissioning the services—whether an individual homeowner, corporate entity, procurement executive, freight forwarder, or agent—is designated as "the Customer", "the Consignor", "the Hirer", or "the Shipper". Any individual commissioning services on behalf of a company warrants that they possess full legal corporate authority to bind the corporate principal.',
      },
      {
        clauseNumber: '1.3',
        subtitle: 'Enforceability & Precedence',
        content:
          'Submission of a quote request, issuance of a purchase order, execution of a digital signature, payment of any mobilization deposit, or physical handover of goods to Pyda Movers constitutes immediate, unconditional acceptance of these terms. These conditions supersede all prior oral representations, custom client purchase notes, or unilateral procurement clauses.',
      },
    ],
  },
  {
    number: 'ARTICLE 2',
    title: 'Quotations, Tariffs, Scope Adjustments & Pre-Move Surveys',
    slug: 'quotations-and-surveys',
    keyTakeaway: 'Preliminary quotes are subject to survey verification; access difficulties incur surcharges.',
    clauses: [
      {
        clauseNumber: '2.1',
        subtitle: 'Estimative Nature of Online Quotes',
        content:
          'All instant calculations generated through the website or customer telephone briefings are preliminary commercial estimates based strictly on client-provided volume (CBM), inventory declarations, and standard street-level access assumptions. Quotes remain valid for thirty (30) calendar days from generation.',
      },
      {
        clauseNumber: '2.2',
        subtitle: 'Mandatory Pre-Move Survey & Tariff Finality',
        content:
          'Final binding pricing is established following a physical premises survey or comprehensive digital survey (via our AI Cargo Inspection portal or video audit). If the actual cargo volume, item fragility, or physical access configuration differs from initial declarations, Pyda Movers reserves the unilateral right to revise the quotation to reflect actual operational requirements.',
      },
      {
        clauseNumber: '2.3',
        subtitle: 'Excluded Access Impediments & Extra Services',
        content:
          'Standard tariffs exclude extraordinary access operations unless explicitly specified in writing. Additional billable surcharges apply for: (a) carrying items up or down staircases exceeding agreed floor levels; (b) manual portage exceeding 25 meters from truck parking to the entrance; (c) specialized external hoisting or rigging through balconies or windows; (d) dismounting or reconnecting fixed electrical appliances, AC compressors, chandeliers, or wall-mounted flat screens; and (e) transit on unpaved, non-motorable, or weight-restricted private access roads.',
        strictWarning:
          'Where access impediments are discovered on move day without prior notice, Pyda Movers reserves the right to charge supplemental hourly labor and specialized equipment fees before work proceeds.',
      },
    ],
  },
  {
    number: 'ARTICLE 3',
    title: "Payment Terms, Mobilization Retainers, Demurrage & Statutory Carrier's Lien",
    slug: 'payment-and-carriers-lien',
    keyTakeaway: 'Full payment is required prior to offloading; Pyda Movers holds a legal lien over all cargo.',
    clauses: [
      {
        clauseNumber: '3.1',
        subtitle: 'Payment Schedule & Mobilization Protocol',
        content:
          'For all residential, commercial, and freight services, a minimum mobilization retainer of seventy percent (70%) of the total agreed contract value must be cleared in Pyda Movers designated bank accounts before dispatch of vehicles and moving crews. The balance of thirty percent (30%) is due and payable immediately upon the truck arrival at the delivery destination prior to commencement of offloading.',
      },
      {
        clauseNumber: '3.2',
        subtitle: 'Corporate Credit & Net Terms',
        content:
          'Credit arrangements (Net 14 or Net 30 days) are available solely to pre-vetted corporate organizations upon formal submission of an authorized Corporate Purchase Order (PO) and credit facility vetting. Overdue invoices accrue statutory interest at the rate of 3.5% per month or the maximum permissible rate under Nigerian banking regulations.',
      },
      {
        clauseNumber: '3.3',
        subtitle: "Statutory & Contractual Carrier's General Lien",
        content:
          'Pyda Movers shall have an absolute, general, and particular possessory lien on all consignments, goods, equipment, personal effects, vehicles, and documents in our custody for all freight charges, packing fees, handling costs, storage charges, demurrage, and legal disbursements owed by the Customer. Pyda Movers is legally entitled to retain physical custody of the goods, refuse delivery, or transfer the goods into bonded storage at the Customer\'s sole expense until all liabilities are cleared in full.',
        strictWarning:
          "Under Section 4 of the Carriage of Goods by Land provisions and Nigerian Common Law, Pyda Movers will not offload any consignment without full payment. If arrears remain unpaid for sixty (60) calendar days following formal written notice, Pyda Movers reserves the irrevocable legal power to sell the goods by public auction or private treaty to satisfy the indebtedness, returning any surplus to the Customer.",
      },
      {
        clauseNumber: '3.4',
        subtitle: 'Demurrage & Truck Standing Charges',
        content:
          'A complimentary grace period of two (2) hours is provided for loading and two (2) hours for offloading. Customer-induced delays—such as delayed key handovers, pending estate approvals, unready premises, or payment clearance stalls—exceeding the grace period will attract demurrage at established standing rates: ₦15,000/hour for 3.5–5 Ton Box Vans and ₦30,000/hour for 15–30 Ton Heavy Haulage Semi-Trailers.',
      },
    ],
  },
  {
    number: 'ARTICLE 4',
    title: 'Customer Site Clearances, Right of Way & Security Clearances',
    slug: 'site-clearances-and-parking',
    keyTakeaway: 'The customer must secure estate passes, gate clearances, and truck parking access.',
    clauses: [
      {
        clauseNumber: '4.1',
        subtitle: 'Estate & Gated Community Clearances',
        content:
          'The Customer bears sole legal and financial responsibility for obtaining all necessary permits, passes, gate clearances, and Community Development Association (CDA) approvals for Pyda Movers personnel and vehicles to enter both the origin and destination facilities.',
      },
      {
        clauseNumber: '4.2',
        subtitle: 'Parking Authorizations & Traffic Levies',
        content:
          'The Customer must provide legal, secure, and accessible parking for the commercial moving vehicles. Any municipal parking tickets, towing fines, or local government revenue tout (agbero) levies arising from illegal or obstructed parking instructed by the Customer shall be reimbursed immediately by the Customer.',
      },
      {
        clauseNumber: '4.3',
        subtitle: 'Pre-Move Fragile & High-Value Declaration',
        content:
          'The Customer must declare in writing, at least twenty-four (24) hours prior to move day, any single item or set possessing a replacement value exceeding ₦1,000,000 (One Million Nigerian Naira), including antique furniture, fine artwork, luxury audio systems, or precision lab equipment, to enable specialized rigging protocols.',
      },
    ],
  },
  {
    number: 'ARTICLE 5',
    title: 'Owner-Packed Goods (PBO) & Mechanical/Electrical Derangement Disclaimers',
    slug: 'owner-packed-goods-and-pbo',
    keyTakeaway: 'Zero liability for boxes packed by the customer or internal electronics failure.',
    clauses: [
      {
        clauseNumber: '5.1',
        subtitle: 'Packed By Owner (PBO) Absolute Disclaimer',
        content:
          'Where cartons, trunks, suitcases, or crates are packed by the Customer, their domestic staff, or any third party ("Packed by Owner" / PBO), Pyda Movers and its insurers accept ZERO liability for internal breakage, scratches, cracks, leakage, or loss of items contained therein. The Customer acknowledges that proper protective padding, cushioning, and internal carton weight distribution are essential and cannot be verified by our crew without unpacking.',
        strictWarning:
          'Pyda Movers shall only be held liable for PBO goods if the Customer proves beyond doubt that the outer shipping carton sustained direct, catastrophic physical crushing or puncture caused directly by gross negligence of our vehicle operators, and such outer damage is noted on the delivery receipt.',
      },
      {
        clauseNumber: '5.2',
        subtitle: 'Mechanical, Electrical & Digital Derangement',
        content:
          'Pyda Movers does not warrant against the internal electronic, optical, or mechanical malfunction of televisions, computers, refrigeration units, servers, washing machines, audio gear, or precision machinery, unless there is manifest exterior structural impact damage inflicted by Pyda personnel. Pre-existing internal component fatigue, soldering age, or transport vibrations do not establish carrier liability.',
      },
      {
        clauseNumber: '5.3',
        subtitle: 'MDF & Flat-Pack Particle Board Furniture',
        content:
          'Particle board, engineered wood, press-board, and ready-to-assemble flat-pack furniture (e.g. IKEA, laminate wardrobes) are engineered for stationary domestic placement, not repetitive transit. Pyda Movers is not liable for structural joint failure, veneer delamination, or screw pull-outs during disassembling, transit, or reassembling of particle-board items.',
      },
    ],
  },
  {
    number: 'ARTICLE 6',
    title: 'Strictly Prohibited Articles, Contraband & Absolute Shipper Indemnity',
    slug: 'prohibited-items-and-indemnity',
    keyTakeaway: 'Cash, jewelry, arms, drugs, and hazardous materials are banned; client is liable for violations.',
    clauses: [
      {
        clauseNumber: '6.1',
        subtitle: 'Prohibited & Dangerous Goods Schedule',
        content:
          'Under no circumstances shall the Customer tender for transport, stow inside furniture drawers, or pack into boxes any of the following excluded items: (a) Cash, bank notes, currency, bullion, precious metals, bearer securities, loose diamonds, or fine jewelry; (b) Firearms, ammunition, explosives, fireworks, or military hardware; (c) Illicit narcotics, psychotropic substances, or contraband prohibited under NDLEA or Customs acts; (d) Pressurized gas cylinders, flammable solvents, petrol cans, industrial acids, or corrosives; (e) Perishable unpackaged meat, fish, or decaying organic material; and (f) Live animals, reptiles, or biological specimens.',
      },
      {
        clauseNumber: '6.2',
        subtitle: 'Right of Inspection & Unilateral Removal',
        content:
          'Pyda Movers supervisors retain the absolute statutory right to inspect any container, wardrobe, safe, or parcel prior to loading. If any prohibited or hazardous article is discovered, Pyda Movers may refuse carriage, notify law enforcement authorities, or safely discharge the item at the Customer\'s sole risk and expense.',
      },
      {
        clauseNumber: '6.3',
        subtitle: 'Shipper Full Indemnity to Pyda Movers',
        content:
          'The Customer warrants that no prohibited, dangerous, or illegal article is included in the consignment. The Customer agrees to fully indemnify, defend, and hold harmless Pyda Movers, its parent company, directors, drivers, and agents from any and all criminal prosecutions, state fines, police arrests, NDLEA/Customs impoundment of vehicles, truck storage charges, legal fees, or third-party damages arising from the presence of undisclosed prohibited goods.',
        strictWarning:
          'Should a Pyda Movers vehicle be impounded or detained by state security forces due to illegal, contraband, or undeclared goods concealed in the Customer’s consignment, the Customer shall pay full commercial truck charter compensation (₦250,000 per day of impoundment) plus all legal costs required to secure the vehicle release.',
      },
    ],
  },
  {
    number: 'ARTICLE 7',
    title: 'Standard Carrier Liability Limits & Goods-In-Transit (GIT) Insurance',
    slug: 'liability-limits-and-insurance',
    keyTakeaway: 'Standard liability is capped at ₦1,000/kg; comprehensive coverage requires GIT insurance.',
    clauses: [
      {
        clauseNumber: '7.1',
        subtitle: 'Standard Statutory Carrier Liability',
        content:
          'In the absence of a written declaration of itemized valuation and payment of the corresponding Enhanced Goods-in-Transit (GIT) insurance premium, Pyda Movers\' liability for any proven loss, destruction, or physical damage caused by the carrier’s negligence shall be strictly capped at ₦1,000 (One Thousand Naira) per kilogram of the specific damaged article, with a maximum aggregate ceiling of ₦50,000 per entire move consignment.',
      },
      {
        clauseNumber: '7.2',
        subtitle: 'Enhanced Goods-in-Transit (GIT) Policy',
        content:
          'Customers desiring full comprehensive replacement coverage must opt for our Enhanced Goods-in-Transit Insurance underwritten by our consortium underwriters (Leadway Assurance / AIICO Insurance Plc). The premium (standard 1.0% to 1.5% of declared valuation) must be remitted prior to dispatch. Coverage is subject to the terms, exclusions, and deductibles of the master policy.',
      },
      {
        clauseNumber: '7.3',
        subtitle: 'Insurance Policy Deductible / Excess',
        content:
          'In the event of an approved insurance settlement, the policyholder deductible / excess (standard 5% of claim value or ₦25,000, whichever is greater) remains the responsibility of the Customer and is non-recoverable from Pyda Movers.',
      },
      {
        clauseNumber: '7.4',
        subtitle: 'Total Exclusion of Consequential & Economic Losses',
        content:
          'Under no circumstances shall Pyda Movers, its affiliates, or insurers be liable for any indirect, special, incidental, or consequential damages, including loss of business profits, lost contracts, business interruption, factory downtime, hotel accommodation, flight rescheduling, rental losses, or emotional distress, regardless of whether Pyda Movers had knowledge of the possibility of such damages.',
      },
    ],
  },
  {
    number: 'ARTICLE 8',
    title: 'Force Majeure, Regional Highway Insecurities & Transit Delays',
    slug: 'force-majeure-and-highway-risks',
    keyTakeaway: 'Pyda Movers is not liable for delays or losses caused by riots, highway banditry, floods, or curfews.',
    clauses: [
      {
        clauseNumber: '8.1',
        subtitle: 'Definition of Force Majeure Events',
        content:
          'Neither party shall be held liable for failure or delay in performing transit obligations if caused by events beyond reasonable operational control, including: (a) Acts of God, severe thunderstorms, flash flooding, landslides, or bridge collapses; (b) Civil commotion, riots, curfews, communal warfare, terrorism, or nationwide strike actions; (c) Interstate highway armed robbery, banditry, or hijackings occurring without carrier gross negligence; (d) Military or federal police roadblocks, border closures, or emergency state declarations; and (e) Acute nationwide fuel shortages, refinery disruptions, or electricity grid collapses.',
      },
      {
        clauseNumber: '8.2',
        subtitle: 'Suspension of Transit & Safe Haven Protocol',
        content:
          'In the event of impending civil unrest or active highway security alerts along interstate corridors (such as Abuja–Kaduna, Lagos–Ibadan, or East–West corridors), Pyda Movers dispatch coordinators hold the unilateral discretion to divert convoys into secure military bases, regional holding terminals, or police-protected holding yards to safeguard driver lives and cargo. No delay damages shall accrue during such safe-haven standstills.',
      },
      {
        clauseNumber: '8.3',
        subtitle: 'Additional Warehousing & Security Surcharges',
        content:
          'If a shipment cannot be delivered due to Force Majeure, severe flooding, or Customer-induced absence, Pyda Movers may place the cargo in a secure bonded warehouse. Daily storage, armed escort, and subsequent redelivery charges shall be borne by the Customer.',
      },
    ],
  },
  {
    number: 'ARTICLE 9',
    title: 'Executive Car Hire, Chauffeur Charters & Chauffeur Safety Disclosures',
    slug: 'car-hire-and-chauffeur-services',
    keyTakeaway: 'Chauffeurs adhere to FRSC speed limits; night travel through red zones is prohibited.',
    clauses: [
      {
        clauseNumber: '9.1',
        subtitle: 'Chauffeur Working Hours & Fatigue Protocol',
        content:
          'In compliance with Federal Road Safety Corps (FRSC) commercial safety standards, Pyda Movers chauffeurs are restricted to a maximum of ten (10) hours of active driving within any twenty-four (24) hour period. Chauffeurs are legally entitled to mandatory rest breaks. Clients chartering vehicles for long-distance multi-day trips must allow sufficient rest intervals or commission a relief co-driver.',
      },
      {
        clauseNumber: '9.2',
        subtitle: 'Speed Governors & Route Governance',
        content:
          'All fleet vehicles are fitted with calibrated IoT telematics and electronic speed governors strictly capped at 80 km/h on expressways and 50 km/h in urban corridors. Chauffeurs are strictly instructed never to override speed regulations. Customers may not coerce or incentivize drivers to exceed statutory speed limits.',
      },
      {
        clauseNumber: '9.3',
        subtitle: 'Night Travel & Hazardous Corridor Restrictions',
        content:
          'For driver and passenger safety, interstate highway travel between 21:00 (9:00 PM) and 05:30 (5:30 AM) through high-risk rural corridors is strictly prohibited unless authorized under written security protocol and accompanied by official armed mobile police (MOPOL) escort. If the Customer demands nighttime travel against dispatcher advice, the Customer signs a total assumption of risk waiver.',
      },
      {
        clauseNumber: '9.4',
        subtitle: 'Passenger Conduct & Interior Damage Indemnity',
        content:
          'Smoking, consumption of illicit substances, and hazardous chemical carriage inside executive charter vehicles are strictly prohibited. The Hirer shall reimburse Pyda Movers for any deep chemical cleaning fees (minimum ₦45,000) or interior upholstery damage caused by passengers or their luggage during the charter period.',
      },
    ],
  },
  {
    number: 'ARTICLE 10',
    title: 'Claims Notification, Strict 48-Hour Deadline & Evidence Protocol',
    slug: 'claims-protocol-and-deadlines',
    keyTakeaway: 'Loss or damage must be documented on the waybill and submitted within 48 hours.',
    clauses: [
      {
        clauseNumber: '10.1',
        subtitle: 'Immediate Waybill Endorsement',
        content:
          'Upon delivery of the consignment, the Customer or authorized representative must thoroughly inspect all delivered articles and execute the official Delivery Waybill / Bill of Lading. Any apparent external damage, carton crushing, or shortages must be explicitly endorsed in writing on the waybill before the delivery crew vacates the premises.',
      },
      {
        clauseNumber: '10.2',
        subtitle: 'Strict Time-Bar for Formal Claim Submission',
        content:
          'A formal written claim for transit damage or missing goods must be served on Pyda Movers Claims Department (via email to legal@pydamovers.com or registered dispatch) within forty-eight (48) hours of delivery for intra-city moves, and within seven (7) calendar days of delivery for interstate haulage.',
        strictWarning:
          'Failure to register the damage on the Delivery Waybill and failure to submit the formal claim within the stipulated 48-hour window constitutes irrevocable prima facie proof of complete, undamaged delivery and operates as an absolute legal bar against any subsequent claim or legal action.',
      },
      {
        clauseNumber: '10.3',
        subtitle: 'Mandatory Evidentiary Documentation',
        content:
          'Every valid claim must be accompanied by: (a) Timestamped high-resolution photographs and videos of the damaged article and packaging; (b) The endorsed Delivery Waybill noting the damage; (c) Original purchase receipts, invoices, or certified valuation documents establishing pre-damage ownership and value; and (d) A written quote from an authorized repair technician.',
      },
      {
        clauseNumber: '10.4',
        subtitle: 'Right of Salvage & Carrier Inspection',
        content:
          'In the event of an approved claim or full replacement settlement, Pyda Movers reserves the absolute right of salvage over the damaged item. Damaged property must not be disposed of or repaired until inspected by an appointed Pyda insurance loss adjuster.',
      },
    ],
  },
  {
    number: 'ARTICLE 11',
    title: 'Truck Investor Fleet Governance & Asset Ownership Disclosures',
    slug: 'investor-fleet-governance',
    keyTakeaway: 'Clear contractual separation between truck ownership and Pyda Logistics operational management.',
    clauses: [
      {
        clauseNumber: '11.1',
        subtitle: 'Asset Ownership vs. Operational Custody',
        content:
          'Trucks enrolled in the Pyda Investor Fleet Program remain the exclusive proprietary capital assets of the registered Investor. Pyda Movers acts solely as the operational fleet manager, maintenance coordinator, and cargo dispatch contractor under our Master Fleet Agreement.',
      },
      {
        clauseNumber: '11.2',
        subtitle: 'Revenue Distributions & Settlement Cycles',
        content:
          'Investor revenue shares are disbursed bi-weekly or monthly based on verified, completed, and settled cargo waybills minus agreed management fees, maintenance retentions, and statutory taxes. Pyda Movers makes no speculative guarantee of freight tonnage beyond active industrial logistics contracts.',
      },
      {
        clauseNumber: '11.3',
        subtitle: 'Normal Mechanical Wear & Depreciation',
        content:
          'Heavy commercial freight transport involves natural mechanical wear, tire attrition, and engine depreciation. While Pyda Movers enforces scheduled preventive maintenance, normal operational wear and tear and engine depreciation are not carrier liabilities.',
      },
    ],
  },
  {
    number: 'ARTICLE 12',
    title: 'Data Privacy (NDPA), Severability, Governing Law & Binding Arbitration',
    slug: 'governing-law-and-arbitration',
    keyTakeaway: 'Governed by Nigerian law; disputes are resolved via amicable negotiation or arbitration in Abuja.',
    clauses: [
      {
        clauseNumber: '12.1',
        subtitle: 'Data Protection & Confidentiality (NDPA / NDPR)',
        content:
          'Pyda Movers complies with the Nigeria Data Protection Act 2023 (NDPA). All client addresses, corporate floor plans, personal inventories, and tracking records are treated as strictly confidential commercial data and shall not be disclosed to third parties except for regulatory or law enforcement compliance.',
      },
      {
        clauseNumber: '12.2',
        subtitle: 'Severability of Clauses',
        content:
          'If any provision, clause, or paragraph of these Standard Terms is deemed invalid, void, or unenforceable by an arbitrator or competent court, such determination shall not affect the validity or enforceability of the remaining provisions, which shall continue in full legal force.',
      },
      {
        clauseNumber: '12.3',
        subtitle: 'Mandatory Amicable Negotiation',
        content:
          'In the event of any controversy, claim, or dispute arising out of or relating to these terms or services rendered, the parties agree to engage in good-faith executive negotiations for a mandatory period of thirty (30) calendar days prior to initiating formal dispute proceedings.',
      },
      {
        clauseNumber: '12.4',
        subtitle: 'Governing Law & Final Binding Arbitration',
        content:
          'These terms and all carriage agreements shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any dispute not resolved through amicable negotiation shall be referred to and finally resolved by binding arbitration under the Arbitration and Mediation Act 2023. The seat and venue of arbitration shall be Abuja (FCT), Nigeria. The proceedings shall be conducted in the English language by a single arbitrator appointed by the Chartered Institute of Arbitrators (UK, Nigeria Branch).',
      },
    ],
  },
];
