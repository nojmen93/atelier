import RevealOnScroll from './RevealOnScroll'

const steps = [
  {
    number: '01',
    title: 'Discovery',
    desc: 'We learn your brand, your audience, your vision. No templates. No assumptions.',
  },
  {
    number: '02',
    title: 'Design',
    desc: 'Original concepts. Multiple directions. Refined until it\'s undeniably right.',
  },
  {
    number: '03',
    title: 'Production',
    desc: 'Premium materials. Expert execution. Quality control at every stage.',
  },
  {
    number: '04',
    title: 'Delivery',
    desc: 'On time. Every time. Packaged and ready to make an impact.',
  },
]

export default function Process() {
  return (
    <section className="process section" id="process">
      <div className="container">
        <div className="process-header">
          <RevealOnScroll>
            <p className="label process-label">How It Works</p>
          </RevealOnScroll>
          <RevealOnScroll delay={1}>
            <h2 className="headline-lg">The Process</h2>
          </RevealOnScroll>
        </div>
        <div className="process-steps">
          {steps.map((step, index) => (
            <RevealOnScroll key={step.number} delay={index} className="process-step">
              <div className="process-number">{step.number}</div>
              <h3 className="process-step-title">{step.title}</h3>
              <p className="process-step-desc">{step.desc}</p>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
