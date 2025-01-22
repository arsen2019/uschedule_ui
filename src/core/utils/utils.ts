export const getStoredData = <T>(key: string): T | [] => {
    const jsonString = localStorage.getItem(key);
    if (jsonString) {
        try {
            const parsed = JSON.parse(jsonString);
            if (Array.isArray(parsed)) {
                return parsed as T;
            }
        } catch {
            console.error(`Failed to parse localStorage data for key: ${key}`);
        }
    }
    return [];
};

export const saveToLocalStorage = (key: string, data: any): void => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch {
        console.error(`Failed to save data to localStorage for key: ${key}`);
    }
};
