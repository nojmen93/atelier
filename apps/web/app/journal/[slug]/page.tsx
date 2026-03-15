import Link from 'next/link'
import { notFound } from 'next/navigation'
import Nav from '../../components/Nav'

interface Post {
  _id: string
  title: string
  slug: { current: string }
  excerpt: string
  category: string
  publishedAt: string
  readTime: number
  bodyHtml: string
}

const posts: Record<string, Post> = {
  'why-your-merch-strategy-is-failing': {
    _id: '1',
    title: 'Why Your Merch Strategy Is Failing (And How to Fix It)',
    slug: { current: 'why-your-merch-strategy-is-failing' },
    excerpt: "Most brands treat merchandise as an afterthought. Here's why that's costing you more than revenue.",
    category: 'strategy',
    publishedAt: '2025-02-15T10:00:00Z',
    readTime: 6,
    bodyHtml: `
      <p>Walk into any company's supply closet and you'll find the graveyard of good intentions: boxes of unworn polo shirts, stacks of branded notebooks nobody wanted, and that one tragic shipment of trucker hats from 2019.</p>

      <p>This isn't a storage problem. It's a strategy problem.</p>

      <h2>The Afterthought Trap</h2>

      <p>Most brands approach merchandise backwards. They start with the question: "What can we put our logo on?" when they should be asking: "What would our people actually want to wear?"</p>

      <p>The difference sounds subtle. It's not. The first approach treats apparel as a branding expense — a cost center to be minimized. The second treats it as a brand-building opportunity — an investment that compounds.</p>

      <h2>The Real Cost of Cheap Merch</h2>

      <p>When you hand someone a scratchy, ill-fitting t-shirt with your logo stretched across the chest, you're not saving money. You're spending brand equity. Every time that shirt stays in a drawer, every time someone wears it to paint their apartment, every time it becomes a rag — that's a message about your brand.</p>

      <p>Premium merchandise costs more upfront. But it gets worn. Photographed. Talked about. That's the math that matters.</p>

      <h2>The Fix: Think Like a Fashion Brand</h2>

      <p>The solution isn't complicated, but it requires a mindset shift:</p>

      <p><strong>Design first, logo second.</strong> Create something people would buy even without your branding. Then add your mark with restraint.</p>

      <p><strong>Quality over quantity.</strong> Fifty people wearing premium pieces beats five hundred people ignoring their free shirts.</p>

      <p><strong>Limited runs create demand.</strong> Scarcity isn't just a streetwear trick. It signals value.</p>

      <p><strong>Fit matters more than you think.</strong> A well-fitted basic beats an ill-fitted premium every time.</p>

      <h2>The Bottom Line</h2>

      <p>Your merchandise is your brand made physical. It's a promise you're asking people to carry with them, to put against their skin, to associate with their identity.</p>

      <p>That's not an afterthought. That's an opportunity.</p>
    `,
  },
  'psychology-of-premium-branded-apparel': {
    _id: '2',
    title: 'The Psychology of Premium: Why People Pay More for Branded Apparel',
    slug: { current: 'psychology-of-premium-branded-apparel' },
    excerpt: 'Understanding the signals that transform a $15 shirt into a $75 statement piece.',
    category: 'insights',
    publishedAt: '2025-02-08T10:00:00Z',
    readTime: 8,
    bodyHtml: `
      <p>A plain white t-shirt costs about $3 to manufacture. Gildan sells them for $5. Supreme sells them for $50. What's happening in that gap isn't just markup — it's meaning.</p>

      <h2>The Signal Theory of Clothing</h2>

      <p>Every piece of clothing sends signals. Some signal wealth. Others signal belonging. The most powerful pieces signal identity — they say something about who the wearer is or aspires to be.</p>

      <p>Premium branded apparel works because it lets people signal affiliation with ideas, communities, and values. The price is part of the signal: it demonstrates commitment.</p>

      <h2>The Quality Threshold</h2>

      <p>There's a threshold below which quality destroys the signal. A cheap logo tee says "I got this for free." A premium piece says "I chose this."</p>

      <p>That choice — the visible, intentional selection of your brand — is worth far more than the manufacturing cost delta.</p>

      <h2>Crafting the Premium Signal</h2>

      <p>Premium isn't just about materials, though materials matter. It's a combination of factors that create perceived value:</p>

      <p><strong>Weight and hand-feel.</strong> Premium fabrics feel substantial. They drape differently. People notice, even subconsciously.</p>

      <p><strong>Fit and construction.</strong> Seams that lay flat. Collars that don't curl. Sleeves that hit at the right point. These details accumulate.</p>

      <p><strong>Restraint in branding.</strong> Counterintuitively, smaller and more subtle branding often signals higher value. Loud logos read as trying too hard.</p>

      <p><strong>Scarcity cues.</strong> Limited editions, numbered runs, seasonal drops — these create urgency and exclusivity.</p>

      <h2>The Practical Implication</h2>

      <p>If you're creating branded apparel, you're not in the clothing business. You're in the signal business. Your job is to create pieces that people are proud to be seen in — pieces that say something they want to say.</p>

      <p>That's worth paying for. Both for you and for them.</p>
    `,
  },
  'embroidery-vs-screen-print': {
    _id: '3',
    title: 'Embroidery vs. Screen Print: Choosing the Right Technique',
    slug: { current: 'embroidery-vs-screen-print' },
    excerpt: 'A technical breakdown of when to use each method — and why it matters for your brand perception.',
    category: 'production',
    publishedAt: '2025-01-28T10:00:00Z',
    readTime: 5,
    bodyHtml: `
      <p>The decoration method you choose shapes how your brand is perceived before anyone reads your logo. Here's how to choose wisely.</p>

      <h2>Embroidery: The Premium Signal</h2>

      <p>Embroidery adds texture, dimension, and an unmistakable sense of quality. Thread work catches light differently than print. It has weight. It lasts decades.</p>

      <p><strong>Best for:</strong> Polo shirts, caps, jackets, workwear, corporate apparel, anything where longevity and premium perception matter.</p>

      <p><strong>Limitations:</strong> Complex artwork doesn't translate well. Gradients are impossible. Very small text loses legibility. Cost increases with stitch count.</p>

      <h2>Screen Printing: The Versatile Standard</h2>

      <p>Screen printing offers vibrant colors, photographic detail, and soft hand-feel. Modern techniques have solved most of the durability concerns that plagued earlier methods.</p>

      <p><strong>Best for:</strong> T-shirts, promotional wear, detailed artwork, multi-color designs, large print areas, cost-effective volume runs.</p>

      <p><strong>Limitations:</strong> Can feel plasticky if poorly executed. Fades faster than embroidery. Less premium perception on certain garments.</p>

      <h2>The Decision Framework</h2>

      <p>Ask yourself three questions:</p>

      <p><strong>What's the garment?</strong> Structured items (polos, caps, jackets) almost always want embroidery. Soft goods (tees, hoodies) can go either way.</p>

      <p><strong>What's the context?</strong> Corporate environments skew embroidery. Casual and youth contexts accept both.</p>

      <p><strong>What's the artwork?</strong> Simple logos with clean lines work in both. Complex illustrations or photographs need print.</p>

      <h2>The Hybrid Approach</h2>

      <p>The best collections often use both. Embroidered polos for client meetings. Screen-printed tees for the team. Embroidered caps for the brand obsessives. This creates a coherent but varied range that serves different needs.</p>

      <p>The key is consistency in quality, not uniformity in technique.</p>
    `,
  },
  'building-capsule-collection': {
    _id: '4',
    title: 'Building a Capsule Collection: From Concept to Drop',
    slug: { current: 'building-capsule-collection' },
    excerpt: 'The step-by-step process we use to create cohesive, sell-out worthy merchandise lines.',
    category: 'design',
    publishedAt: '2025-01-20T10:00:00Z',
    readTime: 7,
    bodyHtml: `
      <p>A capsule collection isn't just a group of items with matching logos. It's a story told in fabric — a cohesive vision that makes each piece stronger because of the others.</p>

      <h2>Phase 1: The Concept</h2>

      <p>Every great collection starts with an idea bigger than "we need merch." What are you trying to say? What feeling should someone get wearing these pieces? What story connects them?</p>

      <p>We spend more time here than anywhere else. A strong concept makes every subsequent decision easier.</p>

      <h2>Phase 2: The Palette</h2>

      <p>Colors, materials, and textures need to feel like family. This doesn't mean everything matches — it means everything belongs together.</p>

      <p>A typical capsule might include: a core neutral, a signature color, an accent for energy. These thread through every piece in different proportions.</p>

      <h2>Phase 3: The Range</h2>

      <p>Build for different contexts and commitment levels:</p>

      <p><strong>Entry pieces:</strong> Accessible items that let people buy in without major commitment. Tees, caps, accessories.</p>

      <p><strong>Core pieces:</strong> The workhorses. Hoodies, crews, polos. Things people will wear weekly.</p>

      <p><strong>Statement pieces:</strong> The hero items. Jackets, limited editions, premium constructions. These anchor the collection's value perception.</p>

      <h2>Phase 4: The Details</h2>

      <p>This is where collections become special. Custom labels. Branded hardware. Unexpected interior prints. Hidden messages. These discoveries reward attention and create talking points.</p>

      <h2>Phase 5: The Drop</h2>

      <p>How you release matters as much as what you release. Consider:</p>

      <p><strong>Timing:</strong> Seasonal relevance? Cultural moments? Company milestones?</p>

      <p><strong>Scarcity:</strong> Limited quantities create urgency. But don't artificially constrain if demand is genuine.</p>

      <p><strong>Story:</strong> Let people see the process. Behind-the-scenes content builds anticipation and investment.</p>

      <h2>The Result</h2>

      <p>Done right, a capsule collection becomes more than merchandise. It becomes a moment — something people remember, talk about, and wish they'd gotten more of.</p>

      <p>That's the goal. Not just apparel. A moment.</p>
    `,
  },
}

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

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params
  const post = posts[slug]

  if (!post) {
    notFound()
  }

  return (
    <div className="apage">
      <Nav />
      <article className="apage-article">

        <header className="apage-header">
          <Link href="/journal" className="apage-back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Journal
          </Link>
          <div className="apage-meta">
            <span className="apage-cat">{getCategoryLabel(post.category)}</span>
            <span className="apage-date">{formatDate(post.publishedAt)}</span>
            <span className="apage-time">{post.readTime} min read</span>
          </div>
          <h1 className="apage-title">{post.title}</h1>
          <p className="apage-excerpt">{post.excerpt}</p>
        </header>

        <div className="apage-body">
          <div
            className="apage-content"
            dangerouslySetInnerHTML={{ __html: post.bodyHtml }}
          />
        </div>

        <footer className="apage-footer">
          <p>Ready to build something worth wearing?</p>
          <Link href="/" className="apage-cta">
            Start a Project
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </footer>

      </article>
    </div>
  )
}

export function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({ slug }))
}
