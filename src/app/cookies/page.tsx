import Link from "next/link";
import { PolicyFooter } from "@/components/PolicyFooter";

export default function CookiesPage() {
  return (
    <main className="w-full h-full overflow-y-auto bg-slate-950 pt-20 pb-24 px-6 md:px-8">
      <div className="max-w-4xl mx-auto w-full bg-slate-900 border border-slate-800 p-8 md:p-12 rounded-2xl relative overflow-hidden">
        <div className="mb-6">
          <Link href="/" className="text-xs text-blue-400 hover:underline">
            ← Back to Planner
          </Link>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Cookie Policy</h1>
        <p className="text-slate-400 text-sm mb-8">Last Updated: June 2026</p>
        
        <div className="prose prose-invert max-w-none text-slate-300 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">1. What are Cookies?</h2>
            <p>Cookies are small text files stored by your browser when you visit websites. They are commonly used to remember settings, session states, and to analyze traffic.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">2. Strictly Necessary Cookies</h2>
            <p>We use local storage (specifically <code>localStorage</code>) to save and retrieve your floor plans locally. This data acts as a strictly necessary mechanism to persist your designs between site reloads and sessions.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">3. Optional Cookies</h2>
            <p>We may use simple, privacy-focused analytics cookies to help us track layout planner performance and usage metrics. You can control or deny these via our Cookie Consent Banner or your browser settings.</p>
          </section>
          
          <p className="mt-12 text-sm text-slate-500 font-mono">Contact: <a href="mailto:hello@itsmyapp.co.uk" className="text-blue-400 hover:underline">hello@itsmyapp.co.uk</a></p>
        </div>
      </div>
      <PolicyFooter />
    </main>
  );
}
