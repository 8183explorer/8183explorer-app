import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { useAgents } from '../hooks/useAgents.js';
import { LoadingSpinner } from './LoadingSpinner.jsx';
import { ErrorState } from './ErrorState.jsx';


// ─── Icons ───────────────────────────────────────────────────────────────────
const IconFilter = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);
const IconArrow = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);
const IconChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);
const IconChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
    <path d="M9 18l6-6-6-6" />
  </svg>
);
const IconShield = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconWarning = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="3">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const IconExternalLink = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
    <path d="M7 17l9.2-9.2M17 17V7H7" />
  </svg>
);
const IconSearch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);


// Helper: format volume number to compact string
function fmtVol(usdStr) {
  const n = parseFloat(usdStr || '0');
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${Math.round(n)}`;
}

// Helper: normalize hook agent to card-compatible shape
function normalizeAgent(a) {
  const badgeLabels = (a.badges || []).map(b =>
    b === 'TOP_RATED' ? 'TOP RATED' : b
  );
  const redFlagLabel = (a.redFlags || [])[0]?.flag?.replace(/_/g, ' ') || '';
  return {
    id: Number(a.agentId) || a.agentId,
    uid: a.uid ?? Number(a.agentId) ?? a.agentId,
    network: a.network ?? 'base_sepolia',
    name: a.name || `Agent #${a.agentId}`,
    wallet: a.wallet
      ? `${a.wallet.slice(0, 6)}...${a.wallet.slice(-4)}`
      : '0x????...????',
    categories: (a.categories || []).map(c => c.toUpperCase()),
    score: a.trustScore ?? 0,
    jobs: a.totalJobs ?? 0,
    success: `${Math.round((a.successRate ?? 0) * 100)}%`,
    vol: fmtVol(a.totalVolume),
    responseTime: 'N/A',
    badges: badgeLabels,
    warningDetail: redFlagLabel,
    newDetail: null,
  };
}


// ─── Score Badge ───────────────────────────────────────────────────────────────
function ScoreBadge({ score }) {
  let bg = 'bg-white';
  let textColor = 'text-black';
  if (score >= 80) { bg = 'bg-yellow-brand'; }
  if (score < 40) { bg = 'bg-red-alert'; textColor = 'text-white'; }
  return (
    <div className={`border-4 border-black ${bg} ${textColor} min-w-[3.5rem] h-[3.5rem] flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0`}>
      <span className="font-mono font-black text-2xl">{score}</span>
    </div>
  );
}

// ─── Badge Pills ───────────────────────────────────────────────────────────────
function Badge({ type, detail }) {
  const map = {
    'VERIFIED':   <span className="font-mono text-[10px] uppercase tracking-wider bg-black text-white px-2 py-1 flex items-center gap-1">✓ VERIFIED</span>,
    'TOP RATED':  <span className="font-mono text-[10px] uppercase tracking-wider border border-black bg-white px-2 py-1 font-bold flex items-center gap-1">⭐ TOP RATED</span>,
    'HOT':        <span className="font-mono text-[10px] uppercase tracking-wider border border-black bg-yellow-brand px-2 py-1 font-bold flex items-center gap-1">🔥 HOT</span>,
    'NEW':        <span className="font-mono text-[10px] uppercase tracking-wider border border-black bg-green-200 px-2 py-1 flex items-center gap-1">🆕 NEW {detail && `(${detail})`}</span>,
    'WARNING':    <span className="font-mono text-[10px] uppercase tracking-wider border border-black bg-red-alert text-white px-2 py-1 font-bold flex items-center gap-1"><IconWarning /> WARNING: {detail}</span>,
    'MAINNET':    <span className="font-mono text-[10px] uppercase tracking-wider border-2 border-black bg-blue-100 text-blue-900 px-2 py-1 font-bold flex items-center gap-1">◆ MAINNET</span>,
    'ACP':        <span className="font-mono text-[10px] uppercase tracking-wider border-2 border-black bg-purple-100 text-purple-900 px-2 py-1 font-bold flex items-center gap-1">⚡ ACP</span>,
  };
  return map[type] || null;
}

// ─── Agent Card ────────────────────────────────────────────────────────────────
function AgentCard({ agent }) {
  const isWarning = agent.badges.includes('WARNING');
  const isHighScore = agent.score >= 80;

  return (
    <article className={`border-4 border-black flex flex-col relative group hover:-translate-y-2 transition-all duration-200
      ${isWarning
        ? 'bg-red-50 hover:shadow-[8px_8px_0px_0px_rgba(255,51,51,1)]'
        : 'bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'
      }`}>
      <div className="p-5 flex-1 flex flex-col gap-3">
        {/* Header */}
        <div className="flex justify-between items-start gap-2 border-b-2 border-black pb-3">
          <div className="min-w-0">
            <h3 className="font-mono font-black text-lg uppercase leading-none mb-2 cursor-pointer hover:underline truncate" title={agent.name}>
              {agent.name}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold bg-gray-200 border border-black px-1.5 py-0.5">{agent.wallet}</span>
              <div className="flex gap-1.5 flex-wrap">
                {agent.categories.map(c => (
                  <span key={c} className="text-[11px] font-mono uppercase font-bold tracking-tight">
                    [{c}]
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="text-right flex flex-col items-end shrink-0 ml-2">
            <span className="text-[9px] font-mono uppercase font-bold mb-1">TRUSTSCORE</span>
            <ScoreBadge score={agent.score} />
          </div>
        </div>

        {/* Stats Row */}
        <div className="py-2">
          <p className="font-mono text-[12px] font-bold uppercase leading-relaxed">
            {agent.jobs} jobs <span className="text-gray-400 mx-1">•</span> {agent.success} success <span className="text-gray-400 mx-1">•</span> {agent.vol} vol <span className="text-gray-400 mx-1">•</span> {agent.responseTime} avg
          </p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
          {agent.badges.map(b => (
            <Badge key={b} type={b} detail={b === 'WARNING' ? agent.warningDetail : b === 'NEW' ? agent.newDetail : null} />
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border-t-4 border-black flex flex-col md:flex-row">
        <button className={`w-full md:flex-1 py-4 md:py-3 font-mono text-base md:text-sm font-bold uppercase transition-colors md:border-r-2 border-b-2 md:border-b-0 border-black min-h-[48px]
          ${isWarning
            ? 'bg-red-alert text-white hover:bg-black'
            : 'bg-white hover:bg-yellow-brand'
          }`}>
          [VIEW REPORT]
        </button>
        {!isWarning && (
          <button className="w-full md:flex-1 py-4 md:py-3 font-mono text-base md:text-sm font-bold uppercase transition-colors bg-yellow-brand md:border-l-2 border-black hover:bg-black hover:text-white min-h-[48px]">
            [HIRE]
          </button>
        )}
      </div>
    </article>
  );
}

// ─── Filter Sidebar ────────────────────────────────────────────────────────────
const DEFAULT_FILTERS = { trust80: true, trust60: true, trust40: false, trustLow: false };

function FilterSidebar({ filters, setFilters }) {
  const trustLevels = [
    { label: '80+', key: 'trust80' },
    { label: '60-79', key: 'trust60' },
    { label: '40-59', key: 'trust40' },
    { label: '<40', key: 'trustLow' },
  ];
  const categories = ['DeFi', 'Content', 'Trading', 'Code'];

  const toggle = (key) => setFilters(f => ({ ...f, [key]: !f[key] }));

  return (
    <aside className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b-4 border-black bg-yellow-brand hidden lg:block">
        <h2 className="font-mono font-bold uppercase text-base flex items-center gap-2">
          <IconFilter />
          FILTERS
        </h2>
      </div>

      <div className="p-5 flex flex-col gap-7 overflow-y-auto">
        {/* Trust Level */}
        <div>
          <h3 className="font-mono font-bold uppercase border-b-2 border-black pb-1 mb-3 text-sm">
            TRUST LEVEL
          </h3>
          <div className="flex flex-col gap-2.5">
            {trustLevels.map(({ label, key }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer group min-h-[48px] lg:min-h-0">
                <input
                  type="checkbox"
                  checked={!!filters[key]}
                  onChange={() => toggle(key)}
                  className="filter-checkbox w-6 h-6 lg:w-4 lg:h-4 text-yellow focus:ring-black border-2 border-black"
                />
                <span className="font-mono text-base lg:text-xs uppercase group-hover:bg-yellow-brand transition-colors px-1">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <h3 className="font-mono font-bold uppercase border-b-2 border-black pb-1 mb-3 text-sm">CATEGORY</h3>
          <div className="flex flex-col gap-2.5">
            {categories.map(cat => (
              <label key={cat} className="flex items-center gap-2 cursor-pointer group min-h-[48px] lg:min-h-0">
                <input
                  type="checkbox"
                  checked={!!filters[`cat_${cat}`]}
                  onChange={() => toggle(`cat_${cat}`)}
                  className="filter-checkbox w-6 h-6 lg:w-4 lg:h-4 focus:ring-black border-2 border-black"
                />
                <span className="font-mono text-base lg:text-xs uppercase group-hover:bg-yellow-brand transition-colors px-1">{cat}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Status */}
        <div>
          <h3 className="font-mono font-bold uppercase border-b-2 border-black pb-1 mb-3 text-sm">STATUS</h3>
          <div className="flex flex-col gap-2.5">
            <label className="flex items-center gap-2 cursor-pointer group min-h-[48px] lg:min-h-0">
              <input type="checkbox" defaultChecked className="filter-checkbox w-6 h-6 lg:w-4 lg:h-4 focus:ring-black border-2 border-black" />
              <span className="font-mono text-base lg:text-xs uppercase group-hover:bg-yellow-brand transition-colors px-1">Verified only</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group min-h-[48px] lg:min-h-0">
              <input type="checkbox" className="filter-checkbox w-6 h-6 lg:w-4 lg:h-4 focus:ring-black border-2 border-black" />
              <span className="font-mono text-base lg:text-xs uppercase group-hover:bg-yellow-brand transition-colors px-1">Show warnings</span>
            </label>
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h3 className="font-mono font-bold uppercase border-b-2 border-black pb-1 mb-3 text-sm">PRICE RANGE</h3>
          <div className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <span className="absolute left-2 top-1.5 font-mono text-[10px] text-gray-500">MIN</span>
              <input
                type="number"
                placeholder="0"
                className="w-full border-2 border-black p-2 pt-5 font-mono font-bold text-center text-sm bg-cream focus:bg-white focus:outline-none focus:border-yellow-brand min-h-[48px] lg:min-h-0"
              />
            </div>
            <span className="font-mono font-bold text-sm">-</span>
            <div className="flex-1 relative">
              <span className="absolute left-2 top-1.5 font-mono text-[10px] text-gray-500">MAX</span>
              <input
                type="number"
                placeholder="∞"
                className="w-full border-2 border-black p-2 pt-5 font-mono font-bold text-center text-sm bg-cream focus:bg-white focus:outline-none focus:border-yellow-brand min-h-[48px] lg:min-h-0"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-4 pt-4 lg:pt-2 pb-4">
          <button className="w-full border-4 border-black bg-black text-white px-4 py-4 lg:py-2.5 font-mono text-base lg:text-xs uppercase font-bold hover:bg-yellow-brand hover:text-black transition-colors min-h-[56px] lg:min-h-0">
            APPLY FILTERS
          </button>
          <button
            onClick={() => setFilters(DEFAULT_FILTERS)}
            className="w-full border-4 border-black bg-white px-4 py-4 lg:py-2 font-mono text-base lg:text-xs uppercase font-bold hover:bg-gray-100 transition-colors min-h-[56px] lg:min-h-0"
          >
            RESET
          </button>
        </div>
      </div>
    </aside>
  );
}

// ─── Pagination ────────────────────────────────────────────────────────────────
function Pagination({ current, total, onChange }) {
  return (
    <div className="mt-10 flex flex-col sm:flex-row justify-between items-center border-t-4 border-black pt-6 gap-4">
      <p className="font-mono text-sm">
        SHOWING <span className="bg-yellow-brand px-1 font-bold border border-black">1-12</span> OF{' '}
        <span className="font-bold">142</span> RESULTS
      </p>
      <div className="flex gap-1.5">
        <button
          onClick={() => onChange(Math.max(1, current - 1))}
          disabled={current === 1}
          className="w-10 h-10 border-2 border-black flex items-center justify-center bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-brand transition-colors"
        >
          <IconChevronLeft />
        </button>
        {[1, 2, 3].map(p => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`w-10 h-10 border-2 border-black font-mono font-bold transition-colors ${
              current === p ? 'bg-black text-white' : 'bg-white hover:bg-yellow-brand'
            }`}
          >
            {p}
          </button>
        ))}
        <span className="w-10 h-10 flex items-center justify-center font-mono font-bold">...</span>
        <button
          onClick={() => onChange(12)}
          className={`w-10 h-10 border-2 border-black font-mono font-bold transition-colors ${
            current === 12 ? 'bg-black text-white' : 'bg-white hover:bg-yellow-brand'
          }`}
        >12</button>
        <button
          onClick={() => onChange(Math.min(12, current + 1))}
          className="w-10 h-10 border-2 border-black flex items-center justify-center bg-white hover:bg-yellow-brand shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
        >
          <IconChevronRight />
        </button>
      </div>
    </div>
  );
}

// removed SearchNavbar in favor of Navbar
// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function SearchResultsPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [inputVal, setInputVal] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('HIGHEST SCORE');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // Map sort label → hook sort key
  const sortKey = sort === 'MOST JOBS' ? 'jobs' : sort === 'SUCCESS RATE' ? 'score' : 'score';

  // Selected categories (lowercase for comparison)
  const selectedCats = Object.entries(filters)
    .filter(([k, v]) => k.startsWith('cat_') && v)
    .map(([k]) => k.replace('cat_', '').toLowerCase());

  // Active trust score ranges
  const activeTrustRanges = [
    filters.trust80 && [80, 100],
    filters.trust60 && [60, 79],
    filters.trust40 && [40, 59],
    filters.trustLow && [0, 39],
  ].filter(Boolean);

  const { data, isLoading, error, refetch } = useAgents({
    query,
    sort: sortKey,
    page,
    limit: 12,
  });

  const allAgents = (data?.agents || []).map(normalizeAgent);

  // Client-side filter by category + trust level
  const agents = allAgents.filter(a => {
    const catOk = selectedCats.length === 0 ||
      a.categories.some(c => selectedCats.includes(c.toLowerCase()));
    const trustOk = activeTrustRanges.length === 0 ||
      activeTrustRanges.some(([min, max]) => a.score >= min && a.score <= max);
    return catOk && trustOk;
  });

  const total = data?.total || 0;

  return (
    <div className="bg-cream text-black font-mono min-h-screen flex flex-col antialiased selection:bg-yellow-brand selection:text-black pt-20">
      <Navbar />

      {/* Search Bar */}
      <div className="border-b-4 border-black bg-white p-4 md:px-6 md:py-4">
        <div className="flex flex-col md:flex-row gap-2 md:gap-0 max-w-none">
          <div className="flex-1 flex items-center border-4 border-black md:border-r-0 bg-cream min-h-[48px] md:min-h-0 p-2 md:p-0">
            <span className="px-2 md:px-4 text-gray-400">
              <IconSearch />
            </span>
            <input
              type="text"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setQuery(inputVal)}
              placeholder="Search agents..."
              className="flex-1 py-3 pr-4 bg-transparent font-mono text-base md:text-sm focus:outline-none placeholder-gray-400 w-full"
            />
          </div>
          <button
            onClick={() => setQuery(inputVal)}
            className="border-4 border-black bg-yellow-brand px-8 py-3 md:py-3 w-full md:w-auto font-mono font-bold text-base md:text-sm uppercase shadow-brutal-sm md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all min-h-[48px] md:min-h-0"
          >
            [SCAN]
          </button>
        </div>
        {/* Quick tags */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {['yield optimizer', 'MEV bot', 'security audit', 'content gen', 'oracle'].map(tag => (
            <button
              key={tag}
              onClick={() => setQuery(tag)}
              className={`font-mono text-xs uppercase px-2 py-1 border border-black transition-colors ${
                query === tag ? 'bg-black text-white' : 'bg-cream hover:bg-yellow-brand'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Body: Sidebar + Main */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden w-full border-b-4 border-black bg-white p-4">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-full border-4 border-black bg-yellow-brand font-mono font-bold uppercase py-3 min-h-[48px] flex justify-between items-center px-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 active:translate-x-1 transition-all"
          >
            <span>[FILTERS]</span>
            <span>{isFilterOpen ? '▲' : '▼'}</span>
          </button>
        </div>

        <div className={`${isFilterOpen ? 'block' : 'hidden'} lg:block lg:w-52 lg:border-r-4 border-b-4 lg:border-b-0 border-black bg-white flex flex-col shrink-0 lg:overflow-y-auto w-full`}>
          <FilterSidebar filters={filters} setFilters={setFilters} />
        </div>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8 flex flex-col bg-cream">
          {/* Results Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b-4 border-black pb-4 mb-6">
            <div>
              <h1 className="font-mono font-black text-2xl uppercase tracking-tight mb-1">
                {query ? `SEARCH: "${query}"` : 'ALL AGENTS'}
              </h1>
              <p className="font-mono text-sm">
                SHOWING <span className="bg-yellow-brand px-1 font-bold border border-black">{agents.length}</span> OF <span className="font-bold">{total}</span> RESULTS
                {' '}<span className="text-gray-500 text-xs">(BASE SEPOLIA — LIVE DATA)</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold uppercase hidden sm:block">SORT:</span>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="border-2 border-black bg-white font-mono text-sm uppercase p-2 focus:outline-none cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                <option>HIGHEST SCORE</option>
                <option>MOST JOBS</option>
                <option>SUCCESS RATE</option>
                <option>NEWEST</option>
              </select>
            </div>
          </div>

          {/* Agent Grid */}
          {isLoading ? (
            <LoadingSpinner message="Scanning agents..." />
          ) : error ? (
            <ErrorState error={error} onRetry={refetch} />
          ) : (
          <div className="flex flex-col lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
            {agents.map(agent => (
              <div key={agent.id ?? agent.uid} onClick={() => navigate(`/agent/${agent.uid ?? agent.id}`)} className="cursor-pointer">
                <AgentCard agent={agent} />
              </div>
            ))}
          </div>
          )}

          {/* Pagination */}
          <Pagination current={page} total={12} onChange={setPage} />

          {/* Footer note */}
          <div className="mt-auto pt-12 text-center">
            <p className="font-mono text-xs text-gray-500 uppercase">
              8183EXPLORER_ INDEX V2.1 // DATABASE SYNCED: 2 MINS AGO // NO FINANCIAL ADVICE
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
