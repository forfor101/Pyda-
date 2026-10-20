export interface TireSensorData {
  positionId: string;
  positionName: string;
  axleGroup: 'steer' | 'drive1' | 'drive2' | 'trailer1' | 'trailer2';
  currentPsi: number;
  targetPsi: number;
  tempCelsius: number;
  treadDepthMm: number;
  status: 'optimal' | 'low_warning' | 'critical_low' | 'high_temp';
  alert?: string;
}

export interface DiagnosticTroubleCode {
  code: string; // e.g. SPN 100 FMI 1
  system: 'Engine Lubrication' | 'TPMS Telematics' | 'Pneumatic Air Brakes' | 'Cooling System' | 'Fuel Injection' | 'Transmission';
  severity: 'critical' | 'warning' | 'advisory';
  title: string;
  description: string;
  timestamp: string;
  recommendedAction: string;
}

export interface MaintenanceCheckItem {
  task: string;
  mandatory: boolean;
  estimatedMinutes: number;
}

export interface UpcomingMaintenanceSchedule {
  serviceType: string;
  serviceCode: string;
  dueInKm: number;
  dueInDays: number;
  scheduledDate: string;
  serviceStatus: 'on_schedule' | 'due_soon' | 'overdue';
  workshopFacility: string;
  workshopCity: 'Abuja (Idu)' | 'Lagos (Amuwo)' | 'Port Harcourt (Trans-Amadi)' | 'Kano (Sharada)';
  leadTechnician: string;
  technicianPhone: string;
  estimatedDowntimeHours: number;
  coveredUnderPydaAgreement: boolean;
  checklist: MaintenanceCheckItem[];
  lastCompletedService: {
    serviceCode: string;
    completedDate: string;
    odometerKm: number;
    facility: string;
  };
}

export interface VehicleHealthRecord {
  id: string;
  unitCode: string;
  plateNumber: string;
  makeModel: string;
  category: 'heavy_trailer' | 'medium_box' | 'urban_van' | 'specialized_rig';
  tonnage: string;
  driverName: string;
  driverPhone: string;
  driverAvatar: string;
  routeCorridor: string;
  currentLocation: string;
  operatingStatus: 'in_transit' | 'loading' | 'docked' | 'maintenance_bay';
  overallHealthScore: number; // 0 - 100
  overallStatus: 'nominal' | 'warning' | 'critical';
  lastCanBusPing: string;
  
  // Real-time Oil Pressure Diagnostics
  oilDiagnostics: {
    pressurePsi: number;
    targetRangePsi: [number, number]; // [min, max]
    status: 'optimal' | 'warning_low' | 'critical_low' | 'elevated';
    warningMessage?: string;
    oilLifePercent: number;
    oilTempCelsius: number;
    viscosityGrade: string;
    filterDiffPressurePsi: number; // Normal < 6 PSI
    sumpLevelStatus: 'Normal' | 'Low (-1.2L)' | 'Overfilled (+0.8L)';
  };

  // Tire Pressure Monitoring System (TPMS)
  tpmsDiagnostics: {
    axleCount: number;
    totalTires: number;
    overallStatus: 'optimal' | 'warning' | 'critical';
    summaryAlert?: string;
    tires: TireSensorData[];
  };

  // Upcoming Maintenance Schedules
  maintenanceSchedule: UpcomingMaintenanceSchedule;

  // Active Diagnostic Trouble Codes (OBD-II / CAN J1939)
  activeDtcCodes: DiagnosticTroubleCode[];

  // Engine Auxiliary Telemetry
  engineVitals: {
    coolantTempCelsius: number;
    airBrakePressurePsi: number; // Nominal: 110 - 128 PSI
    batteryVolts: number; // 24V commercial alternator
    transmissionTempCelsius: number;
    engineHours: number;
    odometerKm: number;
    defLevelPercent: number; // Diesel Exhaust Fluid / AdBlue
    waterInFuelSensor: boolean; // true if water detected
    governedSpeedCapKmh: number;
  };
}

export const REGISTERED_PYDA_FLEET_HEALTH: VehicleHealthRecord[] = [
  {
    id: 'health-fl-108',
    unitCode: 'MTM-FL-108',
    plateNumber: 'KJA-842-XB (Lagos)',
    makeModel: 'Mercedes-Benz Actros 3340 (6x4)',
    category: 'heavy_trailer',
    tonnage: '30 Tons',
    driverName: 'Musa Ibrahim',
    driverPhone: '0803 624 9911',
    driverAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    routeCorridor: 'Lagos ➔ Lokoja ➔ Abuja (A2 Dual Expressway)',
    currentLocation: 'Lokoja Transit Hub, Kogi State (A2 Km 184)',
    operatingStatus: 'in_transit',
    overallHealthScore: 74,
    overallStatus: 'warning',
    lastCanBusPing: 'Live (4G Satellite CAN-bus)',
    
    oilDiagnostics: {
      pressurePsi: 27.4,
      targetRangePsi: [35, 55],
      status: 'warning_low',
      warningMessage: 'LOW OIL PRESSURE ADVISORY: Oil galley pressure dropped to 27.4 PSI under load on A2 hill climb. Pyda telemetry flagged for technical pitstop at Lokoja Depot.',
      oilLifePercent: 32,
      oilTempCelsius: 104,
      viscosityGrade: 'Mobil Delvac 15W-40 Synthetic Heavy Diesel',
      filterDiffPressurePsi: 5.8,
      sumpLevelStatus: 'Low (-1.2L)',
    },

    tpmsDiagnostics: {
      axleCount: 3,
      totalTires: 10,
      overallStatus: 'warning',
      summaryAlert: 'Drive Axle 1 (Inner Right) sensor registered 84 PSI (-26 PSI vs baseline 110 PSI). Slow puncture alert.',
      tires: [
        { positionId: 'steer_l', positionName: 'Steer Front Left', axleGroup: 'steer', currentPsi: 110, targetPsi: 110, tempCelsius: 44, treadDepthMm: 14.2, status: 'optimal' },
        { positionId: 'steer_r', positionName: 'Steer Front Right', axleGroup: 'steer', currentPsi: 108, targetPsi: 110, tempCelsius: 46, treadDepthMm: 13.8, status: 'optimal' },
        { positionId: 'd1_outer_l', positionName: 'Drive 1 Outer Left', axleGroup: 'drive1', currentPsi: 112, targetPsi: 110, tempCelsius: 52, treadDepthMm: 12.1, status: 'optimal' },
        { positionId: 'd1_inner_l', positionName: 'Drive 1 Inner Left', axleGroup: 'drive1', currentPsi: 109, targetPsi: 110, tempCelsius: 51, treadDepthMm: 11.9, status: 'optimal' },
        { positionId: 'd1_inner_r', positionName: 'Drive 1 Inner Right', axleGroup: 'drive1', currentPsi: 84, targetPsi: 110, tempCelsius: 64, treadDepthMm: 11.5, status: 'low_warning', alert: 'Slow leak detected (-26 PSI). Mobile tyre service van notified.' },
        { positionId: 'd1_outer_r', positionName: 'Drive 1 Outer Right', axleGroup: 'drive1', currentPsi: 107, targetPsi: 110, tempCelsius: 53, treadDepthMm: 12.0, status: 'optimal' },
        { positionId: 'd2_outer_l', positionName: 'Drive 2 Outer Left', axleGroup: 'drive2', currentPsi: 111, targetPsi: 110, tempCelsius: 49, treadDepthMm: 12.8, status: 'optimal' },
        { positionId: 'd2_inner_l', positionName: 'Drive 2 Inner Left', axleGroup: 'drive2', currentPsi: 108, targetPsi: 110, tempCelsius: 50, treadDepthMm: 12.5, status: 'optimal' },
        { positionId: 'd2_inner_r', positionName: 'Drive 2 Inner Right', axleGroup: 'drive2', currentPsi: 109, targetPsi: 110, tempCelsius: 51, treadDepthMm: 12.4, status: 'optimal' },
        { positionId: 'd2_outer_r', positionName: 'Drive 2 Outer Right', axleGroup: 'drive2', currentPsi: 110, targetPsi: 110, tempCelsius: 48, treadDepthMm: 12.6, status: 'optimal' },
      ],
    },

    maintenanceSchedule: {
      serviceType: 'Service B: 15,000 km Brake Overhaul & Filter Service',
      serviceCode: 'PYDA-SVC-B-08',
      dueInKm: 420,
      dueInDays: 3,
      scheduledDate: 'September 24, 2026',
      serviceStatus: 'due_soon',
      workshopFacility: 'Pyda Central Heavy Maintenance Bay, Idu Industrial Yard',
      workshopCity: 'Abuja (Idu)',
      leadTechnician: 'Engr. Babatunde Lawal (Master Heavy Diesel Diagnostician)',
      technicianPhone: '0806 246 6212',
      estimatedDowntimeHours: 4.5,
      coveredUnderPydaAgreement: true,
      checklist: [
        { task: 'Full engine synthetic lube & dual fuel-water separator replacement', mandatory: true, estimatedMinutes: 60 },
        { task: 'Brake chamber stroke measurement & drum lining re-facing', mandatory: true, estimatedMinutes: 90 },
        { task: 'Air dryer desiccant cartridge spin-on replacement', mandatory: true, estimatedMinutes: 45 },
        { task: 'Chassis suspension leaf bushing torquing & 5th wheel grease pack', mandatory: true, estimatedMinutes: 45 },
        { task: 'CAN-bus ECU clear & telematics speed limiter recertification', mandatory: true, estimatedMinutes: 30 },
      ],
      lastCompletedService: {
        serviceCode: 'PYDA-SVC-A-04',
        completedDate: 'July 14, 2026',
        odometerKm: 200500,
        facility: 'Pyda Maritime Terminal, Amuwo Odofin Lagos',
      },
    },

    activeDtcCodes: [
      {
        code: 'SPN 100 FMI 1',
        system: 'Engine Lubrication',
        severity: 'warning',
        title: 'Engine Oil Pressure Below Normal Operating Range',
        description: 'CAN-bus registered 27.4 PSI under steady cruise speed. Telematics advised driver to avoid sustained revs > 1,700 RPM.',
        timestamp: 'Today, 09:14 AM',
        recommendedAction: 'Inspect oil sump dipstick at Lokoja checkpoint and top up with 15W-40 Mobil Delvac.',
      },
      {
        code: 'SPN 929 FMI 18',
        system: 'TPMS Telematics',
        severity: 'warning',
        title: 'Drive Axle 1 Inner Right Tire Under-Inflation',
        description: 'Tire pressure dropped 1.8 Bar over 40 km travel, indicating slow bead leak or tread nail.',
        timestamp: 'Today, 08:42 AM',
        recommendedAction: 'Pyda Road Assistance Van #3 dispatched to meet convoy at Lokoja Rano station for rapid bead seal.',
      },
    ],

    engineVitals: {
      coolantTempCelsius: 91,
      airBrakePressurePsi: 121,
      batteryVolts: 27.8,
      transmissionTempCelsius: 86,
      engineHours: 4890,
      odometerKm: 214580,
      defLevelPercent: 68,
      waterInFuelSensor: false,
      governedSpeedCapKmh: 80,
    },
  },
  {
    id: 'health-corp-04',
    unitCode: 'MTM-CORP-04',
    plateNumber: 'ABJ-719-LK (Abuja)',
    makeModel: 'MAN TGL 12.220 Air-Ride Box',
    category: 'medium_box',
    tonnage: '10 Tons',
    driverName: 'Okon Bassey',
    driverPhone: '0806 246 6212',
    driverAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    routeCorridor: 'Lagos ➔ Abuja Express Corridor',
    currentLocation: 'Airport Road Approach, Lugbe, Abuja FCT',
    operatingStatus: 'in_transit',
    overallHealthScore: 97,
    overallStatus: 'nominal',
    lastCanBusPing: '4s ago (High-Precision Telematics)',
    
    oilDiagnostics: {
      pressurePsi: 44.8,
      targetRangePsi: [35, 55],
      status: 'optimal',
      oilLifePercent: 86,
      oilTempCelsius: 89,
      viscosityGrade: 'Shell Rimula R6 LME 10W-40 Low-SAPS',
      filterDiffPressurePsi: 2.1,
      sumpLevelStatus: 'Normal',
    },

    tpmsDiagnostics: {
      axleCount: 2,
      totalTires: 6,
      overallStatus: 'optimal',
      tires: [
        { positionId: 'steer_l', positionName: 'Steer Front Left', axleGroup: 'steer', currentPsi: 110, targetPsi: 110, tempCelsius: 38, treadDepthMm: 15.1, status: 'optimal' },
        { positionId: 'steer_r', positionName: 'Steer Front Right', axleGroup: 'steer', currentPsi: 110, targetPsi: 110, tempCelsius: 39, treadDepthMm: 15.0, status: 'optimal' },
        { positionId: 'd1_outer_l', positionName: 'Drive Rear Outer Left', axleGroup: 'drive1', currentPsi: 108, targetPsi: 110, tempCelsius: 42, treadDepthMm: 14.2, status: 'optimal' },
        { positionId: 'd1_inner_l', positionName: 'Drive Rear Inner Left', axleGroup: 'drive1', currentPsi: 109, targetPsi: 110, tempCelsius: 43, treadDepthMm: 14.1, status: 'optimal' },
        { positionId: 'd1_inner_r', positionName: 'Drive Rear Inner Right', axleGroup: 'drive1', currentPsi: 109, targetPsi: 110, tempCelsius: 43, treadDepthMm: 14.0, status: 'optimal' },
        { positionId: 'd1_outer_r', positionName: 'Drive Rear Outer Right', axleGroup: 'drive1', currentPsi: 111, targetPsi: 110, tempCelsius: 41, treadDepthMm: 14.3, status: 'optimal' },
      ],
    },

    maintenanceSchedule: {
      serviceType: 'Service A: 5,000 km Preventative Inspection & Lubrication',
      serviceCode: 'PYDA-SVC-A-12',
      dueInKm: 3120,
      dueInDays: 22,
      scheduledDate: 'October 12, 2026',
      serviceStatus: 'on_schedule',
      workshopFacility: 'Pyda Central Heavy Maintenance Bay, Idu Industrial Yard',
      workshopCity: 'Abuja (Idu)',
      leadTechnician: 'Engr. Danjuma Bello',
      technicianPhone: '0806 246 6212',
      estimatedDowntimeHours: 2.0,
      coveredUnderPydaAgreement: true,
      checklist: [
        { task: 'Engine oil & multi-stage filter replacement', mandatory: true, estimatedMinutes: 40 },
        { task: 'Air suspension bladder leak test & height sensor calibration', mandatory: true, estimatedMinutes: 30 },
        { task: 'Tail-lift hydraulic pump fluid check & safety cutoff test', mandatory: true, estimatedMinutes: 30 },
        { task: 'Battery load test & alternator diode check', mandatory: true, estimatedMinutes: 20 },
      ],
      lastCompletedService: {
        serviceCode: 'PYDA-SVC-B-03',
        completedDate: 'August 02, 2026',
        odometerKm: 96520,
        facility: 'Pyda Central Bay Idu, Abuja',
      },
    },

    activeDtcCodes: [],

    engineVitals: {
      coolantTempCelsius: 86,
      airBrakePressurePsi: 124,
      batteryVolts: 28.2,
      transmissionTempCelsius: 78,
      engineHours: 2100,
      odometerKm: 98400,
      defLevelPercent: 91,
      waterInFuelSensor: false,
      governedSpeedCapKmh: 80,
    },
  },
  {
    id: 'health-hvy-202',
    unitCode: 'MTM-HVY-202',
    plateNumber: 'KAN-312-TY (Kano)',
    makeModel: 'DAF XF 480 Super Space Cab (40T)',
    category: 'heavy_trailer',
    tonnage: '40 Tons',
    driverName: 'Aliyu Garba',
    driverPhone: '0802 560 9972',
    driverAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    routeCorridor: 'Lagos ➔ Kaduna ➔ Zaria ➔ Kano Corridor',
    currentLocation: 'Kaduna South Bypass, Kaduna State',
    operatingStatus: 'in_transit',
    overallHealthScore: 89,
    overallStatus: 'nominal',
    lastCanBusPing: '18s ago',
    
    oilDiagnostics: {
      pressurePsi: 41.2,
      targetRangePsi: [35, 55],
      status: 'optimal',
      oilLifePercent: 64,
      oilTempCelsius: 93,
      viscosityGrade: 'Total Rubia TIR 9900 FE 10W-30',
      filterDiffPressurePsi: 3.4,
      sumpLevelStatus: 'Normal',
    },

    tpmsDiagnostics: {
      axleCount: 3,
      totalTires: 10,
      overallStatus: 'optimal',
      tires: [
        { positionId: 'steer_l', positionName: 'Steer Front Left', axleGroup: 'steer', currentPsi: 112, targetPsi: 110, tempCelsius: 43, treadDepthMm: 13.9, status: 'optimal' },
        { positionId: 'steer_r', positionName: 'Steer Front Right', axleGroup: 'steer', currentPsi: 111, targetPsi: 110, tempCelsius: 44, treadDepthMm: 13.7, status: 'optimal' },
        { positionId: 'd1_outer_l', positionName: 'Drive 1 Outer Left', axleGroup: 'drive1', currentPsi: 109, targetPsi: 110, tempCelsius: 48, treadDepthMm: 11.8, status: 'optimal' },
        { positionId: 'd1_inner_l', positionName: 'Drive 1 Inner Left', axleGroup: 'drive1', currentPsi: 108, targetPsi: 110, tempCelsius: 49, treadDepthMm: 11.6, status: 'optimal' },
        { positionId: 'd1_inner_r', positionName: 'Drive 1 Inner Right', axleGroup: 'drive1', currentPsi: 107, targetPsi: 110, tempCelsius: 50, treadDepthMm: 11.5, status: 'optimal' },
        { positionId: 'd1_outer_r', positionName: 'Drive 1 Outer Right', axleGroup: 'drive1', currentPsi: 110, targetPsi: 110, tempCelsius: 47, treadDepthMm: 11.9, status: 'optimal' },
        { positionId: 'd2_outer_l', positionName: 'Drive 2 Outer Left', axleGroup: 'drive2', currentPsi: 110, targetPsi: 110, tempCelsius: 46, treadDepthMm: 12.1, status: 'optimal' },
        { positionId: 'd2_inner_l', positionName: 'Drive 2 Inner Left', axleGroup: 'drive2', currentPsi: 108, targetPsi: 110, tempCelsius: 47, treadDepthMm: 12.0, status: 'optimal' },
        { positionId: 'd2_inner_r', positionName: 'Drive 2 Inner Right', axleGroup: 'drive2', currentPsi: 109, targetPsi: 110, tempCelsius: 48, treadDepthMm: 11.8, status: 'optimal' },
        { positionId: 'd2_outer_r', positionName: 'Drive 2 Outer Right', axleGroup: 'drive2', currentPsi: 111, targetPsi: 110, tempCelsius: 45, treadDepthMm: 12.2, status: 'optimal' },
      ],
    },

    maintenanceSchedule: {
      serviceType: 'Service A: 5,000 km High-Mileage Corridor Service',
      serviceCode: 'PYDA-SVC-A-15',
      dueInKm: 1420,
      dueInDays: 9,
      scheduledDate: 'September 29, 2026',
      serviceStatus: 'on_schedule',
      workshopFacility: 'Trans-Sahel & Northern Railhead Terminal Workshop',
      workshopCity: 'Kano (Sharada)',
      leadTechnician: 'Engr. Mohammed Sanusi',
      technicianPhone: '0802 560 9972',
      estimatedDowntimeHours: 2.5,
      coveredUnderPydaAgreement: true,
      checklist: [
        { task: 'Turbocharger wastegate actuator test & intercooler hose clamp torque', mandatory: true, estimatedMinutes: 45 },
        { task: 'Engine oil & double centrifugal bypass filter replacement', mandatory: true, estimatedMinutes: 45 },
        { task: 'Coolant freeze point & nitrate additive test', mandatory: false, estimatedMinutes: 20 },
        { task: 'Wheel nut torque verification with certified torque wrench (600 Nm)', mandatory: true, estimatedMinutes: 35 },
      ],
      lastCompletedService: {
        serviceCode: 'PYDA-SVC-A-09',
        completedDate: 'August 18, 2026',
        odometerKm: 336200,
        facility: 'Sharada Terminal Kano',
      },
    },

    activeDtcCodes: [],

    engineVitals: {
      coolantTempCelsius: 88,
      airBrakePressurePsi: 125,
      batteryVolts: 27.5,
      transmissionTempCelsius: 82,
      engineHours: 7200,
      odometerKm: 341200,
      defLevelPercent: 78,
      waterInFuelSensor: false,
      governedSpeedCapKmh: 80,
    },
  },
  {
    id: 'health-rig-08',
    unitCode: 'MTM-RIG-08',
    plateNumber: 'RIV-901-PH (Rivers)',
    makeModel: 'Mack Granite 6x4 Heavy Lowbed',
    category: 'specialized_rig',
    tonnage: '25 Tons',
    driverName: 'Emeka Nnamdi',
    driverPhone: '0806 246 6212',
    driverAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    routeCorridor: 'Port Harcourt ➔ Ore ➔ Lagos Transit Corridor',
    currentLocation: 'Ore Transit Expressway, Ondo State',
    operatingStatus: 'in_transit',
    overallHealthScore: 61,
    overallStatus: 'critical',
    lastCanBusPing: '22s ago (CAN-bus Diagnostic Trigger)',
    
    oilDiagnostics: {
      pressurePsi: 18.2,
      targetRangePsi: [35, 55],
      status: 'critical_low',
      warningMessage: 'CRITICAL OIL PRESSURE WARNING: Pressure plummeted to 18.2 PSI. Automatic engine derate (60% torque reduction) active to protect crankshaft bearings. Driver instructed to pull over into Ore safe staging bay.',
      oilLifePercent: 12,
      oilTempCelsius: 118,
      viscosityGrade: 'Mobil Delvac Modern 15W-40',
      filterDiffPressurePsi: 9.4,
      sumpLevelStatus: 'Low (-1.2L)',
    },

    tpmsDiagnostics: {
      axleCount: 3,
      totalTires: 10,
      overallStatus: 'warning',
      summaryAlert: 'Trailer Steer Right tire operating at elevated temperature (78°C) due to continuous heavy generator haulage load.',
      tires: [
        { positionId: 'steer_l', positionName: 'Steer Front Left', axleGroup: 'steer', currentPsi: 110, targetPsi: 110, tempCelsius: 48, treadDepthMm: 11.2, status: 'optimal' },
        { positionId: 'steer_r', positionName: 'Steer Front Right', axleGroup: 'steer', currentPsi: 112, targetPsi: 110, tempCelsius: 52, treadDepthMm: 11.0, status: 'optimal' },
        { positionId: 'd1_outer_l', positionName: 'Drive 1 Outer Left', axleGroup: 'drive1', currentPsi: 108, targetPsi: 110, tempCelsius: 62, treadDepthMm: 9.8, status: 'optimal' },
        { positionId: 'd1_inner_l', positionName: 'Drive 1 Inner Left', axleGroup: 'drive1', currentPsi: 106, targetPsi: 110, tempCelsius: 64, treadDepthMm: 9.5, status: 'optimal' },
        { positionId: 'd1_inner_r', positionName: 'Drive 1 Inner Right', axleGroup: 'drive1', currentPsi: 104, targetPsi: 110, tempCelsius: 68, treadDepthMm: 9.4, status: 'optimal' },
        { positionId: 'd1_outer_r', positionName: 'Drive 1 Outer Right', axleGroup: 'drive1', currentPsi: 109, targetPsi: 110, tempCelsius: 63, treadDepthMm: 9.7, status: 'optimal' },
        { positionId: 'd2_outer_l', positionName: 'Drive 2 Outer Left', axleGroup: 'drive2', currentPsi: 106, targetPsi: 110, tempCelsius: 72, treadDepthMm: 9.9, status: 'optimal' },
        { positionId: 'd2_inner_l', positionName: 'Drive 2 Inner Left', axleGroup: 'drive2', currentPsi: 105, targetPsi: 110, tempCelsius: 74, treadDepthMm: 9.8, status: 'optimal' },
        { positionId: 'd2_inner_r', positionName: 'Drive 2 Inner Right', axleGroup: 'drive2', currentPsi: 96, targetPsi: 110, tempCelsius: 78, treadDepthMm: 9.2, status: 'high_temp', alert: 'Tire temp 78°C exceeds safe limit (70°C). Pressure 96 PSI.' },
        { positionId: 'd2_outer_r', positionName: 'Drive 2 Outer Right', axleGroup: 'drive2', currentPsi: 108, targetPsi: 110, tempCelsius: 69, treadDepthMm: 9.7, status: 'optimal' },
      ],
    },

    maintenanceSchedule: {
      serviceType: 'EMERGENCY SERVICE: Low Oil Pressure Diagnostic & Filter By-Pass',
      serviceCode: 'PYDA-EMERGENCY-01',
      dueInKm: -60,
      dueInDays: -1,
      scheduledDate: 'IMMEDIATE DISPATCH',
      serviceStatus: 'overdue',
      workshopFacility: 'South-West Mobile Fleet Rapid Intervention Unit #2',
      workshopCity: 'Lagos (Amuwo)',
      leadTechnician: 'Engr. Taiwo Adeleke (Mobile Intervention Unit Lead)',
      technicianPhone: '0806 246 6212',
      estimatedDowntimeHours: 3.0,
      coveredUnderPydaAgreement: true,
      checklist: [
        { task: 'Oil pressure sensor gauge mechanical verification with analog test manometer', mandatory: true, estimatedMinutes: 20 },
        { task: 'Engine oil filter element teardown & metal particulate inspection', mandatory: true, estimatedMinutes: 30 },
        { task: 'High-pressure oil relief valve spring clearance inspection', mandatory: true, estimatedMinutes: 45 },
        { task: 'Complete fresh synthetic 15W-40 flush & fresh OEM filters', mandatory: true, estimatedMinutes: 40 },
      ],
      lastCompletedService: {
        serviceCode: 'PYDA-SVC-B-01',
        completedDate: 'June 29, 2026',
        odometerKm: 178200,
        facility: 'Trans-Amadi Hub Port Harcourt',
      },
    },

    activeDtcCodes: [
      {
        code: 'SPN 100 FMI 1',
        system: 'Engine Lubrication',
        severity: 'critical',
        title: 'Critical Low Engine Oil Pressure (< 20 PSI)',
        description: 'Engine oil pressure at 18.2 PSI under highway load. Engine ECM automatically commanded 60% power derate to protect turbo and rod journals.',
        timestamp: 'Today, 10:08 AM',
        recommendedAction: 'Immediate safe pullover. Mobile Support Van dispatched from Benin Bypass station with high-grade synthetic oil & replacement filters.',
      },
      {
        code: 'SPN 110 FMI 0',
        system: 'Cooling System',
        severity: 'warning',
        title: 'High Engine Oil / Coolant Thermal Gradient',
        description: 'Oil temp measured at 118°C exceeding normal 95°C ceiling due to heavy lowbed 25T load on coastal humidity.',
        timestamp: 'Today, 10:02 AM',
        recommendedAction: 'Inspect oil cooler core for dirt clogs and idle engine at 1,000 RPM for 5 minutes before shutoff.',
      },
    ],

    engineVitals: {
      coolantTempCelsius: 98,
      airBrakePressurePsi: 118,
      batteryVolts: 27.2,
      transmissionTempCelsius: 95,
      engineHours: 4320,
      odometerKm: 189000,
      defLevelPercent: 54,
      waterInFuelSensor: false,
      governedSpeedCapKmh: 80,
    },
  },
  {
    id: 'health-can-09',
    unitCode: 'MTM-CAN-09',
    plateNumber: 'ABJ-504-XY (Abuja)',
    makeModel: 'Isuzu NPR 75L Turbo Intercooled Box',
    category: 'urban_van',
    tonnage: '5 Tons',
    driverName: 'Chinedu Eze',
    driverPhone: '0803 719 4022',
    driverAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    routeCorridor: 'Abuja Metropolitan Intra-City & Express Dispatch',
    currentLocation: 'Maitama / Central Business District, Abuja',
    operatingStatus: 'docked',
    overallHealthScore: 98,
    overallStatus: 'nominal',
    lastCanBusPing: '1m ago',
    
    oilDiagnostics: {
      pressurePsi: 48.0,
      targetRangePsi: [35, 55],
      status: 'optimal',
      oilLifePercent: 92,
      oilTempCelsius: 84,
      viscosityGrade: 'Isuzu Besco Clean 10W-30',
      filterDiffPressurePsi: 1.8,
      sumpLevelStatus: 'Normal',
    },

    tpmsDiagnostics: {
      axleCount: 2,
      totalTires: 6,
      overallStatus: 'optimal',
      tires: [
        { positionId: 'steer_l', positionName: 'Front Left Steer', axleGroup: 'steer', currentPsi: 95, targetPsi: 95, tempCelsius: 34, treadDepthMm: 12.8, status: 'optimal' },
        { positionId: 'steer_r', positionName: 'Front Right Steer', axleGroup: 'steer', currentPsi: 95, targetPsi: 95, tempCelsius: 35, treadDepthMm: 12.6, status: 'optimal' },
        { positionId: 'd1_outer_l', positionName: 'Rear Outer Left', axleGroup: 'drive1', currentPsi: 98, targetPsi: 95, tempCelsius: 36, treadDepthMm: 11.8, status: 'optimal' },
        { positionId: 'd1_inner_l', positionName: 'Rear Inner Left', axleGroup: 'drive1', currentPsi: 96, targetPsi: 95, tempCelsius: 37, treadDepthMm: 11.5, status: 'optimal' },
        { positionId: 'd1_inner_r', positionName: 'Rear Inner Right', axleGroup: 'drive1', currentPsi: 95, targetPsi: 95, tempCelsius: 37, treadDepthMm: 11.6, status: 'optimal' },
        { positionId: 'd1_outer_r', positionName: 'Rear Outer Right', axleGroup: 'drive1', currentPsi: 97, targetPsi: 95, tempCelsius: 36, treadDepthMm: 11.9, status: 'optimal' },
      ],
    },

    maintenanceSchedule: {
      serviceType: 'Service A: 5,000 km Urban Delivery Service',
      serviceCode: 'PYDA-SVC-A-18',
      dueInKm: 2890,
      dueInDays: 20,
      scheduledDate: 'October 10, 2026',
      serviceStatus: 'on_schedule',
      workshopFacility: 'Pyda Central Heavy Maintenance Bay, Idu Industrial Yard',
      workshopCity: 'Abuja (Idu)',
      leadTechnician: 'Engr. Babatunde Lawal',
      technicianPhone: '0806 246 6212',
      estimatedDowntimeHours: 2.0,
      coveredUnderPydaAgreement: true,
      checklist: [
        { task: 'Engine oil & fuel secondary filter cartridge change', mandatory: true, estimatedMinutes: 30 },
        { task: 'Clutch pedal free-play & brake booster vacuum check', mandatory: true, estimatedMinutes: 25 },
        { task: 'Kingpin lubrication & front wheel hub bearing end-play check', mandatory: true, estimatedMinutes: 35 },
      ],
      lastCompletedService: {
        serviceCode: 'PYDA-SVC-B-04',
        completedDate: 'July 28, 2026',
        odometerKm: 42100,
        facility: 'Idu Industrial Bay, Abuja',
      },
    },

    activeDtcCodes: [],

    engineVitals: {
      coolantTempCelsius: 82,
      airBrakePressurePsi: 118,
      batteryVolts: 28.4,
      transmissionTempCelsius: 74,
      engineHours: 1140,
      odometerKm: 44210,
      defLevelPercent: 95,
      waterInFuelSensor: false,
      governedSpeedCapKmh: 80,
    },
  },
  {
    id: 'health-hiab-02',
    unitCode: 'MTM-HIAB-02',
    plateNumber: 'LAG-772-AA (Lagos)',
    makeModel: 'DAF CF 370 6x4 with 10T Palfinger Boom',
    category: 'specialized_rig',
    tonnage: '20 Tons with Crane',
    driverName: 'Suleiman Yusuf',
    driverPhone: '0806 246 6212',
    driverAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    routeCorridor: 'Lagos Maritime Port & Victoria Island Corporate Hubs',
    currentLocation: 'Apapa Port Terminal / Wharf Road, Lagos',
    operatingStatus: 'docked',
    overallHealthScore: 92,
    overallStatus: 'nominal',
    lastCanBusPing: '35s ago',
    
    oilDiagnostics: {
      pressurePsi: 42.5,
      targetRangePsi: [35, 55],
      status: 'optimal',
      oilLifePercent: 78,
      oilTempCelsius: 87,
      viscosityGrade: 'Shell Rimula R4 X 15W-40',
      filterDiffPressurePsi: 2.8,
      sumpLevelStatus: 'Normal',
    },

    tpmsDiagnostics: {
      axleCount: 3,
      totalTires: 10,
      overallStatus: 'optimal',
      tires: [
        { positionId: 'steer_l', positionName: 'Steer Front Left', axleGroup: 'steer', currentPsi: 115, targetPsi: 115, tempCelsius: 40, treadDepthMm: 14.8, status: 'optimal' },
        { positionId: 'steer_r', positionName: 'Steer Front Right', axleGroup: 'steer', currentPsi: 115, targetPsi: 115, tempCelsius: 41, treadDepthMm: 14.7, status: 'optimal' },
        { positionId: 'd1_outer_l', positionName: 'Drive 1 Outer Left', axleGroup: 'drive1', currentPsi: 110, targetPsi: 110, tempCelsius: 44, treadDepthMm: 13.5, status: 'optimal' },
        { positionId: 'd1_inner_l', positionName: 'Drive 1 Inner Left', axleGroup: 'drive1', currentPsi: 110, targetPsi: 110, tempCelsius: 44, treadDepthMm: 13.4, status: 'optimal' },
        { positionId: 'd1_inner_r', positionName: 'Drive 1 Inner Right', axleGroup: 'drive1', currentPsi: 109, targetPsi: 110, tempCelsius: 45, treadDepthMm: 13.2, status: 'optimal' },
        { positionId: 'd1_outer_r', positionName: 'Drive 1 Outer Right', axleGroup: 'drive1', currentPsi: 111, targetPsi: 110, tempCelsius: 43, treadDepthMm: 13.6, status: 'optimal' },
        { positionId: 'd2_outer_l', positionName: 'Drive 2 Outer Left', axleGroup: 'drive2', currentPsi: 110, targetPsi: 110, tempCelsius: 45, treadDepthMm: 13.8, status: 'optimal' },
        { positionId: 'd2_inner_l', positionName: 'Drive 2 Inner Left', axleGroup: 'drive2', currentPsi: 108, targetPsi: 110, tempCelsius: 46, treadDepthMm: 13.7, status: 'optimal' },
        { positionId: 'd2_inner_r', positionName: 'Drive 2 Inner Right', axleGroup: 'drive2', currentPsi: 109, targetPsi: 110, tempCelsius: 45, treadDepthMm: 13.5, status: 'optimal' },
        { positionId: 'd2_outer_r', positionName: 'Drive 2 Outer Right', axleGroup: 'drive2', currentPsi: 112, targetPsi: 110, tempCelsius: 44, treadDepthMm: 13.9, status: 'optimal' },
      ],
    },

    maintenanceSchedule: {
      serviceType: 'Service B + HIAB Hydraulic Crane Load Cell Recertification',
      serviceCode: 'PYDA-SVC-HIAB-06',
      dueInKm: 1850,
      dueInDays: 14,
      scheduledDate: 'October 04, 2026',
      serviceStatus: 'on_schedule',
      workshopFacility: 'Pyda Maritime Terminal & Heavy Crane Workshop',
      workshopCity: 'Lagos (Amuwo)',
      leadTechnician: 'Engr. Anthony Okpara (Certified Rigging & Hydraulic Specialist)',
      technicianPhone: '0806 246 6212',
      estimatedDowntimeHours: 6.0,
      coveredUnderPydaAgreement: true,
      checklist: [
        { task: 'Crane PTO hydraulic oil filtration & return filter cartridge swap', mandatory: true, estimatedMinutes: 60 },
        { task: 'Hydraulic boom extension cylinder packing seal pressure test', mandatory: true, estimatedMinutes: 90 },
        { task: 'Load moment limiter (LML) & anti-two-block sensor calibration', mandatory: true, estimatedMinutes: 60 },
        { task: 'Engine oil 15W-40, fuel filters, & air cleaner element service', mandatory: true, estimatedMinutes: 60 },
      ],
      lastCompletedService: {
        serviceCode: 'PYDA-SVC-HIAB-02',
        completedDate: 'June 10, 2026',
        odometerKm: 132400,
        facility: 'Amuwo Odofin Maritime Bay, Lagos',
      },
    },

    activeDtcCodes: [],

    engineVitals: {
      coolantTempCelsius: 85,
      airBrakePressurePsi: 126,
      batteryVolts: 27.9,
      transmissionTempCelsius: 81,
      engineHours: 5410,
      odometerKm: 138900,
      defLevelPercent: 82,
      waterInFuelSensor: false,
      governedSpeedCapKmh: 80,
    },
  },
];
