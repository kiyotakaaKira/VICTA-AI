/** React Query keys — keep in sync with realtime invalidation */
export const QK = {
  dashboardStats: ['dashboard', 'stats'] as const,
  dashboardCharts: ['dashboard', 'charts'] as const,
  telemetry: ['dashboard', 'telemetry'] as const,
  intelligenceFeed: ['intelligence-feed'] as const,
  recentInsights: ['dashboard', 'insights'] as const,
  analyticsOverview: ['analytics', 'overview'] as const,
  cases: (status?: string) => ['cases', status] as const,
  case: (id: string | null) => ['case', id] as const,
  graph: (id: string | null) => ['graph', id] as const,
};
