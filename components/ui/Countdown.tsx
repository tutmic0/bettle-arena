'use client'

import { useState, useEffect } from 'react'

export default function Countdown({ targetDate, label }: { targetDate: string; label: string }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    function calculate() {
      const now = new Date()
      const end = new Date(targetDate)
      const diff = end.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft('00:00:00')
        return
      }

      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)

      setTimeLeft(
        String(h).padStart(2, '0') + ':' +
        String(m).padStart(2, '0') + ':' +
        String(s).padStart(2, '0')
      )
    }

    calculate()
    const interval = setInterval(calculate, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="text-white font-black text-xl font-mono">{timeLeft}</span>
    </div>
  )
}