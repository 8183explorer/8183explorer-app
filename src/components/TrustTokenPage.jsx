import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Copy, Check, TrendingUp, Share2, Shield, Zap, Search } from 'lucide-react';

export default function TrustTokenPage() {
  const [copied, setCopied] = useState(false);
  const contractAddress = "0x0F261809A866F9C26fea70ba37d820651efeABA3";

  const handleCopy = () => {
    navigator.clipboard.writeText("0x0F261809A866F9C26fea70ba37d820651efeABA3");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="font-sans antialiased bg-[#F5F2EB] min-h-screen pt-20 flex flex-col selection:bg-yellow selection:text-black text-black">
      <Navbar />

      <main className="flex-grow max-w-[1200px] mx-auto w-full px-6 py-16 flex flex-col gap-16">
        {/* HERO */}
        <header className="text-center flex flex-col items-center gap-6">
          <h1 
            className="font-mono text-[100px] md:text-[140px] leading-none font-black text-[#FFD600] uppercase tracking-tighter"
            style={{ 
              textShadow: '8px 8px 0px #000, -3px -3px 0px #000, 3px -3px 0px #000, -3px 3px 0px #000, 3px 3px 0px #000'
            }}
          >
            $TRUST
          </h1>
          <p className="font-mono text-xl md:text-3xl font-black uppercase bg-white border-4 border-black px-8 py-4 shadow-[8px_8px_0px_0px_#000] max-w-4xl tracking-tight">
            Access the full audit suite. Verify with confidence.
          </p>
        </header>

        {/* TOKEN STATS ROW */}
        <section className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] grid grid-cols-2 md:grid-cols-4 divide-x-4 divide-y-4 md:divide-y-0 divide-black">
          <div className="p-6 md:p-8 flex flex-col gap-2 hover:bg-[#F5C518] transition-colors">
            <span className="font-mono text-sm font-black text-gray-600 uppercase tracking-widest">// PRICE</span>
            <span className="font-mono text-4xl font-black">$0.042</span>
          </div>
          <div className="p-6 md:p-8 flex flex-col gap-2 hover:bg-[#F5C518] transition-colors">
            <span className="font-mono text-sm font-black text-gray-600 uppercase tracking-widest">// MARKET CAP</span>
            <span className="font-mono text-4xl font-black">$4.2M</span>
          </div>
          <div className="p-6 md:p-8 flex flex-col gap-2 hover:bg-[#F5C518] transition-colors">
            <span className="font-mono text-sm font-black text-gray-600 uppercase tracking-widest">// HOLDERS</span>
            <span className="font-mono text-4xl font-black">3,847</span>
          </div>
          <div className="p-6 md:p-8 flex flex-col gap-2 hover:bg-[#F5C518] transition-colors">
            <span className="font-mono text-sm font-black text-gray-600 uppercase tracking-widest">// LAUNCH</span>
            <span className="font-mono text-2xl font-black mt-2">Via Virtuals</span>
          </div>
        </section>

        {/* THREE TIER BOXES */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* FREE TIER */}
          <div className="bg-white border-4 border-gray-400 p-8 flex flex-col gap-8 relative hover:-translate-y-2 hover:-translate-x-2 hover:shadow-[8px_8px_0px_0px_#9ca3af] transition-all duration-300">
            <div className="absolute -top-4 right-4 bg-gray-400 text-white font-mono text-xs font-black px-4 py-2 border-2 border-white uppercase tracking-wider">
              [ FREE ]
            </div>
            <div>
              <h2 className="font-mono text-4xl font-black uppercase mb-2">FREE</h2>
              <p className="font-mono text-sm text-gray-500 font-bold uppercase tracking-wider">No tokens needed</p>
            </div>
            <ul className="flex-grow flex flex-col gap-5 font-mono font-bold text-sm">
              <li className="flex gap-4 items-start"><Check className="text-gray-400 w-5 h-5 shrink-0" strokeWidth={3} /> 10 searches/day</li>
              <li className="flex gap-4 items-start"><Check className="text-gray-400 w-5 h-5 shrink-0" strokeWidth={3} /> Basic TrustScore</li>
              <li className="flex gap-4 items-start"><Check className="text-gray-400 w-5 h-5 shrink-0" strokeWidth={3} /> Public badges</li>
            </ul>
            <button className="bg-white border-4 border-gray-400 py-4 font-mono font-black text-lg uppercase hover:bg-gray-100 hover:text-black transition-colors">
              START FREE
            </button>
          </div>

          {/* HOLDER TIER */}
          <div className="bg-white border-4 border-black p-8 flex flex-col gap-8 relative shadow-[8px_8px_0px_0px_#000] hover:-translate-y-2 hover:-translate-x-2 hover:shadow-[16px_16px_0px_0px_#000] transition-all duration-300">
            <div className="absolute -top-4 right-4 bg-black text-white font-mono text-xs font-black px-4 py-2 border-2 border-white uppercase tracking-wider shadow-[4px_4px_0px_0px_#000]">
              [ HOLDER ]
            </div>
            <div>
              <h2 className="font-mono text-4xl font-black uppercase mb-2">HOLDER</h2>
              <p className="font-mono text-sm text-gray-500 font-bold uppercase tracking-wider">Hold 1,000+ $TRUST</p>
            </div>
            <ul className="flex-grow flex flex-col gap-5 font-mono font-bold text-sm">
              <li className="flex gap-4 items-start"><Check className="text-black w-5 h-5 shrink-0" strokeWidth={3} /> Unlimited searches</li>
              <li className="flex gap-4 items-start"><Check className="text-black w-5 h-5 shrink-0" strokeWidth={3} /> Full audit reports</li>
              <li className="flex gap-4 items-start"><Check className="text-[#FF3333] w-5 h-5 shrink-0" strokeWidth={3} /> Red flag alerts</li>
              <li className="flex gap-4 items-start"><Check className="text-black w-5 h-5 shrink-0" strokeWidth={3} /> Export data</li>
            </ul>
            <a
              href="https://www.bankr.bot/launches/0x0F261809A866F9C26fea70ba37d820651efeABA3"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#FFD600] border-4 border-black py-4 font-mono font-black text-lg uppercase shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all text-center"
            >
              BUY $TRUST
            </a>
          </div>

          {/* PREMIUM TIER */}
          <div className="bg-[#FFD600] border-4 border-[#F5C518] p-8 flex flex-col gap-8 relative shadow-[8px_8px_0px_0px_#000] hover:-translate-y-2 hover:-translate-x-2 hover:shadow-[16px_16px_0px_0px_#000] transition-all duration-300">
            <div className="absolute -top-4 right-4 bg-black text-[#FFD600] font-mono text-xs font-black px-4 py-2 border-2 border-white uppercase tracking-wider shadow-[4px_4px_0px_0px_#000]">
              [ PREMIUM ]
            </div>
            <div>
              <h2 className="font-mono text-4xl font-black uppercase mb-2 text-black">PREMIUM</h2>
              <p className="font-mono text-sm text-black font-bold uppercase tracking-wider">Hold 10,000+ $TRUST</p>
            </div>
            <ul className="flex-grow flex flex-col gap-5 font-mono font-bold text-sm text-black">
              <li className="flex gap-4 items-start"><Check className="text-black w-5 h-5 shrink-0" strokeWidth={3} /> Everything in Holder</li>
              <li className="flex gap-4 items-start"><Check className="text-black w-5 h-5 shrink-0" strokeWidth={3} /> AI output audit</li>
              <li className="flex gap-4 items-start"><Check className="text-black w-5 h-5 shrink-0" strokeWidth={3} /> Code safety scan</li>
              <li className="flex gap-4 items-start"><Check className="text-black w-5 h-5 shrink-0" strokeWidth={3} /> API access</li>
              <li className="flex gap-4 items-start"><Check className="text-black w-5 h-5 shrink-0" strokeWidth={3} /> Priority support</li>
            </ul>
            <a
              href="https://www.bankr.bot/launches/0x0F261809A866F9C26fea70ba37d820651efeABA3"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black text-white border-4 border-black py-4 font-mono font-black text-lg uppercase shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all text-center"
            >
              BUY $TRUST
            </a>
          </div>
        </section>

        {/* TOKEN UTILITY SECTION */}
        <section className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] overflow-hidden">
          <div className="bg-black text-white p-6 items-center flex gap-4">
            <Zap className="text-[#FFD600] w-8 h-8" strokeWidth={3} />
            <h2 className="font-mono text-2xl font-black uppercase tracking-widest">WHERE $TRUST FLOWS</h2>
          </div>
          <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-3 gap-8 items-center bg-hazard-mono">
            {/* Flows */}
            <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_#000] text-center flex flex-col gap-6 items-center hover:-translate-y-2 transition-transform">
              <div className="w-16 h-16 bg-[#FFD600] border-4 border-black flex items-center justify-center -mt-12 rounded-full">
                <Search className="w-8 h-8 font-black" strokeWidth={3} />
              </div>
              <h3 className="font-mono font-black uppercase text-xl">Search Fees</h3>
              <div className="font-mono text-sm font-black bg-[#FFD600] px-4 py-3 border-4 border-black w-full uppercase tracking-wider shadow-[4px_4px_0px_0px_#000]">
                → Burn + Treasury
              </div>
            </div>
            <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_#000] text-center flex flex-col gap-6 items-center hover:-translate-y-2 transition-transform">
              <div className="w-16 h-16 bg-[#FFD600] border-4 border-black flex items-center justify-center -mt-12 rounded-full">
                <TrendingUp className="w-8 h-8 font-black" strokeWidth={3} />
              </div>
              <h3 className="font-mono font-black uppercase text-xl">Agent Boost</h3>
              <div className="font-mono text-sm font-black bg-black text-[#FFD600] px-4 py-3 border-4 border-black w-full uppercase tracking-wider shadow-[4px_4px_0px_0px_#FFD600]">
                → BURN
              </div>
            </div>
            <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_#000] text-center flex flex-col gap-6 items-center hover:-translate-y-2 transition-transform">
              <div className="w-16 h-16 bg-[#FFD600] border-4 border-black flex items-center justify-center -mt-12 rounded-full">
                <Shield className="w-8 h-8 font-black" strokeWidth={3} />
              </div>
              <h3 className="font-mono font-black uppercase text-xl">Audit Requests</h3>
              <div className="font-mono text-sm font-black bg-[#FFD600] px-4 py-3 border-4 border-black w-full uppercase tracking-wider shadow-[4px_4px_0px_0px_#000]">
                → Revenue Share
              </div>
            </div>
          </div>
        </section>

        {/* BUY SECTION */}
        <section className="bg-black text-white border-4 border-black p-12 md:p-20 text-center flex flex-col items-center gap-10 shadow-[16px_16px_0px_0px_#FFD600] relative overflow-hidden">
          {/* Abstract background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 border-[10px] border-white/10 rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 border-[10px] border-white/10 rounded-full -translate-x-1/2 translate-y-1/2" />
          
          <h2 className="font-mono text-5xl md:text-7xl font-black uppercase tracking-tighter relative z-10">GET $TRUST ON VIRTUALS</h2>
          
          <a
            href="https://www.bankr.bot/launches/0x0F261809A866F9C26fea70ba37d820651efeABA3"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#FFD600] text-black border-4 border-transparent px-10 py-5 font-mono text-3xl font-black uppercase hover:bg-white hover:scale-105 transition-all flex items-center gap-4 relative z-10 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]"
          >
            TRADE ON VIRTUALS
            <Share2 className="w-8 h-8" strokeWidth={3} />
          </a>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 relative z-10">
            <span className="font-mono text-sm font-bold text-gray-400 uppercase tracking-widest">CONTRACT_ADDRESS:</span>
            <div className="bg-white text-black border-4 border-gray-500 flex items-stretch hover:border-[#FFD600] transition-colors">
              <span className="font-mono px-6 py-3 font-bold text-lg flex items-center">{contractAddress}</span>
              <button 
                onClick={handleCopy}
                className="bg-black text-white px-5 py-3 border-l-4 border-gray-500 hover:bg-[#FFD600] hover:text-black transition-colors flex items-center justify-center"
              >
                {copied ? <Check className="w-6 h-6 text-green-400" strokeWidth={3} /> : <Copy className="w-6 h-6" strokeWidth={3} />}
              </button>
            </div>
          </div>
        </section>

      </main>
      
      <Footer />
    </div>
  );
}
