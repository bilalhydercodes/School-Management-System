'use client';

import React from 'react';
import Image from 'next/image';

/**
 * Pure CSS 3D Phone floating on a neon-rimmed pedestal.
 * Displays an Alpha Edu Hub mini-dashboard on the screen.
 * No external 3D libraries required.
 */
export default function Phone3D() {
  return (
    <div className="phone3d-wrapper">
      {/* Sparkle decorations */}
      <svg className="sparkle sparkle-1" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L13.5 9.5L20 12L13.5 14.5L12 22L10.5 14.5L4 12L10.5 9.5L12 2Z" fill="currentColor" />
      </svg>
      <svg className="sparkle sparkle-2" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L13.5 9.5L20 12L13.5 14.5L12 22L10.5 14.5L4 12L10.5 9.5L12 2Z" fill="currentColor" />
      </svg>
      <svg className="sparkle sparkle-3" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L13.5 9.5L20 12L13.5 14.5L12 22L10.5 14.5L4 12L10.5 9.5L12 2Z" fill="currentColor" />
      </svg>

      {/* Phone + Pedestal composition */}
      <div className="phone3d-scene">
        {/* The Phone */}
        <div className="phone3d-float">
          <div className="phone3d-body">
            {/* Phone frame highlights */}
            <div className="phone3d-frame-left" />
            <div className="phone3d-frame-right" />

            {/* Notch / Dynamic Island */}
            <div className="phone3d-notch">
              <div className="phone3d-notch-pill" />
            </div>

            {/* Phone Screen Content — Alpha Edu Hub Dashboard */}
            <div className="phone3d-screen">
              {/* Status bar */}
              <div className="phone-status-bar">
                <span className="phone-time">9:41</span>
                <div className="phone-status-icons">
                  <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
                    <rect x="0" y="6" width="3" height="6" rx="0.5" opacity="0.4"/>
                    <rect x="4.5" y="4" width="3" height="8" rx="0.5" opacity="0.6"/>
                    <rect x="9" y="2" width="3" height="10" rx="0.5" opacity="0.8"/>
                    <rect x="13" y="0" width="3" height="12" rx="0.5"/>
                  </svg>
                </div>
              </div>

              {/* Dashboard content */}
              <div className="phone-dashboard">
                {/* Logo + Brand */}
                <div className="phone-brand">
                  <div className="phone-logo-circle">
                    <Image
                      src="/images/dashboard/logo_crest.png"
                      alt="Alpha Edu Hub"
                      width={28}
                      height={28}
                      className="phone-logo-img"
                    />
                  </div>
                  <div>
                    <div className="phone-brand-name">Alpha Edu Hub</div>
                    <div className="phone-brand-sub">School Dashboard</div>
                  </div>
                </div>

                {/* Quick stats row */}
                <div className="phone-stats-row">
                  <div className="phone-stat-card phone-stat-blue">
                    <div className="phone-stat-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </div>
                    <div className="phone-stat-num">1,247</div>
                    <div className="phone-stat-label">Students</div>
                  </div>
                  <div className="phone-stat-card phone-stat-green">
                    <div className="phone-stat-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 12 3 12 0v-5"/></svg>
                    </div>
                    <div className="phone-stat-num">86</div>
                    <div className="phone-stat-label">Teachers</div>
                  </div>
                  <div className="phone-stat-card phone-stat-purple">
                    <div className="phone-stat-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    </div>
                    <div className="phone-stat-num">94%</div>
                    <div className="phone-stat-label">Attendance</div>
                  </div>
                </div>

                {/* Attendance chart placeholder */}
                <div className="phone-chart-card">
                  <div className="phone-chart-header">
                    <span className="phone-chart-title">Weekly Attendance</span>
                    <span className="phone-chart-badge">This Week</span>
                  </div>
                  <div className="phone-chart-bars">
                    <div className="phone-bar-group">
                      <div className="phone-bar" style={{ height: '70%' }} /><span>Mon</span>
                    </div>
                    <div className="phone-bar-group">
                      <div className="phone-bar" style={{ height: '88%' }} /><span>Tue</span>
                    </div>
                    <div className="phone-bar-group">
                      <div className="phone-bar" style={{ height: '95%' }} /><span>Wed</span>
                    </div>
                    <div className="phone-bar-group">
                      <div className="phone-bar" style={{ height: '82%' }} /><span>Thu</span>
                    </div>
                    <div className="phone-bar-group">
                      <div className="phone-bar phone-bar-accent" style={{ height: '92%' }} /><span>Fri</span>
                    </div>
                  </div>
                </div>

                {/* Recent activity */}
                <div className="phone-activity">
                  <div className="phone-activity-title">Recent Activity</div>
                  <div className="phone-activity-item">
                    <div className="phone-activity-dot phone-dot-blue" />
                    <div>
                      <div className="phone-activity-text">Math Exam - Class 10A</div>
                      <div className="phone-activity-meta">Today, 10:30 AM</div>
                    </div>
                  </div>
                  <div className="phone-activity-item">
                    <div className="phone-activity-dot phone-dot-green" />
                    <div>
                      <div className="phone-activity-text">Fee Collection - ₹45,200</div>
                      <div className="phone-activity-meta">Today, 9:15 AM</div>
                    </div>
                  </div>
                  <div className="phone-activity-item">
                    <div className="phone-activity-dot phone-dot-purple" />
                    <div>
                      <div className="phone-activity-text">3 New Admissions</div>
                      <div className="phone-activity-meta">Yesterday</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Home indicator */}
              <div className="phone-home-indicator" />
            </div>
          </div>
        </div>

        {/* Pedestal / Platform */}
        <div className="phone3d-pedestal-wrap">
          <div className="phone3d-pedestal">
            <div className="phone3d-pedestal-top" />
            <div className="phone3d-pedestal-body" />
            <div className="phone3d-neon-ring" />
          </div>
          {/* Shadow on ground */}
          <div className="phone3d-ground-shadow" />
        </div>
      </div>

      <style jsx>{`
        /* ────────────────────────────────────────────────────────────
           WRAPPER & SPARKLES
        ──────────────────────────────────────────────────────────── */
        .phone3d-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .sparkle {
          position: absolute;
          color: #b0b8c8;
          opacity: 0.55;
          pointer-events: none;
        }
        .sparkle-1 {
          width: 18px; height: 18px;
          top: 14%; right: 12%;
          animation: sparkle-pulse 3s ease-in-out infinite;
        }
        .sparkle-2 {
          width: 14px; height: 14px;
          bottom: 28%; left: 8%;
          animation: sparkle-pulse 3s ease-in-out infinite 1s;
        }
        .sparkle-3 {
          width: 11px; height: 11px;
          top: 58%; right: 6%;
          animation: sparkle-pulse 3s ease-in-out infinite 2s;
        }

        @keyframes sparkle-pulse {
          0%, 100% { opacity: 0.3; transform: scale(1) rotate(0deg); }
          50% { opacity: 0.7; transform: scale(1.25) rotate(20deg); }
        }

        /* ────────────────────────────────────────────────────────────
           3D SCENE CONTAINER
        ──────────────────────────────────────────────────────────── */
        .phone3d-scene {
          position: relative;
          width: 280px;
          display: flex;
          flex-direction: column;
          align-items: center;
          perspective: 1200px;
        }

        /* ────────────────────────────────────────────────────────────
           FLOATING ANIMATION
        ──────────────────────────────────────────────────────────── */
        .phone3d-float {
          animation: phone-float 5s ease-in-out infinite;
          transform-style: preserve-3d;
        }

        @keyframes phone-float {
          0%, 100% { transform: translateY(0px) rotateY(-12deg) rotateX(3deg); }
          50% { transform: translateY(-14px) rotateY(-12deg) rotateX(3deg); }
        }

        /* ────────────────────────────────────────────────────────────
           PHONE BODY
        ──────────────────────────────────────────────────────────── */
        .phone3d-body {
          position: relative;
          width: 220px;
          height: 450px;
          background: linear-gradient(145deg, #1a1a2e, #16213e, #0f0f23);
          border-radius: 36px;
          padding: 8px;
          box-shadow:
            /* Outer glow */
            0 25px 60px -8px rgba(0, 0, 0, 0.5),
            0 15px 35px -5px rgba(0, 0, 0, 0.35),
            /* Inner edge highlight */
            inset 0 1px 0 rgba(255, 255, 255, 0.12),
            inset 0 -1px 0 rgba(0, 0, 0, 0.3),
            /* Side depth */
            -4px 0 8px rgba(0, 0, 0, 0.2),
            4px 0 8px rgba(0, 0, 0, 0.15);
          transform-style: preserve-3d;
        }

        /* Left / right frame edge highlights */
        .phone3d-frame-left {
          position: absolute;
          left: -2px;
          top: 80px;
          width: 2px;
          height: 50px;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.15), transparent);
          border-radius: 2px;
        }
        .phone3d-frame-right {
          position: absolute;
          right: -2px;
          top: 100px;
          width: 2px;
          height: 35px;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.1), transparent);
          border-radius: 2px;
        }

        /* ────────────────────────────────────────────────────────────
           NOTCH / DYNAMIC ISLAND
        ──────────────────────────────────────────────────────────── */
        .phone3d-notch {
          position: absolute;
          top: 14px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .phone3d-notch-pill {
          width: 80px;
          height: 22px;
          background: #000;
          border-radius: 12px;
          box-shadow: 0 0 4px rgba(0,0,0,0.5);
        }

        /* ────────────────────────────────────────────────────────────
           PHONE SCREEN
        ──────────────────────────────────────────────────────────── */
        .phone3d-screen {
          width: 100%;
          height: 100%;
          background: linear-gradient(180deg, #f8faff 0%, #f0f4ff 100%);
          border-radius: 28px;
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        /* ── Status bar ─── */
        .phone-status-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 18px 4px;
          font-size: 10px;
          font-weight: 700;
          color: #1a1a2e;
        }
        .phone-time { letter-spacing: 0.3px; }
        .phone-status-icons { display: flex; align-items: center; gap: 3px; }

        /* ── Dashboard area ─── */
        .phone-dashboard {
          flex: 1;
          padding: 8px 12px 10px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        /* Brand header */
        .phone-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          padding-bottom: 4px;
        }
        .phone-logo-circle {
          width: 30px;
          height: 30px;
          border-radius: 10px;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
          overflow: hidden;
          flex-shrink: 0;
        }
        .phone-logo-circle :global(.phone-logo-img) {
          width: 22px !important;
          height: 22px !important;
          object-fit: contain;
        }
        .phone-brand-name {
          font-size: 10px;
          font-weight: 800;
          color: #0A1344;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }
        .phone-brand-sub {
          font-size: 7px;
          color: #7F81A6;
          font-weight: 600;
        }

        /* Stats row */
        .phone-stats-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 5px;
        }
        .phone-stat-card {
          border-radius: 10px;
          padding: 7px 5px 5px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .phone-stat-blue { background: #EFF6FF; }
        .phone-stat-green { background: #ECFDF5; }
        .phone-stat-purple { background: #F5F3FF; }

        .phone-stat-icon {
          width: 16px;
          height: 16px;
        }
        .phone-stat-blue .phone-stat-icon { color: #3B82F6; }
        .phone-stat-green .phone-stat-icon { color: #10B981; }
        .phone-stat-purple .phone-stat-icon { color: #8B5CF6; }

        .phone-stat-num {
          font-size: 11px;
          font-weight: 800;
          color: #0A1344;
          line-height: 1.1;
        }
        .phone-stat-label {
          font-size: 6px;
          color: #7F81A6;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        /* Chart card */
        .phone-chart-card {
          background: white;
          border-radius: 10px;
          padding: 7px 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .phone-chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }
        .phone-chart-title {
          font-size: 7.5px;
          font-weight: 700;
          color: #0A1344;
        }
        .phone-chart-badge {
          font-size: 5.5px;
          font-weight: 700;
          color: #3B82F6;
          background: #EFF6FF;
          padding: 2px 5px;
          border-radius: 6px;
        }
        .phone-chart-bars {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          height: 50px;
          gap: 4px;
        }
        .phone-bar-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          justify-content: flex-end;
          gap: 2px;
        }
        .phone-bar-group span {
          font-size: 5px;
          color: #94a3b8;
          font-weight: 600;
        }
        .phone-bar {
          width: 100%;
          max-width: 18px;
          background: linear-gradient(to top, #3B82F6, #60A5FA);
          border-radius: 4px 4px 1px 1px;
          min-height: 4px;
        }
        .phone-bar-accent {
          background: linear-gradient(to top, #0C8CFE, #38BDF8) !important;
        }

        /* Activity */
        .phone-activity {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .phone-activity-title {
          font-size: 7.5px;
          font-weight: 700;
          color: #0A1344;
        }
        .phone-activity-item {
          display: flex;
          align-items: flex-start;
          gap: 5px;
        }
        .phone-activity-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          margin-top: 2px;
          flex-shrink: 0;
        }
        .phone-dot-blue { background: #3B82F6; }
        .phone-dot-green { background: #10B981; }
        .phone-dot-purple { background: #8B5CF6; }
        .phone-activity-text {
          font-size: 6.5px;
          font-weight: 600;
          color: #1e293b;
          line-height: 1.3;
        }
        .phone-activity-meta {
          font-size: 5.5px;
          color: #94a3b8;
          font-weight: 500;
        }

        /* Home indicator */
        .phone-home-indicator {
          width: 80px;
          height: 4px;
          background: #c4c8d4;
          border-radius: 4px;
          margin: 4px auto 6px;
        }

        /* ────────────────────────────────────────────────────────────
           PEDESTAL
        ──────────────────────────────────────────────────────────── */
        .phone3d-pedestal-wrap {
          position: relative;
          margin-top: -8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          perspective: 600px;
        }
        .phone3d-pedestal {
          position: relative;
          width: 240px;
          transform: rotateX(55deg);
          transform-style: preserve-3d;
        }
        .phone3d-pedestal-top {
          width: 100%;
          height: 48px;
          background: linear-gradient(145deg, #2d2d3d, #1a1a2e, #12121e);
          border-radius: 50%;
          box-shadow:
            inset 0 2px 6px rgba(255,255,255,0.06),
            0 4px 12px rgba(0,0,0,0.3);
        }
        .phone3d-pedestal-body {
          width: 100%;
          height: 18px;
          background: linear-gradient(to bottom, #1a1a2e, #0f0f1a);
          border-radius: 0 0 50% 50% / 0 0 100% 100%;
          margin-top: -1px;
        }

        /* Neon ring */
        .phone3d-neon-ring {
          position: absolute;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 108%;
          height: 48px;
          border-radius: 50%;
          border: 2.5px solid transparent;
          background: transparent;
          box-shadow:
            0 0 12px rgba(56, 189, 248, 0.5),
            0 0 30px rgba(56, 189, 248, 0.25),
            inset 0 0 12px rgba(56, 189, 248, 0.15);
          border-image: linear-gradient(90deg, transparent 5%, #38BDF8 30%, #0C8CFE 50%, #38BDF8 70%, transparent 95%) 1;
          animation: neon-glow 3s ease-in-out infinite;
        }

        @keyframes neon-glow {
          0%, 100% {
            box-shadow:
              0 0 12px rgba(56, 189, 248, 0.5),
              0 0 30px rgba(56, 189, 248, 0.25),
              inset 0 0 12px rgba(56, 189, 248, 0.15);
          }
          50% {
            box-shadow:
              0 0 20px rgba(56, 189, 248, 0.7),
              0 0 45px rgba(56, 189, 248, 0.35),
              inset 0 0 18px rgba(56, 189, 248, 0.25);
          }
        }

        /* Ground shadow */
        .phone3d-ground-shadow {
          width: 200px;
          height: 20px;
          background: radial-gradient(ellipse, rgba(0,0,0,0.15) 0%, transparent 70%);
          border-radius: 50%;
          margin-top: 4px;
        }

        /* ────────────────────────────────────────────────────────────
           RESPONSIVE — MOBILE
        ──────────────────────────────────────────────────────────── */
        @media (max-width: 1023px) {
          .phone3d-scene {
            width: 220px;
            transform: scale(0.82);
          }
        }
      `}</style>
    </div>
  );
}

