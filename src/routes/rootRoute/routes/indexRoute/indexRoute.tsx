import {createRoute, useNavigate} from "@tanstack/react-router";
import {rootRoute} from "../../rootRoute";
import {QueryKey, useQuery} from "@tanstack/react-query";
import React, {useState} from "react";
import Title from "antd/lib/typography/Title";
import {components} from "../../../../types/api"
import GroupSelect from "../core/groupSelect"
import {Footer} from "../core/footer";
import {LanguageSwitcher} from "../core/languages";
import {TLanguage, pageContent} from "../core/pageContent";

export const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Index,
})

const containerStyle:React.CSSProperties = {
    height: '100%',
    display:'flex',
    flexDirection:'column',
};
const contentStyle:React.CSSProperties = {
    display:'flex',
    flexDirection:'column',
    justifyContent:'center',
    alignItems:'center',
    flexGrow:1
};

export type Group = components["schemas"]["Group"]

function Index() {
    const [language, setLanguage] = useState<TLanguage>('hy')
    document.title = `${pageContent.Schedule[language]}`
    const {data: groups, isLoading} = useQuery<Group[]>({
        queryKey: ['groups', language],
        queryFn: () => {
            return fetch('https://api.schedule.arsgreg.com/groups/',{
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

    return (

            <div className='container' style={containerStyle} >
                <div className="nav" style={{'display': 'flex', 'justifyContent': 'flex-end', 'padding': '20px 0'}}>
                    <LanguageSwitcher selectedLanguage={language} setLanguage={setLanguage}/>
                </div>

                <div className='content' style={contentStyle} >
                    <Title level={2} style={{textAlign: "center"}}>{pageContent['Select a Group'][language]}</Title>
                    <GroupSelect groups={groups || []} isLoading={isLoading} language={language}
                                 selectedGroup={null}></GroupSelect>
                </div>
                <Footer/>
            </div>



    )
}