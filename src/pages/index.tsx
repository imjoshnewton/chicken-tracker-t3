import Image from "next/image";
import Link from "next/link";
import SiteLayout from "../layouts/SiteLayout";
import { type NextPageWithLayout } from "./_app";
import header from "../../public/site-header.jpg";
import stats from "../../public/FlockNerd-Stats-mobile.png";
import logo from "../../public/FlockNerd-logo-square.png";
import { useRef, useState } from "react";
import { FaEgg } from "react-icons/fa";
import { MdArrowDownward } from "react-icons/md";
import { motion } from "framer-motion";

const Home: NextPageWithLayout = () => {
  const [showAndroid, setShowAndroid] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
            <motion.div
              initial={{ opacity: 0, translateY: 40 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ duration: 0.5 }}
              className="z-0"
            >
              <Image
                src={logo}
                alt="FlockNerd Logo - chicken with rimmed glasses"
                height="75"
                // className="z-0"
              />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, translateY: 40 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="z-0 mb-6 text-3xl lg:text-6xl"
            >
              Welcome to FlockNerd!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, translateY: 40 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="z-0 mb-4 max-w-3xl px-3 text-center lg:px-0"
            >
              Are you a backyard chicken, duck, or quail farmer looking to track
              egg production and expenses for your flock? Look no further.
              FlockNerd is the perfect app for you.
            </motion.p>
            <motion.button
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                opacity: { duration: 0.5, delay: 0.5 },
                y: { duration: 0.4, delay: 0.3 },
              }}
              className="z-0 flex flex-col items-center gap-2 capitalize transition-all"
              onClick={() => {
                ref.current?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
            >
              learn more
              <MdArrowDownward className="animate-bounce" />
            </motion.button>
          </div>
        </div>
        <div
          className="flex w-full flex-col items-center justify-center gap-12 bg-gray-300 py-14"
          id="track"
          ref={ref}
        >
          <div className="flex max-w-5xl flex-wrap items-center justify-center gap-8 px-8 lg:flex-nowrap lg:gap-14">
            <motion.video
              initial={{ opacity: 0, x: -200 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0 }}
              viewport={{ once: true, amount: 0.8 }}
              autoPlay
              loop
              muted
              playsInline
            >
              <source src="/FlockNerd-Demo.webm" type="video/webm" />
              <source src="/FlockNerd-Demo.mp4" type="video/mp4" />
            </motion.video>

            <motion.div
              // initial={{ opacity: 0, x: 200 }}
              // whileInView={{ opacity: 1, x: 0 }}
              // transition={{ duration: 0.5, delay: 0.15 }}
              // viewport={{ once: true }}
              className="flex flex-col text-black"
            >
              <h2 className="mb-4 text-3xl">Track Your Flock 🐓🦆🦃</h2>
              <p className="pb-4">
                With FlockNerd, you can easily track the number of eggs laid by
                your birds, as well as record expenses such as feed costs,
                supplements and medications. Plus, you&apos;ll get access to
                helpful statistics about your flock, including average egg
                production per week, and total expenses.
              </p>
              <p className="pb-2">
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
                className="mt-4 rounded bg-secondary py-2 px-8 text-center text-white transition-all hover:bg-secondary/90 hover:shadow-xl lg:self-start"
              >
                Start Tracking Now
              </Link>
            </motion.div>
          </div>
        </div>
        <div className="flex w-full flex-col items-center justify-center gap-12 bg-gray-50 py-14">
          <div className="flex max-w-5xl flex-wrap items-center justify-center gap-8 px-8 lg:flex-nowrap lg:gap-14">
            <motion.div
              // initial={{ opacity: 0, x: -200 }}
              // whileInView={{ opacity: 1, x: 0 }}
              // transition={{ duration: 0.5, delay: 0 }}
              // viewport={{ once: true }}
              className="order-1 flex flex-col text-black lg:order-none"
            >
              <h2 className="mb-4 text-3xl">Egg-ceptional Insights</h2>
              <p className="pb-4">
                FlockNerd provides valuable insights that can help you improve
                your farm, homestead, or backyard flock&apos;s efficiency and
                profitability. With FlockNerd, you&apos;ll have access to
                data-driven insights such as:
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
                  birds&apos; health, including visits to the veterinarian and
                  any medications they may be taking.
                </li>
              </ul>
              <p className="pb-2">
                By taking advantage of the insights provided by FlockNerd,
                you&apos;ll be able to make data-driven decisions that can help
                your farm thrive. So why wait? Download FlockNerd today and
                start seeing the benefits for yourself.
              </p>
              <Link
                href="/api/auth/signin"
                className="mt-4 rounded bg-secondary py-2 px-8 text-center text-white transition-all hover:bg-secondary/90 hover:shadow-xl lg:self-start"
              >
                Sign me up!
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 200 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true, amount: 0.8 }}
            >
              <Image src={stats} alt="FlockNerd - stats for your flock"></Image>
            </motion.div>
          </div>
        </div>
        <div className="flex w-full flex-col items-center justify-center gap-12 bg-gray-300 py-14">
          <div className="flex max-w-5xl flex-wrap items-center justify-center gap-8 px-8 lg:flex-nowrap lg:gap-14">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0 }}
              viewport={{ once: true, amount: 0.8 }}
              className="flex flex-col items-center"
            >
              <div className="flex items-center">
                <span className="mr-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                  iOS
                </span>
                <label className="relative inline-flex cursor-pointer items-center gap-0">
                  <input
                    type="checkbox"
                    checked={showAndroid}
                    onChange={() => setShowAndroid(!showAndroid)}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
                </label>
                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                  Android
                </span>
              </div>

              <div className="grid grid-cols-1 grid-rows-1">
                {/* {!showAndroid ? ( */}
                <div
                  className={`col-start-1 col-end-2 row-start-1 row-end-2 transition-all ${
                    showAndroid
                      ? "translate-x-14 opacity-0"
                      : "translate-x-0 opacity-100"
                  }`}
                >
                  {/* <strong className="text-xl">iOS</strong> */}
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="flex-1"
                    key="iOS"
                  >
                    <source
                      src="/FlockNerd-Installation.webm"
                      type="video/webm"
                    />
                    <source
                      src="/FlockNerd-Installation.mp4"
                      type="video/mp4"
                    />
                  </video>
                </div>
                {/*) : (*/}
                <div
                  className={`col-start-1 col-end-2 row-start-1 row-end-2 transition-all ${
                    showAndroid
                      ? "-translate-x-0 opacity-100"
                      : "-translate-x-14 opacity-0"
                  }`}
                >
                  {/* <strong className="text-xl">Android</strong> */}
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="flex-1"
                    key="Android"
                  >
                    <source
                      src="/FlockNerd-AndroidInstallation.webm"
                      type="video/webm"
                    />
                    <source
                      src="/FlockNerd-AndroidInstallation.mp4"
                      type="video/mp4"
                    />
                  </video>
                </div>
                {/* )} */}
              </div>
            </motion.div>

            <div className="flex max-w-2xl flex-col justify-center">
              <h2 className="mb-4 text-3xl">Installing the App</h2>
              <p className="pb-4">
                FlockNerd is a Progressive Web App {"(PWA)"}. A PWA is a type of
                web application that can be installed on a device and behaves
                like a native app. So it is &apos;installed&apos; differently
                than most of the apps on your phone. It is installed from this
                website and not through the App Store or Google Play store.
              </p>
              <h3 className="mb-4 text-xl">Why a PWA?</h3>
              <ol className="list-decimal pb-4">
                <li className="ml-5 pl-2 pb-4">
                  I&apos;m a web developer - PWAs are created using the same
                  technologies as most websites: HTML, CSS, JavaScript.
                  That&apos;s my comfortzone and how I can create the best
                  experience for you!
                </li>
                <li className="ml-5 pl-2">
                  PWAs are &apos;cross-platform&apos; - This means I can write
                  one app and it works in your web browser, on iPhones/iPads,
                  and Android devices.
                </li>
              </ol>
            </div>
          </div>
        </div>
        <div className="flex w-full flex-col items-center justify-center gap-12 bg-primary py-6 text-white/80">
          <span>&copy;&nbsp;FlockNerd 2022</span>
        </div>
      </main>
    </>
  );
};

Home.getLayout = function getLayout(page: React.ReactElement) {
  return <SiteLayout>{page}</SiteLayout>;
};

export default Home;
