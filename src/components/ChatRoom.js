// src/components/ChatRoom.js

import React, { useEffect, useState } from 'react';
import { getChatMessages, connectWebSocket } from '../services/chatService';
import { useParams } from 'react-router-dom';
import { joinChatRoom, markMessagesAsRead } from '../services/chatService';

function ChatRoom() {
    const { roomId } = useParams();
    const [messages, setMessages] = useState([]);
    const [messageContent, setMessageContent] = useState('');
    const [stompClient, setStompClient] = useState(null);
    const personId = localStorage.getItem('personId'); // 로그인 시 저장했다고 가정

    useEffect(() => {
        const initializeChat = async () => {
            try {
                await joinChatRoom(roomId); // 채팅방 참가
                await fetchMessages();
                await markMessagesAsRead(roomId);
            } catch (error) {
                console.error('채팅방 초기화 실패:', error);
            }
        };

        initializeChat();
        fetchMessages();
        const client = connectWebSocket();
        client.connect({}, () => {
            client.subscribe(`/topic/chatroom/${roomId}`, (messageOutput) => {
                const message = JSON.parse(messageOutput.body);
                setMessages((prevMessages) => [...prevMessages, message]);

                // 새로운 메시지를 받았을 때 읽음 처리
                markMessagesAsRead(roomId)
                    .then(() => {
                        console.log('새 메시지를 읽은 것으로 처리되었습니다.');
                    })
                    .catch((error) => {
                        console.error('새 메시지 읽음 처리 실패:', error);
                    });
            });
        });
        setStompClient(client);

        return () => {
            if (client) {
                client.disconnect();
            }
        };
    }, [roomId]);

    const fetchMessages = async () => {
        try {
            const response = await getChatMessages(roomId);
            setMessages(response.data.reverse());
        } catch (error) {
            console.error('메시지 불러오기 실패:', error);
        }
    };

    const sendMessage = () => {
        if (stompClient && messageContent.trim() !== '') {
            const message = {
                personId,
                message: messageContent,
                timestamp: new Date(),
            };
            stompClient.send(`/app/chat/${roomId}`, {}, JSON.stringify(message));
            setMessageContent('');
        }
    };

    return (
        <div>
            <h2>채팅방 {roomId}</h2>
            <div>
                {messages.map((msg, index) => (
                    <div key={index}>
                        <strong>{msg.personId}</strong>: {msg.message}
                    </div>
                ))}
            </div>
            <input
                type="text"
                placeholder="메시지를 입력하세요"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
            />
            <button onClick={sendMessage}>전송</button>
        </div>
    );
}

export default ChatRoom;
