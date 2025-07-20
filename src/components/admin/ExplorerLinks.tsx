
import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Globe, Search, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ExplorerLinksProps {
  transactionHash: string;
  variant?: 'compact' | 'full';
  showLabels?: boolean;
}

const explorers = [
  {
    name: 'XRPScan',
    url: (hash: string) => `https://xrpscan.com/tx/${hash}`,
    icon: Search,
    color: 'bg-blue-500 hover:bg-blue-600',
    description: 'Most comprehensive XRPL explorer'
  },
  {
    name: 'XRPlorer',
    url: (hash: string) => `https://xrplorer.com/transaction/${hash}`,
    icon: Globe,
    color: 'bg-green-500 hover:bg-green-600',
    description: 'Alternative XRPL explorer'
  },
  {
    name: 'Bithomp',
    url: (hash: string) => `https://bithomp.com/explorer/${hash}`,
    icon: Zap,
    color: 'bg-purple-500 hover:bg-purple-600',
    description: 'Advanced XRPL analytics'
  }
];

export const ExplorerLinks: React.FC<ExplorerLinksProps> = ({
  transactionHash,
  variant = 'compact',
  showLabels = true
}) => {
  const handleExplorerClick = (explorerName: string, url: string) => {
    console.log(`Opening ${explorerName} for transaction:`, transactionHash);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!transactionHash) {
    return (
      <div className="flex items-center gap-1">
        <Badge variant="outline" className="text-xs">
          No TX Hash
        </Badge>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1">
        {explorers.map((explorer) => (
          <Button
            key={explorer.name}
            variant="ghost"
            size="icon"
            onClick={() => handleExplorerClick(explorer.name, explorer.url(transactionHash))}
            className="h-6 w-6 hover:bg-muted"
            title={`View on ${explorer.name} - ${explorer.description}`}
          >
            <explorer.icon className="h-3 w-3" />
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-muted-foreground mb-2">
        Blockchain Explorers
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {explorers.map((explorer) => (
          <Button
            key={explorer.name}
            variant="outline"
            size="sm"
            onClick={() => handleExplorerClick(explorer.name, explorer.url(transactionHash))}
            className="flex items-center gap-2 justify-start h-auto p-3"
          >
            <explorer.icon className="h-4 w-4" />
            <div className="flex flex-col items-start">
              {showLabels && (
                <span className="font-medium">{explorer.name}</span>
              )}
              <span className="text-xs text-muted-foreground hidden sm:block">
                {explorer.description}
              </span>
            </div>
            <ExternalLink className="h-3 w-3 ml-auto" />
          </Button>
        ))}
      </div>
    </div>
  );
};
