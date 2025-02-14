import {useQuery} from "@tanstack/react-query";
import {Group} from "../../../routes/rootRoute/routes/indexRoute/indexRoute";
import {TLanguage} from "../../constants/translations";
import {useMemo} from "react";
import {api} from "../../services/api";
import {getStoredData, saveToLocalStorage} from "../../utils/utils";

interface IUseGetGroupsParams {
    language: TLanguage
}

const GROUPS_LOCAL_STORAGE_KEY = "groups"

export function useGetGroups(params: IUseGetGroupsParams) {
    const {language} = params
    const storedGroups = useMemo(() => getStoredData<Group[]>(GROUPS_LOCAL_STORAGE_KEY), []);
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
                    saveToLocalStorage(GROUPS_LOCAL_STORAGE_KEY, response.data);
                    return response.data
                })

        },

    });
    return {groups, isLoading}
}