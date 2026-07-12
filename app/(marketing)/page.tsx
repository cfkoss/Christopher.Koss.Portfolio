import Link from "next/link";

const FEATURES = [
  {
    title: "Rent, don't build",
    description:
      "Pick a professionally designed template and make it yours. No code, no site builder fiddling — your work stays the hero.",
  },
  {
    title: "Made for showing work",
    description:
      "Sections, projects, galleries and case-study pages designed around how clients and studios actually review portfolios.",
  },
  {
    title: "Your own address",
    description:
      "Publish instantly to your own subdomain. Connect a custom domain when you're ready to make it official.",
  },
  {
    title: "Fast and findable",
    description:
      "Every page is server-rendered with clean URLs and metadata, so your projects show up in search and unfurl beautifully in messages.",
  },
];

const STEPS = [
  { step: "01", title: "Choose a template", text: "Browse the catalog and preview each design with real portfolio content." },
  { step: "02", title: "Add your work", text: "Create sections, write case studies and drag in images — they're resized for you." },
  { step: "03", title: "Publish", text: "One click and your portfolio is live on your address, ready to send to clients." },
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-28 md:py-40 fade-in">
        <h1 className="hero-title text-6xl md:text-8xl mb-8 max-w-4xl">
          Your work deserves a better portfolio
        </h1>
        <p className="body-text text-xl text-white/60 max-w-xl mb-10 slide-up" style={{ animationDelay: "0.2s" }}>
          Rent a designer-grade portfolio website, add your projects, and share
          it with the clients and studios you want to win. Live in minutes, not
          weekends.
        </p>
        <div className="flex flex-wrap gap-4 slide-up" style={{ animationDelay: "0.3s" }}>
          <Link
            href="/signup"
            className="px-7 py-3.5 bg-white text-black rounded-full body-text font-medium hover:bg-white/90 transition-colors"
          >
            Start your portfolio
          </Link>
          <Link
            href="/templates"
            className="px-7 py-3.5 bg-white/10 border border-white/20 rounded-full body-text hover:bg-white/20 transition-colors"
          >
            Browse templates
          </Link>
        </div>
      </section>

      {/* Template teaser */}
      <section className="max-w-6xl mx-auto px-6 pb-28">
        <div className="rounded-2xl border border-white/15 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
            <span className="h-3 w-3 rounded-full bg-white/15" />
            <span className="h-3 w-3 rounded-full bg-white/15" />
            <span className="h-3 w-3 rounded-full bg-white/15" />
            <span className="body-text text-xs text-white/40 ml-3">
              mara-voss.foliomarket.com — live template preview
            </span>
          </div>
          <iframe
            src="/preview/template-01"
            title="Template preview"
            className="w-full h-[70vh] bg-black"
          />
        </div>
        <div className="flex justify-center mt-8">
          <Link
            href="/templates/template-01"
            className="body-text text-sm text-white/60 underline underline-offset-4 hover:text-white"
          >
            Explore this template →
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-28">
          <h2 className="hero-title text-4xl md:text-5xl mb-16">
            Everything a working designer needs. Nothing else.
          </h2>
          <div className="grid gap-10 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <div key={feature.title}>
                <h3 className="hero-title text-2xl mb-3">{feature.title}</h3>
                <p className="body-text text-white/60 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-28">
          <h2 className="hero-title text-4xl md:text-5xl mb-16">
            Live in three steps
          </h2>
          <div className="grid gap-10 md:grid-cols-3">
            {STEPS.map((item) => (
              <div key={item.step} className="rounded-xl border border-white/15 p-8">
                <span className="hero-title text-5xl text-white/20 block mb-4">
                  {item.step}
                </span>
                <h3 className="hero-title text-2xl mb-3">{item.title}</h3>
                <p className="body-text text-white/60">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-28 text-center">
          <h2 className="hero-title text-5xl md:text-6xl mb-6">
            Ready when you are
          </h2>
          <p className="body-text text-white/60 mb-10 max-w-lg mx-auto">
            Free while we&apos;re in beta. Templates from $9/month after launch —
            cancel anytime, your work stays yours.
          </p>
          <Link
            href="/signup"
            className="px-8 py-4 bg-white text-black rounded-full body-text font-medium hover:bg-white/90 transition-colors"
          >
            Create your portfolio
          </Link>
        </div>
      </section>
    </div>
  );
}
