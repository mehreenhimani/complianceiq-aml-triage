import { ComplianceAlert, AlertCategory, RiskTier, AlertStatus, ComplianceRule } from '../types';

const europeanNames = [
  'Hans Müller', 'Sophie Laurent', 'Marco Rossi', 'Anna Kowalski', 'Jan de Vries',
  'Maria García', 'Olaf Hansen', 'Elena Popescu', 'Lukas Schmidt', 'Isabella Ferrari',
  'Mikael Andersson', 'Claire Dubois', 'Antonio Silva', 'Katarina Novak', 'Peter Jensen',
  'Emma Johansson', 'François Martin', 'Lucia Bianchi', 'Gustav Svensson', 'Nina Petrova',
  'Oscar Nielsen', 'Amelie Müller', 'Paolo Conti', 'Zuzana Horvath', 'Erik Larsson',
  'Camille Bernard', 'Matteo Ricci', 'Petra Kovacs', 'Lars Olsen', 'Isabelle Leroy'
];

const companyNames = [
  'Nordic Trade Solutions AB', 'Mediterranean Logistics GmbH', 'Baltic Finance Corp',
  'Adriatic Imports Ltd', 'Alpine Investment Group', 'Scandinavian Holdings SA',
  'Iberian Export Partners', 'Carpathian Mining Co', 'Aegean Shipping Lines',
  'Pyrenees Capital Management', 'Danube Trading House', 'Rhine Commerce AG',
  'Balkan Industrial Holdings', 'North Sea Resources', 'Vistula Investment Fund',
  'Thames Financial Services', 'Seine Business Solutions', 'Tiber Trading SPRL',
  'Elbe Commodities Group', 'Tagus Capital Partners', 'Dnieper Export Corp',
  'Volga Industries Ltd', 'Danube Ventures SA', 'Rhine Holdings BV'
];

const euCountries = [
  'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Austria',
  'Sweden', 'Poland', 'Romania', 'Greece', 'Portugal', 'Czech Republic',
  'Hungary', 'Denmark', 'Finland', 'Slovakia', 'Ireland', 'Croatia', 'Bulgaria'
];

const highRiskCountries = ['Iran', 'North Korea', 'Syria', 'Venezuela', 'Myanmar'];

const categories: AlertCategory[] = [
  'Suspicious Transaction',
  'KYC Flag',
  'Sanctions Hit',
  'Unusual Account Activity',
  'PEP Match',
  'Structuring Pattern'
];

const aiReasoningTemplates = [
  'Transaction pattern matches known money laundering schemes with multiple sequential transfers below reporting thresholds. Entity has historical flagged activity in similar jurisdictions. Cross-reference with sanctions database shows indirect business relationships.',
  'KYC documentation expired over 180 days ago. Recent surge in transaction velocity (300% increase) combined with geographic risk factors. Entity beneficial ownership structure recently modified without proper disclosure.',
  'Direct match against OFAC sanctions list. Entity name variation detected through fuzzy matching algorithms. Associated shell companies identified in Panama Papers leak database.',
  'Unusual account activity detected: dormant account suddenly active with large transfers. Transaction amounts structured to avoid automatic reporting. Geographic spread across high-risk jurisdictions indicates layering.',
  'Political Exposure Person (PEP) match with 94% confidence. Family member previously flagged for corruption investigation. Transaction amounts inconsistent with declared income sources.',
  'Structuring pattern identified: 12 transactions over 72 hours, each below €10,000. Same beneficiary across multiple transactions. Pattern consistent with known smurfing techniques.',
  'Large cash deposits followed by immediate wire transfers abroad. Destination accounts in high-risk jurisdictions. No clear business purpose documented for transactions.',
  'Entity operates in high-risk sector (precious metals/gems). Recent transactions with counterparties in sanctioned territories. Insufficient due diligence documentation on file.'
];

const transactionPatterns = [
  'Multiple small deposits followed by large wire transfer',
  'Rapid movement of funds through multiple accounts',
  'Layered transactions across different jurisdictions',
  'Round-number transactions with no clear business purpose',
  'Transactions with sanctioned or high-risk entities',
  'Unusual cash-intensive business activity',
  'Complex corporate structure masking beneficial ownership',
  'High-value transactions inconsistent with customer profile'
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min: number, max: number, decimals: number = 2): number {
  return Number((Math.random() * (max - min) + min).toFixed(decimals));
}

function generateRiskScore(tier: RiskTier): number {
  switch (tier) {
    case 'Critical': return getRandomInt(85, 100);
    case 'High': return getRandomInt(70, 84);
    case 'Medium': return getRandomInt(50, 69);
    case 'Low': return getRandomInt(0, 49);
  }
}

function generateTimeToResolution(status: AlertStatus): number | null {
  if (status === 'Open') return null;
  if (status === 'In Review') return null;
  return getRandomInt(30, 720);
}

function generateAnalystId(status: AlertStatus): string | null {
  if (status === 'Open') return Math.random() > 0.5 ? null : `analyst${getRandomInt(1, 5)}`;
  return `analyst${getRandomInt(1, 5)}`;
}

function getCountry(riskTier: RiskTier): string {
  if (riskTier === 'Critical' && Math.random() > 0.6) {
    return getRandomElement(highRiskCountries);
  }
  if (riskTier === 'High' && Math.random() > 0.8) {
    return getRandomElement(highRiskCountries);
  }
  return getRandomElement(euCountries);
}

export function generateMockAlerts(count: number = 200): ComplianceAlert[] {
  const alerts: ComplianceAlert[] = [];
  const now = new Date();

  const riskTierDistribution: RiskTier[] = [
    ...Array(60).fill('Critical'),
    ...Array(50).fill('High'),
    ...Array(60).fill('Medium'),
    ...Array(30).fill('Low')
  ];

  const statusDistribution: AlertStatus[] = [
    ...Array(80).fill('Open'),
    ...Array(40).fill('In Review'),
    ...Array(60).fill('Resolved'),
    ...Array(20).fill('Escalated')
  ];

  for (let i = 0; i < count; i++) {
    const riskTier = riskTierDistribution[i % riskTierDistribution.length];
    const status = statusDistribution[i % statusDistribution.length];
    const category = getRandomElement(categories);
    const isCompany = Math.random() > 0.4;
    const entityName = isCompany ? getRandomElement(companyNames) : getRandomElement(europeanNames);
    const country = getCountry(riskTier);

    const daysAgo = getRandomInt(0, 90);
    const timestamp = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    timestamp.setHours(getRandomInt(0, 23), getRandomInt(0, 59), getRandomInt(0, 59));

    const similarCaseIds: string[] = [];
    const numSimilarCases = getRandomInt(2, 3);
    for (let j = 0; j < numSimilarCases; j++) {
      similarCaseIds.push(`ALT-${String(getRandomInt(10000, 99999)).padStart(5, '0')}`);
    }

    const extractedEntities = [
      { type: 'Person' as const, value: isCompany ? `${getRandomElement(europeanNames.slice(0, 10))} (Director)` : entityName },
      { type: 'Company' as const, value: isCompany ? entityName : `${getRandomElement(companyNames.slice(0, 10))}` },
      { type: 'Account' as const, value: `${country.substring(0, 2).toUpperCase()}${getRandomInt(10, 99)}${String(getRandomInt(1000000000, 9999999999))}` },
      { type: 'Country' as const, value: country }
    ];

    alerts.push({
      id: `ALT-${String(100000 + i).substring(1)}`,
      timestamp,
      alertType: `${category} - Type ${getRandomInt(1, 3)}`,
      riskScore: generateRiskScore(riskTier),
      riskTier,
      status,
      entityName,
      transactionAmount: getRandomFloat(500, 2000000, 2),
      country,
      alertCategory: category,
      analystId: generateAnalystId(status),
      timeToResolution: generateTimeToResolution(status),
      aiConfidence: getRandomFloat(0.65, 0.99, 2),
      aiReasoning: getRandomElement(aiReasoningTemplates),
      similarCases: similarCaseIds,
      extractedEntities,
      transactionPattern: getRandomElement(transactionPatterns),
      feedbackHelpful: status === 'Resolved' ? Math.random() > 0.3 : null
    });
  }

  return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export const defaultRules: ComplianceRule[] = [
  {
    id: 'rule-1',
    name: 'Sanctions Screening Hit',
    condition: 'Match against OFAC/EU sanctions lists',
    action: 'Always Escalate',
    active: true
  },
  {
    id: 'rule-2',
    name: 'PEP High-Value Transaction',
    condition: 'PEP Match + Amount >€50,000',
    action: 'Flag for Senior Review',
    active: true
  },
  {
    id: 'rule-3',
    name: 'Structuring Pattern Detection',
    condition: '3+ transactions <€10,000 in 24hrs',
    action: 'Auto-flag',
    active: true
  },
  {
    id: 'rule-4',
    name: 'KYC Expiry Alert',
    condition: 'KYC documentation expired >180 days',
    action: 'Generate Alert',
    active: true
  },
  {
    id: 'rule-5',
    name: 'High-Risk Jurisdiction Large Transaction',
    condition: 'High-risk jurisdiction + Amount >€100,000',
    action: 'Require dual approval',
    active: true
  },
  {
    id: 'rule-6',
    name: 'Unusual Transaction Velocity',
    condition: '>10 transactions/hour',
    action: 'Freeze + Alert',
    active: true
  }
];
