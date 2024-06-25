import {createRoute, useNavigate} from "@tanstack/react-router";
import {rootRoute} from "../../rootRoute";
import {QueryKey, useQuery} from "@tanstack/react-query";
import {useState} from "react";
import {Flex, Select} from "antd";
import Title from "antd/lib/typography/Title";
import {components} from "../../../../types/api"

export const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Index,
})

const containerStyle = {
    height: '100%'
};
type Group = components["schemas"]["Group"]

function Index() {
    const {data: groups, isLoading} = useQuery<Group[]>({
        queryKey: ['groups'],
        queryFn: () => {
            return fetch('http://127.0.0.1:8000/groups')
                .then((res) => {
                    if (res.ok) {
                        return res.json();
                    }
                    return [];
                })

        }
    });

    const navigate = useNavigate();

    console.log(groups);

    const onGroupSelect = (selectedGroupUuid: Group['uuid']) => {
        navigate({
            to: '/schedules/$scheduleUuid',
            params: {
                scheduleUuid: selectedGroupUuid
            }
        })
    }

    return (
        <Flex style={containerStyle} justify="center" align="center">
            <div>
                <Title level={2}>Select a group</Title>
                <Select<Group['uuid']>
                    loading={isLoading}
                    placeholder="Group"
                    onChange={onGroupSelect}
                    fieldNames={{
                        label: 'name',
                        value: 'uuid'
                    }}
                    style={{width: 220}}
                    options={groups}
                />
            </div>

        </Flex>
    )
}