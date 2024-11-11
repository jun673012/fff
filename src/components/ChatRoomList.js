// src/components/ChatRoomList.js

import React, { useEffect, useState, useCallback } from 'react';
import { getChatRooms, createChatRoom, enterChatRoom } from '../services/chatService';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

function ChatRoomList() {
    const [chatRooms, setChatRooms] = useState([]);
    const [newChatRoomName, setNewChatRoomName] = useState('');
    const navigate = useNavigate();
    const personId = localStorage.getItem('personId');

    const stompClientRef = React.useRef(null);

    // 채팅방 목록을 서버로부터 가져오는 함수
    const fetchChatRooms = useCallback(async () => {
        try {
            const roomsResponse = await getChatRooms(); // personId가 세션에서 관리되는 경우
            const rooms = roomsResponse.data;

            setChatRooms(rooms);
        } catch (error) {
            console.error('채팅방 목록 불러오기 실패:', error);
            if (error.response) {
                console.error('응답 데이터:', error.response.data);
                console.error('응답 상태 코드:', error.response.status);
            }
        }
    }, []);

    useEffect(() => {
        fetchChatRooms();

        // WebSocket 연결 설정
        const socket = new SockJS('http://localhost:8080/ws'); // 백엔드 WebSocket 엔드포인트 확인
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            debug: (str) => {
                console.log(str);
            },
            onConnect: () => {
                console.log('WebSocket 연결 성공');

                // 안 읽은 메시지 알림 구독
                client.subscribe(`/topic/notifications/${personId}`, (message) => {
                    const notification = JSON.parse(message.body); // { chatRoomId: number, hasNewMessage: boolean }
                    handleNotificationReceived(notification);
                });

                // 새로운 채팅방 생성 알림 구독
                client.subscribe(`/topic/chatroom/created`, (message) => {
                    const newChatRoom = JSON.parse(message.body); // { id: number, chatRoomName: string }
                    handleNewChatRoomReceived(newChatRoom);
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        client.activate();
        stompClientRef.current = client;

        // 컴포넌트 언마운트 시 WebSocket 연결 해제
        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, [fetchChatRooms, personId]);

    // 안 읽은 메시지 알림을 처리하는 함수
    const handleNotificationReceived = (notification) => {
        console.log('수신한 알림:', notification); // 로그 추가
        const { chatRoomId, unreadCount } = notification;
        setChatRooms((prevRooms) =>
            prevRooms.map((room) =>
                room.chatRoomId === chatRoomId
                    ? { ...room, unreadCount: unreadCount }
                    : room
            )
        );
    };

    // 새로운 채팅방 생성 알림을 처리하는 함수
    const handleNewChatRoomReceived = (newChatRoom) => {
        console.log('새로운 채팅방 생성:', newChatRoom); // 로그 추가
        setChatRooms((prevRooms) => [...prevRooms, { ...newChatRoom, unreadCount: 0 }]);
    };

    // 채팅방 입장 처리 함수
    const handleEnterChatRoom = async (roomId) => {
        try {
            // 서버에 요청하여 채팅방 입장 처리
            await enterChatRoom(roomId); // API 호출
            navigate(`/chat/${roomId}`);
            // 채팅방 입장 후 안 읽은 메시지 수를 갱신하기 위해 채팅방 목록 다시 불러오기
            fetchChatRooms();
        } catch (error) {
            console.error('채팅방 입장 실패:', error);
            if (error.response) {
                console.error('응답 데이터:', error.response.data);
                console.error('응답 상태 코드:', error.response.status);
            }
        }
    };

    // 채팅방 생성 처리 함수
    const handleCreateChatRoom = async () => {
        if (newChatRoomName.trim() === '') {
            alert('채팅방 이름을 입력하세요.');
            return;
        }
        try {
            const newChatRoom = await createChatRoom(newChatRoomName);
            setNewChatRoomName('');
            fetchChatRooms();
        } catch (error) {
            console.error('채팅방 생성 실패:', error);
            if (error.response) {
                console.error('응답 데이터:', error.response.data);
                console.error('응답 상태 코드:', error.response.status);
            }
        }
    };

    return (
        <div>
            <Navbar />
            <h2>채팅방 목록</h2>
            <ul>
                {chatRooms.map((room) => (
                    <li key={room.chatRoomId} style={{ position: 'relative', marginBottom: '10px' }}>
                        <span>{room.chatRoomName}</span>
                        {room.unreadCount > 0 && (
                            <span style={{ color: 'red', marginLeft: '10px' }}>
                                🔴 {room.unreadCount}개의 안 읽은 메시지
                            </span>
                        )}
                        <button onClick={() => handleEnterChatRoom(room.chatRoomId)} style={{ marginLeft: '20px' }}>
                            입장
                        </button>
                    </li>
                ))}
            </ul>
            <div style={{ marginTop: '20px' }}>
                <h3>채팅방 생성</h3>
                <input
                    type="text"
                    placeholder="채팅방 이름"
                    value={newChatRoomName}
                    onChange={(e) => setNewChatRoomName(e.target.value)}
                />
                <button onClick={handleCreateChatRoom}>생성</button>
            </div>
        </div>
    );
}

export default ChatRoomList;
