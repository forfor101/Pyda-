/**
 * Pricing Engine & Fuel Adjustment Service
 * Baseline: Petrol @ ₦1,460/L • Diesel @ ₦1,850/L
 */

import {
  calculateComprehensiveMoveQuote,
  FUEL_BENCHMARK_RATES,
  NIGERIAN_STATES_DATA,
} from '../src/data/nigerianStatesLgas.ts';
import type { MoveQuoteCalculationResult } from '../src/data/nigerianStatesLgas.ts';

export interface PricingBenchmarkItem {
  category: 'residential' | 'corporate' | 'haulage';
  serviceName: string;
  unitOrProperty: string;
  localIntraCityNaira: number;
  localIntraCityRange: string;
  lagosStartingNaira?: number;
  abujaStartingNaira?: number;
  interstateNaira: number;
  interstateRange: string;
  description: string;
  recommendedVehicle: string;
  fuelBenchmarkNote?: string;
}

export const PUBLISHED_PRICING_BENCHMARKS: PricingBenchmarkItem[] = [
  {
    category: 'residential',
    serviceName: '1-Bedroom Apartment Move',
    unitOrProperty: '1-Bedroom Apartment',
    localIntraCityNaira: 150000,
    localIntraCityRange: '₦120,000 - ₦180,000',
    lagosStartingNaira: 150000,
    abujaStartingNaira: 120000,
    interstateNaira: 650000,
    interstateRange: '₦650,000 - ₦800,000',
    description: 'Standard 1-bed flat: queen bed, sofa, double-door fridge, washing machine, and up to 15 boxes.',
    recommendedVehicle: '3-Ton Covered Box Truck',
    fuelBenchmarkNote: 'Fuel adjusted: Petrol @ ₦1,460/L • Diesel @ ₦1,850/L',
  },
  {
    category: 'residential',
    serviceName: '2-Bedroom Apartment Move',
    unitOrProperty: '2-Bedroom Apartment',
    localIntraCityNaira: 280000,
    localIntraCityRange: '₦220,000 - ₦320,000',
    lagosStartingNaira: 280000,
    abujaStartingNaira: 220000,
    interstateNaira: 1100000,
    interstateRange: '₦1,100,000 - ₦1,350,000',
    description: 'Full 2-bed flat: dining suite, living room lounge, kitchen appliances, master bed, 20-30 boxes.',
    recommendedVehicle: '5-Ton Covered Box Truck',
    fuelBenchmarkNote: 'Fuel adjusted: Petrol @ ₦1,460/L • Diesel @ ₦1,850/L',
  },
  {
    category: 'residential',
    serviceName: '3-4 Bedroom / Duplex Move',
    unitOrProperty: '3-4 Bedroom / Duplex',
    localIntraCityNaira: 450000,
    localIntraCityRange: '₦380,000 - ₦550,000',
    lagosStartingNaira: 450000,
    abujaStartingNaira: 380000,
    interstateNaira: 1650000,
    interstateRange: '₦1,500,000 - ₦2,100,000',
    description: 'Executive family flat or duplex: multiple bedroom sets, large kitchen suite, fragile crating, patio.',
    recommendedVehicle: '10-Ton Covered Heavy Truck',
    fuelBenchmarkNote: 'Fuel adjusted: Petrol @ ₦1,460/L • Diesel @ ₦1,850/L',
  },
  {
    category: 'residential',
    serviceName: 'Studio / Mini-Flat Move',
    unitOrProperty: 'Self-Contain / Studio',
    localIntraCityNaira: 85000,
    localIntraCityRange: '₦75,000 - ₦110,000',
    lagosStartingNaira: 95000,
    abujaStartingNaira: 85000,
    interstateNaira: 450000,
    interstateRange: '₦400,000 - ₦550,000',
    description: 'Ideal for light load: mattress, mini fridge, TV, 5-8 boxes, light seating.',
    recommendedVehicle: 'Mini-Van or 1.5-Ton Enclosed Van',
    fuelBenchmarkNote: 'Fuel adjusted: Petrol @ ₦1,460/L',
  },
  {
    category: 'haulage',
    serviceName: '3-Ton Covered Box Truck',
    unitOrProperty: 'Interstate & Dedicated Charter',
    localIntraCityNaira: 180000,
    localIntraCityRange: '₦150,000 - ₦220,000',
    lagosStartingNaira: 180000,
    abujaStartingNaira: 150000,
    interstateNaira: 650000,
    interstateRange: '₦650,000 - ₦850,000',
    description: 'Enclosed weatherproof box truck for medium residential moves, palletized cargo, and FMCG haulage.',
    recommendedVehicle: '3-Ton Covered Box Truck',
    fuelBenchmarkNote: 'Interstate base fare: ₦650,000 (Diesel @ ₦1,850/L)',
  },
  {
    category: 'haulage',
    serviceName: '5-Ton Covered Box Truck',
    unitOrProperty: 'Interstate & Dedicated Charter',
    localIntraCityNaira: 280000,
    localIntraCityRange: '₦240,000 - ₦350,000',
    lagosStartingNaira: 280000,
    abujaStartingNaira: 240000,
    interstateNaira: 1100000,
    interstateRange: '₦1,100,000 - ₦1,400,000',
    description: 'Heavy 5-ton freight truck for 2-3 bedroom interstate relocations, industrial equipment, and retail distributions.',
    recommendedVehicle: '5-Ton Covered Box Truck',
    fuelBenchmarkNote: 'Interstate base fare: ₦1,100,000 (Diesel @ ₦1,850/L)',
  },
  {
    category: 'corporate',
    serviceName: 'Small Office Relocation',
    unitOrProperty: '1 - 15 Workstations',
    localIntraCityNaira: 480000,
    localIntraCityRange: '₦420,000 - ₦650,000',
    lagosStartingNaira: 480000,
    abujaStartingNaira: 420000,
    interstateNaira: 950000,
    interstateRange: '₦850,000 - ₦1,300,000',
    description: 'Desks, ergonomic chairs, desktop PCs, filing cabinets, and document boxes.',
    recommendedVehicle: '5-Ton Covered Truck',
    fuelBenchmarkNote: 'Fuel adjusted: Petrol @ ₦1,460/L • Diesel @ ₦1,850/L',
  },
  {
    category: 'corporate',
    serviceName: 'Medium Corporate Office',
    unitOrProperty: '20 - 50 Workstations',
    localIntraCityNaira: 980000,
    localIntraCityRange: '₦850,000 - ₦1,400,000',
    lagosStartingNaira: 980000,
    abujaStartingNaira: 850000,
    interstateNaira: 2100000,
    interstateRange: '₦1,800,000 - ₦2,700,000',
    description: 'Multi-department workspace, executive conference tables, IT server rack dis-assembly.',
    recommendedVehicle: '10-Ton Truck + Dedicated Crew',
    fuelBenchmarkNote: 'Fuel adjusted: Diesel @ ₦1,850/L',
  },
  {
    category: 'corporate',
    serviceName: 'Headquarters / Bank Server Move',
    unitOrProperty: '100+ Workstations / Bank Branch',
    localIntraCityNaira: 2600000,
    localIntraCityRange: '₦2,200,000 - ₦3,800,000',
    lagosStartingNaira: 2600000,
    abujaStartingNaira: 2200000,
    interstateNaira: 4800000,
    interstateRange: '₦4,200,000 - ₦6,500,000',
    description: 'Phased weekend zero-downtime migration, serialized inventory tagging, server racks.',
    recommendedVehicle: 'Multi-Fleet Dispatch + Escort',
    fuelBenchmarkNote: 'Fuel adjusted: Diesel @ ₦1,850/L',
  },
  {
    category: 'haulage',
    serviceName: '10-Ton Heavy Freight Truck',
    unitOrProperty: 'Single Trip / Long Haul',
    localIntraCityNaira: 380000,
    localIntraCityRange: '₦320,000 - ₦460,000',
    lagosStartingNaira: 380000,
    abujaStartingNaira: 320000,
    interstateNaira: 1850000,
    interstateRange: '₦1,650,000 - ₦2,200,000',
    description: 'Bulk commercial goods, warehouse transfer, large house moves, multi-ton logistics.',
    recommendedVehicle: '10-Ton Heavy Enclosed Truck',
    fuelBenchmarkNote: 'Interstate heavy freight (Diesel @ ₦1,850/L)',
  },
  {
    category: 'haulage',
    serviceName: '30-Ton Trailer / 40ft Container',
    unitOrProperty: 'Single Trip / Heavy Freight',
    localIntraCityNaira: 750000,
    localIntraCityRange: '₦650,000 - ₦950,000',
    lagosStartingNaira: 750000,
    abujaStartingNaira: 680000,
    interstateNaira: 2400000,
    interstateRange: '₦2,000,000 - ₦3,000,000',
    description: 'Port container transport, heavy industrial goods, raw material haulage.',
    recommendedVehicle: '30-Ton Lowbed / Container Chassis',
    fuelBenchmarkNote: 'Heavy haulage (Diesel @ ₦1,850/L)',
  },
];

export const CURRENT_PRICING_RULES = {
  effectiveDate: '2026-09-30',
  fuelBenchmarks: {
    petrolPerLiter: FUEL_BENCHMARK_RATES.petrolPerLiter, // Baseline Petrol (PMS): ₦1,460/L
    dieselPerLiter: FUEL_BENCHMARK_RATES.dieselPerLiter, // Baseline Diesel (AGO): ₦1,850/L
  },
  basePackages: {
    lagosIntraCity: {
      oneBedroom: 150000,
      twoBedroom: 280000,
      threeFourBedroomDuplex: 450000,
    },
    abujaIntraCity: {
      oneBedroom: 120000,
      twoBedroom: 220000,
      threeFourBedroomDuplex: 380000,
    },
    interstateCorridor: {
      threeTonCoveredBoxTruck: 650000,
      fiveTonCoveredBoxTruck: 1100000,
      tenTonHeavyTruck: 1650000,
      thirtyTonLowbedTrailer: 2400000,
    },
  },
  surcharges: {
    staircasePerFloorWithoutElevator: 15000, // Auto-add ₦15,000 per floor above ground floor
    acRemovalAndReinstallationPerUnit: 20000, // ₦20,000 per AC unit
    tvWallMountDismantleMountPerUnit: 10000, // ₦10,000 per TV
    postMoveDeepCleaningBaseFee: 45000, // ₦45,000 base fee
  },
  guaranteeNotice:
    'Fixed-Price Guarantee: Due to recent fuel price changes, all instant estimates cover end-to-end transit, Goods-in-Transit insurance, and gate clearance fees. Your quoted price on booking will not change on move day.',
};

export interface QuoteCalculationRequest {
  originStateId: string;
  originLgaName: string;
  destinationStateId: string;
  destinationLgaName: string;
  serviceType: string;
  propertySize: string;
  needsPacking?: boolean;
  needsStorage?: boolean;
  needsInsurance?: boolean;
  insuranceTier?: 'basic' | 'standard' | 'premium';
  floorLevel?: number;
  hasElevator?: boolean;
  acUnitsCount?: number;
  tvMountCount?: number;
  needsCleaning?: boolean;
}

export function calculateBackendQuote(
  req: QuoteCalculationRequest
): MoveQuoteCalculationResult {
  return calculateComprehensiveMoveQuote({
    originStateId: req.originStateId,
    originLgaName: req.originLgaName,
    destinationStateId: req.destinationStateId,
    destinationLgaName: req.destinationLgaName,
    serviceType: req.serviceType,
    propertySize: req.propertySize,
    needsPacking: req.needsPacking ?? true,
    needsStorage: req.needsStorage ?? false,
    needsInsurance: req.needsInsurance ?? true,
    insuranceTier: req.insuranceTier ?? 'standard',
    floorLevel: req.floorLevel ?? 0,
    hasElevator: req.hasElevator ?? true,
    acUnitsCount: req.acUnitsCount ?? 0,
    tvMountCount: req.tvMountCount ?? 0,
    needsCleaning: req.needsCleaning ?? false,
  });
}

export function getPricingBenchmarks() {
  return {
    pricingRules: CURRENT_PRICING_RULES,
    benchmarks: PUBLISHED_PRICING_BENCHMARKS,
    states: NIGERIAN_STATES_DATA.map((s) => ({
      id: s.id,
      name: s.name,
      lgaCount: s.lgas.length,
    })),
  };
}
