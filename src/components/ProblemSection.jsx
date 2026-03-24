import { useNavigate } from 'react-router-dom';
import { TriangleAlert, Skull, EyeOff, UserX } from 'lucide-react';

const threats = [
  {
    icon: Skull,
    iconBg: 'bg-danger',
    title: 'Malicious Code Exec',
    description:
      'Agents executing unverified trading strategies leading to direct wallet drain events. 42% of indexed agents contain critical flaws.',
  },
  {
    icon: EyeOff,
    iconBg: 'bg-warning',
    title: 'Black-Box Logic',
    description:
      'Zero visibility into the LLM prompts or decision weighting. Users are blindly trusting undocumented neural pathways.',
  },
  {
    icon: UserX,
    iconBg: 'bg-concrete',
    title: 'Anonymous Operators',
    description:
      'Unverified dev wallets holding massive admin privileges over agent proxy contracts. High rug-pull probability.',
  },
];

export default function ProblemSection() {
  const navigate = useNavigate();
  return (
    <section className="bg-black text-white py-32 border-b-8 border-black relative">
      <div className="h-4 w-full bg-hazard absolute top-0 left-0 border-b-4 border-black" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          {/* Left side */}
          <div className="lg:w-1/2">
            <TriangleAlert className="w-24 h-24 text-yellow mb-8" strokeWidth={2} />
            <h2 className="font-sans font-black text-6xl uppercase tracking-tighter mb-8 leading-none">
              Who audits
              <br />
              the machines?
            </h2>
            <p className="font-mono text-xl mb-12 max-w-xl leading-relaxed">
              Web3 AI agents operate with{' '}
              <span className="bg-yellow text-black px-2 font-bold">zero oversight</span>. Black-box
              decision making, unverified smart contracts, and anonymous creators have created a toxic
              ecosystem ripe for exploitation.
            </p>
            <button
              onClick={() => navigate('/docs')}
              className="bg-white text-black border-4 border-white font-mono font-bold uppercase px-8 py-4 text-xl hover:bg-black hover:text-white transition-colors"
            >
              Read Docs -&gt;
            </button>
          </div>

          {/* Right side - Threat cards */}
          <div className="lg:w-1/2 w-full grid gap-6">
            {threats.map((threat) => {
              const Icon = threat.icon;
              return (
                <div
                  key={threat.title}
                  className="border-4 border-white p-6 flex items-start gap-6 hover:bg-white hover:text-black transition-colors group"
                >
                  <div className={`${threat.iconBg} border-2 border-black p-3 shrink-0`}>
                    <Icon className="w-8 h-8 text-black" strokeWidth={3} />
                  </div>
                  <div>
                    <h3 className="font-mono font-bold text-2xl uppercase mb-2">{threat.title}</h3>
                    <p className="font-mono text-sm group-hover:text-black text-gray-400">
                      {threat.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
