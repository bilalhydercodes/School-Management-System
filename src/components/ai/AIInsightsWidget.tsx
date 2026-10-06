'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  Calendar,
  CheckCircle,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface AIInsightCard {
  id: string;
  category: string;
  title: string;
  insight: string;
  severity: 'positive' | 'warning' | 'urgent' | 'info';
  actionPrompt?: string;
  actionUrl?: string;
}

interface AIInsightsWidgetProps {
  role?: string;
  title?: string;
  className?: string;
}

export default function AIInsightsWidget({
  role,
  title = 'Alpha AI Proactive Insights',
  className = '',
}: AIInsightsWidgetProps) {
  const router = useRouter();
  const [insights, setInsights] = useState<AIInsightCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/insights');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.insights)) {
          setInsights(data.insights);
        }
      } else {
        setError('Could not refresh insights at this moment.');
      }
    } catch (err) {
      setError('Unable to load proactive AI insights.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'urgent':
        return {
          badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
          border: 'border-l-4 border-l-rose-500 bg-rose-50/40',
          icon: <AlertTriangle className="w-4 h-4 text-rose-600" />,
        };
      case 'warning':
        return {
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
          border: 'border-l-4 border-l-amber-500 bg-amber-50/40',
          icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
        };
      case 'positive':
        return {
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          border: 'border-l-4 border-l-emerald-500 bg-emerald-50/40',
          icon: <CheckCircle className="w-4 h-4 text-emerald-600" />,
        };
      case 'info':
      default:
        return {
          badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
          border: 'border-l-4 border-l-blue-500 bg-blue-50/40',
          icon: <Sparkles className="w-4 h-4 text-blue-600" />,
        };
    }
  };

  if (loading) {
    return (
      <div className={`p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0B72E7] animate-spin-slow" />
            <h4 className="font-semibold text-sm text-slate-800">{title}</h4>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 animate-pulse space-y-2">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-3 bg-slate-200 rounded w-full"></div>
              <div className="h-3 bg-slate-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (insights.length === 0 && !error) {
    return null;
  }

  return (
    <div className={`p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3.5 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0B72E7]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-800">{title}</h4>
            <p className="text-[11px] text-slate-500">Live operational intelligence from school records</p>
          </div>
        </div>
        <button
          onClick={fetchInsights}
          title="Refresh insights"
          className="p-1.5 text-slate-400 hover:text-[#0B72E7] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {error ? (
        <p className="text-xs text-slate-500 py-1">{error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {insights.map((item) => {
            const style = getSeverityStyle(item.severity);
            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border border-slate-200 bg-white hover:shadow-xs transition-all flex flex-col justify-between ${style.border}`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {item.category}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${style.badgeBg}`}>
                      {item.severity}
                    </span>
                  </div>
                  <h5 className="font-semibold text-xs text-slate-800 leading-snug">{item.title}</h5>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.insight}</p>
                </div>

                {item.actionUrl && (
                  <button
                    onClick={() => router.push(item.actionUrl!)}
                    className="mt-3 inline-flex items-center justify-between text-[11px] font-medium text-[#0B72E7] hover:text-blue-700 hover:underline pt-2 border-t border-slate-100 cursor-pointer"
                  >
                    <span>{item.actionPrompt || 'Review records'}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
