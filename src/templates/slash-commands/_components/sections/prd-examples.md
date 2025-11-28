## PRD Examples

Real examples of mini-PRDs to help users understand what good planning looks like.

---

### Example 1: Simple Mobile App

```markdown
# Mini-PRD: Habit Tracker App

## What We're Building
A mobile app that helps people build good habits without the guilt.
Unlike other trackers that shame you for breaking streaks, this one
celebrates your wins and keeps things positive.

## Who It's For
- People who've tried habit apps but felt judged
- Anyone who wants to build small daily habits
- People who prefer encouragement over pressure

## The Problem We're Solving
Most habit trackers use streaks and "don't break the chain" psychology.
When users miss a day, they feel like failures and often give up entirely.
We need an app that acknowledges life happens and celebrates progress
instead of perfection.

## Must-Have Features (v1)
1. **Add habits to track** - Simple creation with name and reminder time
2. **Mark habits complete** - One tap to check off
3. **Positive progress view** - "You've done this 15 times!" not "Day 3 of streak"
4. **Gentle reminders** - Optional notifications, easy to snooze
5. **Weekly celebration** - End-of-week summary highlighting wins

## Nice-to-Have Features (Later)
- Share progress with friends
- Habit insights and patterns
- Custom celebration messages
- Dark mode

## How We'll Know It's Working
- Users can add a habit in under 10 seconds
- App never shows negative language (no "streak broken")
- 70% of users who try it stick around for 2+ weeks
- Users report feeling "encouraged" in feedback

## Technical Approach
- React Native for iOS and Android
- Local storage for data (no account required)
- Simple, cheerful UI with soft colors
- Push notifications via device native APIs

## What's NOT In Scope
- Social features (v1 is personal only)
- Data export
- Web version
- Integrations with other apps
```

---

### Example 2: API/Backend Service

```markdown
# Mini-PRD: User Management API

## What We're Building
A REST API for managing users in our web application. Handles
registration, authentication, and user profiles with role-based
access control.

## Who It's For
- Frontend developers building our web app
- Admin team managing user accounts
- Other services that need user data

## The Problem We're Solving
Our current auth is scattered across multiple files with no clear
structure. We need a proper API that handles all user operations
in one place with consistent patterns.

## Must-Have Features (v1)
1. **User registration** - Email + password, email verification
2. **Authentication** - Login, logout, password reset
3. **JWT tokens** - Access (15min) + refresh (7 days)
4. **User profiles** - View and update own profile
5. **Role-based access** - Admin, Editor, Viewer levels
6. **Admin operations** - List users, change roles, disable accounts

## Nice-to-Have Features (Later)
- OAuth (Google, GitHub login)
- Two-factor authentication
- Audit logging
- API rate limiting per user

## How We'll Know It's Working
- All endpoints respond in under 100ms
- 100% test coverage on auth flows
- Zero security vulnerabilities in penetration testing
- Frontend team can integrate in under 1 day

## Technical Approach
- Node.js with Express framework
- PostgreSQL database
- JWT for auth tokens
- bcrypt for password hashing
- Jest for testing

## API Endpoints Overview
- POST /auth/register
- POST /auth/login
- POST /auth/logout
- POST /auth/refresh
- POST /auth/forgot-password
- GET/PUT /users/me
- GET /users (admin only)
- PUT /users/:id/role (admin only)

## What's NOT In Scope
- Frontend UI for auth
- Email service (will use existing)
- User analytics
- Multi-tenancy
```

---

### Example 3: Feature Addition

```markdown
# Mini-PRD: Search Feature for E-commerce Site

## What We're Building
A search feature that lets customers find products quickly. Should
be fast, relevant, and work well on mobile.

## Who It's For
- Customers shopping on our site
- Especially mobile users (60% of our traffic)
- People who know what they want and don't want to browse

## The Problem We're Solving
Customers are abandoning our site because they can't find products.
Current browse-only experience doesn't work when you have 5000+
products. We need search.

## Must-Have Features (v1)
1. **Search box** - Visible on every page, especially mobile
2. **Instant results** - Show results as user types
3. **Product cards** - Image, name, price in results
4. **Filters** - Category, price range, in-stock only
5. **No results page** - Helpful suggestions when search fails

## Nice-to-Have Features (Later)
- Search suggestions/autocomplete
- Recent searches
- "Did you mean?" for typos
- Voice search on mobile

## How We'll Know It's Working
- Results appear in under 200ms
- 80%+ of searches return relevant results
- Conversion rate from search > browse
- Mobile search usage > 30% of all searches

## Technical Approach
- Elasticsearch for search backend
- React components for UI
- Debounced search (300ms delay while typing)
- Server-side filtering for performance

## Integration Points
- Product database (PostgreSQL)
- Image CDN for product thumbnails
- Analytics for search tracking

## What's NOT In Scope
- Personalized results (same results for everyone)
- Search within categories (just global search)
- Advanced operators ("AND", "OR", quotes)
```

---

### Example 4: Internal Tool

```markdown
# Mini-PRD: Team Task Board

## What We're Building
A simple Kanban board for our team to track tasks. Think Trello
but just for us, without all the features we don't use.

## Who It's For
- Our development team (8 people)
- Project manager for oversight
- Occasionally stakeholders for status updates

## The Problem We're Solving
We're paying for Trello but only use 10% of it. Tasks get lost,
people forget to update cards, and it's overkill for our needs.
We want something simpler that fits how we actually work.

## Must-Have Features (v1)
1. **Three columns** - To Do, In Progress, Done
2. **Task cards** - Title, description, assignee
3. **Drag and drop** - Move cards between columns
4. **Comments** - Discuss tasks without leaving the board
5. **Slack notifications** - When tasks move or get assigned

## Nice-to-Have Features (Later)
- Due dates with reminders
- Labels/tags
- Multiple boards per project
- Time tracking

## How We'll Know It's Working
- Team adopts it within 1 week
- No tasks "fall through the cracks"
- Status meetings take 50% less time
- Nobody asks "what are you working on?"

## Technical Approach
- React frontend
- Node.js backend
- MongoDB for flexibility
- Socket.io for real-time updates
- Slack API integration

## What's NOT In Scope
- Mobile app (desktop only for now)
- Reporting/analytics
- Time tracking
- Multiple teams/permissions
```

---

### PRD Template (Blank)

Copy and fill in:

```markdown
# Mini-PRD: [Project Name]

## What We're Building
[1-2 sentences describing the product/feature]

## Who It's For
- [Primary user type]
- [Secondary user type]
- [Use case context]

## The Problem We're Solving
[What's the pain point? Why does this need to exist?]

## Must-Have Features (v1)
1. **[Feature]** - [Brief description]
2. **[Feature]** - [Brief description]
3. **[Feature]** - [Brief description]

## Nice-to-Have Features (Later)
- [Feature]
- [Feature]

## How We'll Know It's Working
- [Measurable success criteria]
- [Measurable success criteria]
- [Measurable success criteria]

## Technical Approach
- [Key technology choices]
- [Architecture notes]

## What's NOT In Scope
- [Explicitly excluded feature]
- [Explicitly excluded feature]
```

---

## Quick PRD Examples

Quick PRDs condense the full PRD into 2-3 AI-optimized paragraphs for efficient agent consumption.

### Quick PRD Example 1: Habit Tracker

**Goal:** Build a mobile-first habit tracking app that helps users build consistent daily routines through streak tracking, reminders, and progress visualization. Target users are productivity-focused individuals who want simple habit management without complex features.

**Core Features:** Daily habit check-in with streak counter, customizable reminder notifications, weekly/monthly progress charts, habit templates for common goals (exercise, reading, meditation). Tech stack: React Native, local storage with optional cloud sync.

**Scope Boundaries:** No social features, no gamification beyond streaks, no premium tiers. Focus on core tracking reliability over feature breadth.

### Quick PRD Example 2: API User Management

**Goal:** Create a RESTful user management microservice for the existing e-commerce platform, handling authentication, authorization, and user profile CRUD operations. Must integrate with existing PostgreSQL database and support OAuth2.

**Core Features:** JWT-based authentication, role-based access control (admin/user/guest), user registration with email verification, password reset flow, profile management endpoints. Built with Node.js/Express, PostgreSQL, Redis for session caching.

**Scope Boundaries:** No frontend components, no payment integration, no analytics dashboard. Service-only implementation with OpenAPI documentation.

---

### Key Elements of a Good Mini-PRD

1. **Clear problem statement** - Why are we building this?
2. **Specific users** - Who exactly will use it?
3. **Prioritized features** - What's essential vs nice-to-have?
4. **Success metrics** - How do we measure success?
5. **Technical direction** - Enough detail to start, not over-specified
6. **Explicit scope** - What we're NOT doing is as important as what we are
