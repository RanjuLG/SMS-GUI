import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { 
  SystemHealth,
  DatabaseHealth,
  ServiceHealth,
  BackupStatus,
  StorageUsage,
  SystemMetrics,
  ApplicationLogs,
  SecurityStatus,
  SystemHealthOverview,
  HealthPing
} from '../Components/overview/system-health.model';

@Injectable({
  providedIn: 'root'
})
export class MockHealthService {

  constructor() { }

  /**
   * Mock system health data for testing
   */
  getSystemHealth(): Observable<SystemHealth> {
    const mockData: SystemHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: 86400,
      environment: 'production'
    };
    return of(mockData).pipe(delay(500));
  }

  getDatabaseHealth(): Observable<DatabaseHealth> {
    const mockData: DatabaseHealth = {
      status: 'connected',
      connectionPool: {
        active: 5,
        idle: 10,
        max: 20
      },
      responseTime: 45,
      lastChecked: new Date().toISOString(),
      uptime: 99.9
    };
    return of(mockData).pipe(delay(300));
  }

  getServicesHealth(): Observable<ServiceHealth> {
    const mockData: ServiceHealth = {
      status: 'healthy',
      services: [
        {
          name: 'auth-service',
          status: 'healthy',
          responseTime: 120,
          lastChecked: new Date().toISOString()
        },
        {
          name: 'invoice-service',
          status: 'healthy',
          responseTime: 89,
          lastChecked: new Date().toISOString()
        },
        {
          name: 'customer-service',
          status: 'healthy',
          responseTime: 95,
          lastChecked: new Date().toISOString()
        },
        {
          name: 'inventory-service',
          status: 'healthy',
          responseTime: 78,
          lastChecked: new Date().toISOString()
        }
      ]
    };
    return of(mockData).pipe(delay(400));
  }

  getBackupStatus(): Observable<BackupStatus> {
    const twoHoursAgo = new Date();
    twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);
    
    const mockData: BackupStatus = {
      status: 'success',
      lastBackup: {
        timestamp: twoHoursAgo.toISOString(),
        duration: 1800,
        size: '2.4GB',
        type: 'full'
      },
      nextScheduled: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      retentionDays: 30,
      backupLocation: 'cloud-storage'
    };
    return of(mockData).pipe(delay(350));
  }

  getStorageUsage(): Observable<StorageUsage> {
    const mockData: StorageUsage = {
      database: {
        used: '1.2GB',
        total: '5GB',
        percentage: 24,
        status: 'normal'
      },
      files: {
        used: '850MB',
        total: '2GB',
        percentage: 42.5,
        status: 'normal'
      },
      logs: {
        used: '150MB',
        total: '500MB',
        percentage: 30,
        status: 'normal'
      }
    };
    return of(mockData).pipe(delay(200));
  }

  getSystemMetrics(): Observable<SystemMetrics> {
    const mockData: SystemMetrics = {
      cpu: {
        usage: 45.2,
        cores: 4,
        status: 'normal'
      },
      memory: {
        used: '2.1GB',
        total: '8GB',
        percentage: 26.25,
        status: 'normal'
      },
      network: {
        inbound: '1.2MB/s',
        outbound: '800KB/s',
        status: 'normal'
      }
    };
    return of(mockData).pipe(delay(300));
  }

  getApplicationLogs(): Observable<ApplicationLogs> {
    const mockData: ApplicationLogs = {
      errors: {
        last24h: 2,
        last7d: 15,
        status: 'low'
      },
      warnings: {
        last24h: 8,
        last7d: 45,
        status: 'low'
      },
      logLevel: 'info',
      lastError: {
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        message: 'Database connection timeout',
        level: 'error'
      }
    };
    return of(mockData).pipe(delay(250));
  }

  getSecurityStatus(): Observable<SecurityStatus> {
    const mockData: SecurityStatus = {
      status: 'secure',
      lastSecurityScan: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      vulnerabilities: {
        critical: 0,
        high: 0,
        medium: 2,
        low: 5
      },
      certificates: {
        ssl: {
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          daysUntilExpiry: 365,
          status: 'valid'
        }
      }
    };
    return of(mockData).pipe(delay(400));
  }

  getSystemHealthOverview(): Observable<SystemHealthOverview> {
    // This would combine all the above data
    const mockData: SystemHealthOverview = {
      general: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: 86400,
        version: '1.0.0'
      },
      database: {
        status: 'connected',
        connectionPool: { active: 5, idle: 10, max: 20 },
        responseTime: 45,
        lastChecked: new Date().toISOString(),
        uptime: 99.9
      },
      services: {
        status: 'operational',
        services: [],
        overallUptime: 100
      },
      backup: {
        status: 'success',
        lastBackup: {
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          duration: 1800,
          size: '2.4GB',
          type: 'full'
        },
        nextScheduled: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        retentionDays: 30,
        backupLocation: 'cloud-storage'
      },
      storage: {
        database: {
          used: '1.2GB',
          total: '5GB',
          percentage: 24,
          status: 'normal'
        },
        files: {
          used: '850MB',
          total: '2GB',
          percentage: 42.5,
          status: 'normal'
        },
        logs: {
          used: '150MB',
          total: '500MB',
          percentage: 30,
          status: 'normal'
        }
      }
    };
    return of(mockData).pipe(delay(600));
  }
}
