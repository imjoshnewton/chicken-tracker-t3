import Image from "next/image";
import Link from "next/link";
import SiteLayout from "../layouts/SiteLayout";
import { type NextPageWithLayout } from "./_app";
import header from "../../public/site-header.jpg";
import stats from "../../public/FlockNerd-Stats-mobile.png";
import logo from "../../public/FlockNerd-logo-square.png";

const Home: NextPageWithLayout = () => {
  return (
    <>
      <main className="justify-cente flex min-h-screen flex-col items-center p-0">
        <div className="relative flex h-auto w-full flex-col items-center justify-center py-36 lg:h-[75vh]">
          <div className="flex max-w-5xl flex-col items-center justify-center gap-0 text-white">
            <Image
              src={header}
              alt="FlockNerd Track your flock - get insights"
              className="absolute top-0 bottom-0 right-0 left-0 object-cover"
              fill={true}
            />
            <div className="absolute top-0 bottom-0 right-0 left-0 bg-gray-900/50"></div>
            <Image
              src={logo}
              alt="FlockNerd Logo - chicken with rimmed glasses"
              height="75"
            />
            <h1 className="z-0 mb-6 text-3xl lg:text-6xl">
              Welcome to FlockNerd!
            </h1>
            <p className="z-0 max-w-3xl px-3 text-center lg:px-0">
              Are you a backyard chicken, duck, or quail farmer looking to track
              egg production and expenses for your flock? Look no further.
              FlockNerd is the perfect app for you.
            </p>
          </div>
        </div>
        <div className="flex w-full flex-col items-center justify-center gap-12 bg-gray-300 py-14">
          <div className="flex max-w-5xl flex-wrap items-center justify-center gap-8 px-8 lg:flex-nowrap lg:gap-14">
            <video autoPlay loop muted playsInline>
              <source src="/FlockNerd-Demo.webm" type="video/webm" />
              <source src="/FlockNerd-Demo.mp4" type="video/mp4" />
            </video>

            <div className="flex flex-col text-black">
              <h2 className="mb-4 text-3xl">Track Your Flock 🐓🦆🦃</h2>
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
                Start Tracking Now
              </Link>
            </div>
          </div>
        </div>
        <div className="flex w-full flex-col items-center justify-center gap-12 bg-gray-50 py-14">
          <div className="flex max-w-5xl flex-wrap items-center justify-center gap-8 px-8 lg:flex-nowrap lg:gap-14">
            <div className="order-1 flex flex-col text-black lg:order-none">
              <h2 className="mb-4 text-3xl">Egg-ceptional Insights</h2>
              <p className="pb-4">
                FlockNerd provides valuable insights that can help you improve
                your farm, homestead, or backyard flock&apos;s efficiency and
                profitability. With FlockNerd, you'll have access to data-driven
                insights such as:
              </p>
              <ul className="insights pb-4">
                <li>
                  <strong>Egg production trends:</strong> track your egg
                  production over time to identify patterns and make informed
                  decisions about your flock.
                </li>
                <li>
                  <strong>Average daily egg production:</strong> insert a target
                  weekly average for each breed and see how your flock is
                  performing in comparison.
                </li>
                <li>
                  <strong>Average egg production per bird:</strong> see which
                  birds are your top performers and identify any
                  underperformers.
                </li>
                <li>
                  <strong>Expenses by Category:</strong> keep track of all your
                  flock-related costs in one place and see where you may be able
                  to cut expenses.
                </li>

                <li>
                  <strong>Health and wellness data:</strong>&nbsp;
                  <em>{"coming soon!"}</em>&nbsp;record information about your
                  birds' health, including visits to the veterinarian and any
                  medications they may be taking.
                </li>
              </ul>
              <p>
                By taking advantage of the insights provided by FlockNerd,
                you'll be able to make data-driven decisions that can help your
                farm thrive. So why wait? Download FlockNerd today and start
                seeing the benefits for yourself.
              </p>
              <Link
                href="/api/auth/signin"
                className="mt-4 rounded bg-primary py-2 px-8 text-center text-white transition-all hover:bg-primary/90 hover:shadow-xl lg:self-start"
              >
                Sign me up!
              </Link>
            </div>
            <Image src={stats} alt="FlockNerd - stats for your flock"></Image>
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
