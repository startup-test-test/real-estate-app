import { CompanyPageLayout } from '@/components/CompanyPageLayout';
import { CompanyNav } from '@/components/company-nav';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <CompanyPageLayout>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-8">
        <CompanyNav />
      </div>
      {children}
    </CompanyPageLayout>
  );
}
