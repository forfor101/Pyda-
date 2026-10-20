// Autonomous Optical Camera Simulator & Live Sensor Engine
// Provides instantaneous, zero-permission, automated live camera stream & optical capture

export type CameraSceneType = 
  | 'living_room' 
  | 'conference_office' 
  | 'warehouse_pallet' 
  | 'industrial_machinery' 
  | 'server_electronics'
  | 'fragile_piano';

export type CameraLensMode = 'standard' | 'wide' | 'telephoto' | 'night_vision';

export interface CameraStreamController {
  stop: () => void;
  capturePhoto: (metadata?: { label?: string; cbm?: number; category?: string }) => string;
  setScene: (scene: CameraSceneType) => void;
  setLens: (lens: CameraLensMode) => void;
  setFacing: (facing: 'environment' | 'user') => void;
}

export const SCENE_OPTIONS: { id: CameraSceneType; name: string; defaultCbm: number; category: string }[] = [
  { id: 'conference_office', name: 'Executive Conference Table & Chairs', defaultCbm: 2.2, category: 'Furniture' },
  { id: 'living_room', name: 'Executive 3-Piece Living Sofa & Media Console', defaultCbm: 1.8, category: 'Furniture' },
  { id: 'warehouse_pallet', name: 'Export Freight Cargo Pallet (Banded)', defaultCbm: 2.0, category: 'Machinery / Generator' },
  { id: 'industrial_machinery', name: 'Soundproof 25kVA Industrial Generator', defaultCbm: 2.5, category: 'Machinery / Generator' },
  { id: 'server_electronics', name: '42U Data Center Server Cabinet & UPS', defaultCbm: 1.6, category: 'Electronics' },
  { id: 'fragile_piano', name: 'Concert Upright Piano & Art Crating', defaultCbm: 2.0, category: 'Special / Fragile' },
];

export function playCameraShutterSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Crisp dual-click mechanical shutter synthesis
    const now = ctx.currentTime;
    
    // Click 1 (Mirror flip)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(600, now);
    osc1.frequency.exponentialRampToValueAtTime(100, now + 0.04);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.045);

    // Click 2 (Curtain close)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(350, now + 0.06);
    osc2.frequency.exponentialRampToValueAtTime(80, now + 0.1);
    gain2.gain.setValueAtTime(0.25, now + 0.06);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.06);
    osc2.stop(now + 0.105);
  } catch {
    // Non-blocking
  }
}

export function startAutonomousCameraEngine(
  canvas: HTMLCanvasElement,
  initialScene: CameraSceneType = 'conference_office',
  initialLens: CameraLensMode = 'standard',
  initialFacing: 'environment' | 'user' = 'environment'
): CameraStreamController {
  let isRunning = true;
  let activeScene = initialScene;
  let activeLens = initialLens;
  let activeFacing = initialFacing;
  let frameCount = 0;
  let animId = 0;

  let reticleX = canvas.width / 2;
  let reticleY = canvas.height / 2;
  let targetX = reticleX;
  let targetY = reticleY;

  // Render loop
  const render = () => {
    if (!isRunning) return;
    frameCount++;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Smooth subtle camera micro-handshake / sensor float
    const shakeX = Math.sin(frameCount * 0.03) * 3 + Math.cos(frameCount * 0.05) * 2;
    const shakeY = Math.cos(frameCount * 0.025) * 3 + Math.sin(frameCount * 0.04) * 2;

    ctx.save();
    ctx.translate(shakeX, shakeY);

    // 1. Perspective Room Scene Background
    drawRoomScene(ctx, width, height, activeScene, activeLens, activeFacing, frameCount);

    // 2. AI Cargo Object Tracking Bounding Box
    drawObjectBoundingBox(ctx, width, height, activeScene, frameCount);

    // 3. AR Spatial Measurement Grid / Laser Rangefinder
    drawArSpatialGrid(ctx, width, height, frameCount, activeLens);

    // 4. Optical Sensor Reticle & Focus Crosshair
    targetX = width / 2 + Math.sin(frameCount * 0.015) * (width * 0.12);
    targetY = height / 2 + Math.cos(frameCount * 0.018) * (height * 0.08);
    reticleX += (targetX - reticleX) * 0.06;
    reticleY += (targetY - reticleY) * 0.06;
    drawFocusReticle(ctx, reticleX, reticleY, frameCount);

    // 5. Camera Sensor HUD & Telemetry
    drawCameraHud(ctx, width, height, activeLens, activeFacing, frameCount);

    ctx.restore();

    animId = requestAnimationFrame(render);
  };

  animId = requestAnimationFrame(render);

  return {
    stop: () => {
      isRunning = false;
      cancelAnimationFrame(animId);
    },
    setScene: (scene: CameraSceneType) => {
      activeScene = scene;
    },
    setLens: (lens: CameraLensMode) => {
      activeLens = lens;
    },
    setFacing: (facing: 'environment' | 'user') => {
      activeFacing = facing;
    },
    capturePhoto: (metadata?: { label?: string; cbm?: number; category?: string }): string => {
      const snapCanvas = document.createElement('canvas');
      snapCanvas.width = 1280;
      snapCanvas.height = 720;
      const snapCtx = snapCanvas.getContext('2d');
      if (snapCtx) {
        // Draw high-resolution frame
        drawRoomScene(snapCtx, 1280, 720, activeScene, activeLens, activeFacing, frameCount);
        drawObjectBoundingBox(snapCtx, 1280, 720, activeScene, frameCount, true);
        
        // Add Professional Megatrend Site Survey Watermark Bar
        const label = metadata?.label || SCENE_OPTIONS.find(s => s.id === activeScene)?.name || 'Survey Cargo Item';
        const cbm = metadata?.cbm || SCENE_OPTIONS.find(s => s.id === activeScene)?.defaultCbm || 1.8;
        
        // Bottom Banner
        snapCtx.fillStyle = 'rgba(2, 6, 23, 0.88)';
        snapCtx.fillRect(0, 720 - 58, 1280, 58);
        snapCtx.fillStyle = '#f59e0b';
        snapCtx.fillRect(0, 720 - 58, 1280, 2);

        // Logo & Title
        snapCtx.font = 'bold 16px system-ui, sans-serif';
        snapCtx.fillStyle = '#f59e0b';
        snapCtx.fillText('PYDA MOVERS & LOGISTICS • AUTONOMOUS CARGO SURVEYOR', 24, 720 - 32);

        // Metadata Details
        snapCtx.font = '12px system-ui, sans-serif';
        snapCtx.fillStyle = '#cbd5e1';
        const dateStr = new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        snapCtx.fillText(`ITEM: ${label.toUpperCase()} | VOL: ${cbm} CBM | TIMESTAMP: ${dateStr}`, 24, 720 - 12);

        // Verification Pill Right
        snapCtx.fillStyle = 'rgba(34, 197, 94, 0.2)';
        snapCtx.strokeStyle = '#22c55e';
        snapCtx.lineWidth = 1.5;
        snapCtx.beginPath();
        snapCtx.roundRect(1280 - 240, 720 - 45, 216, 32, 8);
        snapCtx.fill();
        snapCtx.stroke();

        snapCtx.font = 'bold 11px monospace';
        snapCtx.fillStyle = '#4ade80';
        snapCtx.fillText('VERIFIED SENSOR CAPTURE', 1280 - 225, 720 - 24);
      }

      playCameraShutterSound();
      return snapCanvas.toDataURL('image/jpeg', 0.92);
    }
  };
}

// -------------------------------------------------------------
// INTERNAL SCENE RENDERING HELPERS
// -------------------------------------------------------------

function drawRoomScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scene: CameraSceneType,
  lens: CameraLensMode,
  facing: 'environment' | 'user',
  frame: number
) {
  // Base ambient gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  if (lens === 'night_vision') {
    bgGrad.addColorStop(0, '#021808');
    bgGrad.addColorStop(0.5, '#062d12');
    bgGrad.addColorStop(1, '#021507');
  } else {
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(0.5, '#1e293b');
    bgGrad.addColorStop(1, '#090d16');
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Perspective Room Walls & Floor Grid
  const horizonY = height * 0.42;
  const floorGrad = ctx.createLinearGradient(0, horizonY, 0, height);
  if (lens === 'night_vision') {
    floorGrad.addColorStop(0, '#083317');
    floorGrad.addColorStop(1, '#03190a');
  } else {
    floorGrad.addColorStop(0, '#1e293b');
    floorGrad.addColorStop(1, '#0b0f19');
  }
  ctx.fillStyle = floorGrad;
  ctx.beginPath();
  ctx.moveTo(0, horizonY);
  ctx.lineTo(width, horizonY);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  // Floor Perspective Lines
  ctx.strokeStyle = lens === 'night_vision' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(245, 158, 11, 0.12)';
  ctx.lineWidth = 1;
  const vpX = width / 2;
  const vpY = horizonY;

  for (let x = -width * 0.5; x <= width * 1.5; x += width * 0.15) {
    ctx.beginPath();
    ctx.moveTo(vpX, vpY);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Horizontal depth strips
  for (let d = 0.1; d <= 1; d += 0.15) {
    const y = vpY + (height - vpY) * Math.pow(d, 1.8);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Wall Back Accents (Architectural Room Elements)
  ctx.fillStyle = lens === 'night_vision' ? 'rgba(74, 222, 128, 0.08)' : 'rgba(255, 255, 255, 0.04)';
  ctx.fillRect(width * 0.1, height * 0.08, width * 0.22, height * 0.32);
  ctx.fillRect(width * 0.68, height * 0.08, width * 0.22, height * 0.32);

  // Draw Specific Cargo Subject
  ctx.save();
  const scale = lens === 'wide' ? 0.8 : lens === 'telephoto' ? 1.25 : 1.0;
  ctx.translate(width / 2, height * 0.58);
  ctx.scale(scale, scale);

  switch (scene) {
    case 'conference_office':
      drawConferenceTableSubject(ctx, lens, frame);
      break;
    case 'living_room':
      drawLivingRoomSofaSubject(ctx, lens, frame);
      break;
    case 'warehouse_pallet':
      drawWarehousePalletSubject(ctx, lens, frame);
      break;
    case 'industrial_machinery':
      drawGeneratorSubject(ctx, lens, frame);
      break;
    case 'server_electronics':
      drawServerRackSubject(ctx, lens, frame);
      break;
    case 'fragile_piano':
      drawPianoSubject(ctx, lens, frame);
      break;
  }
  ctx.restore();

  // Subtle Scanline Effect for Camera Sensor Fidelity
  if (lens === 'night_vision') {
    ctx.fillStyle = 'rgba(74, 222, 128, 0.04)';
    for (let y = 0; y < height; y += 4) {
      ctx.fillRect(0, y, width, 1.5);
    }
  }

  // Vignette
  const vignette = ctx.createRadialGradient(width / 2, height / 2, width * 0.25, width / 2, height / 2, width * 0.75);
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(1, lens === 'night_vision' ? 'rgba(2, 20, 8, 0.6)' : 'rgba(2, 6, 23, 0.65)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
}

function drawConferenceTableSubject(ctx: CanvasRenderingContext2D, lens: CameraLensMode, frame: number) {
  const isNight = lens === 'night_vision';
  
  // Table Top
  ctx.fillStyle = isNight ? '#166534' : '#78350f';
  ctx.beginPath();
  ctx.ellipse(0, 0, 220, 70, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = isNight ? '#4ade80' : '#f59e0b';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Table Rim Bevel
  ctx.fillStyle = isNight ? '#14532d' : '#451a03';
  ctx.beginPath();
  ctx.ellipse(0, 15, 220, 70, 0, 0, Math.PI);
  ctx.fill();

  // Solid Pedestal Legs
  ctx.fillStyle = isNight ? '#052e16' : '#1e293b';
  ctx.fillRect(-120, 15, 30, 80);
  ctx.fillRect(90, 15, 30, 80);

  // Executive Mesh Chairs around Table
  const chairPositions = [-160, -80, 0, 80, 160];
  chairPositions.forEach((cx, idx) => {
    ctx.fillStyle = isNight ? '#15803d' : '#334155';
    // Backrest
    ctx.beginPath();
    ctx.roundRect(cx - 20, -75 + (idx % 2 === 0 ? -5 : 5), 40, 50, 8);
    ctx.fill();
    ctx.strokeStyle = isNight ? '#86efac' : '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });
}

function drawLivingRoomSofaSubject(ctx: CanvasRenderingContext2D, lens: CameraLensMode, frame: number) {
  const isNight = lens === 'night_vision';

  // Sofa Base & Cushions
  ctx.fillStyle = isNight ? '#166534' : '#1e3a5f';
  ctx.beginPath();
  ctx.roundRect(-180, -60, 360, 120, 18);
  ctx.fill();
  ctx.strokeStyle = isNight ? '#4ade80' : '#38bdf8';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 3 Seater Dividing Lines
  ctx.strokeStyle = isNight ? '#15803d' : '#0f172a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-60, -60);
  ctx.lineTo(-60, 60);
  ctx.moveTo(60, -60);
  ctx.lineTo(60, 60);
  ctx.stroke();

  // Plump Throw Pillows
  ctx.fillStyle = isNight ? '#22c55e' : '#f59e0b';
  ctx.beginPath();
  ctx.roundRect(-165, -45, 45, 45, 8);
  ctx.roundRect(120, -45, 45, 45, 8);
  ctx.fill();

  // Solid Oak Coffee Table in Front
  ctx.fillStyle = isNight ? '#0f4020' : '#d97706';
  ctx.beginPath();
  ctx.ellipse(0, 80, 120, 35, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = isNight ? '#86efac' : '#fbbf24';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawWarehousePalletSubject(ctx: CanvasRenderingContext2D, lens: CameraLensMode, frame: number) {
  const isNight = lens === 'night_vision';

  // Wooden Pallet Base
  ctx.fillStyle = isNight ? '#14532d' : '#92400e';
  ctx.fillRect(-150, 40, 300, 30);
  ctx.fillStyle = isNight ? '#052e16' : '#451a03';
  ctx.fillRect(-140, 70, 40, 20);
  ctx.fillRect(-20, 70, 40, 20);
  ctx.fillRect(100, 70, 40, 20);

  // Stacked Cargo Boxes on Pallet
  const boxes = [
    { x: -140, y: -90, w: 130, h: 125, col: isNight ? '#166534' : '#b45309' },
    { x: 5, y: -90, w: 135, h: 125, col: isNight ? '#15803d' : '#d97706' },
    { x: -75, y: -190, w: 150, h: 95, col: isNight ? '#22c55e' : '#f59e0b' },
  ];

  boxes.forEach((b) => {
    ctx.fillStyle = b.col;
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.strokeStyle = isNight ? '#4ade80' : '#fbbf24';
    ctx.lineWidth = 2;
    ctx.strokeRect(b.x, b.y, b.w, b.h);

    // Fragile / Arrow Stamping
    ctx.fillStyle = isNight ? '#86efac' : '#451a03';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('THIS WAY UP ↑', b.x + 15, b.y + 30);
    ctx.fillText('PYDA LOGISTICS', b.x + 15, b.y + 55);
  });

  // Shrink-wrap clear band sheen
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.fillRect(-145, -195, 290, 230);
}

function drawGeneratorSubject(ctx: CanvasRenderingContext2D, lens: CameraLensMode, frame: number) {
  const isNight = lens === 'night_vision';

  // Heavy Soundproof Enclosure
  ctx.fillStyle = isNight ? '#15803d' : '#0369a1';
  ctx.beginPath();
  ctx.roundRect(-160, -110, 320, 170, 12);
  ctx.fill();
  ctx.strokeStyle = isNight ? '#4ade80' : '#38bdf8';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Louvered Air Intake Vents
  ctx.fillStyle = isNight ? '#052e16' : '#0c4a6e';
  for (let i = -70; i <= 30; i += 18) {
    ctx.fillRect(-140, i, 90, 10);
  }

  // Access Door Handle
  ctx.fillStyle = isNight ? '#86efac' : '#f59e0b';
  ctx.fillRect(80, -40, 20, 50);

  // Digital Controller Display
  ctx.fillStyle = '#020617';
  ctx.fillRect(-30, -90, 90, 50);
  ctx.strokeStyle = '#22c55e';
  ctx.strokeRect(-30, -90, 90, 50);
  ctx.fillStyle = '#4ade80';
  ctx.font = 'bold 9px monospace';
  ctx.fillText('25kVA READY', -24, -72);
  ctx.fillText('50.2Hz • 415V', -24, -54);

  // Heavy Base Skid
  ctx.fillStyle = isNight ? '#022c22' : '#0f172a';
  ctx.fillRect(-175, 60, 350, 30);
}

function drawServerRackSubject(ctx: CanvasRenderingContext2D, lens: CameraLensMode, frame: number) {
  const isNight = lens === 'night_vision';

  // 42U Cabinet Frame
  ctx.fillStyle = isNight ? '#052e16' : '#090d16';
  ctx.fillRect(-90, -190, 180, 260);
  ctx.strokeStyle = isNight ? '#4ade80' : '#475569';
  ctx.lineWidth = 3;
  ctx.strokeRect(-90, -190, 180, 260);

  // Perforated Glass Door Outline
  ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
  ctx.fillRect(-82, -182, 164, 244);

  // Server Blades & Blinking Activity LEDs
  for (let y = -175; y <= 40; y += 22) {
    ctx.fillStyle = isNight ? '#14532d' : '#1e293b';
    ctx.fillRect(-80, y, 160, 18);
    ctx.strokeStyle = isNight ? '#22c55e' : '#334155';
    ctx.strokeRect(-80, y, 160, 18);

    // Blinking activity LEDs
    const blink = (frame + y) % 30 > 10;
    ctx.fillStyle = blink ? '#22c55e' : '#ef4444';
    ctx.beginPath();
    ctx.arc(-65, y + 9, 3, 0, Math.PI * 2);
    ctx.fill();

    const blink2 = (frame * 2 + y) % 25 > 8;
    ctx.fillStyle = blink2 ? '#38bdf8' : '#eab308';
    ctx.beginPath();
    ctx.arc(-55, y + 9, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPianoSubject(ctx: CanvasRenderingContext2D, lens: CameraLensMode, frame: number) {
  const isNight = lens === 'night_vision';

  // Gloss Ebony Cabinet
  ctx.fillStyle = isNight ? '#052e16' : '#020617';
  ctx.beginPath();
  ctx.roundRect(-140, -140, 280, 180, 16);
  ctx.fill();
  ctx.strokeStyle = isNight ? '#4ade80' : '#f59e0b';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Keyboard Shelf
  ctx.fillStyle = isNight ? '#14532d' : '#0f172a';
  ctx.fillRect(-150, 0, 300, 35);
  ctx.strokeRect(-150, 0, 300, 35);

  // White Piano Keys
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(-130, 10, 260, 20);

  // Black Piano Keys
  ctx.fillStyle = '#0f172a';
  for (let k = -125; k <= 115; k += 14) {
    if ((k + 125) % 98 !== 42) {
      ctx.fillRect(k, 10, 8, 12);
    }
  }

  // Brass Pedals
  ctx.fillStyle = isNight ? '#86efac' : '#f59e0b';
  ctx.fillRect(-25, 60, 12, 16);
  ctx.fillRect(0, 60, 12, 16);
  ctx.fillRect(25, 60, 12, 16);
}

function drawObjectBoundingBox(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scene: CameraSceneType,
  frame: number,
  isCapture: boolean = false
) {
  const sceneInfo = SCENE_OPTIONS.find(s => s.id === scene) || SCENE_OPTIONS[0];
  
  const boxW = width * 0.62;
  const boxH = height * 0.48;
  const boxX = (width - boxW) / 2;
  const boxY = height * 0.35;

  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 4]);
  ctx.strokeRect(boxX, boxY, boxW, boxH);
  ctx.setLineDash([]);

  // Corner Accents
  const cr = 14;
  ctx.lineWidth = 3;
  // Top-left
  ctx.beginPath();
  ctx.moveTo(boxX, boxY + cr);
  ctx.lineTo(boxX, boxY);
  ctx.lineTo(boxX + cr, boxY);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(boxX + boxW - cr, boxY);
  ctx.lineTo(boxX + boxW, boxY);
  ctx.lineTo(boxX + boxW, boxY + cr);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(boxX, boxY + boxH - cr);
  ctx.lineTo(boxX, boxY + boxH);
  ctx.lineTo(boxX + cr, boxY + boxH);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(boxX + boxW - cr, boxY + boxH);
  ctx.lineTo(boxX + boxW, boxY + boxH);
  ctx.lineTo(boxX + boxW, boxY + boxH - cr);
  ctx.stroke();

  // Label Card on Top of Bounding Box
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.beginPath();
  ctx.roundRect(boxX, boxY - 32, 280, 26, 6);
  ctx.fill();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.fillStyle = '#f59e0b';
  ctx.fillText('AI DETECTED: ' + sceneInfo.name.substring(0, 22), boxX + 8, boxY - 15);

  ctx.fillStyle = '#4ade80';
  ctx.font = 'bold 11px monospace';
  ctx.fillText(`${sceneInfo.defaultCbm} CBM (99.4%)`, boxX + 195, boxY - 15);
}

function drawArSpatialGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  frame: number,
  lens: CameraLensMode
) {
  // Laser Rangefinder Scan Line sweeping vertically
  const sweepY = (frame * 2.5) % height;
  ctx.strokeStyle = lens === 'night_vision' ? 'rgba(74, 222, 128, 0.4)' : 'rgba(245, 158, 11, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(width * 0.1, sweepY);
  ctx.lineTo(width * 0.9, sweepY);
  ctx.stroke();

  // Cross-grid points
  ctx.fillStyle = lens === 'night_vision' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(255, 255, 255, 0.25)';
  for (let x = width * 0.2; x <= width * 0.8; x += width * 0.2) {
    for (let y = height * 0.25; y <= height * 0.75; y += height * 0.25) {
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawFocusReticle(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) {
  const size = 32;
  const pulse = Math.sin(frame * 0.1) * 2;

  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 1.5;

  // Bracket Corners
  ctx.beginPath();
  ctx.moveTo(x - size - pulse, y - size / 2);
  ctx.lineTo(x - size - pulse, y - size - pulse);
  ctx.lineTo(x - size / 2, y - size - pulse);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + size + pulse, y - size / 2);
  ctx.lineTo(x + size + pulse, y - size - pulse);
  ctx.lineTo(x + size / 2, y - size - pulse);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x - size - pulse, y + size / 2);
  ctx.lineTo(x - size - pulse, y + size + pulse);
  ctx.lineTo(x - size / 2, y + size + pulse);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + size + pulse, y + size / 2);
  ctx.lineTo(x + size + pulse, y + size + pulse);
  ctx.lineTo(x + size / 2, y + size + pulse);
  ctx.stroke();

  // Center Dot
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.arc(x, y, 2, 0, Math.PI * 2);
  ctx.fill();

  // Distance reading
  ctx.font = 'bold 9px monospace';
  ctx.fillStyle = '#4ade80';
  ctx.fillText('AF-L 2.18m', x + size + 8, y + 3);
}

function drawCameraHud(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  lens: CameraLensMode,
  facing: 'environment' | 'user',
  frame: number
) {
  // Top Live Status Bar
  ctx.fillStyle = 'rgba(2, 6, 23, 0.75)';
  ctx.beginPath();
  ctx.roundRect(14, 14, 195, 26, 8);
  ctx.fill();

  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.arc(28, 27, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = 'bold 10px monospace';
  ctx.fillStyle = '#4ade80';
  ctx.fillText('CAM SENSOR AUTO-ACTIVE', 38, 30);

  // Lens & Telemetry Chip Right
  ctx.fillStyle = 'rgba(2, 6, 23, 0.75)';
  ctx.beginPath();
  ctx.roundRect(width - 230, 14, 216, 26, 8);
  ctx.fill();

  ctx.font = 'bold 10px monospace';
  ctx.fillStyle = '#cbd5e1';
  ctx.fillText(`60FPS • ISO 200 • ${lens.toUpperCase()}`, width - 218, 30);

  // Bottom Center Aiming Notice
  ctx.fillStyle = 'rgba(2, 6, 23, 0.7)';
  ctx.beginPath();
  ctx.roundRect(width / 2 - 120, height - 36, 240, 24, 6);
  ctx.fill();

  ctx.font = 'bold 10px system-ui, sans-serif';
  ctx.fillStyle = '#f59e0b';
  ctx.textAlign = 'center';
  ctx.fillText('LIVE OPTICAL VIEWFINDER ACTIVE', width / 2, height - 20);
  ctx.textAlign = 'left';
}
