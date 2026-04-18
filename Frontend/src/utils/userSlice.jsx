import { createSlice } from "@reduxjs/toolkit"

const storedToken = localStorage.getItem('token')
const storedRefreshToken = localStorage.getItem('refreshToken')
const storedUser = localStorage.getItem('user')

const userSlice = createSlice({
    name: "user",
    initialState: {
        // UI State
        showpassword: false,
        
        // Authentication State
        isAuthenticated: !!(storedToken || storedRefreshToken),
        token: storedToken || null,
        refreshToken: storedRefreshToken || null,
        user: storedUser ? JSON.parse(storedUser) : null,
        profile: storedUser ? JSON.parse(storedUser) : {},
        
        // Form Data
        loginForm: {
            email: '',
            password: '',
        },
        registerForm: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            branch: '',
            whatsapp: ''
        },
        
        // OTP Verification Data
        otpData: {
            email: '',
            password: '',
            otp: Array(6).fill("")
        },
    },
    reducers: {
        // UI Actions
        SetShowPassword: (state) => {
            state.showpassword = !state.showpassword
        },
        
        // Authentication Actions
        setAuthenticated: (state, action) => {
            state.isAuthenticated = action.payload
        },
        setToken: (state, action) => {
            state.token = action.payload
            if (action.payload) {
                localStorage.setItem('token', action.payload)
            } else {
                localStorage.removeItem('token')
            }
        },
        setRefreshToken: (state, action) => {
            state.refreshToken = action.payload
            if (action.payload) {
                localStorage.setItem('refreshToken', action.payload)
            } else {
                localStorage.removeItem('refreshToken')
            }
        },
        setUser: (state, action) => {
            state.user = action.payload
            if (action.payload) {
                localStorage.setItem('user', JSON.stringify(action.payload))
            } else {
                localStorage.removeItem('user')
            }
        },
        logout: (state) => {
            state.isAuthenticated = false
            state.token = null
            state.refreshToken = null
            state.user = null
            state.profile = {}
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
        },
        
        // Form Actions
        updateLoginForm: (state, action) => {
            state.loginForm = { ...state.loginForm, ...action.payload }
        },
        updateRegisterForm: (state, action) => {
            state.registerForm = { ...state.registerForm, ...action.payload }
        },
        resetLoginForm: (state) => {
            state.loginForm = { email: '', password: '' }
        },
        resetRegisterForm: (state) => {
            state.registerForm = {
                name: '',
                email: '',
                password: '',
                confirmPassword: '',
                branch: '',
                whatsapp: ''
            }
        },
        
        // OTP Actions
        setOtpData: (state, action) => {
            state.otpData = { ...state.otpData, ...action.payload }
        },
        updateOtp: (state, action) => {
            state.otpData.otp = action.payload
        },
        resetOtpData: (state) => {
            state.otpData = {
                email: '',
                password: '',
                otp: Array(6).fill("")
            }
        },
        
        // Profile Actions
        setProfile: (state, action) => {
            state.profile = { ...state.profile, ...action.payload }
            // Also update user object to keep them in sync
            state.user = { ...state.user, ...action.payload }
            // Save to localStorage for persistence
            localStorage.setItem('user', JSON.stringify(state.user))
        },
        updateProfileImage: (state, action) => {
            state.profile.profileImage = action.payload
            if (state.user) {
                state.user.profileImage = action.payload
                localStorage.setItem('user', JSON.stringify(state.user))
            }
        }
    },
})

export const { 
    SetShowPassword,
    setAuthenticated,
    setToken,
    setRefreshToken,
    setUser,
    logout,
    updateLoginForm,
    updateRegisterForm,
    resetLoginForm,
    resetRegisterForm,
    setOtpData,
    updateOtp,
    resetOtpData,
    setProfile,
    updateProfileImage
} = userSlice.actions

export default userSlice.reducer
