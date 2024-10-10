import {useNavigate} from "@tanstack/react-router";
import {Group} from "../../routes/rootRoute/routes/indexRoute/indexRoute";
import {Select} from "antd";
import {translations, TLanguage} from "../constants/translations";

type GroupSelectProps = {
    groups: Group[]
    isLoading: boolean
    language : TLanguage
    selectedGroup: Group | undefined | null
    onGroupChange?: (selectedGroupUuid: Group["uuid"]) => void
    selectedLabUuid: string | null
}

function GroupSelect({groups, isLoading, language, selectedGroup, onGroupChange, selectedLabUuid}: GroupSelectProps) {
    const navigate = useNavigate()
    const defaultGroupChange = (selectedGroupUuid:Group["uuid"]) => {
        localStorage.setItem('selectedGroupUuid',selectedGroupUuid);
        navigate({
            to: '/schedules/$scheduleUuid',
            params: {
                scheduleUuid: selectedGroupUuid,
            },
            search:{
                lab_uuid:selectedLabUuid
            }
        });
    }
    const handleGroupChange = onGroupChange || defaultGroupChange
    return (
        <div>
            <Select
                loading={isLoading}
                placeholder={selectedGroup ? selectedGroup.name : translations['Group'][language]}
                onChange={handleGroupChange}
                fieldNames={{
                    label: 'name',
                    value: 'uuid'
                }}
                style={{width: '100%'}}
                options={groups}
                value={selectedGroup ? selectedGroup.uuid : undefined}
            />
        </div>

    );
}

export default GroupSelect