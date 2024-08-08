import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import AadHome from './embed/AadHome'; // Adjust the import path accordingly

// Import the Socket type from 'socket.io-client'
import { io, Socket } from 'socket.io-client';

// Mocking axios and socket.io-client
jest.mock('axios');
jest.mock('socket.io-client', () => {
  const actual = jest.requireActual('socket.io-client');
  return {
    ...actual,
    __esModule: true,
    default: jest.fn(),
  };
});

// Declare 'io' as a mocked function with Socket type
const mockedIo = io as jest.Mocked<typeof io>;

describe('AadHome Component', () => {
  beforeEach(() => {
    // Mock axios post method
    (axios.post as jest.Mock).mockResolvedValue({
      data: {
        responseData: [
          {
            lscode: '123',
            user_name: 'Test User',
            email: 'test@example.com',
          },
        ],
      },
    });

    // Mock socket.io-client methods
    mockedIo.mockReturnValue({
      on: jest.fn(),
      emit: jest.fn(),
    });
  });

  it('renders the component and displays user list on button click', async () => {
    // Mock params
    const params = { AAD: 'base64-encoded-id' };

    render(<AadHome params={params} />);

    // Wait for the component to fetch data and update state
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeTruthy();
    });

    // Check if the button is rendered
    const button = screen.getByRole('button', { name: /chat/i });
    expect(button).toBeTruthy();

    // Click the button to toggle user list
    fireEvent.click(button);

    // Wait for the component to update state and render the ChatList component
    await waitFor(() => {
      expect(screen.getByTestId('chatlists')).toBeTruthy();
    });

    // You can add more assertions based on your component behavior
  });
});
