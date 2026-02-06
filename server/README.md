# Financy - Backend

REST API for the Financy personal finance application.

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (or use Docker)

### Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables (copy from `.env.example` if needed):
```bash
cp .env.example .env
```

3. Start PostgreSQL with Docker (recommended):
```bash
npm run db:up
```
If using Docker, update `.env` with:
```
DATABASE_URL=postgresql://financy:financy_pass@localhost:5432/financy
```

4. Run migrations and generate Prisma client:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

### Database Management

```bash
# Start Postgres container
npm run db:up

# Stop and remove container
npm run db:down

# View data in database UI
npx prisma studio
```

## API Endpoints

All endpoints prefixed with `/api`

### Categories
- `GET /categories` - List all categories
- `POST /categories` - Create new category
- `GET /categories/:id` - Get category by ID
- `PUT /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

### Transactions
- `GET /transactions` - List all transactions
- `POST /transactions` - Create new transaction
- `GET /transactions/:id` - Get transaction by ID
- `PUT /transactions/:id` - Update transaction
- `DELETE /transactions/:id` - Delete transaction

### Goals
- `GET /goals` - List all savings goals
- `POST /goals` - Create new goal
- `GET /goals/:id` - Get goal by ID
- `PUT /goals/:id` - Update goal
- `DELETE /goals/:id` - Delete goal

## Example Payloads

**Create Category**
```json
{
  "name": "Salary",
  "type": "INCOME",
  "color": "#00FF00"
}
```

**Create Transaction**
```json
{
  "title": "February Salary",
  "amount": 5000,
  "categoryId": 1,
  "date": "2026-02-06"
}
```

**Create Savings Goal**
```json
{
  "name": "Vacation Fund",
  "targetAmount": 10000,
  "currentAmount": 2500
}
```

## Architecture

- **Controllers**: Handle HTTP requests and responses
- **Services**: Business logic and validation
- **Repositories**: Database access layer
- **Schemas**: Request validation with Zod
- **Middlewares**: Error handling and logging

## Notes

- Single-user local application (no authentication)
- Business rules enforced in services layer
- Transactions require valid categories
- All amounts must be positive
- Cascade delete: Removing categories deletes related transactions
