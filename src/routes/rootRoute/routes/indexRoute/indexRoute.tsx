import {createRoute, useNavigate} from "@tanstack/react-router";
import {rootRoute} from "../../rootRoute";
import {QueryKey, useQuery} from "@tanstack/react-query";
import {useState} from "react";
import {Flex, Select} from "antd";
import Title from "antd/lib/typography/Title";
import {components} from "../../../../types/api"
import  GroupSelect from "../core/groupSelect"
export const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Index,
})

const containerStyle = {
    height: '100%'
};
export type Group = components["schemas"]["Group"]

function Index() {
    const {data: groups, isLoading} = useQuery<Group[]>({
        queryKey: ['groups'],
        queryFn: () => {
            return fetch('http://104.248.138.102:8000/groups')
                .then((res) => {
                    if (res.ok) {
                        return res.json();
                    }
                    return [];
                })

        }
    });

    return (
        <Flex style={containerStyle} justify="center" align="center">
            <div>
                <Title level={2} style={{textAlign:"center"}}>Select a group</Title>
                <GroupSelect groups={groups || []} isLoading={isLoading} selectedGroup={null}></GroupSelect>
            </div>

        </Flex>
    )
}