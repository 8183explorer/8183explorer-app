const metrics = [
  { label: 'Code Audit (Smart Contract)', percentage: 40 },
  { label: 'On-Chain History', percentage: 30 },
  { label: 'Creator Identity / KYC', percentage: 20 },
  { label: 'Community Signal', percentage: 10 },
];

export default function TrustScoreSection() {
  return (
    <section className="bg-concrete py-24 border-b-8 border-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* Left side - Metrics */}
          <div className="lg:w-1/2">
            <div className="inline-block bg-black text-white px-4 py-2 font-mono font-bold text-sm uppercase mb-6 border-2 border-black">
              Metric Breakdown
            </div>
            <h2 className="font-sans font-black text-5xl md:text-6xl uppercase tracking-tighter mb-8 leading-none">
              The TrustScore
              <br />
              Algorithm.
            </h2>
            <p className="font-mono text-lg mb-8">
              A deterministic 0-100 rating system evaluating AI agents across code security, behavioral
              logic, and creator reputation.
            </p>

            <div className="space-y-6 font-mono border-4 border-black bg-white p-6 shadow-brutal-sm">
              {metrics.map((metric) => (
                <div key={metric.label}>
                  <div className="flex justify-between mb-2 font-bold uppercase text-sm">
                    <span>{metric.label}</span>
                    <span>{metric.percentage}%</span>
                  </div>
                  <div className="w-full h-4 bg-gray-200 border-2 border-black">
                    <div className="h-full bg-black" style={{ width: `${metric.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Score dial */}
          <div className="lg:w-1/2 flex justify-center w-full">
            <div className="relative w-full max-w-md aspect-square rounded-full border-8 border-black bg-white flex items-center justify-center shadow-brutal">
              {/* SVG ring */}
              <svg
                className="absolute inset-0 w-full h-full transform -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="transparent"
                  stroke="#E8E4E0"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="transparent"
                  stroke="#00CC66"
                  strokeWidth="8"
                  strokeDasharray="289"
                  strokeDashoffset="30"
                />
              </svg>

              {/* Center content */}
              <div className="text-center z-10 flex flex-col items-center">
                <span className="font-mono text-xl font-bold uppercase mb-2">Score</span>
                <span className="font-sans font-black text-8xl leading-none text-safe">92</span>
                <span className="bg-black text-white px-3 py-1 font-mono text-sm mt-4 uppercase border-2 border-black">
                  Verified Safe
                </span>
              </div>

              {/* Cross marks */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-12 bg-black" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-12 bg-black" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-4 bg-black" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-12 h-4 bg-black" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
