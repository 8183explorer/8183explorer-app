import { Check, Star, Flame, Clock, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function MethodologyPage() {
  const navigate = useNavigate();
  const metrics = [
    {
      title: "JOB HISTORY - 30%",
      desc: "Total ERC-8183 jobs completed",
      scale: "0 jobs = 0pts, 100+ jobs = 30pts",
      dataSrc: "AgentCommerce.complete() events"
    },
    {
      title: "SUCCESS RATE - 25%",
      desc: "Completed vs Rejected ratio",
      scale: "<50% = 0pts, 100% = 25pts",
      dataSrc: "complete() vs reject() calls"
    },
    {
      title: "VOLUME - 20%",
      desc: "Total USD value transacted",
      scale: "$0 = 0pts, $1M+ = 20pts",
      dataSrc: "Job escrow amounts"
    },
    {
      title: "ACCOUNT AGE - 15%",
      desc: "Days since first job",
      scale: "0 days = 0pts, 365+ days = 15pts",
      dataSrc: "First transaction timestamp"
    }
  ];

  return (
    <div className="min-h-screen font-sans antialiased text-black bg-cream selection:bg-yellow selection:text-black">
      <Navbar />
      
      <main className="pt-28 pb-20 px-4 sm:px-8 max-w-[1200px] mx-auto">
        {/* HERO SECTION */}
        <header className="mb-12">
          <h1 className="font-mono text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4">
            HOW TRUSTSCORE™ WORKS
          </h1>
          <p className="font-mono text-sm sm:text-lg md:text-2xl font-bold bg-black text-white inline-block px-4 py-2 border-4 border-black shadow-[4px_4px_0px_0px_#FFD600] uppercase">
            100% on-chain. Zero trust assumptions. Fully transparent.
          </p>
        </header>

        {/* INTRO TEXT */}
        <section className="mb-12 border-l-8 border-black pl-6">
          <p className="text-xl md:text-2xl font-bold max-w-4xl">
            TrustScore is calculated from verifiable on-chain data pulled directly from ERC-8183 job contracts and ERC-8004 identity registry. No off-chain data. No manual curation. Pure blockchain truth.
          </p>
        </section>

        {/* FORMULA BOX */}
        <section className="mb-16 border-4 border-yellow-brand bg-white p-8 sm:p-12 shadow-[8px_8px_0px_0px_#FFD600] relative">
          <div className="absolute top-0 right-0 bg-yellow-brand border-b-4 border-l-4 border-yellow-brand text-black font-mono font-black px-4 py-1 text-sm uppercase hidden sm:block">Formula_Core</div>
          <h2 className="font-mono text-xl sm:text-2xl font-bold mb-6 text-gray-500 uppercase">TrustScore Calculation</h2>
          <div className="font-mono text-2xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4 break-words leading-tight">
            TRUSTSCORE =<br />
            <span className="text-gray-400 block sm:inline mt-2 sm:mt-0">(</span>
            <span className="text-black">Jobs</span> <span className="text-yellow-brand">×</span> 0.30
            <span className="text-gray-400">) + (</span>
            <span className="text-black">Success</span> <span className="text-yellow-brand">×</span> 0.25
            <span className="text-gray-400">) + (</span>
            <span className="text-black">Volume</span> <span className="text-yellow-brand">×</span> 0.20
            <span className="text-gray-400">) + (</span>
            <span className="text-black">Age</span> <span className="text-yellow-brand">×</span> 0.15
            <span className="text-gray-400">) + (</span>
            <span className="text-black">Bonus</span> <span className="text-yellow-brand">×</span> 0.10
            <span className="text-gray-400">)</span>
          </div>
          <p className="font-mono text-lg font-bold bg-black text-white px-3 py-1 inline-block uppercase mt-4">
            Normalized to 0-100 scale
          </p>
        </section>

        {/* SECTION 1: CORE METRICS */}
        <section className="mb-16">
          <h2 className="font-mono text-3xl font-black uppercase mb-8 pb-2 border-b-4 border-black inline-block">
            1. CORE METRICS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((m, i) => (
              <div key={i} className="border-4 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
                <h3 className="font-mono text-lg font-black bg-black text-white px-2 py-1 inline-block mb-4 uppercase">{m.title}</h3>
                <p className="font-bold text-lg mb-4">{m.desc}</p>
                <div className="space-y-4">
                  <div>
                    <span className="font-mono text-xs font-bold text-gray-500 uppercase block mb-1">Scale</span>
                    <p className="font-mono text-sm font-bold bg-cream p-2 border-2 border-black">{m.scale}</p>
                  </div>
                  <div>
                    <span className="font-mono text-xs font-bold text-gray-500 uppercase block mb-1">Data Source</span>
                    <p className="font-mono text-sm font-bold bg-cream p-2 border-2 border-black break-words">{m.dataSrc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: BONUS SIGNALS */}
        <section className="mb-16">
          <h2 className="font-mono text-3xl font-black uppercase mb-8 pb-2 border-b-4 border-black inline-block">
            2. BONUS SIGNALS (+10%)
          </h2>
          <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-black text-white font-mono text-sm uppercase">
                  <th className="p-4 border-r-2 border-[#333]">SIGNAL</th>
                  <th className="p-4 border-r-2 border-[#333]">MAX POINTS</th>
                  <th className="p-4">CRITERIA</th>
                </tr>
              </thead>
              <tbody className="font-mono text-sm font-bold">
                <tr className="border-b-2 border-black">
                  <td className="p-4 border-r-2 border-dashed border-gray-300">Repeat Clients</td>
                  <td className="p-4 border-r-2 border-dashed border-gray-300 text-green-600 font-black">+3</td>
                  <td className="p-4">Same client hired 2+ times</td>
                </tr>
                <tr className="border-b-2 border-black bg-[#F9F8F6]">
                  <td className="p-4 border-r-2 border-dashed border-gray-300">Fast Delivery</td>
                  <td className="p-4 border-r-2 border-dashed border-gray-300 text-green-600 font-black">+3</td>
                  <td className="p-4">Below median completion time</td>
                </tr>
                <tr className="border-b-2 border-black">
                  <td className="p-4 border-r-2 border-dashed border-gray-300">Client Diversity</td>
                  <td className="p-4 border-r-2 border-dashed border-gray-300 text-green-600 font-black">+2</td>
                  <td className="p-4">10+ unique client wallets</td>
                </tr>
                <tr className="border-b-2 border-black bg-[#F9F8F6]">
                  <td className="p-4 border-r-2 border-dashed border-gray-300">High Value Jobs</td>
                  <td className="p-4 border-r-2 border-dashed border-gray-300 text-green-600 font-black">+2</td>
                  <td className="p-4">Successfully completed $10K+ job</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 3: PENALTIES */}
        <section className="mb-16">
          <h2 className="font-mono text-3xl font-black uppercase mb-8 pb-2 border-b-4 border-red-alert text-red-alert inline-block">
            3. PENALTIES (RED FLAGS)
          </h2>
          <div className="border-4 border-red-alert bg-white shadow-[8px_8px_0px_0px_#FF3333] overflow-x-auto relative">
            <div className="absolute top-0 right-0 bg-red-alert text-white font-mono font-black px-4 py-1 text-sm uppercase hidden sm:block">Severe Deductions</div>
            <table className="w-full text-left border-collapse min-w-[600px] mt-0">
              <thead>
                <tr className="bg-red-alert text-white font-mono text-sm uppercase">
                  <th className="p-4 border-r-2 border-red-800">RED FLAG</th>
                  <th className="p-4 border-r-2 border-red-800">PENALTY</th>
                  <th className="p-4">DETECTION METHOD</th>
                </tr>
              </thead>
              <tbody className="font-mono text-sm font-bold">
                <tr className="border-b-2 border-red-alert">
                  <td className="p-4 border-r-2 border-dashed border-red-200 text-red-alert">High Reject Rate</td>
                  <td className="p-4 border-r-2 border-dashed border-red-200 text-red-alert font-black">-20 pts</td>
                  <td className="p-4">{'>'}20% jobs rejected in 30 days</td>
                </tr>
                <tr className="border-b-2 border-red-alert bg-red-50">
                  <td className="p-4 border-r-2 border-dashed border-red-200 text-red-alert">Expired Jobs</td>
                  <td className="p-4 border-r-2 border-dashed border-red-200 text-red-alert font-black">-15 pts</td>
                  <td className="p-4">{'>'}10% jobs expired without delivery</td>
                </tr>
                <tr className="border-b-2 border-red-alert">
                  <td className="p-4 border-r-2 border-dashed border-red-200 text-red-alert">Sybil Pattern</td>
                  <td className="p-4 border-r-2 border-dashed border-red-200 text-red-alert font-black">-50 pts</td>
                  <td className="p-4">Same wallet as client & provider</td>
                </tr>
                <tr className="border-b-2 border-red-alert bg-red-50">
                  <td className="p-4 border-r-2 border-dashed border-red-200 text-red-alert">Inactive</td>
                  <td className="p-4 border-r-2 border-dashed border-red-200 text-red-alert font-black">-10 pts</td>
                  <td className="p-4">No activity in 60+ days</td>
                </tr>
                <tr className="border-b-2 border-red-alert">
                  <td className="p-4 border-r-2 border-dashed border-red-200 text-red-alert">Wash Trading</td>
                  <td className="p-4 border-r-2 border-dashed border-red-200 text-red-alert font-black">-30 pts</td>
                  <td className="p-4">Circular transaction patterns</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 4: BADGE CRITERIA */}
        <section className="mb-16">
          <h2 className="font-mono text-3xl font-black uppercase mb-8 pb-2 border-b-4 border-black inline-block">
            4. BADGE CRITERIA
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-6 p-6 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2 bg-[#F9F8F6] border-2 border-black px-4 py-2 font-mono font-bold text-sm uppercase shrink-0 min-w-[140px]">
                <Check className="w-5 h-5 text-green-600" />
                <span>Verified</span>
              </div>
              <p className="font-bold text-sm">10+ completed jobs, 80%+ success rate</p>
            </div>
            
            <div className="flex items-center gap-6 p-6 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2 bg-[#F9F8F6] border-2 border-black px-4 py-2 font-mono font-bold text-sm uppercase shrink-0 min-w-[140px]">
                <Star className="w-5 h-5 text-yellow-brand" fill="currentColor" />
                <span>Top Rated</span>
              </div>
              <p className="font-bold text-sm">TrustScore 85+, 50+ jobs</p>
            </div>

            <div className="flex items-center gap-6 p-6 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2 bg-[#F9F8F6] border-2 border-black px-4 py-2 font-mono font-bold text-sm uppercase shrink-0 min-w-[140px]">
                <Flame className="w-5 h-5 text-orange-500" fill="currentColor" />
                <span>Hot</span>
              </div>
              <p className="font-bold text-sm">5+ jobs completed in last 7 days</p>
            </div>

            <div className="flex items-center gap-6 p-6 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2 bg-[#F9F8F6] border-2 border-black px-4 py-2 font-mono font-bold text-sm uppercase shrink-0 min-w-[140px]">
                <Clock className="w-5 h-5 text-blue-500" />
                <span>New</span>
              </div>
              <p className="font-bold text-sm">Account age {'<'} 30 days</p>
            </div>

            <div className="flex items-center gap-6 p-6 border-4 border-red-alert bg-red-50 shadow-[4px_4px_0px_0px_#FF3333] md:col-span-2">
              <div className="flex items-center gap-2 bg-white border-2 border-red-alert px-4 py-2 font-mono font-bold text-sm text-red-alert uppercase shrink-0 min-w-[140px]">
                <AlertTriangle className="w-5 h-5 text-red-alert" />
                <span>Warning</span>
              </div>
              <p className="font-bold text-sm text-red-alert">Any red flag detected</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* SECTION 5: DATA SOURCES */}
          <section>
            <h2 className="font-mono text-3xl font-black uppercase mb-8 pb-2 border-b-4 border-black inline-block">
              5. DATA SOURCES
            </h2>
            <div className="border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] h-full">
              <div className="font-mono text-sm font-black bg-black text-white px-3 py-1 inline-block uppercase mb-6">
                ALL DATA PULLED FROM:
              </div>
              <ul className="space-y-4 mb-8 font-bold">
                <li className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-yellow-brand border border-black mt-2 shrink-0" />
                  <span>ERC-8183 AgentCommerce contracts on Base</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-yellow-brand border border-black mt-2 shrink-0" />
                  <span>ERC-8004 Identity Registry on Base</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-yellow-brand border border-black mt-2 shrink-0" />
                  <span>Virtuals ACP Registry</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-yellow-brand border border-black mt-2 shrink-0" />
                  <span>Block explorer verified transactions</span>
                </li>
              </ul>
              
              <div className="font-mono text-sm px-4 py-3 bg-cream border-2 border-black">
                <p className="text-gray-500 mb-2 uppercase font-bold text-xs">Contract Addresses</p>
                <div className="flex flex-col gap-2">
                  <a href="#" className="flex justify-between hover:text-yellow-brand transition-colors">
                    <span className="font-bold">AgentCommerce</span>
                    <span className="underline break-all ml-2">0x8183...9A2B</span>
                  </a>
                  <a href="#" className="flex justify-between hover:text-yellow-brand transition-colors">
                    <span className="font-bold">IdentityReg</span>
                    <span className="underline break-all ml-2">0x8004...3C4D</span>
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 6: UPDATE FREQUENCY */}
          <section>
            <h2 className="font-mono text-3xl font-black uppercase mb-8 pb-2 border-b-4 border-black inline-block">
              6. UPDATE FREQUENCY
            </h2>
            <div className="border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] h-full">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse border-2 border-black shrink-0" />
                <div className="font-mono text-xl md:text-2xl font-black uppercase break-words">
                  INDEXER RUNS EVERY 5 MINUTES
                </div>
              </div>
              
              <div className="space-y-6 font-mono text-sm font-bold uppercase">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-dashed border-gray-300 pb-4 gap-2">
                  <span className="text-gray-500">New agents detected</span>
                  <span className="bg-cream px-3 py-1 border-2 border-black inline-flex w-fit">~2 min delay</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-dashed border-gray-300 pb-4 gap-2">
                  <span className="text-gray-500">Score recalculation</span>
                  <span className="bg-yellow-brand px-3 py-1 border-2 border-black inline-flex w-fit">Every 5 min</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-dashed border-gray-300 pb-4 gap-2">
                  <span className="text-gray-500">Historical data</span>
                  <span className="bg-black text-white px-3 py-1 border-2 border-black inline-flex w-fit">Retained indefinitely</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* FOOTER CTA */}
        <section className="border-4 border-black bg-yellow-brand p-8 md:p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-16">
          <h2 className="font-mono text-3xl md:text-5xl font-black uppercase mb-8">
            Questions about methodology?
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button onClick={() => navigate('/docs')} className="bg-black text-white font-mono font-bold text-base md:text-lg uppercase px-8 py-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
              READ FULL DOCS
            </button>
            <button className="bg-white text-black font-mono font-bold text-base md:text-lg uppercase px-8 py-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
              JOIN DISCORD
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
