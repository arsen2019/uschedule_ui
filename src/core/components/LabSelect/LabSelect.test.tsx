import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LabSelect from './LabSelect';
import { translations, TLanguage } from '../../constants/translations';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

describe('LabSelect Component', () => {
    const labs = [
        { name: 'Lab A', uuid: 'uuid-1' },
        { name: 'Lab B', uuid: 'uuid-2' },
        { name: 'Lab C', uuid: 'uuid-3' },
    ];
    const selectedGroupUuid = 'group-uuid';
    const language: TLanguage = 'en';

    function renderWithRouter(ui: any) {
        return render(
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route path="/" element={ui} />
                    <Route path="/schedules/:scheduleUuid" element={<div>Schedules Page</div>} />
                </Routes>
            </MemoryRouter>
        );
    }


    it('displays the placeholder text based on language when no lab is selected', () => {
        renderWithRouter(
            <LabSelect
                labs={labs}
                isLoading={false}
                language={language}
                selectedLab={null}
                selectedGroupUuid={selectedGroupUuid}
            />
        );

        const selectElement = screen.getByTestId('lab-select');
        fireEvent.mouseDown(selectElement);

        expect(screen.getByText(translations['Lab'][language])).toBeInTheDocument();
    });

    it('displays the correct selected lab name when a lab is selected', () => {
        renderWithRouter(
            <LabSelect
                labs={labs}
                isLoading={false}
                language={language}
                selectedLab={labs[1]}
                selectedGroupUuid={selectedGroupUuid}
            />
        );

        const selectedSpan = screen.getByText("Lab B");
        expect(selectedSpan).toBeInTheDocument();
    });


});
