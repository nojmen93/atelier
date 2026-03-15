'use client'

import { useState } from 'react'
import Nav from './components/Nav'
import HomeLanding from './components/HomeLanding'
import QuoteModal from './components/QuoteModal'

export default function Home() {
  const [quoteOpen, setQuoteOpen] = useState(false)
  const [prefill, setPrefill] = useState('')

  const openQuote = (product?: string) => {
    setPrefill(product ?? '')
    setQuoteOpen(true)
  }

  return (
    <div className="page-home">
      <Nav onOpenQuote={() => openQuote()} />
      <HomeLanding onOpenQuote={openQuote} />
      <QuoteModal open={quoteOpen} onClose={() => setQuoteOpen(false)} prefill={prefill} />
    </div>
  )
}
