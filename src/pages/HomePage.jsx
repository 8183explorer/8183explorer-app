import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import ProblemSection from '../components/ProblemSection';
import VerificationSection from '../components/VerificationSection';
import TrustScoreSection from '../components/TrustScoreSection';
import MonitoredEntities from '../components/MonitoredEntities';
import TokenTiers from '../components/TokenTiers';
import AgentOnboardSection from '../components/AgentOnboardSection';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <div className="font-sans antialiased selection:bg-yellow selection:text-black">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <VerificationSection />
      <TrustScoreSection />
      <MonitoredEntities />
      <TokenTiers />
      <AgentOnboardSection />
      <Footer />
    </div>
  );
}
