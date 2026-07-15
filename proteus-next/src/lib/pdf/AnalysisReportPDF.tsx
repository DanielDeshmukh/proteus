"use client";

import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const GOLD = "#c9a962";
const GOLD_LIGHT = "#d4b872";
const DARK = "#1a1a1a";
const MID = "#555";
const LIGHT = "#888";
const WHITE = "#fff";

const styles = StyleSheet.create({
  page: { padding: "50px 55px", fontSize: 10, color: DARK },
  cover: { flex: 1, justifyContent: "center", alignItems: "center" },
  coverLogo: { width: 48, height: 48, marginBottom: 16 },
  coverTitle: { fontSize: 28, fontWeight: "bold", color: DARK, marginBottom: 4, letterSpacing: 1 },
  coverSubtitle: { fontSize: 11, color: LIGHT, marginBottom: 40, letterSpacing: 2, textTransform: "uppercase" },
  coverMeta: { fontSize: 9, color: LIGHT, marginBottom: 6 },
  coverScore: { fontSize: 52, fontWeight: "bold", color: GOLD, marginTop: 30, marginBottom: 6 },
  coverScoreLabel: { fontSize: 11, color: MID, marginBottom: 30, textTransform: "uppercase", letterSpacing: 2 },
  divider: { borderBottomWidth: 0.5, borderBottomColor: "#ddd", marginVertical: 16 },
  dividerGold: { borderBottomWidth: 1, borderBottomColor: GOLD, marginVertical: 14, marginBottom: 18 },

  sectionTitle: { fontSize: 13, fontWeight: "bold", color: GOLD, marginBottom: 14, textTransform: "uppercase", letterSpacing: 1.5 },
  row: { flexDirection: "row", marginBottom: 8, alignItems: "center" },
  label: { fontSize: 9, color: LIGHT, width: 90 },
  barBg: { flex: 1, height: 6, backgroundColor: "#eee", borderRadius: 3, marginLeft: 8, marginRight: 10 },
  barFill: { height: 6, backgroundColor: GOLD, borderRadius: 3 },
  scoreText: { fontSize: 9, color: MID, width: 36, textAlign: "right" },

  gapHeader: { flexDirection: "row", marginBottom: 8, paddingBottom: 6, borderBottomWidth: 0.5, borderBottomColor: "#ddd" },
  gapHeaderText: { fontSize: 8, fontWeight: "bold", color: LIGHT, textTransform: "uppercase", letterSpacing: 1 },
  gapRow: { flexDirection: "row", marginBottom: 6, paddingBottom: 6, borderBottomWidth: 0.3, borderBottomColor: "#eee" },
  gapReq: { flex: 3, fontSize: 9, color: DARK },
  gapStatus: { flex: 1, fontSize: 8, color: MID, textTransform: "capitalize" },
  gapScore: { flex: 1, fontSize: 8, color: MID, textAlign: "right" },

  rewriteCard: { marginBottom: 12, padding: 12, backgroundColor: "#fafafa", borderLeftWidth: 2, borderLeftColor: GOLD },
  rewriteOriginal: { fontSize: 9, color: LIGHT, textDecoration: "line-through", marginBottom: 6 },
  rewriteSuggested: { fontSize: 9, color: DARK, marginBottom: 4 },
  rewriteRationale: { fontSize: 8, color: MID, fontStyle: "italic" },
  rewriteMeta: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  rewriteImpact: { fontSize: 8, fontWeight: "bold", color: GOLD },
  rewriteTarget: { fontSize: 8, color: LIGHT },

  actionRow: { flexDirection: "row", marginBottom: 8, alignItems: "flex-start", paddingBottom: 8, borderBottomWidth: 0.3, borderBottomColor: "#eee" },
  actionPriority: { width: 28, fontSize: 8, fontWeight: "bold", color: GOLD },
  actionBody: { flex: 1 },
  actionText: { fontSize: 9, color: DARK, marginBottom: 2 },
  actionImpact: { fontSize: 8, color: LIGHT },

  footer: { position: "absolute", bottom: 30, left: 55, right: 55, fontSize: 7, color: "#bbb", textAlign: "center", borderTopWidth: 0.5, borderTopColor: "#ddd", paddingTop: 8 },
});

export interface AnalysisReportData {
  runId: number;
  createdAt: string;
  jdSource: string | null;
  resumeSource: string | null;
  overallScore: number | null;
  sectionScores: Record<string, number> | null;
  gapAnalysis: {
    gaps: Array<{ requirement: string; status: string; similarity_score: number; category: string; matched_evidence: string | null }>;
    matched_count: number;
    partial_count: number;
    missing_count: number;
    total_requirements: number;
  } | null;
  rewriteSuggestions: {
    suggestions: Array<{ original_bullet: string; suggested_rewrite: string; rationale: string; target_requirement: string; impact_score: number }>;
    hidden_experience: string[];
  } | null;
  actionList: Array<{ priority: number; action: string; impact: string; category: string }> | null;
}

function Bar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  return (
    <View style={styles.row}>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.scoreText}>{pct}%</Text>
    </View>
  );
}

export function AnalysisReportPDF({ data }: { data: AnalysisReportData }) {
  const date = new Date(data.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <Document>
      {/* Page 1: Cover */}
      <Page size="A4" style={styles.page}>
        <View style={styles.cover}>
          <Text style={styles.coverTitle}>PROTEUS</Text>
          <Text style={styles.coverSubtitle}>AI Resume Analysis Report</Text>
          <Text style={styles.coverMeta}>Run #{data.runId} · {date}</Text>
          {data.jdSource && <Text style={styles.coverMeta}>Job: {data.jdSource}</Text>}
          {data.resumeSource && <Text style={styles.coverMeta}>Resume: {data.resumeSource}</Text>}
          {data.overallScore != null && (
            <>
              <Text style={styles.coverScore}>{Math.round(data.overallScore * 100)}%</Text>
              <Text style={styles.coverScoreLabel}>Match Score</Text>
            </>
          )}
        </View>
        <Text style={styles.footer}>Generated by PROTEUS — AI-Powered Resume Analyzer</Text>
      </Page>

      {/* Page 2: Scores + Gap Analysis */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Section Scores</Text>
        <View style={styles.dividerGold} />
        {data.sectionScores && Object.entries(data.sectionScores).map(([key, val]) => (
          <View key={key} style={{ marginBottom: 6 }}>
            <Text style={[styles.label, { marginBottom: 2 }]}>{key}</Text>
            <Bar score={val} />
          </View>
        ))}
        {!data.sectionScores && <Text style={{ fontSize: 9, color: LIGHT }}>No section scores available</Text>}

        {data.gapAnalysis && (
          <>
            <View style={{ marginTop: 24 }}>
              <Text style={styles.sectionTitle}>Gap Analysis</Text>
              <View style={styles.dividerGold} />
            </View>
            <View style={{ flexDirection: "row", marginBottom: 10, gap: 14 }}>
              <Text style={{ fontSize: 9, color: MID }}>Matched: <Text style={{ color: GOLD_LIGHT }}>{data.gapAnalysis.matched_count}</Text></Text>
              <Text style={{ fontSize: 9, color: MID }}>Partial: <Text style={{ color: GOLD }}>{data.gapAnalysis.partial_count}</Text></Text>
              <Text style={{ fontSize: 9, color: MID }}>Missing: <Text style={{ color: "#dc3545" }}>{data.gapAnalysis.missing_count}</Text></Text>
              <Text style={{ fontSize: 9, color: LIGHT }}>/ {data.gapAnalysis.total_requirements} total</Text>
            </View>
            <View style={styles.gapHeader}>
              <Text style={[styles.gapHeaderText, { flex: 3 }]}>Requirement</Text>
              <Text style={[styles.gapHeaderText, { flex: 1 }]}>Status</Text>
              <Text style={[styles.gapHeaderText, { flex: 1, textAlign: "right" }]}>Score</Text>
            </View>
            {data.gapAnalysis.gaps.map((g, i) => (
              <View key={i} style={styles.gapRow}>
                <Text style={styles.gapReq}>{g.requirement}</Text>
                <Text style={styles.gapStatus}>{g.status}</Text>
                <Text style={styles.gapScore}>{Math.round(g.similarity_score * 100)}%</Text>
              </View>
            ))}
          </>
        )}
        <Text style={styles.footer}>Generated by PROTEUS — AI-Powered Resume Analyzer</Text>
      </Page>

      {/* Page 3: Rewrite Suggestions */}
      {data.rewriteSuggestions && data.rewriteSuggestions.suggestions.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Rewrite Suggestions</Text>
          <View style={styles.dividerGold} />
          {data.rewriteSuggestions.hidden_experience.length > 0 && (
            <Text style={{ fontSize: 8, color: LIGHT, marginBottom: 12 }}>
              Hidden experience surfaced: {data.rewriteSuggestions.hidden_experience.join(", ")}
            </Text>
          )}
          {data.rewriteSuggestions.suggestions.map((s, i) => (
            <View key={i} style={styles.rewriteCard}>
              <View style={styles.rewriteMeta}>
                <Text style={styles.rewriteImpact}>{Math.round(s.impact_score * 100)}% impact</Text>
                <Text style={styles.rewriteTarget}>{s.target_requirement}</Text>
              </View>
              <Text style={styles.rewriteOriginal}>{s.original_bullet}</Text>
              <Text style={styles.rewriteSuggested}>{s.suggested_rewrite}</Text>
              <Text style={styles.rewriteRationale}>{s.rationale}</Text>
            </View>
          ))}
          <Text style={styles.footer}>Generated by PROTEUS — AI-Powered Resume Analyzer</Text>
        </Page>
      )}

      {/* Page 4: Action Items */}
      {data.actionList && data.actionList.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Action Items</Text>
          <View style={styles.dividerGold} />
          {data.actionList.map((a, i) => (
            <View key={i} style={styles.actionRow}>
              <Text style={styles.actionPriority}>P{a.priority}</Text>
              <View style={styles.actionBody}>
                <Text style={styles.actionText}>{a.action}</Text>
                <Text style={styles.actionImpact}>{a.impact}</Text>
              </View>
            </View>
          ))}
          <Text style={styles.footer}>Generated by PROTEUS — AI-Powered Resume Analyzer</Text>
        </Page>
      )}
    </Document>
  );
}
