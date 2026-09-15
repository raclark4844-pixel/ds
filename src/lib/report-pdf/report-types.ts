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
  estimatedMonthlyOrganicTraffic?: number;
};

export type PerformanceSignals = {
  measuredAt: string;
  pageSpeed: {
    status: "available" | "unavailable";
    source: string;
    performanceScore?: number;
    seoScore?: number;
    accessibilityScore?: number;
    lcpMs?: number;
    cls?: number;
    tbtMs?: number;
    note?: string;
  };
  coreWebVitals: {
    status: "available" | "insufficient_data" | "unavailable";
    source: string;
    assessment: string;
    lcpMs?: number;
    inpMs?: number;
    cls?: number;
  };
  searchConsole: { status: "connection_required" | "connected"; source: string; note: string };
  trafficEstimate: { status: "available" | "unavailable"; source: string; monthlyOrganic?: number; market?: string; note: string };
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

export type AccessComparison = {
  registrar: string;
  hostingProvider: string;
  siteCreator: string;
  codeAccess: string;
  enhanceFit: number;
  rebuildFit: number;
  recommendedPath: PathChoice;
  confidence: "High" | "Medium" | "Limited";
  explanation: string;
  rows: Array<{
    factor: string;
    enhanceCurrent: string;
    rebuild: string;
    advantage: string;
  }>;
  botOpportunities: Array<{
    name: string;
    currentSite: string;
    rebuild: string;
    businessValue: string;
  }>;
};

export type CustomerBrand = {
  name: string;
  website: string;
  logoUrl?: string;
  phone?: string;
  email?: string;
  address?: string;
  source: "Public website" | "Submitted information";
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
  customerBrand?: CustomerBrand;
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
  accessComparison?: AccessComparison;
  performance?: PerformanceSignals;
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
