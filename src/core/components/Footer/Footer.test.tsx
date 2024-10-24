import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Footer } from './Footer'; // Adjust the import path as needed

describe('Footer Component', () => {
  test('renders Footer without crashing', () => {
    render(<Footer />);

    const linkElement = screen.getByRole('link');
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', 'https://www.linkedin.com/in/arsen-grigoryan-18947b183/');

    const iconElement = screen.getByRole('img');
    expect(iconElement).toBeInTheDocument();
  });
});
