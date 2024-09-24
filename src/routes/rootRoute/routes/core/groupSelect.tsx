import {useNavigate} from "@tanstack/react-router";
import {Group} from "../indexRoute/indexRoute";
import {Select} from "antd";
import {pageContent, TLanguage} from "./pageContent";

type GroupSelectProps = {
    groups: Group[]
    isLoading: boolean
    language : TLanguage
    selectedGroup: Group | null
}

function GroupSelect({groups, isLoading, language, selectedGroup}: GroupSelectProps) {
    const navigate = useNavigate()
    localStorage.setItem('groups', JSON.stringify(groups));
    const onGroupChange = (selectedGroupUuid: Group['uuid']) => {

        navigate({
            to: '/schedules/$scheduleUuid',
            params: {
                scheduleUuid: selectedGroupUuid,
            }
        });
    }

    return (
        <div>
            <Select
                loading={isLoading}
                placeholder={selectedGroup ? selectedGroup.name : pageContent['Group'][language]}
                onChange={onGroupChange}
                fieldNames={{
                    label: 'name',
                    value: 'uuid'
                }}
                style={{width: 220}}
                options={groups}
                value={selectedGroup ? selectedGroup.uuid : undefined}
            />
        </div>

    );
}

export default GroupSelect