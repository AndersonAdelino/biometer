# Specification: BioMeter – Espelho Biológico

Based on PRD (`docs/PRD.md`) and technical analysis.

## 1. Vision & Architecture
BioMeter is a high-interactivity PWA for tracking biological needs with real-time decay mechanics.
The architecture follows a "Local First / ServerSync" approach to ensure instant responsiveness.

### Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS + Shadcn UI (Neo-Dark/Matrix Aesthetic suggested by user preference in history, but PRD says "Clean/Minimalist" - we will aim for **Clean High-Tech**).
- **Backend:** Supabase (Postgres, Auth, Realtime).
- **State Management:** Zustand (Client-side decay state).
- **Payments:** Stripe Checkout.
- **Push:** OneSignal.

## 2. Component Architecture (Shadcn & Reusability)

We will use **Shadcn UI** as the core library.

### Core Shadcn Components to Install
Run the following to initialize the base system:
```bash
npx shadcn@latest add progress card button slider dialog input sonner label separator sheet skeleton
```

| Component | Usage |
|-----------|-------|
| `progress` | The visual decay bars (Core). |
| `card` | Container for each status item. |
| `slider` | Input for defining decay rates in hours. |
| `sonner` | Toast notifications for critical alerts. |
| `dialog` | Forms for creating/editing stats. |
| `sheet` | Settings menu and profile management. |

### Reusable Patterns & Kits
Instead of building from empty files, we leverage these patterns:

1.  **Subscription/Auth Foundation**:
    *   *Source*: Vercel's `nextjs-subscription-payments` or `supa-stripe-stack`.
    *   *Usage*: We will reuse the pattern for synchronizing Supabase `profiles.is_pro` with Stripe webhooks.

2.  **Decay Logic (Lazy Calculation)**:
    *   *Concept*: Instead of a server cron updating every second, we calculate value **on-read**.
    *   *Formula*: `CurrentValue = 100 - (DecayRatePerHour * (Now - LastRefillTimestamp))`
    *   *Client Implementation*: A `requestAnimationFrame` loop in a custom hook (`useDecayTicker`) u
    pdates the visual width, while the database only stores the static `last_refill` time.

## 3. Database Schema (Supabase)

### `public.profiles`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | PK, references `auth.users` |
| `email` | text | |
| `is_pro` | boolean | Default: `false`. Governs the >3 bar limit. |
| `stripe_customer_id` | text | Linked to Stripe. |
| `subscription_opt_in` | boolean | For marketing emails. |

### `public.stats`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | PK, default `gen_random_uuid()` |
| `user_id` | uuid | FK -> `profiles.id` |
| `name` | text | e.g., "Caffeine", "Social Battery" |
| `decay_rate` | float | Percentage lost per hour (e.g., 10.0 = 10% per hour) |
| `last_refill` | timestamptz | The anchor time used to calculate current level. |
| `color` | text | HEX code (e.g., `#22c55e`). |
| `icon_key` | text | Lucide icon name (Pro feature). |
| `notify_threshold` | int2 | Optional override (default 15). |

## 4. File Structure (Next.js App Router)

```
/src
  /app
    /(marketing)
      /page.tsx           # Landing Page
    /(app)
      /dashboard
        /page.tsx         # Main "Game" Interface
      /settings
        /page.tsx
      /layout.tsx         # Auth Guard & Shell
    /api
      /webhooks
        /stripe           # Stripe Listener
        /cron             # Optional: Critical status checks (Server-side push)
  /components
    /bio-meter
      /status-card.tsx    # Single meter component
      /decay-engine.tsx   # Client-side logic provider
      /add-status-dialog.tsx
    /ui                   # Shadcn components
  /lib
    /supabase             # Client/Server creators
    /utils.ts             # Math helpers for decay
    /hooks
      /use-decay.ts       # Vital hook for smooth animation
```

## 5. Implementation Roadmap

### Phase 1: Core Mechanics (The "Game")
1.  Setup Next.js + Shadcn.
2.  Create `StatusCard` with `useDecay` hook.
3.  Implement the logical decay formula (Math only, no DB yet).
4.  Add "Refill" interaction (Click -> Reset `lastRefill` -> Animates to 100%).

### Phase 2: Persistence (The "Save")
1.  Setup Supabase + Auth.
2.  Create `stats` table.
3.  Sync "Refill" actions to Supabase: `UPDATE stats SET last_refill = now() WHERE id = ...`.
4.  Load initial state from DB.

### Phase 3: The Business (The "Pro")
1.  Implement `is_pro` check in the "Add Status" dialog.
2.  If `count >= 3` and `!is_pro`, show Upgrade Modal.
3.  Integrate Stripe Checkout button.

## 6. Logic Snippets

**Decay Calculation (TypeScript):**
```typescript
// src/lib/decay.ts
export function calculateCurrentValue(lastRefill: Date, decayRatePerHour: number): number {
  const now = new Date();
  const diffInHours = (now.getTime() - lastRefill.getTime()) / (1000 * 60 * 60);
  const lostParams = diffInHours * decayRatePerHour;
  return Math.max(0, 100 - lostParams);
}
```

**Custom Hook:**
```typescript
// src/components/bio-meter/use-decay.ts
export function useDecay(lastRefill: Date, rate: number) {
  const [value, setValue] = useState(100);

  useEffect(() => {
    const tick = () => {
      setValue(calculateCurrentValue(lastRefill, rate));
      requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [lastRefill, rate]);

  return value;
}
```
