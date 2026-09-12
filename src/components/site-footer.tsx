import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { FeaturedPills } from "@/components/site-dock";
import { featuredPillsWide, allMainPages } from "@/lib/nav";
import { AREA_LINE, CITY_LINE, EMAIL, PHONE, SITE_NAME } from "@/lib/site";
import { PageButtons } from "@/components/page-buttons";
import { isPlaceholder } from "@/lib/publish";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line bg-surface">
      <div className="mx-auto hidden max-w-6xl px-4 pt-8 xl:block sm:px-6">
        <FeaturedPills items={featuredPillsWide} />
      </div>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Logo size="footer" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
            {SITE_NAME} builds custom websites, online stores, auto-posting
            bots, social video, and insurance claim supplements. Based in
            Mentor, Lake County, Ohio. Serving businesses nationwide. Work is
            remote.
          </p>
          <dl className="mt-6 space-y-1 text-sm text-muted">
            {!isPlaceholder(EMAIL) ? (
              <div className="flex gap-3">
                <dt className="w-16 text-faint">Email</dt>
                <dd>
                  <a className="text-fg underline-offset-4 hover:underline" href={`mailto:${EMAIL}`}>
                    {EMAIL}
                  </a>
                </dd>
              </div>
            ) : null}
            {!isPlaceholder(PHONE) ? (
              <div className="flex gap-3">
                <dt className="w-16 text-faint">Phone</dt>
                <dd>{PHONE}</dd>
              </div>
            ) : null}
            <div className="flex gap-3">
              <dt className="w-16 text-faint">Base</dt>
              <dd>{CITY_LINE}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-16 text-faint">Area</dt>
              <dd>{AREA_LINE}</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm text-muted">
            Start with the{" "}
            <Link to="/contact" className="underline decoration-line underline-offset-4 hover:text-volt">
              project brief
            </Link>
            . Phone unpublished.
          </p>
        </div>

        <div className="grid gap-8 lg:col-span-7">
          <div>
            <p className="kicker">Pages</p>
            <div className="mt-4">
              <PageButtons items={allMainPages} size="sm" label="Pages" />
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-faint sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {new Date().getFullYear()} {SITE_NAME}. Rankings, AI citations,
            conversion lifts, and claim payment increases are not guaranteed.
            Not an insurer. Not a public adjuster unless licensed in that state.
          </p>
        </div>
      </div>
    </footer>
  );
}
