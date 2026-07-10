# Deployment

BuzzyStores is a pnpm workspace. Vercel should install and build it with pnpm, not npm.

## Root Settings

Use the repository root as the Vercel checkout directory and keep these commands:

```bash
pnpm install --frozen-lockfile
pnpm build
```

The root `vercel.json` sets these commands for the repository. Each frontend app should preferably be deployed as a separate Vercel project so web, vendor, and admin releases can have independent domains, environment variables, access controls, preview URLs, and rollback history.

## Public Web App

Create a Vercel project for `apps/web`.

Recommended settings:

```txt
Framework preset: Next.js
Root directory: apps/web
Install command: pnpm install --frozen-lockfile
Build command: pnpm --filter @buzzystores/web build
Output directory: .next
```

Required environment variables:

```txt
NEXT_PUBLIC_API_URL=<public API base URL>
NEXT_PUBLIC_APP_ENV=production
```

## Vendor App

Create a Vercel project for `apps/vendor`.

Recommended settings:

```txt
Framework preset: Next.js
Root directory: apps/vendor
Install command: pnpm install --frozen-lockfile
Build command: pnpm --filter @buzzystores/vendor build
Output directory: .next
```

Required environment variables:

```txt
NEXT_PUBLIC_API_URL=<public API base URL>
NEXT_PUBLIC_APP_ENV=production
```

## Admin App

Create a Vercel project for `apps/admin`.

Recommended settings:

```txt
Framework preset: Next.js
Root directory: apps/admin
Install command: pnpm install --frozen-lockfile
Build command: pnpm --filter @buzzystores/admin build
Output directory: .next
```

Required environment variables:

```txt
NEXT_PUBLIC_API_URL=<public API base URL>
NEXT_PUBLIC_APP_ENV=production
```

## Notes

- Keep the root `pnpm-lock.yaml` committed.
- Do not use `npm run build` on Vercel for this monorepo.
- Deploying the NestJS API is separate from these frontend Vercel projects.
- Server-side data helpers may also need private runtime API variables when the production API is available.
