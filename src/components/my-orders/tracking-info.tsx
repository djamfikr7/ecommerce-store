'use client'

import { motion } from 'framer-motion'
import { Truck, ExternalLink, Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface TrackingInfoProps {
  trackingNumber: string
  carrier?: string
}

const carrierUrls: Record<string, string> = {
  ups: 'https://www.ups.com/track?tracknum=',
  usps: 'https://tools.usps.com/go/TrackConfirmAction?tLabels=',
  fedex: 'https://www.fedex.com/fedextrack/?trknbr=',
  dhl: 'https://www.dhl.com/en/express/tracking.html?AWB=',
}

export default function TrackingInfo({ trackingNumber, carrier }: TrackingInfoProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(trackingNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const getTrackingUrl = () => {
    if (!carrier) return null
    const baseUrl = carrierUrls[carrier.toLowerCase()]
    return baseUrl ? `${baseUrl}${trackingNumber}` : null
  }

  const trackingUrl = getTrackingUrl()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 shadow-[inset_0_2px_20px_rgba(0,0,0,0.3),0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-sm"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-lg bg-purple-500/20 p-2">
          <Truck className="h-5 w-5 text-purple-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Tracking Information</h2>
      </div>

      <div className="space-y-4">
        {/* Carrier */}
        {carrier && (
          <div>
            <p className="mb-1 text-sm text-gray-400">Carrier</p>
            <p className="font-semibold capitalize text-white">{carrier}</p>
          </div>
        )}

        {/* Tracking Number */}
        <div>
          <p className="mb-2 text-sm text-gray-400">Tracking Number</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-xl border border-gray-700 bg-gray-900/50 px-4 py-3 font-mono text-white">
              {trackingNumber}
            </div>
            <button
              onClick={handleCopy}
              className="rounded-xl border border-gray-700 bg-gray-900/50 p-3 text-gray-400 transition-all duration-300 hover:border-gray-600 hover:text-white"
              title="Copy tracking number"
            >
              {copied ? <Check className="h-5 w-5 text-green-400" /> : <Copy className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Track Shipment Button */}
        {trackingUrl && (
          <motion.a
            href={trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/50"
          >
            <Truck className="h-5 w-5" />
            Track Shipment
            <ExternalLink className="h-4 w-4" />
          </motion.a>
        )}

        {/* Info Message */}
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
          <p className="text-sm text-blue-300">
            Tracking information may take 24-48 hours to update after shipment.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
