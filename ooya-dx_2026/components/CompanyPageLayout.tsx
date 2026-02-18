import { LandingHeader } from '@/components/landing-header';
import { LandingFooter } from '@/components/landing-footer';
import { HeaderSpacer } from '@/components/HeaderSpacer';

export function CompanyPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <LandingHeader />
      <HeaderSpacer />
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
      <LandingFooter />
    </div>
  );
}
