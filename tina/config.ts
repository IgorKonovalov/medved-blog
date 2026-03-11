import { defineConfig } from 'tinacms';

export default defineConfig({
  branch: process.env.TINA_BRANCH || 'master',
  clientId: process.env.TINA_CLIENT_ID || '',
  token: process.env.TINA_TOKEN || '',

  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },

  media: {
    tina: {
      mediaRoot: 'images',
      publicFolder: 'public',
    },
  },

  schema: {
    collections: [
      {
        name: 'blog',
        label: 'Блог',
        path: 'src/content/blog',
        match: {
          include: '*/index',
        },
        format: 'md',
        fields: [
          {
            type: 'string',
            name: 'title',
            label: 'Заголовок',
            required: true,
          },
          {
            type: 'datetime',
            name: 'date',
            label: 'Дата публикации',
            required: true,
          },
          {
            type: 'datetime',
            name: 'updated',
            label: 'Дата обновления',
          },
          {
            type: 'string',
            name: 'description',
            label: 'Описание (SEO)',
            required: true,
            ui: {
              validate: (val: string | undefined) =>
                val && val.length > 160 ? 'Максимум 160 символов' : undefined,
            },
          },
          {
            type: 'string',
            name: 'tags',
            label: 'Теги',
            list: true,
          },
          {
            type: 'boolean',
            name: 'draft',
            label: 'Черновик',
          },
          {
            type: 'image',
            name: 'image',
            label: 'Изображение',
          },
          {
            type: 'string',
            name: 'imageAlt',
            label: 'Alt-текст изображения',
          },
          {
            type: 'rich-text',
            name: 'body',
            label: 'Содержание',
            isBody: true,
          },
        ],
      },
      {
        name: 'services',
        label: 'Услуги',
        path: 'src/content/services',
        match: {
          include: '*/index',
        },
        format: 'md',
        fields: [
          {
            type: 'string',
            name: 'title',
            label: 'Название услуги',
            required: true,
          },
          {
            type: 'string',
            name: 'description',
            label: 'Описание (SEO)',
            required: true,
            ui: {
              validate: (val: string | undefined) =>
                val && val.length > 160 ? 'Максимум 160 символов' : undefined,
            },
          },
          {
            type: 'number',
            name: 'order',
            label: 'Порядок сортировки',
          },
          {
            type: 'image',
            name: 'image',
            label: 'Изображение',
          },
          {
            type: 'string',
            name: 'imageAlt',
            label: 'Alt-текст изображения',
          },
          {
            type: 'boolean',
            name: 'draft',
            label: 'Черновик',
          },
          {
            type: 'rich-text',
            name: 'body',
            label: 'Содержание',
            isBody: true,
          },
        ],
      },
      {
        name: 'testimonials',
        label: 'Отзывы',
        path: 'src/content/testimonials',
        format: 'md',
        fields: [
          {
            type: 'string',
            name: 'author',
            label: 'Автор',
            required: true,
          },
          {
            type: 'string',
            name: 'car',
            label: 'Автомобиль',
            required: true,
          },
          {
            type: 'datetime',
            name: 'date',
            label: 'Дата',
            required: true,
          },
          {
            type: 'number',
            name: 'rating',
            label: 'Оценка (1-5)',
            ui: {
              validate: (val: number | undefined) =>
                val !== undefined && (val < 1 || val > 5)
                  ? 'Оценка от 1 до 5'
                  : undefined,
            },
          },
          {
            type: 'rich-text',
            name: 'body',
            label: 'Текст отзыва',
            isBody: true,
          },
        ],
      },
    ],
  },
});
