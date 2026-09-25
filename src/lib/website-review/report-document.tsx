import { Document, Image, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { customerPdfData } from "../console-offering";
import {
  businessGuidance,
  checkExplanation,
  plainText,
  reviewOverview,
  supportAreas,
} from "./plain-language";
import type { WebsiteReviewReport } from "./types";

const s = StyleSheet.create({
  page: {
    backgroundColor: "#080808",
    color: "#EEEEEA",
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingTop: 80,
    paddingBottom: 72,
    paddingHorizontal: 40,
  },
  header: {
    position: "absolute",
    top: 24,
    left: 40,
    right: 40,
    height: 38,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#303030",
    paddingBottom: 9,
  },
  footer: {
    position: "absolute",
    top: 740,
    height: 32,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#303030",
    paddingTop: 9,
  },
  footerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  footerText: { fontSize: 7, color: "#B6B6B0", lineHeight: 1.5 },
  logo: { width: 104, height: 28, objectFit: "contain" },
  brand: { color: "#00FF9C", fontSize: 9, fontFamily: "Helvetica-Bold" },
  meta: { color: "#B6B6B0", fontSize: 8, lineHeight: 1.5 },
  kicker: { color: "#B6B6B0", fontSize: 8, letterSpacing: 1.5, marginBottom: 9 },
  h1: { fontSize: 22, fontFamily: "Helvetica-Bold", color: "#FFFFFF", marginBottom: 13 },
  h2: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#FFFFFF", marginBottom: 7 },
  p: { fontSize: 10, lineHeight: 1.5, marginBottom: 10 },
  note: { fontSize: 8.5, color: "#B6B6B0", lineHeight: 1.5, marginBottom: 9 },
  score: {
    borderWidth: 1,
    borderColor: "#303030",
    padding: 13,
    marginVertical: 14,
    flexDirection: "row",
    gap: 20,
    alignItems: "center",
  },
  scoreValue: { color: "#00FF9C", fontFamily: "Helvetica-Bold", fontSize: 24, marginTop: 5 },
  label: { fontSize: 8, color: "#B6B6B0", marginBottom: 6 },
  columns: { flexDirection: "row", gap: 20 },
  column: { flex: 1 },
  listTitle: {
    color: "#00FF9C",
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    borderBottomWidth: 1,
    borderBottomColor: "#303030",
    paddingBottom: 8,
    marginBottom: 8,
  },
  item: { fontSize: 8.5, lineHeight: 1.45, marginBottom: 6 },
  action: { borderTopWidth: 1, borderTopColor: "#303030", paddingTop: 12, marginBottom: 14 },
  badge: { color: "#00FF9C", fontSize: 8, fontFamily: "Helvetica-Bold", marginBottom: 6 },
  actionText: { fontSize: 9, lineHeight: 1.45 },
  block: { borderTopWidth: 1, borderTopColor: "#303030", paddingTop: 13, marginTop: 8 },
  card: { flex: 1, borderWidth: 1, borderColor: "#303030", padding: 13 },
  cardTitle: { fontSize: 11, color: "#00FF9C", fontFamily: "Helvetica-Bold", marginBottom: 8 },
  link: { color: "#EEEEEA", fontSize: 10, marginBottom: 8 },
});

function Chrome({ report, logoSrc }: { report: WebsiteReviewReport; logoSrc?: string }) {
  return (
    <>
      <View style={s.header} fixed>
        {logoSrc ? (
          <Image src={logoSrc} style={s.logo} />
        ) : (
          <Text style={s.brand}>DEMORE TECHNOLOGY SOLUTIONS</Text>
        )}
        <Text style={s.meta}>{report.recordId}</Text>
      </View>
      <View style={s.footer} fixed>
        <Text style={s.footerText}>
          Demore Technology Solutions · Mentor, Lake County, Ohio · Nationwide, remote
        </Text>
        <View style={s.footerRow}>
          <Text style={s.footerText}>
            ryan@demoretechnologysolutions.com · www.demoretechnologysolutions.com
          </Text>
        </View>
      </View>
      <Text
        fixed
        style={{
          position: "absolute",
          top: 758,
          right: 40,
          width: 70,
          fontSize: 7,
          color: "#B6B6B0",
          textAlign: "right",
        }}
        render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`}
      />
    </>
  );
}

function chunks<T>(items: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, i) =>
    items.slice(i * size, (i + 1) * size),
  );
}

export function WebsiteReviewDocument({
  report: source,
  logoSrc,
}: {
  report: WebsiteReviewReport;
  logoSrc?: string;
}) {
  const report = customerPdfData(source);
  const overview = reviewOverview(report);
  const actionPages = chunks(overview.actions, 4);
  if (!actionPages.length) actionPages.push([]);
  const guidance = businessGuidance(report);
  const revision = report.revisions?.at(-1);
  const title = plainText(report.current.title || report.current.url);
  const latestVersion = (report.revisions?.length || 0) + 1;
  return (
    <Document
      title={`Website review - ${title}`}
      author="Demore Technology Solutions"
      creationDate={new Date(report.createdAt)}
    >
      <Page size="LETTER" style={s.page}>
        <Text style={s.h2}>{title}</Text>
        <Text style={s.kicker}>WEBSITE REVIEW</Text>
        <Text style={s.h1}>Here's what we found on your website.</Text>
        <Text style={s.meta}>{plainText(report.current.url)}</Text>
        <Text
          style={s.meta}
        >{`Prepared ${report.createdAt.slice(0, 10)} · Reference ${report.recordId}${revision ? ` · Updated plan v${latestVersion}` : ""}`}</Text>
        <View style={{ marginTop: 13 }}>
          <Text style={s.p}>
            We checked the public page and available website files for basics that help people find
            your business, understand what you offer and take the next step. Here is what we found
            and what deserves a closer look.
          </Text>
        </View>
        <View style={s.score} wrap={false}>
          <View style={{ width: 140 }}>
            <Text style={s.label}>BASICS FOUND</Text>
            <Text style={[s.scoreValue, { fontSize: overview.total ? 24 : 16 }]}>
              {overview.total ? `${overview.found.length} / ${overview.total}` : "Not available"}
            </Text>
          </View>
          <Text style={[s.note, { flex: 1, marginBottom: 0 }]}>
            This is a starting point, not a full test of how the website works. Finding an item does
            not confirm its quality or results.
          </Text>
        </View>
        <View style={s.columns}>
          <View style={s.column}>
            <Text style={s.listTitle}>ALREADY IN PLACE</Text>
            {overview.found.length ? (
              overview.found.map((c) => (
                <Text key={c.id} style={s.item}>
                  • {checkExplanation(c).found}
                </Text>
              ))
            ) : (
              <Text style={s.item}>
                We could not confirm any of these basics in the available information.
              </Text>
            )}
          </View>
          <View style={s.column}>
            <Text style={[s.listTitle, { color: "#FFE14A" }]}>WORTH A CLOSER LOOK</Text>
            <Text style={s.note}>
              Not found in this check; may exist elsewhere or need a manual check.
            </Text>
            {overview.missing.length ? (
              overview.actions.map((c) => (
                <Text key={c.id} style={s.item}>
                  • {checkExplanation(c).name}
                </Text>
              ))
            ) : (
              <Text style={s.item}>
                {overview.total
                  ? "No missing items among the checks completed. Try the main customer journey next."
                  : "A manual review is needed before recommending fixes."}
              </Text>
            )}
          </View>
        </View>
        {(overview.unavailable > 0 || overview.skipped > 0) && (
          <Text
            style={[s.note, { marginTop: 12 }]}
          >{`${overview.unavailable} checks could not be completed; ${overview.skipped} did not apply. These are excluded from the total above.`}</Text>
        )}
        <Chrome report={report} logoSrc={logoSrc} />
      </Page>

      {actionPages.map((actions, pageIndex) => (
        <Page size="LETTER" style={s.page} key={`actions-${pageIndex}`}>
          <Text style={s.kicker}>PRIORITY ACTION PLAN{pageIndex ? " · CONTINUED" : ""}</Text>
          <Text style={s.h1}>
            {overview.actions.length ? "What to tackle first." : "Check the experience next."}
          </Text>
          <Text style={s.p}>
            {overview.actions.length
              ? "Start with the customer essentials below. Confirm each apparent gap before making a change; some features may be on other pages or inside accounts we cannot see."
              : "There are no confirmed fixes to prescribe from these checks alone. Try the main inquiry, booking or buying path, then decide what needs attention."}
          </Text>
          {revision && (
            <Text style={s.note}>
              Your updated recommendations on the following pages take priority where they change
              this original scan-based plan.
            </Text>
          )}
          {actions.map((c, i) => {
            const copy = checkExplanation(c);
            return (
              <View key={c.id} style={s.action} wrap={false}>
                <Text style={s.badge}>
                  {c.id === "llms" ? "OPTIONAL EXTRA" : c.effort.toUpperCase()}
                </Text>
                <Text style={s.h2}>{`${pageIndex * 4 + i + 1}. ${copy.name}`}</Text>
                <View style={s.columns}>
                  <View style={s.column}>
                    <Text style={s.label}>WHY IT MATTERS</Text>
                    <Text style={s.actionText}>{copy.why}</Text>
                  </View>
                  <View style={s.column}>
                    <Text style={s.label}>WHAT WE'D DO</Text>
                    <Text style={s.actionText}>{copy.action}</Text>
                  </View>
                </View>
              </View>
            );
          })}
          {!actions.length && (
            <View style={s.block}>
              <Text style={s.h2}>A useful first check</Text>
              <Text style={s.p}>
                Ask someone unfamiliar with your website to find your main offering and try the next
                step. With your approval, test whether an inquiry reaches the right person and
                whether it is recorded correctly.
              </Text>
            </View>
          )}
          <Chrome report={report} logoSrc={logoSrc} />
        </Page>
      ))}

      <Page size="LETTER" style={s.page}>
        <Text style={s.kicker}>PRIORITIES FOR YOUR BUSINESS</Text>
        <Text style={s.h1}>{guidance[0]}</Text>
        <Text style={s.meta}>
          {plainText(report.industry.name)} · {plainText(report.industry.source)}
        </Text>
        <View style={s.block}>
          <Text style={s.p}>{guidance[1]}</Text>
          <Text style={s.p}>{guidance[2]}</Text>
        </View>
        {revision ? (
          <>
            <Text style={s.h2}>Your updated recommendations</Text>
            <Text style={s.note}>
              Based on the business details and changes you supplied, not a new website check. This
              updated plan replaces earlier advice where it differs.
            </Text>
            <Text style={s.p}>{plainText(revision.response)}</Text>
          </>
        ) : report.tailoredPriorities?.length ? (
          <>
            <Text style={s.h2}>Tailored to what you told us</Text>
            <Text style={s.note}>
              These proposals use the business details you supplied. Those details have not been
              independently checked.
            </Text>
            {report.tailoredPriorities.map((item, i) => (
              <View key={item.id} style={s.block}>
                <Text
                  style={s.h2}
                  minPresenceAhead={30}
                >{`${i + 1}. ${report.current.checks.some((c) => c.id === item.id) ? checkExplanation(report.current.checks.find((c) => c.id === item.id)!).name : "Your business priority"}`}</Text>
                <Text style={s.p}>{plainText(item.reason)}</Text>
                <Text style={s.p}>{plainText(item.action)}</Text>
              </View>
            ))}
          </>
        ) : (
          <View style={s.block}>
            <Text style={s.h2}>Start with one useful improvement</Text>
            <Text style={s.p}>
              Choose the action most important to your business, such as an inquiry, a booking or a
              purchase. Make that path easy to follow before adding more features.
            </Text>
            <Text style={s.note}>
              This guidance is a proposal based on the selected or suggested business type. Confirm
              it fits your business before starting work.
            </Text>
          </View>
        )}
        {!!report.competitors?.length && (
          <View style={s.block}>
            <Text style={s.h2} minPresenceAhead={30}>
              Other websites considered
            </Text>
            <Text style={s.note}>
              These are context for discussion, not proof of better results or confirmed
              competitors.
            </Text>
            {report.competitors.map((site, i) => (
              <Text key={`${site.url}-${i}`} style={s.note}>
                {plainText(site.title || site.url)} · {plainText(site.url)}
                {site.unavailable
                  ? " · Could not review the public page"
                  : " · Public page reviewed; business results not checked"}
              </Text>
            ))}
          </View>
        )}
        <Chrome report={report} logoSrc={logoSrc} />
      </Page>

      <Page size="LETTER" style={s.page}>
        <Text style={s.kicker}>HOW DEMORE CAN HELP</Text>
        <Text style={s.h1}>Ongoing support, in six areas.</Text>
        <Text style={s.p}>
          Beyond the priority items, here is the kind of work we can discuss taking off your plate.
        </Text>
        {chunks([...supportAreas], 2).map((row, i) => (
          <View key={i} style={[s.columns, { marginBottom: 14 }]} wrap={false}>
            {row.map(([name, detail]) => (
              <View key={name} style={s.card}>
                <Text style={s.cardTitle}>{name}</Text>
                <Text style={s.actionText}>{detail}</Text>
              </View>
            ))}
          </View>
        ))}
        <Text style={s.note}>
          These are services to consider, not a list of features already connected to your business.
          Website changes, tracking, follow-up, social posting and phone services may need account
          access, setup and your approval. We will confirm the scope and what works before relying
          on it.
        </Text>
        <Chrome report={report} logoSrc={logoSrc} />
      </Page>

      <Page size="LETTER" style={s.page}>
        <Text style={s.kicker}>NEXT STEPS</Text>
        <Text style={s.h1}>A simple order to tackle this in.</Text>
        <Text style={s.p}>
          1. Confirm the priority items. Check the apparent gaps and agree on the changes most
          useful to your customers.
        </Text>
        <Text style={s.p}>
          2. Make the next step work. Test inquiries, bookings or purchases and confirm the right
          person receives what they need.
        </Text>
        <Text style={s.p}>
          3. Review on a schedule. Set up appropriate tracking and use regular, plain-language
          reports to guide improvements.
        </Text>
        <View style={[s.block, { marginBottom: 20 }]}>
          <Text style={s.h2}>Ready to start?</Text>
          <Link
            style={s.link}
            src={`https://www.demoretechnologysolutions.com/contact?need=platform&source=website-review&rid=${encodeURIComponent(report.recordId)}`}
          >
            demoretechnologysolutions.com/contact
          </Link>
          <Link style={s.link} src="mailto:ryan@demoretechnologysolutions.com">
            ryan@demoretechnologysolutions.com
          </Link>
          <Text style={s.p}>Mentor, Lake County, Ohio · Nationwide, remote</Text>
        </View>
        <Text style={s.note}>About this review</Text>
        <Text style={s.note}>
          This review uses a limited check of the submitted public page and available website files.
          Some features may appear only after the page loads or on other pages. We did not open
          private Google Analytics or Search Console accounts, submit forms, place calls or orders,
          or test live pricing. Phone usability, accessibility, speed, search placement and business
          results have not been verified.
        </Text>
        <Text style={s.note}>
          Recommendations are proposed work, not confirmed installations or included services.
          Search rankings, AI mentions, traffic and revenue are not guaranteed.
        </Text>
        <Text
          style={s.note}
        >{`Reviewed website: ${plainText(report.current.url)} · Reference ${report.recordId}`}</Text>
        <Chrome report={report} logoSrc={logoSrc} />
      </Page>
    </Document>
  );
}
