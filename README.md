# PrimeVision Movie App

A modern movie streaming platform built with Next.js and the TMDB API.

## Environment Variables

This project uses environment variables to protect sensitive information like API keys. To run the project locally, you need to set up these environment variables:

1. Create a `.env.local` file in the root directory of the project
2. Add the following environment variables:

\`\`\`
# TMDB API Key (server-side only)
TMDB_API_KEY=your_tmdb_api_key_here
\`\`\`

3. Replace `your_tmdb_api_key_here` with your actual TMDB API key

## Getting Started

First, install the dependencies:

\`\`\`bash
npm install
# or
yarn install
# or
pnpm install
\`\`\`

Then, run the development server:

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- Browse popular, top-rated, and upcoming movies
- Watch movie trailers
- Search for movies
- View movie details including cast, genres, and similar movies
- Rate movies as a guest user
- Responsive design for all devices

\`\`\`

Let's update the `lib/tmdb.ts` file to separate client and server functions:
