# Maganda

A cosmetic product safety and efficacy assessment app. Scan or search for any skincare, haircare, makeup, body, or nail product and get a personalised safety analysis and efficacy breakdown based on your skin profile — powered by Claude AI.

---

## Prerequisites

- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **Vercel account** — [vercel.com](https://vercel.com) (free tier works)
- **Supabase account** — [supabase.com](https://supabase.com) (free tier works)
- **Anthropic API key** — [console.anthropic.com](https://console.anthropic.com)

---

## 1. Supabase setup

Create a new Supabase project, then open the **SQL Editor** and run the statements below in order.

### Tables

```sql
-- Products catalogue (publicly readable, written by service role only)
CREATE TABLE products (
  id                 UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name               TEXT        NOT NULL,
  brand              TEXT,
  product_type       TEXT,
  raw_ingredients    TEXT,
  parsed_ingredients JSONB,
  source             TEXT,
  source_url         TEXT,
  data_reliability   TEXT,
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now()
);

-- User profiles (one per auth user)
CREATE TABLE profiles (
  id                     UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id                UUID    REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  skin_type              TEXT,
  skin_concerns          JSONB,
  gender_identity        TEXT,
  age_range              TEXT,
  hormone_therapy        TEXT,
  pregnancy_status       TEXT,
  hormonal_conditions    JSONB,
  sun_exposure           TEXT,
  known_reactions        TEXT,
  scalp_type             TEXT,
  hair_concerns          JSONB,
  body_concerns          JSONB,
  nail_concerns          JSONB,
  nail_chemical_exposure BOOLEAN DEFAULT false,
  additional_notes       TEXT,
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now()
);

-- Assessment results (one per product + profile pair)
CREATE TABLE assessments (
  id                     UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id             UUID REFERENCES products(id) ON DELETE CASCADE,
  profile_id             UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  safety_verdict         TEXT,
  safety_summary         TEXT,
  flagged_ingredients    JSONB,
  beneficial_ingredients JSONB,
  unverified_ingredients JSONB,
  efficacy_results       JSONB DEFAULT '{}',
  user_verdict           TEXT,
  chat_history           JSONB DEFAULT '[]',
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  UNIQUE (product_id, profile_id)
);
```

### updated_at triggers

```sql
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER assessments_updated_at
  BEFORE UPDATE ON assessments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

### Postgres functions (used by the API)

```sql
-- Atomically merges one efficacy result into the JSONB column so concurrent
-- concern writes do not overwrite each other.
CREATE OR REPLACE FUNCTION merge_efficacy_result(
  p_product_id UUID,
  p_profile_id UUID,
  p_concern    TEXT,
  p_result     JSONB
) RETURNS void AS $$
BEGIN
  UPDATE assessments
  SET    efficacy_results = efficacy_results || jsonb_build_object(p_concern, p_result),
         updated_at       = now()
  WHERE  product_id = p_product_id
    AND  profile_id = p_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomically appends both a user message and an assistant message to
-- chat_history so no partial writes can occur.
CREATE OR REPLACE FUNCTION append_chat_messages(
  p_assessment_id     UUID,
  p_user_message      JSONB,
  p_assistant_message JSONB
) RETURNS void AS $$
BEGIN
  UPDATE assessments
  SET    chat_history = chat_history || jsonb_build_array(p_user_message, p_assistant_message),
         updated_at   = now()
  WHERE  id = p_assessment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Row Level Security policies

```sql
-- products: anyone can read; only the service role may write
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to products"
  ON products FOR SELECT
  USING (true);

-- profiles: users see and manage only their own row
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = user_id);

-- assessments: users see and manage only their own (via profile)
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own assessments"
  ON assessments FOR SELECT
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own assessments"
  ON assessments FOR INSERT
  WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own assessments"
  ON assessments FOR UPDATE
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own assessments"
  ON assessments FOR DELETE
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );
```

---

## 2. Environment variables

Copy `.env.example` to `.env.local` and fill in all five values:

```bash
cp .env.example .env.local
```

| Variable | Where to find it |
|---|---|
| `VITE_SUPABASE_URL` | Supabase Dashboard → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API → `anon` `public` key |
| `SUPABASE_URL` | Same as `VITE_SUPABASE_URL` |
| `SUPABASE_SERVICE_KEY` | Supabase Dashboard → Project Settings → API → `service_role` key (keep this secret) |
| `ANTHROPIC_API_KEY` | Anthropic Console → API Keys |

> **Note:** `VITE_SUPABASE_URL` and `SUPABASE_URL` are the same value. Vite requires the `VITE_` prefix to expose variables to the browser; the unprefixed versions are used by the Vercel serverless functions.

---

## 3. Install and run locally

```bash
npm install
vercel dev
```

`vercel dev` runs both the Vite frontend and the `api/` serverless functions together on `http://localhost:3000`. It reads `.env.local` automatically.

> You need the [Vercel CLI](https://vercel.com/docs/cli) installed: `npm i -g vercel`

---

## 4. Deploy to production

### Add environment variables in the Vercel dashboard

Before deploying, go to your Vercel project → **Settings → Environment Variables** and add all five variables from `.env.example`.

### Deploy

```bash
vercel --prod
```

### Add your Vercel URL to Supabase auth settings

After deploying, copy your production URL (e.g. `https://your-app.vercel.app`) and add it in:

**Supabase Dashboard → Authentication → URL Configuration**

- **Site URL:** `https://your-app.vercel.app`
- **Redirect URLs:** `https://your-app.vercel.app/**`

This is required for email confirmation and password reset links to work correctly.

---

## Known limitations

- **First-time product searches take 5–10 seconds** — the API calls Claude with web search enabled to find the ingredient list. The result is cached in the database, so subsequent lookups for the same product are instant.
- **Cached searches return in under 1 second** — once a product is in the database, all future lookups skip the Claude call entirely.
- **OCR accuracy depends on image quality** — the photo-to-ingredients feature uses Tesseract.js in the browser. Clear, well-lit photos of ingredient labels work best; blurry or angled photos may produce incomplete results.
