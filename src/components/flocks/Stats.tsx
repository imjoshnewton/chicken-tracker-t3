"use client";

import ProductionChart from "./ProductionChart";
import ExpenseChart from "./ExpenseChart";
import { MdClose, MdFilterAlt } from "react-icons/md";
import { AnimatePresence, motion } from "framer-motion";
import { Breed, Flock } from "@lib/db/schema";

export default function Stats({
  stats,
  flock,
  className,
  range,
  onRangeChange,
  filter,
  filterId,
  clearFilter,
}: {
  stats: any | null | undefined;
  flock: Flock & { breeds: Breed[] };
  className: string;
  range: { from: Date; to: Date };
  onRangeChange: any;
  filter?: string;
  filterId?: string;
  clearFilter?: () => void;
}) {
  return (
    <div className={className}>
      <div className="mb-4 flex justify-between">
        <h2 className="dark:text-gray-300">Stats</h2>
        <AnimatePresence initial={false} mode="popLayout">
          {filter && (
            <div className="flex items-center gap-2">
              <motion.div
                layout
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0, transition: { duration: 0.15 } }}
                exit={{
                  opacity: 0,
                  x: -100,
                  transition: {
                    opacity: { duration: 0.25 },
                    x: { duration: 0.3 },
                  },
                }}
                transition={{ layout: { duration: 0.15 } }}
              >
                <MdFilterAlt className="text-lg" />
              </motion.div>
              <motion.button
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  transition: {
                    duration: 0.15,
                    type: "spring",
                    damping: 25,
                    stiffness: 500,
                  },
                }}
                exit={{ opacity: 0, scale: 0.1 }}
                className="flex items-center gap-1 rounded-full bg-gray-200 py-1.5 pl-2 pr-3 text-xs"
                onClick={() => (clearFilter ? clearFilter() : null)}
                key={filter}
              >
                <MdClose />
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {filter}
                </motion.span>
              </motion.button>
            </div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex flex-wrap lg:justify-between">
        <ProductionChart
          stats={stats}
          flock={flock}
          className={"flex-48"}
          range={range}
          onRangeChange={onRangeChange}
          breedFilter={filterId}
        />
        <div className="p-2"></div>
        <ExpenseChart stats={stats} className={"flex-48"} />
      </div>
    </div>
  );
}
