import { Link } from 'react-router-dom';
import { useState } from 'react';

const footerLinks = {
  Protocol: [
    { label: 'Terminal',    to: '/database'   },
    { label: 'API Docs',    to: '/docs'       },
    { label: 'Methodology', to: '/methodology'},
  ],
  Token: [
    { label: 'Buy $TRUST',  href: 'https://www.bankr.bot/launches/0x0F261809A866F9C26fea70ba37d820651efeABA3' },
    { label: 'Staking',     to: '/soon' },
    { label: 'Governance',  to: '/soon' },
    { label: 'Contract',    href: 'https://basescan.org/address/0x0F261809A866F9C26fea70ba37d820651efeABA3' },
  ],
  Socials: [
    { label: 'Twitter // X', href: 'https://x.com/8183explorer' },
    { label: 'Github',       href: 'https://github.com/8183explorer/8183explorer-app' },
  ],
  Legal: [
    { label: 'Terms',      to: '/terms'      },
    { label: 'Privacy',    to: '/privacy'    },
    { label: 'Disclaimer', to: '/disclaimer' },
  ],
};

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setStatus('error');
      return;
    }
    console.log('[8183Explorer] Whitelist subscription:', email);
    setStatus('success');
    setEmail('');
    setTimeout(() => setStatus(null), 4000);
  };

  return (
    <footer className="bg-black text-white pt-24 pb-12 px-6 border-t-8 border-yellow">
      <div className="max-w-7xl mx-auto">
        {/* Main footer content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
          {/* Left - CTA + Email */}
          <div>
            <h2 className="font-sans font-black text-5xl md:text-7xl uppercase tracking-tighter mb-6 leading-none">
              Stay Secure.
              <br />
              Join the Radar.
            </h2>
            <p className="font-mono text-gray-400 max-w-md mb-8">
              Get weekly intelligence reports on newly indexed agents, verified safe lists, and emerging
              threats.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-0 max-w-lg">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ENTER SECURE EMAIL..."
                className="flex-grow bg-black text-white border-4 border-white p-4 font-mono font-bold placeholder-gray-600 focus:outline-none focus:border-yellow uppercase"
              />
              <button
                type="submit"
                className="bg-yellow text-black border-y-4 border-r-4 border-l-4 sm:border-l-0 border-white p-4 font-mono font-bold uppercase hover:bg-white transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>

            {status === 'success' && (
              <div className="mt-3 flex items-center gap-2 font-mono text-sm font-bold text-green-400 uppercase">
                <span className="w-2 h-2 bg-green-400 rounded-full inline-block animate-pulse" />
                You're on the radar. Welcome.
              </div>
            )}
            {status === 'error' && (
              <div className="mt-3 font-mono text-sm font-bold text-red-400 uppercase">
                ⚠ Enter a valid email address.
              </div>
            )}
          </div>

          {/* Right - Links */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 font-mono text-sm uppercase">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-yellow font-bold mb-4 border-b-2 border-gray-800 pb-2">
                  {category}
                </h4>
                <ul className="space-y-3 text-gray-400">
                  {links.map((link) => (
                    <li key={link.label}>
                      {link.to ? (
                        <Link
                          to={link.to}
                          className="hover:text-white transition-colors text-left"
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <a
                          href={link.href}
                          target={link.href !== '#' ? '_blank' : undefined}
                          rel={link.href !== '#' ? 'noopener noreferrer' : undefined}
                          className="hover:text-white transition-colors"
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t-4 border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 font-mono text-xs text-gray-500 uppercase">
          <div>© 2024 8183Explorer Protocol. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span>Sys_Ver: 1.0.44</span>
            <span className="w-2 h-2 bg-safe block rounded-none border border-black" />
          </div>
        </div>
      </div>
    </footer>
  );
}
