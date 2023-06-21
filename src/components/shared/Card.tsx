export default function Card({
  title,
  children,
  className,
  titleStyle,
}: {
  title: string;
  children: any;
  className?: string;
  titleStyle?: string;
}) {
  return (
    <div
      className={`relative rounded-lg bg-[#FEF9F6] pl-8 pr-8 pb-8 pt-6 dark:bg-gray-900 ${
        className ? className : ""
      }`}
    >
      <h5
        className={"mt-0 mb-4 text-stone-400 " + (titleStyle ? titleStyle : "")}
      >
        {title}
      </h5>
      <div className="">{children}</div>
    </div>
  );
}
