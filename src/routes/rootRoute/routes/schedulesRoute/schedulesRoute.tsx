import {createRoute} from "@tanstack/react-router";
import {rootRoute} from "../../rootRoute";

export const schedulesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/schedules/$scheduleUuid',
  component: Schedules
})

function Schedules() {
    // TODO: find out why does not work without @ts-ignore
    // @ts-ignore
    const params = schedulesRoute.useParams();
    console.log(params)
    return (
      <div className="p-2">
        <h3>Welcome schedules!</h3>
      </div>
    )
  }