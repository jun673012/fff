// src/services/websocketService.js

import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const SOCKET_URL = 'http://localhost:8080/ws';

let stompClient = null;

// 현재 사용자 ID를 가져오는 함수
const getCurrentUserId = () => {
    return localStorage.getItem('personId');
};

// WebSocket 연결 함수
export const connectWebSocket = (onNotificationReceived) => {
    const socket = new SockJS(SOCKET_URL);
    stompClient = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        debug: function (str) {
            console.log(str);
        },
        onConnect: () => {
            console.log('WebSocket 연결 성공');

            // 안 읽은 메시지 알림 구독
            stompClient.subscribe(`/topic/notifications/${getCurrentUserId()}`, (message) => {
                const notification = JSON.parse(message.body); // { chatRoomId: number, hasNewMessage: boolean }
                onNotificationReceived(notification);
            });
        },
        onStompError: (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        },
    });

    stompClient.activate();
};

// WebSocket 메시지 전송 함수
export const sendMessage = (chatRoomId, message) => {
    if (stompClient && stompClient.connected) {
        stompClient.publish({
            destination: `/app/chat/${chatRoomId}`,
            body: JSON.stringify(message),
        });
    } else {
        console.error('WebSocket 연결이 되어 있지 않습니다.');
    }
};

// WebSocket 연결 해제 함수
export const disconnectWebSocket = () => {
    if (stompClient) {
        stompClient.deactivate();
    }
};
