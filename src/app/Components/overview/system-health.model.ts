export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  environment: string;
}

export interface DatabaseHealth {
  status: 'connected' | 'disconnected' | 'error';
  responseTime: number;
  lastChecked: string;
  uptime: number;
  connectionPool: {
    active: number;
    idle: number;
    max: number;
  };
}

export interface ServiceHealthItem {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  lastChecked: string;
}

export interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: ServiceHealthItem[];
}

export interface BackupInfo {
  timestamp: string;
  duration: number; // seconds
  size: string;
  type: 'full' | 'incremental' | 'differential' | 'none';
}

export interface BackupStatus {
  status: 'success' | 'failed' | 'running' | 'no-backup' | 'error';
  lastBackup: BackupInfo;
  nextScheduled: string;
  retentionDays: number;
  backupLocation: string;
}

export interface StorageComponent {
  used: string;
  total: string;
  percentage: number;
  status: 'normal' | 'warning' | 'critical';
}

export interface StorageUsage {
  database: StorageComponent;
  files: StorageComponent;
  logs: StorageComponent;
}

export interface CpuMetrics {
  usage: number;
  cores: number;
  status: 'normal' | 'warning' | 'critical';
}

export interface MemoryMetrics {
  used: string;
  total: string;
  percentage: number;
  status: 'normal' | 'warning' | 'critical';
}

export interface NetworkMetrics {
  inbound: string;
  outbound: string;
  status: 'normal' | 'high' | 'warning';
}

export interface SystemMetrics {
  cpu: CpuMetrics;
  memory: MemoryMetrics;
  network: NetworkMetrics;
}

export interface LogMetrics {
  last24h: number;
  last7d: number;
  status: 'normal' | 'medium' | 'high';
}

export interface LastError {
  timestamp: string;
  message: string;
  level: string;
}

export interface ApplicationLogs {
  errors: LogMetrics;
  warnings: LogMetrics;
  logLevel: string;
  lastError?: LastError;
}

export interface Certificates {
  status: 'valid' | 'expiring' | 'expired';
  expiryDate: string;
  daysUntilExpiry: number;
}

export interface SecurityStatus {
  status: 'secure' | 'warning' | 'critical';
  lastSecurityScan: string;
  certificates: Certificates;
  authenticationFailures: number;
  activeTokens: number;
}

export interface HealthOverviewGeneral {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  environment: string;
}

export interface HealthOverviewDatabase {
  status: 'connected' | 'disconnected' | 'error';
  responseTime: number;
}

export interface HealthOverviewServices {
  status: 'healthy' | 'degraded' | 'unhealthy';
  healthyCount: number;
  totalCount: number;
}

export interface HealthOverviewBackup {
  status: 'success' | 'failed' | 'running' | 'no-backup' | 'error';
  lastBackup: BackupInfo;
}

export interface HealthOverviewStorage {
  database: { percentage: number; status: 'normal' | 'warning' | 'critical' };
  files: { percentage: number; status: 'normal' | 'warning' | 'critical' };
  logs: { percentage: number; status: 'normal' | 'warning' | 'critical' };
}

export interface HealthOverviewMetrics {
  cpu: { usage: number; status: 'normal' | 'warning' | 'critical' };
  memory: { percentage: number; status: 'normal' | 'warning' | 'critical' };
  network: { status: 'normal' | 'high' | 'warning' };
}

export interface SystemHealthOverview {
  general: HealthOverviewGeneral;
  database: HealthOverviewDatabase;
  services: HealthOverviewServices;
  backup: HealthOverviewBackup;
  storage: HealthOverviewStorage;
  metrics: HealthOverviewMetrics;
}

export interface HealthPing {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
}
