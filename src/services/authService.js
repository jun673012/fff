// src/services/authService.js

import axios from 'axios';

// 기존 코드
// const API_URL = '/api';

// 수정된 코드
const API_URL = 'http://localhost:8080/api'; // 백엔드 서버 주소로 변경

axios.defaults.withCredentials = true;

export const register = (personId, personName, personPassword, profilePicture) => {
    return axios.post(`${API_URL}/register`, {
        personId,
        personName,
        personPassword,
        profilePicture,
    });
};

export const login = (personId, personPassword) => {
    return axios.post(`${API_URL}/login`, {
        personId,
        personPassword,
    });
};

export const logout = () => {
    return axios.post(`${API_URL}/logout`);
};
