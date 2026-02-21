import {
  Nav,
  Hero,
  Philosophy,
  Services,
  Portfolio,
  Process,
  CTA,
  Footer,
} from './components'

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Philosophy />
        <Services />
        <Portfolio />
        <Process />
        <CTA />
      </main>
      <Footer />
    </>
  )
}
