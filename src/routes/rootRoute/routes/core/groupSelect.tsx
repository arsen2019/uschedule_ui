import {useNavigate} from "@tanstack/react-router";
import {useState} from "react";
import {Group} from "../indexRoute/indexRoute";
import {Select} from "antd";

const selectStyle = {
    display:'flex',
    justifyContent:'space-evenly',
    padding:'15px',
}

type GroupSelectProps = {
    groups: Group[]
    isLoading: boolean
    selectedGroup:Group | null
}

function GroupSelect({groups, isLoading, selectedGroup}: GroupSelectProps) {
    const navigate = useNavigate()
    //const [selectedGroup, setSelectedGroup] = useState<Group | null>()

    const onGroupChange = (selectedGroupUuid: Group['uuid']) => {

        navigate({
            to: '/schedules/$scheduleUuid',
            params: {
                scheduleUuid: selectedGroupUuid,
            },
            search: () => ({
                groups: JSON.stringify(groups),
                selectedGroup:JSON.stringify(groups?.find(group => group.uuid === selectedGroupUuid)),
            }),
        });
    }

    return (
        <div style={selectStyle}>
            <Select
            loading={isLoading}
            placeholder={selectedGroup ? selectedGroup.name : "Group"}
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