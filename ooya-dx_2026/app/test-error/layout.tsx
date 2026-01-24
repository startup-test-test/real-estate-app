import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'エラーページテスト | 大家DX',
  robots: {
    index: false,
    follow: false,
  },
};

export default function TestErrorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
