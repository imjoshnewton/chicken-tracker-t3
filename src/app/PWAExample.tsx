"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const PWAExample = () => {
  const [showAndroid, setShowAndroid] = useState(false);

  return (
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
          <video autoPlay loop muted playsInline className="flex-1" key="iOS">
            <source src="/FlockNerd-Installation.webm" type="video/webm" />
            <source src="/FlockNerd-Installation.mp4" type="video/mp4" />
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
            <source src="/FlockNerd-AndroidInstallation.mp4" type="video/mp4" />
          </video>
        </div>
        {/* )} */}
      </div>
    </motion.div>
  );
};

export default PWAExample;
