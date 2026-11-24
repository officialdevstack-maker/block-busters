This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Authentication

Block Busters uses Spurs Accounts for sign-in. Add these variables to `.env`.
The client ID and secret can also use the existing `CLIENT_ID` and
`CLIENT_SECRET` variable names.

```env
APP_URL=http://localhost:3000
SPURS_CLIENT_ID=your-spurs-client-id
SPURS_CLIENT_SECRET=your-spurs-client-secret
SPURS_SESSION_SECRET=your-random-session-secret
```

Generate a session secret with
`node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`.
The Next.js adapter sends `${APP_URL}/auth/callback` as the OIDC
`redirect_uri` (the `/auth` route prefix is the adapter default). Register that
exact URL in the Spurs Accounts client's redirect URIs for each environment.
For example, register `http://localhost:3000/auth/callback` for local
development and `https://your-production-domain/auth/callback` in production.
The scheme, hostname, port, and path must match exactly; use the public app
origin for `APP_URL`, not the Spurs Accounts issuer. Use an HTTPS `APP_URL` and
a unique session secret in production.

If Accounts reports that `redirect_uri` is not registered, compare the
`redirect_uri` query parameter in the authorization request with the redirect
URI saved on that client. Update the client's registration to match; do not
disable the exact-match check.

Movie discovery and title pages remain public. Comments and likes require sign-in,
and `/account` redirects signed-out visitors through Spurs SSO. Comment and like
interactions remain in-memory demo behavior and are not persisted.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
