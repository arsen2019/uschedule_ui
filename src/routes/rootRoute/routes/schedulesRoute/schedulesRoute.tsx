import {createRoute, useLocation} from "@tanstack/react-router";
import {rootRoute} from "../../rootRoute";
import {useQuery} from "@tanstack/react-query";
import React, {useEffect, useRef, useState} from "react";
import {DayCard, DAYS_OF_WEEK, TDayOfWeek, TCourse} from "./components/scheduleConsts";
import {LeftOutlined, RightOutlined} from '@ant-design/icons'
import {Button} from "antd";
import GroupSelect from "../../../../core/components/GroupSelect";
import {Footer} from "../../../../core/components/Footer";
import {LanguageSwitcher} from "../../../../core/components/LanguageSwitcher";
import {translations, TLanguage} from "../../../../core/constants/translations";
import {Group, Lab} from "../indexRoute/indexRoute";
import LabSelect from "../../../../core/components/LabSelect";
import {useGetGroups} from "../../../../core/hooks/useGetGroups";

export const schedulesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/schedules/$scheduleUuid?$lab_uuid',
    component: Schedules
})

const containerStyle = {
    display: "flex",
    height: '100%',
    width: 'calc(100% - 20px)',
    maxWidth: '400px',
    padding: '0 10px',
    marginBottom: '20px'

}


const weekStyle = {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '20px 0',

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
    const scheduleUuid = params["scheduleUuid?$lab_uuid"];
    const selectedLabUuid = location.search.lab_uuid ? new URLSearchParams(location.search).get("lab_uuid") : null;
    const [language, setLanguage] = useState<TLanguage>('hy');

    const {groups} = useGetGroups({language})
    const labs = JSON.parse(localStorage.getItem('labs') || '[]');

    const selectedLab = labs ? labs.find((lab: Lab) => lab.uuid === selectedLabUuid) : null;
    const selectedGroup = groups ? groups.find((group: Group) => group.uuid === scheduleUuid) : null;

    const isInitialRender = useState(true)
    const [weekStartDate, setWeekStartDate] = useState(new Date());
    const [weekIndex, setWeekIndex] = useState(0);
    const dayRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const [highlightedDay, setHighlightedDay] = useState<TDayOfWeek | null>(null);
    const {data: schedule, isLoading, refetch} = useQuery({
        queryKey: ['schedules', weekStartDate, scheduleUuid, language, selectedLabUuid],
        queryFn: () => {
            return fetch(`https://api.schedule.arsgreg.com/schedules/${scheduleUuid}?lab_uuid=${selectedLabUuid}&current_week=${weekStartDate.toISOString()}`, {
                headers: {
                    'Accept-Language': language
                },
            })
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
    useEffect(() => {
        if (selectedGroup) {
            document.title = `${selectedGroup.name} | ${translations.Schedule[language]}`;
        } else {
            document.title = `${translations.Schedule[language]}`;
        }
    }, [selectedGroup]);


    const handleNextWeek = () => {
        setWeekStartDate((prev) => addDays(prev, 7));
        setWeekIndex(prev => prev + 1)
        refetch();
    };

    const handlePreviousWeek = () => {
        setWeekStartDate((prev) => addDays(prev, -7));
        setWeekIndex(prev => prev - 1)
        refetch();
    };


    useEffect(() => {
        if (isInitialRender && schedule) {
            const today = new Date().getDay();
            const currentDay: TDayOfWeek = today === 0 || today === 6 ? 'Monday' : DAYS_OF_WEEK[today - 1];
            setHighlightedDay(currentDay);
            setTimeout(() => {
                requestAnimationFrame(() => {
                    if (dayRefs.current[currentDay]) {
                        dayRefs.current[currentDay]?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start',
                        });
                    }
                });
            }, 100);
        }

    }, [schedule]);


    const getCardClassName = (day: TDayOfWeek) => {
        return highlightedDay === day ? 'highlight-day' : '';
    };

    return (

        <div className="container" style={{...containerStyle, flexDirection: "column"}}>
            <div className="nav"
                 style={{'display': 'flex', 'justifyContent': 'space-between', 'padding': '20px 0', "gap": "20px"}}>
                <div style={{flex: '4 1 0%'}}>
                    <GroupSelect groups={groups} isLoading={isLoading} language={language} selectedGroup={selectedGroup}
                                 selectedLabUuid={selectedLabUuid}></GroupSelect>
                </div>
                <div style={{flex: '4 1 0%'}}>
                    <LabSelect labs={labs} isLoading={isLoading} language={language} selectedLab={selectedLab}
                               selectedGroupUuid={scheduleUuid}></LabSelect>
                </div>
                <div>
                    <LanguageSwitcher selectedLanguage={language} setLanguage={setLanguage}/>
                </div>


            </div>

            <div style={weekStyle}>


                <Button disabled={weekIndex == 0} onClick={handlePreviousWeek}
                        shape='circle' icon={<LeftOutlined/>}></Button>

                <div style={{display: 'flex', alignItems: 'center'}}>
                    <span>{weekIndex ? translations['Next Week'][language] : translations['Current Week'][language]}</span>
                    <img alt={""} style={{paddingLeft: '15px', width:'20px'}}
                         src={`/icons/${weekIndex ? 'hamarich.svg' : 'haytarar.svg'}`}/>
                </div>

                <Button disabled={weekIndex > 0} onClick={handleNextWeek} shape='circle'
                        icon={<RightOutlined/>}></Button>


            </div>
            <div className='card-container' style={{
                overflow: 'auto',
                boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px',
                borderRadius: '2%',
                flexGrow: 1,
                minHeight: 0,

            }}>
                {coursesByDay && DAYS_OF_WEEK.map(day => (
                    <div
                        key={day}
                        ref={(el) => dayRefs.current[day] = el}
                        className={getCardClassName(day)}
                    >
                        <DayCard key={day} day={day} week={weekStartDate.getDate()} courses={coursesByDay[day]} language={language}/>
                    </div>
                ))}

            </div>
            <Footer/>
        </div>


    );
}