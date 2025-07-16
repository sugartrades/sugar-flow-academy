import { useState, useEffect } from 'react';

interface DeviceInfo {
  isMobile: boolean;
  isDesktop: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  hasXamanApp: boolean;
  userAgent: string;
}

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isDesktop: false,
    isIOS: false,
    isAndroid: false,
    hasXamanApp: false,
    userAgent: ''
  });

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    
    // Check if mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isDesktop = !isMobile;
    
    // Check specific mobile platforms
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    const isAndroid = /Android/.test(userAgent);
    
    // Check if Xaman app might be installed (this is a best guess - we can't reliably detect app installation)
    const hasXamanApp = isMobile; // Assume mobile users might have the app
    
    setDeviceInfo({
      isMobile,
      isDesktop,
      isIOS,
      isAndroid,
      hasXamanApp,
      userAgent
    });
  }, []);

  return deviceInfo;
}

export function generateXamanDeepLink(xamanUrl: string): string {
  // Convert web URL to deep link
  const url = new URL(xamanUrl);
  const pathSegments = url.pathname.split('/');
  const payloadId = pathSegments[pathSegments.length - 1];
  
  // Generate deep link for Xaman app
  return `xumm://xumm.app/sign/${payloadId}`;
}

export function generateAppStoreLinks() {
  return {
    ios: 'https://apps.apple.com/app/xumm/id1492302343',
    android: 'https://play.google.com/store/apps/details?id=com.xrpllabs.xumm'
  };
}