import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import GroupSelect from './GroupSelect';
import {translations, TLanguage} from '../../constants/translations';
import {renderWithRouter} from "../test/utils";

describe('GroupSelect Component', () => {
    const groups = [
        {name: 'Group A', uuid: 'uuid-1'},
        {name: 'Group B', uuid: 'uuid-2'},
        {name: 'Group C', uuid: 'uuid-3'},
    ];
    const selectedLabUuid = 'lab-uuid';
    const language: TLanguage = 'en';


    it('displays the placeholder text based on language when no group is selected', () => {
        renderWithRouter(
            <GroupSelect
                groups={groups}
                isLoading={false}
                language="en"
                selectedGroup={null}
                selectedLabUuid={selectedLabUuid}
            />
        );
        screen.debug()
        const selectElement = screen.getByTestId('group-select');
        fireEvent.mouseDown(selectElement);

        expect(screen.getByText(translations['Group'][language])).toBeInTheDocument();
    });


    it('has the correct selected value in the span', () => {
        renderWithRouter(
            <GroupSelect
                groups={groups}
                isLoading={false}
                language="en"
                selectedGroup={groups[1]}
                selectedLabUuid={selectedLabUuid}
            />
        );

        const selectedSpan = screen.getByTitle("Group B");
        expect(selectedSpan).toBeInTheDocument();

    });
});


