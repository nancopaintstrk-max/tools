# Architecture: Dynamic Template Image Generator

## Overview
A dynamic web application that allows users to create customized images based on predefined templates for special occasions (e.g., Birthdays, Wedding Anniversaries, Onam, Vishu). The application features a public-facing image generator and an admin portal for uploading and managing templates.

## Tech Stack
- **Frontend:** React (Next.js App Router recommended for Vercel deployment and SEO).
- **Styling:** Vanilla CSS & Tailwind CSS v4, adhering strictly to the **Bento — Style Reference**.
- **Backend / Database / Storage:** Supabase (PostgreSQL for data, Supabase Storage for template assets, Supabase Auth for the admin portal).
- **Hosting:** Vercel (seamless Next.js integration).
- **Image Generation:** HTML5 Canvas API for dynamic image manipulation on the client-side.

## Design System (Bento Theme)
The application will strictly adhere to the `DESIGN.md` guidelines:
- **Theme:** Mixed pop-art bento box. High-contrast and confident.
- **Typography:** `Linksans` (Fallback: Inter) - Extremely tight tracking, dense headlines.
- **Colors:** Linen Canvas (`#f3f3f1`) base, Lime Spark (`#d2e823`) primary CTA, Maroon Plate (`#780016`), Cobalt Band (`#2665d6`), etc.
- **Elevation:** Flat design with no shadows. Elevation is achieved solely through 2-3px solid `#000000` borders on all shapes.
- **Layout:** Full-bleed colored banding for sections, rounded bento-grid cards (32px-64px radius), pill-shaped buttons (99px).

## Core Features & Workflow

### 1. User Facing Generator (Public)
- **Template Gallery:** Bento-style grid of available templates filtered by categories (Festivals, Birthdays, etc.).
- **Dynamic Editor:**
  - Select a template as the base canvas.
  - Form inputs for dynamic text (names, dates, wishes).
  - Optional image upload for user photos (to overlay on the template).
  - Real-time preview of the generated image.
- **Export/Download:** Ability to download the customized image as PNG/JPEG.

### 2. Admin Portal (Protected)
- **Authentication:** Supabase Auth to restrict access to admins.
- **Template Management:**
  - Upload base image templates to Supabase Storage.
  - Define template metadata (Category, Name).
  - Configure editable regions/fields (e.g., X/Y coordinates for text, font size, color, allowed photo slots). This metadata is stored in the Supabase Database.
- **Category Management:** Create, update, or delete occasion categories.

## Database Schema (Supabase)

### `categories`
- `id` (uuid, PK)
- `name` (varchar) - e.g., 'Birthday', 'Onam'
- `slug` (varchar, unique)
- `created_at` (timestamp)

### `templates`
- `id` (uuid, PK)
- `category_id` (uuid, FK -> categories)
- `name` (varchar)
- `image_url` (text) - Supabase Storage URL for the base template image.
- `metadata` (jsonb) - Configuration for dynamic fields. Example:
  ```json
  {
    "fields": [
      { "name": "userName", "type": "text", "x": 100, "y": 200, "fontSize": 24, "color": "#ffffff" },
      { "name": "userPhoto", "type": "image", "x": 50, "y": 50, "width": 100, "height": 100 }
    ]
  }
  ```
- `is_active` (boolean)
- `created_at` (timestamp)

## Infrastructure Architecture

1. **Client (Browser):** Requests the frontend from Vercel. Interacts with the Canvas API for real-time preview and export.
2. **Vercel (Hosting):** Serves the Next.js frontend (React). Handles Server-Side Rendering (SSR).
3. **Supabase (Backend as a Service):**
   - **Postgres:** Stores metadata.
   - **Storage:** Stores raw template files.
   - **Auth:** Secures the admin routes.
