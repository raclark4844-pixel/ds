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
  verify: string;
  improve: string;
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

export type IndustryCapability = {
  id: string;
  label: string;
  why: string;
  verify: string;
  improve: string;
  effort: ReviewEffort;
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
  capabilities: IndustryCapability[];
};

export type PublicFiles = {
  robots?: string;
  sitemap?: string;
  llms?: string;
};

export type WebsiteReviewReport = {
  contact?: import("./contact").ReviewContact;
  ownerReview?: boolean;
  publicContacts?: import("./contact").PublicContact[];
  version: 3;
  recordId: string;
  createdAt: string;
  current: ReviewPage;
  benchmark: ReviewPage;
  industry: ReviewIndustry;
  categories: ReviewCategory[];
  recommendations: ReviewCheck[];
  offerings: Array<[string, string]>;
  methodology: string;
  assistantBrief: string;
};
