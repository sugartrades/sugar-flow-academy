import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface LoadingOptimizerProps {
  isLoading: boolean;
  error?: string | null;
  dataSource?: string;
  lastUpdated?: Date;
  onRefresh?: () => void;
  children: React.ReactNode;
}

export function LoadingOptimizer({
  isLoading,
  error,
  dataSource,
  lastUpdated,
  onRefresh,
  children
}: LoadingOptimizerProps) {
  const isLiveData = dataSource === 'live';
  const isStaleData = lastUpdated && (Date.now() - lastUpdated.getTime()) > 5 * 60 * 1000; // 5 minutes

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">
              Loading market data...
            </span>
          </div>
          <div className="max-w-sm mx-auto">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
          </div>
        </div>

        {/* Skeleton for main content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Data source and freshness indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          {isLiveData ? (
            <Wifi className="h-3 w-3 text-green-500" />
          ) : (
            <WifiOff className="h-3 w-3 text-orange-500" />
          )}
          <span>
            {isLiveData ? 'Live Data' : 'Cached Data'}
            {lastUpdated && (
              <span className="ml-1">
                • Updated {Math.round((Date.now() - lastUpdated.getTime()) / 60000)}m ago
              </span>
            )}
          </span>
        </div>

        {onRefresh && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRefresh}
            className="h-7 px-2"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        )}
      </div>

      {/* Error or stale data warning */}
      {(error || isStaleData) && (
        <Alert>
          <AlertDescription className="text-sm">
            {error ? (
              <>⚠️ Using cached data due to API issues: {error}</>
            ) : isStaleData ? (
              <>📊 Data is older than 5 minutes. Refresh for latest information.</>
            ) : null}
          </AlertDescription>
        </Alert>
      )}

      {children}
    </div>
  );
}