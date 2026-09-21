export type ReviewStatus = "Detected" | "Not detected" | "Not applicable" | "Unavailable";
export type ReviewEffort = "Quick win" | "Build next";

export type ReviewCheck = {
  id: string;
  category: string;
  label: string;
  offer: string;
  action: string;
  effort: ReviewEffort;
  status: ReviewStatus;
  evidence: string;
};

export type ReviewPage = {
  url: string;
  title: string;
  checks: ReviewCheck[];
  unavailable?: boolean;
};

export type ReviewCategory = {
  name: string;
  detected: number;
  total: number;
};

export type ReviewIndustry = {
  id: string;
  name: string;
  source: string;
  evidence: string;
  journey: string;
  conversion: string;
  measure: string;
  sources: string[];
};

export type WebsiteReviewReport = {
  version: 2;
  recordId: string;
  createdAt: string;
  current: ReviewPage;
  benchmark: ReviewPage;
  industry: ReviewIndustry;
  categories: ReviewCategory[];
  recommendations: ReviewCheck[];
  offerings: Array<[string, string]>;
  methodology: string;
};
