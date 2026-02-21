import { defineType, defineField } from 'sanity'
import { ImageIcon } from '@sanity/icons'

export default defineType({
  name: 'project',
  title: 'Portfolio Project',
  type: 'document',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Project Title',
      type: 'string',
      description: 'The name of the project (e.g., "NØRD Collective")',
      validation: (Rule) => Rule.required().max(60),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-friendly identifier for the project',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      description: 'Type of project',
      options: {
        list: [
          { title: 'Full Collection', value: 'Full Collection' },
          { title: 'Corporate Wear', value: 'Corporate Wear' },
          { title: 'Merch Drop', value: 'Merch Drop' },
          { title: 'Team Uniforms', value: 'Team Uniforms' },
          { title: 'Custom Apparel', value: 'Custom Apparel' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Main Image',
      type: 'image',
      description: 'High-quality project image (recommended: 1600x1200 or larger)',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Lower numbers appear first (1-100)',
      initialValue: 50,
      validation: (Rule) => Rule.required().min(1).max(100),
    }),
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
    {
      title: 'Title A-Z',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category',
      media: 'image',
      order: 'order',
    },
    prepare({ title, subtitle, media, order }) {
      return {
        title: `${order}. ${title}`,
        subtitle,
        media,
      }
    },
  },
})
