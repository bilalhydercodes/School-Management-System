'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, HelpCircle } from 'lucide-react';
import { PORTAL_NAV_SECTIONS, type PortalNavItem } from './navigationData';

interface PortalSidebarProps {
  activeNav: string;
  onSelectNav: (id: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  unreadCount?: number;
}

export default function PortalSidebar({
  activeNav,
  onSelectNav,
  isOpenMobile = false,
  onCloseMobile,
  unreadCount = 0,
}: PortalSidebarProps) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-3 bottom-3 left-3 z-50 w-64 bg-white rounded-[22px] shadow-[0_4px_24px_rgba(0,100,200,0.08)] border border-blue-50/80 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-[110%] lg:translate-x-0'
        }`}
      >
        {/* Top School Branding */}
        <Link
          href="/"
          className="p-4 pb-3 border-b border-slate-100/80 flex items-center gap-3 group transition-opacity hover:opacity-90"
          title="Return to Public Dashboard"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#EEF6FF] border border-blue-100 flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-xs group-hover:scale-105 transition-transform duration-200">
            <Image
              src="/images/dashboard/logo_crest.png"
              alt="Alpha Edu Hub"
              width={38}
              height={38}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-tight truncate group-hover:text-blue-600 transition-colors">
              Alpha Edu Hub
            </h1>
            <p className="text-[10px] font-medium text-slate-400 tracking-wide mt-0.5 truncate">
              Learn &nbsp;·&nbsp; Grow &nbsp;·&nbsp; Excel
            </p>
          </div>
        </Link>

        {/* Navigation List (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 text-xs select-none">
          {PORTAL_NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <div className="text-[10px] font-bold text-slate-400/90 tracking-wider uppercase px-3 mb-1">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item: PortalNavItem) => {
                  const isActive = activeNav === item.id;
                  const Icon = item.icon;
                  const badgeValue =
                    item.id === 'notifications' && unreadCount > 0 ? unreadCount : item.badge;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelectNav(item.id);
                        if (onCloseMobile) onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-medium transition-all ${
                        isActive
                          ? 'bg-[#2563EB] text-white shadow-xs font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/90'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? 'text-white' : 'text-slate-400'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {badgeValue !== undefined && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                            isActive
                              ? 'bg-white text-[#2563EB]'
                              : 'bg-blue-50 text-blue-600'
                          }`}
                        >
                          {badgeValue}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Help & Support Button */}
        <div className="p-3 border-t border-slate-100/80">
          <button
            type="button"
            onClick={() => {
              onSelectNav('help-support');
              if (onCloseMobile) onCloseMobile();
            }}
            className={`w-full flex items-center justify-between p-2 rounded-xl border text-left transition-all ${
              activeNav === 'help-support'
                ? 'bg-blue-50/70 border-blue-300 text-blue-900'
                : 'bg-white border-blue-100 hover:bg-blue-50/50 hover:border-blue-200 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#2563EB] shrink-0">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="text-xs font-semibold text-slate-800 block leading-tight">
                  Help & Support
                </span>
                <span className="text-[10px] text-slate-400 block leading-tight">
                  FAQs & Assistance
                </span>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>
        </div>
      </aside>
    </>
  );
}
