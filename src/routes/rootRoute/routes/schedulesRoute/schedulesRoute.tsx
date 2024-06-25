import {createRoute} from "@tanstack/react-router";
import {rootRoute} from "../../rootRoute";
import {useQuery} from "@tanstack/react-query";
import React, {useEffect, useState} from "react";
import {DayCard, DAYS_OF_WEEK, TDayOfWeek, Course} from "./components/scheduleConsts";

export const schedulesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/schedules/$scheduleUuid',
    component: Schedules
})

const containerStyle = {
    height: '100%',
    width: '100%',
    margin: '10px',
}

const cardStyle = {
    width: '100%',
    maxWidth: '350px',

}



function Schedules() {
    // TODO: find out why does not work without @ts-ignore
    // @ts-ignore
    const params = schedulesRoute.useParams();
    const {scheduleUuid} = params;
    const {data: schedule, isLoading} = useQuery({
        queryKey: ['schedules'],
        queryFn: () => {
            return fetch(`http://127.0.0.1:8000/schedules/${scheduleUuid}`)
                .then((res) => {
                    if (res.ok) {
                        return res.json();
                    }
                    return [];
                })

        }
    });

    const [coursesByDay, setCoursesByDay] = useState<Record<TDayOfWeek, Course[]>>();

    useEffect(() => {
        if (schedule) {
            setCoursesByDay(DAYS_OF_WEEK.reduce((output, dayOfWeek) => {
                output[dayOfWeek] = schedule.filter((course: Course) => course.day_of_week === dayOfWeek);
                return output;
            }, {} as Partial<Record<TDayOfWeek, Course[]>>) as Record<TDayOfWeek, Course[]>)
        }

    }, [schedule]);


    return (
        <div className="container" style={containerStyle}>

            {coursesByDay && DAYS_OF_WEEK.map(day => (
                <DayCard key={day} day={day} courses={coursesByDay[day]} cardStyle={cardStyle}/>
            ))}
        </div>
    );
}