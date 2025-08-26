# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## IMPORTANT: Supabase Type Generation

**CRITICAL**: After making any database schema changes (adding tables, columns, etc.), you MUST regenerate Supabase types for Vercel deployment:

```bash
npx supabase gen types typescript --project-id=$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d'=' -f2 | sed 's|https://||' | sed 's|\.supabase\.co||') > types/supabase.ts
```

This ensures TypeScript types are up-to-date and the application will deploy successfully to Vercel.

## Development Commands

- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm run start` - Start production server

## Application Architecture

This is a Next.js 14+ application using the App Router pattern with Supabase for backend services. The application contains four main independent sections:
1. **Lebre** - Personal productivity/habit tracking tool
2. **Quiz Maker** - AI-powered personality quiz generator and player
3. **Solstra** - Peaceful sky-land game with dragon care and villager interactions
4. **Greek-Word-Counter** - Comprehensive Greek vocabulary tracking and learning system

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

### Row Level Security (RLS) Important Notes

**CRITICAL**: When adding new columns to existing tables or creating new tables, always ensure proper RLS policies are in place. The most common issue when database operations appear to work in code but don't persist is missing or incorrect RLS policies.

**Common RLS Issues:**
- Adding new columns (like `starred` boolean) requires UPDATE policies to be configured
- New tables need comprehensive policies for SELECT, INSERT, UPDATE, DELETE operations
- Use `auth.uid() = user_id` pattern for user data isolation
- Always test database changes by checking actual data persistence, not just API responses

**RLS Policy Template for User Tables:**
```sql
-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Standard user data policies  
CREATE POLICY "Users can view their own data" ON table_name FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own data" ON table_name FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own data" ON table_name FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own data" ON table_name FOR DELETE USING (auth.uid() = user_id);
```

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
- Solis uses Time Marker (TM) hunger system with 4 phases:
  - `current_time > TM+24h`: 3 food slots available
  - `TM+16h ≤ current_time ≤ TM+24h`: 2 food slots available  
  - `TM+8h ≤ current_time ≤ TM+16h`: 1 food slot available
  - `current_time < TM+8h`: 0 food slots available
- Feeding logic preserves player timing investment:
  - **3→2 feeding**: `TM = current_time - 16h` (resets timer)
  - **2→1 and 1→0 feeding**: `TM = TM + 8h` (preserves existing timing)
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
- **Time Marker (TM) System**: Single `hunger_time_marker` timestamp replaces complex slot tracking - hunger always computable from time difference
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

## Greek-Word-Counter Section (`/greek-word-counter`)

The Greek-Word-Counter is a comprehensive vocabulary tracking and learning system designed to encourage Greek language study through progress visualization and gamification. Built following the established section patterns with scoped theming, dedicated database schema, and advanced learning features.

### Architecture Overview

- **Route Structure**: All routes under `/greek-word-counter` with shared layout and authentication
- **Theming**: Greek-inspired blue/red gradient color scheme with olive green accents
- **Navigation**: Five-tab structure with active state indicators
- **Learning Focus**: Progress tracking, streak counting, and interactive features to motivate vocabulary building

### Key Directories

- `app/greek-word-counter/` - Greek vocabulary application root
  - `layout.tsx` - Protected layout with Greek navigation and scoped CSS import
  - `page.tsx` - Main vocabulary list with search, filtering, editing, and bulk operations
  - `add-words/page.tsx` - Single-column form for adding vocabulary with CSV import
  - `historical-chart/page.tsx` - Progress tracking with word count history and weekly streaks
  - `quiz/page.tsx` - Random vocabulary quiz with customizable question counts
  - `analyze-text/page.tsx` - Text analysis and word counting functionality
  - `components/ClientNav.tsx` - Client-side navigation with active states
  - `greek-theme.css` - Scoped CSS theme (only affects greek-word-counter routes)

### API Routes

- `app/api/greek-vocabulary/route.ts` - CRUD operations for vocabulary entries
- `app/api/greek-vocabulary/[id]/route.ts` - Individual vocabulary entry management
- `app/api/greek-vocabulary-history/route.ts` - Progress snapshot storage and retrieval
- `app/api/greek-weekly-streaks/route.ts` - Weekly activity tracking and streak calculation

### Database Schema (Greek Tables)

**greek_vocabulary table:**
```sql
CREATE TABLE greek_vocabulary (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  greek_word TEXT NOT NULL,
  english_word TEXT NOT NULL,
  transliteration TEXT NOT NULL,
  word_type TEXT NOT NULL DEFAULT 'noun',
  knowledge_level TEXT NOT NULL DEFAULT 'basic',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**greek_vocabulary_history table:**
```sql
CREATE TABLE greek_vocabulary_history (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  word_count INTEGER NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**greek_weekly_activity table:**
```sql
CREATE TABLE greek_weekly_activity (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  week_start DATE NOT NULL,
  has_activity BOOLEAN DEFAULT false,
  words_added INTEGER DEFAULT 0,
  words_updated INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Features Implemented

1. **Vocabulary Management**
   - Individual database entries for each Greek word with English translation and transliteration
   - Word types: Noun, Verb, Adjective, Adverb, Preposition, Conjunction, Interjection, Other
   - Knowledge levels: Basic, Moderate, Full, Almost Full, Recent (with internal storage mapping)
   - Create, Read, Update, Delete operations with proper validation

2. **Advanced Search & Filtering**
   - Real-time search across Greek words, English translations, and transliterations
   - Filter by Word Type and Knowledge Level with radio button controls
   - Search and filter combinations work together for precise vocabulary discovery
   - Responsive search results with immediate feedback

3. **Bulk Operations**
   - Bulk edit mode with checkbox selection for multiple words
   - Mass knowledge level updates for selected vocabulary entries
   - CSV export with proper knowledge level mapping (Basic→B, Moderate→M, etc.)
   - CSV import with automatic parsing and knowledge level translation
   - Progress feedback for bulk operations

4. **Individual Word Editing**
   - Inline edit modal with radio button controls matching Add Words form
   - All fields editable: Greek word, English word, transliteration, word type, knowledge level
   - Form validation and error handling
   - Automatic timestamp updates on edit

5. **Progress Tracking & Visualization**
   - TODO

6. **Weekly Learning Streaks**
   - Automatic activity tracking using database triggers
   - ISO week calculation (Monday-to-Sunday weeks)
   - Current streak, longest streak, and total active weeks display
   - Streak logic handles both current week activity and gaps correctly
   - Database triggers automatically update weekly activity on vocabulary changes

7. **Interactive Quiz System**
   - Random vocabulary quiz with 5, 10, 15, or 20 question options
   - Both Greek-to-English and English-to-Greek question types
   - Multiple choice questions with three wrong answers generated from existing vocabulary
   - Progress tracking during quiz with visual progress bar
   - Score display with correct/incorrect answer breakdown
   - "Play Again" functionality for continued practice

8. **CSV Import/Export**
   - Export vocabulary to CSV with proper knowledge level mapping for external use
   - Import CSV files with automatic parsing and validation
   - Knowledge level translation (M→Moderate, F→Full, A→Almost full, R→Recent)
   - Batch processing for imported entries with progress feedback
   - Error handling for malformed CSV data

9. **Text Analysis Tools**
   - Word counting functionality for Greek and English text
   - Character counting with and without spaces
   - Sentence and paragraph counting
   - Real-time analysis as user types
   - Clear separation of analysis tools from vocabulary management

### Navigation Structure

**Five-Tab Layout:**
1. **Greek Words** - Main vocabulary list with search, filtering, editing (home page)
2. **Add Words** - Single-column form for new vocabulary entry and CSV import
3. **Historical Chart** - Progress visualization and weekly streak tracking
4. **Quiz** - Interactive vocabulary testing with customizable difficulty
5. **Analyze Text** - Text analysis and word counting tools

### Theming System

**Greek-Inspired Color Scheme:**
- **Primary Colors**: Blue to red gradient (`linear-gradient(135deg, #1e3a8a, #dc2626)`) - reminiscent of Greek flag
- **Secondary Color**: Olive green (`#84cc16`) - connecting to Greek culture and olives
- **Background**: Clean white (`#ffffff`) for clarity and readability
- **Cards**: Light gray background (`#f9fafb`) with subtle borders
- **Success States**: Green highlighting for positive actions and feedback

**CSS Architecture:**
- Scoped theme file: `app/greek-word-counter/greek-theme.css`
- `.greek-container` wrapper class ensures style isolation
- Component-based class naming (`.greek-btn`, `.greek-card`, `.greek-nav-button`)
- Custom text classes (`.greek-text`, `.greek-text-sm`, `.greek-text-lg`)
- Header styles (`.greek-header-main`, `.greek-header-section`)
- Button variants: `.greek-btn` (primary), `.greek-btn-secondary` (olive), `.greek-btn-gray` (neutral)

**Design Elements:**
- Greek flag-inspired gradient buttons with hover effects
- Rounded corners and subtle shadows throughout
- Radio button styling for consistent form interactions
- Modal overlays with backdrop blur for editing interfaces
- Responsive grid layouts for vocabulary display

### Helper Functions

**Located in `utils/supabase/greek/helpers.ts`:**
- `GreekVocabularyEntry` type definition with all vocabulary fields
- Database helper functions following established patterns
- Type-safe operations with proper error handling
- Integration with existing authentication system
- Consistent with other section helper patterns

### Technical Architecture Patterns

**Database Design:**
- Individual entry storage (not blob) for rich querying capabilities
- Proper indexing for search performance across Greek, English, and transliteration fields
- RLS policies for user data isolation following established security patterns
- Automatic timestamp management for created_at and updated_at fields
- Foreign key relationships with proper cascade handling

**Weekly Streak System:**
- Database triggers automatically track vocabulary activity (INSERT, UPDATE operations)
- ISO week calculation for consistent Monday-to-Sunday week boundaries
- Streak calculation handles current week edge cases and activity gaps
- Efficient queries using window functions for streak analysis
- Weekly activity table prevents duplicate tracking and enables rich statistics

**CSV Processing:**
- Client-side parsing using File API for responsive user experience  
- Knowledge level mapping between display format and storage format
- Batch API operations for efficient database writes
- Progress feedback during long import operations
- Error handling for malformed files with user-friendly error messages

**Quiz Generation Algorithm:**
- Random vocabulary selection from user's complete word list
- Smart wrong answer generation using existing vocabulary to create realistic multiple choice
- Both direction testing (Greek→English and English→Greek) for comprehensive learning
- Configurable question counts (5, 10, 15, 20) to match user study time preferences
- Progress tracking and scoring with immediate feedback
