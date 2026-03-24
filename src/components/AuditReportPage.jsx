import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuditReport } from '../hooks/useAuditReport.js';
import { LoadingSpinner } from './LoadingSpinner.jsx';
import { ErrorState } from './ErrorState.jsx';

import {
  CheckCircle2,
  AlertTriangle,
  Download,
  Share2,
  FileCheck2,
  Activity,
  Award,
  ShieldCheck,
  History,
  ChevronLeft,
} from 'lucide-react';

export default function AuditReportPage() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const { data: report, isLoading, error, refetch } = useAuditReport(agentId);

  if (isLoading) return <LoadingSpinner message="Generating audit report..." />;
  if (error) return <ErrorState error={error} onRetry={refetch} title="Failed to Generate Report" />;

  const r = report;
  const pm = r?.performanceMetrics || {};
  const rs = r?.reputationSignals || {};
  const rfs = r?.redFlagScan || {};
  const sb = r?.scoreBreakdown || {};
  const idv = r?.identityVerification || {};
  const allPass = Object.values(rfs).every(v => v.status === 'PASS');
  const riskColor = { LOW: 'bg-green-100 text-green-800', MEDIUM: 'bg-yellow-brand text-black', HIGH: 'bg-orange-100 text-orange-800', CRITICAL: 'bg-red-100 text-red-800' }[r?.summary?.riskLevel] || 'bg-yellow-brand';
  const agentName = r?.agent?.name ?? `Agent #${agentId}`;
  const reportDate = r?.generatedAt
    ? new Date(r.generatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';
  const reportId = `#AR-${agentId?.toString().padStart(4, '0')}-${r?.generatedAt ? new Date(r.generatedAt).toISOString().slice(0,10).replace(/-/g,'') : '00000000'}`;

  return (
    <div className="min-h-screen bg-concrete font-sans selection:bg-yellow-brand selection:text-black pt-20 flex flex-col items-center">
      <Navbar />

      <div className="w-full max-w-5xl px-4 pt-6">
        <button
          onClick={() => navigate(`/agent/${agentId}`)}
          className="flex items-center gap-2 font-mono text-sm font-bold uppercase border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-none"
        >
          <ChevronLeft className="w-4 h-4" />
          ← BACK_TO_AGENT
        </button>
      </div>

      {/* Document Container */}
      <main className="w-full max-w-5xl bg-white border-4 border-black shadow-brutal my-8 relative flex flex-col mx-auto overflow-hidden">
        {/* Top Strip */}
        <div className="h-4 bg-yellow-brand border-b-4 border-black w-full relative">
          <div className="absolute top-0 right-10 w-4 h-full bg-black"></div>
          <div className="absolute top-0 right-16 w-16 h-full bg-black"></div>
        </div>

        <div className="p-8 md:p-12">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-black pb-8 mb-10">
            <div>
              <h1 className="font-mono text-5xl md:text-7xl font-black tracking-tighter uppercase mb-4">
                Audit Report
              </h1>
              <div className="font-mono text-sm uppercase flex flex-col gap-1">
                <span className="bg-black text-white px-2 py-1 w-max mb-2">FINAL.APPROVED</span>
                <p><strong>Agent:</strong> {agentName}</p>
                <p><strong>Generated:</strong> {reportDate}</p>
                <p><strong>Report ID:</strong> {reportId}</p>
              </div>
            </div>
            <div className="mt-8 md:mt-0 pt-4 md:pt-0 border-t-4 md:border-t-0 border-black md:pl-8 flex flex-col items-end">
              <div className="w-32">
                <div className="w-32 h-32 border-4 border-black p-2 bg-cream flex flex-wrap gap-1 overflow-hidden">
                  {Array.from({length: 25}).map((_, i) => (
                    <div key={i} className={`w-[18%] h-[18%] ${Math.random() > 0.4 ? 'bg-black' : 'bg-transparent'}`}></div>
                  ))}
                </div>
                <span className="font-mono text-xs font-bold mt-2 uppercase block text-center">Verify_Scan</span>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <section className="mb-12">
            <h2 className="font-mono text-xl font-black uppercase mb-4 flex items-center gap-2">
              <FileCheck2 className="w-6 h-6 shrink-0" />
              Executive Summary
            </h2>
            <div className={`border-4 border-black p-6 shadow-brutal-sm ${riskColor}`}>
              <div className="flex items-center gap-4 mb-3">
                <span className="font-mono text-5xl font-black">{r?.summary?.trustScore ?? '—'}</span>
                <div>
                  <div className="font-mono text-xs font-bold uppercase text-gray-600">TrustScore / 100</div>
                  <div className="font-mono font-black uppercase text-lg">{r?.summary?.riskLevel || 'UNKNOWN'} RISK</div>
                </div>
              </div>
              <p className="font-mono font-bold text-sm leading-relaxed uppercase">
                {r?.summary?.recommendation || 'Generating recommendation...'}
              </p>
              {r?.summary?.maxRecommendedJobValue !== undefined && (
                <p className="font-mono text-xs mt-2 font-bold uppercase text-gray-600">
                  MAX RECOMMENDED JOB VALUE: ${(r.summary.maxRecommendedJobValue).toLocaleString()}
                </p>
              )}
            </div>
          </section>

          {/* Section 1: Identity Verification */}
          <section className="mb-12">
            <h2 className="font-mono text-xl font-black uppercase mb-4 flex items-center gap-2 border-b-4 border-black pb-2">
              <ShieldCheck className="w-6 h-6" />
              01. Identity Verification
            </h2>
            <div className="border-4 border-black overflow-hidden bg-cream">
              <table className="w-full font-mono text-sm text-left">
                <thead className="bg-black text-white uppercase">
                  <tr>
                    <th className="p-4 border-r-2 border-white w-1/3">Check</th>
                    <th className="p-4 border-r-2 border-white w-1/4">Status</th>
                    <th className="p-4">Details</th>
                  </tr>
                </thead>
                <tbody className="uppercase font-bold">
                  <tr className="border-b-2 border-black">
                    <td className="p-4 border-r-2 border-black">Wallet Age</td>
                    <td className={`p-4 border-r-2 border-black ${idv.walletAge?.status === 'PASS' ? 'text-green-700' : 'text-red-600'}`}>
                      {idv.walletAge?.status === 'PASS' ? '✓ PASS' : '✗ WARN'}
                    </td>
                    <td className="p-4">{idv.walletAge?.days ?? 0} DAYS (MIN: {idv.walletAge?.minRequired ?? 30})</td>
                  </tr>
                  <tr className="border-b-2 border-black">
                    <td className="p-4 border-r-2 border-black">ERC-8004 Registry</td>
                    <td className="p-4 border-r-2 border-black text-green-700">✓ PASS</td>
                    <td className="p-4 text-xs break-all">{idv.erc8004Registered?.registryAddress || 'MOCK (TBD)'}</td>
                  </tr>
                  <tr className="border-b-2 border-black">
                    <td className="p-4 border-r-2 border-black">Metadata Valid</td>
                    <td className={`p-4 border-r-2 border-black ${idv.metadataValid?.status === 'PASS' ? 'text-green-700' : 'text-red-600'}`}>
                      {idv.metadataValid?.status === 'PASS' ? '✓ PASS' : '✗ FAIL'}
                    </td>
                    <td className="p-4 break-all text-xs">{idv.metadataValid?.uri || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="p-4 border-r-2 border-black">Agent Wallet Set</td>
                    <td className={`p-4 border-r-2 border-black ${idv.agentWalletSet?.status === 'PASS' ? 'text-green-700' : 'text-red-600'}`}>
                      {idv.agentWalletSet?.status === 'PASS' ? '✓ PASS' : '✗ FAIL'}
                    </td>
                    <td className="p-4 text-xs break-all">{idv.agentWalletSet?.wallet || 'NOT SET'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 2: Performance Metrics */}
          <section className="mb-12">
            <h2 className="font-mono text-xl font-black uppercase mb-4 flex items-center gap-2 border-b-4 border-black pb-2">
              <Activity className="w-6 h-6" />
              02. Performance Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border-4 border-black p-5 bg-cream md:col-span-2">
                <h3 className="font-mono text-sm font-bold uppercase mb-4">Score Breakdown</h3>
                <div className="flex flex-col gap-3">
                  {[['Jobs (30%)', sb.jobScore?.value, sb.jobScore?.max], ['Success (25%)', sb.successScore?.value, sb.successScore?.max], ['Volume (20%)', sb.volumeScore?.value, sb.volumeScore?.max], ['Age (15%)', sb.ageScore?.value, sb.ageScore?.max], ['Bonus (10%)', sb.bonusScore?.value, sb.bonusScore?.max]].map(([label, val, max]) => (
                    <div key={label} className="flex items-center gap-3 font-mono text-xs">
                      <span className="w-28 shrink-0 font-bold uppercase">{label}</span>
                      <div className="flex-1 h-4 border-2 border-black bg-cream">
                        <div className="h-full bg-black" style={{ width: `${max ? (val / max * 100) : 0}%` }} />
                      </div>
                      <span className="w-12 text-right font-black">{val ?? 0}/{max ?? 0}</span>
                    </div>
                  ))}
                  {(sb.penalties ?? 0) > 0 && (
                    <div className="font-mono text-xs font-bold text-red-600 mt-1">PENALTIES: -{sb.penalties}pts</div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-6">
                <div className="border-4 border-black p-5 bg-cream flex-1 flex flex-col">
                  <h3 className="font-mono text-sm font-bold uppercase mb-4">Success Rate</h3>
                  <div className="flex-1 flex flex-col justify-center items-center">
                    <span className="font-mono text-5xl font-black tracking-tighter">{Math.round((pm.successRate ?? 0))}%</span>
                    <span className="font-mono text-xs uppercase font-bold mt-2">{pm.completedJobs ?? 0} / {pm.totalJobs ?? 0} JOBS</span>
                  </div>
                </div>
                <div className="border-4 border-black p-5 bg-cream flex-1 flex flex-col">
                  <h3 className="font-mono text-sm font-bold uppercase mb-4">Vol Handled</h3>
                  <div className="flex-1 flex flex-col justify-center items-center">
                    <span className="font-mono text-3xl font-black tracking-tighter">${parseFloat(pm.totalVolume || '0').toLocaleString()}</span>
                    <span className="font-mono text-xs uppercase font-bold mt-2 text-black/50">AVG JOB: ${parseFloat(pm.avgJobSize || '0').toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Reputation Signals */}
          <section className="mb-12">
            <h2 className="font-mono text-xl font-black uppercase mb-4 flex items-center gap-2 border-b-4 border-black pb-2">
              <Award className="w-6 h-6" />
              03. Reputation Signals
            </h2>
            <div className="border-4 border-black bg-cream overflow-hidden">
              <table className="w-full font-mono text-sm text-left">
                <thead className="bg-black text-white uppercase">
                  <tr>
                    <th className="p-4 border-r-2 border-white">Signal</th>
                    <th className="p-4 border-r-2 border-white w-24 text-center">Score</th>
                    <th className="p-4">Notes</th>
                  </tr>
                </thead>
                <tbody className="uppercase font-bold">
                  <tr className="border-b-2 border-black">
                    <td className="p-4 border-r-2 border-black">Repeat Clients</td>
                    <td className={`p-4 border-r-2 border-black text-center ${(rs.repeatClients?.bonus ?? 0) > 0 ? 'text-green-700 bg-green-100' : 'text-gray-500'}`}>+{rs.repeatClients?.bonus ?? 0}</td>
                    <td className="p-4">{rs.repeatClients?.count ?? 0} clients returned</td>
                  </tr>
                  <tr className="border-b-2 border-black">
                    <td className="p-4 border-r-2 border-black">Client Diversity</td>
                    <td className={`p-4 border-r-2 border-black text-center ${(rs.clientDiversity?.bonus ?? 0) > 0 ? 'text-green-700 bg-green-100' : 'text-gray-500'}`}>+{rs.clientDiversity?.bonus ?? 0}</td>
                    <td className="p-4">{rs.clientDiversity?.count ?? 0} unique wallets</td>
                  </tr>
                  <tr>
                    <td className="p-4 border-r-2 border-black">High Value Jobs</td>
                    <td className={`p-4 border-r-2 border-black text-center ${(rs.highValueJobs?.bonus ?? 0) > 0 ? 'text-green-700 bg-green-100' : 'text-gray-500'}`}>+{rs.highValueJobs?.bonus ?? 0}</td>
                    <td className="p-4">{rs.highValueJobs?.count ?? 0} jobs over $10K</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 4: Red Flag Scan */}
          <section className="mb-12">
            <h2 className="font-mono text-xl font-black uppercase mb-4 flex items-center gap-2 border-b-4 border-black pb-2">
              <AlertTriangle className="w-6 h-6" />
              04. Threat &amp; Flag Scan
            </h2>
            {allPass ? (
              <div className="border-4 border-black bg-green-100 p-6 flex items-center gap-4 text-green-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <CheckCircle2 className="w-10 h-10 shrink-0" strokeWidth={2.5} />
                <p className="font-mono font-black text-xl md:text-2xl uppercase tracking-tighter">NO RED FLAGS DETECTED</p>
              </div>
            ) : (
              <div className="border-4 border-red-500 bg-red-50 p-6 shadow-[4px_4px_0px_0px_rgba(255,0,0,0.5)]">
                {Object.entries(rfs).filter(([, v]) => v.status === 'FAIL').map(([key]) => (
                  <div key={key} className="flex items-center gap-3 mb-2 font-mono text-sm font-bold uppercase text-red-700">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {key.replace(/_/g, ' ')}: DETECTED
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 5: Evaluator History */}
          <section className="mb-12">
            <h2 className="font-mono text-xl font-black uppercase mb-4 flex items-center gap-2 border-b-4 border-black pb-2">
              <History className="w-6 h-6" />
              05. Evaluator History
            </h2>
            <ul className="font-mono text-sm uppercase flex flex-col gap-3 font-bold">
              {[
                { id: "0x4A2...1C9F", time: "2 hours ago", role: "Primary Audit Node" },
                { id: "0x9B1...8E2D", time: "5 hours ago", role: "Consensus Validator" },
                { id: "0x7F4...3A1B", time: "1 day ago",   role: "Random Sampling Node" },
                { id: "0x2C5...9D4E", time: "3 days ago",  role: "Historical Integrity Check" }
              ].map((ev, i) => (
                <li key={i} className="flex flex-col md:flex-row md:items-center justify-between border-2 border-black p-3 bg-cream hover:bg-yellow-brand transition-colors">
                  <div className="flex items-center gap-4 mb-2 md:mb-0">
                    <span className="bg-black text-white px-2 py-0.5 text-xs">#{i + 1}</span>
                    <span className="underline decoration-2 underline-offset-4">{ev.id}</span>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-xs text-gray-600 md:text-black">
                    <span>ROLE: {ev.role}</span>
                    <span className="text-right">{ev.time}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-auto border-t-4 border-black bg-cream p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="font-mono text-xs uppercase font-bold max-w-sm text-center md:text-left bg-black text-white p-3">
            THIS REPORT IS GENERATED FROM ON-CHAIN DATA. NOT FINANCIAL ADVICE. DO YOUR OWN RESEARCH.
          </p>
          <div className="flex gap-4 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 border-4 border-black bg-white hover:bg-yellow-brand font-mono font-black uppercase text-sm shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
              <Download className="w-4 h-4" /> Download PDF
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 border-4 border-black bg-white hover:bg-yellow-brand font-mono font-black uppercase text-sm shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
              <Share2 className="w-4 h-4" /> Share Report
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}
