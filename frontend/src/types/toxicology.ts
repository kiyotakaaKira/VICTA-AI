export type ToxicologyChartPoint = {
  t: number;
  concentration: number;
  therapeutic_max?: number;
  lethal_threshold?: number;
};

export type ToxicologyAnalysis = {
  reasoning: string;
  lethal_probability: number;
  substances: { name: string; serum_concentration: string; interpretation: string }[];
  ingestion_hours_ago: number | null;
  dosage_estimate_mg: number | null;
  chart_series: ToxicologyChartPoint[];
  therapeutic_band: { min: number; max: number };
  lethal_threshold: number;
};
