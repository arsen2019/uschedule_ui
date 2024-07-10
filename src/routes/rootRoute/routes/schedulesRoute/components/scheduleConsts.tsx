import React from "react";
import {Card, Collapse, Col, Button, CollapseProps} from "antd";
import {components} from "../../../../../types/api"

const cardStyle = {
    width: '100%',
    maxWidth: '350px',
    marginBottom: '15px',

}
const headerStyle = {
    display:'flex',
    justifyContent:'space-between'
}

export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
export type TDayOfWeek = typeof DAYS_OF_WEEK[number];
export type TCourse = components["schemas"]["Course"]


export const DayCard = ({day, courses}: { day: TDayOfWeek, courses: TCourse[] }) => {

    const items: CollapseProps['items'] = courses.map((course) => {
        return {
            label: (<div style={headerStyle}>
                        <span>{course.name}</span>
                        <span>{course.start_time} - {course.end_time}</span>
                    </div>),

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
                     {courses.length > 0 ? (
                        <Collapse accordion items={items} />
                    ) : (
                        <p style={{margin:0, textAlign: "center"}}>No Courses</p>
                    )}
                </Card>
            </Col>
        </div>

    );
};

