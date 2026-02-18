import { LandingHeader } from '@/components/landing-header';
import { LandingFooter } from '@/components/landing-footer';
import { HeaderSpacer } from '@/components/HeaderSpacer';

export function CompanyPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <LandingHeader />
      <HeaderSpacer />
      <main className="flex-1 overflow-x-hidden">
        <div className="pt-4 pb-4 sm:pt-6 sm:pb-6 md:pt-8 md:pb-8">
          {children}
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
