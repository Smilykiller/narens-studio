# Studio Name - Photography Web Platform

A full-stack photography studio platform built with Next.js 14, Tailwind CSS, Supabase, Cloudinary, Prisma, and Socket.io.

## Features
- **Portfolio Gallery:** Stunning public displays of work.
- **Live Shoot Rooms:** Clients scan a QR code on set and watch photos appear on their device in real-time.
- **Selection Room:** Secure, tri-state photo selection engine for clients (Like, Waitlist, Trash).
- **Frame Shop:** E-commerce shop allowing users to upload mobile photos and order custom physical frames.

## Prerequisites
- Node.js 18+
- Supabase Project (PostgreSQL + Auth)
- Cloudinary Account
- Optional: Separate Node.js server for custom Socket.io logic if not using Supabase Realtime.

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd narensstudio
   ```

2. **Install dependencies:**
   ```bash
   cd web
   npm install
   ```

3. **Environment Variables:**
   Copy the `.env.example` to `.env.local` and fill in your Supabase, Cloudinary, and Database URLs.
   ```bash
   cp .env.example .env.local
   ```

4. **Database Setup:**
   - Execute the SQL schema provided in your Supabase SQL Editor.
   - If using Prisma: run `npx prisma db pull` followed by `npx prisma generate`.

5. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Your frontend will be running on `http://localhost:3000`.

## Deployment
This project is optimized for deployment on Vercel. Connect your GitHub repository to Vercel and ensure all environment variables from `.env.local` are added to the Vercel project settings.
