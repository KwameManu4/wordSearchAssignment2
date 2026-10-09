import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// The page is a client component, which can't export metadata, so the title lives here.
export const metadata: Metadata = {
  title: 'Settings',
};

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return children;
}
