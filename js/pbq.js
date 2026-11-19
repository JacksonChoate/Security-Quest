// Security+ Quest: performance-based style challenges (PBQs).
// The real exam opens with a few PBQs: drag-and-drop, matching and ordering tasks.
// MATCH: pairs are [term, correct match]. ORDER: items are listed in the correct order.
// PACKETS: data for the Packet Defender minigame (bad:true = insecure, should be blocked).

const MATCH=[
{d:1,title:"Match each control to its control type",pairs:[
  ["Login banner warning about prosecution","Deterrent"],
  ["Restoring servers from clean backups","Corrective"],
  ["Reviewing IDS alerts each morning","Detective"],
  ["Badge-locked server room door","Preventive"],
  ["Extra monitoring on a system that can't do MFA","Compensating"]]},
{d:1,title:"Match each cryptographic tool to its purpose",pairs:[
  ["Salt","Defeats rainbow tables"],
  ["Digital signature","Non-repudiation"],
  ["Hash","Integrity check"],
  ["Key stretching","Slows brute-force guessing"],
  ["Tokenization","Swaps data for a vault-mapped value"]]},
{d:2,title:"Match each attack to its best mitigation",pairs:[
  ["SQL injection","Parameterized queries"],
  ["Cross-site scripting","Output encoding"],
  ["Cross-site request forgery","Anti-CSRF tokens"],
  ["Password spraying","MFA and login monitoring"],
  ["Replay attack","Timestamps and nonces"]]},
{d:2,title:"Match each social engineering attack to its channel",pairs:[
  ["Smishing","SMS text message"],
  ["Vishing","Voice phone call"],
  ["Whaling","Email to executives"],
  ["Watering hole","A website the target trusts"],
  ["Typosquatting","Look-alike domain name"]]},
{d:2,title:"Match each malware type to its behavior",pairs:[
  ["Worm","Spreads on its own across the network"],
  ["Trojan","Disguised as legitimate software"],
  ["Rootkit","Hides in the OS kernel"],
  ["Logic bomb","Fires on a date or event"],
  ["Ransomware","Encrypts files and demands payment"]]},
{d:3,title:"Match each recovery site to its readiness",pairs:[
  ["Hot site","Fully equipped, ready in minutes to hours"],
  ["Warm site","Some equipment, needs setup and data"],
  ["Cold site","Space and power only"]]},
{d:3,title:"Match each metric to its meaning",pairs:[
  ["RTO","Maximum acceptable downtime"],
  ["RPO","Maximum acceptable data loss"],
  ["MTTR","Average time to repair"],
  ["MTBF","Average time between failures"]]},
{d:3,title:"Match each network device to its job",pairs:[
  ["WAF","Blocks Layer 7 web attacks"],
  ["IPS","Inline device that drops attacks"],
  ["IDS","Watches a traffic copy and alerts"],
  ["Jump server","Hardened entry point into a secure zone"],
  ["Reverse proxy","Fronts and hides web servers"]]},
{d:4,title:"Match each security tool to what it does",pairs:[
  ["SIEM","Collects and correlates logs"],
  ["SOAR","Automates response with playbooks"],
  ["DLP","Stops sensitive data leaving"],
  ["EDR","Detects threats on endpoints and isolates hosts"],
  ["FIM","Alerts when critical files change"]]},
{d:4,title:"Match each email control to what it does",pairs:[
  ["SPF","Lists servers allowed to send for the domain"],
  ["DKIM","Signs mail with a key published in DNS"],
  ["DMARC","Tells receivers to quarantine or reject failures"]]},
{d:4,title:"Match each access control model to its description",pairs:[
  ["MAC","System-enforced labels like Secret"],
  ["DAC","The data owner decides"],
  ["RBAC","Permissions by job role"],
  ["ABAC","Attributes like location and time"]]},
{d:5,title:"Match each risk strategy to its example",pairs:[
  ["Transfer","Buying cyber insurance"],
  ["Avoid","Cancelling the risky project"],
  ["Mitigate","Installing a firewall"],
  ["Accept","Documenting and living with a low risk"]]},
{d:5,title:"Match each agreement to its purpose",pairs:[
  ["SLA","Uptime and response-time guarantees"],
  ["MOU","Non-binding statement of intent"],
  ["MSA","Umbrella terms for future work"],
  ["SOW","Deliverables for one project"],
  ["NDA","Keeps shared information confidential"]]},
{d:5,title:"Match each document type to its role",pairs:[
  ["Policy","Management's mandatory high-level intent"],
  ["Standard","Required specifics, like 14-character passwords"],
  ["Procedure","Step-by-step instructions"],
  ["Guideline","Recommended, not required"]]}
];

const ORDER=[
{d:4,title:"Put the incident response phases in order",items:["Preparation","Detection","Analysis","Containment","Eradication","Recovery","Lessons learned"]},
{d:4,title:"Order of volatility: collect the most volatile evidence first",items:["CPU registers and cache","RAM","Swap and temporary files","Disk","Remote logs","Archived backups"]},
{d:4,title:"Put the vulnerability management steps in order",items:["Scan to identify vulnerabilities","Prioritize with CVSS and context","Remediate (patch or mitigate)","Rescan to validate the fix","Report the results"]},
{d:1,title:"Put the change management steps in order",items:["Submit the change request","Analyze impact and write a backout plan","Get change board approval","Implement in the maintenance window","Test and update documentation"]},
{d:1,title:"Put the certificate request steps in order",items:["Generate a key pair","Create a CSR with the public key","CA validates the requester","CA signs and issues the certificate","Install the certificate on the server"]},
{d:5,title:"Put the quantitative risk steps in order",items:["Determine asset value (AV)","Estimate exposure factor (EF)","Calculate SLE = AV x EF","Estimate ARO","Calculate ALE = SLE x ARO"]},
{d:5,title:"Put the penetration test phases in order",items:["Agree rules of engagement","Passive reconnaissance (OSINT)","Active reconnaissance (scanning)","Exploitation","Report findings"]},
{d:4,title:"Put the account lifecycle in order",items:["Onboarding and identity proofing","Provisioning least-privilege access","Periodic access review","Offboarding and disabling access"]}
];

const PACKETS=[
{n:"SSH",p:"22",bad:false,why:"SSH encrypts remote sessions."},
{n:"HTTPS",p:"443",bad:false,why:"HTTPS is HTTP over TLS."},
{n:"SFTP",p:"22",bad:false,why:"SFTP transfers files over SSH."},
{n:"LDAPS",p:"636",bad:false,why:"LDAPS is LDAP over TLS."},
{n:"IMAPS",p:"993",bad:false,why:"IMAPS is IMAP over TLS."},
{n:"POP3S",p:"995",bad:false,why:"POP3S is POP3 over TLS."},
{n:"SNMPv3",p:"161",bad:false,why:"SNMPv3 adds authentication and encryption."},
{n:"SMTP+TLS",p:"587",bad:false,why:"Port 587 is mail submission with STARTTLS."},
{n:"FTPS",p:"990",bad:false,why:"FTPS is FTP over TLS."},
{n:"TLS 1.3",p:"443",bad:false,why:"TLS 1.3 is the current secure version."},
{n:"WPA3",p:"Wi-Fi",bad:false,why:"WPA3 uses SAE and resists offline cracking."},
{n:"AES-256",p:"cipher",bad:false,why:"AES-256 is a strong symmetric cipher."},
{n:"SHA-256",p:"hash",bad:false,why:"SHA-256 is a secure hash."},
{n:"Kerberos",p:"88",bad:false,why:"Kerberos uses tickets instead of sending passwords."},
{n:"Telnet",p:"23",bad:true,why:"Telnet sends credentials in clear text. Use SSH on 22."},
{n:"FTP",p:"21",bad:true,why:"FTP is clear text. Use SFTP (22) or FTPS (990)."},
{n:"HTTP",p:"80",bad:true,why:"HTTP is unencrypted. Use HTTPS on 443."},
{n:"SNMPv1",p:"161",bad:true,why:"SNMPv1 uses clear-text community strings. Use SNMPv3."},
{n:"POP3",p:"110",bad:true,why:"POP3 is clear text. Use POP3S on 995."},
{n:"IMAP",p:"143",bad:true,why:"Plain IMAP is clear text. Use IMAPS on 993."},
{n:"LDAP",p:"389",bad:true,why:"Plain LDAP can expose credentials. Use LDAPS on 636."},
{n:"TFTP",p:"69",bad:true,why:"TFTP has no authentication or encryption."},
{n:"SSL 3.0",p:"443",bad:true,why:"SSL 3.0 is deprecated and vulnerable. Require TLS 1.2+."},
{n:"TLS 1.0",p:"443",bad:true,why:"TLS 1.0 is deprecated. Require TLS 1.2 or 1.3."},
{n:"WEP",p:"Wi-Fi",bad:true,why:"WEP is broken. Use WPA3 (or WPA2 at minimum)."},
{n:"DES",p:"cipher",bad:true,why:"DES has a 56-bit key and is easily brute-forced. Use AES."},
{n:"MD5",p:"hash",bad:true,why:"MD5 has known collisions. Use SHA-256 or better."},
{n:"SMBv1",p:"445",bad:true,why:"SMBv1 is obsolete and was abused by WannaCry. Disable it."}
];
