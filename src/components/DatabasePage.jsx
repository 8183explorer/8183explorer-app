import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronDown, LayoutGrid, List, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAgents } from '../hooks/useAgents.js';
import { apiFetch } from '../lib/api.js';
import { LoadingSpinner } from './LoadingSpinner.jsx';
import { ErrorState } from './ErrorState.jsx';



function fmtVol(str) {
  const n = parseFloat(str || '0');
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${Math.round(n)}`;
}

export default function DatabasePage() {
  const navigate = useNavigate();
  const [view, setView] = useState('table');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('score');
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  const { data, isLoading, error, refetch } = useAgents({ query, sort, page, limit: LIMIT });
  const { data: breakdown } = useQuery({
    queryKey: ['stats-breakdown'],
    queryFn: () => apiFetch('/api/stats/breakdown'),
    staleTime: 5 * 60 * 1000,
  });
  const { data: statsData } = useQuery({
    queryKey: ['stats'],
    queryFn: () => apiFetch('/api/stats'),
    staleTime: 60 * 1000,
  });

  const agents = (data?.agents || []).map((a, i) => ({
    rank: (page - 1) * LIMIT + i + 1,
    uid: a.uid,
    agentId: Number(a.agentId),
    name: a.name || `Agent #${a.agentId}`,
    wallet: a.wallet ? `${a.wallet.slice(0, 6)}...${a.wallet.slice(-4)}` : '0x???...???',
    category: (a.categories || ['Unknown']).join('/'),
    score: a.trustScore ?? 0,
    jobs: a.totalJobs ?? 0,
    success: `${Math.round((a.successRate ?? 0) * 100)}%`,
    volume: fmtVol(a.totalVolume),
    lastActive: 'On-chain',
    status: (a.badges || []).includes('WARNING')
      ? '⚠️ WARNING'
      : (a.badges || []).includes('VERIFIED')
      ? '✓ VERIFIED'
      : (a.badges || []).includes('TOP_RATED')
      ? '✓ TOP RATED'
      : 'ACTIVE',
  }));

  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));


  return (
    <div className="min-h-screen font-sans antialiased text-black bg-[#E8E4E0] selection:bg-yellow selection:text-black">
      <Navbar />
      
      <main className="pt-28 pb-20 px-4 sm:px-8 max-w-[1600px] mx-auto">
        <header className="mb-8 border-4 border-black bg-white p-6 sm:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNlNWU1ZTUiLz48L3N2Zz4=')]">
          <h1 className="font-mono text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4 break-words">
            AGENT DATABASE
          </h1>
          <div className="font-mono text-sm md:text-base font-bold uppercase bg-[#FFD600] border-2 border-black inline-block px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <span className="animate-pulse inline-block mr-2 text-red-600">●</span>
            [LIVE] {statsData?.totalAgents ?? '...'} agents indexed • {statsData?.totalJobs ?? '...'} jobs tracked
          </div>
        </header>

        {/* STATS OVERVIEW GRIDS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Network Stats */}
          <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all">
            <h3 className="font-mono text-lg font-black uppercase mb-4 border-b-4 border-black pb-2 flex justify-between items-center">
              <span>Network Stats</span><span className="text-gray-400 text-sm">LIVE</span>
            </h3>
            <ul className="font-mono text-sm space-y-4 font-bold">
              <li className="flex justify-between items-center">
                <span className="text-gray-500">AGENTS INDEXED</span>
                <span>{statsData?.totalAgents ?? '—'}</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-gray-500">JOBS TRACKED</span>
                <span>{statsData?.totalJobs ?? '—'}</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-gray-500">FEEDBACK</span>
                <span>{statsData?.totalFeedback ?? '—'}</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-gray-500">VOL. AUDITED</span>
                <span>${statsData?.totalVolumeUsd?.toLocaleString() ?? '—'}</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-gray-500">ETH PRICE</span>
                <span>${statsData?.ethPriceUsd?.toLocaleString() ?? '—'}</span>
              </li>
            </ul>
          </div>

          {/* Category Breakdown */}
          <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all">
            <h3 className="font-mono text-lg font-black uppercase mb-4 border-b-4 border-black pb-2 flex justify-between items-center">
              <span>Category</span><span className="text-gray-400 text-sm">TOP 6</span>
            </h3>
            <div className="space-y-3 font-mono text-sm font-bold">
              {(breakdown?.categoryBreakdown ?? []).map(c => (
                <div key={c.name} className="flex items-center gap-3">
                  <div className="w-1/3 truncate">{c.name}</div>
                  <div className="flex-1 bg-gray-200 h-2">
                    <div className="bg-black h-full" style={{width: `${c.pct}%`}}></div>
                  </div>
                  <div className="w-12 text-right">{c.count}</div>
                </div>
              ))}
              {!breakdown && <div className="text-gray-400 text-xs">Loading...</div>}
            </div>
          </div>

          {/* Chain Breakdown */}
          <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all">
            <h3 className="font-mono text-lg font-black uppercase mb-4 border-b-4 border-black pb-2 flex justify-between items-center">
              <span>Chains</span><span className="text-gray-400 text-sm">NETWORK</span>
            </h3>
            <ul className="font-mono text-sm space-y-4 font-bold">
              {(breakdown?.networkBreakdown ?? []).map(n => (
                <li key={n.network} className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full border border-black ${n.network === 'base_mainnet' ? 'bg-blue-500' : 'bg-yellow-400'}`}></div>
                    {n.network === 'base_mainnet' ? 'Base Mainnet' : 'Base Sepolia'}
                  </span>
                  <span className="text-right">{n.count} <span className="text-gray-500 font-normal ml-1">{n.pct}%</span></span>
                </li>
              ))}
              {!breakdown && <li className="text-gray-400 text-xs">Loading...</li>}
            </ul>
          </div>
        </div>

        {/* CONTROLS ROW */}
        <div className="flex flex-col xl:flex-row gap-4 mb-6">
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-black" strokeWidth={3} />
              <input 
              type="text" 
              value={query}
              onChange={e => { setQuery(e.target.value); setPage(1); }}
              placeholder="SEARCH_AGENTS(NAME, CATEGORY)..." 
              className="w-full pl-12 pr-4 py-4 border-4 border-black bg-white font-mono text-sm font-bold uppercase placeholder:text-gray-500 focus:outline-none focus:bg-[#FFD600]/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            />
            </div>
            {/* hidden on small screens for brevity, or kept as icon */}
            <button className="hidden sm:flex bg-black text-white font-mono font-bold px-6 py-4 border-4 border-black hover:bg-[#FFD600] hover:text-black transition-colors uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none items-center gap-2">
              <Filter className="w-5 h-5" />
              <span>Filter</span>
            </button>
          </div>
          
          <div className="flex gap-4">
            <div className="relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex-1 xl:flex-none">
              <select 
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="appearance-none bg-white border-4 border-black font-mono font-bold text-sm pl-4 pr-12 py-4 rounded-none focus:outline-none focus:bg-[#FFD600]/20 uppercase cursor-pointer h-full w-full">
                <option value="score">Sort: Score ▼</option>
                <option value="volume">Sort: Volume ▼</option>
                <option value="jobs">Sort: Jobs ▼</option>
                <option value="recent">Sort: Recent ▼</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" strokeWidth={3} />
            </div>
            
            <div className="flex border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white h-full shrink-0">
              <button 
                onClick={() => setView('grid')}
                className={`px-4 py-3 border-r-4 border-black transition-colors ${view === 'grid' ? 'bg-black text-white' : 'bg-white hover:bg-[#F5F2EB]'}`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setView('table')}
                className={`px-4 py-3 transition-colors ${view === 'table' ? 'bg-black text-white' : 'bg-white hover:bg-[#F5F2EB]'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* TABLE VIEW */}
        <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-x-auto mb-8">
          <table className="w-full text-left border-collapse min-w-[1024px]">
            <thead>
              <tr className="bg-black text-white font-mono text-sm uppercase">
                <th className="p-4 border-r-2 border-[#333] cursor-pointer hover:text-[#FFD600] whitespace-nowrap">RANK</th>
                <th className="p-4 border-r-2 border-[#333] cursor-pointer hover:text-[#FFD600] whitespace-nowrap w-1/5">AGENT</th>
                <th className="p-4 border-r-2 border-[#333] cursor-pointer hover:text-[#FFD600] whitespace-nowrap">WALLET</th>
                <th className="p-4 border-r-2 border-[#333] cursor-pointer hover:text-[#FFD600] whitespace-nowrap">SCORE</th>
                <th className="p-4 border-r-2 border-[#333] cursor-pointer hover:text-[#FFD600] text-right whitespace-nowrap">JOBS</th>
                <th className="p-4 border-r-2 border-[#333] cursor-pointer hover:text-[#FFD600] text-right whitespace-nowrap">SUCCESS</th>
                <th className="p-4 border-r-2 border-[#333] cursor-pointer hover:text-[#FFD600] text-right whitespace-nowrap">VOLUME</th>
                <th className="p-4 border-r-2 border-[#333] cursor-pointer hover:text-[#FFD600] whitespace-nowrap">STATUS</th>
                <th className="p-4 whitespace-nowrap text-[#FFD600]">HIRE</th>
              </tr>
            </thead>
            <tbody className="font-mono text-sm font-bold">
              {isLoading ? (
                <tr><td colSpan={9}><LoadingSpinner message="Loading agents..." /></td></tr>
              ) : error ? (
                <tr><td colSpan={9}><ErrorState error={error} onRetry={refetch} /></td></tr>
              ) : agents.map((agent, i) => {
                const isEven = i % 2 !== 0;
                let scoreColor = 'text-black';
                if (agent.score >= 80) scoreColor = 'text-green-600';
                else if (agent.score >= 60) scoreColor = 'text-black';
                else if (agent.score < 40) scoreColor = 'text-red-500 text-shadow-[2px_2px_0px_#fca5a5]';
                else scoreColor = 'text-orange-600';

                let statusColor = 'text-black';
                if (agent.status.includes('WARNING') || agent.status.includes('FLAGGED')) statusColor = 'text-red-600';
                else if (agent.status.includes('VERIFIED') || agent.status.includes('TOP RATED')) statusColor = 'text-green-600';

                return (
                  <tr 
                    key={agent.name} 
                    onClick={() => navigate(`/agent/${agent.uid}`)}
                    className={`cursor-pointer border-b-2 border-black hover:bg-[#FFD600]/20 transition-colors ${
                      isEven ? 'bg-[#F9F8F6]' : 'bg-white'
                    }`}
                  >
                    <td className="p-4 border-r-2 border-dashed border-gray-300 font-black whitespace-nowrap">
                      {agent.rank}
                    </td>
                    <td className="p-4 border-r-2 border-dashed border-gray-300 font-black hover:underline hover:text-[#FFD600] whitespace-nowrap">
                      {agent.name}
                    </td>
                    <td className="p-4 border-r-2 border-dashed border-gray-300 font-normal text-gray-500 whitespace-nowrap">
                      {agent.wallet}
                    </td>
                    <td className={`p-4 border-r-2 border-dashed border-gray-300 font-black text-lg whitespace-nowrap ${scoreColor}`}>
                      {agent.score}
                    </td>
                    <td className="p-4 border-r-2 border-dashed border-gray-300 text-right whitespace-nowrap font-medium">
                      {agent.jobs}
                    </td>
                    <td className="p-4 border-r-2 border-dashed border-gray-300 text-right whitespace-nowrap font-medium">
                      {agent.success}
                    </td>
                    <td className="p-4 border-r-2 border-dashed border-gray-300 text-right whitespace-nowrap font-black">
                      {agent.volume}
                    </td>
                    <td className={`p-4 border-r-2 border-dashed border-gray-300 whitespace-nowrap font-black ${statusColor}`}>
                      {agent.status}
                    </td>
                    <td className="p-2 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                      <a
                        href="https://app.virtuals.io/acp/scan/agents"
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`Hire via Virtuals ACP · Score: ${agent.score}/100`}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 border-2 border-black font-mono text-xs font-black uppercase transition-none hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                          agent.status.includes('WARNING')
                            ? 'bg-orange-400 text-black'
                            : agent.score >= 60
                            ? 'bg-[#FFD600] text-black'
                            : 'bg-white text-black'
                        }`}
                      >
                        HIRE ↗
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {/* PAGINATION */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#F5F2EB] border-t-4 border-black p-4 font-mono font-bold uppercase text-sm">
            <div>Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total} agents</div>
            <div className="flex gap-2 items-center flex-wrap justify-center">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="border-2 border-black px-3 py-1.5 flex items-center gap-1 hover:bg-black hover:text-white transition-none disabled:opacity-50 disabled:cursor-not-allowed bg-white">
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              {(() => {
                const pages = [];
                if (totalPages <= 5) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  pages.push(1);
                  if (page > 3) pages.push('...');
                  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
                  if (page < totalPages - 2) pages.push('...');
                  pages.push(totalPages);
                }
                return pages.map((p, i) =>
                  p === '...'
                    ? <span key={`ellipsis-${i}`} className="px-2">...</span>
                    : <button key={p} onClick={() => setPage(p)}
                        className={`border-2 border-black px-3 py-1.5 ${page === p ? 'bg-black text-white' : 'bg-white hover:bg-black hover:text-white transition-none'}`}
                      >{p}</button>
                );
              })()}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="border-2 border-black bg-white px-3 py-1.5 flex items-center gap-1 hover:bg-black hover:text-white transition-none disabled:opacity-50 disabled:cursor-not-allowed">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* STATS FOOTER */}
        <div className="mt-8 mb-4 flex justify-between items-center font-mono text-sm font-bold uppercase text-gray-500 tracking-wider">
          <span>Data sourced from <a href="#" className="underline hover:text-black hover:bg-[#FFD600]">8183Explorer Indexer Node v2.1.0</a></span>
          <span>Last indexed block: #19,847,234 • Global Tracked Volume: $128.4M</span>
        </div>
      </main>
      
      <Footer onNavigate={navigate} />
    </div>
  );
}
