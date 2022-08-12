export default function Card({
  title,
  children,
}: {
  title: string;
  children: any;
}) {
  return (
    <div className='mat-elevation-z4 p-8 my-4 mx-0 bg-white rounded-lg'>
      <h5 className='text-stone-400 -translate-y-3 mt-0 mb-2'>{title}</h5>
      <div className=''>{children}</div>
    </div>
  );
}
