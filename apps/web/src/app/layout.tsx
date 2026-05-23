// Copyright (C), 2026 Quartz Systems. Some rights reserved. This work is
// licensed under the terms of the MIT license which can be found in the
// root directory of this project.

import type { Metadata } from 'next';
import { Manrope, JetBrains_Mono } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Sidebar } from '@/components/layout/sidebar';
import './globals.css';

const manrope = Manrope({ subsets: ['latin'], variable: '--font-sans' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Quartz PBX',
  description: 'Open-source Asterisk management panel',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${manrope.variable} ${jetbrainsMono.variable} font-sans bg-surface-bg text-zinc-100`}>
        <Providers>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
              <div className="mx-auto max-w-6xl px-8 py-8">{children}</div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
