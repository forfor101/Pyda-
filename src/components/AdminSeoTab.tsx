import React, { useState, useEffect } from 'react';
import {
  Globe,
  FileCode,
  RefreshCw,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Search,
  Sparkles,
  ShieldCheck,
  Image,
  Calendar,
  Layers,
  ArrowRight,
  Code2,
  FileText,
  Sliders,
  Tag
} from 'lucide-react';
import { AdminSeoMetadataManager } from './AdminSeoMetadataManager';

interface SeoTabProps {
  showToast: (msg: string) => void;
}

interface SitemapRouteItem {
  path: string;
  changefreq: string;
  priority: number;
  title: string;
  description: string;
  images?: { loc: string; title: string; caption?: string }[];
}

interface SitemapSummaryData {
  routesCount: number;
  totalImages: number;
  lastGenerated: string;
  routes: SitemapRouteItem[];
  xml: string;
  robotsTxt: string;
  defaultDomain: string;
}

export const AdminSeoTab: React.FC<SeoTabProps> = ({ showToast }) => {
  const [data, setData] = useState<SitemapSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [activeViewerTab, setActiveViewerTab] = useState<'service_metadata' | 'routes' | 'xml' | 'robots' | 'guide'>('service_metadata');
  const [searchFilter, setSearchFilter] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchSitemapData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/seo/sitemap');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err: any) {
      console.error('Failed to load SEO sitemap status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSitemapData();
  }, []);

  const handleRegenerate = async () => {
    try {
      setRegenerating(true);
      const res = await fetch('/api/seo/sitemap/generate', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setData(json.summary);
        showToast('Sitemap.xml and robots.txt regenerated successfully!');
      } else {
        showToast('Failed to regenerate sitemap: ' + (json.message || 'Unknown error'));
      }
    } catch (err: any) {
      showToast('Error regenerating sitemap: ' + err.message);
    } finally {
      setRegenerating(false);
    }
  };

  const copyToClipboard = (text: string, label: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${filename}`);
  };

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://pydamovers.com';
  const sitemapUrl = `${originUrl}/sitemap.xml`;
  const robotsUrl = `${originUrl}/robots.txt`;

  const filteredRoutes = (data?.routes || []).filter((r) => {
    const q = searchFilter.toLowerCase();
    return (
      r.path.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="pt-8 space-y-6">
      {/* Top Banner Card */}
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
              <Globe className="w-3.5 h-3.5" />
              <span>Automated Search Engine Indexing & Sitemaps</span>
            </div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <span>Sitemap.xml & Robots.txt Generator</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Your site automatically builds and serves a standard Sitemap Protocol 0.9 XML index with Google Image extensions. Search engines (Googlebot, Bingbot, Applebot) use this to discover and rank all 36-state logistics pages, corporate relocation calculators, and driver recruitment posts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
              <span>{regenerating ? 'Generating...' : 'Regenerate Sitemap XML'}</span>
            </button>

            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-2 transition-all"
            >
              <FileCode className="w-4 h-4 text-amber-400" />
              <span>Open sitemap.xml</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            <a
              href="/robots.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-2 transition-all"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Open robots.txt</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Indexed Routes</span>
              <Layers className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white">{data?.routesCount || 13}</div>
            <div className="text-[10px] text-slate-500 mt-1">100% public landing pages</div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Rich Image Tags</span>
              <Image className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-white">{data?.totalImages || 10}</div>
            <div className="text-[10px] text-slate-500 mt-1">Google Image Search ready</div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Admin Exclusion</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">Protected</div>
            <div className="text-[10px] text-slate-500 mt-1">/admin & /api blocked</div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Last Generation</span>
              <Calendar className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-xs font-bold text-white truncate mt-1">
              {data?.lastGenerated ? new Date(data.lastGenerated).toLocaleTimeString() : 'Just now'}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {data?.lastGenerated ? new Date(data.lastGenerated).toLocaleDateString() : 'Active'}
            </div>
          </div>
        </div>

        {/* Sitemap & Robots URL Quick Copy Bar */}
        <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-300">Public Sitemap URL:</span>
              <code className="bg-slate-900 px-2 py-1 rounded text-amber-300 font-mono text-[11px] truncate max-w-md">
                {sitemapUrl}
              </code>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(sitemapUrl, 'Sitemap URL', 'sitemap-url')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                {copiedKey === 'sitemap-url' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'sitemap-url' ? 'Copied!' : 'Copy URL'}</span>
              </button>

              <button
                onClick={() => downloadFile(data?.xml || '', 'sitemap.xml', 'application/xml')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download XML</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'service_metadata', label: '🎯 Service SEO Metadata Manager', icon: Sliders, highlight: true },
          { id: 'routes', label: '📑 Indexed Site Routes', icon: Layers, count: data?.routesCount || 13 },
          { id: 'xml', label: '📄 Sitemap XML Preview', icon: Code2 },
          { id: 'robots', label: '🤖 Robots.txt Preview', icon: FileText },
          { id: 'guide', label: '🚀 Search Console Setup Guide', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeViewerTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveViewerTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                isActive
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 font-black shadow-sm'
                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-white'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : ''}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded text-[10px] font-mono">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* VIEW 0: SERVICE SEO METADATA MANAGER */}
      {activeViewerTab === 'service_metadata' && (
        <AdminSeoMetadataManager showToast={showToast} />
      )}

      {/* VIEW 1: INDEXED ROUTES TABLE */}
      {activeViewerTab === 'routes' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search route by path, title, or keywords..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="text-xs text-slate-400">
              Showing <span className="font-bold text-white">{filteredRoutes.length}</span> of {data?.routesCount || 13} routes
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Route URL / Hash</th>
                    <th className="py-3 px-4">Frequency</th>
                    <th className="py-3 px-4">Page Meta Title</th>
                    <th className="py-3 px-4 text-center">Images</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredRoutes.map((route, idx) => {
                    const fullUrl = route.path ? `${originUrl}/${route.path}` : `${originUrl}/`;
                    const priorityColor =
                      route.priority >= 0.95
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 font-black'
                        : route.priority >= 0.85
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-blue-500/20 text-blue-400 border-blue-500/30';

                    return (
                      <tr key={idx} className="hover:bg-slate-850/50 transition-colors">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-mono border ${priorityColor}`}>
                            {route.priority.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-200">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{route.path ? `/${route.path}` : '/ (Homepage)'}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 truncate max-w-xs">{fullUrl}</div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] uppercase font-bold tracking-wider">
                            {route.changefreq}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 max-w-md">
                          <div className="font-semibold text-slate-200 truncate">{route.title}</div>
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">{route.description}</div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {route.images && route.images.length > 0 ? (
                            <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded text-[10px] font-bold">
                              {route.images.length} Image{route.images.length > 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="text-slate-600 text-[10px]">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => copyToClipboard(fullUrl, 'Page URL', `route-${idx}`)}
                              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                              title="Copy URL"
                            >
                              {copiedKey === `route-${idx}` ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            <a
                              href={route.path ? `/${route.path}` : '/'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 hover:bg-slate-800 rounded-lg text-amber-400 hover:text-amber-300 transition-colors"
                              title="Open Live Route"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: SITEMAP XML RAW PREVIEW */}
      {activeViewerTab === 'xml' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-amber-400" />
              <span>Full Generated sitemap.xml Output</span>
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(data?.xml || '', 'Sitemap XML Content', 'xml-code')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-lg border border-slate-800 flex items-center gap-1.5 transition-colors"
              >
                {copiedKey === 'xml-code' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'xml-code' ? 'Copied XML!' : 'Copy Entire XML'}</span>
              </button>
              <button
                onClick={() => downloadFile(data?.xml || '', 'sitemap.xml', 'application/xml')}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .xml</span>
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-[11px] text-amber-200/90 overflow-x-auto max-h-[500px] leading-relaxed select-all">
            <pre>{data?.xml || 'Loading XML content...'}</pre>
          </div>
        </div>
      )}

      {/* VIEW 3: ROBOTS.TXT PREVIEW */}
      {activeViewerTab === 'robots' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Direct robots.txt Directives</span>
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(data?.robotsTxt || '', 'robots.txt Content', 'robots-code')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-lg border border-slate-800 flex items-center gap-1.5 transition-colors"
              >
                {copiedKey === 'robots-code' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'robots-code' ? 'Copied robots.txt!' : 'Copy robots.txt'}</span>
              </button>
              <button
                onClick={() => downloadFile(data?.robotsTxt || '', 'robots.txt', 'text/plain')}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download robots.txt</span>
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-[11px] text-emerald-300/90 overflow-x-auto leading-relaxed select-all">
            <pre>{data?.robotsTxt || 'Loading robots.txt...'}</pre>
          </div>
        </div>
      )}

      {/* VIEW 4: SEARCH ENGINE DEPLOYMENT & CONSOLE GUIDE */}
      {activeViewerTab === 'guide' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 font-bold text-amber-400 text-sm">
              <Globe className="w-4 h-4" />
              <span>Google Search Console Integration</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              To index Pyda Movers across Google Search and Google Maps queries:
            </p>
            <ol className="space-y-2 text-xs text-slate-400 list-decimal list-inside">
              <li>Open <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer" className="text-amber-400 underline font-bold">Google Search Console</a>.</li>
              <li>Add your domain property (e.g., <code className="text-slate-200">pydamovers.com</code>).</li>
              <li>Navigate to the <strong>Sitemaps</strong> tab in the left sidebar.</li>
              <li>Enter <code className="text-amber-300 bg-slate-950 px-1.5 py-0.5 rounded">sitemap.xml</code> and click <strong>Submit</strong>.</li>
              <li>Googlebot will automatically crawl all 13 routes and associated images within 24-48 hours.</li>
            </ol>
          </div>

          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm">
              <Search className="w-4 h-4" />
              <span>Bing Webmaster & Yandex Submissions</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Bing and Yahoo automatically discover your site through <code className="text-slate-200">robots.txt</code>, but you can also submit directly:
            </p>
            <ol className="space-y-2 text-xs text-slate-400 list-decimal list-inside">
              <li>Visit <a href="https://www.bing.com/webmasters" target="_blank" rel="noreferrer" className="text-emerald-400 underline font-bold">Bing Webmaster Tools</a>.</li>
              <li>Import directly from Google Search Console or add site URL.</li>
              <li>Submit <code className="text-emerald-300 bg-slate-950 px-1.5 py-0.5 rounded">{sitemapUrl}</code>.</li>
              <li>Bingbot will prioritize interstate freight and corporate relocation landing pages.</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};
