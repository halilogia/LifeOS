/**
 * Network Diagnostics Types
 * Defines data structures for latency radar, protocol health (IPv4 vs IPv6),
 * DoH DNS speed, and bandwidth throughput measurements.
 */

export type PingStatus = "fast" | "moderate" | "slow" | "offline";

export interface PingTarget {
  id: string;
  name: string;
  category: "media" | "cdn" | "cloud" | "ai" | "developer";
  url: string;
  description: string;
}

export interface PingResult {
  targetId: string;
  name: string;
  category: PingTarget["category"];
  url: string;
  latencyMs: number;
  jitterMs: number;
  status: PingStatus;
  error?: string;
  timestamp: number;
}

export type Ipv6HealthStatus = "healthy" | "degraded" | "blocked" | "unsupported";

export interface ProtocolHealth {
  ipv4LatencyMs: number;
  ipv6LatencyMs: number | null;
  ipv6Status: Ipv6HealthStatus;
  issueDetected: boolean;
  message: string;
  details: string;
}

export interface SpeedTestResult {
  downloadSpeedMbps: number;
  peakSpeedMbps: number;
  latencyMs: number;
  jitterMs: number;
  bytesLoaded: number;
  durationMs: number;
  timestamp: number;
}

export interface DnsCheckResult {
  provider: string;
  endpoint: string;
  latencyMs: number;
  status: "fast" | "moderate" | "slow" | "failed";
}

export interface ConnectionInfo {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
  online: boolean;
}

export type OverallHealth = "excellent" | "good" | "fair" | "poor" | "offline";

export interface NetworkDiagnosticsReport {
  id: string;
  timestamp: number;
  overallHealth: OverallHealth;
  connectionInfo: ConnectionInfo;
  protocolHealth: ProtocolHealth;
  pingResults: PingResult[];
  speedTest?: SpeedTestResult;
  dnsChecks: DnsCheckResult[];
}
