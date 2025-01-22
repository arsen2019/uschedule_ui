import {TLanguage} from "../../constants/translations";
import {useMemo} from "react";
import {useQuery} from "@tanstack/react-query";
import {Lab} from "../../../routes/rootRoute/routes/indexRoute/indexRoute";
import {api} from "../../services/api";
import {getStoredData, saveToLocalStorage} from "../../utils/utils";

interface IUseGetLabsProps {
    language: TLanguage
}

const LABS_LOCAL_STORAGE_KEY = "labs"

export function useGetLabs(params: IUseGetLabsProps) {
    const {language} = params;
    const storedLabs = useMemo(() => getStoredData<Lab[]>(LABS_LOCAL_STORAGE_KEY), []);
    const {data: labs, isFetching} = useQuery<Lab[]>({
        initialData: storedLabs,
        queryKey: ['labs', language],
        queryFn: () => {
            return api.get('/groups/labs', {
                headers: {
                    'Accept-Language': language
                },
            })
                .then((response) => {
                    saveToLocalStorage(LABS_LOCAL_STORAGE_KEY, response.data);
                    return response.data
                })
        }
    });
    return {labs, isFetching}
}