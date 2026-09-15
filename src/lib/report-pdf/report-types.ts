export type EvidenceTag =
  | "Directly measured"
  | "Publicly detected"
  | "Customer provided"
  | "Third-party sourced"
  | "Estimated"
  | "Unknown"
  | "Not publicly verifiable";

export type PathChoice = "Optimize" | "Rebuild" | "Hybrid";

export type CategoryScores = {
  seo: number;
  geo: number;
  conversion: number;
  technical: number;
  aeo: number;
  ux: number;
  trust: number;
  leadgen: number;
};

export type CompetitorRow = {
  name: string;
  website: string;
  total: number;
  categories: CategoryScores;
  evidence: EvidenceTag;
  note: string;
  source?: "Google Maps" | "Google organic" | "Customer supplied" | "Industry benchmark";
  mapsRank?: number;
  organicRank?: number;
  rating?: number;
  reviewCount?: number;
  placeId?: string;
  discoveredAt?: string;
  query?: string;
};

export type CapabilityRow = {
  name: string;
  current: string;
  platform: string;
  status: "Present" | "Partial" | "Missing" | "Unknown" | "Not publicly verifiable";
};

export type Recommendation = {
  stage: "Immediate" | "First 30 days" | "Days 31–60" | "Days 61–90" | "Long-term";
  finding: string;
  evidence: string;
  impact: string;
  action: string;
  priority: "High" | "Medium" | "Later";
  implementation: string;
};

export type TechReadiness = {
  platform: string;
  hosting: string;
  domainDns: string;
  analytics: string;
  crm: string;
  scheduling: string;
  marketing: string;
  confirmed: string[];
  unknown: string[];
  accessStatus: string;
  transferability: string;
  restrictions: string;
  accessNeeded: string;
};

export type ComparisonReport = {
  reportNumber: string;
  reportDate: string;
  measurementDate: string;
  scoringVersion: string;
  companyName: string;
  website: string;
  industry: string;
  market: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  timeframe?: string;
  currentTotal: number;
  competitorAverage: number;
  marketLeader: number;
  potential: number;
  confidence: number;
  path: PathChoice;
  summary: {
    current: string;
    competitors: string;
    strongest: string;
    opportunities: string;
    holdingBack: string;
    demoreCan: string;
    nextStep: string;
  };
  categories: CategoryScores;
  scoringWeights?: CategoryScores;
  competitors: CompetitorRow[];
  competitorSelection: string;
  capabilities: CapabilityRow[];
  tech: TechReadiness;
  outlook: {
    current: string;
    websiteOnly: string;
    platform: string;
    maturity: Array<{ label: string; value: number }>;
    roadmap: Array<{ window: string; focus: string }>;
    priorities: Array<{ label: string; impact: number; effort: number }>;
  };
  recommendations: Recommendation[];
  methodology: {
    measured: string[];
    detected: string[];
    supplied: string[];
    sources: string[];
    benchmarks: string[];
    assumptions: string[];
    unknowns: string[];
    confidenceNote: string;
  };
};
