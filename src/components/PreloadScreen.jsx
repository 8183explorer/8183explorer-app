import { useEffect, useState, useRef } from 'react';

const STATUS_MESSAGES = [
  'INITIALIZING SYSTEM',
  'LOADING MODULES',
  'CONNECTING TO NETWORK',
  'SCANNING BLOCKCHAIN',
  'VERIFYING CONTRACTS',
  'INDEXING AI AGENTS',
  'LOADING TRUST SCORES',
  'CALIBRATING RADAR',
  'ANALYZING ON-CHAIN DATA',
  'COMPILING AUDIT REPORTS',
  'SYSTEM READY',
];

function getBlocks(pct) {
  const total = 10;
  const filled = Math.round((pct / 100) * total);
  return '[' + '█'.repeat(filled) + '░'.repeat(total - filled) + ']';
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function PreloadScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [blockAlt, setBlockAlt] = useState(false);
  const [exiting, setExiting] = useState(false);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    const duration = 3800;
    function step(ts) {
      if (!startRef.current) startRef.current = ts;
      const raw = Math.min((ts - startRef.current) / duration, 1);
      const pct = Math.floor(easeInOutCubic(raw) * 100);
      setProgress(pct);
      if (raw < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setTimeout(() => {
          setExiting(true);
          setTimeout(() => onComplete?.(), 600);
        }, 500);
      }
    }
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    setStatusIndex(
      Math.min(Math.floor((progress / 100) * STATUS_MESSAGES.length), STATUS_MESSAGES.length - 1)
    );
  }, [progress]);

  useEffect(() => {
    const t = setInterval(() => setBlockAlt(v => !v), 150);
    return () => clearInterval(t);
  }, []);

  const blocks = getBlocks(progress);
  const frontierIdx = Math.round((progress / 100) * 10);
  let displayBlocks = blocks;
  if (frontierIdx > 0 && frontierIdx < 10) {
    const arr = blocks.slice(1, -1).split('');
    arr[frontierIdx - 1] = blockAlt ? '█' : '▓';
    displayBlocks = '[' + arr.join('') + ']';
  }

  return (
    <div
      className={`fixed inset-0 z-[9999] transition-opacity duration-500 ${
        exiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ fontFamily: "'Space Mono', monospace" }}
    >
      {/* ── Background grid ── */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: '#E8E4E0',
          backgroundImage:
            'linear-gradient(to right,rgba(0,0,0,0.06) 2px,transparent 2px),' +
            'linear-gradient(to bottom,rgba(0,0,0,0.06) 2px,transparent 2px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* ── Scanlines ── */}
      <div
        className="pointer-events-none absolute inset-0 z-50"
        style={{
          background:
            'linear-gradient(to bottom,rgba(255,255,255,0),rgba(255,255,255,0) 50%,rgba(0,0,0,0.05) 50%,rgba(0,0,0,0.05))',
          backgroundSize: '100% 4px',
        }}
      />

      {/* ── Hazard stripes ── */}
      <div
        className="absolute top-0 left-0 w-full border-b-4 border-black z-40"
        style={{
          height: 'clamp(20px, 3vw, 32px)',
          background: 'repeating-linear-gradient(-45deg,#F5C518,#F5C518 24px,#000 24px,#000 48px)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-full border-t-4 border-black z-40"
        style={{
          height: 'clamp(20px, 3vw, 32px)',
          background: 'repeating-linear-gradient(-45deg,#F5C518,#F5C518 24px,#000 24px,#000 48px)',
        }}
      />

      {/* ── DO NOT REFRESH badge ── */}
      <div
        className="absolute z-40 hidden sm:flex items-center gap-2 md:gap-3 lg:gap-4
          bg-red-500 border-4 border-black
          p-2 md:p-3 lg:p-4
          shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] lg:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
        style={{ top: 'clamp(40px,6vw,72px)', right: 'clamp(12px,4vw,64px)' }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="black"
          strokeWidth="3"
          strokeLinecap="square"
          strokeLinejoin="miter"
          style={{ width: 'clamp(18px,2.5vw,32px)', height: 'clamp(18px,2.5vw,32px)' }}
        >
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <line x1="12" x2="12" y1="9" y2="13" />
          <line x1="12" x2="12.01" y1="17" y2="17" />
        </svg>
        <span
          className="font-bold uppercase tracking-widest text-black whitespace-nowrap"
          style={{ fontSize: 'clamp(0.65rem,1.5vw,1.5rem)' }}
        >
          DO NOT REFRESH
        </span>
      </div>

      {/* ── Scrollable centering wrapper ── */}
      <div
        className="absolute inset-0 z-20 flex items-center justify-center overflow-y-auto"
        style={{ padding: 'clamp(28px,5vw,56px) clamp(8px,2vw,16px)' }}
      >
        {/* ── Main card ── */}
        <div
          className="bg-white border-4 border-black w-full flex flex-col items-center relative"
          style={{
            maxWidth: '1100px',
            padding: 'clamp(16px,3.5vw,64px)',
            boxShadow: 'clamp(6px,1.5vw,32px) clamp(6px,1.5vw,32px) 0px 0px rgba(0,0,0,1)',
          }}
        >

          {/* ── Logo + Title ── */}
          <div
            className="flex flex-row items-center justify-center w-full"
            style={{ gap: 'clamp(12px,2vw,32px)', marginBottom: 'clamp(16px,3vw,48px)' }}
          >
            {/* Radar icon */}
            <div
              className="relative border-4 border-black bg-white overflow-hidden shrink-0"
              style={{
                width: 'clamp(48px,8vw,112px)',
                height: 'clamp(48px,8vw,112px)',
                boxShadow: 'clamp(3px,0.8vw,8px) clamp(3px,0.8vw,8px) 0px 0px rgba(0,0,0,1)',
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    'linear-gradient(to right,rgba(0,0,0,0.15) 2px,transparent 2px),' +
                    'linear-gradient(to bottom,rgba(0,0,0,0.15) 2px,transparent 2px)',
                  backgroundSize: '16px 16px',
                }}
              />
              <div className="absolute top-0 bottom-0 left-1/2 w-[3px] bg-black -translate-x-1/2" />
              <div className="absolute left-0 right-0 top-1/2 h-[3px] bg-black -translate-y-1/2" />
              <div
                className="absolute inset-[-100%]"
                style={{
                  background: 'conic-gradient(from 0deg,transparent 75%,rgba(0,204,102,0.85) 100%)',
                  animation: 'radar-sweep 2s linear infinite',
                  transformOrigin: 'center',
                }}
              >
                <div className="absolute top-0 bottom-1/2 left-1/2 w-[3px] bg-[#00CC66] -translate-x-1/2" />
              </div>
              <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-black -translate-x-1/2 -translate-y-1/2" />
            </div>

            {/* Title */}
            <h1
              className="font-black tracking-tighter uppercase leading-none"
              style={{
                fontSize: 'clamp(1.8rem,7.5vw,7rem)',
                color: 'white',
                WebkitTextStroke: 'clamp(1.5px,0.35vw,4px) black',
                textShadow:
                  'clamp(3px,0.7vw,8px) clamp(3px,0.7vw,8px) 0px black',
              }}
            >
              8183EXPLORER
              <span
                className="inline-block text-black"
                style={{
                  WebkitTextStroke: '0px',
                  textShadow: 'none',
                  animation: 'custom-blink 1s infinite',
                }}
              >
                _
              </span>
            </h1>
          </div>

          {/* ── Percentage ── */}
          <div
            className="font-black tracking-tighter text-black w-full text-center flex justify-center items-center relative z-20"
            style={{
              fontSize: 'clamp(4rem,22vw,19rem)',
              lineHeight: 0.85,
              marginBottom: 'clamp(12px,2.5vw,32px)',
            }}
          >
            <span className="relative">
              {progress}%
              <span
                className="absolute select-none -z-10 text-black"
                style={{ opacity: 0.08, top: '4%', left: '6%' }}
                aria-hidden="true"
              >
                {progress}%
              </span>
            </span>
          </div>

          {/* ── Progress bar ── */}
          <div
            className="w-full border-4 border-black relative overflow-hidden bg-[#F5C518]"
            style={{
              height: 'clamp(24px,3.5vw,48px)',
              marginBottom: 'clamp(12px,2.5vw,48px)',
              boxShadow: 'clamp(4px,1vw,12px) clamp(4px,1vw,12px) 0px 0px rgba(0,0,0,1)',
            }}
          >
            {/* Diagonal texture */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background:
                  'repeating-linear-gradient(45deg,transparent,transparent 10px,#000 10px,#000 20px)',
              }}
            />
            {/* Fill */}
            <div
              className="absolute left-0 top-0 h-full bg-black"
              style={{ width: `${progress}%` }}
            />
            {/* Leading edge cursor */}
            {progress > 0 && progress < 100 && (
              <div
                className="h-full bg-[#F5C518] absolute z-10"
                style={{ width: 'clamp(3px,0.5vw,8px)', left: `calc(${progress}% - 2px)` }}
              />
            )}
          </div>

          {/* ── Block indicator ── */}
          <div
            className="font-bold text-center text-black w-full overflow-hidden"
            style={{
              fontSize: 'clamp(1.4rem,5vw,4.5rem)',
              letterSpacing: 'clamp(0.05em,0.3vw,0.15em)',
              whiteSpace: 'nowrap',
              marginBottom: 'clamp(12px,2.5vw,40px)',
            }}
          >
            {displayBlocks}
          </div>

          {/* ── Status terminal ── */}
          <div
            className="w-full bg-black border-4 border-black flex items-center justify-between"
            style={{
              padding: 'clamp(10px,1.8vw,32px)',
              gap: 'clamp(8px,1.5vw,24px)',
              boxShadow: 'clamp(4px,1vw,16px) clamp(4px,1vw,16px) 0px 0px #F5C518',
            }}
          >
            {/* Left: badge + message */}
            <div
              className="flex items-center min-w-0"
              style={{ gap: 'clamp(8px,1.5vw,24px)' }}
            >
              <span
                className="bg-[#F5C518] text-black font-bold border-4 border-black shrink-0 uppercase tracking-widest"
                style={{
                  padding: 'clamp(4px,0.5vw,8px) clamp(6px,1vw,16px)',
                  fontSize: 'clamp(0.55rem,1.4vw,1.25rem)',
                }}
              >
                SYS.OP
              </span>
              <div className="flex items-center min-w-0" style={{ gap: 'clamp(4px,0.5vw,8px)' }}>
                <span
                  className="text-[#00CC66] font-bold uppercase tracking-widest truncate"
                  style={{ fontSize: 'clamp(0.7rem,2.2vw,3rem)' }}
                >
                  {STATUS_MESSAGES[statusIndex]}
                </span>
                <span
                  className="text-[#00CC66] font-bold shrink-0"
                  style={{
                    fontSize: 'clamp(0.7rem,2.2vw,3rem)',
                    animation: 'custom-blink 1s infinite',
                  }}
                >
                  ...
                </span>
              </div>
            </div>

            {/* Right: blinking cursor block */}
            <div
              className="bg-[#00CC66] border-2 border-black shrink-0"
              style={{
                width: 'clamp(14px,1.8vw,32px)',
                height: 'clamp(20px,3vw,48px)',
                animation: 'custom-blink 1s infinite',
              }}
            />
          </div>

        </div>
      </div>

      <style>{`
        @keyframes radar-sweep {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes custom-blink {
          0%,49%  { opacity: 1; }
          50%,100%{ opacity: 0; }
        }
      `}</style>
    </div>
  );
}
