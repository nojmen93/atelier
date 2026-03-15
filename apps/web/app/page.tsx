import Nav from './components/Nav'
import Hero from './components/Hero'
import Products from './components/Products'
import QuoteForm from './components/QuoteForm'
import Footer from './components/Footer'

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Products />
        <QuoteForm />
      </main>
      <Footer />
    </>
  )
}
