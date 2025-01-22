import { renderHook, act } from '@testing-library/react';
import { waitFor } from '@testing-library/react';
import { useGetLabs } from './useGetLabs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { api } from '../../services/api';
import { getStoredData, saveToLocalStorage } from '../../utils/utils';

jest.mock('../../services/api');
jest.mock('../../utils/utils');

const mockLabs = [
    { id: 1, name: 'Lab 1', uuid: 'uuid-1' },
    { id: 2, name: 'Lab 2', uuid: 'uuid-2' },
];

// Mock getStoredData and saveToLocalStorage
(getStoredData as jest.Mock).mockImplementation(() => null);
(saveToLocalStorage as jest.Mock).mockImplementation(() => {});

const queryClient = new QueryClient();

function createWrapper() {
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
}

describe('useGetLabs', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('fetches labs from API and saves to local storage', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({ data: mockLabs });

        const { result } = renderHook(
            () => useGetLabs({ language: 'en' }),
            { wrapper: createWrapper() }
        );

        expect(result.current.isFetching).toBe(true);

        // Wait for the query to resolve
        await waitFor(() => expect(result.current.labs).toEqual(mockLabs));

        expect(api.get).toHaveBeenCalledWith('/groups/labs', {
            headers: { 'Accept-Language': 'en' },
        });
        expect(saveToLocalStorage).toHaveBeenCalledWith('labs', mockLabs);
    });

    it('returns stored labs if available', () => {
        (getStoredData as jest.Mock).mockReturnValueOnce(mockLabs);

        const { result } = renderHook(() => useGetLabs({ language: 'en' }), {
            wrapper: createWrapper(),
        });

        expect(result.current.labs).toEqual(mockLabs);
        expect(api.get).not.toHaveBeenCalled(); // Ensure API call is skipped
    });

    it('handles loading state correctly', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({ data: mockLabs });

        const { result } = renderHook(
            () => useGetLabs({ language: 'en' }),
            { wrapper: createWrapper() }
        );

        expect(result.current.isFetching).toBe(true);

        await waitFor(() => expect(result.current.isFetching).toBe(false));
    });
});
