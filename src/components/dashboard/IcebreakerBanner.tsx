'use client'

import { useEffect, useState } from 'react'
import { Sparkles, X, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/Button'
import { Persona } from '@/data/persone'
import { Scadenza } from '@/data/scadenze'
import { cn } from '@/lib/utils'

interface IcebreakerBannerProps {
  persona: Persona
  scadenzeUrgenti: Scadenza[]
  period: string
}

export function IcebreakerBanner({ persona, scadenzeUrgenti, period }: IcebreakerBannerProps) {
  const [message, setMessage] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [dismissed, setDismissed] = useState<boolean>(false)
  const [isRestricted, setIsRestricted] = useState<boolean>(false)
  const router = useRouter()

  useEffect(() => {
    const fetchIcebreaker = async () => {
      try {
        const response = await fetch('/api/icebreaker', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ persona, scadenzeUrgenti, period }),
        })
        
        if (response.ok) {
          const data = await response.json()
          setMessage(data.message)
        } else if (response.status === 403) {
          setIsRestricted(true)
        }
      } catch (error) {
        console.error('Failed to load icebreaker:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchIcebreaker()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persona.id, scadenzeUrgenti.map(s => s.id).join(','), period])

  if (dismissed || (!loading && !message && !isRestricted)) return null

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 text-white shadow-lg mb-8 p-6 transition-all duration-500 hover:shadow-indigo-500/25">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-white/10 blur-xl" />

      <div className="relative flex items-start gap-4 pr-8">
        <div className="flex-shrink-0 mt-1 flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-md">
          <Sparkles className="h-5 w-5 text-indigo-100" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg text-indigo-50">AI Assistant</h3>
            <span className="text-xs font-medium bg-white/20 text-indigo-100 px-2 py-0.5 rounded-full">Claude Sonnet 4.6</span>
          </div>
          {loading ? (
            <div className="animate-pulse flex flex-col gap-2 mt-2">
              <div className="h-4 bg-white/20 rounded w-3/4"></div>
              <div className="h-4 bg-white/20 rounded w-1/2"></div>
            </div>
          ) : isRestricted ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-2">
              <p className="text-indigo-100 leading-relaxed flex-1">
                Abbonati per sbloccare l&apos;AI Assistant e ricevere consigli personalizzati sulle tue scadenze.
              </p>
              <Button 
                onClick={() => router.push('/settings?tab=billing')}
                className="bg-white text-indigo-600 hover:bg-indigo-50 border-none shadow-md font-semibold whitespace-nowrap"
                size="sm"
              >
                Vedi Piani
              </Button>
            </div>
          ) : (
            <p className="text-indigo-100 leading-relaxed">
              {message}
            </p>
          )}
        </div>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setDismissed(true)}
          className="absolute right-0 top-0 text-white/70 hover:text-white hover:bg-white/20 -mr-2 -mt-2 rounded-full"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Dismiss</span>
        </Button>
      </div>
    </div>
  )
}
