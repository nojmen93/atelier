import Image from 'next/image'
import Link from 'next/link'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

interface Post {
  _id: string
  title: string
  slug: { current: string }
  excerpt: string
  coverImage: string
  category: string
  publishedAt: string
  readTime: number
  featured?: boolean
}

const posts: Post[] = [
  {
    _id: '1',
    title: 'Why Your Merch Strategy Is Failing (And How to Fix It)',
    slug: { current: 'why-your-merch-strategy-is-failing' },
    excerpt: "Most brands treat merchandise as an afterthought. Here's why that's costing you more than revenue.",
    coverImage: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1200&q=80',
    category: 'strategy',
    publishedAt: '2025-02-15T10:00:00Z',
    readTime: 6,
    featured: true,
  },
  {
    _id: '2',
    title: 'The Psychology of Premium: Why People Pay More for Branded Apparel',
    slug: { current: 'psychology-of-premium-branded-apparel' },
    excerpt: 'Understanding the signals that transform a $15 shirt into a $75 statement piece.',
    coverImage: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1200&q=80',
    category: 'insights',
    publishedAt: '2025-02-08T10:00:00Z',
    readTime: 8,
    featured: false,
  },
  {
    _id: '3',
    title: 'Embroidery vs. Screen Print: Choosing the Right Technique',
    slug: { current: 'embroidery-vs-screen-print' },
    excerpt: 'A technical breakdown of when to use each method — and why it matters for your brand perception.',
    coverImage: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1200&q=80',
    category: 'production',
    publishedAt: '2025-01-28T10:00:00Z',
    readTime: 5,
    featured: false,
  },
  {
    _id: '4',
    title: 'Building a Capsule Collection: From Concept to Drop',
    slug: { current: 'building-capsule-collection' },
    excerpt: 'The step-by-step process we use to create cohesive, sell-out worthy merchandise lines.',
    coverImage: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=1200&q=80',
    category: 'design',
    publishedAt: '2025-01-20T10:00:00Z',
    readTime: 7,
    featured: false,
  },
]

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    insights: 'Industry Insights',
    design: 'Design',
    production: 'Production',
    strategy: 'Brand Strategy',
    'case-study': 'Case Study',
  }
  return labels[category] || category
}

export default function JournalPage() {
  const featuredPost = posts.find((p) => p.featured) || posts[0]
  const otherPosts = posts.filter((p) => p._id !== featuredPost._id)

  return (
    <>
      <Nav />
      <main>
        {/* Hero */}
        <section className="journal-hero">
          <div className="container">
            <p className="label">The Journal</p>
            <h1 className="headline-lg">Thoughts on Apparel,<br />Brand & Culture</h1>
          </div>
        </section>

        {/* Featured Post */}
        <section className="journal-featured">
          <div className="container">
            <Link href={`/journal/${featuredPost.slug.current}`} className="featured-card">
              <div className="featured-image">
                <Image
                  src={featuredPost.coverImage}
                  alt={featuredPost.title}
                  fill
                  className="featured-img"
                />
              </div>
              <div className="featured-content">
                <div className="featured-meta">
                  <span className="featured-category">{getCategoryLabel(featuredPost.category)}</span>
                  <span className="featured-date">{formatDate(featuredPost.publishedAt)}</span>
                </div>
                <h2 className="featured-title">{featuredPost.title}</h2>
                <p className="featured-excerpt">{featuredPost.excerpt}</p>
                <div className="featured-read">
                  <span>Read Article</span>
                  <span className="featured-time">{featuredPost.readTime} min read</span>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Post Grid */}
        <section className="journal-grid-section">
          <div className="container">
            <div className="journal-grid">
              {otherPosts.map((post) => (
                <Link
                  key={post._id}
                  href={`/journal/${post.slug.current}`}
                  className="post-card"
                >
                  <div className="post-image">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="post-img"
                    />
                  </div>
                  <div className="post-content">
                    <div className="post-meta">
                      <span className="post-category">{getCategoryLabel(post.category)}</span>
                      <span className="post-time">{post.readTime} min</span>
                    </div>
                    <h3 className="post-title">{post.title}</h3>
                    <p className="post-excerpt">{post.excerpt}</p>
                    <span className="post-date">{formatDate(post.publishedAt)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
