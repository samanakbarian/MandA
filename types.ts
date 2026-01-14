export interface FinancialMetric {
  year: string;
  revenue: number;
  ebitda: number;
  netIncome: number;
  profitMargin: number;
}

export interface SWOTItem {
  id: number;
  type: 'strength' | 'weakness' | 'opportunity' | 'threat';
  content: string;
}

export interface RiskFactor {
  category: 'Financial' | 'Legal' | 'ESG' | 'Operational';
  riskLevel: 'Low' | 'Medium' | 'High';
  description: string;
}

export interface CompanyAnalysis {
  companyName: string;
  website?: string; // Official website URL
  executiveSummary: string;
  metrics: FinancialMetric[];
  swot: SWOTItem[];
  risks: RiskFactor[];
  cagr: number; // Compound Annual Growth Rate
  lastUpdated: string;
  sources?: string[]; // URLs found via search
}

export enum AppState {
  UPLOAD = 'UPLOAD',
  SOURCING = 'SOURCING', // New state for inputting search criteria
  SOURCING_RESULTS = 'SOURCING_RESULTS', // New state for viewing list of companies
  ANALYZING = 'ANALYZING',
  DASHBOARD = 'DASHBOARD',
  ERROR = 'ERROR'
}

export interface AnalysisRequest {
  companyName: string;
  additionalContext?: string;
}

// --- New Types for Project Insight 2.0 ---

export interface SourcingCriteria {
  region: string;
  industry: string;
  revenueRange: string;
  techStack: string;
}

export interface CandidateProfile {
  id: string;
  name: string;
  shortDescription: string;
  location: string;
  estimatedRevenue: string;
  techStackTags: string[];
  matchScore: number; // 0-100
  matchRationale: string;
  growthSignals: string; // e.g. "Hiring aggressively", "New product launch"
  website?: string;
}