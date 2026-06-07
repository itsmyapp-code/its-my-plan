import Link from "next/link";
import { PolicyFooter } from "@/components/PolicyFooter";

export default function AccessibilityPage() {
  return (
    <main className="w-full h-full overflow-y-auto bg-slate-950 pt-20 pb-24 px-6 md:px-8">
      <div className="max-w-4xl mx-auto w-full bg-slate-900 border border-slate-800 p-8 md:p-12 rounded-2xl relative overflow-hidden">
        <div className="mb-6">
          <Link href="/" className="text-xs text-blue-400 hover:underline">
            ← Back to Planner
          </Link>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Accessibility Statement</h1>
        <p className="text-slate-400 text-sm mb-8">Last Updated: June 2026</p>
        
        <div className="prose prose-invert max-w-none text-slate-300 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">Target Standards</h2>
            <p>We maintain a firm development commitment to achieving full Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standardization across ItsMyApp.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">Core Layout Engineering</h2>
            <p>Our code architectures natively support full keyboard navigation tabs, high contrast layouts, logical semantic block structures, and explicit <code>aria-label</code> markup profiles for screen-reader tools.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">Continuous Improvement</h2>
            <p>We regularly audit our user interfaces, design system components, and 3D scenes to identify potential barriers and improve compatibility with modern assistive technologies.</p>
          </section>
          
          <p className="mt-12 text-sm text-slate-500 font-mono">Contact: <a href="mailto:hello@itsmyapp.co.uk" className="text-blue-400 hover:underline">hello@itsmyapp.co.uk</a></p>
        </div>
      </div>
      <PolicyFooter />
    </main>
  );
}
