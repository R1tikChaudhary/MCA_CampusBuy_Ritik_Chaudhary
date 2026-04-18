import { useSelector } from 'react-redux';

export const API_BASE_URL = 'http://localhost:5000/api';

const ACCESS_TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

const parseJwt = (token) => {
    try {
        const payload = token.split('.')[1];
        return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    } catch (error) {
        return null;
    }
};

export const isTokenExpired = (token) => {
    if (!token) return true;

    const decoded = parseJwt(token);
    if (!decoded?.exp) return true;

    return decoded.exp * 1000 <= Date.now() + 15000;
};

export const clearStoredAuth = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

export const storeAuthSession = ({ token, refreshToken, user }) => {
    if (token) {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
    }

    if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }

    if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
};

export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

let refreshRequest = null;

export const refreshAccessToken = async () => {
    if (!refreshRequest) {
        refreshRequest = (async () => {
            const refreshToken = getRefreshToken();

            if (!refreshToken) {
                clearStoredAuth();
                return null;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ refreshToken }),
                });

                const data = await response.json();

                if (!response.ok || !data?.token) {
                    // Clear auth only when the refresh token is definitely invalid/expired.
                    if (response.status === 401 || response.status === 403) {
                        clearStoredAuth();
                    }
                    return null;
                }

                storeAuthSession(data);
                return data;
            } catch (error) {
                // Transient network/server issue: keep existing session data and retry later.
                return null;
            } finally {
                refreshRequest = null;
            }
        })();
    }

    return refreshRequest;
};

export const getValidAccessToken = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (token && !isTokenExpired(token)) {
        return token;
    }

    const refreshedSession = await refreshAccessToken();
    return refreshedSession?.token || null;
};

// Function to get the latest auth token
export const getAuthToken = () => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (token && typeof token === 'string' && token.length > 20 && !isTokenExpired(token)) {
        return token;
    }

    return null;
};

// Selectors for easy access to Redux state
export const useAuth = () => {
    const { isAuthenticated, token: reduxToken, refreshToken: reduxRefreshToken, user } = useSelector(store => store.user);
    const token = reduxToken || localStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = reduxRefreshToken || localStorage.getItem(REFRESH_TOKEN_KEY);
    return { isAuthenticated: isAuthenticated || !!refreshToken, token, refreshToken, user, getAuthToken };
};

export const useUserProfile = () => {
    const { profile } = useSelector(store => store.user);
    return profile;
};

export const useAppState = () => {
    const { products, loading, error, currentPage } = useSelector(store => store.app);
    return { products, loading, error, currentPage };
};

export const useFormData = () => {
    const { loginForm, registerForm, otpData } = useSelector(store => store.user);
    return { loginForm, registerForm, otpData };
};

export const useProductState = () => {
    const { productForm, uploadLoading, uploadError, myProducts } = useSelector(store => store.product);
    return { productForm, uploadLoading, uploadError, myProducts };
};

// Authentication helpers
export const isAuthenticated = () => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    return !!(token || refreshToken);
};

export const getAuthHeaders = () => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

// Test API connectivity
export const testAPI = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/product/all`);
        console.log('API test response:', response.status);
        return response.ok;
    } catch (error) {
        console.error('API test failed:', error);
        return false;
    }
};

export const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = await getValidAccessToken();

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers
        }
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }

        return data;
    } catch (error) {
        console.error('API Request failed:', error);
        throw error;
    }
};
