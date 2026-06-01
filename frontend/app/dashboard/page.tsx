"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  AlertTriangle,
  Link2,
  Activity,
  ArrowUpRight,
  RefreshCw,
  ExternalLink,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import NavBar from "@/components/NavBar";
import { DashboardSite, DashboardScan } from "@/types";

type SortMode = "worst" | "recent" | "az";

function getHealthColor(score: number): string {
  if (score >= 90) return "#4ade80";
  if (score >= 70) return "#fb923c";
  return "#f87171";
}

function getHealthBorder(score: number): string {
  if (score >= 90) return "rgba(74,222,128,0.2)";
  if (score >= 70) return "rgba(251,146,60,0.2)";
  return "rgba(248,113,113,0.2)";
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function getFaviconUrl(siteUrl: string): string {
  try {
    const u = new URL(siteUrl);
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=32`;
  } catch {
    return "";
  }
}

function getDomain(siteUrl: string): string {
  try {
    return new URL(siteUrl).hostname;
  } catch {
    return siteUrl;
  }
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  color,
  delay,
}: {
  icon: React.ComponentType<{ size: number; style?: React.CSSProperties }>;
  label: string;
  value: string | number;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-card p-5 flex flex-col gap-2"
    >
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${color}18` }}
        >
          <Icon size={16} style={{ color }} />
        </div>
        <span
          style={{
            fontFamily: "var(--font-poppins), Poppins, sans-serif",
            fontSize: "12px",
            fontWeight: 500,
            color: "rgba(255,255,255,0.4)",
          }}
        >
          {label}
        </span>
      </div>
      <span
        style={{
          fontFamily: "var(--font-poppins), Poppins, sans-serif",
          fontSize: "28px",
          fontWeight: 700,
          color: "#fff",
          lineHeight: 1.1,
        }}
      >
        {value}
      </span>
    </motion.div>
  );
}

// ─── Site card ────────────────────────────────────────────────────────────────
function SiteCard({
  site,
  index,
}: {
  site: DashboardSite;
  index: number;
}) {
  const sortedScans = useMemo(() => {
    return [...site.scans]
      .sort((a, b) => new Date(a.scanned_at).getTime() - new Date(b.scanned_at).getTime());
  }, [site.scans]);

  const latestScan: DashboardScan | undefined = sortedScans[sortedScans.length - 1];
  const prevScan: DashboardScan | undefined = sortedScans.length > 1 ? sortedScans[sortedScans.length - 2] : undefined;

  const healthScore = latestScan?.health_score ?? 0;
  const healthColor = getHealthColor(healthScore);
  const borderColor = getHealthBorder(healthScore);

  const trend = prevScan
    ? healthScore - prevScan.health_score
    : 0;

  const sparkData = sortedScans.slice(-5).map((s) => ({
    score: s.health_score,
  }));

  const domain = getDomain(site.url);
  const favicon = getFaviconUrl(site.url);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="glass-card overflow-hidden flex flex-col"
      style={{ borderColor }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={favicon}
          alt=""
          width={20}
          height={20}
          className="rounded"
          style={{ opacity: 0.8 }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div className="flex flex-col min-w-0 flex-1">
          <span
            style={{
              fontFamily: "var(--font-poppins), Poppins, sans-serif",
              fontSize: "13px",
              fontWeight: 600,
              color: "#fff",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={site.url}
          >
            {domain}
          </span>
          <span
            style={{
              fontFamily: "var(--font-poppins), Poppins, sans-serif",
              fontSize: "10px",
              color: "rgba(255,255,255,0.3)",
            }}
          >
            Last scan: {site.last_scanned_at ? timeAgo(site.last_scanned_at) : "Never"}
          </span>
        </div>
        {/* Health pill */}
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-full"
          style={{
            background: `${healthColor}18`,
            color: healthColor,
            fontFamily: "var(--font-poppins), Poppins, sans-serif",
            fontSize: "11px",
            fontWeight: 600,
            border: `0.5px solid ${healthColor}44`,
          }}
        >
          {healthScore}
        </span>
      </div>

      {/* Body */}
      <div className="px-5 py-4 flex-1 flex flex-col gap-3">
        {/* Big score */}
        <div className="flex items-end gap-3">
          <span
            style={{
              fontFamily: "var(--font-poppins), Poppins, sans-serif",
              fontSize: "40px",
              fontWeight: 700,
              color: healthColor,
              lineHeight: 1,
            }}
          >
            {healthScore}
          </span>
          <span
            style={{
              fontFamily: "var(--font-poppins), Poppins, sans-serif",
              fontSize: "13px",
              fontWeight: 400,
              color: "rgba(255,255,255,0.3)",
              marginBottom: 4,
            }}
          >
            / 100
          </span>
          {/* Trend */}
          {trend !== 0 && (
            <span
              className="inline-flex items-center gap-0.5 ml-auto mb-1"
              style={{
                fontFamily: "var(--font-poppins), Poppins, sans-serif",
                fontSize: "11px",
                fontWeight: 600,
                color: trend > 0 ? "#4ade80" : "#f87171",
              }}
            >
              {trend > 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {trend > 0 ? `+${trend}` : trend}
            </span>
          )}
          {trend === 0 && prevScan && (
            <span
              className="inline-flex items-center gap-0.5 ml-auto mb-1"
              style={{
                fontFamily: "var(--font-poppins), Poppins, sans-serif",
                fontSize: "11px",
                fontWeight: 500,
                color: "rgba(255,255,255,0.25)",
              }}
            >
              <Minus size={12} /> No change
            </span>
          )}
        </div>

        {/* Mini stats */}
        <div
          className="flex items-center gap-3"
          style={{
            fontFamily: "var(--font-poppins), Poppins, sans-serif",
            fontSize: "12px",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          <span>
            <strong style={{ color: "#f87171" }}>{latestScan?.broken_count ?? 0}</strong> broken
          </span>
          <span style={{ color: "rgba(255,255,255,0.1)" }}>·</span>
          <span>
            <strong style={{ color: "#fbbf24" }}>{latestScan?.dead_cta_count ?? 0}</strong> dead CTAs
          </span>
          <span style={{ color: "rgba(255,255,255,0.1)" }}>·</span>
          <span>{latestScan?.total_links ?? 0} total</span>
        </div>

        {/* Sparkline */}
        {sparkData.length > 1 && (
          <div style={{ height: 40, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkData}>
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke={healthColor}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex items-center gap-2 px-5 py-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <a
          href={`/?url=${encodeURIComponent(site.url)}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg no-underline transition-opacity hover:opacity-80"
          style={{
            background: "linear-gradient(132deg, rgb(65,0,153), rgb(138,26,155))",
            fontFamily: "var(--font-poppins), Poppins, sans-serif",
            fontSize: "12px",
            fontWeight: 600,
            color: "#fff",
          }}
        >
          <RefreshCw size={12} />
          Scan Now
        </a>
        <a
          href={site.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg no-underline transition-opacity hover:opacity-80"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            fontFamily: "var(--font-poppins), Poppins, sans-serif",
            fontSize: "12px",
            fontWeight: 500,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          <ExternalLink size={12} />
          Visit
        </a>
      </div>
    </motion.div>
  );
}

// ─── Main Dashboard Page ──────────────────────────────────────────────────────
export default function DashboardPage() {
  const [sites, setSites] = useState<DashboardSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("worst");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    document.title = "Dashboard | LinkSpy";
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        const data = (await res.json()) as { sites?: DashboardSite[] };
        setSites(data.sites ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const filteredSites = useMemo(() => {
    let list = sites;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((s) => s.url.toLowerCase().includes(q));
    }

    return [...list].sort((a, b) => {
      const aScans = [...(a.scans ?? [])].sort(
        (x, y) => new Date(x.scanned_at).getTime() - new Date(y.scanned_at).getTime()
      );
      const bScans = [...(b.scans ?? [])].sort(
        (x, y) => new Date(x.scanned_at).getTime() - new Date(y.scanned_at).getTime()
      );
      const aLatest = aScans[aScans.length - 1];
      const bLatest = bScans[bScans.length - 1];

      if (sortMode === "worst") {
        return (aLatest?.health_score ?? 100) - (bLatest?.health_score ?? 100);
      }
      if (sortMode === "recent") {
        return new Date(b.last_scanned_at).getTime() - new Date(a.last_scanned_at).getTime();
      }
      return a.url.localeCompare(b.url);
    });
  }, [sites, sortMode, searchQuery]);

  // Aggregate stats
  const totalSites = sites.length;
  const sitesWithIssues = sites.filter((s) => {
    const sorted = [...(s.scans ?? [])].sort(
      (a, b) => new Date(a.scanned_at).getTime() - new Date(b.scanned_at).getTime()
    );
    const latest = sorted[sorted.length - 1];
    return latest && latest.health_score < 90;
  }).length;
  const totalBroken = sites.reduce((sum, s) => {
    const sorted = [...(s.scans ?? [])].sort(
      (a, b) => new Date(a.scanned_at).getTime() - new Date(b.scanned_at).getTime()
    );
    const latest = sorted[sorted.length - 1];
    return sum + (latest?.broken_count ?? 0);
  }, 0);
  const avgHealth =
    totalSites > 0
      ? Math.round(
          sites.reduce((sum, s) => {
            const sorted = [...(s.scans ?? [])].sort(
              (a, b) => new Date(a.scanned_at).getTime() - new Date(b.scanned_at).getTime()
            );
            const latest = sorted[sorted.length - 1];
            return sum + (latest?.health_score ?? 100);
          }, 0) / totalSites
        )
      : 0;

  return (
    <main className="min-h-screen relative">
      <NavBar />

      <div className="max-w-6xl mx-auto px-6" style={{ paddingTop: 80 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1
            style={{
              fontFamily: "var(--font-poppins), Poppins, sans-serif",
              fontWeight: 700,
              fontSize: "32px",
              color: "#fff",
              marginBottom: 4,
            }}
          >
            Site Dashboard
          </h1>
          <p
            style={{
              fontFamily: "var(--font-poppins), Poppins, sans-serif",
              fontWeight: 400,
              fontSize: "14px",
              color: "rgba(255,255,255,0.4)",
            }}
          >
            All monitored sites at a glance
          </p>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <RefreshCw size={24} style={{ color: "rgba(255,255,255,0.3)" }} />
            </motion.div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="glass-card p-6 text-center">
            <p style={{ color: "#f87171", fontFamily: "var(--font-poppins), Poppins, sans-serif" }}>
              {error}
            </p>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Stat cards */}
            {totalSites > 0 && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard icon={Globe} label="Total Sites" value={totalSites} color="#a78bfa" delay={0} />
                <StatCard icon={AlertTriangle} label="With Issues" value={sitesWithIssues} color="#fb923c" delay={0.05} />
                <StatCard icon={Link2} label="Broken Links" value={totalBroken} color="#f87171" delay={0.1} />
                <StatCard icon={Activity} label="Avg Health" value={avgHealth} color="#4ade80" delay={0.15} />
              </div>
            )}

            {/* Controls */}
            {totalSites > 0 && (
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                {/* Search */}
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    minWidth: 220,
                  }}
                >
                  <Search size={14} style={{ color: "rgba(255,255,255,0.3)" }} />
                  <input
                    type="text"
                    placeholder="Search sites..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      fontFamily: "var(--font-poppins), Poppins, sans-serif",
                      fontSize: "13px",
                      color: "#fff",
                      width: "100%",
                    }}
                  />
                </div>

                {/* Sort toggle */}
                <div className="flex items-center gap-1">
                  {(
                    [
                      { key: "worst", label: "Worst first" },
                      { key: "recent", label: "Recent first" },
                      { key: "az", label: "A–Z" },
                    ] as { key: SortMode; label: string }[]
                  ).map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setSortMode(opt.key)}
                      className="px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                      style={{
                        fontFamily: "var(--font-poppins), Poppins, sans-serif",
                        fontSize: "12px",
                        fontWeight: 500,
                        color: sortMode === opt.key ? "#fff" : "rgba(255,255,255,0.35)",
                        background: sortMode === opt.key ? "rgba(255,255,255,0.08)" : "transparent",
                        border:
                          sortMode === opt.key
                            ? "1px solid rgba(255,255,255,0.1)"
                            : "1px solid transparent",
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Site cards grid */}
            {filteredSites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-16">
                {filteredSites.map((site, i) => (
                  <SiteCard key={site.id} site={site} index={i} />
                ))}
              </div>
            ) : totalSites === 0 ? (
              /* Empty state */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-16 flex flex-col items-center justify-center text-center gap-6 max-w-lg mx-auto mt-12"
              >
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <circle cx="40" cy="40" r="36" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
                  <circle cx="40" cy="40" r="24" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
                  <path
                    d="M30 40h20M40 30v20"
                    stroke="rgba(138,26,155,0.4)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <div>
                  <p
                    style={{
                      fontFamily: "var(--font-poppins), Poppins, sans-serif",
                      fontWeight: 600,
                      fontSize: "18px",
                      color: "rgba(255,255,255,0.6)",
                      marginBottom: 8,
                    }}
                  >
                    No sites tracked yet
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-poppins), Poppins, sans-serif",
                      fontWeight: 400,
                      fontSize: "14px",
                      color: "rgba(255,255,255,0.3)",
                    }}
                  >
                    Scan your first site to see it here
                  </p>
                </div>
                <a
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl no-underline hover:opacity-90 transition-opacity"
                  style={{
                    background: "linear-gradient(132deg, rgb(65,0,153), rgb(138,26,155))",
                    fontFamily: "var(--font-poppins), Poppins, sans-serif",
                    fontWeight: 600,
                    fontSize: "14px",
                    color: "#fff",
                  }}
                >
                  <ArrowUpRight size={16} />
                  Go to Scanner
                </a>
              </motion.div>
            ) : (
              <div className="glass-card p-10 text-center">
                <p
                  style={{
                    fontFamily: "var(--font-poppins), Poppins, sans-serif",
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  No sites match your search
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
