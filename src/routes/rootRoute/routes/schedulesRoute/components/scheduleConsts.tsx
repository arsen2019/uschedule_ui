import React from "react";
import {Card, Collapse, Col, Button, CollapseProps} from "antd";
import {components} from "../../../../../types/api"


export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
export type TDayOfWeek = typeof DAYS_OF_WEEK[number];
export type TCourse = components["schemas"]["Course"]


export const DayCard = ({day, courses, cardStyle}: { day: TDayOfWeek, courses: TCourse[], cardStyle: any }) => {
    const items: CollapseProps['items'] = courses.map((course) => {
        return {
            label: `${course.name} ${course.start_time} - ${course.end_time} `,
            key: course.uuid,
            children: (
                <>
                    <p>{`Teacher: ${course.teacher?.first_name}. ${course.teacher?.last_name}`}</p>
                    <p>Building: {course.building?.name}</p>
                    <p>Room: {course.room?.name}</p>
                </>
            )
        }
    })

    return (
        <div>
            <Col>
                <Card style={cardStyle} title={day} bordered={true}>
                    <Collapse accordion items={items}/>
                </Card>
            </Col>
        </div>

    );
};

