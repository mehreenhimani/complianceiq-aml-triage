export type RiskTier = 'Critical' | 'High' | 'Medium' | 'Low';
export type AlertStatus = 'Open' | 'In Review' | 'Resolved' | 'Escalated';
export type AlertCategory =
  | 'Suspicious Transaction'
  | 'KYC Flag'
  | 'Sanctions Hit'
  | 'Unusual Account Activity'
  | 'PEP Match'
  | 'Structuring Pattern';

export type EntityType = 'Person' | 'Company' | 'Account' | 'Country';

export interface ExtractedEntity {
  type: EntityType;
  value: string;
}

export interface ComplianceAlert {
  id: string;
  timestamp: Date;
  alertType: string;
  riskScore: number;
  riskTier: RiskTier;
  status: AlertStatus;
  entityName: string;
  transactionAmount: number;
  country: string;
  alertCategory: AlertCategory;
  analystId: string | null;
  timeToResolution: number | null;
  aiConfidence: number;
  aiReasoning: string;
  similarCases: string[];
  extractedEntities: ExtractedEntity[];
  transactionPattern: string;
  feedbackHelpful: boolean | null;
  notes?: string;
}

export interface Settings {
  autoEscalationThreshold: number;
  requireHumanReviewCritical: boolean;
  autoDismissLowRisk: boolean;
  maxAlertsPerAnalyst: number;
  logAllDecisions: boolean;
  requireSignOffCritical: boolean;
  explainabilityRequired: boolean;
}

export interface ComplianceRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  active: boolean;
}
