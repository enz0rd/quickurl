import NumberFlow from "@number-flow/react"
import { motion } from "framer-motion"
import { Clock, LoaderCircle } from "lucide-react"
import React from "react"

import { Progress } from "@/components/ui/progress"

export default function RateLimitDisplay({
  max,
  value
}: {
  max: number
  value: number
}) {
  const [rateLimit, setRateLimit] = React.useState(0)

  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    setLoading(true)
    console.log("Values:", { max, value })
    // Simulate fetching rate limit from an API
    setTimeout(() => {
      setRateLimit(value !== undefined ? (max - value) * 100 / max : 0) // Replace with actual API response
      setLoading(false)
    }, 500)
  }, [value, max])

  return loading ? (
    <div
      className="bg-gradient-to-br from-zinc-800/60 to-zinc-800/30 
      flex flex-col justify-between p-4 h-[10rem]
      w-full gap-4 border border-zinc-700 transition rounded-2xl 
      font-bold">
        <LoaderCircle className="animate-spin text-zinc-500 mx-auto h-[6rem]" size={24} />
      </div>
  ) : (
    <div
      className="bg-gradient-to-br from-zinc-800/60 to-lime-800/30 
    flex flex-col justify-between p-4 h-full
    w-full gap-4 border border-zinc-700 transition rounded-2xl 
    font-bold">
      <div className="flex gap-2 items-center justify-between">
        <div className="flex gap-1 items-center">
          <Clock
            className="text-zinc-300 bg-zinc-800 p-1 aspect-square rounded-lg"
            size={36}
          />
          <span className="text-lg text-zinc-300">rate limit</span>
        </div>
        <span className="text-xs text-zinc-400 font-light">
          resets every month
        </span>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col">
        <Progress
          value={rateLimit}
          className="w-full h-5 [&>div]:bg-lime-500 rounded-md [&>div]:rounded-md bg-zinc-700 mb-1"
        />
        <div className="flex justify-between">
          <NumberFlow
            className="text-lg text-zinc-50"
            format={{ notation: "compact", maximumFractionDigits: 1 }}
            value={rateLimit}
            suffix="%"
          />
          <div className="flex flex-col gap-1 mt-1 justify-end items-end">
            <span className="text-sm text-zinc-400">100%</span>
            <span className="text-xs font-normal text-zinc-400">
              {max - value} / {max} links
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
