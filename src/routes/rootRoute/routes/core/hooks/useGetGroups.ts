import {useQuery} from "@tanstack/react-query";
import {Group} from "../../indexRoute/indexRoute";
import {TLanguage} from "../pageContent";
import {useMemo} from "react";

interface IUseGetGroupsParams {
    language: TLanguage
}

const GROUPS_LOCAL_STORAGE_KEY = "groups"
export function useGetGroups(params: IUseGetGroupsParams) {
    const {language} = params
    const storedGroups = useMemo(() => {
        const groupsJsonString =  localStorage.getItem(GROUPS_LOCAL_STORAGE_KEY)
        if(groupsJsonString){
            const parsedGroups = JSON.parse(groupsJsonString)
            if(Array.isArray(parsedGroups)){
                return parsedGroups
            }
        }
        return [];
    }, [])
    const {data: groups, isLoading} = useQuery<Group[]>({
        initialData: storedGroups,
        queryKey: ['groups', language],
        queryFn: () => {
            return fetch('https://api.schedule.arsgreg.com/groups/', {
                headers: {
                    'Accept-Language': language
                },
            })
                .then((res) => {
                    if (res.ok) {
                        return  res.json();
                    }
                    return [];
                }).then( (groups) => {
                    localStorage.setItem(GROUPS_LOCAL_STORAGE_KEY, JSON.stringify(groups))
                    return groups
                })

        }

    });
    return {groups, isLoading}
}