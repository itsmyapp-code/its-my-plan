'use client';

import Link from 'next/link';

export function PolicyFooter() {
  return (
    <footer className="mt-12 text-center space-y-6 text-xs text-slate-500 shrink-0 w-full max-w-4xl mx-auto px-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center text-slate-300 shadow-lg">
        <h3 className="text-xs font-bold text-white mb-1.5 uppercase tracking-wider">Data Privacy & Compliance Queries</h3>
        <p className="text-[11px] text-slate-400 leading-normal max-w-2xl mx-auto">
          For any questions regarding your data rights, or to submit an inquiry, please contact our Data Privacy Lead directly at{' '}
          <a href="mailto:hello@itsmyapp.co.uk" className="text-blue-400 hover:underline">
            hello@itsmyapp.co.uk
          </a>
          . We formally acknowledge all compliance submissions within 30 days.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-slate-400 font-medium">
        <Link href="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</Link>
        <Link href="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link>
        <Link href="/cookies" className="hover:text-blue-400 transition-colors">Cookie Policy</Link>
        <Link href="/accessibility" className="hover:text-blue-400 transition-colors">Accessibility Statement</Link>
      </div>
      <div className="text-slate-500/70">
        Powered by{' '}
        <Link href="/" className="hover:text-slate-400 transition-colors font-medium">
          plan.ItsMyApp.co.uk
        </Link>{' '}
        | © 2026 ItsMyApp.co.uk |{' '}
        <a href="mailto:hello@itsmyapp.co.uk" className="text-blue-400 hover:underline">
          hello@itsmyapp.co.uk
        </a>{' '}
        | All rights reserved
      </div>
    </footer>
  );
}
