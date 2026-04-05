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

## 🏛️ Architecture

The project is built on **Clean Architecture** with **Domain-Driven Design** principles. The goal is a strict separation of concerns: business rules are completely isolated from infrastructure, frameworks, and delivery mechanisms. Each layer can only depend on layers below it — never upward.

```
src/
├── lib/                   # Zero-dependency utilities (bcrypt, jwt, sharp, markdown)
├── config/                # Config schema + YAML parser
├── domain/
│   ├── errors/            # Domain error classes with HTTP status and schema
│   ├── entity/            # Domain models (types + Zod schemas)
│   ├── service/           # Pure business logic functions
│   └── usecase/           # Application use cases — orchestrate services
├── adapter/
│   ├── gateway/           # Side-effect abstractions (Image, Data, Auth, Crypto)
│   └── repository/        # Database access (Prisma, Redis)
└── delivery/
    └── http/              # Express routers, route decorators, middleware
```

### Layer Breakdown

**`lib/`** — stateless, framework-free utility wrappers. `Lib` is a single injectable class that holds instances of `bcrypt`, `jwt`, `sharp`, `crypto`, `fs`, and the `MarkdownLib` wrapper. Nothing here knows about the domain.

**`domain/entity/`** — pure TypeScript interfaces that mirror Prisma models plus Zod schemas for validation and OpenAPI generation. Entities are defined once and referenced everywhere: `userSchema`, `postSchema`, `tagSchema`, `fileSchema`, `postUserSchema`, `postTagSchema`. `@prisma/client` types are imported only here and in repositories, nowhere else.

**`domain/errors/`** — all domain error classes live here (`NotFoundError`, `ForbiddenError`, `UnauthorizedError`, `InvalidDataError`, etc.). Each class carries a `static httpStatus` and a `static getSchema()` method that returns a Zod schema for OpenAPI documentation. The `BaseError` base class provides a consistent error shape across the entire API.

**`domain/service/`** — stateless functions that contain pure business rules. A service function receives `AbstractServiceParams` (the full dependency container) as the first argument and its own typed params as the second. Services do not know about HTTP, Prisma, or Redis — they interact only through gateway and repository abstractions. Examples: `RegisterService`, `CheckCredentialsService`, `SavePreviewService`.

**`domain/usecase/`** — application-level orchestration. A use case composes one or more services to fulfil a single user-facing operation. Use cases are the only entry point called from the delivery layer. Examples: `CreatePostUseCase` (renders Markdown, creates post, links editor, upserts tags, saves preview); `RegisterUseCase` (registers user, immediately issues tokens).

**`adapter/gateway/`** — abstractions over side-effecting infrastructure:
- `ImageGateway` — Sharp-based image processing (avatar 128×128, post previews in three ratios).
- `DataGateway` — local filesystem operations (read, write, stream, delete files under `data/`).
- `AuthGateway` — JWT signing and verification.
- `CryptoGateway` — bcrypt hashing and comparison.

**`adapter/repository/`** — data access. Each repository extends the generic `PrismaRepository<Model, ModelName, SelectKey>` which wraps `findFirst`, `findMany`, `create`, `update`, `upsert`, `delete` with typed select maps (`'default' | 'basic' | 'full' | 'list'`). `@prisma/client` is only imported inside this layer. `RateLimitRepository` wraps Redis with a sliding-window increment operation.

**`delivery/http/`** — Express-based delivery. Routes are defined declaratively via method decorators (`@Get`, `@Post`, `@Put`, `@Delete`) that attach Zod schemas for body, query, params, and result, plus an optional `errors` array for Swagger. Two additional decorators compose onto handlers: `@Auth` for JWT verification and `@RateLimit` for Redis-backed throttling. The `ApiRouter` collects all route metadata from child routers and builds the full OpenAPI 3.1 document at startup, registering it under `/api/v1/docs` via Swagger UI.

### Dependency Flow

```
delivery → usecase → service → gateway / repository → lib / prisma / redis
```

No layer imports from a layer above it. `@prisma/client` never appears outside `domain/entity` and `adapter/repository`. Business logic never appears inside routers.

### Domain-Driven Design Concepts Applied

- **Entities** — `User`, `Post`, `Tag`, `File` are the core domain objects with identity and lifecycle.
- **Value Objects** — `PostUserRole` (EDITOR), `FileStatus`, `FileType`, `PreviewRatio` represent constrained domain values without independent identity.
- **Aggregates** — `Post` is the aggregate root for `PostUser` (editors) and `PostTag` (ordered tags). Operations on these relations always go through the post's use cases, never directly from the delivery layer.
- **Repositories** — one repository per aggregate root, accessed only from the domain layer.
- **Services** — stateless domain operations that don't naturally belong to a single entity (`CheckCredentialsService`, `GenerateTokensService`).
- **Use Cases (Application Services)** — coordinate domain services and repositories to fulfil a single user intent. Each use case maps 1-to-1 to an API action.

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
