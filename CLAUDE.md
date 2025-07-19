# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm run start` - Start production server

## Application Architecture

This is a Next.js 14+ application using the App Router pattern with Supabase for backend services. The application contains three main independent sections:
1. **Lebre** - Personal productivity/habit tracking tool
2. **Quiz Maker** - AI-powered personality quiz generator and player
3. **Solstra** - Peaceful sky-land game with dragon care and villager interactions

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

## Solstra Section (`/solstra`)

Solstra is a peaceful sky-land game featuring dragon care, villager interactions, and resource management. The game emphasizes a calm, inviting atmosphere with warm visual design.

### Game Setting & Aesthetic

**World Description:**
- Sunny, brightly lit floating islands in the sky
- Temple with small cat-dragon guardian named Solis
- Abundant natural resources: fruits, vegetables, fish, honey, olive oil, flowers
- Peaceful, contemplative atmosphere focused on care and community

**Visual Design Constraints:**
- Peaceful and inviting feel is paramount
- Minimal UI color palette (1-2 accent colors) to let character colors stand out
- No emojis in UI (reserved space for future 2D pixel art)
- Solis represents warm sunlight/citrus energy, NOT fire

### Character System

**Named Characters with Color Coding:**
- **Ajax**: `#d65c06` (warm brown-orange) 
- **Banner**: `#e8b025` (golden yellow)
- **Sapphira**: `#2063b6` (deep blue)
- **Tessa**: `#abad23` (olive green)
- **Lana**: `#cf8fca` (pink-purple)
- **Leonidas**: `#be7113` (golden brown)

**Character Name Styling:**
- All character names rendered with `CharacterName` component (`app/solstra/components/CharacterName.tsx`)
- Bold font weight with character-specific hex colors
- Automatic color lookup via `getCharacterColor()` utility
- Used in dialogues, harvests, and UI throughout the game

### Theme Implementation

**Color Scheme:**
- **Primary Accent**: Warm amber/honey gold (`#d97706`) - echoes Solis's sunny warmth
- **Secondary Accent**: Soft sky blue (`#38bdf8`) - peaceful floating sky atmosphere
- **Background**: Clean white (`#ffffff`) for clarity
- **Cards**: Warm cream gradients (`#ffffff` to `#fffef5`) with light blue borders
- **Text**: Consistent dark gray (`#4b5563`) instead of black for softer appearance

**CSS Architecture:**
- Scoped theme file: `app/solstra/solstra-theme.css`
- Component-based class naming (`.solstra-card`, `.solstra-btn`, etc.)
- Custom text classes (`.solstra-text`, `.solstra-text-sm`, `.solstra-text-lg`)
- Header styling (`.solstra-header-main`, `.solstra-header-section`)
- All colors use theme-consistent hex values, avoiding Tailwind gray classes

**Key Design Elements:**
- Light blue cards on white background (floating island feel)
- Warm golden buttons with gradient effects and subtle shadows
- Semi-transparent modals with backdrop blur
- Rounded corners and soft shadows throughout
- Hover effects that enhance the peaceful, interactive feel

### Game Mechanics

**Dragon Care System:**
- Solis has food slots that deplete over time (8 hours per slot, max 3 slots)
- Feeding timer logic: 3→2 slots resets timer, 2→1 and 1→0 preserve timing
- Status lines change hourly for variety
- Feeding shows random appreciation messages

**Villager Interaction:**
- Six villagers each with unique personalities and harvest items
- Daily harvest cycle (resets at 11 PM EDT)
- Character-specific dialogue lines for greetings and harvests
- Standing behavior descriptions for ambient life

**Inventory System:**
- Complete inventory tracking system with database storage
- Items stored individually with timestamps and source attribution
- Inventory display in House tab with proper ordering and quantities
- Item ordering follows character sequence: Ajax (liquids) → Tessa (flour/vegetables) → Banner (fruits) → Leonidas (fish) → Sapphira (herbs) → Lana (flowers)
- Items removed from inventory when fed to Solis (FIFO system)

**Feeding Log System:**
- Tracks all 30 possible foods Solis can taste (complete list in `ALL_FOODS` constant)
- Visual progress tracking: white background + dark text for tasted foods, light gray background + light text for untasted
- First-time feeding shows special message: "Solis tried [food] for the first time, and liked it!"
- Subsequent feedings use random lines from `SOLIS_FEEDING_LINES`
- Complete feeding log display in House tab organized by character harvest order

**Interactive Feeding Flow:**
- Temple feeding now requires actual inventory items
- Inventory selection modal shows available items with hover effects (light yellow)
- Creates meaningful gameplay loop: harvest → store → feed → discover

### Technical Architecture

**Database Schema:**
- `solstra_dragon_state` - Dragon status, food slots, timing data
- `solstra_villager_harvests` - Daily harvest tracking per user/villager
- `solstra_user_inventory` - Individual item storage with timestamps and source tracking
- `solstra_feeding_log` - Foods Solis has tasted with first-tasted timestamps
- Uses Eastern Time for consistent day boundaries
- Integer date formats (YYYYMMDD) for efficient querying
- RLS policies ensure user data isolation across all tables

**Key Components:**
- `CharacterName.tsx` - Styled character name rendering
- `DialogueBox.tsx` - Character interaction modal
- `HarvestModal.tsx` - Item collection feedback  
- `FeedingModal.tsx` - Dragon feeding confirmation
- `InventorySelectionModal.tsx` - Interactive item selection for feeding with hover effects

**Helper Functions** (`utils/supabase/solstra/helpers.ts`):
- `feedDragon()` - Handle feeding with timer logic
- `calculateCurrentFoodSlots()` - Real-time slot calculation
- `getDragonState()` - Fetch/create dragon data
- `hasHarvestedFromVillager()` - Daily harvest tracking
- `addItemToInventory()` / `removeItemFromInventory()` - Inventory management
- `getUserInventorySorted()` - Get inventory with proper character-based ordering
- `hasTastedFood()` / `recordFoodTasted()` - Feeding log tracking
- `getUserFeedingLog()` - Complete feeding progress with visual state data
- `clearUserInventory()` / `clearUserFeedingLog()` - Debug functions
- `ALL_FOODS` constant - Complete list of 30 feedable items in character order

**Game Content** (`utils/solstra/game-content.ts`):
- Character dialogue lines stored in JSON
- Color mapping and character utilities
- Random line selection for dynamic content
- Character name parsing for future rich text features

### Development Notes

- Game content separated into JSON files for easy modification
- Character colors defined in TypeScript for type safety
- Consistent timer mechanics across all dragon interactions
- Debug tools available for testing without waiting for real-time delays
- Scoped styling prevents conflicts with other application sections
- All text uses custom CSS classes for consistent theming
- Modal system designed for mobile-first interaction patterns

**Custom Font Integration:**
- Abaddon Light/Bold fonts loaded via `@font-face` in scoped CSS
- Font weights: 400 (Light) for regular text, 700 (Bold) for headers and `<strong>` tags
- Font files stored in `public/fonts/` directory for Next.js static serving
- Font scaling handled by individual font-size increases rather than global scaling

**CSS Styling Patterns:**
- Scoped CSS with `.solstra-container` wrapper prevents style leaking
- Custom properties and component-based class naming (`.solstra-btn`, `.solstra-card`)
- Color inheritance issues: CSS classes with `color` properties override inline styles
- Solution: Use `color: 'inherit'` in child elements or remove conflicting classes
- Hover effects with light yellow (`#fef9c3`) for interactive inventory items

**Database Architecture Patterns:**
- Individual item storage (not just counts) enables FIFO removal and rich metadata
- Unique constraints prevent duplicate entries (user + food combination)
- Timestamp tracking for both receiving items and first-time experiences
- JSONB storage avoided in favor of relational tables for better querying and type safety
- RLS policies consistent across all game tables for user data isolation

**Tab Organization & User Flow:**
- **Temple (Home)**: Dragon care and feeding (requires inventory)
- **House**: Inventory viewing and feeding log progress tracking  
- **Town**: Harvesting and villager interaction (generates inventory)
- **Debug**: Testing tools for all game systems without waiting for timers
- Logical progression creates engaging gameplay loop encouraging exploration