import {createRootRoute, Link, Outlet} from "@tanstack/react-router";
import {Component} from "react";

class TanStackRouterDevtools extends Component {
    render() {
        return null;
    }
}

export const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})