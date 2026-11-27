# Virar Organics — Online Store, Admin Panel & Mini CRM

A full-stack e-commerce storefront and mini CRM built for **Virar Organics** to replace manual WhatsApp orders and Excel lead tracking with live inventory control, role-based access, and reliable payment webhooks.

---

## Tech Stack

- **Backend**: Node.js, Express.js, SQLite (`better-sqlite3` with WAL mode), JWT (`jsonwebtoken`), `bcryptjs`, `stripe` (TEST mode + built-in signed Test Gateway simulator)
- **Frontend**: React 19, Vite, Tailwind CSS v4, React Router, Lucide Icons
- **Testing**: Node.js `assert` + `fetch` integration suite (`tests/run-tests.js`)

---

## Test Logins (Seeded Sample Data)

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@virarorganics.in` | `Admin@123` | Full access: Dashboard, Products & Stock, Orders, Leads |
| **Sales Executive** | `sales@virarorganics.in` | `Sales@123` | Leads (CRM) & Today's Follow-ups only (403 on Products/Orders) |
| **Customer** | `customer@virarorganics.in` | `Customer@123` | Storefront, Cart, Checkout, My Orders |

Sample data includes **12 products** (including one with `stock = 1` for concurrency testing and one out-of-stock), **5 leads** (with today's follow-ups), and **3 orders**.

---

## How to Run Locally

```bash
# 1. Install root (server) and client dependencies
npm install
npm --prefix client install

# 2. Configure environment variables
cp .env.example .env

# 3. Seed sample data
npm run seed

# 4. Run development servers (Express on :5000, Vite on :5173)
npm run dev

# 5. Run automated integration tests (RBAC, concurrency, webhooks)
npm test
```

### Production Build & Start (Single Server)
```bash
npm run build
npm start
```
In production, Express serves the built React app from `client/dist` on `PORT` (default `5000`).

---

## Database Tables (`server/db.js`)

1. **`users`**: `id`, `name`, `email` (unique), `password_hash`, `role` (`CUSTOMER` | `ADMIN` | `SALES_EXECUTIVE`), `phone`, `created_at`
2. **`products`**: `id`, `name`, `slug` (unique), `category`, `description`, `price`, `unit`, `stock` (`CHECK (stock >= 0)`), `image_url`, `is_active`, `created_at`, `updated_at`
3. **`orders`**: `id`, `order_number` (unique), `user_id`, `customer_name`, `customer_phone`, `shipping_address`, `city`, `pincode`, `payment_method` (`ONLINE` | `COD`), `payment_status` (`UNPAID` | `PAID` | `FAILED` | `REFUNDED`), `status` (`Pending` | `Paid` | `Shipped` | `Delivered` | `Cancelled`), `total_amount`, `gateway_session_id`, `gateway_payment_id`, `paid_at`, `created_at`, `updated_at`
4. **`order_items`**: `id`, `order_id`, `product_id`, `product_name`, `unit_price`, `quantity`, `subtotal`
5. **`leads`**: `id`, `name`, `phone`, `email`, `product_id`, `product_name`, `quantity`, `message`, `status` (`New` | `Contacted` | `Converted` | `Lost`), `notes`, `follow_up_date`, `assigned_to`, `created_at`, `updated_at`
6. **`webhook_events`**: `id`, `event_id` (unique), `provider`, `event_type`, `order_id`, `payload`, `processed_at`

---

## Solutions to Part 3 — Real-World Problems

### Problem 1: Last Item in Stock (Concurrent Checkout Race Condition)
- **Implementation**: `POST /api/orders` in `server/routes/orders.js`
- **How it works**:
  1. The entire checkout runs inside `db.transaction(...).immediate()`, which acquires a SQLite `RESERVED` write lock at the start of the transaction. Two concurrent checkout requests are serialized at the database level.
  2. Instead of reading `stock` in JS and updating it separately, we execute an **atomic conditional update**:
     ```sql
     UPDATE products SET stock = stock - ?, updated_at = datetime('now')
     WHERE id = ? AND is_active = 1 AND stock >= ?
     ```
  3. If `changes === 0`, the transaction throws `InsufficientStockError` (`409 Conflict`) and rolls back cleanly.
  4. As defense-in-depth, the `products.stock` column also enforces `CHECK (stock >= 0)`.
  5. When an order is `Cancelled` by an Admin (`PATCH /api/admin/orders/:id/status`), stock is returned atomically inside a transaction, and reopening a cancelled order is blocked so stock is never returned twice.

### Problem 2: Payment Done, Browser Closed Before Returning + Idempotency
- **Implementation**: `POST /api/webhooks/payment` & `processPaymentWebhook` in `server/routes/payments.js`
- **How it works**:
  1. Orders are created in `Pending` / `UNPAID` state *before* redirecting to the payment gateway.
  2. Even if the customer closes their browser tab immediately after paying, the payment gateway sends an asynchronous server-to-server webhook (`POST /api/webhooks/payment`), verified cryptographically (`stripe.webhooks.constructEvent` for Stripe or `HMAC-SHA256` for the built-in Test Gateway).
  3. **Avoiding marking the same order twice (2-layer idempotency)**:
     - **Layer 1 (`webhook_events` table)**: Every incoming `event_id` is inserted into `webhook_events` (`event_id TEXT UNIQUE`). Duplicate deliveries hit `SQLITE_CONSTRAINT_UNIQUE` and immediately return `200 OK` (`duplicate: true`).
     - **Layer 2 (Conditional state transition)**: Even if a different `event_id` arrives for the same order, the update runs:
       ```sql
       UPDATE orders SET status = 'Paid', payment_status = 'PAID', ...
       WHERE id = ? AND status = 'Pending' AND payment_status != 'PAID'
       ```
       This guarantees an already-paid, shipped, or delivered order is never modified twice.

---

## Part 4 — Written Answers

### a) GoDaddy Domain + Hostinger Hosting/Email Going to Spam
1. **SPF Record**: In GoDaddy DNS, add/verify a `TXT` record (`v=spf1 include:_spf.mail.hostinger.com ~all`) so receiving servers know Hostinger is authorized to send mail for the domain. Ensure there is only **one** SPF record.
2. **DKIM**: Enable DKIM in Hostinger hPanel and copy the DKIM `TXT` / `CNAME` records into GoDaddy DNS so outgoing emails are cryptographically signed.
3. **DMARC**: Add a `_dmarc` `TXT` record (`v=DMARC1; p=quarantine; rua=mailto:admin@domain.com`) to tell mail providers how to handle SPF/DKIM failures.
4. **MX & rDNS/PTR**: Verify MX records point strictly to Hostinger's mail servers (`mx1.hostinger.com`, `mx2.hostinger.com`) and check IP reputation on MXToolbox / Google Postmaster Tools.
5. **Content & Warmup**: Avoid spammy subjects, broken HTML, or missing unsubscribe links, and warm up new mailboxes gradually.

### b) "502 Bad Gateway" at Night During a Sale — Step-by-Step
1. **Confirm scope**: Check if the site is down for everyone (`curl -I https://...`) and check monitoring/uptime alerts.
2. **Inspect reverse proxy (Nginx/Caddy) logs**: Run `tail -n 100 /var/log/nginx/error.log` to see if the upstream Node/app server refused connections (`Connection refused`) or timed out (`upstream timed out`).
3. **Check application process & resources**: Run `pm2 status` / `systemctl status app`, `pm2 logs --lines 100`, `free -m`, and `df -h` to check for uncaught crashes, OOM kills, or a full disk.
4. **Check database / downstream**: Verify DB connections aren't exhausted or locked under sale traffic.
5. **Mitigate & recover**: Restart the crashed app process (`pm2 reload`), temporarily scale workers/memory or enable rate-limiting/caching on heavy read endpoints (like product listings), and verify `/api/health` returns `200 OK`.

### c) What Was Not Finished & What I Would Improve With More Time
1. **PostgreSQL & Redis**: Migrate from SQLite to PostgreSQL (`SELECT ... FOR UPDATE` row locking) and add Redis for rate limiting, session caching, and background job queues (email/WhatsApp notifications).
2. **Email/WhatsApp Notifications**: Trigger automated order confirmation emails (via Resend/Nodemailer) and WhatsApp alerts for new bulk leads.
3. **Image Uploads & Pagination**: Add S3/Cloudinary image upload in the Admin Panel instead of image URLs, plus server-side pagination for large product/order lists.
4. **Payment Timeout Reaper**: Add a cron job to automatically cancel `Pending` online orders that remain unpaid after 15–30 minutes so reserved stock is released back to the store.
