import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './Navbar';
import { useAgent } from '../hooks/useAgent.js';
import { LoadingSpinner } from './LoadingSpinner.jsx';
import { ErrorState } from './ErrorState.jsx';

import {
  Copy, Check, ShieldCheck, AlertTriangle, ChevronLeft,
  ChevronRight, FileText, Zap, Flag
} from 'lucide-react';

const PAGE_SIZE = 5;

function fmtUsd(str) {
  const n = parseFloat(str || '0');
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${Math.round(n)}`;
}
function truncate(addr) {
  if (!addr) return 'N/A';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
function buildStats(a) {
  const js = a?.jobStats;
  return [
    { label: 'JOBS COMPLETED', value: String(js?.completedJobs ?? 0), color: '' },
    { label: 'SUCCESS RATE',   value: `${Math.round((js?.successRate ?? 0) * 100)}%`, color: 'text-green-700' },
    { label: 'TOTAL VOLUME',   value: fmtUsd(js?.totalVolumeUsd), color: '' },
    { label: 'AVG RESPONSE',   value: 'N/A', color: '' },
  ];
}
function buildBreakdown(ts) {
  if (!ts) return [];
  return [
    { label: 'Job History',  pct: 30, filled: Math.round(ts.jobScore / 30 * 10), total: 10 },
    { label: 'Success Rate', pct: 25, filled: Math.round(ts.successScore / 25 * 10), total: 10 },
    { label: 'Volume',       pct: 20, filled: Math.round(ts.volumeScore / 20 * 10), total: 10 },
    { label: 'Age',          pct: 15, filled: Math.round(ts.ageScore / 15 * 10), total: 10 },
    { label: 'Bonus',        pct: 10, filled: Math.round(ts.bonusScore / 10 * 10), total: 10 },
  ];
}

function BarRow({ label, pct, filled, total }) {
  return (
    <div className="flex items-center gap-3 font-mono text-xs mb-3">
      <span className="w-28 text-right uppercase font-bold text-black shrink-0">{label}</span>
      <div className="flex gap-0.5 flex-1">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={`h-4 flex-1 border border-black ${i < filled ? 'bg-black' : 'bg-transparent'}`} />
        ))}
      </div>
      <span className="w-8 text-right font-black">{pct}%</span>
    </div>
  );
}

export default function AgentDetailPage() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [page, setPage] = useState(0);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);

  const { data: agentData, isLoading, error, refetch } = useAgent(agentId);

  const copyWallet = () => {
    if (agentData?.wallet) {
      navigator.clipboard.writeText(agentData.wallet).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) return <LoadingSpinner message="Loading agent data..." />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const ts = agentData?.trustScore;
  const js = agentData?.jobStats;
  const jobHistory = (js?.jobs || []).slice(0, 20).map(j => ({
    date: j.expiredAt instanceof Date ? j.expiredAt.toLocaleDateString() : 'N/A',
    client: truncate(j.client),
    type: (j.description || 'TASK').substring(0, 18).toUpperCase(),
    amount: j.budgetUsd || '$0',
    status: j.statusName === 'Completed' ? 'COMPLETE' : (j.statusName || 'UNKNOWN').toUpperCase(),
    evaluator: truncate(j.evaluator),
  }));

  const AGENT = {
    name: agentData?.name || 'UNKNOWN_AGENT',
    wallet: truncate(agentData?.wallet),
    walletFull: agentData?.wallet || '',
    categories: (agentData?.categories || ['UNKNOWN']).map(c => c.toUpperCase()),
    verified: (ts?.badges || []).includes('VERIFIED'),
    activeSince: 'On-chain',
    activeDays: ts?.daysActive ?? 0,
    trustScore: ts?.totalScore ?? 0,
    scoreBreakdown: buildBreakdown(ts),
    stats: buildStats(agentData),
    redFlags: (ts?.redFlags || []).map(f => `${f.flag.replace(/_/g,' ')}: penalty -${f.penalty}pts`),
  };
  const JOB_HISTORY = jobHistory;
  const totalPages = Math.max(1, Math.ceil(JOB_HISTORY.length / PAGE_SIZE));
  const pageRows = JOB_HISTORY.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="min-h-screen pt-20" style={{ background: '#F5F2EB', color: '#000' }}>
      <Navbar />

      {/* BREADCRUMB */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 pt-6">
        <button
          onClick={() => navigate('/database')}
          className="flex items-center gap-2 font-mono text-sm font-bold uppercase border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-none"
        >
          <ChevronLeft className="w-4 h-4" />
          ← BACK_TO_DATABASE
        </button>
      </div>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-8 py-8 flex flex-col gap-8">

        {/* AGENT HEADER */}
        <header className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-6 sm:p-10 border-b-4 border-black bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNlNWU1ZTUiLz48L3N2Zz4=')]">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {AGENT.categories.map((cat) => (
                <span key={cat} className="bg-black text-white font-mono text-xs px-3 py-1 uppercase tracking-wider font-bold">[{cat}]</span>
              ))}
              <span className="bg-[#FFD600] border-2 border-black font-mono text-xs px-3 py-1 uppercase tracking-wider font-black flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                ✓ VERIFIED AGENT
              </span>
            </div>

            <h1 className="font-mono text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tighter break-all leading-none mb-4">
              {AGENT.name}
            </h1>

            <div className="flex items-center gap-3 mt-4 flex-wrap">
              <span className="font-mono text-sm font-bold bg-[#F5F2EB] border-2 border-black px-3 py-1.5 tracking-wider">
                {AGENT.wallet}
              </span>
              <button
                onClick={copyWallet}
                className="border-2 border-black p-1.5 hover:bg-black hover:text-white transition-none"
                title="Copy wallet address"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
              <span className="font-mono text-xs text-gray-500 font-bold uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                ACTIVE SINCE {AGENT.activeSince} ({AGENT.activeDays} DAYS)
              </span>
            </div>
          </div>
        </header>

        {/* TRUST SCORE + STATS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1">
            <div className="border-4 border-black bg-[#FFD600] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 border-l-4 border-b-4 border-black transform translate-x-16 -translate-y-16 opacity-20" />
              <div className="absolute bottom-0 left-0 w-32 h-32 border-r-4 border-t-4 border-black transform -translate-x-16 translate-y-16 opacity-20" />
              <div className="p-6 relative z-10">
                <div className="font-mono text-xs font-black uppercase tracking-widest border-2 border-black px-3 py-1 mb-6 bg-white inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  Verified_TrustScore
                </div>
                <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-6">
                  <div className="font-mono text-[96px] font-black tracking-tighter leading-none text-center">{AGENT.trustScore}</div>
                  <div className="font-mono text-xs text-center text-gray-500 font-bold uppercase mt-1">/ 100 COMPOSITE SCORE</div>
                </div>
                <div className="bg-white border-2 border-black p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="font-mono text-[10px] uppercase font-black text-gray-500 tracking-wider">// SCORE_BREAKDOWN</div>
                    <button className="lg:hidden font-mono font-bold text-xs uppercase underline" onClick={() => setIsBreakdownOpen(!isBreakdownOpen)}>
                      [VIEW BREAKDOWN {isBreakdownOpen ? '▲' : '▼'}]
                    </button>
                  </div>
                  <div className={`${isBreakdownOpen ? 'block' : 'hidden'} lg:block`}>
                    {AGENT.scoreBreakdown.map((row) => <BarRow key={row.label} {...row} />)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="grid grid-cols-2 md:grid-cols-4 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              {AGENT.stats.map((s, i) => (
                <div key={s.label} className={`border-black p-6 flex flex-col gap-1 hover:bg-[#F5F2EB] transition-colors bg-white ${i < AGENT.stats.length - 1 ? 'border-r-4' : ''}`}>
                  <div className="font-mono text-[10px] uppercase font-bold text-gray-500 tracking-wider">// {s.label}</div>
                  <div className={`font-mono text-3xl font-black ${s.color}`}>{s.value}</div>
                </div>
              ))}
            </div>

            {AGENT.redFlags.length === 0 ? (
              <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-green-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-white" strokeWidth={3} />
                </div>
                <div>
                  <div className="font-mono text-xs uppercase font-bold text-gray-500 mb-1">// RED_FLAGS_REPORT</div>
                  <div className="font-mono font-black uppercase text-lg tracking-wide">⚠️ NO RED FLAGS DETECTED</div>
                  <div className="font-sans text-sm text-gray-500 mt-1">No suspicious activity or infractions found.</div>
                </div>
              </div>
            ) : (
              <div className="border-4 border-[#FF1100] bg-[#FF1100]/10 shadow-[8px_8px_0px_0px_rgba(255,17,0,1)] p-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-8 h-8 text-[#FF1100] shrink-0 mt-0.5" strokeWidth={3} />
                  <div>
                    <div className="font-mono text-lg font-black uppercase mb-2">RED FLAGS DETECTED</div>
                    <ul className="font-mono text-sm space-y-2">
                      {AGENT.redFlags.map((flag, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#FF1100] font-black">&gt;</span>
                          {flag}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* JOB HISTORY TABLE */}
        <section className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-5 border-b-4 border-black bg-[#F5F2EB] flex justify-between items-center">
            <h2 className="font-mono text-xl font-black uppercase tracking-wide">// JOB_HISTORY</h2>
            <span className="font-mono text-xs font-bold px-3 py-1.5 bg-white border-2 border-black uppercase tracking-wider">{JOB_HISTORY.length} TOTAL RECORDS</span>
          </div>

          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-black text-white font-mono text-xs uppercase tracking-wider">
                  <th className="p-4 border-r-2 border-white">DATE</th>
                  <th className="p-4 border-r-2 border-white">CLIENT</th>
                  <th className="p-4 border-r-2 border-white">JOB TYPE</th>
                  <th className="p-4 border-r-2 border-white text-right">AMOUNT</th>
                  <th className="p-4 border-r-2 border-white">STATUS</th>
                  <th className="p-4">EVALUATOR</th>
                </tr>
              </thead>
              <tbody className="font-mono text-sm">
                {pageRows.map((row, i) => (
                  <tr key={i} className={`border-b-2 border-black hover:bg-[#F5F2EB] transition-colors ${row.status === 'REJECTED' ? 'bg-red-50' : ''}`}>
                    <td className="p-4 border-r-2 border-black text-xs">{row.date}</td>
                    <td className="p-4 border-r-2 border-black text-xs font-bold hover:text-[#FFD600] cursor-pointer">{row.client}</td>
                    <td className="p-4 border-r-2 border-black font-bold">{row.type}</td>
                    <td className="p-4 border-r-2 border-black text-right font-black">{row.amount}</td>
                    <td className="p-4 border-r-2 border-black">
                      {row.status === 'COMPLETE' ? (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 border border-green-800 px-2 py-0.5 text-xs font-bold"><Check className="w-3 h-3" strokeWidth={3} />✓ COMPLETE</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 border border-red-800 px-2 py-0.5 text-xs font-bold">✗ REJECTED</span>
                      )}
                    </td>
                    <td className="p-4 text-xs text-gray-500 hover:text-black hover:bg-[#FFD600] cursor-pointer transition-none">{row.evaluator}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden flex flex-col p-4 gap-4 bg-[#F5F2EB]">
            {pageRows.map((row, i) => (
              <div key={i} className="border-4 border-black p-4 flex flex-col gap-2 bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                <div className="flex justify-between items-center pb-2 border-b-2 border-black">
                  <div className="font-mono text-xs font-bold text-gray-500">{row.date}</div>
                  <div className="font-mono text-lg font-black">{row.amount}</div>
                </div>
                <div className="font-mono font-bold mt-1 text-sm">{row.type} • {row.client.split('...')[0]}</div>
                <div className="mt-1">
                  {row.status === 'COMPLETE' ? (
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 border border-green-800 px-2 py-0.5 text-xs font-bold tracking-wider"><Check className="w-3 h-3" strokeWidth={3} />✓ COMPLETE</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 border border-red-800 px-2 py-0.5 text-xs font-bold tracking-wider">✗ REJECTED</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t-4 border-black bg-[#F5F2EB] flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="font-mono text-xs font-bold uppercase text-gray-500">
              PAGE {page + 1} / {totalPages} — SHOWING {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, JOB_HISTORY.length)} OF {JOB_HISTORY.length}
            </span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="border-2 border-black px-3 py-1.5 font-mono text-xs font-bold uppercase hover:bg-black hover:text-white transition-none disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1">
                <ChevronLeft className="w-4 h-4" /> PREV
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} className="border-2 border-black px-3 py-1.5 font-mono text-xs font-bold uppercase hover:bg-black hover:text-white transition-none disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1">
                NEXT <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ACTION BUTTONS */}
        <div className="border-t-4 border-black pt-8 flex flex-col gap-3">
          <div className="flex flex-wrap gap-4 items-center">
            <button
              onClick={() => navigate(`/agent/${agentId}/audit`)}
              className="bg-[#FFD600] border-4 border-black px-6 py-4 font-mono font-black text-sm uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all flex items-center gap-3"
            >
              <FileText className="w-5 h-5" strokeWidth={3} />
              [REQUEST FULL AUDIT]
            </button>
            <a
              href="https://app.virtuals.io/acp/scan/agents"
              target="_blank"
              rel="noopener noreferrer"
              className={`border-4 border-black px-6 py-4 font-mono font-black text-sm uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all flex items-center gap-3 ${
                AGENT.redFlags.length > 0 ? 'bg-orange-500 text-white' : 'bg-black text-white'
              }`}
            >
              <Zap className="w-5 h-5" strokeWidth={3} />
              {AGENT.redFlags.length > 0 ? '[HIRE WITH CAUTION ↗]' : '[HIRE VIA ACP ↗]'}
            </a>
            <button className="font-mono text-sm font-bold uppercase underline text-gray-500 hover:text-[#FF1100] transition-colors flex items-center gap-1 py-4">
              <Flag className="w-4 h-4" />
              REPORT AGENT
            </button>
          </div>
          <span className="font-mono text-[10px] font-bold uppercase text-gray-500">
            Powered by Virtuals ACP · Audited by 8183Explorer ({AGENT.trustScore}/100)
          </span>
        </div>

      </main>

      <footer className="mt-12 border-t-8 border-black bg-[#F5F2EB] p-12 text-center flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 flex justify-around opacity-10 pointer-events-none">
          {[...Array(4)].map((_, i) => <div key={i} className="w-[2px] h-full bg-black" />)}
        </div>
        <div className="relative z-10 bg-white border-4 border-black p-8 inline-block shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] -rotate-1">
          <h2 className="font-mono text-3xl sm:text-5xl font-black uppercase tracking-tighter mb-4">VERIFIED BY<br />8183EXPLORER_ TEAM</h2>
          <div className="flex justify-center items-center gap-4 font-mono text-sm font-bold border-t-4 border-black pt-4">
            <span>CHECKSUM: 0x98AF...21BB</span>
            <span className="hidden sm:inline">|</span>
            <span>SYNC_TIME: 14:05:12 UTC</span>
          </div>
          <div className="mt-6 h-10 w-full flex justify-center gap-1 opacity-80">
            {[1,3,1,4,2,1,3,1,5,2,1,3,1,2,4,1].map((w, i) => (
              <div key={i} style={{ width: `${w * 4}px` }} className="h-full bg-black" />
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
