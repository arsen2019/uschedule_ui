import React from 'react';
import {Select} from 'antd';
import {TLanguage} from "../../constants/translations";
import ReactGA from 'react-ga4'

const {Option} = Select;

interface LanguageSwitcherProps {
    selectedLanguage: TLanguage;
    setLanguage: (language: TLanguage) => void;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({selectedLanguage, setLanguage}) => {
    const handleChange = (value: TLanguage) => {
        ReactGA.event('language_switch', {
            selected_language: value,
        });
        setLanguage(value);
    };

    return (
        <Select defaultValue={selectedLanguage} onChange={handleChange} className='language_switcher' data-testid='language-switcher'>
            <Option value="hy"><img src="/icons/armenia.png" alt="Armenian"
                                    style={{'width': '30px', 'display': 'flex', 'alignItems': 'center'}}/></Option>
            <Option value="ru"><img src="/icons/russia.png" alt="Russian"
                                    style={{'width': '30px', 'display': 'flex', 'alignItems': 'center'}}/></Option>
            <Option value="en"><img src="/icons/united-kingdom.png" alt="English"
                                    style={{'width': '30px', 'display': 'flex', 'alignItems': 'center'}}/></Option>
        </Select>
    );
};
