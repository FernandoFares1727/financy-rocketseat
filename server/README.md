# Financy - Backend

Simple REST API for the Financy local application.

Quick start

1. Copy `.env.example` to `.env` and update `DATABASE_URL`.

2. Install dependencies:

```bash
npm install
```

3. Generate Prisma client and run migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

4. Start in development:

```bash
npm run dev
```

Run Postgres in Docker (recommended):

```bash
# start database container
npm run db:up

# stop and remove container + volume
npm run db:down
```

If you use Docker, keep `.env` as in `.env.example` (user `financy` / `financy_pass`).

API endpoints (prefix `/api`):

- `GET /api/categories` - list categories
- `POST /api/categories` - create category
- `GET /api/categories/:id` - get category
- `PUT /api/categories/:id` - update category
- `DELETE /api/categories/:id` - delete category

- `GET /api/transactions` - list transactions
- `POST /api/transactions` - create transaction
- `GET /api/transactions/:id` - get transaction
- `PUT /api/transactions/:id` - update transaction
- `DELETE /api/transactions/:id` - delete transaction

Example payloads

Create category:

```json
{ "name": "Salary", "type": "INCOME" }
```

Create transaction:

```json
{ "title": "February Salary", "amount": 5000, "categoryId": 1 }
```

Notes
- Business rules enforced in services: transactions must reference existing categories and amounts must be > 0.
- No authentication; single-user local app.
