export default function Card({
  title,
  children,
  className,
  titleStyle,
}: {
  title?: string;
  children: any;
  className?: string;
  titleStyle?: string;
}) {
  return (
    <div
      className={`relative rounded-lg bg-[#FEF9F6] pb-8 pl-8 pr-8 pt-6 dark:bg-gray-900 ${
        className ? className : ""
      }`}
    >
      {title && (
        <h5
          className={
            "mb-4 mt-0 text-stone-400 " + (titleStyle ? titleStyle : "")
          }
        >
          {title}
        </h5>
      )}
      <div className="">{children}</div>
    </div>
  );
}
