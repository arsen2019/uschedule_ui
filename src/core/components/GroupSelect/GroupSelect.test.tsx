import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import GroupSelect from './GroupSelect';
import {translations, TLanguage} from '../../constants/translations';
import {MemoryRouter, Route, Routes} from 'react-router-dom';

describe('GroupSelect Component', () => {
    const groups = [
        {name: 'Group A', uuid: 'uuid-1'},
        {name: 'Group B', uuid: 'uuid-2'},
        {name: 'Group C', uuid: 'uuid-3'},
    ];
    const selectedLabUuid = 'lab-uuid';
    const language: TLanguage = 'en';

    function renderWithRouter(ui: any) {
        return render(
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route path="/" element={ui}/>
                    <Route path="/schedules/:scheduleUuid" element={<div>Schedules Page</div>}/>
                </Routes>
            </MemoryRouter>
        );
    }

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

        const selectElement = screen.getByRole('combobox');
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


