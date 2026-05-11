export interface EvidenceAnalysis {
  summary: string;
  risk_score: number;
  tags: string[];
  suspicious_indicators: string[];
  confidence: number;
  recommended_actions: string[];
  authenticity_score: number;
}

export interface Evidence {
  id: string;
  case_id: string;
  name: string;
  type: string | null;
  url: string | null;
  size: number;
  analysis: EvidenceAnalysis | null;
  risk_score: number;
  authenticity_score: number;
  uploaded_by: string | null;
  created_at: string;
}

export interface UploadEvidencePayload {
  caseId: string;
  name?: string;
  type?: string;
  file?: File;
}
