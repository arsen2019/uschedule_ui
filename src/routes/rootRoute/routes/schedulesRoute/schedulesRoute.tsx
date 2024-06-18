import {createRoute} from "@tanstack/react-router";
import {rootRoute} from "../../rootRoute";
import {useQuery} from "@tanstack/react-query";

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
    const {data: groups, isLoading} = useQuery({
        queryKey: ['schedules'],
        queryFn: () => {
            return fetch('http://127.0.0.1:8000/schedules/$scheduleUuid')
                .then((res) => {
                    if (res.ok) {
                        return res.json();
                    }
                    return [];
                })

        }
    });

    console.log(groups);
}