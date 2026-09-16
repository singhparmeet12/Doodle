# 🖍️ Scribbleverse

> **A whimsical, interactive doodle-universe brand site built with Django 5, GSAP ScrollTrigger, and HTML5 Canvas.**

Scribbleverse is not your typical portfolio template with doodle icons slapped on. It is an imaginative, sketchbook-inspired web experience designed around hand-drawn aesthetics: wobbly lines, wax crayon textures, a signature scroll-tracking doodle line where our mascot **Barnaby** skates down the page as you scroll, an interactive HTML5 canvas drawing pad, a random prompt dispenser, a scrapbook polaroid gallery, a field-notes doodle diary, and a visitor sticky notes wall with built-in moderation.

---

## 🌟 Key Features

1. **Signature Scroll-Tracking Doodle Line & Mascot Follower**:
   - Built with **GSAP 3 + ScrollTrigger**.
   - An organic SVG squiggly path threads down the homepage across each major section.
   - The tip follower element dynamically tracks the stroke's leading coordinate (`getPointAtLength`) so Barnaby literally doodles the line into existence as you scroll down.
   - Respects `prefers-reduced-motion` for accessibility.
2. **"Draw With Me" HTML5 Canvas Studio (`/draw`)**:
   - Silky smooth quadratic bezier curve drawing without jagged joints.
   - Crayon palette with coral red, sunshine yellow, sky blue, grass green, grape purple, and pencil charcoal.
   - Adjustable stroke slider with real-time preview dot.
   - Eraser tool, Undo stack, and Clear canvas action.
   - Responsive touch support (`touchstart`, `touchmove`, `touchend`, `touch-action: none`).
   - One-click **PNG Download** with a celebratory doodle-confetti burst!
   - Accepts URL parameters (e.g. `/draw/?prompt=...`) to immediately challenge the artist with a mission.
3. **Random Doodle Prompt Generator**:
   - Seeded with **55+ whimsical prompts** across 5 categories (Weird Creatures, Cosmic Doodles, Everyday Objects with Faces, Tiny Adventures, and Wobbly Feelings).
   - Interactive unroll-the-scroll reveal animation.
   - Copy prompt button + daily counter + one-click "Draw In Studio" link.
4. **Scrapbook Gallery (`/gallery`)**:
   - Polaroid-style cards with realistic scrapbook tilt angles and tape stickers.
   - Filterable by character tag (*Barnaby*, *Pip the Pencil Bird*, *Sir Reginald Cloud*, *Inky the Octopus*, *Cosmic Scribbles*, *Daily Sketches*).
   - Lightbox modal for ink-level close-up inspection.
   - Built-in Django `Paginator`.
5. **Doodle Diary & Field Notes (`/journal`)**:
   - Whimsical blog entries with custom hand-drawn cover art.
   - Individual post pages styled like handwritten diary pages with torn paper margins and an *"end of this page 📖"* doodle signature block.
6. **Visitor Sticky Notes Wall (`/guestbook`)**:
   - Public collage of approved colorful sticky notes with mood reactions.
   - Real-time submission via AJAX with immediate optimistic feedback.
   - **Security**: Honeypot anti-bot trap, IP-based sliding window rate limiting, and mandatory Django admin moderation (`is_approved=False` by default).
7. **Zero-Flash Dark/Light Theme Switcher**:
   - Light Mode: Warm sketchbook paper (`#FFF9F0`).
   - Dark Mode: Soft chalkboard charcoal (`#232528`) with chalk-bright vibrant accents.
   - Inline `<head>` script guarantees zero theme flickering on page loads.

---

## 🛠️ Tech Stack

- **Backend**: Python 3.11+, Django 5.x (Django Templates Language + Django ORM)
- **Database**: SQLite for local development; automatic PostgreSQL support via `dj-database-url` in production
- **Environment**: `python-decouple` for clean separation of secrets and configuration
- **Static Assets**: WhiteNoise for high-performance static file serving
- **Frontend**: Vanilla JavaScript (ES6+), HTML5 Canvas API
- **Animation**: GSAP 3 + ScrollTrigger (via CDN)
- **Typography**: Google Fonts (*Patrick Hand*, *Caveat*, *Gaegu*, *Nunito*)

---

## 🚀 Quickstart & Local Setup

### 1. Clone & Set Up Virtual Environment

```bash
# Clone the repository and navigate into the folder
cd Doooodle

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows PowerShell:
.venv\Scripts\Activate.ps1
# On macOS / Linux:
source .venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Copy the example environment file:
```bash
cp .env.example .env
```

Default settings in `.env` are preconfigured for local development with SQLite.

### 4. Run Migrations & Seed Content

```bash
python manage.py migrate
python manage.py seed_scribbleverse
```
*The `seed_scribbleverse` command will populate the database with 55 imaginative doodle prompts, 12 gallery doodles with vector art, 4 diary posts, and 6 guestbook stickies.*

### 5. Create Admin Superuser

You can create an admin account interactively:
```bash
python manage.py createsuperuser
```
Or run the automated helper command:
```bash
python manage.py create_admin
```
*(Default helper credentials: Username `barnaby_admin`, Password `wobblycrayons2026`).*

### 6. Run the Development Server

```bash
python manage.py runserver
```
Visit `http://localhost:8000` in your browser.
Django Admin is accessible at `http://localhost:8000/admin/`.

---

## 🧪 Running Automated Tests

Run the complete test suite:
```bash
python manage.py test
```
This tests all 6 apps: models, view rendering, tag filters, API endpoints, honeypot traps, moderation visibility, and rate limiting.

---

## 🛡️ Security Architecture

- **CSRF Protection**: Enforced on every form submission (Guestbook, Newsletter).
- **Honeypot Traps**: Hidden form fields (`hp_website`, `hp_url`) that silently catch and discard automated spam bots.
- **Sliding-Window Rate Limiting**: Per-IP submission throttling implemented via Django's cache framework to prevent flood attacks on unauthenticated endpoints.
- **Content Moderation**: Visitor guestbook entries require an administrator to set `is_approved = True` in `/admin/` before appearing on the public wall.
- **XSS Prevention**: Django templates auto-escape all user inputs. No raw user data is passed to `|safe`.
- **Production Headers**: Prepared with `SECURE_SSL_REDIRECT`, `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE`, `X_FRAME_OPTIONS = 'DENY'`, and strict HTTP Strict Transport Security (HSTS) when `DEBUG=False`.

---

## 🚢 Deployment Guide

### Guide 1: Render / Railway (Recommended Primary Path)

Render and Railway offer standard long-running container environments with persistent disks and managed PostgreSQL databases, making them ideal for full-stack Django applications with media uploads.

#### Step-by-Step Instructions:
1. **Push your code** to GitHub.
2. **Create a Managed PostgreSQL Database** on Render or Railway. Copy the provided database connection string (`DATABASE_URL`).
3. **Create a Web Service**:
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
   - Start Command: `gunicorn scribbleverse.wsgi:application`
4. **Configure Environment Variables**:
   - `SECRET_KEY`: Long random secret string
   - `DEBUG`: `False`
   - `ALLOWED_HOSTS`: `your-service-name.onrender.com,yourdomain.com`
   - `DATABASE_URL`: `postgres://user:password@host:port/dbname`
   - `CSRF_TRUSTED_ORIGINS`: `https://your-service-name.onrender.com,https://yourdomain.com`
   - `SECURE_SSL_REDIRECT`: `True`
   - `SESSION_COOKIE_SECURE`: `True`
   - `CSRF_COOKIE_SECURE`: `True`
5. **Persistent Storage (Optional)**:
   - If allowing file uploads from users, attach a Persistent Disk mounted at `/media` on Render or Railway, or configure an S3/Cloud Storage bucket using `django-storages`.
6. Deploy and run `python manage.py seed_scribbleverse` via the web service shell.

---

### Guide 2: Vercel Python Runtime (Serverless WSGI Alternative)

Vercel provides a serverless Python runtime. While supported via `vercel.json` and `scribbleverse/wsgi.py`, please note the important considerations below.

> [!CAUTION]
> **Ephemeral Filesystem Limitation**:
> Serverless functions on Vercel run in stateless, short-lived containers with an **ephemeral filesystem**. Any file written to local disk (e.g. SQLite database files or user uploads in `/media/`) will disappear as soon as the lambda container spins down.
>
> **Requirements for Vercel Deployment**:
> 1. You **MUST** use an external PostgreSQL database (e.g., Supabase, Neon, or ElephantSQL) passed via the `DATABASE_URL` environment variable.
> 2. You cannot rely on local media file persistence. Use an external cloud storage provider (like AWS S3 or Cloudinary) for uploaded media files.

#### Step-by-Step Instructions:
1. Ensure `vercel.json` and `build_files.sh` exist in the repository root (included in this project).
2. Install the Vercel CLI:
   ```bash
   npm i -g vercel
   ```
3. Link your project:
   ```bash
   vercel
   ```
4. Set Environment Variables in the Vercel Dashboard:
   - `SECRET_KEY`: Random production secret string
   - `DEBUG`: `False`
   - `ALLOWED_HOSTS`: `.vercel.app,yourdomain.com`
   - `DATABASE_URL`: `postgres://user:password@neon-or-supabase-host:port/dbname`
   - `CSRF_TRUSTED_ORIGINS`: `https://your-app.vercel.app`
5. Deploy:
   ```bash
   vercel --prod
   ```

---

## 📁 Project Structure

```
c:\Parmeet\Doooodle\
├── manage.py
├── requirements.txt
├── Procfile
├── runtime.txt
├── vercel.json
├── build_files.sh
├── .env.example
├── .gitignore
├── README.md
├── scribbleverse/
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── apps/
│   ├── core/           # Homepage, About, Draw Studio, Error handlers, Context processor
│   ├── gallery/        # Doodles, Character tags, Lightbox, Pagination
│   ├── journal/        # Diary entries, Field notes, Markdown/HTML body
│   ├── prompts/        # 55+ creative prompts, JSON API, daily counter
│   ├── guestbook/      # Sticky notes wall, Moderation, Honeypot anti-spam
│   └── newsletter/     # Doodle drops email capture
├── static/
│   ├── css/
│   │   ├── base.css        # Tokens, typography, paper grain filter
│   │   ├── components.css  # Buttons, cards, nav, badges, modals, dividers
│   │   └── pages.css       # Scroll-line, drawing pad, prompt card, diary
│   └── js/
│       ├── theme.js            # Zero-flash light/dark theme switcher
│       ├── scroll-line.js      # GSAP ScrollTrigger doodle line & tip follower
│       ├── canvas-draw.js      # HTML5 canvas drawing pad + PNG download
│       ├── prompt-generator.js # Fetch prompt API + unroll card animation
│       ├── guestbook.js        # Form validation, optimistic pinning
│       └── gallery.js          # Scrapbook lightbox inspection
└── templates/
    ├── base.html
    ├── 404.html, 500.html
    ├── partials/       # nav, footer, wobbly_divider, mascot
    ├── core/           # home.html, about.html
    ├── draw/           # index.html
    ├── gallery/        # index.html, detail.html
    ├── journal/        # index.html, detail.html
    └── guestbook/      # index.html
```

---

## 🎨 License

Handcrafted with love, pencil graphite, and way too much coffee for dreamers and doodlers everywhere.
