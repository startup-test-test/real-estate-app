import { CompanyPageLayout } from '@/components/CompanyPageLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <CompanyPageLayout>
      {children}
    </CompanyPageLayout>
  );
}
