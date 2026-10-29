import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Qutoof Solutions | Boutique POS Demo',
  description: 'نسخة تجريبية محلية لنقطة بيع محلات الملابس والأحذية من Qutoof Solutions.',
  applicationName: 'Qutoof Boutique POS Demo',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" data-theme="dark" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
