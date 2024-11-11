import axios from 'axios';

import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const API_URL = 'http://localhost:8080/api'; // 백엔드 서버 주소
axios.defaults.withCredentials = true;

// 안 읽은 메시지 수 조회
export const getUnreadMessages = () => {
    return axios.get(`${API_URL}/chat-room/unread-messages`);
};

// 메시지를 읽음으로 표시
export const markMessagesAsRead = (chatRoomId) => {
    return axios.post(`${API_URL}/chat-room/${chatRoomId}/read-messages`);
};

export const joinChatRoom = (roomId) => {
    return axios.post(`${API_URL}/chat-room/${roomId}/join`);
};

export const getChatRooms = () => {
    return axios.get(`${API_URL}/chat-room`);
};

export const createChatRoom = (chatRoomName) => {
    return axios.post(`${API_URL}/chat-room`, { chatRoomName });
};

export const getChatMessages = (roomId, page = 0, size = 20) => {
    return axios.get(`${API_URL}/chat-room/${roomId}/messages`, {
        params: { page, size },
    });
};

export const connectWebSocket = () => {
    const socket = new SockJS('http://localhost:8080/ws');
    const stompClient = Stomp.over(socket);
    return stompClient;
};

export const enterChatRoom = (chatRoomId) => {
    return axios.post(`${API_URL}/chat-room/${chatRoomId}/enter`);
};

export const sendMessage = (chatRoomId, message) => {
    return axios.post(`${API_URL}/chat-room/${chatRoomId}/send-message`, { message });
};