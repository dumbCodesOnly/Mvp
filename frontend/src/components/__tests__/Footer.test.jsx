import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Footer from '../Footer';

describe('Footer', () => {
  it('renders the footer with the copyright notice', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(screen.getByText(/© \d{4} CloudMiner\. All rights reserved\./i)).toBeInTheDocument();
  });
});
