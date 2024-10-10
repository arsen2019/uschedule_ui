import {createRoute, useNavigate} from "@tanstack/react-router";
import {rootRoute} from "../../rootRoute";
import React, {useEffect, useState} from "react";
import Title from "antd/lib/typography/Title";
import {components} from "../../../../types/api"
import GroupSelect from "../core/groupSelect"
import {Footer} from "../core/footer";
import {LanguageSwitcher} from "../core/languages";
import {TLanguage, pageContent} from "../core/pageContent";
import LabSelect from "../core/labSelect";
import {useGetGroups} from "../core/hooks/useGetGroups";
import {useGetLabs} from "../core/hooks/useGetLabs";

export const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Index,
})

const containerStyle: React.CSSProperties = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
};
const contentStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1
};

export type Group = components["schemas"]["Group"]
export type Lab = components["schemas"]["Lab"]

function Index() {
    const [language, setLanguage] = useState<TLanguage>('hy')
    //const [selectedGroupUuid, setSelectedGroupUuid] = useState<string>("")
    const [selectedLabUuid] = useState<string | null>(localStorage.getItem('selectedLabUuid') || null)
    const [selectedGroupUuid, setSelectedGroupUuid] = useState<string | null>(localStorage.getItem('selectedGroupUuid') || null)
    const [showLabSelect, setShowLabSelect] = useState(false)
    const navigate = useNavigate();
    document.title = `${pageContent.Schedule[language]}`


   const {groups, isLoading} = useGetGroups({language})

    const {labs, isFetching} = useGetLabs({language})

    useEffect(() => {

        if (selectedGroupUuid && selectedLabUuid) {

            localStorage.setItem('selectedGroupUuid', selectedGroupUuid);
            localStorage.setItem('selectedLabUuid', selectedLabUuid);
            localStorage.setItem('selectedLanguage', language);

            navigate({
            to: `/schedules/$scheduleUuid`,
            params:{
                scheduleUuid:selectedGroupUuid,
            },
            search: {
                lab_uuid: selectedLabUuid,
            },
        });
        }
    }, [selectedLabUuid, selectedGroupUuid, navigate, language]);

    const handleGroupSelect = (selectedGroupUuid: Group["uuid"]) => {
        localStorage.setItem("selectedGroupUuid", selectedGroupUuid)
        setSelectedGroupUuid(selectedGroupUuid)
        setShowLabSelect(true)
    }

    return (

        <div className='container' style={containerStyle}>
            <div className="nav" style={{'display': 'flex', 'justifyContent': 'flex-end', 'padding': '20px 0'}}>
                <LanguageSwitcher selectedLanguage={language} setLanguage={setLanguage}/>
            </div>

            <div className='content' style={contentStyle}>
                <Title level={2} style={{textAlign: "center"}}>{pageContent['Select a Group'][language]}</Title>
                <div style={{width: 220}}>
                    <GroupSelect groups={groups || []} isLoading={isLoading} language={language}
                                 selectedGroup={null} onGroupChange={handleGroupSelect}
                                 selectedLabUuid={null}></GroupSelect>
                </div>

                {
                    showLabSelect &&
                    <div style={{
                        width: 220,
                        margin: showLabSelect ? "30px 0 0 0" : "0",
                        transition: 'all 2s ease',
                    }}>
                        <LabSelect labs={labs || []} isLoading={isFetching} language={language} selectedLab={null}
                                   selectedGroupUuid={selectedGroupUuid}
                        ></LabSelect>
                    </div>
                }
            </div>
            <Footer/>
        </div>


    )
}