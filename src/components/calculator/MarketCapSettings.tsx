import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { InfoIcon, SettingsIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MarketCapSettingsProps {
  derivativesEnabled: boolean;
  onDerivativesToggle: (enabled: boolean) => void;
  updateFrequency: number;
  onUpdateFrequencyChange: (frequency: number) => void;
  dataSource: string;
  onDataSourceChange: (source: string) => void;
  leverageAmplifier: number;
  onLeverageAmplifierChange: (amplifier: number) => void;
}

export function MarketCapSettings({
  derivativesEnabled,
  onDerivativesToggle,
  updateFrequency,
  onUpdateFrequencyChange,
  dataSource,
  onDataSourceChange,
  leverageAmplifier,
  onLeverageAmplifierChange
}: MarketCapSettingsProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5" />
          Calculator Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Derivatives Integration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Label htmlFor="derivatives-toggle">Include Derivatives Data</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Incorporates futures market data like Open Interest, Long/Short ratios,<br />
                    and funding rates for more realistic price impact modeling</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="derivatives-toggle"
                checked={derivativesEnabled}
                onCheckedChange={onDerivativesToggle}
              />
              <Badge variant={derivativesEnabled ? "default" : "secondary"}>
                {derivativesEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </div>
          
          {derivativesEnabled && (
            <div className="pl-6 space-y-3 border-l-2 border-primary/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data-source">Data Source</Label>
                  <Select value={dataSource} onValueChange={onDataSourceChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select data source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coinglass">Coinglass (Live)</SelectItem>
                      <SelectItem value="simulation">Simulation</SelectItem>
                      <SelectItem value="cached">Cached Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="update-frequency">Update Frequency</Label>
                  <Select 
                    value={updateFrequency.toString()} 
                    onValueChange={(value) => onUpdateFrequencyChange(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">1 minute</SelectItem>
                      <SelectItem value="300">5 minutes</SelectItem>
                      <SelectItem value="900">15 minutes</SelectItem>
                      <SelectItem value="3600">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="leverage-amplifier">Leverage Impact Amplifier</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Adjusts how much derivatives market conditions<br />
                        affect the price impact calculation (1.0x - 3.0x)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Select 
                  value={leverageAmplifier.toString()} 
                  onValueChange={(value) => onLeverageAmplifierChange(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1.0">1.0x (Conservative)</SelectItem>
                    <SelectItem value="1.5">1.5x (Moderate)</SelectItem>
                    <SelectItem value="2.0">2.0x (Standard)</SelectItem>
                    <SelectItem value="2.5">2.5x (Aggressive)</SelectItem>
                    <SelectItem value="3.0">3.0x (Maximum)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Educational Info */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">About Enhanced Modeling</Label>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• <strong>Spot Market Only:</strong> Traditional order book analysis using estimated exchange float</p>
            <p>• <strong>With Derivatives:</strong> Includes leverage effects, funding pressure, and synthetic buy pressure</p>
            <p>• <strong>Leverage Multiplier:</strong> Amplifies price impact based on futures market conditions</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}