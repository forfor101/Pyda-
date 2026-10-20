#!/usr/bin/env tsx
import { writeSitemapFiles, SITE_ROUTES, generateSitemapXml, generateRobotsTxt } from '../server/sitemapService.ts';
import fs from 'fs';
import path from 'path';

function run() {
  console.log('====================================================');
  console.log('🗺️  Pyda Movers & Logistics - Sitemap Generator');
  console.log('====================================================');

  const baseUrl = process.env.VITE_APP_URL || process.env.APP_URL || 'https://pydamovers.com';
  console.log(`🌐 Base Canonical URL: ${baseUrl}`);
  console.log(`📑 Total Indexable Routes: ${SITE_ROUTES.length}`);

  const targetDirs = ['public'];
  // Also write to dist if it already exists from prior builds
  if (fs.existsSync(path.join(process.cwd(), 'dist'))) {
    targetDirs.push('dist');
  }

  const result = writeSitemapFiles(targetDirs, baseUrl);

  if (result.success) {
    console.log(`✅ Successfully generated sitemap.xml (${(result.xmlLength / 1024).toFixed(2)} KB)`);
    console.log(`✅ Successfully generated robots.txt with sitemap reference`);
    console.log('📂 Output File Locations:');
    result.generatedFiles.forEach((file) => console.log(`   - ${file}`));

    console.log('\n🔍 Indexed Routes Summary:');
    SITE_ROUTES.forEach((r, idx) => {
      const formattedPath = r.path ? `/${r.path}` : '/';
      const imgCount = r.images?.length || 0;
      console.log(`   [${idx + 1}] Priority ${r.priority.toFixed(2)} | Freq: ${r.changefreq.padEnd(7)} | ${formattedPath} ${imgCount > 0 ? `(${imgCount} image tags)` : ''}`);
    });
    console.log('====================================================\n');
  } else {
    console.error('❌ Error generating sitemap files.');
    process.exit(1);
  }
}

run();
