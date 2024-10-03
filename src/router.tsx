import {rootRoute} from "./routes/rootRoute/rootRoute";
import {indexRoute} from "./routes/rootRoute/routes/indexRoute/indexRoute";
import {createRouter} from "@tanstack/react-router";
import {schedulesRoute} from "./routes/rootRoute/routes/schedulesRoute/schedulesRoute";

const routeTree =
// TODO: find out why it does not work without @ts-ignore
// @ts-ignore
    rootRoute.addChildren([indexRoute, schedulesRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}