# 📝 Blog Test API

A production-ready REST API for a social blogging platform built with **TypeScript**, **Express.js**, **Prisma**, and **PostgreSQL**. Follows Clean Architecture principles with a full feature set including authentication, blog management, image processing, and Swagger documentation.

---

## 🚀 Installation
```bash
# Install dependencies
yarn

# Start infrastructure (PostgreSQL + Redis)
docker compose up -d --force-recreate blog_test_postgres blog_test_redis

# Wait for PostgreSQL to be ready
sleep 30

# Apply database schema
yarn migrate

# Start development server
yarn dev
```

After startup the API is available at `http://localhost:8000/api/v1` and Swagger UI at `http://localhost:8000/api/v1/docs`.

---

## ⚙️ Configuration

The application is configured via two sources:

### `config/config.yml`
```yaml
logger:
  level: debug

http:
  host: 0.0.0.0
  port: 8000
  baseUrl: http://localhost:8000

postgres:
  host: localhost
  port: 5432
  user: postgres
  password: "123"
  db: dev

redis:
  host: localhost
  port: 6379
  user: ""
  password: ""

admin:
  id: 1
  login: admin
  password: admin123

jwt:
  secret: your-super-secret-key
```

### `.env`

Used for Docker Compose and Prisma CLI:
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=123
POSTGRES_DB=dev
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}
```

---

## ✨ Additional Capabilities

### Markdown → HTML
Title, description, and content are accepted in Markdown format and asynchronously rendered to HTML via `markdown-it-async`. Both raw Markdown and rendered HTML are persisted — clients can choose which to display.

### Image Processing
- **Avatars** are automatically cropped and converted to `128×128 PNG` using Sharp.
- **Post previews** are generated in three aspect ratios (`1×1`, `4×3`, `16×9`) at up to `1024px` per dimension, stored as PNG files on disk.

### Cursor Pagination
Both user and post lists use efficient cursor-based pagination (by `id`) to support 10 000+ records without offset degradation.

### Soft Delete
Posts are never hard-deleted. A `deleted` flag (with a database index) hides them from all listings and single-item queries while preserving data integrity.

### Role System
A `PostUser` junction table tracks per-post editor access. The user who creates a post automatically becomes its **EDITOR** and gains edit/delete permissions.

### Tag System
Tags are created via **upsert** (no duplicates). Each post–tag link stores an `order` field for deterministic sorting.

### Rate Limiting
Per-route limits backed by Redis sliding windows protect the API from abuse:
- Registration: 5 requests / hour
- Post creation: 10 requests / minute
- Auth endpoints: 10 requests / 15 minutes

### Swagger UI
Full OpenAPI 3.1 documentation available at `/api/v1/docs` including Bearer JWT authorization, named entity schemas, and per-endpoint error response documentation.

### Cluster Mode
Set `MULTI_PROCESS_MODE=1` and `WORKER_COUNT=N` in `.env` to run the HTTP server across multiple CPU cores via Node.js `cluster`.
