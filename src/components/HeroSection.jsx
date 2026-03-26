import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

const stats = [
  { label: 'Agents Indexed', value: '556', dark: false },
  { label: 'Scams Detected', value: '142', dark: true },
  { label: 'Total TVL Audited', value: '$45.2M', dark: false },
];

export default function HeroSection() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <section className="pt-32 pb-24 px-6 min-h-[90vh] flex flex-col justify-center border-b-8 border-black relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 pointer-events-none opacity-10 grid-bg" />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* Alert bar */}
        <div className="mb-4 flex items-center gap-4 font-mono text-sm font-bold uppercase">
          <div className="w-3 h-3 bg-danger rounded-none border-2 border-black" />
          <span>Alert: Unregulated AI Markets Detected</span>
          <span className="bg-black text-yellow px-2 py-1 ml-auto hidden md:inline-block">V.1.0.44</span>
        </div>

        {/* Headline */}
        <h1 className="font-sans font-black text-5xl md:text-[8rem] leading-[0.9] uppercase tracking-tighter mb-8 md:mb-12 max-w-5xl">
          550+ AI Agents.
          <br />
          <span className="text-black bg-yellow px-2 md:px-4 inline-block transform -rotate-1 shadow-[4px_4px_0px_rgba(0,0,0,1)] my-2 md:my-4">
            Zero Trust.
          </span>
          <br />
          Until Now.
        </h1>

        {/* Search bar */}
        <div className="w-full max-w-4xl flex flex-col md:flex-row mb-12 md:mb-16 gap-4 md:gap-0 bg-transparent md:bg-white md:border-4 md:border-black md:shadow-brutal">
          <div className="flex-grow flex items-center bg-white border-4 border-black md:border-none p-3 md:p-0 md:px-6 md:py-4 md:border-r-4 md:border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] md:shadow-none min-h-[64px] md:min-h-0">
            <Search className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-4 shrink-0" strokeWidth={3} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH AGENT NAME, CONTRACT, OR WALLET..."
              className="w-full text-base md:text-2xl font-mono font-bold focus:outline-none placeholder-gray-400 uppercase bg-transparent"
            />
          </div>
          <button
            onClick={() => navigate('/search')}
            className="w-full md:w-auto bg-yellow border-4 border-black md:border-none px-6 py-4 md:px-12 md:py-6 font-mono font-bold text-xl md:text-2xl uppercase shadow-[4px_4px_0px_rgba(0,0,0,1)] md:shadow-none hover:bg-black hover:text-yellow transition-colors whitespace-nowrap min-h-[64px] md:min-h-0"
          >
            Scan
          </button>
        </div>

        {/* Token Bar */}
        <div className="w-full max-w-4xl flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8 md:mb-10">
          <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-3 border-2 border-dashed border-gray-400 px-4 py-3">
            <span className="font-mono text-[10px] text-gray-500 uppercase font-bold whitespace-nowrap">$TRUST CA</span>
            <span className="font-mono text-xs text-gray-700 select-all break-all tracking-wide">
              0x0F261809A866F9C26fea70ba37d820651efeABA3
            </span>
          </div>
          <a
            href="https://www.bankr.bot/launches/0x0F261809A866F9C26fea70ba37d820651efeABA3"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-yellow border-4 border-black font-mono font-bold uppercase px-6 py-3 text-sm shadow-brutal-sm hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all whitespace-nowrap text-center"
          >
            Buy $TRUST
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 md:gap-8 max-w-5xl">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`border-2 md:border-4 border-black p-2 md:p-6 shadow-[2px_2px_0px_rgba(0,0,0,1)] md:shadow-brutal-sm flex flex-col justify-center items-center md:items-start text-center md:text-left ${
                stat.dark ? 'bg-black text-white' : 'bg-white'
              }`}
            >
              <p className={`font-mono text-[10px] md:text-sm uppercase font-bold mb-1 md:mb-2 leading-tight ${stat.dark ? 'text-yellow' : ''}`}>
                {stat.label.replace('Indexed', '').replace('Total TVL', 'Vol.').trim()}
              </p>
              <p className={`font-mono text-lg md:text-5xl font-bold ${stat.label === 'Scams Detected' ? 'text-danger' : ''}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
