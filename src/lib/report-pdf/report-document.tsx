import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ComparisonReport } from "./report-types";

const s = StyleSheet.create({
  page: { backgroundColor: "#050505", color: "#F4F4F1", fontFamily: "Helvetica", fontSize: 10, paddingTop: 64, paddingBottom: 48, paddingHorizontal: 40 },
  header: { position: "absolute", top: 18, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#2A2A28", paddingBottom: 8 },
  footer: { position: "absolute", bottom: 18, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#2A2A28", paddingTop: 6 },
  brand: { color: "#00FF9C", fontSize: 8, letterSpacing: 1.1, fontFamily: "Helvetica-Bold" },
  meta: { color: "#8B8B86", fontSize: 8 },
  kicker: { color: "#8B8B86", fontSize: 8, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 },
  h1: { fontSize: 20, fontFamily: "Helvetica-Bold", color: "#FFFFFF", marginBottom: 10 },
  h2: { fontSize: 13, fontFamily: "Helvetica-Bold", color: "#FFFFFF", marginTop: 8, marginBottom: 6 },
  p: { color: "#D8D8D5", lineHeight: 1.45, marginBottom: 6 },
  row: { flexDirection: "row", gap: 8, marginBottom: 8 },
  card: { flexGrow: 1, flexBasis: 0, borderWidth: 1, borderColor: "#2A2A28", backgroundColor: "#111111", padding: 8 },
  label: { color: "#8B8B86", fontSize: 7, textTransform: "uppercase", marginBottom: 4 },
  value: { color: "#00FF9C", fontSize: 16, fontFamily: "Helvetica-Bold" },
  barTrack: { height: 8, backgroundColor: "#1A1A1A", marginBottom: 6 },
  barFill: { height: 8, backgroundColor: "#00FF9C" },
  disc: { color: "#A8A8A3", fontSize: 8, lineHeight: 1.4, marginTop: 8 },
  logo: { width: 150, height: 40, marginBottom: 14 },
  tr: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#2A2A28", paddingVertical: 4 },
  th: { color: "#FFE14A", fontSize: 8, fontFamily: "Helvetica-Bold" },
  td: { color: "#E8E8E4", fontSize: 8 },
});

function Chrome({ report }: { report: ComparisonReport }) {
  return (
    <>
      <View style={s.header} fixed>
        <Text style={s.brand}>DEMORE TECHNOLOGY SOLUTIONS</Text>
        <Text style={s.meta}>{report.reportNumber}</Text>
      </View>
      <View style={s.footer} fixed>
        <Text style={s.meta}>www.demoretechnologysolutions.com</Text>
        <Text style={s.meta} render={({ pageNumber, totalPages }) => `${report.reportNumber}  ·  ${pageNumber} / ${totalPages}`} />
      </View>
    </>
  );
}

function Bar({ label, value, color = "#00FF9C" }: { label: string; value: number; color?: string }) {
  return (
    <View style={{ marginBottom: 6 }}>
      <Text style={s.p}>{`${label}  ${value}`}</Text>
      <View style={s.barTrack}><View style={[s.barFill, { width: `${Math.max(4, Math.min(100, value))}%`, backgroundColor: color }]} /></View>
    </View>
  );
}

export function ReportDocument({ report, logoSrc }: { report: ComparisonReport; logoSrc?: string }) {
  return (
    <Document title={`Demore comparison — ${report.companyName}`} author="Demore Technology Solutions">
      <Page size="LETTER" style={s.page}>
        <Chrome report={report} />
        {logoSrc ? <Image src={logoSrc} style={s.logo} /> : <Text style={s.kicker}>Demore Technology Solutions</Text>}
        <Text style={s.kicker}>Prepared comparison report</Text>
        <Text style={s.h1}>AI Website, Competitor & Growth Comparison</Text>
        <Text style={s.p}>{report.companyName}</Text>
        <View style={s.row}>
          <View style={s.card}><Text style={s.label}>Website</Text><Text style={s.td}>{report.website}</Text></View>
          <View style={s.card}><Text style={s.label}>Industry</Text><Text style={s.td}>{report.industry}</Text></View>
        </View>
        <View style={s.row}>
          <View style={s.card}><Text style={s.label}>Market</Text><Text style={s.td}>{report.market}</Text></View>
          <View style={s.card}><Text style={s.label}>Prepared for</Text><Text style={s.td}>{report.contactName}</Text></View>
        </View>
        <View style={s.row}>
          <View style={s.card}><Text style={s.label}>Report number</Text><Text style={s.td}>{report.reportNumber}</Text></View>
          <View style={s.card}><Text style={s.label}>Report date</Text><Text style={s.td}>{report.reportDate}</Text></View>
        </View>
        <Text style={s.meta}>{`${report.contactEmail}${report.contactPhone ? ` · ${report.contactPhone}` : ""}${report.timeframe ? ` · Target: ${report.timeframe}` : ""}`}</Text>
        <Text style={s.p}>Prepared by Demore Technology Solutions</Text>
        <Text style={s.meta}>www.demoretechnologysolutions.com</Text>
        <Text style={s.meta}>ryan@demoretechnologysolutions.com</Text>
      </Page>
      <Page size="LETTER" style={s.page}>
        <Chrome report={report} />
        <Text style={s.kicker}>Executive summary</Text>
        <Text style={s.h1}>What the site is doing, in plain language.</Text>
        <View style={s.row}>
          <View style={s.card}><Text style={s.label}>Current site</Text><Text style={s.value}>{String(report.currentTotal)}</Text></View>
          <View style={s.card}><Text style={s.label}>Competitor avg</Text><Text style={s.value}>{String(report.competitorAverage)}</Text></View>
          <View style={s.card}><Text style={s.label}>Market leader</Text><Text style={s.value}>{String(report.marketLeader)}</Text></View>
        </View>
        <View style={s.row}>
          <View style={s.card}><Text style={s.label}>Potential</Text><Text style={s.value}>{String(report.potential)}</Text></View>
          <View style={s.card}><Text style={s.label}>Confidence</Text><Text style={s.value}>{`${report.confidence}%`}</Text></View>
        </View>
        <Text style={s.h2}>Current website</Text><Text style={s.p}>{report.summary.current}</Text>
        <Text style={s.h2}>Versus competitors</Text><Text style={s.p}>{report.summary.competitors}</Text>
        <Text style={s.h2}>Strongest / opportunities / holding back</Text>
        <Text style={s.p}>{report.summary.strongest}</Text>
        <Text style={s.p}>{report.summary.opportunities}</Text>
        <Text style={s.p}>{report.summary.holdingBack}</Text>
        <Text style={s.h2}>What Demore can connect</Text><Text style={s.p}>{report.summary.demoreCan}</Text>
        <Text style={s.h2}>Next step</Text><Text style={s.p}>{`${report.path}. ${report.summary.nextStep}`}</Text>
      </Page>
      <Page size="LETTER" style={s.page}>
        <Chrome report={report} />
        <Text style={s.kicker}>Scores</Text>
        <Text style={s.h1}>Score and competitor comparison</Text>
        <Text style={s.p}>{`Market: ${report.market}. Measured ${report.measurementDate}. These are capability scores, not rankings or revenue.`}</Text>
        <Bar label="Current site" value={report.currentTotal} />
        <Bar label="Competitor average" value={report.competitorAverage} color="#FF2A3A" />
        <Bar label="Market leader" value={report.marketLeader} color="#FFE14A" />
        <Bar label="Potential capability" value={report.potential} />
        <Text style={s.h2}>Named competitors</Text>
        {report.competitors.map((c) => <Text key={c.name} style={s.p}>{`${c.name}: ${c.total} (${c.evidence})${c.mapsRank ? ` · Maps #${c.mapsRank}` : ""}${c.organicRank ? ` · Organic #${c.organicRank}` : ""}${c.rating ? ` · ${c.rating}/5 (${c.reviewCount ?? 0} reviews)` : ""}. ${c.note}`}</Text>)}
        <Text style={s.p}>{report.competitorSelection}</Text>
        <Text style={s.h2}>Category comparison</Text>
        <Bar label={`SEO ${report.categories.seo}`} value={Math.round(report.categories.seo * (100 / (report.scoringWeights?.seo || 20)))} />
        <Bar label={`GEO ${report.categories.geo}`} value={Math.round(report.categories.geo * (100 / (report.scoringWeights?.geo || 15)))} color="#FFE14A" />
        <Bar label={`Conversion ${report.categories.conversion}`} value={Math.round(report.categories.conversion * (100 / (report.scoringWeights?.conversion || 15)))} color="#FF2A3A" />
        <Bar label={`Technical ${report.categories.technical}`} value={Math.round(report.categories.technical * (100 / (report.scoringWeights?.technical || 15)))} />
      </Page>
      <Page size="LETTER" style={s.page}>
        <Chrome report={report} />
        <Text style={s.kicker}>Platform gap</Text>
        <Text style={s.h1}>Current website versus Demore platform</Text>
        <View style={s.tr}><Text style={[s.th, { width: "22%" }]}>Capability</Text><Text style={[s.th, { width: "28%" }]}>Current</Text><Text style={[s.th, { width: "32%" }]}>Demore platform</Text><Text style={[s.th, { width: "18%" }]}>Status</Text></View>
        {report.capabilities.map((row) => (
          <View key={row.name} style={s.tr} wrap={false}>
            <Text style={[s.td, { width: "22%" }]}>{row.name}</Text>
            <Text style={[s.td, { width: "28%" }]}>{row.current}</Text>
            <Text style={[s.td, { width: "32%" }]}>{row.platform}</Text>
            <Text style={[s.td, { width: "18%" }]}>{row.status}</Text>
          </View>
        ))}
        <Text style={s.disc}>Unknown items are labeled. No passwords or secrets are stored.</Text>
      </Page>
      <Page size="LETTER" style={s.page}>
        <Chrome report={report} />
        <Text style={s.kicker}>Access</Text>
        <Text style={s.h1}>Technology and access readiness</Text>
        <Text style={s.p}>{`Platform: ${report.tech.platform}`}</Text>
        <Text style={s.p}>{`Hosting: ${report.tech.hosting}`}</Text>
        <Text style={s.p}>{`Domain / DNS: ${report.tech.domainDns}`}</Text>
        <Text style={s.p}>{`Analytics: ${report.tech.analytics}`}</Text>
        <Text style={s.p}>{`CRM: ${report.tech.crm}`}</Text>
        <Text style={s.p}>{`Scheduling / POS: ${report.tech.scheduling}`}</Text>
        <Text style={s.p}>{`Marketing tools: ${report.tech.marketing}`}</Text>
        <Text style={s.h2}>Confirmed / unknown</Text>
        <Text style={s.p}>{report.tech.confirmed.join("; ") || "None confirmed beyond the public site."}</Text>
        <Text style={s.p}>{report.tech.unknown.join("; ")}</Text>
        <Text style={s.h2}>Access</Text>
        <Text style={s.p}>{report.tech.accessStatus}</Text>
        <Text style={s.p}>{report.tech.transferability}</Text>
        <Text style={s.p}>{report.tech.restrictions}</Text>
        <Text style={s.p}>{report.tech.accessNeeded}</Text>
        <Text style={s.p}>{`Recommended path: ${report.path}.`}</Text>
      </Page>
      <Page size="LETTER" style={s.page}>
        <Chrome report={report} />
        <Text style={s.kicker}>Outlook</Text>
        <Text style={s.h1}>Growth and capability outlook</Text>
        <Text style={s.p}>{report.outlook.current}</Text>
        <Text style={s.h2}>Website-improvement scenario</Text><Text style={s.p}>{report.outlook.websiteOnly}</Text>
        <Text style={s.h2}>Complete platform scenario</Text><Text style={s.p}>{report.outlook.platform}</Text>
        <Text style={s.h2}>Capability-maturity timeline</Text>
        <Text style={s.p}>This is capability maturity, not a traffic or revenue forecast.</Text>
        {report.outlook.maturity.map((p) => <Bar key={p.label} label={p.label} value={p.value} />)}
        <Text style={s.h2}>30 / 60 / 90-day roadmap</Text>
        {report.outlook.roadmap.map((item) => <Text key={item.window} style={s.p}>{`${item.window}: ${item.focus}`}</Text>)}
        <Text style={s.h2}>Priority versus effort</Text>
        {report.outlook.priorities.map((item) => <Text key={item.label} style={s.p}>{`${item.label}: impact ${item.impact}, effort ${item.effort}`}</Text>)}
      </Page>
      <Page size="LETTER" style={s.page}>
        <Chrome report={report} />
        <Text style={s.kicker}>Actions</Text>
        <Text style={s.h1}>Detailed recommendations</Text>
        {report.recommendations.map((item, i) => (
          <View key={`${item.stage}-${i}`} wrap={false} style={{ marginBottom: 8 }}>
            <Text style={{ color: "#00FF9C", fontSize: 9, fontFamily: "Helvetica-Bold" }}>{`${item.stage} · ${item.priority}`}</Text>
            <Text style={s.p}>{`Finding: ${item.finding}`}</Text>
            <Text style={s.p}>{`Evidence: ${item.evidence}`}</Text>
            <Text style={s.p}>{`Impact: ${item.impact}`}</Text>
            <Text style={s.p}>{`Action: ${item.action}`}</Text>
            <Text style={s.meta}>{`Implementation: ${item.implementation}`}</Text>
          </View>
        ))}
      </Page>
      <Page size="LETTER" style={s.page}>
        <Chrome report={report} />
        <Text style={s.kicker}>Limits</Text>
        <Text style={s.h1}>Methodology, sources and limitations</Text>
        <Text style={s.h2}>Measured</Text><Text style={s.p}>{report.methodology.measured.join(" ")}</Text>
        <Text style={s.h2}>Publicly detected</Text><Text style={s.p}>{report.methodology.detected.join(" ")}</Text>
        <Text style={s.h2}>Customer supplied</Text><Text style={s.p}>{report.methodology.supplied.join(" ")}</Text>
        <Text style={s.h2}>Sources / benchmarks / assumptions</Text>
        <Text style={s.p}>{report.methodology.sources.join(" ")}</Text>
        <Text style={s.p}>{report.methodology.benchmarks.join(" ")}</Text>
        <Text style={s.p}>{report.methodology.assumptions.join(" ")}</Text>
        <Text style={s.h2}>Unknown / confidence</Text>
        <Text style={s.p}>{report.methodology.unknowns.join(" ")}</Text>
        <Text style={s.p}>{report.methodology.confidenceNote}</Text>
        <Text style={s.p}>{`Scoring version ${report.scoringVersion}. Measurement date ${report.measurementDate}.`}</Text>
        <Text style={s.disc}>Potential improvements are estimates based on publicly available information, customer-provided details, industry benchmarks and stated assumptions. Results are not guaranteed. Actual performance depends on competition, budget, implementation, market conditions, content, advertising and ongoing management.</Text>
      </Page>
    </Document>
  );
}
