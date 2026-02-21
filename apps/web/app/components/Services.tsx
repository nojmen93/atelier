import RevealOnScroll from './RevealOnScroll'

const services = [
  {
    number: '01',
    title: 'Custom Apparel Design',
    desc: 'From concept to closet. Original pieces designed specifically for your brand\'s DNA and aesthetic vision.',
  },
  {
    number: '02',
    title: 'Merch Production',
    desc: 'Drops that sell out. Limited runs that create demand. Merchandise your audience actually wants to wear.',
  },
  {
    number: '03',
    title: 'Premium Embroidery',
    desc: 'Texture. Depth. Permanence. Thread work that elevates basics into heirlooms.',
  },
  {
    number: '04',
    title: 'Screen Printing',
    desc: 'Bold graphics. Clean execution. Prints that hold up wash after wash, year after year.',
  },
  {
    number: '05',
    title: 'Design Consulting',
    desc: 'Strategic guidance on apparel programs, brand alignment, and collection architecture.',
  },
]

export default function Services() {
  return (
    <section className="services section" id="services">
      <div className="container">
        <div className="services-header">
          <RevealOnScroll>
            <p className="label services-label">What We Do</p>
          </RevealOnScroll>
          <RevealOnScroll delay={1}>
            <h2 className="headline-lg">
              Full-Service
              <br />
              Apparel Creation
            </h2>
          </RevealOnScroll>
        </div>
        <div className="services-grid">
          {services.map((service, index) => (
            <RevealOnScroll key={service.number} delay={index}>
              <div className="service-card">
                <div className="service-number">{service.number}</div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-desc">{service.desc}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
