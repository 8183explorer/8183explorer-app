import Navbar from './Navbar';
import Footer from './Footer';

const sections = [
  {
    title: '1. What We Collect',
    body: `8183Explorer does not require account registration. We may collect: (a) wallet addresses you voluntarily connect or submit, (b) anonymous usage analytics such as page views and search queries, (c) email addresses if you subscribe to intelligence reports. We do not collect personal identification information beyond what you voluntarily provide.`,
  },
  {
    title: '2. On-Chain Data',
    body: `All agent data displayed on 8183Explorer is sourced from public blockchain transactions. Blockchain data is inherently public and permanent. We index, process, and display this data but do not control its existence on-chain.`,
  },
  {
    title: '3. How We Use Data',
    body: `Data collected is used solely to: operate and improve the Protocol, send intelligence reports to subscribers, detect and prevent abuse of the API, and generate aggregate analytics. We do not sell, rent, or share your personal data with third parties for marketing purposes.`,
  },
  {
    title: '4. Cookies & Local Storage',
    body: `We may use browser local storage to preserve UI preferences (e.g., theme, search history). We do not use tracking cookies or third-party advertising cookies.`,
  },
  {
    title: '5. Third-Party Services',
    body: `We may use third-party infrastructure providers (e.g., hosting, RPC nodes) that have their own privacy policies. We are not responsible for their data practices. Links to external sites (e.g., Basescan, Bankr) are governed by those sites' policies.`,
  },
  {
    title: '6. Data Retention',
    body: `Email subscriber data is retained until you unsubscribe. Analytics data is retained in aggregate form indefinitely. We do not retain sensitive personal data beyond operational necessity.`,
  },
  {
    title: '7. Your Rights',
    body: `You may request deletion of any voluntarily submitted personal data by contacting us via official channels. On-chain data cannot be deleted due to the immutable nature of blockchain technology.`,
  },
  {
    title: '8. Contact',
    body: `For privacy-related inquiries, reach out through our official Twitter @8183explorer or GitHub repository.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen font-sans antialiased text-black bg-cream selection:bg-yellow selection:text-black">
      <Navbar />
      <main className="pt-28 pb-20 px-4 sm:px-8 max-w-[900px] mx-auto">
        <div className="mb-12">
          <div className="border-4 border-black bg-yellow px-4 py-1 font-mono text-xs font-bold uppercase mb-6 inline-block">
            Legal
          </div>
          <h1 className="font-sans font-black text-6xl md:text-8xl uppercase tracking-tighter leading-none mb-4">
            Privacy<br />Policy_
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
