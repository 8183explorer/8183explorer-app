import { useNavigate } from 'react-router-dom';
import { useAgents } from '../hooks/useAgents.js';
import AgentCard from './AgentCard';

const scoreBgMap = (score) => {
  if (score >= 80) return { bg: 'bg-safe text-white', status: 'verified' };
  if (score >= 50) return { bg: 'bg-warning text-black', status: 'caution' };
  return { bg: 'bg-danger text-white', status: 'blacklisted' };
};

export default function MonitoredEntities() {
  const navigate = useNavigate();
  const { data, isLoading } = useAgents({ sort: 'score', page: 1, limit: 4 });
  const liveAgents = data?.agents || [];

  // Map real hook data to the AgentCard format
  const cards = liveAgents.map((a) => {
    const { status, bg } = scoreBgMap(a.trustScore ?? 0);
    return {
      id: a.wallet ? `${a.wallet.slice(0, 6)}...${a.wallet.slice(-2)}` : `#${a.agentId}`,
      name: a.name || `Agent #${a.agentId}`,
      initial: (a.name || 'A')[0].toUpperCase(),
      score: a.trustScore ?? 0,
      tags: (a.categories || ['Unknown']).slice(0, 2).map(c => c.toUpperCase()),
      audits: (a.badges || []).includes('VERIFIED') ? 'Passed' : (a.badges || []).includes('WARNING') ? 'Failed' : 'Pending',
      tvl: 'On-chain',
      status,
      flagged: (a.badges || []).includes('WARNING'),
      agentId: Number(a.agentId),
    };
  });

  return (
    <section className="bg-white py-32 border-b-8 border-black">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex justify-between items-end mb-16">
          <div>
            <h2 className="font-sans font-black text-5xl uppercase tracking-tighter mb-4">
              Monitored Entities.
            </h2>
            <p className="font-mono text-lg max-w-2xl">
              Live feed of actively traded and utilized AI agents across supported networks.
            </p>
          </div>
          <button
            onClick={() => navigate('/database')}
            className="hidden md:block bg-white border-4 border-black font-mono font-bold uppercase px-6 py-3 shadow-brutal-sm hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
          >
            View Full Terminal
          </button>
        </div>

        {/* Agent grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border-4 border-black bg-white animate-pulse h-64 shadow-brutal" />
              ))
            : cards.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onViewReport={() => navigate(`/agent/${agent.agentId}`)}
                />
              ))
          }
        </div>

        {/* Mobile button */}
        <button
          onClick={() => navigate('/database')}
          className="md:hidden mt-8 w-full bg-white border-4 border-black font-mono font-bold uppercase px-6 py-4 shadow-brutal-sm"
        >
          View Full Terminal
        </button>
      </div>
    </section>
  );
}
