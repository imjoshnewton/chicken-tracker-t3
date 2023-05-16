import Loader from "../../components/shared/Loader";

export default function Loading() {
  return (
    <div className="flex h-full items-center justify-center overflow-y-auto">
      <Loader show={true} />
      {/* <div className="h-32 w-32 animate-spin rounded-full border-t-2 border-b-2 border-gray-900"></div> */}
    </div>
  );
}
