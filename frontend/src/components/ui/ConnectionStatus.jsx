import React from 'react';
import { twMerge } from 'tailwind-merge';
import { Loader2Icon, WifiOffIcon } from 'lucide-react';
import { useAppConfig } from '../../contexts/AppConfigContext';
import { LiveIndicator } from './LiveIndicator';
export function ConnectionStatus({ note = 'Results update automatically', className, size = 'md' }) {
    const { connectionState } = useAppConfig();
    const pad = size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs';
    if (connectionState === 'connected') {
        return <LiveIndicator label="Live" note={note} size={size} className={className}/>;
    }
    if (connectionState === 'connecting') {
        return (<span role="status" className={twMerge('inline-flex items-center gap-2 rounded-full border border-warn-100 bg-warn-50 font-semibold text-warn-600', pad, className)}>
        
        <Loader2Icon className="h-3.5 w-3.5 animate-spin" aria-hidden="true"/>
        Connecting…
      </span>);
    }
    return (<span role="status" className={twMerge('inline-flex items-center gap-2 rounded-full border border-danger-100 bg-danger-50 font-semibold text-danger-600', pad, className)}>
      
      <WifiOffIcon className="h-3.5 w-3.5" aria-hidden="true"/>
      Connection lost
      <span className="font-medium text-danger-500">Trying to reconnect…</span>
    </span>);
}
