interface ExperienceBoxProps {
  title: string;
  children: React.ReactNode;
}

export function ExperienceBox({ title, children }: ExperienceBoxProps) {
  return (
    <div className="bg-primary-50 border border-primary-200 rounded-lg px-6 py-5 my-6">
      <p className="!text-lg !font-bold text-primary-900 !mb-3 flex items-center gap-2">
        <span>📊</span>
        {title}
      </p>
      <div className="overflow-x-auto text-sm text-gray-800 leading-relaxed [&_h3]:!text-base [&_h3]:!font-bold [&_h3]:!text-primary-900 [&_h3]:!mt-4 [&_h3]:!mb-2 [&_table]:w-full [&_table]:border-collapse [&_thead_tr]:bg-gray-100 [&_th]:border [&_th]:border-gray-300 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-sm [&_th]:font-semibold [&_tbody_tr:nth-child(odd)]:bg-white [&_tbody_tr:nth-child(even)]:bg-gray-50 [&_td]:border [&_td]:border-gray-200 [&_td]:px-3 [&_td]:py-2 [&_td]:text-sm [&_td_strong]:text-base [&_td_strong]:text-primary-900 [&_td:has(strong)]:bg-primary-100 [&_p]:my-2 [&_strong]:bg-[linear-gradient(transparent_60%,#fef08a_60%)] [&_td_strong]:bg-none [&_a_strong]:bg-none">
        {children}
      </div>
    </div>
  );
}
