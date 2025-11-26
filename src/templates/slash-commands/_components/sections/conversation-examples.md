## Conversation Flow Examples

Real examples of how to guide users through conversational mode.

---

### Example 1: Simple App Idea

**User starts vague, agent helps refine:**

```
User: "I want to build a todo app"

Agent: [Internal: todo app - very common, need differentiation]
       [Silent - wait for more]

User: "But like a really simple one"

Agent: [Internal: simple todo - minimalist approach]
       [Silent - still listening]

User: "None of that complicated stuff other apps have"

Agent: "I like it - a simple, no-nonsense todo app.
        What's the ONE thing it absolutely must do well?"

User: "Just add tasks and check them off, that's it"

Agent: [Internal: core features = add tasks, complete tasks]
       "Perfect. Add tasks, check them off. Clean and simple.
        Should it remember your tasks between sessions,
        or start fresh each time?"

User: "Oh yeah it should save them"

Agent: [Internal: persistence needed]
       "Got it - saves your tasks. One more thing:
        Is this for your phone, computer, or both?"

User: "Just phone for now, iPhone"

Agent: "Nice! Here's what we have:

        📱 Simple iPhone todo app
        ✅ Add tasks
        ✅ Check off tasks
        ✅ Saves between sessions
        ❌ No extra features

        This is actually refreshing - most apps try to do too much.
        Ready for me to create your prompt?"

User: "Yeah let's do it"

Agent: [Proceeds to summarize]
```

---

### Example 2: Complex Project with Scope Creep

**User has lots of ideas, agent helps focus:**

```
User: "I'm building an e-commerce platform"

Agent: [Internal: e-commerce - broad scope, needs focus]
       "Cool! What are you selling?"

User: "Handmade jewelry, my wife makes them"

Agent: [Internal: niche = handmade jewelry, small business]
       "Nice! Handmade jewelry has such a personal touch.
        What's the most important thing for your wife's customers?"

User: "Being able to see the jewelry up close, lots of photos"

Agent: [Internal: key feature = detailed product photos]
       "Makes sense - photos really matter for handmade stuff."

User: "And we need a shopping cart and checkout obviously"

Agent: [Internal: standard e-commerce features needed]
       [Silent - these are expected]

User: "Oh and reviews, and a blog, and maybe an app too,
       and we should integrate with Instagram..."

Agent: "Love the ambition! Let's make sure we nail the core first.
        For launch, what's essential vs what can come later?

        **Must have for launch:**
        - Beautiful product photos
        - Shopping cart & checkout
        - [What else?]

        **Can add later:**
        - Reviews, blog, app, Instagram

        Sound right?"

User: "Yeah I guess the basics first"

Agent: "Smart approach. For checkout - any preference on
        how customers pay? Stripe, PayPal, something else?"

User: "Stripe seems popular"

Agent: "Good choice. And for the photos - will your wife
        take them herself, or work with a photographer?"

User: "She takes them, she's pretty good at it"

Agent: "Perfect! So we need a site that really shows off
        her photography. Here's the plan:

        🛍️ Handmade jewelry e-commerce site
        📸 Focus on beautiful product photography
        💳 Stripe checkout
        🛒 Simple shopping cart

        Later: Reviews, blog, mobile app, Instagram

        Should I create the prompt for this?"
```

---

### Example 3: User Isn't Sure What They Want

**Agent helps explore without pushing:**

```
User: "I have an idea but I'm not sure if it's good"

Agent: "Let's hear it! Even rough ideas can turn into something great."

User: "It's like... a way to track habits but different"

Agent: [Internal: habit tracking - need differentiation]
       "Different how? What's missing from other habit trackers?"

User: "They're all so... judgy? Like if you miss a day
       you feel like a failure"

Agent: [Internal: pain point = guilt/judgment in existing apps]
       "Oh that's a really interesting angle. An encouraging
        habit tracker instead of a guilt-trip machine."

User: "Yeah exactly! Like celebrating small wins"

Agent: [Internal: key differentiator = positive reinforcement]
       "I love this. So instead of 'you broke your streak!' it's
        more like 'hey, you showed up 3 times this week, nice!'?"

User: "Yes!! That's exactly it"

Agent: "This is a genuine gap in the market. Most habit apps
        are designed around streaks and shame.

        What kinds of habits would people track?
        Exercise, meditation, or more general stuff?"

User: "Anything really, but especially the small daily things
       people beat themselves up about"

Agent: [Internal: general habits, focus on daily small actions]
       "The small daily things - drinking water, stretching,
        taking breaks. The stuff that matters but doesn't
        get celebrated.

        Here's what I'm hearing:

        🌟 Guilt-free habit tracker
        💪 Celebrates small wins, not streaks
        📊 Tracks daily small habits
        😊 Encouraging, not judgy

        This genuinely feels different. Want to keep exploring,
        or should I capture this as your prompt?"

User: "This is more than I had! Let's capture it"
```

---

### Example 4: Technical User with Specifics

**User knows what they want, agent confirms and fills gaps:**

```
User: "Need a REST API for user management - CRUD operations,
       JWT auth, PostgreSQL backend"

Agent: [Internal: technical user, specific stack already chosen]
       "Got it - user management API with JWT and Postgres.
        What framework are you thinking? Express, Fastify?"

User: "Express, it's what my team knows"

Agent: "Makes sense. For the user model, what fields do you need
        beyond the basics (email, password, name)?"

User: "Role-based access - admin, editor, viewer.
       And created/updated timestamps"

Agent: [Internal: RBAC needed, audit fields]
       "Role-based with three levels, plus timestamps.
        Should admins be able to manage other admins,
        or just editors and viewers?"

User: "Only super-admins can manage admins. Regular admins
       can manage editors and viewers"

Agent: [Internal: super-admin level needed]
       "Got it - four roles then: super-admin, admin, editor, viewer.

        For auth, any specific JWT requirements?
        Refresh tokens? Token expiry time?"

User: "15 min access token, 7 day refresh token"

Agent: "Perfect. Here's the spec:

        🔧 Express REST API
        👤 User CRUD with roles (super-admin → viewer)
        🔐 JWT auth (15min access, 7d refresh)
        🗄️ PostgreSQL backend
        📝 Timestamps on all records

        Anything else, or ready for the prompt?"

User: "Add rate limiting to prevent brute force"

Agent: "Smart - rate limiting added.
        Any specific limits? Like 5 login attempts per minute?"

User: "Yeah 5 per minute sounds good"

Agent: "Got it. Creating your prompt now..."
```

---

### Example 5: User Changes Direction Mid-Conversation

**Agent adapts gracefully:**

```
User: "I want to build a social media scheduler"

Agent: "Nice! For which platforms - Twitter, Instagram, LinkedIn?"

User: "All of them ideally"

Agent: [Internal: multi-platform scheduler]
       "Got it - all the major platforms.
        Is this for personal use or for a marketing team?"

User: "Actually... wait. I think what I really need
       is just a simple way to save tweet drafts"

Agent: [Internal: pivot - scheduler → draft storage]
       "Totally fine to pivot! So more like a tweet draft
        notebook than a full scheduler?"

User: "Yeah, I always think of tweets at random times
       and then forget them"

Agent: "Oh I relate to that! So basically:
        - Capture tweet ideas whenever they hit
        - Save them for later
        - Maybe organize or tag them?

        Is posting them important, or just the saving part?"

User: "Just saving for now. I'll post manually"

Agent: "Way simpler! Here's the new direction:

        📝 Tweet draft saver
        ✨ Capture ideas quickly (mobile-friendly?)
        💾 Save for later review
        🏷️ Maybe tags/categories

        This is actually much more focused.
        Should we go with this?"

User: "Yes! This feels more doable"
```

---

### Key Patterns Across Examples

1. **Start silent** - Let user share before asking questions
2. **One question at a time** - Never double-up
3. **Reflect back** - "So what I'm hearing is..."
4. **Celebrate progress** - "Love it!", "Smart approach!"
5. **Handle pivots gracefully** - "Totally fine to change direction"
6. **Summarize with emojis** - Makes it scannable and friendly
7. **End with clear next step** - "Ready for the prompt?"
