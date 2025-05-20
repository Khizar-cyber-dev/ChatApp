import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renders without crashing', () => {
  render(<App />);
  expect(screen.getByText(/sign in to continue/i)).toBeInTheDocument();
});
