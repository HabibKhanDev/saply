# 🩺 Gumeli Surgical — Medical & Surgical Wholesale Ordering

A very **simple**, mobile-first ordering website for medical & surgical wholesale
businesses. Customers browse products, add to cart and send orders on **WhatsApp**
(no login needed). The owner manages products, stock, orders, profit and printable
bills from a simple **Admin Panel** powered by **Supabase**.

---

## ✨ Features

### Customer side (no registration / no login)
- Home page with logo, store name, **search**, **categories** and product list
- Product cards: image, name, description, sizes, price, discount/offers,
  **Add to Cart** and **Order Now** buttons
- Product detail page with images, size selector, quantity selector and stock status
- Simple cart: increase / decrease quantity, remove items, see total
- One-page checkout form (name, shop, phone, WhatsApp, city, address, notes)
- On **Place Order**:
  1. Order is saved in Supabase with a unique order number (`GS-1001`, `GS-1002` …)
  2. A formatted WhatsApp message is generated and opens automatically
- Floating WhatsApp contact button on every page
- Customers **never** see purchase price, cost or profit

### Admin panel (`/admin` — Supabase Authentication, hidden from customers)
- **Dashboard:** Today's orders, pending, completed, today's sales, total products
- **Product management:** add/edit/delete products, upload multiple images from
  phone, sizes, purchase price, selling price, discount, offer, bonus, stock,
  low-stock alert, Active/Hidden, Featured
- **Automatic profit calculation:** Profit per unit & margin percentage
  (admin only — hidden from customers by database column-level security)
- **Stock management:** IN STOCK / LOW STOCK / OUT OF STOCK; stock is
  automatically reduced when an order is marked Delivered
- **Order history:** filters Today / Yesterday / This Week / This Month / All Time,
  statuses: Pending, Confirmed, Processing, Ready, Delivered, Cancelled
- **Billing:** clean printable invoice using the browser's print (Ctrl/Cmd+P /
  Save as PDF) — no PDF server required
- **Sales history & profit:** total sale, total cost (purchase price × qty),
  profit, with daily totals
- **Settings:** store logo, name, phone, WhatsApp number, address, city, footer text

### Demo medical products
Examination & surgical gloves, face masks, 3/5/10 ml syringes, IV cannula,
scalp vein set, IV infusion set, urine bag, Foley catheter, gauze roll & swabs,
cotton wool, crepe bandage, adhesive tape, alcohol swabs, oxygen cannula,
nebulizer mask, digital thermometer — **no electronics/demo junk**.

---

## 🚀 Run locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

> The app also runs **without** Supabase configuration in **DEMO MODE** using
> sample products stored in your browser (admin demo login shown on `/admin/login`).
> For real use, connect Supabase as explained below.

---

## 🗄️ Supabase setup (database, auth & image storage)

1. Go to <https://supabase.com> and create a free project.
2. Open **SQL Editor → New query**, paste the entire contents of
   [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.
   This creates the tables, security policies, order-number function and the
   public `store-images` storage bucket.
3. Open **Authentication → Users → Add user** and create the admin account
   (this is the `/admin` login email & password).
4. Open **Project Settings → API** and copy:
   - Project URL
   - `anon` public key
5. Create a file named `.env` in the project root (copy from `.env.example`):

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

6. Restart `npm run dev`.

### Security built into the database
- Customers (anonymous users) can only **read active products** and
  **create orders/order items** — they cannot read any orders.
- The `purchase_price` column is protected with **column-level privileges**,
  so it is physically impossible for a customer's browser to read cost/profit data.
- Order items' private cost is filled by a secure database trigger.
- All product/order/settings **writes require an authenticated admin**.

---

## ☁️ Deploy to Netlify

1. Push this repository to GitHub.
2. In Netlify: **Add new site → Import from Git** and select the repository.
3. Build settings (already configured via `netlify.toml`):
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Under **Site settings → Environment variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy. The included `public/_redirects` sends every route to `index.html`
   (required for React Router).

---

## 🧰 Tech stack

- React + Vite (JavaScript / JSX)
- React Router
- Tailwind CSS
- Supabase: PostgreSQL (with RLS + column-level security), Auth, Storage
- WhatsApp `wa.me` deep links
- No custom backend server

---

## 📁 Project structure

```
public/_redirects          # Netlify SPA redirects
netlify.toml               # Netlify build config
.env.example               # Required environment variables
supabase/schema.sql        # Database schema + security (run once)
src/
  lib/        supabase.js, api.js, demo.js, format.js
  context/    AppContext (settings/auth), CartContext
  components/ layout, product card, logo, icons…
  pages/      Home, ProductDetail, Cart, Checkout, OrderSuccess
  pages/admin Login, Dashboard, Products, ProductForm, Orders,
              OrderView (bill), Billing, Sales, Settings, MoreMenu
```

---

## 🔁 Typical flow

**Admin:** Login → Add Product (upload image, prices, stock) → Save →
product appears instantly on the public store.

**Customer:** Open link → Browse/Search → Select size & quantity →
Add to Cart → Checkout → enter details → Place Order → WhatsApp opens.

**Admin:** Receive WhatsApp + saved order → change status → mark Delivered
(stock reduces automatically) → Print Bill → sales & profit saved in history.
