export default function Card({
  title,
  children,
}: {
  title: string;
  children: any;
}) {
  return (
    <div className='p-8 my-4 mx-0 bg-white rounded-lg relative dark:bg-gray-900'>
      <h5 className='text-stone-400 -translate-y-3 mt-0 mb-2'>{title}</h5>
      <div className=''>{children}</div>
    </div>
  );
}
