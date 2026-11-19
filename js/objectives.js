// Security+ Quest: exam objective list, key terms for flashcards, and the loader for per-question study data.
// Objective numbers follow the CompTIA Security+ SY0-701 outline (1.1 to 5.6). Titles are short paraphrases.
// "AI" is the game's bonus zone and is not an SY0-701 objective.

const OBJECTIVES=[
  ['1.1','Security control categories and types'],
  ['1.2','Fundamental security concepts'],
  ['1.3','Change management'],
  ['1.4','Cryptographic solutions'],
  ['2.1','Threat actors and motivations'],
  ['2.2','Threat vectors and attack surfaces'],
  ['2.3','Types of vulnerabilities'],
  ['2.4','Indicators of malicious activity'],
  ['2.5','Mitigation techniques'],
  ['3.1','Architecture models'],
  ['3.2','Securing enterprise infrastructure'],
  ['3.3','Data protection'],
  ['3.4','Resilience and recovery'],
  ['4.1','Securing computing resources'],
  ['4.2','Asset management'],
  ['4.3','Vulnerability management'],
  ['4.4','Alerting and monitoring'],
  ['4.5','Enhancing enterprise security capabilities'],
  ['4.6','Identity and access management'],
  ['4.7','Automation and orchestration'],
  ['4.8','Incident response'],
  ['4.9','Data sources for investigations'],
  ['5.1','Security governance'],
  ['5.2','Risk management'],
  ['5.3','Third-party risk'],
  ['5.4','Security compliance and privacy'],
  ['5.5','Audits and assessments'],
  ['5.6','Security awareness'],
  ['AI','Bonus: AI security']
];
const OBJ_NAME=Object.fromEntries(OBJECTIVES);

// Key terms for the Flashcards mode: [term, short definition].
const TERMS=[
  ['Non-repudiation','Proof that a sender cannot deny an action, usually via a digital signature'],
  ['Zero Trust','Never trust by default; verify every request based on identity and context'],
  ['Compensating control','An alternative safeguard used when the primary control is not possible'],
  ['Deterrent control','Discourages an attack, like a warning banner or visible camera'],
  ['Honeytoken','Fake data planted as a tripwire to reveal theft'],
  ['Gap analysis','Comparing current controls against a target framework'],
  ['Salting','Adding random data before hashing so identical passwords hash differently'],
  ['Key stretching','Repeating a hash many times to slow brute-force attacks (PBKDF2, bcrypt)'],
  ['Perfect forward secrecy','Unique session keys so a stolen long-term key cannot decrypt past traffic'],
  ['Tokenization','Replacing sensitive data with a token mapped back only in a secure vault'],
  ['Data masking','Hiding part of a value, like showing only the last four digits'],
  ['Steganography','Hiding data inside other data, such as an image'],
  ['Shadow IT','Technology used without approval from IT or security'],
  ['Pretexting','Inventing a believable story to manipulate a victim'],
  ['Watering hole','Compromising a site the target group already visits'],
  ['TOCTOU','Race condition exploiting the gap between checking and using a resource'],
  ['Password spraying','Trying a few common passwords across many accounts'],
  ['Impossible travel','Logins from locations too far apart for the time between them'],
  ['Privilege escalation','Gaining higher permissions than were granted'],
  ['Lateral movement','Moving from one compromised system to others'],
  ['Shared responsibility','Cloud provider and customer each secure different layers'],
  ['Infrastructure as code','Defining infrastructure in version-controlled templates'],
  ['Air gap','Complete physical isolation from other networks'],
  ['Fail-closed','A failed device blocks all traffic, favoring security over availability'],
  ['Jump server','A hardened host used as the single entry point to a secure zone'],
  ['Screened subnet','A zone for public-facing servers, separated from the internal LAN'],
  ['Data sovereignty','Data is subject to the laws of the country where it is stored or collected'],
  ['RTO','Recovery Time Objective: the longest acceptable downtime'],
  ['RPO','Recovery Point Objective: the most data loss acceptable, measured in time'],
  ['Hot site','Fully equipped recovery site, ready in minutes to hours'],
  ['Cold site','Recovery site with space and power but no equipment'],
  ['Differential backup','Everything changed since the last full backup'],
  ['Incremental backup','Everything changed since the last backup of any type'],
  ['Credentialed scan','A vulnerability scan that logs in for deeper, more accurate results'],
  ['False negative','A real problem that a tool failed to detect'],
  ['Privilege creep','Access that piles up as a user changes roles'],
  ['Just-in-time access','Privileges granted only for the time they are needed'],
  ['Chain of custody','A record of everyone who handled evidence, and when'],
  ['Legal hold','An order to preserve data that is relevant to litigation'],
  ['Order of volatility','Collect the most short-lived evidence first: cache, RAM, then disk'],
  ['Threat hunting','Proactively searching for attackers who evaded detection'],
  ['Residual risk','Risk that remains after controls are applied'],
  ['Risk appetite','How much risk leadership is willing to accept to reach its goals'],
  ['SLE','Single Loss Expectancy = Asset Value x Exposure Factor'],
  ['ALE','Annualized Loss Expectancy = SLE x ARO'],
  ['Right-to-audit clause','Contract term that lets you inspect a vendor\'s controls'],
  ['Data controller','The organization that decides why and how personal data is processed'],
  ['Data custodian','The role that protects data day to day, such as running backups'],
  ['Rules of engagement','Defines scope, timing and methods for a penetration test'],
  ['Passive reconnaissance','Gathering information without touching the target\'s systems']
];

// Study data per question: objective tag and a reason for each wrong answer.
// Each domain file calls EXPL_ADD(firstId, domain, rows), where a row is [objective, why a[1] is wrong, why a[2] is wrong, why a[3] is wrong].
const EXPL_WARN=[];
function EXPL_ADD(start,d,rows){
  const last=start+rows.length-1,next=Q[last+1];
  if(!Q[start]||Q[start].d!==d||!Q[last]||Q[last].d!==d||(next&&next.d===d))EXPL_WARN.push(`Domain ${d} study data does not line up with the question bank (ids ${start}-${last}).`);
  rows.forEach((r,i)=>{const q=Q[start+i];if(!q)return;q.o=r[0];q.w=[null,r[1],r[2],r[3]]});
}
