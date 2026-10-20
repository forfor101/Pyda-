import fs from 'fs';
import path from 'path';

export interface SitemapRoute {
  path: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  title: string;
  description: string;
  images?: {
    loc: string;
    title: string;
    caption?: string;
  }[];
}

export const SITE_ROUTES: SitemapRoute[] = [
  {
    path: '',
    changefreq: 'daily',
    priority: 1.0,
    title: 'Pyda Movers & Logistics | Premier Relocation & Haulage Services Nigeria',
    description: 'Nigeria & Pan-Africa’s leading relocation and haulage partner. Corporate office migration, commercial logistics, residential moving, and heavy interstate freight across 36 states.',
    images: [
      {
        loc: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&h=630&q=80',
        title: 'Pyda Movers Nigeria Modern Logistics Fleet',
        caption: 'Heavy haulage trucks and specialized relocation vehicles in Nigeria.',
      },
      {
        loc: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1200&h=630&q=80',
        title: 'Pyda Corporate Relocation Dispatch Hub',
        caption: 'Zero-downtime office migration and nationwide haulage.',
      },
    ],
  },
  {
    path: '#services',
    changefreq: 'weekly',
    priority: 0.95,
    title: 'Comprehensive Moving & Freight Logistics Services | Pyda Movers',
    description: 'Explore full-scope relocation solutions: Corporate Headquarters Migration, Commercial Facility Logistics, Residential Moving, and 30-Ton Interstate Freight Haulage.',
    images: [
      {
        loc: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1200&h=630&q=80',
        title: 'Relocation and Logistics Services Nigeria',
      },
    ],
  },
  {
    path: '#services/corporate',
    changefreq: 'weekly',
    priority: 0.9,
    title: 'Corporate Office Relocation & IT Server Migration | Pyda Movers Nigeria',
    description: 'Zero-downtime corporate office relocation in Abuja, Lagos, and Port Harcourt. IT server disassembly, asset tagging, and weekend executive migration.',
    images: [
      {
        loc: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&h=630&q=80',
        title: 'Corporate Office Migration and Workstation Packing',
      },
    ],
  },
  {
    path: '#services/commercial',
    changefreq: 'weekly',
    priority: 0.9,
    title: 'Commercial Facility, Warehouse & Industrial Relocation | Pyda Movers',
    description: 'End-to-end relocation for warehouses, retail stores, manufacturing facilities, and medical laboratories across 36 Nigerian states.',
    images: [
      {
        loc: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&h=630&q=80',
        title: 'Commercial Warehouse Facility Relocation Logistics',
      },
    ],
  },
  {
    path: '#services/residential',
    changefreq: 'weekly',
    priority: 0.9,
    title: 'Residential Home & Apartment Moving Services | Pyda Movers',
    description: 'Premium stress-free home relocation in Lagos, Abuja, and Port Harcourt. Full packing, furniture disassembly, delicate glassware crating, and safe delivery.',
    images: [
      {
        loc: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&h=630&q=80',
        title: 'Residential Moving and Packing Service',
      },
    ],
  },
  {
    path: '#services/haulage',
    changefreq: 'weekly',
    priority: 0.9,
    title: 'Heavy Haulage & Interstate Freight Trucking (3T - 30T) | Pyda Logistics',
    description: 'Long-haul freight and heavy equipment transport across all 36 Nigerian states and Pan-African corridors. 10-ton flatbeds and 30-ton container haulage rigs.',
    images: [
      {
        loc: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&h=630&q=80',
        title: 'Heavy Freight Haulage Trucking Fleet Nigeria',
      },
    ],
  },
  {
    path: '#calculator',
    changefreq: 'weekly',
    priority: 0.85,
    title: 'Instant Moving Cost & Volume (CBM) Calculator | Pyda Movers',
    description: 'Calculate moving costs and volume in cubic meters (CBM) instantly. Get transparent freight estimates tailored for intra-city moves and interstate haulage.',
    images: [
      {
        loc: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&h=630&q=80',
        title: 'Pyda Moving Cost and CBM Calculator',
      },
    ],
  },
  {
    path: '#checklist',
    changefreq: 'monthly',
    priority: 0.8,
    title: 'Interactive Moving Day Preparation Checklist & Planner | Pyda Movers',
    description: 'Step-by-step relocation checklist from 4 weeks out to moving day. Track your progress with auto-saved browser checklists or print a customized document.',
    images: [
      {
        loc: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=1200&h=630&q=80',
        title: 'Interactive Moving Day Preparation Planner',
      },
    ],
  },
  {
    path: '#tracking',
    changefreq: 'daily',
    priority: 0.85,
    title: 'Live Shipment & Cargo GPS Tracking Portal | Pyda Movers',
    description: 'Track your moving consignment, corporate freight, or haulage truck in real time with live GPS status updates, dispatch milestones, and estimated time of arrival.',
    images: [
      {
        loc: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&h=630&q=80',
        title: 'Live Shipment GPS Tracking',
      },
    ],
  },
  {
    path: '#coverage',
    changefreq: 'monthly',
    priority: 0.85,
    title: '36 States Branch Coverage & Pan-African Corridors | Pyda Movers',
    description: 'Explore Pyda’s coverage across all 36 Nigerian states with major logistics hubs in Abuja, Lagos, Port Harcourt, and Kano, plus cross-border West Africa corridors.',
    images: [
      {
        loc: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&h=630&q=80',
        title: 'Nigeria and Pan-Africa Logistics Coverage Map',
      },
    ],
  },
  {
    path: '#about',
    changefreq: 'monthly',
    priority: 0.8,
    title: 'About Pyda Movers & Logistics Ltd | Our Heritage & Modern Fleet',
    description: 'Learn about Pyda Movers & Logistics Ltd: our heritage, modern padded haulage fleet, certified packing specialists, safety compliance, and vision across Africa.',
  },
  {
    path: '#contact',
    changefreq: 'monthly',
    priority: 0.8,
    title: 'Contact Pyda Movers | Abuja Corporate HQ & Lagos Logistics Hub',
    description: 'Get in touch with Pyda Movers & Logistics Ltd. Contact our Abuja Corporate Office (AA Rano Citygate Plaza) or Lagos Logistics Hub (Satellite Town).',
  },
  {
    path: '#careers',
    changefreq: 'weekly',
    priority: 0.8,
    title: 'Careers & Job Openings at Pyda Movers & Logistics | Join Our Fleet',
    description: 'Explore career opportunities at Pyda Movers & Logistics Ltd. Apply for Heavy Haulage Drivers, Dispatch Coordinators, Packing Technicians, and Operations Managers.',
  },
];

const DEFAULT_DOMAIN = 'https://pydamovers.com';

/**
 * Generates XML compliant with Sitemap Protocol 0.9 and Google Image Sitemap extension
 */
export function generateSitemapXml(customBaseUrl?: string, customRoutes: SitemapRoute[] = SITE_ROUTES): string {
  const baseUrl = (customBaseUrl || process.env.VITE_APP_URL || process.env.APP_URL || DEFAULT_DOMAIN).replace(/\/+$/, '');
  const nowIso = new Date().toISOString();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\n`;
  xml += `        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n`;
  xml += `        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n`;
  xml += `                            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd\n`;
  xml += `                            http://www.google.com/schemas/sitemap-image/1.1\n`;
  xml += `                            http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd">\n`;

  for (const route of customRoutes) {
    const loc = route.path ? `${baseUrl}/${route.path}` : `${baseUrl}/`;

    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(loc)}</loc>\n`;
    xml += `    <lastmod>${nowIso}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority.toFixed(2)}</priority>\n`;

    if (route.images && route.images.length > 0) {
      for (const img of route.images) {
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${escapeXml(img.loc)}</image:loc>\n`;
        xml += `      <image:title>${escapeXml(img.title)}</image:title>\n`;
        if (img.caption) {
          xml += `      <image:caption>${escapeXml(img.caption)}</image:caption>\n`;
        }
        xml += `    </image:image>\n`;
      }
    }

    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;
  return xml;
}

/**
 * Generates robots.txt content referencing the generated sitemap
 */
export function generateRobotsTxt(customBaseUrl?: string): string {
  const baseUrl = (customBaseUrl || process.env.VITE_APP_URL || process.env.APP_URL || DEFAULT_DOMAIN).replace(/\/+$/, '');

  return `# Robots.txt for Pyda Movers & Logistics Ltd
# Automatically generated for search engine web crawlers (Googlebot, Bingbot, Applebot, etc.)

User-agent: *
Allow: /
Allow: /#services
Allow: /#coverage
Allow: /#calculator
Allow: /#checklist
Allow: /#tracking
Allow: /#about
Allow: /#contact
Allow: /#careers

# Disallow internal admin management portal & API endpoints
Disallow: /#admin
Disallow: /admin
Disallow: /api/

# Sitemap Location
Sitemap: ${baseUrl}/sitemap.xml
`;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Writes sitemap.xml and robots.txt to destination directories
 */
export function writeSitemapFiles(
  targetDirs: string[] = ['public', 'dist'],
  baseUrl?: string
): { success: boolean; generatedFiles: string[]; routesCount: number; xmlLength: number } {
  const sitemapXml = generateSitemapXml(baseUrl);
  const robotsTxt = generateRobotsTxt(baseUrl);
  const generatedFiles: string[] = [];

  for (const dirName of targetDirs) {
    const fullDirPath = path.isAbsolute(dirName) ? dirName : path.join(process.cwd(), dirName);
    
    // Ensure directory exists
    try {
      if (!fs.existsSync(fullDirPath)) {
        fs.mkdirSync(fullDirPath, { recursive: true });
      }

      const sitemapPath = path.join(fullDirPath, 'sitemap.xml');
      const robotsPath = path.join(fullDirPath, 'robots.txt');

      fs.writeFileSync(sitemapPath, sitemapXml, 'utf-8');
      fs.writeFileSync(robotsPath, robotsTxt, 'utf-8');

      generatedFiles.push(sitemapPath, robotsPath);
    } catch (err) {
      console.warn(`[Sitemap] Warning writing to ${fullDirPath}:`, err);
    }
  }

  return {
    success: generatedFiles.length > 0,
    generatedFiles,
    routesCount: SITE_ROUTES.length,
    xmlLength: sitemapXml.length,
  };
}

/**
 * Returns summary stats of current sitemap configuration
 */
export function getSitemapSummary(baseUrl?: string) {
  const xml = generateSitemapXml(baseUrl);
  const robotsTxt = generateRobotsTxt(baseUrl);
  const totalImages = SITE_ROUTES.reduce((sum, r) => sum + (r.images?.length || 0), 0);

  return {
    routesCount: SITE_ROUTES.length,
    totalImages,
    lastGenerated: new Date().toISOString(),
    routes: SITE_ROUTES,
    xml,
    robotsTxt,
    defaultDomain: baseUrl || DEFAULT_DOMAIN,
  };
}
