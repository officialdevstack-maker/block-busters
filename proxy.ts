import { createSpursProxy } from "@spurs/auth/next";

// (Next 16 renamed the `middleware` convention to `proxy`.)
export const proxy = createSpursProxy();

export const config = {
  matcher: ["/dashboard/:path*"],
};
