# StoryFlix

An interactive narrative platform that delivers one “card” per day and monetizes via text-only AI character chat.

## Features

- **Daily Drop Engine**: Scheduled release of vertical story cards.
- **Interactive Chat**: Converse with characters from the story (Mocked for now).
- **Case Journal**: Track progress and collected clues.
- **Admin Dashboard**:
  - Create Cards manually.
  - Import Season Packs via ZIP.
  - Schedule releases.

## Deployment on Render

This project is configured for deployment on [Render.com](https://render.com).

1.  Push this repository to GitHub/GitLab.
2.  Create a new **Web Service** on Render.
3.  Connect your repository.
4.  Render will automatically detect the `render.yaml` configuration.
5.  Deploy!

### Environment Variables

The `render.yaml` automatically sets up:
- `NODE_ENV`: production
- `DATABASE_URL`: SQLite database path (persisted on disk)
- `SESSION_SECRET`: Auto-generated for security

## Local Development

```bash
npm install
npm run dev
```

## Tech Stack

- **Frontend**: React, Vite, TailwindCSS, Framer Motion
- **Backend**: Node.js, Express (Ready for implementation)
- **Database**: SQLite (Ready for implementation)
