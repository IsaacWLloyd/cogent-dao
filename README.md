# Cogent DAO

A Next.js application with social authentication using Supabase.

## Features

- Next.js 15 with App Router
- Supabase Authentication (GitHub and Google OAuth)
- Tailwind CSS with dynamic theme (orange highlights)
- Shadcn UI Components
- TypeScript
- Responsive design

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account

### Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Setting up OAuth Providers

### GitHub

1. Go to GitHub Developer settings: https://github.com/settings/developers
2. Create a new OAuth App
3. Set Homepage URL to your site URL (e.g., http://localhost:3000)
4. Set Authorization callback URL to: https://your-supabase-project.supabase.co/auth/v1/callback
5. Save the Client ID and Client Secret
6. In Supabase Dashboard > Authentication > Providers > GitHub, enter these credentials

### Google

1. Go to Google Cloud Console: https://console.cloud.google.com
2. Create a new project
3. Go to "APIs & Services" > "Credentials"
4. Create OAuth client ID (Web application)
5. Add authorized redirect URI: https://your-supabase-project.supabase.co/auth/v1/callback
6. Save the Client ID and Client Secret
7. In Supabase Dashboard > Authentication > Providers > Google, enter these credentials

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn UI Documentation](https://ui.shadcn.com/docs)
