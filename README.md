# SMS Movie Tracker

A full-stack web application for tracking your watched movies, built with Next.js, Clerk authentication, Convex database, and TMDB API.

## Project Overview

SMS Movie Tracker allows users to:

- Search for movies using The Movie Database (TMDB) API
- Add movies to their personal collection
- Rate and review the movies they've watched
- View their movie collection with filtering options

## Database Structure

Since this project uses Convex (a document-based database) instead of a traditional SQL database, below is the database schema definition:

### Schema (`convex/schema.ts`)

```typescript
// Convex schema definition
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  movieCollection: defineTable({
    userId: v.string(), // User ID from Clerk authentication
    movieId: v.number(), // TMDB movie ID
    title: v.string(), // Movie title
    posterPath: v.optional(v.string()), // Path to movie poster image
    releaseDate: v.optional(v.string()), // Movie release date
    voteAverage: v.optional(v.number()), // Average rating from TMDB
    genreIds: v.optional(v.array(v.number())), // Array of genre IDs
    genres: v.optional(
      v.array(
        v.object({
          id: v.number(), // Genre ID
          name: v.string(), // Genre name
        }),
      ),
    ),
    overview: v.optional(v.string()), // Movie description/summary
    userRating: v.optional(v.number()), // User's personal rating
    addedAt: v.number(), // Timestamp when movie was added
  }).index("by_user", ["userId"]), // Index to query movies by user
})
```

### Data Model

The application uses a single table/collection:

- **movieCollection**: Stores user's saved movies with metadata

#### Key Fields:

- `userId`: Links movies to specific users (from Clerk auth)
- `movieId`: TMDB's unique identifier for movies
- `userRating`: Optional user-provided rating
- `addedAt`: Timestamp to track when movies were added

#### Indexes:

- `by_user`: Optimizes queries to find all movies for a specific user

### Query and Mutation Functions

The database is accessed through Convex functions in `convex/movies.ts`, which provide:

- Query functions to retrieve user's movies
- Mutation functions to add, update, and remove movies from a user's collection

This document-based approach eliminates the need for complex SQL joins while maintaining data relationships through the `userId` field.

## Technologies Used

- **Frontend**:

  - Next.js 14 (App Router)
  - React 18
  - Tailwind CSS
  - shadcn/ui components
  - TypeScript

- **Backend**:

  - Convex (serverless backend and database)
  - Clerk (authentication)
  - TMDB API (movie data)

- **Testing**:
  - Jest
  - React Testing Library
  - MSW (Mock Service Worker)

## Getting Started

### Prerequisites

1. Node.js 18.x or later
2. npm or yarn
3. Accounts for:
   - [Clerk](https://clerk.dev/) (authentication)
   - [Convex](https://www.convex.dev/) (database)
   - [TMDB](https://www.themoviedb.org/documentation/api) (movie API)

### Setup Instructions

1. Clone the repository

```bash
git clone https://github.com/your-username/sms-movie-tracker.git
cd sms-movie-tracker
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Set up environment variables

Create a `.env.local` file in the root directory with the following variables:

```
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# TMDB API
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key

# Convex
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
CONVEX_DEPLOYMENT=dev:your-deployment-id
```

### Setting Up External Services

#### Clerk Authentication

1. Create an account at [clerk.dev](https://clerk.dev/)
2. Create a new application
3. Go to API Keys in your dashboard
4. Copy the Publishable Key and Secret Key to your `.env.local` file
5. Configure your application's Authentication settings to include the Clerk domain in the `convex/auth.config.ts` file

#### Convex Database

1. Create an account at [convex.dev](https://www.convex.dev/)
2. Install the Convex CLI: `npm install -g convex`
3. Initialize Convex for your project: `npx convex dev`
4. This will create a new deployment and update your `.env.local` with the proper values

#### TMDB API

1. Create an account at [themoviedb.org](https://www.themoviedb.org/)
2. Go to your account settings and then to the API section
3. Request an API key (free for non-commercial use)
4. Add your API key to the `.env.local` file

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Convex will automatically sync your backend with the development server using the `npx convex dev` command that's integrated into the development process.

## Unit Testing

This project includes comprehensive unit tests covering components, API endpoints, database queries, and validation logic.

To run the tests:

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Generate test coverage report
npm run test:coverage
```

For detailed information about the testing framework and methodologies, see [TESTING.md](./TESTING.md).

## Deployment

### Deploying the Next.js Frontend

The easiest way to deploy is using the [Vercel Platform](https://vercel.com/new).

1. Push your code to GitHub, GitLab, or Bitbucket
2. Import your repository to Vercel
3. Add your environment variables in the Vercel dashboard
4. Deploy

### Deploying Convex Backend

Your Convex backend is automatically deployed when you run:

```bash
npx convex deploy
```

Make sure to update the `NEXT_PUBLIC_CONVEX_URL` in your production environment to point to your production Convex deployment.

## Project Structure

- `/app`: Next.js application routes and pages
- `/components`: Reusable React components
- `/convex`: Convex backend functions and schema
- `/lib`: Utility functions and configuration
- `/public`: Static assets
- `/__tests__`: Test files
