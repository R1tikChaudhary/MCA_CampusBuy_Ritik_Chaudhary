import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { addNotification } from './appSlice';
import { logout, setAuthenticated, setRefreshToken, setToken, setUser } from './userSlice';
import socket from './socket';
import { clearStoredAuth, getRefreshToken, isTokenExpired, refreshAccessToken, getValidAccessToken } from './authUtils';

const AuthInitializer = ({ children }) => {
    const dispatch = useDispatch();
    const currentUserId = useSelector((store) => store.user?.user?._id);

    useEffect(() => {
        const initializeAuth = async () => {
            const storedRefreshToken = getRefreshToken();
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            let parsedUser = null;
            try {
                parsedUser = storedUser ? JSON.parse(storedUser) : null;
            } catch (error) {
                parsedUser = null;
            }

            if (storedRefreshToken && (!token || isTokenExpired(token))) {
                const refreshedSession = await refreshAccessToken();

                if (refreshedSession?.token) {
                    dispatch(setToken(refreshedSession.token));
                    dispatch(setRefreshToken(refreshedSession.refreshToken));
                    dispatch(setUser(refreshedSession.user || null));
                    dispatch(setAuthenticated(true));
                    return;
                }

                // Keep the user signed in when refresh fails due transient errors.
                // If refresh token is truly invalid, refreshAccessToken clears storage.
                if (getRefreshToken()) {
                    dispatch(setRefreshToken(storedRefreshToken));
                    dispatch(setUser(parsedUser));
                    dispatch(setAuthenticated(true));
                    return;
                }
            }

            if (token && !isTokenExpired(token)) {
                dispatch(setToken(token));
                dispatch(setRefreshToken(storedRefreshToken));
                dispatch(setUser(parsedUser));
                dispatch(setAuthenticated(true));
                return;
            }

            if (storedRefreshToken && !getRefreshToken()) {
                clearStoredAuth();
                dispatch(logout());
            }
        };

        initializeAuth();
    }, [dispatch]);

    useEffect(() => {
        const requestInterceptor = axios.interceptors.request.use(async (config) => {
            const isBackendRequest = typeof config.url === 'string' && config.url.includes('localhost:5000');
            const hasAuthorizationHeader = !!config.headers?.Authorization;

            if (!isBackendRequest || hasAuthorizationHeader) {
                return config;
            }

            const token = await getValidAccessToken();

            if (token) {
                config.headers = config.headers || {};
                config.headers.Authorization = `Bearer ${token}`;
            }

            return config;
        });

        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                const isUnauthorized = error.response?.status === 401;
                const isRefreshCall = originalRequest?.url?.includes('/api/auth/refresh-token');

                if (!isUnauthorized || isRefreshCall || originalRequest?._retry) {
                    return Promise.reject(error);
                }

                originalRequest._retry = true;
                const refreshedSession = await refreshAccessToken();

                if (!refreshedSession?.token) {
                    // Logout only if refresh token has actually become invalid/expired.
                    if (!getRefreshToken()) {
                        clearStoredAuth();
                        dispatch(logout());
                    }
                    return Promise.reject(error);
                }

                dispatch(setToken(refreshedSession.token));
                dispatch(setRefreshToken(refreshedSession.refreshToken));
                dispatch(setUser(refreshedSession.user || null));
                dispatch(setAuthenticated(true));

                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${refreshedSession.token}`;
                return axios(originalRequest);
            }
        );

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, [dispatch]);

    useEffect(() => {
        const onLostFoundCreated = (ticket) => {
            const ticketOwnerId = ticket?.user?._id;
            if (ticketOwnerId && currentUserId && ticketOwnerId === currentUserId) {
                return;
            }

            dispatch(addNotification({
                id: `lost-found-${ticket?._id || Date.now()}`,
                type: 'info',
                message: `Lost & Found alert: ${ticket?.itemName || 'New ticket'} reported.`
            }));
        };

        socket.on("lost_found_ticket_created", onLostFoundCreated);
        return () => {
            socket.off("lost_found_ticket_created", onLostFoundCreated);
        };
    }, [dispatch, currentUserId]);

    return children;
};

export default AuthInitializer;
