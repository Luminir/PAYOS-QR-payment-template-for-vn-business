# Lucky Money (React + Express)

Simple PayOS lucky-money app:
- React frontend (Vite) on `http://localhost:3000`
- Express backend on `http://localhost:3030`

## 1. Environment variables

Create `.env.local` in project root:

```bash
PAYOS_CLIENT_ID=your_client_id
PAYOS_API_KEY=your_api_key
PAYOS_CHECKSUM_KEY=your_checksum_key

# Base URL for the application 	3030 (or leave blank in render.com, Express will use env PORT)
BASE_URL=http://localhost:3030
API_BASE_URL=your-hosted-url.onrender.com
```

Optional (I have):

```bash
CLIENT_URL=http://localhost:3000
PORT=3030
```

If any required PayOS variable is missing, backend exits on startup with an explicit error.

## 2. Install dependencies

```bash
npm install
```

## 3. Run the app

Run frontend + backend together:

```bash
npm run dev:all
```

Or run separately:

```bash
npm run server
npm run dev
```

## API contract

Endpoint: `POST /create-payment-link`

Request body:

```json
{
  "amount": 10000,
  "quantity": 1
}
```

Rules:
- `amount` must be a positive integer
- `quantity` must be an integer `>= 1`
- `amount` must equal `quantity * 10000`

Responses:
- `200`: `{ "checkoutUrl": "https://..." }`
- `400`: `{ "error": "..." }` for invalid payload
- `500`: `{ "error": "..." }` for PayOS/internal failures

## Frontend behavior

- Frontend sends `amount` + `quantity` to `/create-payment-link`.
- On success, frontend redirects to `checkoutUrl`.
- On error, frontend shows server/network error message inline.
- Success callback uses query params:
  - `?success=true&amount=...&quantity=...`
  - `?canceled=true`

## Scripts

- `npm run dev` - start React app (Vite)
- `npm run server` - start Express API
- `npm run dev:all` - run both frontend and backend
- `npm run build` - production build
- `npm run preview` - preview production build

## Quick checks

```bash
npm run build
node --check server.js
```

HOST ON RENDER: DEFAULT WEB SERVICE

add this
PAYOS_CLIENT_ID → [your value]
PAYOS_API_KEY → [your value]
PAYOS_CHECKSUM_KEY → [your value]
API_BASE_URL=your-hosted-url.onrender.com
