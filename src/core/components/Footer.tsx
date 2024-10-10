import {LinkedinOutlined} from '@ant-design/icons'
import React from "react";

const PADDING_VERTICAL = "10px"

const footerStyle = {
    paddingBottom: `max(env(safe-area-inset-bottom, 5px), ${PADDING_VERTICAL})`,
    paddingTop: PADDING_VERTICAL,
    display: 'flex',
    justifyContent: "center",
    alignItems: 'center',
}
export const Footer: React.FC = () => {
    return (

        <div className='footer' style={footerStyle}>
            <span style={{fontSize: '17px', marginRight: '10px'}}>Developed by Arsen Grigoryan</span>
            <a href="https://www.linkedin.com/in/arsen-grigoryan-18947b183/" style={{color: 'black'}}>
                <LinkedinOutlined style={{fontSize: '25px'}} twoToneColor='#1B92B5'/>
            </a>

        </div>


    )
}