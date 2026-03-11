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
      mediaRoot: 'src/content',
      publicFolder: '',
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
    ],
  },
});
