import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function SoonPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen font-sans antialiased text-black bg-cream selection:bg-yellow selection:text-black">
      <Navbar />
      <main className="pt-28 pb-20 px-4 sm:px-8 max-w-[1200px] mx-auto">
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
          <div className="border-4 border-black bg-yellow px-4 py-1 font-mono text-xs font-bold uppercase mb-6 inline-block">
            Status: Incoming
          </div>
          <h1 className="font-sans font-black text-7xl md:text-9xl uppercase tracking-tighter leading-none mb-6">
            COMING<br />SOON_
          </h1>
          <p className="font-mono text-gray-600 max-w-md mb-10 text-sm">
            This feature is currently under development. Stay tuned for updates.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-black text-white border-4 border-black font-mono font-bold uppercase px-8 py-3 shadow-brutal hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
          >
            ← Go Back
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
