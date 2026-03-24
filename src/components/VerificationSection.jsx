import { Crosshair, FileSearch, ShieldCheck } from 'lucide-react';

const steps = [
  {
    number: 1,
    icon: Crosshair,
    title: 'Search & Locate',
    description:
      "Enter any agent's contract address, ENS, or literal name into the terminal. Our indexers pull full on-chain history and associated repos.",
    action: 'Action: Input Query',
  },
  {
    number: 2,
    icon: FileSearch,
    title: 'Audit & Verify',
    description:
      'Automated static analysis on smart contracts combined with LLM behavior simulation. We test for edge cases, honey pots, and logic loops.',
    action: 'Action: Run Diagnostics',
  },
  {
    number: 3,
    icon: ShieldCheck,
    title: 'Hire Safe',
    description:
      'Review the generated TrustScore. Only delegate funds or permissions to agents that pass the threshold. Reject the rest.',
    action: 'Action: Execute TX',
  },
];

export default function VerificationSection() {
  return (
    <section className="bg-white py-32 border-b-8 border-black">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex justify-between items-end mb-16 border-b-4 border-black pb-8">
          <h2 className="font-sans font-black text-5xl uppercase tracking-tighter">
            Verification Protocol <span className="text-gray-400">v1.0</span>
          </h2>
          <p className="font-mono text-sm uppercase font-bold hidden md:block">
            Standard Operating Procedure
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="border-4 border-black bg-concrete p-8 relative flex flex-col justify-between min-h-[400px]"
              >
                {/* Step number badge */}
                <div className="absolute -top-6 -left-6 bg-yellow border-4 border-black w-16 h-16 flex items-center justify-center font-mono font-bold text-3xl shadow-brutal-sm">
                  {step.number}
                </div>

                <div>
                  <div className="w-16 h-16 border-4 border-black bg-white flex items-center justify-center mb-8">
                    <Icon className="w-8 h-8" strokeWidth={3} />
                  </div>
                  <h3 className="font-sans font-black text-3xl uppercase mb-4">{step.title}</h3>
                  <p className="font-mono text-sm leading-relaxed">{step.description}</p>
                </div>

                <div className="mt-8 pt-4 border-t-4 border-black font-mono text-xs font-bold uppercase">
                  {step.action}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
