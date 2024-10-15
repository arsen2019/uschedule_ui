import {useQuery} from "@tanstack/react-query";
import {Group} from "../../routes/rootRoute/routes/indexRoute/indexRoute";
import {TLanguage} from "../constants/translations";
import {useMemo} from "react";
import {api} from "../services/api";

interface IUseGetGroupsParams {
    language: TLanguage
}

const GROUPS_LOCAL_STORAGE_KEY = "groups"

export function useGetGroups(params: IUseGetGroupsParams) {
    const {language} = params
    const storedGroups = useMemo(() => {
        const groupsJsonString = localStorage.getItem(GROUPS_LOCAL_STORAGE_KEY)
        if (groupsJsonString) {
            const parsedGroups = JSON.parse(groupsJsonString)
            if (Array.isArray(parsedGroups)) {
                return parsedGroups
            }
        }
        return [];
    }, [])
    const {data: groups, isLoading} = useQuery<Group[]>({
        initialData: storedGroups,
        queryKey: ['groups', language],
        queryFn: () => {
            return api.get('/groups/', {
                headers: {
                    'Accept-Language': language
                },
            })
                .then((response) => {
                    localStorage.setItem(GROUPS_LOCAL_STORAGE_KEY, JSON.stringify(response.data))
                    return response.data
                })

        }

    });
    return {groups, isLoading}
}