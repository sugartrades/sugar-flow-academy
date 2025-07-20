
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExplorerLinks } from '@/components/admin/ExplorerLinks';
import { Copy, Clock, Wallet, ArrowRight, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface TransactionDetailsProps {
  transaction: {
    id: string;
    transaction_hash: string;
    amount: number;
    currency: string;
    transaction_type: string;
    transaction_date: string;
    wallet_address: string;
    destination_address?: string;
    source_address?: string;
    destination_tag?: string;
    exchange_name?: string;
    ledger_index: number;
  };
  showFullDetails?: boolean;
}

export const TransactionDetails: React.FC<TransactionDetailsProps> = ({
  transaction,
  showFullDetails = false
}) => {
  const { toast } = useToast();
  const [showDetails, setShowDetails] = useState(showFullDetails);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied',
        description: `${label} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: `Could not copy ${label}`,
        variant: 'destructive',
      });
    }
  };

  const shortenAddress = (address: string, chars = 8) => {
    return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Transaction Details
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="sm:hidden"
          >
            {showDetails ? 'Less' : 'More'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Amount and Type */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div>
            <div className="text-2xl font-bold text-primary">
              {formatAmount(transaction.amount)} {transaction.currency}
            </div>
            <Badge variant={transaction.transaction_type === 'sent' ? 'destructive' : 'default'}>
              {transaction.transaction_type}
            </Badge>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(transaction.transaction_date), { addSuffix: true })}
            </div>
          </div>
        </div>

        {/* Transaction Hash */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Transaction Hash</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(transaction.transaction_hash, 'Transaction hash')}
              className="h-6 px-2"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          <div className="font-mono text-xs bg-muted p-2 rounded break-all">
            <span className="sm:hidden">{shortenAddress(transaction.transaction_hash, 12)}</span>
            <span className="hidden sm:inline">{transaction.transaction_hash}</span>
          </div>
        </div>

        {/* Explorer Links */}
        <div className="space-y-2">
          <span className="text-sm font-medium">Blockchain Explorers</span>
          <ExplorerLinks 
            transactionHash={transaction.transaction_hash}
            variant={showDetails || !window.matchMedia('(max-width: 640px)').matches ? 'full' : 'compact'}
          />
        </div>

        {/* Additional Details - Mobile Collapsible */}
        {(showDetails || !window.matchMedia('(max-width: 640px)').matches) && (
          <div className="space-y-3 border-t pt-3">
            {/* Addresses */}
            {transaction.source_address && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">From</span>
                </div>
                <div className="font-mono text-xs bg-muted p-2 rounded flex items-center justify-between">
                  <span className="break-all">{shortenAddress(transaction.source_address)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(transaction.source_address!, 'Source address')}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}

            {transaction.destination_address && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">To</span>
                  {transaction.exchange_name && (
                    <Badge variant="secondary" className="text-xs">
                      {transaction.exchange_name}
                    </Badge>
                  )}
                </div>
                <div className="font-mono text-xs bg-muted p-2 rounded flex items-center justify-between">
                  <span className="break-all">{shortenAddress(transaction.destination_address)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(transaction.destination_address!, 'Destination address')}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Ledger Index</span>
                <div className="font-mono">{transaction.ledger_index.toLocaleString()}</div>
              </div>
              {transaction.destination_tag && (
                <div>
                  <span className="text-muted-foreground">Destination Tag</span>
                  <div className="font-mono">{transaction.destination_tag}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
