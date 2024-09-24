import {createRoute, useLocation} from "@tanstack/react-router";
import {rootRoute} from "../../rootRoute";
import {useQuery} from "@tanstack/react-query";
import React, {useEffect, useRef, useState} from "react";
import {DayCard, DAYS_OF_WEEK, TDayOfWeek, TCourse} from "./components/scheduleConsts";
import {LeftOutlined, RightOutlined} from '@ant-design/icons'
import {Button} from "antd";
import GroupSelect from "../core/groupSelect";
import {Footer} from "../core/footer";
import {LanguageSwitcher} from "../core/languages";
import {pageContent, TLanguage} from "../core/pageContent";
import {Group} from "../indexRoute/indexRoute";

export const schedulesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/schedules/$scheduleUuid',
    component: Schedules
})

const containerStyle = {
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
    const {scheduleUuid} = params;
    // const groups = location.search.groups ? JSON.parse(decodeURIComponent(location.search.groups)) : [];
    const groups = JSON.parse(localStorage.getItem('groups') || '[]');
    // const selectedGroup = location.search.selectedGroup ? JSON.parse(decodeURIComponent(location.search.selectedGroup)) : null;
    const selectedGroup = groups ? groups.find((group: Group) => group.uuid === scheduleUuid) : null;

    const [weekStartDate, setWeekStartDate] = useState(new Date());
    const [weekIndex, setWeekIndex] = useState(0);
    const [language, setLanguage] = useState<TLanguage>('hy');
    const [loading, setLoading] = useState<boolean>()

    const dayRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const [highlightedDay, setHighlightedDay] = useState<TDayOfWeek | null>(null);


    const {data: schedule, isLoading, refetch} = useQuery({
        queryKey: ['schedules', weekStartDate, scheduleUuid, language],
        queryFn: () => {
            return fetch(`https://api.schedule.arsgreg.com/schedules/${scheduleUuid}?current_week=${weekStartDate.toISOString()}`, {
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
            document.title = `${selectedGroup.name} | ${pageContent.Schedule[language]}`;
        } else {
            document.title = `${pageContent.Schedule[language]}`;
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

    const isInitialRender = useRef(true); // To track the initial load

    useEffect(() => {
        if (isInitialRender && schedule) {
            const today = new Date().getDay();
            const currentDay: TDayOfWeek = today === 0 || today === 6 ? 'Monday' : DAYS_OF_WEEK[today - 1]; // Show Monday if weekend
            setHighlightedDay(currentDay);
            console.log("I'm here")
            console.log("1.", dayRefs.current,"2.",  dayRefs.current[currentDay])
            // Scroll to the current day
           setTimeout(() => {
                if (dayRefs.current[currentDay]) {
                    dayRefs.current[currentDay]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 0);
        }

    }, [schedule]);

    useEffect(() => {
        if (highlightedDay) {
            const timeoutId = setTimeout(() => setHighlightedDay(null), 3000);
            return () => clearTimeout(timeoutId);
        }
    }, [highlightedDay]);

    const getCardClassName = (day: TDayOfWeek) => {
        return highlightedDay === day ? 'highlight-day' : '';
    };

    return (
        <div>
            <div className="container" style={containerStyle}>
                <div className="nav"
                     style={{'display': 'flex', 'justifyContent': 'space-between', 'padding': '20px 0'}}>
                    <GroupSelect groups={groups || []} isLoading={isLoading} language={language}
                                 selectedGroup={selectedGroup}></GroupSelect>
                    <LanguageSwitcher selectedLanguage={language} setLanguage={setLanguage}/>
                </div>

                <div style={weekStyle}>


                    <Button disabled={weekIndex == 0} onClick={handlePreviousWeek}
                            shape='circle' icon={<LeftOutlined/>}></Button>

                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <span>{weekIndex ? pageContent['Next Week'][language] : pageContent['Current Week'][language]}</span>
                        <img style={{paddingLeft: '15px'}}
                             src={`/icons/${weekIndex ? 'hamarich.png' : 'haytarar.png'}`}/>
                    </div>

                    <Button disabled={weekIndex > 0} onClick={handleNextWeek} shape='circle'
                            icon={<RightOutlined/>}></Button>


                </div>
                <div className='card-container' style={{
                    height: '70%',
                    overflow: 'auto',
                    boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px',
                    borderRadius: '2%'
                }}>
                    {coursesByDay && DAYS_OF_WEEK.map(day => (
                        <div
                            key={day}
                            ref={(el) => dayRefs.current[day] = el}
                            className={getCardClassName(day)}
                        >
                            <DayCard key={day} day={day} courses={coursesByDay[day]} language={language}/>
                        </div>
                    ))}

                </div>
                <Footer/>
            </div>

        </div>

    );
}