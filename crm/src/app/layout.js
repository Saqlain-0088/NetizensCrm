import './globals.css';
import LayoutClientWrapper from '@/components/LayoutClientWrapper';

export const metadata = {
  title: 'Lumina CRM',
  description: 'Enterprise-grade Lead Management',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="h-full bg-background text-foreground overflow-hidden">
        <LayoutClientWrapper>
          {children}
        </LayoutClientWrapper>
      </body>
    </html>
  );
}
