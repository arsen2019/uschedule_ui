import React from "react";
import { Card, Collapse, Col } from "antd";
import  {components} from "../../../../../types/api"
import exp from "node:constants";


export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
export type TDayOfWeek = typeof DAYS_OF_WEEK[number];
export type Course = components["schemas"]["Course"]


export const DayCard = ({ day, courses, cardStyle }: {day:TDayOfWeek, courses:any, cardStyle: any}) => {
  return (
    <Col key={day}>
      <Card style={cardStyle} title={day} bordered={true}>
        <Collapse accordion>
          {courses.map((course: any) => (
            <Collapse.Panel header={`${course.name} ${course.end_time} - ${course.start_time} `} key={course.uuid}>
              <p>{`Teacher: ${course.teacher.first_name}. ${course.teacher.last_name}`}</p>
                <p>Building: {course.building.name}</p>
              <p>Room: {course.room.name}</p>
            </Collapse.Panel>
          ))}
        </Collapse>
      </Card>
    </Col>
  );
};

