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
      <div className="p-2 flex gap-2">
        <Link to="/" className="[&.active]:font-bold">
          Home
        </Link>{' '}
        <Link to="/schedules" className="[&.active]:font-bold">
          Schedules
        </Link>
      </div>
      <hr />
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})