import {useNavigate} from "@tanstack/react-router";
import {Select} from "antd";
import {translations, TLanguage} from "../constants/translations";
import {components} from "../../types/api";

type Lab = components["schemas"]["Lab"]

type LabSelectProps = {
    labs: Lab[]
    isLoading: boolean
    language : TLanguage
    selectedLab: Lab | null
    selectedGroupUuid : string | null
}

function LabSelect({labs, isLoading, language, selectedLab, selectedGroupUuid}: LabSelectProps) {
    const navigate = useNavigate()
    const onLabChange = (selectedLabUuid: Lab['uuid']) => {
        localStorage.setItem('selectedLabUuid', selectedLabUuid)
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

    return (
        <div>
            <Select
                loading={isLoading}
                placeholder={selectedLab ? selectedLab.name : translations['Lab'][language]}
                onChange={onLabChange}
                fieldNames={{
                    label: 'name',
                    value: 'uuid'
                }}
                style={{width: '100%'}}
                options={labs}
                value={selectedLab ? selectedLab.uuid : undefined}
            />
        </div>
    );
}
export default LabSelect