import { Bot, Download, FileCode2, Zap } from 'lucide-react';

export default function AgentOnboardSection() {
  return (
    <section className="bg-black text-white py-24 border-b-8 border-black">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase bg-yellow text-black px-3 py-1.5 border-2 border-yellow mb-4">
              <Bot className="w-4 h-4" />
              FOR AI AGENTS &amp; BUILDERS
            </div>
            <h2 className="font-sans font-black text-5xl uppercase tracking-tighter text-white leading-tight">
              Onboard an Agent<br />in 60 Seconds.
            </h2>
            <p className="font-mono text-base text-gray-400 mt-4 max-w-xl">
              Drop <code className="bg-white/10 px-2 py-0.5 text-yellow text-sm">skills.md</code> into any agent's context window. It gets the full picture — API routes, data shapes, routing rules, and known issues — without reading the codebase.
            </p>
          </div>

          <a
            href="/skills.md"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-yellow text-black border-4 border-yellow font-mono font-black uppercase px-8 py-4 text-base shadow-[6px_6px_0px_rgba(255,255,255,0.3)] hover:translate-x-[6px] hover:translate-y-[6px] hover:shadow-none transition-all whitespace-nowrap shrink-0"
          >
            <Download className="w-5 h-5" />
            Download skills.md
          </a>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="border-2 border-white/20 p-6 bg-white/5 hover:bg-white/10 transition-colors">
            <FileCode2 className="w-8 h-8 text-yellow mb-4" strokeWidth={2} />
            <h3 className="font-mono font-black text-lg uppercase mb-2">Full API Reference</h3>
            <p className="font-mono text-sm text-gray-400 leading-relaxed">
              Every endpoint, query param, and response shape. The agent knows exactly what to call and what to expect back.
            </p>
          </div>

          <div className="border-2 border-white/20 p-6 bg-white/5 hover:bg-white/10 transition-colors">
            <Zap className="w-8 h-8 text-yellow mb-4" strokeWidth={2} />
            <h3 className="font-mono font-black text-lg uppercase mb-2">Data Shape Map</h3>
            <p className="font-mono text-sm text-gray-400 leading-relaxed">
              Normalizer outputs, hook-to-endpoint mapping, routing rules (<code className="bg-white/10 px-1 text-yellow text-xs">uid</code> vs <code className="bg-white/10 px-1 text-yellow text-xs">agentId</code>), and TrustScore formula.
            </p>
          </div>

          <div className="border-2 border-white/20 p-6 bg-white/5 hover:bg-white/10 transition-colors">
            <Bot className="w-8 h-8 text-yellow mb-4" strokeWidth={2} />
            <h3 className="font-mono font-black text-lg uppercase mb-2">Known Issues</h3>
            <p className="font-mono text-sm text-gray-400 leading-relaxed">
              Tracked bugs and TODOs with file locations. An incoming agent can patch gaps without context-building overhead.
            </p>
          </div>

        </div>

        {/* Code hint */}
        <div className="mt-10 border-2 border-white/20 p-5 bg-white/5 font-mono text-sm">
          <span className="text-gray-500 select-none mr-3">$</span>
          <span className="text-green-400">curl </span>
          <span className="text-yellow">https://8183explorer.xyz/skills.md</span>
          <span className="text-gray-500"> | cat  </span>
          <span className="text-gray-600"># or paste into system prompt directly</span>
        </div>

      </div>
    </section>
  );
}
