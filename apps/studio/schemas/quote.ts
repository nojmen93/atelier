import { defineType, defineField, defineArrayMember } from 'sanity'
import { DocumentIcon } from '@sanity/icons'

export default defineType({
  name: 'quote',
  title: 'Client Quote',
  type: 'document',
  icon: DocumentIcon,
  fields: [
    defineField({
      name: 'clientName',
      title: 'Client / Company Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'clientEmail',
      title: 'Client Email',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'clientLogo',
      title: 'Client Logo (optional)',
      type: 'image',
      description: 'Display their logo on the quote page',
      options: { hotspot: true },
    }),
    defineField({
      name: 'secretId',
      title: 'Secret Link ID',
      type: 'string',
      description: 'Auto-generated unique ID for the quote URL',
      readOnly: true,
      initialValue: () => crypto.randomUUID(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: '📝 Draft', value: 'draft' },
          { title: '📤 Sent', value: 'sent' },
          { title: '👀 Viewed', value: 'viewed' },
          { title: '✅ Approved', value: 'approved' },
          { title: '🔄 Revision Requested', value: 'revision' },
          { title: '❌ Declined', value: 'declined' },
          { title: '⏰ Expired', value: 'expired' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
    }),
    defineField({
      name: 'introMessage',
      title: 'Intro Message',
      type: 'text',
      description: 'Personal message shown at the top of the quote',
      rows: 3,
      initialValue: 'Thank you for your interest in working with us. We\'ve put together a custom proposal for your branded apparel.',
    }),
    defineField({
      name: 'products',
      title: 'Products',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'quoteProduct',
          title: 'Product',
          fields: [
            defineField({
              name: 'name',
              title: 'Product Name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 2,
            }),
            defineField({
              name: 'mockupImages',
              title: 'Mockup Images',
              type: 'array',
              of: [{ type: 'image', options: { hotspot: true } }],
              validation: (Rule) => Rule.required().min(1),
            }),
            defineField({
              name: 'decorationType',
              title: 'Decoration Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Embroidery', value: 'embroidery' },
                  { title: 'Screen Print', value: 'screenprint' },
                  { title: 'DTG Print', value: 'dtg' },
                  { title: 'Heat Transfer', value: 'heattransfer' },
                ],
              },
            }),
            defineField({
              name: 'colors',
              title: 'Available Colors',
              type: 'array',
              of: [{ type: 'string' }],
              options: { layout: 'tags' },
            }),
            defineField({
              name: 'sizes',
              title: 'Sizes',
              type: 'string',
              initialValue: 'XS - 3XL',
            }),
            defineField({
              name: 'quantity',
              title: 'Quantity',
              type: 'number',
              validation: (Rule) => Rule.required().min(1),
            }),
            defineField({
              name: 'unitPrice',
              title: 'Unit Price',
              type: 'number',
              description: 'Price per item (excluding VAT)',
              validation: (Rule) => Rule.required().min(0),
            }),
          ],
          preview: {
            select: {
              title: 'name',
              quantity: 'quantity',
              unitPrice: 'unitPrice',
              media: 'mockupImages.0',
            },
            prepare({ title, quantity, unitPrice, media }) {
              const total = quantity && unitPrice ? quantity * unitPrice : 0
              return {
                title,
                subtitle: `${quantity}x @ €${unitPrice} = €${total}`,
                media,
              }
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'deliveryTimeline',
      title: 'Delivery Timeline',
      type: 'string',
      description: 'e.g., "2-3 weeks after approval"',
      initialValue: '2-3 weeks after approval',
    }),
    defineField({
      name: 'validUntil',
      title: 'Quote Valid Until',
      type: 'date',
      description: 'Expiration date for this quote',
    }),
    defineField({
      name: 'terms',
      title: 'Terms & Conditions',
      type: 'text',
      rows: 6,
      initialValue: `• 50% deposit required to begin production
• Balance due before shipping
• Delivery timeline begins after design approval
• All sales are final for custom branded products
• Prices exclude VAT (25%)`,
    }),
    defineField({
      name: 'notes',
      title: 'Internal Notes',
      type: 'text',
      description: 'Private notes (not shown to client)',
      rows: 3,
    }),
    defineField({
      name: 'clientResponse',
      title: 'Client Response',
      type: 'object',
      description: 'Captured when client approves or requests revision',
      fields: [
        defineField({
          name: 'respondedAt',
          title: 'Responded At',
          type: 'datetime',
        }),
        defineField({
          name: 'action',
          title: 'Action',
          type: 'string',
        }),
        defineField({
          name: 'message',
          title: 'Message',
          type: 'text',
        }),
      ],
    }),
    defineField({
      name: 'viewedAt',
      title: 'First Viewed At',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      readOnly: true,
      initialValue: () => new Date().toISOString(),
    }),
  ],
  orderings: [
    {
      title: 'Newest First',
      name: 'createdDesc',
      by: [{ field: 'createdAt', direction: 'desc' }],
    },
    {
      title: 'Status',
      name: 'status',
      by: [{ field: 'status', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'clientName',
      status: 'status',
      email: 'clientEmail',
      products: 'products',
    },
    prepare({ title, status, email, products }) {
      const statusEmoji: Record<string, string> = {
        draft: '📝',
        sent: '📤',
        viewed: '👀',
        approved: '✅',
        revision: '🔄',
        declined: '❌',
        expired: '⏰',
      }
      const productCount = products?.length || 0
      return {
        title: `${statusEmoji[status] || ''} ${title}`,
        subtitle: `${email} • ${productCount} product${productCount !== 1 ? 's' : ''}`,
      }
    },
  },
})
