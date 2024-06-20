import {createRoute} from "@tanstack/react-router";
import {rootRoute} from "../../rootRoute";
import {useQuery} from "@tanstack/react-query";
import {Flex, Select, Card, Collapse} from "antd";
import Title from "antd/lib/typography/Title";
import React, {useEffect, useState} from "react";

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


const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
type TDayOfWeek = typeof DAYS_OF_WEEK[number];

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

    // TODO: replace any with schedule type
    const [coursesByDay, setCoursesByDay] = useState<Record<TDayOfWeek, any>>();

    useEffect(() => {
        if (schedule) {
            setCoursesByDay(DAYS_OF_WEEK.reduce((output, dayOfWeek) => {
                output[dayOfWeek] = schedule.filter((course: any) => course.day_of_week === dayOfWeek);
                return output;
            }, {} as Partial<Record<TDayOfWeek, any>>) as Record<TDayOfWeek, any>)
        }

    }, [schedule]);


    return (
        <div className="container" style={containerStyle}>

            {coursesByDay && DAYS_OF_WEEK.map(day => (
                <div className="day-card" key={day}>

                    <Card style={cardStyle} title={day} bordered={true}>
                        <Collapse accordion>
                            {coursesByDay[day].map((course: any) => (
                                <Collapse.Panel header={`${course.name} ${course.start_time} : ${course.end_time}`} key={course.uuid}>
                                    <p>Teacher: {course.teacher.first_name} {course.teacher.last_name}</p>
                                    <p>Building: {course.building.name}</p>
                                    <p>Room: {course.room.name}</p>

                                </Collapse.Panel>
                            ))}
                        </Collapse>
                    </Card>


                </div>
            ))}
        </div>
    );
}