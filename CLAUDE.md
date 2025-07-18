# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm run start` - Start production server

## Application Architecture

This is a Next.js 14+ application using the App Router pattern with Supabase for backend services. The application contains two main independent sections:
1. **Lebre** - Personal productivity/habit tracking tool
2. **Quiz Maker** - AI-powered personality quiz generator and player

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

## Quiz Maker Section (`/quiz-maker`)

The Quiz Maker is a complete AI-powered quiz generation and playing platform, built as an independent section of the application with its own theming, database schema, and API integration.

### Architecture Overview

- **Route Structure**: All routes under `/quiz-maker` with shared layout and authentication
- **AI Integration**: Claude API for quiz generation via Anthropic SDK
- **Database**: Separate quiz storage schema in Supabase
- **Theming**: Scoped CSS with custom design system
- **Navigation**: Active tab indicators with client-side routing

### Key Directories

- `app/quiz-maker/` - Quiz maker application root
  - `layout.tsx` - Protected layout with quiz navigation and scoped CSS import
  - `page.tsx` - Home page showing quiz list and play functionality
  - `generate/page.tsx` - AI quiz generation interface
  - `play/[id]/page.tsx` - Interactive quiz taking with scoring
  - `data-backup/page.tsx` - Raw quiz data viewing for developers
  - `components/ClientNav.tsx` - Client-side navigation with active states
  - `quiz-theme.css` - Scoped CSS theme (only affects quiz-maker routes)

### API Routes

- `app/api/generate-quiz/route.ts` - Claude API integration for quiz generation
- `app/api/quiz-data/route.ts` - CRUD operations for saved quizzes
- `app/api/quiz-data/[id]/route.ts` - Individual quiz retrieval

### Database Schema (Quiz Tables)

**generated_quizzes table:**
```sql
CREATE TABLE generated_quizzes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario TEXT NOT NULL,
  outcome TEXT NOT NULL,
  quiz_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Quiz Data Structure (JSONB):**
- `results[]` - 5 possible quiz outcomes with descriptions
- `questions[]` - 7 questions with 6 answers each
- `answers[].points` - Point allocation to different results

### Features Implemented

1. **Quiz Generation**
   - AI-powered via Claude API
   - User inputs scenario and outcome
   - Generates 5 results, 7 questions, 6 answers per question
   - Point-based scoring system
   - Auto-save to database with redirect to play

2. **Quiz Playing**
   - Interactive question progression with visual progress bar
   - Radio-button style answer selection
   - Previous/Next navigation
   - Real-time score calculation
   - Results display with winning outcome

3. **Score Breakdown**
   - Detailed point analysis
   - Answer-by-answer breakdown
   - Final scores for all possible results
   - Collapsible interface

4. **Data Management**
   - Quiz list with creation dates
   - Data backup view for developers
   - Complete quiz data structure viewing

### Claude API Integration

**Setup Requirements:**
- `ANTHROPIC_API_KEY` in `.env.local`
- `@anthropic-ai/sdk` package installed

**Generation Process:**
1. User provides scenario and outcome
2. Structured prompt sent to Claude API
3. JSON response with quiz structure
4. Automatic save to Supabase
5. Redirect to quiz play page

### Theming System

**Scoped CSS Approach:**
- `quiz-theme.css` imported only in quiz-maker layout
- `.quiz-container` wrapper class scopes all styles
- CSS custom properties for consistent theming
- Component-based classes (`.quiz-btn`, `.quiz-card`, etc.)

**Design Philosophy:**
- Friendly and engaging visual design
- Gradient backgrounds and soft shadows
- Interactive hover effects and transitions
- Mobile-responsive layout
- Strategic emoji usage (🚀 for generation, ✨ for AI attribution)

### Navigation Pattern

**Active State Management:**
- `usePathname` hook for route detection
- Smart active state logic for nested routes
- CSS `.active` class with gradient styling
- Client component for navigation state

### Development Patterns for New Sections

**To create a similar independent section:**

1. **Directory Structure**
   ```
   app/new-section/
   ├── layout.tsx (auth + navigation + CSS import)
   ├── page.tsx (main functionality)
   ├── components/ (section-specific components)
   └── section-theme.css (scoped styling)
   ```

2. **Layout Pattern**
   - Import scoped CSS
   - Add `.section-container` wrapper class
   - Implement authentication check
   - Create navigation component with active states

3. **Database Integration**
   - Create section-specific tables
   - Add RLS policies for user isolation
   - Create API routes under `app/api/section-name/`
   - Use existing helper patterns from `utils/supabase/amy/helpers.ts`

4. **Styling Approach**
   - Create scoped CSS file with wrapper class
   - Define CSS custom properties for theming
   - Use component-based class naming
   - Import only in section layout

### API Integration Notes

- All quiz data stored as JSONB for flexibility
- Row Level Security enforces user data isolation
- Claude API responses are validated before storage
- Error handling for API failures and malformed responses
- Session storage used for quiz state persistence during play