import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production',
})

const builder = imageUrlBuilder(client)

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}

// ============================================
// Types
// ============================================

export interface Project {
  _id: string
  title: string
  slug: { current: string }
  category: string
  image: SanityImageSource
  order: number
}

export interface Post {
  _id: string
  title: string
  slug: { current: string }
  excerpt: string
  coverImage: SanityImageSource
  category: string
  publishedAt: string
  readTime: number
  body?: unknown[]
  featured?: boolean
}

export interface QuoteProduct {
  _key: string
  name: string
  description?: string
  mockupImages: SanityImageSource[]
  decorationType?: string
  colors?: string[]
  sizes?: string
  quantity: number
  unitPrice: number
}

export interface Quote {
  _id: string
  clientName: string
  clientEmail: string
  clientLogo?: SanityImageSource
  secretId: string
  status: 'draft' | 'sent' | 'viewed' | 'approved' | 'revision' | 'declined' | 'expired'
  introMessage?: string
  products: QuoteProduct[]
  deliveryTimeline?: string
  validUntil?: string
  terms?: string
  notes?: string
  clientResponse?: {
    respondedAt: string
    action: string
    message?: string
  }
  viewedAt?: string
  createdAt: string
}

// ============================================
// Queries
// ============================================

export const PROJECTS_QUERY = `*[_type == "project"] | order(order asc) {
  _id,
  title,
  slug,
  category,
  image,
  order
}`

export const PROJECT_BY_SLUG_QUERY = `*[_type == "project" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  category,
  image,
  order
}`

export const POSTS_QUERY = `*[_type == "post"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  excerpt,
  coverImage,
  category,
  publishedAt,
  readTime,
  featured
}`

export const POST_BY_SLUG_QUERY = `*[_type == "post" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  excerpt,
  coverImage,
  category,
  publishedAt,
  readTime,
  body,
  featured
}`

export const FEATURED_POSTS_QUERY = `*[_type == "post" && featured == true] | order(publishedAt desc)[0...3] {
  _id,
  title,
  slug,
  excerpt,
  coverImage,
  category,
  publishedAt,
  readTime
}`

// ============================================
// Fetchers
// ============================================

export async function getProjects(): Promise<Project[]> {
  return client.fetch(PROJECTS_QUERY)
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  return client.fetch(PROJECT_BY_SLUG_QUERY, { slug })
}

export async function getPosts(): Promise<Post[]> {
  return client.fetch(POSTS_QUERY)
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  return client.fetch(POST_BY_SLUG_QUERY, { slug })
}

export async function getFeaturedPosts(): Promise<Post[]> {
  return client.fetch(FEATURED_POSTS_QUERY)
}

// ============================================
// Quote Queries
// ============================================

export const QUOTE_BY_SECRET_ID_QUERY = `*[_type == "quote" && secretId == $secretId][0] {
  _id,
  clientName,
  clientEmail,
  clientLogo,
  secretId,
  status,
  introMessage,
  products[] {
    _key,
    name,
    description,
    mockupImages,
    decorationType,
    colors,
    sizes,
    quantity,
    unitPrice
  },
  deliveryTimeline,
  validUntil,
  terms,
  viewedAt,
  createdAt
}`

export async function getQuoteBySecretId(secretId: string): Promise<Quote | null> {
  return client.fetch(QUOTE_BY_SECRET_ID_QUERY, { secretId })
}

// Write client for mutations (updating quote status)
export const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})
