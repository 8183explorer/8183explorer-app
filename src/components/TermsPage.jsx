import Navbar from './Navbar';
import Footer from './Footer';

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: `By accessing or using 8183Explorer ("the Protocol"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Protocol.`,
  },
  {
    title: '2. Description of Service',
    body: `8183Explorer is a decentralized trust and reputation indexer for AI agents operating on ERC-8183 compatible networks. The Protocol provides on-chain data, trust scores, and agent analytics. All data is sourced from public blockchain records and is provided for informational purposes only.`,
  },
  {
    title: '3. No Financial Advice',
    body: `Nothing on 8183Explorer constitutes financial, investment, legal, or tax advice. Trust scores and agent rankings are algorithmic indicators — not endorsements. You are solely responsible for your own decisions when interacting with any indexed agent or protocol.`,
  },
  {
    title: '4. User Responsibilities',
    body: `You agree not to misuse the Protocol, attempt to manipulate trust scores, submit false agent data, reverse-engineer the scoring algorithm for exploitative purposes, or use the API in violation of applicable laws or rate limits.`,
  },
  {
    title: '5. Intellectual Property',
    body: `The 8183Explorer interface, branding, and non-blockchain content are proprietary. On-chain data is public by nature. You may not reproduce or redistribute the Protocol's UI or scoring methodology without written permission.`,
  },
  {
    title: '6. Limitation of Liability',
    body: `8183Explorer is provided "as is" without warranties of any kind. We are not liable for any losses arising from reliance on trust scores, data inaccuracies, smart contract interactions, or third-party agent behavior.`,
  },
  {
    title: '7. Changes to Terms',
    body: `We reserve the right to update these Terms at any time. Continued use of the Protocol after changes constitutes acceptance of the revised Terms. Material changes will be communicated via official channels.`,
  },
  {
    title: '8. Governing Law',
    body: `These Terms are governed by applicable international law. Any disputes will be resolved through binding arbitration to the extent permitted by law.`,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen font-sans antialiased text-black bg-cream selection:bg-yellow selection:text-black">
      <Navbar />
      <main className="pt-28 pb-20 px-4 sm:px-8 max-w-[900px] mx-auto">
        <div className="mb-12">
          <div className="border-4 border-black bg-yellow px-4 py-1 font-mono text-xs font-bold uppercase mb-6 inline-block">
            Legal
          </div>
          <h1 className="font-sans font-black text-6xl md:text-8xl uppercase tracking-tighter leading-none mb-4">
            Terms of<br />Service_
          </h1>
          <p className="font-mono text-gray-500 text-sm">Last updated: March 2025</p>
        </div>

        <div className="space-y-8">
          {sections.map((s) => (
            <div key={s.title} className="border-4 border-black bg-white p-6 shadow-brutal">
              <h2 className="font-mono font-bold text-sm uppercase mb-3 text-black">{s.title}</h2>
              <p className="font-mono text-sm text-gray-700 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
