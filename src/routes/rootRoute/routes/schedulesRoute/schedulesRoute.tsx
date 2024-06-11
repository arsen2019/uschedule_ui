import {createRoute} from "@tanstack/react-router";
import {rootRoute} from "../../rootRoute";

export const schedulesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/schedules',
  component: function Index() {
    return (
      <div className="p-2">
        <h3>Welcome schedules!</h3>
      </div>
    )
  },
})