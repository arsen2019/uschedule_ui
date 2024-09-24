import React from "react";
import {Card, Collapse, Col, Button, CollapseProps} from "antd";
import {components} from "../../../../../types/api"
import {TLanguage, pageContent} from "../../core/pageContent";

const cardStyle = {
    width: '100%',
    borderRadius:'0px',
    marginBottom: '15px',

}
const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between'
}

export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
export type TDayOfWeek = typeof DAYS_OF_WEEK[number];
export type TCourse = components["schemas"]["Course"]


export const DayCard = ({day, courses, language}: { day: TDayOfWeek, courses: TCourse[], language: TLanguage }) => {

    const items: CollapseProps['items'] = courses.map((course) => {
        return {
            label: (<div style={headerStyle}>
                <span style={{width:'75%'}}>{course.name}</span>
                <span style={{width:'20%'}}>{`${course.start_time}\n${course.end_time}`}</span>
            </div>),

            key: course.uuid,
            children: (
                <>
                    <p>{`${pageContent.Teacher[language]}: ${course.teacher?.first_name}. ${course.teacher?.last_name}`}</p>
                    <p>{`${pageContent.Building[language]}: ${course.building?.name}`}</p>
                    <p>{`${pageContent.Room[language]}: ${course.room?.name}`}</p>
                </>
            )
        }
    })

    return (
        <div>
            <Col>
                <Card style={cardStyle} title={pageContent[day][language]} bordered={true}>
                    {courses.length > 0 ? (
                        <Collapse accordion items={items}/>
                    ) : (
                        <p style={{margin: 0, textAlign: "center"}}>No Courses</p>
                    )}
                </Card>
            </Col>
        </div>

    );
};

