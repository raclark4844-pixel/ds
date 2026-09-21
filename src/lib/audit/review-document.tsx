import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { AuditReport } from "./analyze";

const s = StyleSheet.create({
  page: { backgroundColor: "#050505", color: "#F4F4F1", fontFamily: "Helvetica", fontSize: 10, paddingTop: 64, paddingBottom: 72, paddingHorizontal: 40 },
  header: { position: "absolute", top: 18, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#2A2A28", paddingBottom: 8 },
  footer: { position: "absolute", bottom: 18, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#2A2A28", paddingTop: 8 },
  brand: { color: "#00FF9C", fontSize: 8, letterSpacing: 1.1, fontFamily: "Helvetica-Bold" },
  meta: { color: "#8B8B86", fontSize: 8 },
  kicker: { color: "#00FF9C", fontSize: 8, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 },
  h1: { fontSize: 20, fontFamily: "Helvetica-Bold", color: "#FFFFFF", marginBottom: 10 },
  h2: { fontSize: 13, fontFamily: "Helvetica-Bold", color: "#FFFFFF", marginTop: 10, marginBottom: 4 },
  p: { color: "#D8D8D5", fontSize: 9, lineHeight: 1.4, marginBottom: 4 },
  barTrack: { height: 8, backgroundColor: "#1A1A1A", marginBottom: 6 },
  barFill: { height: 8, backgroundColor: "#00FF9C" },
  tr: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#2A2A28", paddingVertical: 4 },
  th: { color: "#FFE14A", fontSize: 8, fontFamily: "Helvetica-Bold" },
  td: { color: "#E8E8E4", fontSize: 8 },
  logo: { width: 92, height: 25, objectFit: "contain" },
});

function Chrome({ report, logoSrc }: { report: AuditReport; logoSrc?: string }) {
  return (
    <>
      <View style={s.header} fixed>
        {logoSrc ? <Image src={logoSrc} style={s.logo} /> : <Text style={s.brand}>DEMORE TECHNOLOGY SOLUTIONS</Text>}
        <Text style={s.meta}>{report.recordId}</Text>
      </View>
      <View style={s.footer} fixed>
        <Text style={s.meta}>Mentor, Lake County, Ohio · ryan@demoretechnologysolutions.com</Text>
        <Text style={s.meta} render={({ pageNumber, totalPages }) => `${report.recordId}  ·  ${pageNumber} / ${totalPages}`} />
      </View>
    </>
  );
}

export function ReviewDocument({ report, logoSrc }: { report: AuditReport; logoSrc?: string }) {
  return (
    <Document title={`Website Opportunity Report — ${report.recordId}`} author="Demore Technology Solutions">
      <Page size="LETTER" style={s.page}>
        <Chrome report={report} logoSrc={logoSrc} />
        <Text style={s.kicker}>Website opportunity report</Text>
        <Text style={s.h1}>A clearer path to your next customer.</Text>
        <Text style={s.p}>{report.current.url}</Text>
        <Text style={s.p}>{`Prepared ${report.createdAt.slice(0, 10)} · Record ${report.recordId}`}</Text>
        <Text style={s.p}>
          Bars show detected HTML signals, not speed, rankings, or revenue. Rankings, AI citations, and conversion lifts are not guaranteed.
        </Text>
        {report.categories.map((c) => {
          const refs = report.benchmark.checks.filter((r) => r.category === c.name && r.status !== "Not applicable");
          const refCount = report.benchmark.unavailable ? 0 : refs.filter((r) => r.status === "Detected").length;
          const refTotal = report.benchmark.unavailable ? 0 : refs.length;
          return (
            <View key={c.name} wrap={false}>
              <Text style={s.h2}>{c.name}</Text>
              <Text style={s.p}>{`Your page ${c.detected} / ${c.total}`}</Text>
              <View style={s.barTrack}>
                <View style={[s.barFill, { width: `${c.total ? (c.detected / c.total) * 100 : 0}%` }]} />
              </View>
              <Text style={s.p}>{refTotal ? `Demore Exterior Solutions ${refCount} / ${refTotal}` : "Reference unavailable. No score invented."}</Text>
            </View>
          );
        })}
      </Page>
      <Page size="LETTER" style={s.page}>
        <Chrome report={report} logoSrc={logoSrc} />
        <Text style={s.kicker}>Side-by-side</Text>
        <Text style={s.h1}>Your page. A working reference.</Text>
        <Text style={s.p}>Demore Exterior Solutions is a live reference for visible website features, not a claim that every business needs a contractor website.</Text>
        <View style={s.tr}>
          <Text style={[s.th, { width: "40%" }]}>Capability</Text>
          <Text style={[s.th, { width: "30%" }]}>Your page</Text>
          <Text style={[s.th, { width: "30%" }]}>Demore Exterior</Text>
        </View>
        {report.current.checks.map((row) => (
          <View key={row.id} style={s.tr} wrap={false}>
            <Text style={[s.td, { width: "40%" }]}>{row.label}</Text>
            <Text style={[s.td, { width: "30%" }]}>{row.status}</Text>
            <Text style={[s.td, { width: "30%" }]}>
              {report.benchmark.unavailable ? "Unavailable" : report.benchmark.checks.find((c) => c.id === row.id)?.status || "Unavailable"}
            </Text>
          </View>
        ))}
      </Page>
      <Page size="LETTER" style={s.page}>
        <Chrome report={report} logoSrc={logoSrc} />
        <Text style={s.kicker}>Action plan</Text>
        <Text style={s.h1}>Improve the right things first.</Text>
        {report.recommendations.length ? (
          report.recommendations.map((row, i) => (
            <View key={row.id} wrap={false}>
              <Text style={s.h2}>{`${String(i + 1).padStart(2, "0")} / ${row.effort} — ${row.label}`}</Text>
              <Text style={s.p}>{row.action}</Text>
              <Text style={s.meta}>{`Demore offering: ${row.offer}`}</Text>
            </View>
          ))
        ) : (
          <Text style={s.p}>All applicable quick-review signals were detected. Next, validate the customer journey, routing, accessibility, and measurement.</Text>
        )}
        <Text style={s.h2}>Additional opportunities to verify</Text>
        {report.offerings.map(([name, detail]) => (
          <Text key={name} style={s.p}>{`${name}. ${detail}`}</Text>
        ))}
        <Text style={s.h2}>Evidence</Text>
        <Text style={s.p}>{report.methodology}</Text>
        <Text style={s.p}>Rankings, AI citations, and conversion lifts are not guaranteed. No pricing. No passwords.</Text>
      </Page>
    </Document>
  );
}
