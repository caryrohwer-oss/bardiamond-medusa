import { defineMiddlewares } from "@medusajs/medusa";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/setup",
      middlewares: [],
    },
    {
      matcher: "/admin/seed-products",
      middlewares: [],
    },
  ],
});
