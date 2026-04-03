export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type StatusType = 'open' | 'investigating' | 'resolved' | 'escalated';

export interface Report {
  id: string;
  type: string;
  severity: SeverityLevel;
  status: StatusType;
  timestamp: string;
  source: string;
  confidence: number;
  tags: string[];
  reasoning: string;
  category: string;
  affectedSystems: string[];
  sparkline: number[];
}

export interface ActivityEvent {
  id: string;
  action: 'approved' | 'rejected' | 'escalated' | 'resolved' | 'flagged';
  reportId: string;
  actor: string;
  timestamp: string;
  note?: string;
}

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const REPORTS: Report[] = [
  {
    id: 'RPT-0041',
    type: 'SQL Injection Attempt',
    severity: 'critical',
    status: 'open',
    timestamp: '2026-04-03T22:14:00+05:30',
    source: '192.168.1.47',
    confidence: 97,
    tags: ['injection', 'web-app', 'database'],
    reasoning: 'Payload directly matches UNION-based SQL injection signatures. Target endpoint /api/users responded with 500 error containing stack trace. Pattern matches CVE-2023-1234.',
    category: 'Injection Attack',
    affectedSystems: ['api-gateway', 'users-db'],
    sparkline: [12, 18, 14, 22, 31, 28, 45],
  },
  {
    id: 'RPT-0040',
    type: 'Brute Force Login',
    severity: 'high',
    status: 'investigating',
    timestamp: '2026-04-03T21:58:00+05:30',
    source: '203.0.113.9',
    confidence: 89,
    tags: ['auth', 'brute-force', 'admin'],
    reasoning: '847 failed login attempts over 12 minutes from single IP targeting /admin endpoint. Rate exceeds threshold of 50 req/min by 16x.',
    category: 'Authentication',
    affectedSystems: ['auth-service'],
    sparkline: [5, 8, 6, 11, 19, 34, 55],
  },
  {
    id: 'RPT-0039',
    type: 'Data Exfiltration',
    severity: 'critical',
    status: 'escalated',
    timestamp: '2026-04-03T21:32:00+05:30',
    source: '10.0.0.23',
    confidence: 91,
    tags: ['exfiltration', 'insider', 'pii'],
    reasoning: 'Unusual outbound traffic spike of 4.2GB to external IP not in allowlist. Data matches PII schema fingerprint. User account has no history of bulk exports.',
    category: 'Data Loss',
    affectedSystems: ['data-warehouse', 'egress-proxy'],
    sparkline: [2, 3, 2, 4, 7, 12, 18],
  },
  {
    id: 'RPT-0038',
    type: 'Privilege Escalation',
    severity: 'high',
    status: 'open',
    timestamp: '2026-04-03T20:47:00+05:30',
    source: '10.0.1.88',
    confidence: 84,
    tags: ['privilege', 'escalation', 'linux'],
    reasoning: 'sudo command executed by non-admin user that bypassed PAM checks. Kernel version vulnerable to CVE-2024-0001. Session token forged.',
    category: 'Access Control',
    affectedSystems: ['prod-server-04', 'iam-service'],
    sparkline: [8, 6, 9, 7, 10, 8, 12],
  },
  {
    id: 'RPT-0037',
    type: 'Malware Signature',
    severity: 'medium',
    status: 'resolved',
    timestamp: '2026-04-03T19:10:00+05:30',
    source: '10.0.2.11',
    confidence: 76,
    tags: ['malware', 'trojan', 'endpoint'],
    reasoning: 'SHA256 hash of uploaded file matches known Emotet trojan variant. File was quarantined before execution. No lateral movement detected.',
    category: 'Malware',
    affectedSystems: ['endpoint-07'],
    sparkline: [15, 12, 10, 8, 9, 7, 6],
  },
  {
    id: 'RPT-0036',
    type: 'Phishing Attempt',
    severity: 'medium',
    status: 'resolved',
    timestamp: '2026-04-03T18:03:00+05:30',
    source: 'email-gateway',
    confidence: 88,
    tags: ['phishing', 'email', 'social-engineering'],
    reasoning: 'Email domain spoofing detected. DKIM failed. Link in body resolves to known phishing kit domain registered 2 days ago. 3 employees clicked.',
    category: 'Social Engineering',
    affectedSystems: ['mail-server', 'hr-workstations'],
    sparkline: [20, 18, 22, 19, 17, 16, 14],
  },
  {
    id: 'RPT-0035',
    type: 'Port Scan',
    severity: 'low',
    status: 'resolved',
    timestamp: '2026-04-03T17:22:00+05:30',
    source: '198.51.100.4',
    confidence: 65,
    tags: ['recon', 'scan', 'external'],
    reasoning: 'SYN scan from external IP across 1024 ports in 30 seconds. No successful connections. Standard internet noise pattern.',
    category: 'Reconnaissance',
    affectedSystems: ['firewall'],
    sparkline: [30, 28, 25, 22, 20, 18, 16],
  },
  {
    id: 'RPT-0034',
    type: 'Zero-Day Exploit',
    severity: 'critical',
    status: 'open',
    timestamp: '2026-04-03T16:55:00+05:30',
    source: '185.220.101.3',
    confidence: 93,
    tags: ['zero-day', 'rce', 'critical'],
    reasoning: 'Exploit payload matches unpublished vulnerability signature in web framework. RCE confirmed on staging. Patch not yet available.',
    category: 'Zero-Day',
    affectedSystems: ['web-frontend', 'app-server-01', 'app-server-02'],
    sparkline: [1, 2, 1, 3, 6, 9, 15],
  },
  {
    id: 'RPT-0033',
    type: 'DDoS Traffic',
    severity: 'high',
    status: 'investigating',
    timestamp: '2026-04-03T15:30:00+05:30',
    source: 'multiple',
    confidence: 95,
    tags: ['ddos', 'volumetric', 'cdn'],
    reasoning: 'Traffic volume 48x above baseline from 2,300+ IPs. UDP flood targeting port 53. CDN edge absorbing 82% but origin near saturation.',
    category: 'DoS/DDoS',
    affectedSystems: ['cdn-edge', 'dns-server'],
    sparkline: [5, 8, 12, 22, 38, 55, 80],
  },
  {
    id: 'RPT-0032',
    type: 'API Key Leak',
    severity: 'medium',
    status: 'resolved',
    timestamp: '2026-04-03T14:15:00+05:30',
    source: 'github-monitor',
    confidence: 99,
    tags: ['secret', 'api-key', 'github'],
    reasoning: 'Production AWS API key committed to public GitHub repository. Key was active for 23 minutes before revocation. No unauthorized API calls detected.',
    category: 'Secret Exposure',
    affectedSystems: ['aws-prod'],
    sparkline: [8, 7, 9, 8, 7, 8, 7],
  },
];

export const ACTIVITY_EVENTS: ActivityEvent[] = [
  { id: 'ACT-001', action: 'escalated', reportId: 'RPT-0039', actor: 'Arjun Mehta', timestamp: '2026-04-03T22:10:00+05:30', note: 'PII involved, escalating to DPO' },
  { id: 'ACT-002', action: 'approved', reportId: 'RPT-0037', actor: 'Priya Sharma', timestamp: '2026-04-03T21:45:00+05:30', note: 'Quarantine confirmed' },
  { id: 'ACT-003', action: 'rejected', reportId: 'RPT-0035', actor: 'Vikram Das', timestamp: '2026-04-03T21:20:00+05:30', note: 'Standard noise, closed' },
  { id: 'ACT-004', action: 'resolved', reportId: 'RPT-0036', actor: 'Neha Kapoor', timestamp: '2026-04-03T20:55:00+05:30' },
  { id: 'ACT-005', action: 'flagged', reportId: 'RPT-0041', actor: 'AI Engine', timestamp: '2026-04-03T22:14:00+05:30', note: 'Auto-flagged: CVE match' },
  { id: 'ACT-006', action: 'approved', reportId: 'RPT-0032', actor: 'Arjun Mehta', timestamp: '2026-04-03T20:30:00+05:30', note: 'Key revoked, no breach' },
];

export const CHART_DATA = Array.from({ length: 14 }, (_, i) => {
  const date = new Date('2026-03-21');
  date.setDate(date.getDate() + i);
  return {
    date: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    critical: rand(1, 8),
    high: rand(3, 15),
    medium: rand(5, 20),
    low: rand(8, 25),
    total: 0,
  };
}).map(d => ({ ...d, total: d.critical + d.high + d.medium + d.low }));

export const PIE_DATA = [
  { name: 'Injection', value: 18, color: 'oklch(62% 0.25 25)' },
  { name: 'Auth', value: 24, color: 'oklch(70% 0.20 45)' },
  { name: 'Malware', value: 14, color: 'oklch(78% 0.18 85)' },
  { name: 'Recon', value: 20, color: 'oklch(68% 0.18 145)' },
  { name: 'Zero-Day', value: 8, color: 'oklch(55% 0.22 270)' },
  { name: 'Other', value: 16, color: 'oklch(40% 0.008 260)' },
];

export const KPI_DATA = [
  {
    label: 'Total Threats',
    value: 247,
    change: 12.4,
    icon: 'shield-alert',
    caption: 'vs last week',
    sparkline: [30, 38, 28, 45, 52, 41, 58],
  },
  {
    label: 'Critical Alerts',
    value: 8,
    change: -18.2,
    icon: 'zap',
    caption: 'vs last week',
    sparkline: [12, 10, 8, 11, 9, 7, 8],
  },
  {
    label: 'Resolved',
    value: 189,
    change: 6.7,
    icon: 'check-circle',
    caption: 'vs last week',
    sparkline: [22, 28, 25, 31, 28, 34, 38],
  },
  {
    label: 'Avg. Response',
    value: '4.2m',
    change: -9.1,
    icon: 'timer',
    caption: 'vs last week',
    sparkline: [8, 7, 6, 5, 6, 4, 5],
    isTime: true,
  },
];
