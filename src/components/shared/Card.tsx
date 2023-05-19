export default function Card({
  title,
  children,
  className,
}: {
  title: string;
  children: any;
  className?: string;
}) {
  return (
    <div
      className={`${
        className ? className : ""
      } relative rounded-lg bg-[#FEF9F6] p-8 pt-6 dark:bg-gray-900`}
    >
      <h5 className="mt-0 mb-4 text-stone-400">{title}</h5>
      <div className="">{children}</div>
    </div>
  );
}
