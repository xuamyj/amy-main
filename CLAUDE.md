# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm run start` - Start production server

## Application Architecture

This is a Next.js 14+ application using the App Router pattern with Supabase for backend services. The application is a personal productivity/habit tracking tool called "Lebre".

### Core Structure

- **App Router**: Uses Next.js App Router (`app/` directory) with nested layouts
- **Authentication**: Supabase Auth with cookie-based sessions via `@supabase/ssr`
- **Database**: Supabase PostgreSQL with typed client via generated types
- **Styling**: Tailwind CSS with custom components
- **State Management**: Jotai for client-side state

### Key Directories

- `app/lebre/` - Main application pages (protected routes)
  - `layout.tsx` - Protected layout with navigation and auth checks
  - `page.tsx` - Home/dashboard page
  - `calendar/[yearMonth]/` - Monthly calendar view
  - `board/[boardId]/` - Individual board management
  - `manage_boards/` - Board creation and editing
  - `settings/` - User preferences
- `utils/supabase/` - Database utilities and client setup
  - `amy/helpers.ts` - Core database functions and business logic
  - `client.ts`, `server.ts`, `middleware.ts` - Supabase client configurations
- `types/supabase.ts` - Auto-generated TypeScript types from Supabase schema
- `components/` - Reusable React components

### Database Schema

The application uses these main tables:
- `user_info` - User preferences (display_name, start_weekday, boards_ordering JSON)
- `boards` - User-created boards/categories with sections ('A' or 'B')
- `board_days` - Daily completion tracking for boards (created_day as YYYYMMDD integer)
- `day_notes` - Daily notes/journal entries

### Authentication Flow

1. Middleware (`middleware.ts`) handles auth state across requests
2. Protected routes use `getUserId()` helper to check authentication
3. Redirect to `/login` if unauthenticated
4. Layout components enforce authentication at the layout level

### Date Handling

- Uses PST timezone consistently via `getTodayPST()`
- Date storage as integers in YYYYMMDD format for efficient querying
- Month handling as YYYYMM integers

### Key Helper Functions

Located in `utils/supabase/amy/helpers.ts`:
- `getUserId()` - Get current authenticated user ID
- `getUserBoardsAsArray()` - Fetch user's boards with optional section filtering
- `getBoardDaysForDay()` - Get board completion data for specific day
- `getUserDayNotes()` - Fetch user's notes for a month
- `getUserBoardsOrdering()` - Get custom board ordering from user preferences JSON

### Development Notes

- The app appears to be transitioning from a Supabase starter template (evident from README)
- Custom business logic is primarily in the `amy/helpers.ts` file
- Uses integer date formats (YYYYMMDD) instead of standard Date objects for database efficiency
- Board ordering is stored as JSON in user_info table rather than separate ordering table