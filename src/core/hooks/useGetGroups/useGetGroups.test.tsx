import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGetGroups } from './useGetGroups';
import { api } from '../../services/api';
import { getStoredData, saveToLocalStorage } from '../../utils/utils';
import { Group } from '../../../routes/rootRoute/routes/indexRoute/indexRoute';

jest.mock('../../services/api');
jest.mock('../../utils/utils');

const mockGroups: Group[] = [
    { name: 'Group 1', uuid: 'uuid-1' },
    { name: 'Group 2', uuid: 'uuid-2' },
];

const queryClient = new QueryClient();

function createWrapper() {
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
}

describe('useGetGroups', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('fetches groups from API and saves to local storage', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({ data: mockGroups });
        (getStoredData as jest.Mock).mockReturnValueOnce(null);

        const { result } = renderHook(() => useGetGroups({ language: 'en' }), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.groups).toEqual(mockGroups));

        expect(api.get).toHaveBeenCalledWith('/groups/', {
            headers: { 'Accept-Language': 'en' },
        });
        expect(saveToLocalStorage).toHaveBeenCalledWith('groups', mockGroups);
    });

    it('returns stored groups if available', () => {
        (getStoredData as jest.Mock).mockReturnValueOnce(mockGroups);

        const { result } = renderHook(() => useGetGroups({ language: 'en' }), {
            wrapper: createWrapper(),
        });

        expect(result.current.groups).toEqual(mockGroups);
    });

    it('handles loading state correctly', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({ data: mockGroups });

        const { result } = renderHook(() => useGetGroups({ language: 'en' }), {
            wrapper: createWrapper(),
        });

        //expect(result.current.isLoading).toBe(true);

        await waitFor(() => expect(result.current.isLoading).toBe(false));
    });
});
