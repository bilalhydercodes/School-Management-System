'use client';

import React, { useState } from 'react';
import {
  WifiOff,
  Wifi,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
  X,
  Layers,
} from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export default function ConnectivityBanner() {
  const {
    isOnline,
    isRestored,
    pendingCount,
    failedCount,
    syncStatus,
    pendingItems,
    syncNow,
    dismissRestored,
  } = useOnlineStatus();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    try {
      await syncNow();
    } finally {
      setIsManualSyncing(false);
    }
  };

  const hasPendingOrFailed = pendingCount > 0 || failedCount > 0;
  const isSyncing = syncStatus === 'syncing' || isManualSyncing;

  // Render nothing if fully online, no restored message, and no pending/failed items
  if (isOnline && !isRestored && !hasPendingOrFailed) {
    return null;
  }

  return (
    <>
      {/* Floating Connectivity Banner */}
      <aside aria-label="Network Status" className="fixed bottom-5 right-5 z-50 max-w-md w-[calc(100vw-40px)] sm:w-auto animate-in fade-in slide-in-from-bottom-3 duration-300 pointer-events-auto">
        {/* State 1: OFFLINE BANNER */}
        {!isOnline && (
          <div className="bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/80 rounded-2xl p-4 shadow-[0_10px_35px_rgba(0,0,0,0.35)] flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <WifiOff className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-white leading-tight">
                    You&apos;re offline
                  </h4>
                  <p className="text-[11.5px] text-slate-300 leading-tight mt-0.5">
                    Some features may be unavailable.
                  </p>
                </div>
              </div>

              {pendingCount > 0 && (
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-[11px] font-semibold text-amber-300 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Layers className="w-3 h-3" />
                  <span>{pendingCount} Queued</span>
                </button>
              )}
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-800/80 rounded-lg px-2.5 py-1.5 flex items-center justify-between">
              <span>Changes are saved locally and will sync when reconnected.</span>
            </div>
          </div>
        )}

        {/* State 2: CONNECTION RESTORED BANNER (Auto-dismissed) */}
        {isOnline && isRestored && (
          <div className="bg-emerald-950/95 backdrop-blur-md text-white border border-emerald-700/80 rounded-2xl p-3.5 shadow-[0_10px_35px_rgba(5,150,105,0.25)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Wifi className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-white leading-tight">
                  Connection restored
                </h4>
                <p className="text-[11.5px] text-emerald-200/80 leading-tight mt-0.5">
                  {hasPendingOrFailed ? 'Syncing pending changes...' : 'Back online and ready.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={dismissRestored}
              className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800/50 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* State 3: PENDING SYNC / FAILED RETRY BADGE (Online with queued mutations) */}
        {isOnline && !isRestored && hasPendingOrFailed && (
          <div
            className={`backdrop-blur-md text-white border rounded-2xl p-3.5 shadow-xl flex items-center justify-between gap-3 ${
              failedCount > 0
                ? 'bg-rose-950/95 border-rose-700/80'
                : 'bg-slate-900/95 border-blue-600/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                  failedCount > 0
                    ? 'bg-rose-500/20 border-rose-500/30 text-rose-400'
                    : 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                }`}
              >
                {isSyncing ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-[#1d8cfd]" />
                ) : failedCount > 0 ? (
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
              </div>
              <div>
                <h4 className="text-[12.5px] font-bold text-white leading-tight">
                  {isSyncing
                    ? 'Syncing offline records...'
                    : failedCount > 0
                    ? `${failedCount} Sync Failed`
                    : `${pendingCount} Pending Sync`}
                </h4>
                <p className="text-[11px] text-slate-300 leading-tight mt-0.5">
                  {isSyncing
                    ? 'Verifying server persistence'
                    : failedCount > 0
                    ? 'Click to retry failed operations'
                    : 'Changes ready to be synchronized'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="px-3 py-1.5 rounded-xl bg-[#1d8cfd] hover:bg-blue-600 active:bg-blue-700 text-white text-[12px] font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="View sync queue"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Offline Sync Center Modal / Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh] text-left"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sync-center-title"
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-[#1d8cfd] flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="sync-center-title" className="text-[16px] font-bold text-slate-900 leading-tight">
                    Offline Sync Queue
                  </h3>
                  <p className="text-[12px] text-slate-500">
                    {pendingItems.length} total local operation(s)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Queue List */}
            <div className="p-6 overflow-y-auto flex-1 divide-y divide-slate-100">
              {pendingItems.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <h4 className="text-[15px] font-bold text-slate-900">All Changes Synced</h4>
                  <p className="text-[12.5px] text-slate-500 mt-1">
                    There are no pending offline mutations queued in local storage.
                  </p>
                </div>
              ) : (
                pendingItems.map((item) => (
                  <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-[13.5px] font-bold text-slate-800">
                          {item.title}
                        </h4>
                        <span
                          className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                            item.status === 'SYNCED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : item.status === 'SYNCING'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : item.status === 'FAILED'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="text-[11.5px] text-slate-500 mt-1">
                        Queued: {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Attempts: {item.attempts}/{item.maxAttempts}
                      </p>
                      {item.lastError && (
                        <p className="text-[11px] text-rose-600 bg-rose-50 border border-rose-100 rounded-md p-1.5 mt-1.5">
                          Error: {item.lastError}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <span className="text-[11.5px] text-slate-500">
                {isOnline ? 'Online • Ready to sync' : 'Offline • Waiting for network'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-4 py-2 rounded-xl text-[13px] font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors"
                >
                  Close
                </button>
                {isOnline && hasPendingOrFailed && (
                  <button
                    type="button"
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    className="px-5 py-2 rounded-xl text-[13px] font-bold text-white bg-[#1d8cfd] hover:bg-blue-600 disabled:opacity-60 transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Syncing...' : 'Sync All Now'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
