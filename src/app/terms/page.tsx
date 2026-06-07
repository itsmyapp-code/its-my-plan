import Link from "next/link";
import { PolicyFooter } from "@/components/PolicyFooter";

export default function TermsPage() {
  return (
    <main className="w-full h-full overflow-y-auto bg-slate-950 pt-20 pb-24 px-6 md:px-8">
      <div className="max-w-4xl mx-auto w-full bg-slate-900 border border-slate-800 p-8 md:p-12 rounded-2xl relative overflow-hidden">
        <div className="mb-6">
          <Link href="/" className="text-xs text-blue-400 hover:underline">
            ← Back to Planner
          </Link>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Terms of Service</h1>
        <p className="text-slate-400 text-sm mb-8">Last Updated: June 2026</p>
        
        <div className="prose prose-invert max-w-none text-slate-300 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">1. Terms of Use</h2>
            <p>By using itsmyplan, you agree to these terms. If you do not agree, you must cease using the app immediately.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">2. Intellectual Property</h2>
            <p>All design tooling, layouts, and components generated belong to the respective user or creator. The underlying source code, design system, and assets are owned by ItsMyApp.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">3. Zero Server Architecture</h2>
            <p>Our app operates purely in the client browser. No layout plan data, wall dimensions, or fixture positions are uploaded to or stored on external servers by default. Data loss due to browser storage clearings is the responsibility of the user.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">4. Disclaimer of Warranties</h2>
            <p>This layout planner is provided for illustrative and design planning purposes only. Architectural and structural layouts generated should be verified by a qualified structural engineer or surveyor prior to build.</p>
          </section>
          
          <p className="mt-12 text-sm text-slate-500 font-mono">Contact: <a href="mailto:hello@itsmyapp.co.uk" className="text-blue-400 hover:underline">hello@itsmyapp.co.uk</a></p>
        </div>
      </div>
      <PolicyFooter />
    </main>
  );
}
