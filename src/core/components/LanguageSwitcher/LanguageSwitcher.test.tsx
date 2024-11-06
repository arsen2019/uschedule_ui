import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageSwitcher } from './LanguageSwitcher';
import ReactGA from 'react-ga4';

jest.mock('react-ga4', () => ({
    event: jest.fn(),
}));

describe('LanguageSwitcher Component', () => {
    const setLanguageMock = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the component with the default selected language', () => {
        render(<LanguageSwitcher selectedLanguage="en" setLanguage={setLanguageMock} />);
        const selectElement = screen.getByRole('combobox');
        expect(selectElement).toBeInTheDocument();
    });

    it('displays language options with corresponding flags when dropdown is open', () => {
        render(<LanguageSwitcher selectedLanguage="en" setLanguage={setLanguageMock} />);

        const selectElement = screen.getByRole('combobox');
        fireEvent.mouseDown(selectElement);

        expect(screen.getByAltText('Armenian')).toBeInTheDocument();
        expect(screen.getByAltText('Russian')).toBeInTheDocument();
        expect(screen.getAllByAltText('English')[0]).toBeInTheDocument();
    });

    it('calls setLanguage and tracks analytics when a language is selected', () => {
        render(<LanguageSwitcher selectedLanguage="en" setLanguage={setLanguageMock} />);

        const selectElement = screen.getByRole('combobox');

        fireEvent.mouseDown(selectElement);
        fireEvent.click(screen.getByAltText('Russian'));

        expect(setLanguageMock).toHaveBeenCalledWith('ru');
        expect(ReactGA.event).toHaveBeenCalledWith({
            category: 'Language Switcher',
            action: 'Change Language',
            label: 'ru',
        });
    });

    it('changes the displayed language correctly when a different language is selected', () => {
        render(<LanguageSwitcher selectedLanguage="hy" setLanguage={setLanguageMock} />);

        const selectElement = screen.getByRole('combobox');

        fireEvent.mouseDown(selectElement);
        fireEvent.click(screen.getByAltText('English'));

        expect(setLanguageMock).toHaveBeenCalledWith('en');
    });
});
