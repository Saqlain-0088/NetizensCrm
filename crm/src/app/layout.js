import './globals.css';
import { Plus_Jakarta_Sans } from 'next/font/google';
import LayoutClientWrapper from '@/components/LayoutClientWrapper';

const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-playful' });

export const metadata = {
  title: 'NetizensCRM',
  description: 'Enterprise-grade Lead Management',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${plusJakarta.className} min-h-full bg-background text-foreground overflow-y-auto antialiased`}>
        <LayoutClientWrapper>
          {children}
        </LayoutClientWrapper>
      </body>
    </html>
  );
}
