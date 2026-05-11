/**
 * lib/constants.ts
 * Shared constants for types, severity levels, colors, and configuration.
 */

// ─────────────────────────────────────────
// STATUS / PRIORITY / SEVERITY
// ─────────────────────────────────────────

export type Status = 'active' | 'pending' | 'closed' | 'archived';
export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type EventType = 'digital' | 'physical' | 'financial' | 'legal' | 'movement' | 'communication';
export type NodeType = 'case' | 'person' | 'location' | 'evidence' | 'device' | 'organization' | 'insight';

// ─────────────────────────────────────────
// SEVERITY COLORS
// ─────────────────────────────────────────

export const SEVERITY_COLORS: Record<Severity, { text: string; bg: string; border: string }> = {
  critical: { text: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)' },
  high:     { text: '#f97316', bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.3)' },
  medium:   { text: '#eab308', bg: 'rgba(234,179,8,0.12)',   border: 'rgba(234,179,8,0.3)' },
  low:      { text: '#22c55e', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.3)' },
  info:     { text: '#06b6d4', bg: 'rgba(6,182,212,0.12)',   border: 'rgba(6,182,212,0.3)' },
};

// ─────────────────────────────────────────
// EVENT TYPE CONFIG
// ─────────────────────────────────────────

export const EVENT_TYPES: Record<EventType, { label: string; color: string }> = {
  digital:       { label: 'Digital',       color: '#06b6d4' },
  physical:      { label: 'Physical',      color: '#f97316' },
  financial:     { label: 'Financial',     color: '#22c55e' },
  legal:         { label: 'Legal',         color: '#8b5cf6' },
  movement:      { label: 'Movement',      color: '#eab308' },
  communication: { label: 'Comms',         color: '#ec4899' },
};

// ─────────────────────────────────────────
// GRAPH NODE TYPE CONFIG
// ─────────────────────────────────────────

export const NODE_TYPES: Record<NodeType, { label: string; color: string }> = {
  case:         { label: 'Case',         color: '#06b6d4' },
  person:       { label: 'Person',       color: '#f97316' },
  location:     { label: 'Location',     color: '#22c55e' },
  evidence:     { label: 'Evidence',     color: '#eab308' },
  device:       { label: 'Device',       color: '#8b5cf6' },
  organization: { label: 'Organization', color: '#ec4899' },
  insight:      { label: 'AI Insight',   color: '#06b6d4' },
};

// ─────────────────────────────────────────
// RISK THRESHOLDS
// ─────────────────────────────────────────

export const RISK_THRESHOLDS = {
  critical: 80,
  high:     60,
  medium:   40,
  low:      0,
} as const;

// ─────────────────────────────────────────
// AI MODEL CONFIG
// ─────────────────────────────────────────

export const GEMINI_MODEL = 'gemini-1.5-flash';
export const GEMINI_MAX_TOKENS = 2048;
export const DEFAULT_RISK_SCORE = 0;
export const DEFAULT_CONFIDENCE = 50;

// ─────────────────────────────────────────
// API CONFIG
// ─────────────────────────────────────────

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
export const WS_BASE = API_BASE.replace(/^http/, 'ws');
