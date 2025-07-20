
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Copy, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface XRPscanLinkProps {
  transactionHash: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showCopyButton?: boolean;
  className?: string;
}

export const XRPscanLink: React.FC<XRPscanLinkProps> = ({
  transactionHash,
  variant = 'ghost',
  size = 'sm',
  showCopyButton = false,
  className = ''
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const xrpscanUrl = `https://xrpscan.com/tx/${transactionHash}`;
  
  const handleOpenXRPScan = async () => {
    setIsLoading(true);
    try {
      // Track link clicks for analytics (optional)
      console.log('XRPscan link opened:', transactionHash);
      window.open(xrpscanUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error opening XRPscan:', error);
      toast({
        title: 'Error',
        description: 'Failed to open XRPscan. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(xrpscanUrl);
      toast({
        title: 'Link Copied',
        description: 'XRPscan link copied to clipboard',
      });
    } catch (error) {
      console.error('Error copying link:', error);
      toast({
        title: 'Copy Failed',
        description: 'Could not copy link to clipboard',
        variant: 'destructive',
      });
    }
  };

  if (!transactionHash) {
    return (
      <Button 
        variant="ghost" 
        size={size}
        disabled
        className={`text-muted-foreground ${className}`}
      >
        <AlertCircle className="h-3 w-3" />
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant={variant}
        size={size}
        onClick={handleOpenXRPScan}
        disabled={isLoading}
        className={`${className} hover:bg-blue-50 dark:hover:bg-blue-900/20`}
        title="View on XRPscan"
      >
        <ExternalLink className="h-3 w-3" />
        {size !== 'icon' && (
          <span className="hidden sm:inline ml-1">XRPscan</span>
        )}
      </Button>
      
      {showCopyButton && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopyLink}
          className="h-6 w-6"
          title="Copy XRPscan link"
        >
          <Copy className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};
