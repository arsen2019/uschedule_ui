import {createRoute, useLocation} from "@tanstack/react-router";
import {rootRoute} from "../../rootRoute";
import {useQuery} from "@tanstack/react-query";
import React, {useEffect, useState} from "react";
import {DayCard, DAYS_OF_WEEK, TDayOfWeek, TCourse} from "./components/scheduleConsts";
import {LeftOutlined, RightOutlined} from '@ant-design/icons'
import {Button} from "antd";
import GroupSelect from "../core/groupSelect";

export const schedulesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/schedules/$scheduleUuid',
    component: Schedules
})

const containerStyle = {
    height: '100%',
    width: '100%',
    maxWidth:'350px',
    padding:'10px'
}


const weekStyle={
    display:'flex',
    justifyContent:'space-around',
    alignItems:'center',
    padding: '10px',

}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function Schedules() {
    // TODO: find out why does not work without @ts-ignore
    // @ts-ignore
    const params = schedulesRoute.useParams();
    const location = useLocation()
    const {scheduleUuid} = params;
    const groups = location.search.groups ? JSON.parse(location.search.groups) : []
    const selectedGroup = location.search.selectedGroup ? JSON.parse(location.search.selectedGroup) : null;
    const date = new Date();
    const [weekStartDate, setWeekStartDate] = useState(new Date());

    const {data: schedule, isLoading, refetch} = useQuery({
        queryKey: ['schedules', weekStartDate, scheduleUuid],
        queryFn: () => {
            return fetch(`http://127.0.0.1:8000/schedules/${scheduleUuid}?current_week=${weekStartDate.toISOString()}`)
                .then((res) => {
                    if (res.ok) {
                        return res.json();
                    }
                    return [];
                })

        }
    });

    const [coursesByDay, setCoursesByDay] = useState<Record<TDayOfWeek, TCourse[]>>();

    useEffect(() => {
        if (schedule) {
            setCoursesByDay(DAYS_OF_WEEK.reduce((output, dayOfWeek) => {
                output[dayOfWeek] = schedule.filter((course: TCourse) => course.day_of_week === dayOfWeek);
                return output;
            }, {} as Partial<Record<TDayOfWeek, TCourse[]>>) as Record<TDayOfWeek, TCourse[]>)
        }

    }, [schedule]);



  const handleNextWeek = () => {
    setWeekStartDate((prev) => addDays(prev,7));
    refetch();
  };

  const handlePreviousWeek = () => {
    setWeekStartDate((prev) => addDays(prev,-7));
    refetch();
  };
    return (
        <div className="container" style={containerStyle}>
            <GroupSelect groups={groups || []} isLoading={isLoading} selectedGroup={selectedGroup}></GroupSelect>
            <div style={weekStyle}>
                <Button onClick={handlePreviousWeek} shape='circle' icon={<LeftOutlined/>}></Button>
                <span>{weekStartDate.toLocaleDateString()}</span>
                <Button onClick={handleNextWeek} shape='circle' icon={<RightOutlined/>}></Button>
            </div>

            {coursesByDay && DAYS_OF_WEEK.map(day => (
                <DayCard key={day} day={day} courses={coursesByDay[day]}/>
            ))}
        </div>
    );
}