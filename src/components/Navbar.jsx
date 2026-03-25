import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Radar, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { pathname } = useLocation();

  const navLinks = [
    { id: 'database',    label: 'Database',     to: '/database' },
    { id: 'methodology', label: 'Methodology',  to: '/methodology' },
    { id: 'token',       label: '$TRUST Token', to: '/token' },
    { id: 'docs',        label: 'Docs',         to: '/docs' },
  ];

  const isActive = (to) => pathname === to;

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-concrete border-b-4 border-black z-50 flex items-center justify-between px-4 md:px-6 py-4 h-20">
        <div className="flex items-center lg:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 min-h-[48px] min-w-[48px] flex items-center justify-center"
          >
            <Menu className="w-8 h-8" strokeWidth={3} />
          </button>
        </div>

        <Link
          to="/"
          onClick={() => setIsMobileMenuOpen(false)}
          className="flex items-center gap-2 md:gap-4 absolute left-1/2 -translate-x-1/2 lg:relative lg:left-0 lg:translate-x-0"
        >
          <Radar className="hidden md:block w-8 h-8" strokeWidth={3} />
          <h1 className="font-mono text-xl md:text-2xl font-bold tracking-tighter uppercase">8183Explorer_</h1>
          <span className="hidden md:inline-block font-mono text-xs bg-safe text-black px-2 py-1 ml-4 border-2 border-black">
            SYS.STATUS: ONLINE
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-8 font-mono font-bold text-sm uppercase">
          {navLinks.map((link) => (
            <Link
              key={link.id}
              to={link.to}
              className={`px-3 py-1.5 transition-colors border-2 flex items-center gap-2 ${
                isActive(link.to)
                  ? 'bg-black text-white border-black shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none'
                  : 'border-transparent hover:border-black hover:bg-black hover:text-white'
              }`}
            >
              {isActive(link.to) && <span className="w-2 h-2 bg-yellow border border-white" />}
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <span className="font-mono text-xs text-gray-500 border-2 border-dashed border-gray-400 px-3 py-1.5 select-all tracking-wider">
            CA: 0x14609a48396b240d7d2bC2F03966F0CEcd4078C6
          </span>
          <a
            href="https://app.virtuals.io/virtuals/68323"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-yellow border-2 md:border-4 border-black font-mono font-bold uppercase px-3 py-1.5 md:px-6 md:py-2 text-xs md:text-base shadow-[2px_2px_0px_rgba(0,0,0,1)] md:shadow-brutal-sm hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
          >
            Buy $TRUST
          </a>
        </div>

        <button className="bg-yellow border-2 md:border-4 border-black font-mono font-bold uppercase px-3 py-1.5 md:px-6 md:py-2 text-xs md:text-base shadow-[2px_2px_0px_rgba(0,0,0,1)] md:shadow-brutal-sm hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all touch-manipulation min-h-[48px] md:min-h-0 min-w-[70px] md:min-w-0 flex items-center justify-center">
          <span className="md:hidden">Connect</span>
          <span className="hidden md:inline">Connect_Wallet</span>
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-black text-white flex flex-col h-screen w-screen overflow-hidden">
          <div className="flex items-center justify-between px-4 py-4 h-20 border-b-4 border-white shrink-0">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 -ml-2 min-h-[48px] min-w-[48px] flex items-center justify-center"
            >
              <X className="w-8 h-8 text-yellow" strokeWidth={3} />
            </button>
            <h1 className="font-mono text-xl font-bold tracking-tighter uppercase text-yellow">8183Explorer_</h1>
            <div className="w-[48px]"></div>
          </div>
          <div className="flex flex-col flex-1 p-6 gap-2 font-mono font-bold uppercase text-xl overflow-y-auto">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                to={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-left border-b-2 border-gray-800 py-6 flex items-center gap-4 min-h-[64px] ${
                  isActive(link.to) ? 'text-yellow' : 'text-white'
                }`}
              >
                {isActive(link.to) && <span className="w-3 h-3 bg-yellow" />}
                {link.label}
              </Link>
            ))}
            <div className="mt-8 flex flex-col gap-3">
              <div className="border-2 border-dashed border-gray-600 px-4 py-3 flex flex-col gap-1">
                <span className="font-mono text-xs text-gray-500 uppercase">Contract Address</span>
                <span className="font-mono text-xs text-gray-300 select-all break-all">
                  0x14609a48396b240d7d2bC2F03966F0CEcd4078C6
                </span>
              </div>
              <a
                href="https://app.virtuals.io/virtuals/68323"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="bg-yellow text-black border-4 border-white font-mono font-bold uppercase px-6 py-4 shadow-[4px_4px_0px_rgba(255,255,255,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all w-full text-center min-h-[64px] flex items-center justify-center"
              >
                Buy $TRUST
              </a>
              <button className="bg-transparent text-white border-4 border-white font-mono font-bold uppercase px-6 py-4 hover:bg-white hover:text-black transition-all w-full text-center min-h-[64px]">
                Connect Wallet
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
