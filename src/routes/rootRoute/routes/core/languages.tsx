import React from 'react';
import {Select} from 'antd';
import {TLanguage} from "./pageContent";


const {Option} = Select;

interface LanguageSwitcherProps {
    selectedLanguage: TLanguage;
    setLanguage: (language: TLanguage) => void;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({selectedLanguage, setLanguage}) => {
    const handleChange = (value: TLanguage) => {
        setLanguage(value);
    };

    return (
        <Select defaultValue={selectedLanguage} onChange={handleChange}>
            <Option value="hy"><img src="/icons/armenia.png" alt="Armenian"
                                    style={{'width': '30px', 'display': 'flex', 'alignItems': 'center'}}/></Option>
            <Option value="ru"><img src="/icons/russia.png" alt="Armenian"
                                    style={{'width': '30px', 'display': 'flex', 'alignItems': 'center'}}/></Option>
            <Option value="en"><img src="/icons/united-kingdom.png" alt="Armenian"
                                    style={{'width': '30px', 'display': 'flex', 'alignItems': 'center'}}/></Option>
        </Select>
    );
};
