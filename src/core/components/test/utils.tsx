import {render} from "@testing-library/react";
import {MemoryRouter, Route, Routes} from "react-router-dom";
import React from "react";

export function renderWithRouter(ui: any) {
        return render(
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route path="/" element={ui} />
                    <Route path="/schedules/:scheduleUuid" element={<div>Schedules Page</div>} />
                </Routes>
            </MemoryRouter>
        );
    }