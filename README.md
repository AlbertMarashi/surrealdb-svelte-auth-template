# SurrealDB Authentication Boilerplate

A full-stack authentication boilerplate using SvelteKit and SurrealDB. This template provides a complete authentication system with user registration, login, and session management.

## Features

- 🔑 Login system with JWT session cookiess
- 📝 User registration with email and password
- 🔒 Password hashing using bcrypt
- 📚 Globally available "singleton" database client for server-side and client-side usage
- 🔒 Database is request-isolated in the server, so different users get a unique database connection and client per request
- 🔗 Real-time database connections using WebSocket

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [SurrealDB](https://surrealdb.com/) and [Surrealist](https://surrealdb.com/surrealist), optionally
- [pnpm](https://pnpm.io/), [npm](https://www.npmjs.com/), or [Bun](https://bun.sh/)

## Getting Started

1. Clone this repository:
```bash
git clone https://github.com/AlbertMarashi/surrealdb-svelte-auth-template.git
cd surrealdb-svelte-auth-template
```

2. Install dependencies:
```bash
npm install
# or
bun install
# or
pnpm install
```

3. Copy the environment file and configure it:
```bash
cp .env.example .env
```

4. Generate a secure AUTH_SECRET:

This will be used to sign and verify JWT tokens by your server, and must be shared with your database so that the database can verify the tokens.

```bash
openssl rand -hex 32
```

5. Update your `.env` file with the generated secret and your SurrealDB configuration:
```env
AUTH_SECRET=SHARED_SECRET_HERE
PUBLIC_SURREAL_NAMESPACE=development
PUBLIC_SURREAL_DATABASE=mydb
PUBLIC_SURREAL_HOST=ws://localhost:8000
SURREAL_USER=root
SURREAL_PASSWORD=root
```

6. Start SurrealDB:
```bash
surreal start --user root --pass root --allow-guests memory
# --allow-guests allows the database to be accessed by unauthenticated users
```

6. Initialize the database schema:
```bash
surreal import --conn http://localhost:8000 --user root --pass root --ns development --db mydb schema.surql
```

1. Configure the database access via Surrealist or the Surreal CLI
```surql
DEFINE ACCESS OVERWRITE users ON DATABASE 
    TYPE RECORD 
    WITH JWT 
    ALGORITHM HS256 
    KEY "YOUR_GENERATED_SECRET" 
    DURATION FOR TOKEN 1w;
```

1. Start the development server:
```bash
pnpm dev
# or
npm run dev
# or
bun run dev
```

## Project Structure

- `/src/routes` - SvelteKit routes and API endpoints
  - `+layout.ts` - Gets the user from the `+layout.server.ts` local data, and makes it available to all sub-routes
  - `+layout.server.ts` - Gets the user from the `event.locals.user` and passes it to the `+layout.ts` component
  - `+page.ts` - Loads the currently active user from the database so that it can be used in the `+page.svelte` component
  - `+page.svelte` - The main page component, which includes the login form and authentication state
  - `login/+server.ts` - A login API endpoint, which will also set the JWT cookie for future requests
- `/src/lib` - Sveltekit `$lib` alias directory
  - `database.ts` - SurrealDB client and database configuration (a user-authenticated database client, universally available on the server and client)
  - `utils` - Utility functions and types
    - `cookies.ts` - Cookie utilities (for setting and getting cookies)
    - `jwt.ts` - JWT utilities (for signing and verifying tokens)
  - `request_data_store.ts` - Request data store for server-side usage
  - `admin_db.ts` - A "root" authenticated database client, for full-permission sensitive operations
  - `database.ts` - A user-authenticated/unauthenticated database client for database-as-a-service paradigm usage
- `/src/hooks.server.ts` - Server-side hooks for authentication
- `schema.surql` - SurrealDB schema definition


## Usage

### Global Database Client usage
We use the [`safe-ssr`](https://npmjs.com/safe-ssr) package to provide request-level data isolation.

Using the database globally, eg inside of a load function:
```ts
import { user_db } from "$lib/database"

export async function load({ data }) {
    // load the global server-side database client
    const db = await user_db()

    // query the database
    const [records] = await db.query("SELECT * FROM some_record")

    return {
        records
    }
}
```

Or inside of `.svelte` components:
```svelte
<script lang="ts">
    import { user_db } from "$lib/database"

    let records: string[] = $state([])

    async function load_records() {
        const db = await user_db()

        [records] = await db.query("SELECT VALUE id FROM record")
    }

    async function create_record() {
        const db = await user_db()

        await db.query("CREATE record")

        await do_something_with_db()
    }
</script>
<button onclick={load_records}>
    Load Records
</button>
<button onclick={create_record}>
    Create Record
</button>
{#each records as record}
    <p>{record}</p>
{/each}
```

Read more about [`safe-ssr`](https://npmjs.com/safe-ssr)

## Authentication Flow

1. **Registration**: Users can register with email, password, and name
2. **Login**: Users receive a JWT token stored in cookies
3. **Session**: Token is verified on each request
4. **Protected Routes**: Access control based on authentication state

## API Endpoints

- `POST /register` - Create a new user account
- `POST /login` - Authenticate and receive a session token
- `GET /` - Home page with authentication state

## Development

To run the project in development mode:

```bash
npm run dev
# or
bun run dev
# or
pnpm dev
```

## License

MIT

## Acknowledgments

- [SvelteKit](https://kit.svelte.dev/)
- [SurrealDB](https://surrealdb.com/)
- [JOSE](https://github.com/panva/jose)