import Image from 'next/image'
import Link from 'next/link'
import { getProjects, urlFor, type Project } from '@/lib/sanity'
import RevealOnScroll from './RevealOnScroll'

// Fallback data for when Sanity isn't configured
const fallbackProjects = [
  {
    _id: '1',
    title: 'NØRD Collective',
    slug: { current: 'nord-collective' },
    category: 'Full Collection',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1200&q=80',
    order: 1,
  },
  {
    _id: '2',
    title: 'Vertex Studios',
    slug: { current: 'vertex-studios' },
    category: 'Corporate Wear',
    image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&q=80',
    order: 2,
  },
  {
    _id: '3',
    title: 'Pulse Fitness',
    slug: { current: 'pulse-fitness' },
    category: 'Merch Drop',
    image: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&q=80',
    order: 3,
  },
  {
    _id: '4',
    title: 'Ember Agency',
    slug: { current: 'ember-agency' },
    category: 'Team Uniforms',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200&q=80',
    order: 4,
  },
]

function getImageUrl(project: Project | typeof fallbackProjects[0]): string {
  if (typeof project.image === 'string') {
    return project.image
  }
  return urlFor(project.image).width(1200).quality(80).url()
}

export default async function Portfolio() {
  let projects: (Project | typeof fallbackProjects[0])[]

  try {
    const sanityProjects = await getProjects()
    projects = sanityProjects.length > 0 ? sanityProjects : fallbackProjects
  } catch {
    projects = fallbackProjects
  }

  return (
    <section className="portfolio section" id="portfolio">
      <div className="container">
        <div className="portfolio-header">
          <div>
            <RevealOnScroll>
              <p className="label">Selected Work</p>
            </RevealOnScroll>
            <RevealOnScroll delay={1}>
              <h2 className="headline-lg">Recent Projects</h2>
            </RevealOnScroll>
          </div>
          <RevealOnScroll>
            <Link href="#" className="portfolio-link">
              View All Work
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </RevealOnScroll>
        </div>
        <div className="portfolio-grid">
          {projects.slice(0, 4).map((project, index) => (
            <RevealOnScroll
              key={project._id}
              delay={index}
              className="portfolio-item"
            >
              <Image
                src={getImageUrl(project)}
                alt={project.title}
                fill
                className="portfolio-image"
              />
              <div className="portfolio-info">
                <h3 className="portfolio-item-title">{project.title}</h3>
                <p className="portfolio-item-cat">{project.category}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
