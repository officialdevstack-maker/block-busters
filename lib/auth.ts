import { createSpursNext } from "@spurs/auth/next";

export const spurs = createSpursNext({
  clientId: process.env.SPURS_CLIENT_ID ?? process.env.CLIENT_ID,
  clientSecret: process.env.SPURS_CLIENT_SECRET ?? process.env.CLIENT_SECRET,
});
