import { motion } from "framer-motion"
import { Link2, LoaderCircle, LockIcon } from "lucide-react"
import React from "react"

import NumberFlow from "@number-flow/react"

import { Button } from "@/components/ui/button"

export default function TotalLinksDisplay({
  value,
  plan
}: {
  value?: number
  plan?: "free" | "pro"
}) {
  const [totalLinks, setTotalLinks] = React.useState(value || 0)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    setLoading(true)
    // Simulate fetching total links from an API
    setTimeout(() => {
      setTotalLinks(value || 0)
      setLoading(false)
    }, 500)
  }, [value])
  return loading ? (
    <div
      className="bg-gradient-to-br from-zinc-800/60 to-zinc-800/30 
          flex gap-1 flex-col justify-center items-center p-4 h-[10rem]
          w-full aspect-square border border-zinc-500 transition rounded-2xl 
          font-bold">
      <LoaderCircle className="animate-spin text-zinc-500" size={32} />
    </div>
  ) : plan === "pro" ? (
    <div
      className="bg-gradient-to-br from-lime-800/60 to-lime-800/30 
    flex gap-1 flex-col justify-between p-4 h-full
    w-full aspect-square border border-lime-500 transition rounded-2xl 
    font-bold">
      <Link2
        className="text-lime-500 bg-lime-800 p-1 aspect-square rounded-lg"
        size={32}
      />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col">
        <NumberFlow className="text-7xl text-zinc-50" value={totalLinks} />
        <span className="text-xs text-zinc-300">links on total</span>
      </motion.div>
    </div>
  ) : (
    <div
      className="bg-gradient-to-br from-zinc-800/60 to-zinc-800/30 
    flex gap-1 flex-col justify-between p-4 h-full
    w-full aspect-square border border-zinc-500 transition rounded-2xl 
    font-bold">
      <LockIcon
        className="text-zinc-500 bg-zinc-800 p-1 aspect-square rounded-lg"
        size={32}
      />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col">
        <span className="text-xs text-zinc-300">Pro plan needed</span>
        <a
          className="bg-lime-800/60 hover:bg-lime-800/30 border-lime-600 
            transition rounded-lg font-bold text-xs w-fit px-2 py-1 mt-1 text-zinc-50
            border"
          href="https://www.quickurl.com.br/pricing"
          target="_blank"
          rel="noopener noreferrer">
          upgrade now
        </a>
      </motion.div>
    </div>
  )
}
