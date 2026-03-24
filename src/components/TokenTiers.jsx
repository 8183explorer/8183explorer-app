import { useState } from 'react';
import { Check, Minus, Zap, Bell, X, Mail, ShieldCheck } from 'lucide-react';

const tiers = [
  {
    name: 'Public',
    price: '0 $TRUST',
    features: [
      { text: 'Basic search queries', included: true },
      { text: 'Top 100 agent scores', included: true },
      { text: 'No API access', included: false },
      { text: 'Delayed alerts (24h)', included: false },
    ],
    buttonText: 'Current Tier',
    highlighted: false,
    cardClass: 'bg-white border-4 border-black p-8 shadow-brutal h-full flex flex-col',
    buttonClass:
      'w-full bg-concrete border-4 border-black font-mono font-bold uppercase py-4 hover:bg-black hover:text-white transition-colors',
  },
  {
    name: 'Terminal Pro',
    price: 'Hold 10,000 $TRUST',
    features: [
      { text: 'Unlimited terminal queries', included: true },
      { text: 'Deep-dive audit reports', included: true },
      { text: 'Real-time rug pull alerts', included: true },
      { text: 'Pro API limits (1k/day)', included: true },
    ],
    buttonText: 'Acquire Token',
    highlighted: true,
    cardClass:
      'bg-black text-white border-4 border-black p-8 shadow-brutal-white transform md:-translate-y-4 flex flex-col relative',
    buttonClass:
      'w-full bg-yellow text-black border-4 border-white font-mono font-bold uppercase py-4 text-lg hover:bg-white transition-colors',
  },
  {
    name: 'Institutional',
    price: 'Contact Sales',
    features: [
      { text: 'Unlimited API endpoints', included: true },
      { text: 'Custom risk scoring', included: true },
      { text: 'Direct integration support', included: true },
      { text: 'Dedicated account manager', included: true },
    ],
    buttonText: 'Contact Us',
    highlighted: false,
    cardClass: 'bg-concrete border-4 border-black p-8 shadow-brutal h-full flex flex-col',
    buttonClass:
      'w-full bg-black text-white border-4 border-black font-mono font-bold uppercase py-4 hover:bg-transparent hover:text-black transition-colors',
  },
];

/* ── Whitelist Modal ── */
function WhitelistModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [wallet, setWallet] = useState('');
  const [status, setStatus] = useState(null); // null | 'success' | 'error'

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setStatus('error');
      return;
    }
    // Production: POST to your backend / form service here
    console.log('[8183Explorer] Whitelist signup:', { email, wallet });
    setStatus('success');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-md w-full relative">
        {/* Header */}
        <div className="bg-black text-white p-5 flex items-center justify-between border-b-4 border-black">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-danger flex items-center justify-center border-2 border-white animate-pulse">
              <Bell className="w-4 h-4 text-white" strokeWidth={3} />
            </div>
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-yellow font-bold">
                Bankr Launch Imminent
              </div>
              <div className="font-mono font-black text-lg uppercase tracking-tight">
                Join the Whitelist
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="border-2 border-white p-1 hover:bg-white hover:text-black transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={3} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {status === 'success' ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-black flex items-center justify-center mx-auto mb-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <ShieldCheck className="w-8 h-8 text-yellow" strokeWidth={3} />
              </div>
              <div className="font-mono font-black text-xl uppercase mb-2">You're on the radar.</div>
              <p className="font-mono text-sm text-gray-600 font-bold">
                We'll notify you before the Bankr launch begins. Stay secure.
              </p>
              <button
                onClick={onClose}
                className="mt-6 w-full bg-black text-white border-4 border-black font-mono font-bold uppercase py-3 hover:bg-yellow hover:text-black transition-colors"
              >
                Close →
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <p className="font-mono text-sm font-bold text-gray-700 mb-2">
                Secure your allocation before public trading begins. Limited spots available.
              </p>

              <div>
                <label className="font-mono text-xs font-black uppercase tracking-widest text-gray-500 block mb-1">
                  Email Address *
                </label>
                <div className="flex items-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
                  <Mail className="w-5 h-5 mx-3 shrink-0 text-gray-400" strokeWidth={2.5} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="flex-1 py-3 pr-4 font-mono font-bold text-sm focus:outline-none placeholder-gray-400 bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="font-mono text-xs font-black uppercase tracking-widest text-gray-500 block mb-1">
                  Wallet Address <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={wallet}
                  onChange={(e) => setWallet(e.target.value)}
                  placeholder="0x..."
                  className="w-full border-4 border-black py-3 px-4 font-mono font-bold text-sm focus:outline-none placeholder-gray-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white"
                />
              </div>

              {status === 'error' && (
                <div className="font-mono text-xs font-bold text-danger uppercase">
                  ⚠ Please enter a valid email address.
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-black text-white border-4 border-black font-mono font-black uppercase py-4 text-base shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 hover:bg-yellow hover:text-black transition-all"
              >
                Secure My Spot →
              </button>

              <p className="font-mono text-[10px] text-gray-400 text-center">
                No spam. No third-party sharing. Unsubscribe anytime.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TokenTiers() {
  const [showModal, setShowModal] = useState(false);

  return (
    <section className="bg-yellow py-32 border-b-8 border-black relative overflow-hidden">
      {/* Hazard borders */}
      <div className="absolute top-0 left-0 w-full h-8 bg-hazard-mono border-b-4 border-black" />
      <div className="absolute bottom-0 left-0 w-full h-8 bg-hazard-mono border-t-4 border-black" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 font-mono font-bold text-sm uppercase mb-6 border-4 border-white">
            <Zap className="w-4 h-4 text-yellow fill-yellow" /> Utility Protocol
          </div>
          <h2 className="font-sans font-black text-6xl uppercase tracking-tighter mb-4">
            $TRUST Token Tiers
          </h2>
          <p className="font-mono text-xl font-bold max-w-2xl mx-auto">
            Hold token to access premium terminal features and API endpoints.
          </p>
        </div>

        {/* Tier cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {tiers.map((tier) => (
            <div key={tier.name} className={tier.cardClass}>
              {/* Most Popular badge */}
              {tier.highlighted && (
                <div className="absolute -top-4 -right-4 bg-yellow text-black border-4 border-black font-mono font-bold uppercase text-xs px-3 py-1 shadow-brutal-sm transform rotate-6">
                  Most Popular
                </div>
              )}

              <h3
                className={`font-sans font-black ${
                  tier.highlighted ? 'text-4xl text-yellow' : 'text-3xl'
                } uppercase mb-2`}
              >
                {tier.name}
              </h3>
              <div
                className={`font-mono ${
                  tier.highlighted ? 'text-2xl border-b-4 border-white' : 'text-xl border-b-4 border-black'
                } mb-8 pb-4`}
              >
                {tier.price}
              </div>

              <ul className="space-y-4 font-mono text-sm flex-grow mb-8">
                {tier.features.map((feature) => (
                  <li
                    key={feature.text}
                    className={`flex gap-3 ${feature.included ? '' : 'text-gray-400'}`}
                  >
                    {feature.included ? (
                      <Check
                        className={`w-5 h-5 ${tier.highlighted ? 'text-yellow' : ''}`}
                        strokeWidth={3}
                      />
                    ) : (
                      <Minus className="w-5 h-5" strokeWidth={3} />
                    )}
                    {feature.text}
                  </li>
                ))}
              </ul>

              <button className={tier.buttonClass}>{tier.buttonText}</button>
            </div>
          ))}
        </div>

        {/* Alert banner */}
        <div className="mt-16 bg-white border-4 border-black p-6 flex flex-col md:flex-row items-center justify-between shadow-brutal max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="w-12 h-12 bg-danger flex items-center justify-center border-2 border-black animate-pulse">
              <Bell className="w-6 h-6 text-white" strokeWidth={3} />
            </div>
            <div>
              <h4 className="font-mono font-bold text-xl uppercase text-danger">
                Alert: Bankr Launch Imminent
              </h4>
              <p className="font-mono text-sm font-bold">
                Secure your allocation before public trading begins.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-black text-white px-8 py-3 font-mono font-bold uppercase border-2 border-black hover:bg-white hover:text-black transition-colors whitespace-nowrap shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
          >
            Join Whitelist →
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && <WhitelistModal onClose={() => setShowModal(false)} />}
    </section>
  );
}
