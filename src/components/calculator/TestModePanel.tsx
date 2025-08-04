import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon, FlaskConicalIcon, HistoryIcon, PlayIcon } from 'lucide-react';

interface TestSnapshot {
  id: string;
  name: string;
  date: string;
  xrpPrice: number;
  totalOI: number;
  fundingRate: number;
  longShortRatio: number;
  estimatedFloat: number;
  description: string;
}

interface TestModePanelProps {
  isTestMode: boolean;
  onTestModeChange: (enabled: boolean) => void;
  onSnapshotSelect: (snapshot: TestSnapshot | null) => void;
  currentSnapshot: TestSnapshot | null;
}

const HISTORICAL_SNAPSHOTS: TestSnapshot[] = [
  {
    id: 'aug3_6pm',
    name: 'Aug 3rd - 6 PM UTC',
    date: '2024-08-03T18:00:00Z',
    xrpPrice: 0.62,
    totalOI: 2400000000,
    fundingRate: -0.001,
    longShortRatio: 0.8,
    estimatedFloat: 6500000000,
    description: 'Market crash day - High short pressure, negative funding'
  },
  {
    id: 'nov_rally',
    name: 'November Rally Peak',
    date: '2024-11-14T12:00:00Z',
    xrpPrice: 1.45,
    totalOI: 3800000000,
    fundingRate: 0.0015,
    longShortRatio: 2.1,
    estimatedFloat: 8200000000,
    description: 'Bull run peak - Extreme long bias, high funding rates'
  },
  {
    id: 'current_bull',
    name: 'Current Bull Phase',
    date: '2025-01-15T10:00:00Z',
    xrpPrice: 3.08,
    totalOI: 4200000000,
    fundingRate: 0.0008,
    longShortRatio: 1.6,
    estimatedFloat: 9100000000,
    description: 'Strong uptrend - Moderate long bias, elevated float'
  },
  {
    id: 'equilibrium',
    name: 'Market Equilibrium',
    date: '2024-09-15T14:30:00Z',
    xrpPrice: 0.58,
    totalOI: 1800000000,
    fundingRate: 0.0001,
    longShortRatio: 1.05,
    estimatedFloat: 5200000000,
    description: 'Balanced market - Neutral sentiment, low volatility'
  },
  {
    id: 'bear_extreme',
    name: 'Bear Market Extreme',
    date: '2024-07-05T08:00:00Z',
    xrpPrice: 0.45,
    totalOI: 900000000,
    fundingRate: -0.002,
    longShortRatio: 0.6,
    estimatedFloat: 3800000000,
    description: 'Extreme bearishness - Heavy short bias, very negative funding'
  }
];

export function TestModePanel({ 
  isTestMode, 
  onTestModeChange, 
  onSnapshotSelect, 
  currentSnapshot 
}: TestModePanelProps) {
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string>('');

  const handleSnapshotChange = (snapshotId: string) => {
    setSelectedSnapshotId(snapshotId);
    const snapshot = HISTORICAL_SNAPSHOTS.find(s => s.id === snapshotId);
    onSnapshotSelect(snapshot || null);
  };

  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(4)}`;
  };

  const formatXRP = (amount: number): string => {
    if (amount >= 1e9) return `${(amount / 1e9).toFixed(2)}B XRP`;
    if (amount >= 1e6) return `${(amount / 1e6).toFixed(1)}M XRP`;
    return `${(amount / 1e3).toFixed(0)}K XRP`;
  };

  const formatFundingRate = (rate: number): string => {
    return `${(rate * 100).toFixed(4)}%`;
  };

  return (
    <Card className={isTestMode ? 'border-orange-500 bg-orange-50/50' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FlaskConicalIcon className="h-5 w-5" />
          Developer Test Mode
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>Simulate historical market conditions to test the calculator's behavior during different market scenarios. Perfect for demos and video walkthroughs.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {isTestMode && (
            <Badge variant="destructive" className="ml-auto">
              Test Mode Active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Test Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="test-mode">Enable Test Mode</Label>
            <div className="text-sm text-muted-foreground">
              Use historical market snapshots for testing
            </div>
          </div>
          <Switch
            id="test-mode"
            checked={isTestMode}
            onCheckedChange={(checked) => {
              onTestModeChange(checked);
              if (!checked) {
                setSelectedSnapshotId('');
                onSnapshotSelect(null);
              }
            }}
          />
        </div>

        {isTestMode && (
          <>
            {/* Snapshot Selection */}
            <div className="space-y-2">
              <Label>Historical Snapshot</Label>
              <Select value={selectedSnapshotId} onValueChange={handleSnapshotChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a historical scenario..." />
                </SelectTrigger>
                <SelectContent>
                  {HISTORICAL_SNAPSHOTS.map((snapshot) => (
                    <SelectItem key={snapshot.id} value={snapshot.id}>
                      <div className="flex items-center gap-2">
                        <HistoryIcon className="h-4 w-4" />
                        {snapshot.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Current Snapshot Details */}
            {currentSnapshot && (
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <PlayIcon className="h-4 w-4 text-orange-600" />
                  <span className="font-medium">{currentSnapshot.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {new Date(currentSnapshot.date).toLocaleDateString()}
                  </Badge>
                </div>
                
                <div className="text-sm text-muted-foreground mb-3">
                  {currentSnapshot.description}
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-muted-foreground">XRP Price</div>
                    <div className="font-medium">{formatCurrency(currentSnapshot.xrpPrice)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Total OI</div>
                    <div className="font-medium">{formatXRP(currentSnapshot.totalOI)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Funding Rate</div>
                    <div className={`font-medium ${
                      currentSnapshot.fundingRate > 0 ? 'text-green-600' : 
                      currentSnapshot.fundingRate < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {formatFundingRate(currentSnapshot.fundingRate)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">L/S Ratio</div>
                    <div className={`font-medium ${
                      currentSnapshot.longShortRatio > 1.2 ? 'text-green-600' :
                      currentSnapshot.longShortRatio < 0.8 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {currentSnapshot.longShortRatio.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Estimated Float: </span>
                    <span className="font-medium">{formatXRP(currentSnapshot.estimatedFloat)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Warning */}
            <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <div className="h-5 w-5 text-orange-600 mt-0.5">⚠️</div>
                <div className="text-sm">
                  <div className="font-medium text-orange-800 mb-1">Test Mode Active</div>
                  <div className="text-orange-700">
                    Calculator is using simulated historical data. Results are for demonstration purposes only and do not reflect current market conditions.
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}