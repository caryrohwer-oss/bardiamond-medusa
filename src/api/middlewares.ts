import { defineMiddlewares } from "@medusajs/medusa";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/setup",
      middlewares: [],
    },
    {
      matcher: "/seed",
      middlewares: [],
    },
    {
      // WordPress customer login endpoint - no auth required
      matcher: "/store/auth/login",
      middlewares: [],
    },
  ],
});
