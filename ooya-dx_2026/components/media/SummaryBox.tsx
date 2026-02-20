interface SummaryBoxProps {
  children: React.ReactNode;
}

export function SummaryBox({ children }: SummaryBoxProps) {
  return (
    <div className="bg-primary-50 border border-primary-200 rounded-lg px-6 py-5 my-6">
      <p className="!text-lg !font-bold text-primary-900 !mb-3 flex items-center gap-2">
        <span>💡</span>
        この記事の結論
      </p>
      <div className="text-sm text-gray-800 leading-relaxed [&_p]:my-2 [&_strong]:bg-[linear-gradient(transparent_60%,#fef08a_60%)] [&_a_strong]:bg-none">
        {children}
      </div>
    </div>
  );
}
