# 💕 Us — A Love Journal

> A personal relationship journal app built as proof of love. Write daily entries about missing your partner, share photos and voice notes, and track every second apart.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwind-css) ![Supabase](https://img.shields.io/badge/Supabase-Free-green) ![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000)

## ✨ Features

### Stage 1 — Core Experience
- **Live Love Counter** — Real-time days, hours, minutes, seconds since your partner left
- **Together Counter** — Total time you've been together
- **Daily Entries** — Write messages with mood tracking (😢 😔 ❤️ 😊 😍)
- **Photo Upload** — Drag & drop photos into your journal
- **Voice Notes** — Record and share voice messages directly in the browser
- **Timeline View** — Beautiful chronological cards from both partners
- **Photo Gallery** — Masonry grid of all shared photos
- **Voice Board** — Playlist-style voice note player
- **Mood Graph** — Visual chart tracking feelings over time
- **30 Reasons Why** — A love letter, one per day
- **PDF Export** — Printable booklet of your entire journey

### Admin Controls
- **Account Management** — Create partner accounts securely
- **Full Control** — Manage settings, dates, names, and access

### Roadmap
- **Stage 2** — Shared photo albums, anniversaries, read receipts
- **Stage 3** — End-to-end encrypted real-time chat, typing indicators, reactions

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 14](https://nextjs.org/) (App Router) |
| Language | [TypeScript 5.5](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS 3.4](https://tailwindcss.com/) |
| Backend | [Supabase](https://supabase.com/) (Auth, Database, Storage) |
| Charts | [Recharts](https://recharts.org/) |
| Icons | [Lucide React](https://lucide.dev/) |
| PDF | [jsPDF](https://github.com/parallax/jsPDF) |
| Hosting | [Vercel](https://vercel.com/) |

## 📁 Project Structure

```
us-app/
├── app/                    # Next.js App Router pages
│   ├── login/              # Authentication page
│   ├── dashboard/          # Main dashboard with counters
│   ├── timeline/           # Chronological entry view
│   ├── entry/              # New entry form
│   ├── gallery/            # Photo gallery
│   ├── voices/             # Voice messages board
│   ├── moods/              # Mood analytics graph
│   ├── letters/            # 30 Reasons love letters
│   ├── export/             # PDF export
│   ├── admin/              # Admin panel
│   └── settings/           # App settings
├── components/             # Reusable UI components
│   ├── ui/                 # Button, Input
│   ├── layout/             # Navbar
│   ├── dashboard/          # Counters, stats
│   └── entries/            # Entry form, cards
├── hooks/                  # Custom React hooks
├── lib/                    # Supabase clients
├── supabase/               # Database migrations
└── docs/                   # Design & implementation plans
```

## 🚀 Getting Started

### Prerequisites
- [Node.js 18+](https://nodejs.org/)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- [Supabase](https://supabase.com/) account (free tier)
- [Vercel](https://vercel.com/) account (free tier)

### Installation

```bash
# Clone the repository
git clone https://github.com/TheSpideyBro/US-App.git
cd US-App

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
```

### Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Copy your **Project URL** and **anon key** from Settings → API
3. Paste them into `.env.local`
4. Run the SQL migration in Supabase SQL Editor:
   - Open `supabase/migrations/001_initial_schema.sql`
   - Copy and run all SQL in the Supabase Dashboard SQL Editor
5. Create two storage buckets in Supabase:
   - `photos` — Public access, 10MB max
   - `voice-notes` — Public access, 50MB max

### Development

```bash
# Start the development server
npm run dev

# Open http://localhost:3000
```

### Production Deployment

```bash
# Build for production
npm run build

# Start the production server
npm start
```

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/TheSpideyBro/US-App)

## 📖 How It Works

1. **You** (the admin) log in and set your departure date and relationship start date
2. **Every day**, write an entry — a message, upload a photo, or record a voice note
3. The app tracks every second you've been apart with a live counter
4. When your partner returns and has internet, they log in and see everything
5. They can write their own entries too — making it a shared journal

## 🔒 Security

- Row Level Security (RLS) enforced on all Supabase tables
- Admin-only account creation and settings management
- Role-based access control (admin / partner)
- Input sanitization on file uploads
- URL validation on all media sources
- Passwords hashed with bcrypt via Supabase

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with love 💕 for long-distance moments.

---

**Made by [TheSpideyBro](https://github.com/TheSpideyBro)**
