import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const services = defineCollection({
  loader: glob({ pattern: '*/index.md', base: 'src/content/services' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(160),
    order: z.number().default(0),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '*/index.md', base: 'src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    updated: z.date().optional(),
    description: z.string().max(160),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
  }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: '*.md', base: 'src/content/testimonials' }),
  schema: z.object({
    author: z.string(),
    car: z.string(),
    date: z.date(),
    rating: z.number().min(1).max(5).default(5),
  }),
});

export const collections = { services, blog, testimonials };
