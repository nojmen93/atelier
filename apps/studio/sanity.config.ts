import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemas'

export default defineConfig({
  name: 'atelier-studio',
  title: 'Atelier Studio',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'your-project-id',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',

  plugins: [
    structureTool(),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },

  // Custom studio theming to match brand
  theme: {
    '--main-navigation-color--inverted': '#f5f5f3',
    '--main-navigation-background--inverted': '#0a0a0a',
    '--focus-color': '#c9b99a',
  },
})
