import Link from "next/link";
import { PolicyFooter } from "@/components/PolicyFooter";

export default function PrivacyPage() {
  return (
    <main className="w-full h-full overflow-y-auto bg-slate-950 pt-20 pb-24 px-6 md:px-8">
      <div className="max-w-4xl mx-auto w-full bg-slate-900 border border-slate-800 p-8 md:p-12 rounded-2xl relative overflow-hidden">
        <div className="mb-6">
          <Link href="/" className="text-xs text-blue-400 hover:underline">
            ← Back to Planner
          </Link>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Privacy Policy</h1>
        <p className="text-slate-400 text-sm mb-8">Last Updated: June 2026</p>
        
        <div className="prose prose-invert max-w-none text-slate-300 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">1. Data Storage & Privacy</h2>
            <p>All floor plans, structural walls, openings, and fixture layouts are securely saved and synced to your cloud profile. If you are signed out, this plan data is temporarily preserved in your browser's local cache.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">2. Personal Information Collected</h2>
            <p>When you create an account or sign in, we collect your email address to authenticate your identity and protect your plan data. We do not share your personal information or plan designs with third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">3. Third Party Services</h2>
            <p>If you utilize optional features like third-party integrations, those services may have their own privacy policies governing data usage.</p>
          </section>
          
          <p className="mt-12 text-sm text-slate-500 font-mono">Contact: <a href="mailto:hello@itsmyapp.co.uk" className="text-blue-400 hover:underline">hello@itsmyapp.co.uk</a></p>
        </div>
      </div>
      <PolicyFooter />
    </main>
  );
}
