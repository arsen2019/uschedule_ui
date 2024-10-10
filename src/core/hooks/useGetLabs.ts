import {TLanguage} from "../constants/translations";
import {useMemo} from "react";
import {useQuery} from "@tanstack/react-query";
import {Lab} from "../../routes/rootRoute/routes/indexRoute/indexRoute";

interface IUseGetLabsProps {
    language: TLanguage
}

const LABS_LOCAL_STORAGE_KEY = "labs"

export function useGetLabs(params: IUseGetLabsProps) {
    const {language} = params;
    const storedLabs = useMemo(() => {
        const labsJsonString = localStorage.getItem(LABS_LOCAL_STORAGE_KEY)
        if (labsJsonString) {
            const parsedLabs = JSON.parse(labsJsonString)
            if (Array.isArray(parsedLabs)) {
                return parsedLabs
            }
        }
        return [];
    }, [])
    const {data: labs, isFetching} = useQuery<Lab[]>({
        queryKey: ['labs', language],
        queryFn: () => {
            return fetch('https://api.schedule.arsgreg.com/groups/labs', {
                headers: {
                    'Accept-Language': language
                },
            })
                .then((res) => {
                    if (res.ok) {
                        return res.json();
                    }
                    return [];
                }).then((labs) => {
                    localStorage.setItem(LABS_LOCAL_STORAGE_KEY, JSON.stringify(labs))
                    return labs
                })

        }
    });
    return {labs, isFetching}
}