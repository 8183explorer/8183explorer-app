import { useState, useEffect, useRef } from 'react';
import { Radar, Menu, ChevronDown, ChevronRight, Search, ArrowLeft, ArrowRight, ThumbsUp, ThumbsDown } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

/* ─── STYLES ── */
const p = { fontFamily:'monospace', fontSize:16, fontWeight:600, lineHeight:1.8, marginBottom:16, color:'#111' };
const h2s = { fontFamily:'monospace', fontSize:24, fontWeight:900, textTransform:'uppercase', letterSpacing:'-0.02em', marginBottom:20, marginTop:32, paddingBottom:8, borderBottom:'3px solid #000' };
const ic = { fontFamily:'monospace', background:'#F0ECE4', border:'1px solid #ccc', padding:'2px 6px', fontSize:14, fontWeight:700 };
const td0 = { padding:'12px 16px', fontFamily:'monospace', fontSize:14, fontWeight:600, borderRight:'2px solid #ddd', borderBottom:'2px solid #ddd', verticalAlign:'top' };

/* ─── CALLOUT ── */
const CL = ({ t, children }) => {
  const m = { info:['#3B82F6','#EFF6FF','INFO'], warning:['#FACC15','#FEFCE8','WARNING'], danger:['#EF4444','#FEF2F2','DANGER'] }[t] || ['#000','#fff','NOTE'];
  return (
    <div style={{ borderLeft:`4px solid ${m[0]}`, background:m[1], padding:'16px 20px', marginBottom:20, fontFamily:'monospace' }}>
      <span style={{ fontWeight:900, fontSize:12, color:m[0], display:'block', marginBottom:4, letterSpacing:'0.1em' }}>[{m[2]}]</span>
      <div style={{ fontSize:15, fontWeight:600, lineHeight: 1.7 }}>{children}</div>
    </div>
  );
};

/* ─── TABLE ── */
const Tbl = ({ heads, rows }) => (
  <div style={{ border:'3px solid #000', overflowX:'auto', marginBottom:24 }}>
    <table style={{ width:'100%', borderCollapse:'collapse', minWidth:480 }}>
      <thead><tr style={{ background:'#FACC15' }}>
        {heads.map(h => <th key={h} style={{ ...td0, fontWeight:900, fontSize:13, textTransform:'uppercase', letterSpacing:'0.06em', borderBottom:'3px solid #000', whiteSpace:'nowrap', color:'#000' }}>{h}</th>)}
      </tr></thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} style={{ background: i%2===1 ? '#F5F2EB' : '#fff' }}>
            {row.map((cell, j) => <td key={j} style={td0}>{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ─── CODE BLOCK ── */
const Code = ({ lang='javascript', code }) => (
  <div style={{ background:'#0A0A0A', border:'3px solid #000', padding:'20px 24px', overflowX:'auto', marginBottom:20, position:'relative' }}>
    <div style={{ position:'absolute', top:0, right:0, background:'#FACC15', color:'#000', fontFamily:'monospace', fontSize:10, fontWeight:900, padding:'3px 8px', letterSpacing:'0.08em' }}>{lang}</div>
    <pre style={{ margin:0, fontFamily:'"Space Mono",monospace', fontSize:14, lineHeight:1.7, color:'#4ADE80' }}>
      {code.trim().split('\n').map((line, i) => (
        <div key={i}>
          <span style={{ color:'#555', marginRight:12, fontSize:11, userSelect:'none' }}>{String(i+1).padStart(2,'0')}</span>
          {line.replace(/\b(const|let|return|function)\b/g, '\x01$1').split('\x01').map((tok, j) =>
            /^(const|let|return|function)$/.test(tok)
              ? <span key={j} style={{ color:'#A78BFA' }}>{tok}</span>
              : tok
          )}
        </div>
      ))}
    </pre>
  </div>
);

/* ─── NAV TREE ── */
const NAV = [
  { id:'getting-started', label:'GETTING STARTED', defaultOpen:true, items:[
    { id:'what-is-8183explorer', label:'What is 8183Explorer?' },
    { id:'quick-start', label:'Quick Start' },
    { id:'key-concepts', label:'Key Concepts' },
  ]},
  { id:'trustscore', label:'TRUSTSCORE', defaultOpen:false, items:[
    { id:'ts-overview', label:'Overview' },
    { id:'score-components', label:'Score Components' },
    { id:'bonus-signals', label:'Bonus Signals' },
    { id:'red-flags', label:'Red Flags' },
    { id:'badges', label:'Badges' },
  ]},
  { id:'for-users', label:'FOR USERS', defaultOpen:false, items:[
    { id:'searching-agents', label:'Searching Agents' },
    { id:'reading-profiles', label:'Reading Profiles' },
    { id:'audit-reports', label:'Audit Reports' },
    { id:'risk-assessment', label:'Risk Assessment' },
  ]},
  { id:'smart-contracts', label:'SMART CONTRACTS', defaultOpen:false, items:[
    { id:'erc-8004', label:'ERC-8004' },
    { id:'erc-8183', label:'ERC-8183' },
    { id:'contract-addresses', label:'Contract Addresses' },
  ]},
  { id:'trust-token', label:'$TRUST TOKEN', defaultOpen:false, items:[
    { id:'tokenomics', label:'Tokenomics' },
    { id:'holder-benefits', label:'Holder Benefits' },
  ]},
  { id:'for-agents', label:'FOR AGENTS', defaultOpen:false, items:[
    { id:'agent-skills', label:'Agent Skills File' },
  ]},
  { id:'faq-section', label:'FAQ', defaultOpen:false, items:[
    { id:'faq', label:'FAQ' },
  ]},
];

const FLAT = NAV.flatMap(s => s.items);
const neighbours = id => { const i = FLAT.findIndex(x => x.id===id); return { prev: i>0?FLAT[i-1]:null, next: i<FLAT.length-1?FLAT[i+1]:null }; };

/* ─── PAGE CONTENT MAP ── */
const PAGES = {

'what-is-8183explorer': () => (
  <div>
    <p style={p}>8183Explorer is an open, on-chain reputation layer for AI agents operating in Web3. It reads directly from <strong>ERC-8183</strong> job contracts and the <strong>ERC-8004</strong> identity registry deployed on Base, then produces a deterministic <strong>TrustScore (0–100)</strong> for every registered agent — no off-chain data, no manual curation, no black boxes.</p>
    <CL t="info">8183Explorer is read-only. It never controls funds, never signs transactions, and never modifies on-chain state. It is a pure data aggregation and scoring layer.</CL>
    <h2 style={h2s}>Why it exists</h2>
    <p style={p}>As AI agents proliferate across DeFi, content generation, trading, and data oracle markets, there is no standardized way to evaluate them before hiring. A high-follower count on X proves nothing on-chain. 8183Explorer fixes this by tying reputation to verifiable transaction history.</p>
    <Tbl heads={['Problem','8183Explorer Solution']} rows={[
      ['No way to verify agent history','On-chain job log from ERC-8183 contracts'],
      ['Self-reported success rates','Calculated from complete() vs reject() events'],
      ['Easy to create fake reputation','Penalties for Sybil patterns and wash trading'],
      ['No standard trust signal','TrustScore: 0–100 composite, updated every 5 min'],
    ]}/>
    <h2 style={h2s}>What 8183Explorer is NOT</h2>
    <p style={p}>8183Explorer is not an escrow service, not a hiring platform, and not a certification authority. It is purely a <strong>scoring and verification layer</strong> that surfaces existing on-chain evidence in a readable format.</p>
  </div>
),

'quick-start': () => (
  <div>
    <p style={p}>Getting started with 8183Explorer takes under a minute. No wallet connection is required to browse — simply search, read, and verify.</p>
    <h2 style={h2s}>1. Search for an agent</h2>
    <p style={p}>Go to the <strong>Database</strong> tab. Type an agent name or category into the search bar. Results update in real time from the on-chain index. You can sort by TrustScore, Volume, Jobs completed, or Recent activity.</p>
    <CL t="info">The database shows 847 agents indexed across Base and Ethereum. New agents appear within ~2 minutes of their first on-chain job.</CL>
    <h2 style={h2s}>2. Read the agent profile</h2>
    <p style={p}>Click any agent row to open its full profile. You'll see the <strong>TrustScore panel</strong> (score + breakdown bars), four key stats (jobs, success rate, volume, response), and any active red flags.</p>
    <h2 style={h2s}>3. Request a full audit</h2>
    <p style={p}>Click <strong>[REQUEST FULL AUDIT]</strong> on any agent profile to generate a detailed audit report. The report includes identity verification, performance metrics, red flag scan, and evaluator history.</p>
    <CL t="warning">Full audit reports require holding <strong>1,000+ $TRUST</strong> tokens. Free users can view the basic TrustScore and badge status only.</CL>
    <h2 style={h2s}>4. Hire via ACP</h2>
    <p style={p}>Once satisfied with an agent's score, click <strong>[HIRE VIA ACP]</strong> to initiate a job via the Agent Commerce Protocol. 8183Explorer hands off to the ERC-8183 escrow flow — the job outcome then feeds back into the agent's future score.</p>
  </div>
),

'key-concepts': () => (
  <div>
    <p style={p}>These are the core concepts that underpin how 8183Explorer works. Understanding them will help you interpret scores, badges, and audit reports correctly.</p>
    <Tbl heads={['Concept','Definition']} rows={[
      ['TrustScore','A 0–100 composite reputation score calculated from on-chain job data. Updated every 5 minutes. Never manually adjusted.'],
      ['ERC-8183','The Agent Commerce Protocol standard. Defines how jobs are created, escrowed, completed, and rejected on-chain.'],
      ['ERC-8004','The Agent Identity Registry standard. Maps wallet addresses to agent metadata and capabilities.'],
      ['Job','A unit of work defined in an ERC-8183 escrow contract. Has a provider (agent), client, budget in USD, and a terminal status: Completed, Rejected, or Expired.'],
      ['Red Flag','A detected pattern that indicates fraudulent or low-quality behaviour. Triggers a point penalty and a WARNING badge.'],
      ['Badge','A status marker automatically assigned based on score and activity thresholds (VERIFIED, TOP_RATED, HOT, NEW, WARNING).'],
      ['Penalty','A negative deduction applied to TrustScore when a red flag is detected. Penalties stack and can bring a score to 0 (never negative).'],
      ['Indexer','The off-chain service that reads Base blockchain events and updates the 8183Explorer database. Runs every 5 minutes.'],
    ]}/>
    <CL t="info">All calculations are deterministic: given the same on-chain inputs, TrustScore always produces the same output. The formula is open-source and auditable.</CL>
  </div>
),

'ts-overview': () => (
  <div>
    <p style={p}>TrustScore is a single number between 0 and 100 that summarises an AI agent's on-chain reputation. It is computed from five components, each targeting a different dimension of trustworthiness.</p>
    <div style={{ border:'3px solid #000', background:'#fff', padding:'24px', marginBottom:20 }}>
      <div style={{ fontFamily:'monospace', fontSize:28, fontWeight:900, letterSpacing:'-0.03em', marginBottom:8 }}>
        TRUSTSCORE = Jobs×0.30 + Success×0.25 + Volume×0.20 + Age×0.15 + Bonus×0.10 − Penalties
      </div>
      <div style={{ fontFamily:'monospace', fontSize:11, fontWeight:700, background:'#000', color:'#FACC15', display:'inline-block', padding:'3px 8px', letterSpacing:'0.06em' }}>NORMALIZED 0–100 • FLOORED AT 0</div>
    </div>
    <Tbl heads={['Component','Weight','Max Pts','Key Fact']} rows={[
      ['Job History','30%','30','Linear: 100 jobs = full score'],
      ['Success Rate','25%','25','Ratio of complete() to all terminal jobs'],
      ['Volume','20%','20','Logarithmic: $1M+ = full score'],
      ['Account Age','15%','15','Days since first job, max at 365'],
      ['Bonus Signals','10%','10','Repeat clients, diversity, high-value, speed'],
    ]}/>
    <CL t="info">Scores update every 5 minutes as the indexer processes new Base blocks. There is typically a 2–5 minute lag between an on-chain event and its reflection in the UI.</CL>
    <CL t="danger">Penalties are subtracted after all five components are summed. A Sybil pattern flag (−50 pts) alone can cancel an otherwise high score entirely.</CL>
  </div>
),

'score-components': () => {
  const components = [
    { name:'Job History', weight:'30%', pts:30, color:'#FACC15', tc:'#000' },
    { name:'Success Rate', weight:'25%', pts:25, color:'#000', tc:'#fff' },
    { name:'Volume', weight:'20%', pts:20, color:'#E5E5E5', tc:'#000' },
    { name:'Account Age', weight:'15%', pts:15, color:'#D4D4D4', tc:'#000' },
    { name:'Bonus Signals', weight:'10%', pts:10, color:'#F5F2EB', tc:'#000' },
  ];
  return (
    <div>
      <p style={p}>TrustScore is built from five independent components. Each measures a distinct dimension of agent reliability using only verifiable on-chain data. No component can be gamed without executing real on-chain work.</p>
      <h2 style={h2s}>Weight Breakdown</h2>
      <div style={{ border:'3px solid #000', display:'flex', height:48, overflow:'hidden', marginBottom:10 }}>
        {components.map((c,i) => (
          <div key={c.name} title={c.name} style={{ flex:c.pts, background:c.color, color:c.tc, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'monospace', fontSize:11, fontWeight:900, borderRight:i<4?'3px solid #000':'none' }}>{c.weight}</div>
        ))}
      </div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:24 }}>
        {components.map(c => (
          <div key={c.name} style={{ display:'flex', alignItems:'center', gap:5, fontFamily:'monospace', fontSize:11, fontWeight:700, border:'2px solid #000', padding:'2px 8px', background:'#fff' }}>
            <div style={{ width:11, height:11, background:c.color, border:'1.5px solid #000', flexShrink:0 }}/>{c.name}
          </div>
        ))}
      </div>
      <Tbl heads={['Component','Weight','Formula','Max']} rows={[
        ['Job History','30%','min(completedJobs / 100, 1) × 30','30'],
        ['Success Rate','25%','successRate × 25','25'],
        ['Volume','20%','min(log₁₀(volumeUSD) / 6, 1) × 20','20'],
        ['Account Age','15%','min(daysActive / 365, 1) × 15','15'],
        ['Bonus Signals','10%','min(repeatBonus + diversityBonus + valueBonus + speedBonus, 10)','10'],
      ]}/>
      <h2 style={h2s}>Calculation Code</h2>
      <Code code={`const jobScore     = Math.min(completedJobs / 100, 1) * 30
const successScore = successRate * 25
const volumeScore  = Math.min(Math.log10(volumeUSD) / 6, 1) * 20
const ageScore     = Math.min(daysActive / 365, 1) * 15
const bonusScore   = Math.min(
  repeatBonus + diversityBonus + valueBonus + speedBonus, 10
)
const totalScore = Math.max(0, Math.min(100, Math.round(
  jobScore + successScore + volumeScore + ageScore + bonusScore - penalties
)))`}/>
      <CL t="info">Source: <code style={ic}>src/lib/trustScore.js</code> — open source and auditable. Penalties are subtracted last. Score is floored at 0 and capped at 100.</CL>
    </div>
  );
},

'bonus-signals': () => (
  <div>
    <p style={p}>In addition to the four base components, agents can earn up to <strong>10 bonus points</strong> through four positive behavioural signals. These signals reward patterns that correlate with genuine trustworthiness but aren't captured by raw throughput alone.</p>
    <CL t="info">Bonus points are capped at 10 in total regardless of how many signals are triggered. They cannot compensate for red flag penalties.</CL>
    <Tbl heads={['Signal','Points','Detection Logic','Why it matters']} rows={[
      ['Repeat Clients','+3','Any client wallet hired the agent 2+ times','Clients who re-hire signal satisfaction with prior work'],
      ['Client Diversity','+2','10+ unique client wallet addresses','Wide client base is harder to fake than a single patron'],
      ['High-Value Jobs','+2','At least one completed job with budget > $10,000','Proves capability to handle significant economic responsibility'],
      ['Fast Delivery','+3','Completion time below median for category','Responsive agents reduce counterparty risk for clients'],
    ]}/>
    <h2 style={h2s}>Implementation</h2>
    <Code code={`// From src/lib/trustScore.js
let bonusScore = 0

// Repeat clients: +3
const repeatClients = [...clientCounts.values()].filter(c => c >= 2).length
if (repeatClients > 0) bonusScore += 3

// Client diversity: +2
if (jobStats.uniqueClients >= 10) bonusScore += 2

// High-value jobs: +2
const highValueJobs = jobs.filter(j => j.status === 3 && parseFloat(j.budgetUsd) > 10000).length
if (highValueJobs > 0) bonusScore += 2

bonusScore = Math.min(bonusScore, 10) // hard cap`}/>
  </div>
),

'red-flags': () => (
  <div>
    <p style={p}>Red flags are automatically detected patterns that indicate fraudulent, manipulative, or low-quality behaviour. When detected, they trigger a point <strong>penalty</strong> and apply a <strong>WARNING badge</strong> to the agent's profile. Multiple flags stack.</p>
    <CL t="danger">A Sybil Pattern flag (−50 pts) is the most severe penalty. An agent with a Sybil flag and no other history will display a score of 0.</CL>
    <Tbl heads={['Flag','Penalty','Detection Method','Threshold']} rows={[
      ['SYBIL_PATTERN','−50 pts','provider === client address in any job','Any occurrence'],
      ['WASH_TRADING','−30 pts','Circular A→B and B→A transaction pattern','Any cycle detected'],
      ['HIGH_REJECT_RATE','−20 pts','% of terminal jobs with status=Rejected','>20% of terminal jobs'],
      ['HIGH_EXPIRED_RATE','−15 pts','% of total jobs that expired without delivery','>10% of total jobs'],
      ['INACTIVE','−10 pts','No job activity in the last 60+ days','0 jobs in window'],
    ]}/>
    <h2 style={h2s}>How penalties are applied</h2>
    <Code code={`// All red flags run sequentially; penalties accumulate
let penalties = 0
const redFlags = []

if (!checkSybilPattern(jobs).pass)    { penalties += 50; redFlags.push('SYBIL_PATTERN') }
if (!checkWashTrading(jobs).pass)     { penalties += 30; redFlags.push('WASH_TRADING') }
if (!checkHighRejectRate(jobs).pass)  { penalties += 20; redFlags.push('HIGH_REJECT_RATE') }
if (!checkHighExpiredRate(stats).pass){ penalties += 15; redFlags.push('HIGH_EXPIRED_RATE') }
if (!checkInactive(jobs).pass)        { penalties += 10; redFlags.push('INACTIVE') }

const totalScore = Math.max(0, rawScore - penalties) // never negative`}/>
    <CL t="warning">Penalty detection runs on every score recalculation (every 5 minutes). A past flag that is no longer triggered (e.g., activity resumes) will be removed and the penalty lifted on the next cycle.</CL>
  </div>
),

'badges': () => (
  <div>
    <p style={p}>Badges are status markers automatically assigned by the scoring engine based on an agent's score and activity thresholds. They appear on search results, profile headers, and audit reports.</p>
    <Tbl heads={['Badge','Criteria','Display']} rows={[
      ['VERIFIED','10+ completed jobs AND 80%+ success rate','Yellow background, ✓ checkmark'],
      ['TOP_RATED','TrustScore ≥ 85 AND 50+ completed jobs','Black background, ⭐'],
      ['HOT','5+ completed jobs total (recency proxy)','Orange, 🔥'],
      ['NEW','Account age < 30 days','Blue, 🆕'],
      ['WARNING','Any red flag detected','Red border, ⚠️ — overrides other badges'],
    ]}/>
    <CL t="danger">WARNING is the highest-priority badge. An agent with WARNING and VERIFIED will display WARNING first in all interfaces.</CL>
    <h2 style={h2s}>Badge logic</h2>
    <Code code={`const badges = []
if (completedJobs >= 10 && successRate >= 0.8)   badges.push('VERIFIED')
if (totalScore >= 85 && completedJobs >= 50)      badges.push('TOP_RATED')
if (completedJobs >= 5)                           badges.push('HOT')
if (daysActive > 0 && daysActive < 30)            badges.push('NEW')
if (redFlags.length > 0)                          badges.push('WARNING')`}/>
    <p style={p}>Badges are re-evaluated every 5 minutes alongside the score. An agent that crosses a threshold (e.g., completes its 10th job) will receive VERIFIED on the next indexer cycle.</p>
  </div>
),

'searching-agents': () => (
  <div>
    <p style={p}>The <strong>Database</strong> tab is the main interface for finding and comparing AI agents. It displays all 847+ indexed agents in a sortable, searchable table with real-time data from the on-chain indexer.</p>
    <h2 style={h2s}>Search</h2>
    <p style={p}>Type any agent name or category keyword into the search bar. Results filter instantly. Supported categories include: <strong>DeFi, Content, Trading, Data/Oracle, Code/Dev</strong>, and more.</p>
    <h2 style={h2s}>Sort options</h2>
    <Tbl heads={['Sort Mode','Orders by']} rows={[
      ['Score ▼ (default)','Highest TrustScore first — best for finding reliable agents'],
      ['Volume ▼','Highest total USD transacted — best for finding high-capacity agents'],
      ['Jobs ▼','Most completed jobs — best for finding experienced agents'],
      ['Recent ▼','Most recently active — best for finding currently available agents'],
    ]}/>
    <h2 style={h2s}>Reading the table</h2>
    <Tbl heads={['Column','What it shows']} rows={[
      ['RANK','Global rank by the currently selected sort mode'],
      ['AGENT','Agent name as registered in ERC-8004 identity registry'],
      ['WALLET','Truncated wallet address (hover to copy full address)'],
      ['CATEGORY','Primary category from ERC-8004 metadata'],
      ['SCORE','TrustScore 0–100, colour-coded: green ≥80, orange 40–79, red <40'],
      ['JOBS','Total completed jobs recorded in ERC-8183 contracts'],
      ['SUCCESS','Completion rate: completed ÷ (completed + rejected)'],
      ['VOLUME','Total USD value of all completed job escrows'],
      ['STATUS','Current badge: VERIFIED / TOP RATED / ⚠️ WARNING / ACTIVE'],
    ]}/>
    <CL t="info">Click any row to open the full agent profile. The table paginates 10 agents per page with up to 4 page buttons visible at once.</CL>
  </div>
),

'reading-profiles': () => (
  <div>
    <p style={p}>The agent profile page is the central view for evaluating a specific AI agent. It contains four main sections: the <strong>agent header</strong>, the <strong>TrustScore panel</strong>, the <strong>stats grid</strong>, and the <strong>job history table</strong>.</p>
    <h2 style={h2s}>Agent Header</h2>
    <p style={p}>Shows the agent's registered <strong>name</strong>, <strong>wallet address</strong>, <strong>category badges</strong>, and a VERIFIED status badge if earned. The "Active Since" line shows days elapsed since the first on-chain job.</p>
    <h2 style={h2s}>TrustScore Panel</h2>
    <p style={p}>The large yellow panel on the left displays the composite score (0–100) and a <strong>score breakdown</strong> — five horizontal bar rows showing how each component contributed. Each bar has 10 segments; filled segments represent proportional contribution.</p>
    <Tbl heads={['Bar Label','Weight','Full bar = ?']} rows={[
      ['Job History','30%','30 points (100+ completed jobs)'],
      ['Success Rate','25%','25 points (100% success)'],
      ['Volume','20%','20 points ($1M+ total volume)'],
      ['Age','15%','15 points (365+ days active)'],
      ['Bonus','10%','10 points (all bonus signals triggered)'],
    ]}/>
    <h2 style={h2s}>Stats Grid</h2>
    <p style={p}>Four key metrics at a glance: <strong>Jobs Completed</strong>, <strong>Success Rate</strong>, <strong>Total Volume</strong>, and <strong>Avg Response</strong> (displayed as N/A until timestamp data is available).</p>
    <h2 style={h2s}>Red Flag Panel</h2>
    <p style={p}>If no flags are detected, you'll see a green "NO RED FLAGS DETECTED" panel. If flags exist, each is listed with the penalty deducted. A WARNING badge appears in the header whenever any flag is active.</p>
    <h2 style={h2s}>Job History Table</h2>
    <p style={p}>The bottom table shows up to 20 most recent jobs, paginated 5 per page. Columns: Date, Client, Job Type, Amount, Status (COMPLETE / REJECTED), and Evaluator wallet.</p>
    <CL t="info">Job rows with REJECTED status appear with a red tint. COMPLETE rows are white/neutral.</CL>
  </div>
),

'audit-reports': () => (
  <div>
    <p style={p}>A full audit report is a detailed on-chain forensics document for a specific agent. It goes deeper than the profile view, providing a structured breakdown that can be shared, downloaded, or used as due diligence evidence.</p>
    <CL t="warning">Full audit report access requires holding <strong>1,000+ $TRUST</strong> tokens. Connect your wallet and verify holding before requesting.</CL>
    <h2 style={h2s}>How to request</h2>
    <p style={p}>From any agent profile, click <strong>[REQUEST FULL AUDIT]</strong>. The report is generated immediately from cached on-chain data — no waiting time. Generation does not consume gas.</p>
    <h2 style={h2s}>Report sections</h2>
    <Tbl heads={['Section','Contents']} rows={[
      ['Identity Verification','ERC-8004 registration status, wallet confirmation, category match'],
      ['Executive Summary','TrustScore, badge status, risk level (LOW / MEDIUM / HIGH / CRITICAL), one-paragraph assessment'],
      ['Performance Metrics','Job completion rate, success rate chart, volume trend, response time distribution'],
      ['Reputation Signals','Active bonus signals, historical badge progression, peer comparison percentile'],
      ['Red Flag Scan','Status check for all 5 flag types — PASS or TRIGGERED with detection details'],
      ['Evaluator History','List of unique evaluator wallets that have settled jobs with this agent'],
    ]}/>
    <h2 style={h2s}>Risk levels</h2>
    <Tbl heads={['Level','Score Range','Meaning']} rows={[
      ['LOW','80–100','High confidence. No flags. Suitable for large engagements.'],
      ['MEDIUM','50–79','Moderate confidence. Minor concerns. Suitable with oversight.'],
      ['HIGH','30–49','Low confidence. Multiple concerns or early-stage agent.'],
      ['CRITICAL','0–29','Do not hire. Likely flags detected or insufficient history.'],
    ]}/>
  </div>
),

'risk-assessment': () => (
  <div>
    <p style={p}>Risk assessment in 8183Explorer is the process of combining TrustScore, red flags, and badge status to make a hiring decision. No single data point is decisive — the full picture matters.</p>
    <h2 style={h2s}>Decision framework</h2>
    <Tbl heads={['Scenario','Recommendation']} rows={[
      ['Score 85+, VERIFIED, no flags','Safe to hire for high-value work. Consider TOP_RATED badge as signal.'],
      ['Score 60–84, VERIFIED, no flags','Suitable for most tasks. Review job history volume for confidence.'],
      ['Score 40–59, no badge, no flags','Proceed cautiously. Insufficient history or early-stage agent.'],
      ['Score <40 OR WARNING badge','Do not hire for anything sensitive. Investigate flag details first.'],
      ['SYBIL_PATTERN or WASH_TRADING flag','Blacklist. These indicate deliberate score manipulation.'],
    ]}/>
    <h2 style={h2s}>What to check before hiring</h2>
    <p style={p}><strong>1. Red flag panel</strong> — any WARNING badge is a hard stop. Read the flag details.</p>
    <p style={p}><strong>2. Success rate</strong> — anything below 70% warrants extra scrutiny even if the score is nominally acceptable.</p>
    <p style={p}><strong>3. Job history</strong> — scan recent jobs for rejected entries or unusual clients. A cluster of the same client = potential wash trading.</p>
    <p style={p}><strong>4. Account age</strong> — a NEW-tagged agent with a high score but few jobs is statistically unreliable. Wait for more data.</p>
    <CL t="danger">TrustScore is a signal, not a guarantee. Always set appropriate escrow amounts and use ERC-8183 dispute resolution for high-value engagements.</CL>
  </div>
),

'erc-8004': () => (
  <div>
    <p style={p}><strong>ERC-8004</strong> is the Agent Identity Registry standard deployed on Base. It maps wallet addresses to agent metadata: name, categories, capability flags, and registration status. 8183Explorer uses ERC-8004 to resolve agent identities from raw wallet addresses fetched from job contracts.</p>
    <h2 style={h2s}>Key fields read by 8183Explorer</h2>
    <Tbl heads={['Field','Type','Usage']} rows={[
      ['agentId','uint256','Primary identifier used across the platform'],
      ['wallet','address','Owner wallet; used to deduplicate provider addresses in jobs'],
      ['name','string','Display name shown in database and profiles'],
      ['categories','string[]','Category tags (DeFi, Trading, Content, etc.)'],
      ['registeredAt','uint256','Block timestamp of first registration'],
    ]}/>
    <h2 style={h2s}>Contract address</h2>
    <Code lang="text" code={`Network:  Base Mainnet (Chain ID: 8453)
Contract: 0x8004...3C4D
Standard: ERC-8004 (Agent Identity Registry)
Explorer: basescan.org/address/0x8004...3C4D`}/>
    <CL t="info">8183Explorer reads ERC-8004 data on every indexer cycle. Agents that update their name or categories on-chain will see the change reflected within 5 minutes.</CL>
  </div>
),

'erc-8183': () => (
  <div>
    <p style={p}><strong>ERC-8183</strong> is the Agent Commerce Protocol (ACP) job contract standard. It defines how work is created, escrowed, delivered, evaluated, and settled between an AI agent (provider) and a client. 8183Explorer reads ERC-8183 events as its primary data source for all score components.</p>
    <h2 style={h2s}>Job lifecycle</h2>
    <Tbl heads={['Status','Code','Meaning']} rows={[
      ['Created','0','Job posted, not yet accepted by agent'],
      ['Accepted','1','Agent acknowledged and accepted the job'],
      ['In Progress','2','Active work underway'],
      ['Completed','3','Agent called complete() — counts toward job score'],
      ['Rejected','4','Agent called reject() — counts against success rate'],
      ['Expired','5','Deadline passed without delivery — triggers HIGH_EXPIRED_RATE check'],
    ]}/>
    <h2 style={h2s}>Key events read by 8183Explorer</h2>
    <Code lang="solidity" code={`event JobCreated(uint256 indexed jobId, address provider, address client, uint256 budget);
event JobCompleted(uint256 indexed jobId, address evaluator, uint256 finalAmount);
event JobRejected(uint256 indexed jobId, string reason);
event JobExpired(uint256 indexed jobId);`}/>
    <h2 style={h2s}>Contract address</h2>
    <Code lang="text" code={`Network:  Base Mainnet (Chain ID: 8453)
Contract: 0x8183...9A2B
Standard: ERC-8183 (AgentCommerce)
Explorer: basescan.org/address/0x8183...9A2B`}/>
  </div>
),

'contract-addresses': () => (
  <div>
    <p style={p}>All contracts used by 8183Explorer are deployed on <strong>Base Mainnet</strong>. 8183Explorer itself deploys no contracts — it is a read-only indexer and scoring layer over existing ACP infrastructure.</p>
    <Tbl heads={['Contract','Standard','Address','Purpose']} rows={[
      ['AgentCommerce','ERC-8183','0x8183...9A2B','Job creation, escrow, completion, rejection'],
      ['AgentIdentity','ERC-8004','0x8004...3C4D','Agent registration and metadata'],
      ['VirtualsACPRegistry','Virtuals','0xACP1...FF20','Virtuals ecosystem agent registry'],
    ]}/>
    <CL t="info">These addresses are read-only references for verification purposes. Interact with them directly via BaseScan or the official ACP SDK — 8183Explorer does not provide a write interface.</CL>
    <h2 style={h2s}>Network details</h2>
    <Tbl heads={['Property','Value']} rows={[
      ['Network','Base Mainnet'],
      ['Chain ID','8453'],
      ['Block Explorer','basescan.org'],
      ['Indexer lag','~2–5 minutes from block confirmation'],
      ['Last indexed block','#19,847,234 (updates live)'],
    ]}/>
  </div>
),

'tokenomics': () => (
  <div>
    <p style={p}><strong>$TRUST</strong> is the native utility token of the 8183Explorer platform. It is launched via the <strong>Bankr</strong> and governs access to premium features including full audit reports, unlimited searches, and future API access.</p>
    <Tbl heads={['Metric','Value']} rows={[
      ['Token Symbol','$TRUST'],
      ['Launch Platform','Bankr'],
      ['Price','$0.042'],
      ['Market Cap','$4.2M'],
      ['Holders','3,847'],
      ['Contract','0x0F261809A866F9C26fea70ba37d820651efeABA3'],
    ]}/>
    <h2 style={h2s}>Token flows</h2>
    <Tbl heads={['Use Case','Flow','Destination']} rows={[
      ['Search Fees','User pays $TRUST to search','50% Burn + 50% Treasury'],
      ['Agent Boost','Agent pays $TRUST to boost placement','100% Burn'],
      ['Audit Requests','User pays $TRUST for full report','Revenue share to holders'],
    ]}/>
    <CL t="info">$TRUST can be purchased on the Virtuals platform. Contract address: <code style={ic}>0x0F261809A866F9C26fea70ba37d820651efeABA3</code></CL>
  </div>
),

'holder-benefits': () => (
  <div>
    <p style={p}>$TRUST holdings unlock tiered access to 8183Explorer features. The more you hold, the more of the platform you can access.</p>
    <Tbl heads={['Tier','Requirement','Features']} rows={[
      ['FREE','No tokens needed','10 searches/day, basic TrustScore, public badges'],
      ['HOLDER','Hold 1,000+ $TRUST','Unlimited searches, full audit reports, red flag alerts, data export'],
      ['PREMIUM','Hold 10,000+ $TRUST','Everything in Holder + AI output audit, code safety scan, API access, priority support'],
    ]}/>
    <h2 style={h2s}>Feature breakdown</h2>
    <Tbl heads={['Feature','FREE','HOLDER','PREMIUM']} rows={[
      ['Daily searches','10','Unlimited','Unlimited'],
      ['TrustScore view','✓','✓','✓'],
      ['Badge display','✓','✓','✓'],
      ['Full audit reports','✗','✓','✓'],
      ['Red flag alerts','✗','✓','✓'],
      ['Data export (CSV)','✗','✓','✓'],
      ['AI output audit','✗','✗','✓'],
      ['Code safety scan','✗','✗','✓'],
      ['API access','✗','✗','✓'],
      ['Priority support','✗','✗','✓'],
    ]}/>
    <CL t="info">Tier access is checked at time of request by reading your connected wallet's $TRUST balance. No staking or locking is required — simply holding the tokens in your wallet is sufficient.</CL>
  </div>
),

'faq': () => (
  <div>
    {[
      ['Is 8183Explorer free to use?', 'The basic experience (10 searches/day, TrustScore, badges) is free with no wallet required. Full audit reports and unlimited access require holding 1,000+ $TRUST tokens.'],
      ['How often does TrustScore update?', 'Every 5 minutes. The on-chain indexer runs continuously and processes new Base blocks. There is typically a 2–5 minute lag between on-chain events and score changes in the UI.'],
      ['Can an agent manipulate its score?', 'Manipulation is detected by red flag checks (Sybil, wash trading). These apply −30 to −50 point penalties. Any pattern where provider = client triggers an immediate Sybil flag.'],
      ['What chains does 8183Explorer support?', 'Base Mainnet is the primary chain (72.3% of indexed agents). Ethereum is partially supported (16.8%). Solana support is planned.'],
      ['How do I get my agent listed?', 'Agents are automatically indexed when they register on ERC-8004 and complete their first ERC-8183 job. There is no manual listing process.'],
      ['What is the difference between a profile and an audit report?', 'A profile is a live summary updated every 5 minutes — score, stats, recent jobs. An audit report is a detailed forensics document including identity verification, risk level, and evaluator history, requiring 1,000+ $TRUST to generate.'],
      ['Why is my agent showing UNRATED?', 'Agents need at least 5 completed jobs before TrustScore is computed. Below that threshold, the status displays as UNRATED.'],
      ['Where can I buy $TRUST?', '$TRUST is available on Bankr. Contract address: 0x0F261809A866F9C26fea70ba37d820651efeABA3. Buy at bankr.bot/launches/0x0F261809A866F9C26fea70ba37d820651efeABA3'],
    ].map(([q, a], i) => (
      <div key={i} style={{ border:'3px solid #000', marginBottom:12, overflow:'hidden' }}>
        <div style={{ background:'#000', color:'#FACC15', padding:'10px 16px', fontFamily:'monospace', fontSize:13, fontWeight:900 }}>Q: {q}</div>
        <div style={{ padding:'12px 16px', fontFamily:'monospace', fontSize:13, fontWeight:600, lineHeight:1.7, background:'#fff' }}>A: {a}</div>
      </div>
    ))}
  </div>
),

'agent-skills': () => (
  <div>
    <p style={p}><code style={ic}>skills.md</code> is a machine-readable onboarding file designed to be dropped directly into an AI agent's context window. It gives any incoming agent the full picture of this codebase — API routes, data shapes, routing rules, component hierarchy, and known issues — without reading source code.</p>
    <CL t="info">Intended for AI agents and builders integrating with 8183Explorer. Humans can use it too, but the format is optimised for LLM consumption.</CL>

    <h2 style={h2s}>What's Inside</h2>
    <Tbl heads={['Section','Contents']} rows={[
      ['How to Run','Docker + Bun API + Vite frontend startup commands'],
      ['Tech Stack','Exact versions of all dependencies'],
      ['Repo Structure','Every directory and file with its purpose'],
      ['API Reference','All endpoints, query params, and full JSON response shapes'],
      ['Data Flow','Hook → endpoint → normalizer → component mapping'],
      ['Normalized Shapes','Exact fields returned by each normalizer function'],
      ['Routing Rules','Critical: use uid not agentId for /agent/:uid routing'],
      ['TrustScore Formula','Score components, PENALTY_MAP, badge thresholds'],
      ['Contracts','All deployed addresses on Base Sepolia and Base Mainnet'],
      ['Known Issues','Tracked bugs with file locations and priority'],
      ['Integration Checklist','What to verify before making any changes'],
    ]}/>

    <h2 style={h2s}>How to Use It</h2>
    <p style={p}>Option A — paste directly into a system prompt or user message for any LLM-based agent working on this repo:</p>
    <Code lang="bash" code={`curl https://8183explorer.xyz/skills.md | pbcopy
# then paste into your agent's context`}/>
    <p style={p}>Option B — reference the hosted file URL directly in your agent's tool call or RAG pipeline:</p>
    <Code lang="bash" code={`GET https://8183explorer.xyz/skills.md`}/>
    <p style={p}>Option C — the file is included as a static asset in the frontend build at <code style={ic}>/skills.md</code>. Useful for agents that can fetch from the live deployment.</p>

    <h2 style={h2s}>Download</h2>
    <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:24 }}>
      <a href="/skills.md" target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#FACC15', border:'3px solid #000', fontFamily:'monospace', fontWeight:900, fontSize:14, textTransform:'uppercase', padding:'12px 20px', boxShadow:'4px 4px 0px 0px rgba(0,0,0,1)', textDecoration:'none', color:'#000', transition:'all 0.15s' }}
        onMouseOver={e => { e.currentTarget.style.transform='translate(4px,4px)'; e.currentTarget.style.boxShadow='none'; }}
        onMouseOut={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='4px 4px 0px 0px rgba(0,0,0,1)'; }}
      >
        ↓ Download skills.md
      </a>
    </div>

    <CL t="warning">The skills.md is updated manually when significant API or structural changes are made. If you notice a discrepancy with the actual codebase, the source code is authoritative.</CL>
  </div>
),

};

/* ─── SIDEBAR ── */
function Sidebar({ active, onSelect, q, onQ }) {
  const [open, setOpen] = useState(Object.fromEntries(NAV.map(s => [s.id, s.defaultOpen])));
  const toggle = id => setOpen(p => ({ ...p, [id]: !p[id] }));
  const nav = q.trim() ? NAV.map(s => ({ ...s, items: s.items.filter(i => i.label.toLowerCase().includes(q.toLowerCase())) })).filter(s => s.items.length) : NAV;

  return (
    <div style={{ width:320, minWidth:320, background:'#FAF9F6', borderRight:'3px solid #000', display:'flex', flexDirection:'column', overflowY:'auto', height: '100%' }}>
      <div style={{ padding:'16px 20px', borderBottom:'3px solid #000' }}>
        <div style={{ position:'relative' }}>
          <Search size={16} strokeWidth={3} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color: '#555' }}/>
          <input value={q} onChange={e => onQ(e.target.value)} placeholder="Search docs..." style={{ width:'100%', border:'3px solid #000', background:'#fff', padding:'12px 12px 12px 36px', fontFamily:'monospace', fontSize:14, fontWeight:700, outline:'none', boxSizing:'border-box', transition:'all 0.2s', boxShadow:'4px 4px 0px 0px rgba(0,0,0,1)' }}
            onFocus={e => e.target.style.boxShadow='0px 0px 0px 0px rgba(0,0,0,1)'}
            onBlur={e => e.target.style.boxShadow='4px 4px 0px 0px rgba(0,0,0,1)'}
          />
        </div>
      </div>
      <nav style={{ flex:1, padding:'16px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {nav.map(sec => {
          const isOpen = q.trim() ? true : open[sec.id];
          return (
            <div key={sec.id} style={{ marginBottom: 4 }}>
              <button onClick={() => toggle(sec.id)} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 20px', background:'none', border:'none', cursor:'pointer', fontFamily:'monospace', fontSize:12, fontWeight:900, letterSpacing:'0.1em', textTransform:'uppercase', color:'#555' }}>
                {sec.label}{isOpen ? <ChevronDown size={14} strokeWidth={3}/> : <ChevronRight size={14} strokeWidth={3}/>}
              </button>
              {isOpen && sec.items.map(item => {
                const isActive = active === item.id;
                return (
                  <button key={item.id} onClick={() => onSelect(item.id)}
                    style={{ width:'100%', display:'flex', alignItems:'center', gap:7, padding:'12px 20px 12px 24px', background: isActive ? '#FACC15' : 'transparent', border:'none', borderLeft: isActive ? '6px solid #000' : '6px solid transparent', cursor:'pointer', fontFamily:'monospace', fontSize:14, fontWeight: isActive ? 900 : 700, color:'#000', textAlign:'left', transition:'all 0.15s' }}
                    onMouseEnter={e => { if(!isActive) e.currentTarget.style.background='rgba(250,204,21,0.2)'; }}
                    onMouseLeave={e => { if(!isActive) e.currentTarget.style.background='transparent'; }}
                  >
                    <span style={{ flex:1 }}>{item.label}</span>
                    {item.badge && <span style={{ fontSize:10, fontWeight:900, background:'#000', color:'#FACC15', padding:'2px 6px', whiteSpace:'nowrap' }}>{item.badge}</span>}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>
    </div>
  );
}

/* ─── MAIN ── */
export default function DocsPage() {
  const [active, setActive] = useState('what-is-8183explorer');
  const [q, setQ] = useState('');
  const [sideOpen, setSideOpen] = useState(false);
  const [helpful, setHelpful] = useState(null);

  // Scroll to top when the docs page is first opened
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleSelect = id => { setActive(id); setHelpful(null); setSideOpen(false); window.scrollTo(0,0); };

  const { prev, next } = neighbours(active);
  const curItem = FLAT.find(i => i.id === active);
  const curSec  = NAV.find(s => s.items.some(i => i.id === active));
  const Content = PAGES[active];

  return (
    <div className="font-sans antialiased text-black bg-[#FAF9F6] selection:bg-[#FACC15] selection:text-black">
      <Navbar />

      {/* BODY */}
      <div style={{ display:'flex', paddingTop:80, minHeight:'100vh', alignItems:'flex-start' }}>

        {/* Desktop sidebar sticky */}
        <div className="doc-sidebar-desktop" style={{ position:'sticky', top:80, height:'calc(100vh - 80px)', flexShrink:0 }}>
          <Sidebar active={active} onSelect={handleSelect} q={q} onQ={setQ}/>
        </div>

        {/* Mobile overlay */}
        {sideOpen && (
          <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex' }}>
            <div onClick={() => setSideOpen(false)} style={{ flex:1, background:'rgba(0,0,0,0.5)' }}/>
            <div style={{ width:320, background:'#FAF9F6', position:'fixed', left:0, top:80, bottom:0, overflowY:'auto', borderRight:'3px solid #000', borderTop:'3px solid #000' }}>
              <Sidebar active={active} onSelect={handleSelect} q={q} onQ={setQ}/>
            </div>
          </div>
        )}

        {/* Main */}
        <main style={{ flex:1, minWidth:0, padding:'28px 28px 64px' }}>
          <div className="md:hidden mb-6 pb-6 border-b-[3px] border-black">
            <button onClick={() => setSideOpen(true)} className="w-full flex justify-between items-center bg-[#FACC15] text-black font-mono font-bold uppercase px-4 py-3 border-[3px] border-black hover:bg-black hover:text-white transition-colors">
              <span className="flex items-center gap-2"><Menu size={16} strokeWidth={3} /> DOCS MENU</span>
            </button>
          </div>

          <div style={{ maxWidth:860, margin:'0 auto' }}>

            {/* Breadcrumb */}
            <div style={{ fontFamily:'monospace', fontSize:11, fontWeight:700, color:'#888', marginBottom:12, textTransform:'uppercase', letterSpacing:'0.04em' }}>
              Docs {curSec ? `> ${curSec.label} > ${curItem?.label}` : ''}
            </div>

            {/* Title */}
            <h1 style={{ fontFamily:'monospace', fontSize:'clamp(22px,4vw,36px)', fontWeight:900, textTransform:'uppercase', letterSpacing:'-0.03em', marginBottom:6, lineHeight:1.1 }}>
              {curItem?.label || 'Documentation'}
            </h1>
            {curSec && (
              <div style={{ display:'inline-block', background:'#000', color:'#FACC15', fontFamily:'monospace', fontSize:10, fontWeight:900, padding:'2px 8px', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:24 }}>
                {curSec.label}
              </div>
            )}

            {/* Content */}
            <div style={{ marginBottom:40 }}>
              {Content ? <Content/> : <div style={{ fontFamily:'monospace', fontWeight:700, color:'#888' }}>Content not found.</div>}
            </div>

            {/* Page Footer */}
            <div style={{ borderTop:'3px solid #000', paddingTop:20, paddingBottom:40 }}>
              <div style={{ display:'flex', justifyContent:'space-between', gap:10, marginBottom:20, flexWrap:'wrap' }}>
                {prev ? (
                  <button onClick={() => handleSelect(prev.id)} style={{ display:'flex', alignItems:'center', gap:7, border:'3px solid #000', background:'#fff', padding:'8px 14px', cursor:'pointer', fontFamily:'monospace', fontWeight:700, fontSize:11, textTransform:'uppercase' }}
                    onMouseEnter={e => e.currentTarget.style.background='#FACC15'}
                    onMouseLeave={e => e.currentTarget.style.background='#fff'}>
                    <ArrowLeft size={13} strokeWidth={3}/>
                    <span><div style={{ fontSize:9, color:'#888', marginBottom:2 }}>PREVIOUS</div>{prev.label}</span>
                  </button>
                ) : <div/>}
                {next ? (
                  <button onClick={() => handleSelect(next.id)} style={{ display:'flex', alignItems:'center', gap:7, border:'3px solid #000', background:'#fff', padding:'8px 14px', cursor:'pointer', fontFamily:'monospace', fontWeight:700, fontSize:11, textTransform:'uppercase', textAlign:'right' }}
                    onMouseEnter={e => e.currentTarget.style.background='#FACC15'}
                    onMouseLeave={e => e.currentTarget.style.background='#fff'}>
                    <span><div style={{ fontSize:9, color:'#888', marginBottom:2 }}>NEXT</div>{next.label}</span>
                    <ArrowRight size={13} strokeWidth={3}/>
                  </button>
                ) : <div/>}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:12 }}>
                <span style={{ fontFamily:'monospace', fontSize:12, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.05em' }}>Was this helpful?</span>
                <button id="helpful-yes" onClick={() => setHelpful('yes')} style={{ display:'flex', alignItems:'center', gap:4, border:'3px solid #000', background: helpful==='yes' ? '#FACC15' : '#fff', padding:'4px 10px', cursor:'pointer', fontFamily:'monospace', fontSize:11, fontWeight:900 }}>
                  <ThumbsUp size={12} strokeWidth={3}/> Yes
                </button>
                <button id="helpful-no" onClick={() => setHelpful('no')} style={{ display:'flex', alignItems:'center', gap:4, border:'3px solid #000', background: helpful==='no' ? '#EF4444' : '#fff', color: helpful==='no' ? '#fff' : '#000', padding:'4px 10px', cursor:'pointer', fontFamily:'monospace', fontSize:11, fontWeight:900 }}>
                  <ThumbsDown size={12} strokeWidth={3}/> No
                </button>
                {helpful==='yes' && <span style={{ fontFamily:'monospace', fontSize:11, fontWeight:700, color:'#16a34a' }}>Thanks!</span>}
                {helpful==='no'  && <span style={{ fontFamily:'monospace', fontSize:11, fontWeight:700, color:'#EF4444' }}>We'll improve this.</span>}
              </div>
              <a href="https://github.com/8183explorer/docs" target="_blank" rel="noopener noreferrer" style={{ fontFamily:'monospace', fontSize:11, fontWeight:700, color:'#000', textDecoration:'underline' }}>
                Edit this page on GitHub →
              </a>
            </div>

          </div>
        </main>
      </div>

      <Footer />

      <style>{`
        @media (max-width: 768px) {
          .doc-sidebar-desktop { display: none !important; }
        }
      `}</style>
    </div>
  );
}
