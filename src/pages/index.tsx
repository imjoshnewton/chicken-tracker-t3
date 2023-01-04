import Image from "next/image";
import Link from "next/link";
import SiteLayout from "../layouts/SiteLayout";
import { type NextPageWithLayout } from "./_app";
import demo from "../../public/FlockNerd-Demo-new.gif";
import header from "../../public/site-header.jpg";

const Home: NextPageWithLayout = () => {
  return (
    <>
      <main className="justify-cente flex min-h-screen flex-col items-center p-0">
        <div className="relative flex h-auto w-full flex-col items-center justify-center py-36 lg:h-[75vh]">
          <div className="flex max-w-5xl flex-col items-center justify-center gap-10 text-white">
            <Image
              src={header}
              alt="FlockNerd Track your flock - get insights"
              className="absolute top-0 bottom-0 right-0 left-0 object-cover"
              fill={true}
            />
            <div className="absolute top-0 bottom-0 right-0 left-0 bg-gray-900/50"></div>
            <h1 className="z-0 text-3xl lg:text-6xl">Welcome to FlockNerd!</h1>
            <p className="z-0 max-w-3xl px-3 text-center lg:px-0">
              Are you a backyard chicken, duck, or quail farmer looking to track
              egg production and expenses for your flock? Look no further.
              FlockNerd is the perfect app for you.
            </p>
          </div>
        </div>
        <div className="flex w-full flex-col items-center justify-center gap-12 bg-gray-300 py-14">
          <div className="flex max-w-5xl flex-wrap items-center justify-center gap-14 px-8 lg:flex-nowrap">
            <Image src={demo} alt="Demo of Flock Nerd App" />
            <div className="flex flex-col text-black">
              <h2 className="mb-4 text-3xl">Track Your Flock!</h2>
              <p className="pb-4">
                With FlockNerd, you can easily track the number of eggs laid by
                your birds, as well as record expenses such as feed costs,
                supplements and medications. Plus, you&apos;ll get access to
                helpful statistics about your flock, including average egg
                production per week, and total expenses.
              </p>
              <p className="pb-4">
                But FlockNerd isn&apos;t just for egg farmers. It&apos;s also a
                great tool for farmers who raise poultry for meat or who simply
                keep birds as pets.
              </p>
              <p className="hidden">
                So why wait? Sign up for FlockNerd today and take the first step
                towards better managing your poultry farm or backyard flock.
              </p>
              <Link
                href="/api/auth/signin"
                className="mt-4 rounded bg-primary py-2 px-8 text-center text-white transition-all hover:bg-primary/90 hover:shadow-xl lg:self-start"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Create <span className="text-[hsl(280,100%,70%)]">T3</span> App
          </h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
              href="https://create.t3.gg/en/usage/first-steps"
              target="_blank"
            >
              <h3 className="text-2xl font-bold">First Steps →</h3>
              <div className="text-lg">
                Just the basics - Everything you need to know to set up your
                database and authentication.
              </div>
            </Link>
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
              href="https://create.t3.gg/en/introduction"
              target="_blank"
            >
              <h3 className="text-2xl font-bold">Documentation →</h3>
              <div className="text-lg">
                Learn more about Create T3 App, the libraries it uses, and how
                to deploy it.
              </div>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
};

Home.getLayout = function getLayout(page: React.ReactElement) {
  return <SiteLayout>{page}</SiteLayout>;
};

export default Home;
