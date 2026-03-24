import { CheckCircle, AlertCircle, XOctagon } from 'lucide-react';

const StatusIcon = ({ status }) => {
  switch (status) {
    case 'verified':
      return <CheckCircle className="w-4 h-4" />;
    case 'caution':
      return <AlertCircle className="w-4 h-4" />;
    case 'blacklisted':
      return <XOctagon className="w-4 h-4" />;
    default:
      return null;
  }
};

const statusStyles = {
  verified: 'text-safe',
  caution: 'text-warning',
  blacklisted: 'text-danger',
};

const statusLabels = {
  verified: 'Verified',
  caution: 'Caution',
  blacklisted: 'Blacklisted',
};

const scoreBgMap = {
  verified: 'bg-safe text-white',
  caution: 'bg-warning text-black',
  blacklisted: 'bg-danger text-white',
};

export default function AgentCard({ agent, onViewReport }) {
  const { id, name, initial, score, tags, audits, tvl, status, flagged } = agent;

  return (
    <div className="border-4 border-black bg-white flex flex-col shadow-brutal hover:-translate-y-2 transition-transform">
      {/* Header */}
      <div className="border-b-4 border-black p-4 flex justify-between items-center bg-concrete">
        <span className="font-mono font-bold text-sm uppercase">ID: {id}</span>
        <div
          className={`${scoreBgMap[status]} px-2 py-1 font-mono font-bold text-sm border-2 border-black`}
        >
          {score}
        </div>
      </div>

      {/* Body */}
      <div className="p-6 flex-grow relative overflow-hidden">
        {/* DO NOT USE banner for flagged agents */}
        {flagged && (
          <div className="absolute -right-12 top-6 bg-danger text-white font-mono font-bold text-xs py-1 px-12 transform rotate-45 border-y-2 border-black z-10">
            DO NOT USE
          </div>
        )}

        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-10 h-10 ${
              flagged ? 'bg-danger' : 'bg-black'
            } text-white flex items-center justify-center font-mono font-bold text-xl border-2 border-black`}
          >
            {initial}
          </div>
          <h3 className="font-sans font-black text-2xl uppercase">{name}</h3>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-mono font-bold uppercase border-2 border-black px-2 py-1"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="space-y-2 font-mono text-sm mb-6">
          <div className="flex justify-between border-b-2 border-dashed border-gray-300 pb-1">
            <span className="text-gray-500">Audits</span>
            <span className={`font-bold ${statusStyles[status]}`}>{audits}</span>
          </div>
          <div className="flex justify-between border-b-2 border-dashed border-gray-300 pb-1">
            <span className="text-gray-500">TVL</span>
            <span className="font-bold">{tvl}</span>
          </div>
          <div className="flex justify-between pb-1">
            <span className="text-gray-500">Status</span>
            <span className={`font-bold ${statusStyles[status]} flex items-center gap-1`}>
              <StatusIcon status={status} /> {statusLabels[status]}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <button
        onClick={onViewReport}
        className="w-full bg-black text-white font-mono font-bold uppercase py-4 border-t-4 border-black hover:bg-yellow hover:text-black transition-colors"
      >
        View Report
      </button>
    </div>
  );
}
