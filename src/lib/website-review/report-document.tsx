import {capabilities} from "../control-capabilities";
import {consoleOverview,offeringReadiness,leadGenerationOffering,customerPdfData} from "../console-offering";
import { Document, Image, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { WebsiteReviewReport } from "./types";

const s = StyleSheet.create({
  page: { backgroundColor: "#050505", color: "#F4F4F1", fontFamily: "Helvetica", fontSize: 10, paddingTop: 64, paddingBottom: 72, paddingHorizontal: 40 },
  header: { position: "absolute", top: 18, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#2A2A28", paddingBottom: 8 },
  footer: { position: "absolute", bottom: 14, left: 40, right: 40, height: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#2A2A28", paddingTop: 6 },
  brand: { color: "#00FF9C", fontSize: 8, letterSpacing: 1.1, fontFamily: "Helvetica-Bold" },
  meta: { color: "#8B8B86", fontSize: 8 },
  kicker: { color: "#8B8B86", fontSize: 8, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 },
  h1: { fontSize: 20, fontFamily: "Helvetica-Bold", color: "#FFFFFF", marginBottom: 10 },
  h2: { fontSize: 13, fontFamily: "Helvetica-Bold", color: "#FFFFFF", marginTop: 8, marginBottom: 4 },
  p: { color: "#D8D8D5", fontSize: 9, lineHeight: 1.35, marginBottom: 4 },
  disc: { color: "#A8A8A3", fontSize: 8, lineHeight: 1.4, marginTop: 8 },
  row: { flexDirection: "row", gap: 8, marginBottom: 8 },
  card: { flexGrow: 1, flexBasis: 0, borderWidth: 1, borderColor: "#2A2A28", backgroundColor: "#111111", padding: 8 },
  label: { color: "#8B8B86", fontSize: 7, textTransform: "uppercase", marginBottom: 4 },
  value: { color: "#00FF9C", fontSize: 16, fontFamily: "Helvetica-Bold" },
  barTrack: { height: 8, backgroundColor: "#1A1A1A", marginBottom: 4 },
  barFill: { height: 8, backgroundColor: "#00FF9C" },
  tr: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#2A2A28", paddingVertical: 5 },
  th: { color: "#FFE14A", fontSize: 8, fontFamily: "Helvetica-Bold" },
  td: { color: "#E8E8E4", fontSize: 8 },
  logo: { width: 92, height: 25, objectFit: "contain", objectPosition: "left center" },
  footerBrand: { flexDirection: "row", alignItems: "center", gap: 8, width: "72%" },
  footerText: { color: "#BDBDB8", fontSize: 6.8, lineHeight: 1.35 },
  chip: { color: "#00FF9C", fontSize: 8, letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 },
});

function Chrome({ report, logoSrc }: { report: WebsiteReviewReport; logoSrc?: string }) {
  return (
    <>
      <View style={s.header} fixed>
        <Text style={s.brand}>DEMORE TECHNOLOGY SOLUTIONS</Text>
        <Text style={s.meta}>{report.recordId}</Text>
      </View>
      <View style={s.footer} fixed>
        <View style={s.footerBrand}>
          {logoSrc ? <Image src={logoSrc} style={s.logo} /> : <Text style={s.brand}>DEMORE</Text>}
          <View>
            <Text style={s.footerText}>Demore Technology Solutions · Mentor, Lake County, Ohio · Nationwide, remote</Text>
            <Text style={s.footerText}>ryan@demoretechnologysolutions.com · www.demoretechnologysolutions.com</Text>
            <Text style={s.footerText}>Rankings, AI citations, and conversion lifts are not guaranteed.</Text>
          </View>
        </View>
        <Text style={s.meta} render={({ pageNumber, totalPages }) => `${report.recordId}  ·  ${pageNumber} / ${totalPages}`} />
      </View>
    </>
  );
}

function StatusColor(status: string) {
  if (status === "Detected") return "#00FF9C";
  if (status === "Not detected") return "#FF2A3A";
  return "#8B8B86";
}

export function WebsiteReviewDocument({ report, logoSrc }: { report: WebsiteReviewReport; logoSrc?: string }) {
  report = customerPdfData(report);
  const detected = report.current.checks.filter((item) => item.status === "Detected").length;
  const applicable = report.current.checks.filter((item) => item.status !== "Not applicable").length;
  const recommendations = [...report.recommendations].sort((a, b) => Number(a.effort !== "Quick win") - Number(b.effort !== "Quick win"));

  return (
    <Document creationDate={new Date(report.createdAt)} modificationDate={new Date(report.createdAt)} title={`Website opportunity report — ${report.recordId}`} author="Demore Technology Solutions">
      {report.tailoredPriorities?.length ? <Page size="LETTER" style={s.page}>
        <Chrome report={report} logoSrc={logoSrc} />
        <Text style={s.kicker}>Your tailored improvement plan</Text>
        <Text style={s.h1}>Priorities for your business</Text>
        <Text style={s.disc}>Recommendations informed by relevant business details you provided and the website review. Customer-provided details are not independently verified findings. Validate scope and integrations before implementation.</Text>
        {report.tailoredPriorities.map(item => <View key={item.id} wrap={false}>
          <Text style={s.h2}>{item.label}</Text>
          <Text style={s.p}>{item.reason}</Text>
          <Text style={s.p}>{item.action}</Text>
        </View>)}
      </Page> : null}
      {report.revisions?.length ? <Page size="LETTER" style={s.page}>
        <Chrome report={report} logoSrc={logoSrc} />
        <Text style={s.kicker}>Updated improvement plan · Version {report.revisions.length + 1}</Text>
        <Text style={s.h1}>Updated recommendations</Text>
        <Text style={s.p}>{report.current.url}</Text>
        <Text style={s.disc}>The latest revision below supersedes earlier recommendations where they conflict. These are customer-provided updates and proposed improvements, not a new website scan. Original detected findings follow for reference.</Text>
        {report.revisions.slice(-1).map(revision => <View key={revision.number}>
          <Text style={s.h2}>Revised recommendations</Text><Text style={s.p}>{revision.response.replace(/\*\*/g, "").replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")}</Text>
        </View>)}
      </Page> : null}
      <Page size="LETTER" style={s.page}>
        <Chrome report={report} logoSrc={logoSrc} />
        <Text style={s.h1}>Your website, competitors and improvements</Text>
        <Text style={s.p}>{report.current.url}</Text>
        {[0,1].map(i=><View key={i} wrap={false}><Text style={s.p}>{`Competitor ${i+1}: ${report.competitors?.[i]?.title || "Unavailable"}`}</Text>{report.competitors?.[i]&&<Link style={s.p} src={report.competitors[i].url}>{report.competitors[i].url}</Link>}</View>)}
        <Text style={s.disc}>{report.competitorNote || "No verified competitor websites are attached to this saved report. Create a new report with a target market to request discovery."}</Text>
        <View style={{flexDirection:"row",marginTop:12,marginBottom:8}}><Text style={[s.p,{width:"22%"}]}>Capability</Text><Text style={[s.p,{width:"14%"}]}>Your site</Text><Text style={[s.p,{width:"14%"}]}>Competitor 1</Text><Text style={[s.p,{width:"14%"}]}>Competitor 2</Text><Text style={[s.p,{width:"36%"}]}>Demore improvement</Text></View>
        {report.current.checks.map(check=><View key={check.id} wrap={false} style={{flexDirection:"row",borderTopWidth:1,borderTopColor:"#2A2A28",paddingVertical:6}}><Text style={[s.p,{width:"22%",paddingRight:5}]}>{check.label}</Text><Text style={[s.p,{width:"14%",paddingRight:4}]}>{check.status}</Text>{[0,1].map(i=><Text key={i} style={[s.p,{width:"14%",paddingRight:4}]}>{report.competitors?.[i]?.checks.find(c=>c.id===check.id)?.status||"Unavailable"}</Text>)}<Text style={[s.p,{width:"36%"}]}>{check.improve}</Text></View>)}
        <Text style={s.disc}>Not detected means absent from the public response, not proof the capability does not exist. Demore improvements are proposed work requiring validation, not guaranteed outcomes.</Text>
      </Page>
      <Page size="LETTER" style={s.page}>
        <Chrome report={report} logoSrc={logoSrc} />
        <Text style={s.kicker}>Website opportunity report</Text>
        <Text style={s.h1}>See what this website could do next.</Text>
        <Text style={s.p}>{report.current.url}</Text>
        <View style={s.row}>
          <View style={s.card}>
            <Text style={s.label}>Detected signals</Text>
            <Text style={s.value}>{`${detected} / ${applicable}`}</Text>
          </View>
          <View style={s.card}>
            <Text style={s.label}>Record ID</Text>
            <Text style={s.value}>{report.recordId}</Text>
          </View>
        </View>
        <Text style={s.p}>{`Prepared ${report.createdAt.slice(0, 10)} for a public HTML review. Bars show detected HTML signals, not speed, rankings, or revenue.`}</Text>
        <Text style={s.h2}>Observable coverage by category</Text>
        {report.categories.map((category) => {
          const refs = report.benchmark.checks.filter((item) => item.category === category.name && item.status !== "Not applicable" && item.status !== "Unavailable");
          const refDetected = refs.filter((item) => item.status === "Detected").length;
          const refTotal = report.benchmark.unavailable ? 0 : refs.length;
          return (
            <View key={category.name} wrap={false} style={{ marginBottom: 8 }}>
              <Text style={s.p}>{category.name}</Text>
              <Text style={s.meta}>Your page</Text>
              <View style={s.barTrack}>
                <View style={[s.barFill, { width: `${category.total ? Math.max(4, (category.detected / category.total) * 100) : 0}%` }]} />
              </View>
              <Text style={s.meta}>{category.total ? `${category.detected} / ${category.total}` : "Not applicable"}</Text>
              <Text style={s.meta}>Internal capability reference</Text>
              <View style={s.barTrack}>
                <View style={[s.barFill, { width: `${refTotal ? Math.max(4, (refDetected / refTotal) * 100) : 0}%`, backgroundColor: "#8B8B86" }]} />
              </View>
              <Text style={s.meta}>{report.benchmark.unavailable ? "Unavailable" : refTotal ? `${refDetected} / ${refTotal}` : "Not applicable"}</Text>
            </View>
          );
        })}
        <Text style={s.disc}>Preserve what works. Confirm apparent gaps before commissioning changes. Revenue, rankings, speed, and conversion lifts have not been measured and are not guaranteed.</Text>
      </Page>

      <Page size="LETTER" style={s.page}>
        <Chrome report={report} logoSrc={logoSrc} />
        <Text style={s.kicker}>Side-by-side comparison</Text>
        <Text style={s.h1}>Your page. Relevant capability signals.</Text>
        <Text style={s.p}>The reference combines publicly observed signals from two internal implementations. A signal means it was found on at least one reference, not that every feature is relevant to your business or active in your system.</Text>
        <Text style={s.meta}>Internal reference sources are used for capability research only.</Text>
        {report.benchmark.unavailable ? (
          <Text style={s.p}>The reference site could not be fetched. Its findings are unavailable. No benchmark scores were invented.</Text>
        ) : null}
        <View style={[s.tr, { marginTop: 10 }]}>
          <Text style={[s.th, { width: "40%" }]}>Website signal</Text>
          <Text style={[s.th, { width: "30%" }]}>Your page</Text>
          <Text style={[s.th, { width: "30%" }]}>Reference capabilities</Text>
        </View>
        {report.current.checks.map((item) => {
          const reference = report.benchmark.checks.find((row) => row.id === item.id)?.status || "Unavailable";
          return (
            <View key={item.id} style={s.tr} wrap={false}>
              <Text style={[s.td, { width: "40%" }]}>{item.label}</Text>
              <Text style={[s.td, { width: "30%", color: StatusColor(item.status) }]}>{item.status}</Text>
              <Text style={[s.td, { width: "30%", color: StatusColor(reference) }]}>{reference}</Text>
            </View>
          );
        })}
        <Text style={s.disc}>Detected = found in returned HTML. Not detected = not found in this limited scan. Not applicable = no relevant images to check. A detected feature still needs functional and quality testing.</Text>
      </Page>

      <Page size="LETTER" style={s.page}>
        <Chrome report={report} logoSrc={logoSrc} />
        <Text style={s.kicker}>Industry context</Text>
        <Text style={s.h1}>Built around the customer journey.</Text>
        <Text style={s.h2}>{report.industry.name}</Text>
        <Text style={s.p}>{report.industry.source}</Text>
        <Text style={s.p}>{report.industry.evidence}</Text>
        <Text style={s.p}>{`Priority journey: ${report.industry.journey}`}</Text>
        <Text style={s.p}>{`Measure: ${report.industry.measure}`}</Text>
        <Text style={s.h2}>Industry-specific capabilities</Text>
        <Text style={s.p}>These are scoped opportunities for this industry. They do not name third-party model vendors and they are not confirmed installations.</Text>
        {(report.industry.capabilities || []).map((item) => (
          <View key={item.id} wrap={false} style={{ marginBottom: 8 }}>
            <Text style={s.chip}>{item.effort}</Text>
            <Text style={s.h2}>{item.label}</Text>
            <Text style={s.p}>{item.why}</Text>
            <Text style={s.meta}>{`Verify: ${item.verify}`}</Text>
            <Text style={s.p}>{`Proposed improvement: ${item.improve}`}</Text>
          </View>
        ))}
        <Text style={s.h2}>Prioritized action plan</Text>
        {recommendations.length ? recommendations.map((item, index) => (
          <View key={item.id} wrap={false} style={{ marginBottom: 10 }}>
            <Text style={s.chip}>{`${String(index + 1).padStart(2, "0")} / ${item.effort}`}</Text>
            <Text style={s.h2}>{item.label}</Text>
            <Text style={s.p}>{item.action}</Text>
            <Text style={s.meta}>{`Verify: ${item.verify}`}</Text>
            <Text style={s.p}>{`Proposed improvement: ${item.improve}`}</Text>
            <Text style={s.meta}>{`Demore offering: ${item.offer}`}</Text>
          </View>
        )) : (
          <Text style={s.p}>All applicable quick-review signals were detected. Next, validate the customer journey, lead routing, accessibility, and measurement with a manual review.</Text>
        )}
      </Page>

      <Page size="LETTER" style={s.page}>
        <Chrome report={report} logoSrc={logoSrc} />
        <Text style={s.kicker}>Measurement</Text>
        <Text style={s.h1}>Analytics, Search Console, and conversions.</Text>
        <Text style={s.p}>Public tags and files only. Private Google Analytics and Search Console accounts were not opened. Rankings, AI citations, and conversion lifts are not guaranteed.</Text>
        {report.current.checks.filter((item) => item.category === "Measurement").map((item) => (
          <View key={item.id} wrap={false} style={{ marginBottom: 10 }}>
            <Text style={s.chip}>{`${item.status} / ${item.effort}`}</Text>
            <Text style={s.h2}>{item.label}</Text>
            <Text style={s.p}>{item.evidence}</Text>
            <Text style={s.meta}>{`Verify: ${item.verify}`}</Text>
            <Text style={s.p}>{`Proposed improvement: ${item.improve}`}</Text>
          </View>
        ))}
        <Text style={s.h2}>AI and search visibility</Text>
        {report.current.checks.filter((item) => item.category === "AI and search visibility").map((item) => (
          <View key={item.id} wrap={false} style={{ marginBottom: 10 }}>
            <Text style={s.chip}>{`${item.status} / ${item.effort}`}</Text>
            <Text style={s.h2}>{item.label}</Text>
            <Text style={s.p}>{item.evidence}</Text>
            <Text style={s.meta}>{`Verify: ${item.verify}`}</Text>
            <Text style={s.p}>{`Proposed improvement: ${item.improve}`}</Text>
          </View>
        ))}
      </Page>

      <Page size="LETTER" style={s.page}>
        <Chrome report={report} logoSrc={logoSrc} />
        <Text style={s.kicker}>Control center and specialist teams</Text>
        <Text style={s.h1}>Coordinate the work behind growth.</Text>
        <Text style={s.p}>{consoleOverview}</Text>
        <Text style={s.h2}>Automated lead generation</Text><Text style={s.p}>{leadGenerationOffering}</Text>
        <Text style={s.h2}>What is available and what needs setup</Text><Text style={s.p}>{offeringReadiness}</Text>
        <Text style={s.h2}>Specialists matched to the work</Text>
        {capabilities.map(bot=><View key={bot.id} wrap={false} style={{marginBottom:7}}><Text style={s.h2}>{bot.name}</Text><Text style={s.p}>{bot.purpose}. Output: {bot.output}.</Text></View>)}
      </Page>
      <Page size="LETTER" style={s.page}>
        <Chrome report={report} logoSrc={logoSrc} />
        <Text style={s.kicker}>Beyond the public page</Text>
        <Text style={s.h1}>Connect the website to the business.</Text>
        <Text style={s.p}>These are opportunities Demore Technology Solutions can evaluate. They are not confirmed installations, included deliverables, prices, or guaranteed outcomes.</Text>
        {report.offerings.map(([name, detail]) => (
          <View key={name} wrap={false} style={{ marginBottom: 8 }}>
            <Text style={s.h2}>{name}</Text>
            <Text style={s.p}>{detail}</Text>
          </View>
        ))}
        <Text style={s.h2}>Suggested delivery sequence</Text>
        <Text style={s.p}>1. Validate the gaps and repair the primary inquiry path.</Text>
        <Text style={s.p}>2. Connect qualification, routing, and follow-up.</Text>
        <Text style={s.p}>3. Establish measurement and review approved improvements.</Text>
        <Text style={s.h2}>What this review can tell you</Text>
        <Text style={s.p}>{report.methodology}</Text>
        <Text style={s.h2}>Start a project</Text>
        <Text style={s.p}>{`demoretechnologysolutions.com/contact?need=platform&source=website-review&rid=${report.recordId}`}</Text>
        <Text style={s.p}>ryan@demoretechnologysolutions.com · Mentor, Lake County, Ohio</Text>
        <Text style={s.disc}>No passwords, pricing, or ranking guarantees are included in this report.</Text>
      </Page>
    </Document>
  );
}
