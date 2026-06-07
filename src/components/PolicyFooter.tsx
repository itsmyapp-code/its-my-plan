'use client';

import Link from 'next/link';

export function PolicyFooter() {
  return (
    <footer className="mt-12 text-center space-y-4 text-xs text-slate-500 shrink-0">
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
