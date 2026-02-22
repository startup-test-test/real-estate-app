interface QuestionBoxProps {
  children: React.ReactNode;
}

export function QuestionBox({ children }: QuestionBoxProps) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg px-6 py-5 my-6">
      <p className="!text-lg !font-bold text-gray-800 !mb-3 flex items-center gap-2">
        <span>🤔</span>
        こんな疑問はありませんか？
      </p>
      <div className="space-y-2 text-sm text-gray-700 [&_ul]:list-none [&_ul]:pl-0 [&_ul]:space-y-2 [&_li]:flex [&_li]:items-start [&_li]:gap-2 [&_li]:before:content-['☐'] [&_li]:before:text-primary-600 [&_li]:before:font-bold [&_li]:before:shrink-0">
        {children}
      </div>
    </div>
  );
}
