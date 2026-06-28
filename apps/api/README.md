# API

## E2E Tests

The API e2e tests run with `pytest` against a dedicated Postgres database.
The runtime database uses `DATABASE_URL`; tests use only `TEST_DATABASE_URL`.

`DATABASE_URL` accepts standard Postgres URLs from providers like Neon. The API
normalizes them internally for SQLAlchemy's asyncpg driver:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
```

Create your local test env file from the example:

```bash
cp .env.test.example .env.test
```

Set `TEST_DATABASE_URL` to a dedicated remote Postgres database, for example a
Neon test project or branch:

```bash
TEST_DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
```

The test infrastructure accepts standard `postgresql://` URLs from providers
like Neon and normalizes them internally for SQLAlchemy's asyncpg driver.

Run the tests from the repo root:

```bash
pnpm test:api:e2e
```

Or run the API package script directly:

```bash
pnpm --filter @dtm/api test:e2e
```

The test fixtures reset the schema from SQLAlchemy `Base.metadata`, so e2e test
runs do not need Alembic migrations first.

Keep `DATABASE_URL` reserved for runtime, development, and migrations. Do not
point it at the test database. The tests refuse to run if `TEST_DATABASE_URL`
matches `DATABASE_URL`.
