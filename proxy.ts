import { spurs } from "@/lib/auth";

export const proxy = spurs.proxy;

export const config = {
  matcher: ["/account/:path*"],
};
