# Rollen Dashboard

A personal productivity and time-tracking dashboard built with Next.js 14, TypeScript, and Supabase.

## Features

- 📊 Real-time progress tracking across multiple life categories
- 🎯 Goal setting and monitoring
- 📈 Beautiful animated visualizations
- 📱 Responsive design
- 🌙 Dark mode support
- ⚡ Server-side rendering for optimal performance

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **State Management**: Redux Toolkit
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Charts**: Recharts
- **Animations**: Framer Motion
- **UI Components**: shadcn/ui
- **Deployment**: Vercel

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/rollen-dashboard.git
   cd rollen-dashboard
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create a Supabase project and get your credentials:
   - Go to [Supabase](https://supabase.com)
   - Create a new project
   - Get your project URL and anon key
   - Create the following tables in your Supabase database:

   ```sql
   -- Create tables
   CREATE TABLE profiles (
     id UUID PRIMARY KEY,
     email TEXT UNIQUE NOT NULL,
     display_name TEXT
   );

   CREATE TABLE categories (
     id UUID PRIMARY KEY,
     name TEXT NOT NULL,
     color_hex TEXT NOT NULL,
     goal_minutes INTEGER NOT NULL,
     gradient_start_hex TEXT NOT NULL,
     gradient_end_hex TEXT NOT NULL
   );

   CREATE TABLE subcategories (
     id UUID PRIMARY KEY,
     category_id UUID REFERENCES categories(id),
     name TEXT NOT NULL,
     current_minutes INTEGER DEFAULT 0
   );

   CREATE TABLE entries (
     id UUID PRIMARY KEY,
     user_id UUID REFERENCES profiles(id),
     subcategory_id UUID REFERENCES subcategories(id),
     date DATE NOT NULL,
     minutes INTEGER NOT NULL
   );
   ```

4. Set up your environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your Supabase credentials.

5. Run the seed script to populate initial data:
   ```bash
   pnpm tsx scripts/seed.ts
   ```

6. Start the development server:
   ```bash
   pnpm dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/         # React components
├── lib/               # Utility functions and configurations
├── store/             # Redux store and slices
├── types/             # TypeScript type definitions
└── styles/            # Global styles and Tailwind config
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
