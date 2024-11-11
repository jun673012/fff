// src/components/Login.js

import React, { useState } from 'react';
import { login } from '../services/authService';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [personId, setPersonId] = useState('');
    const [personPassword, setPersonPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        console.log('handleLogin 함수 실행됨');
        try {
            await login(personId, personPassword);
            localStorage.setItem('personId', personId);
            navigate('/'); // 로그인 후 메인 페이지로 이동
        } catch (error) {
            console.error('로그인 실패:', error);
        }
    };

    return (
        <div>
            <h2>로그인</h2>
            <input
                type="text"
                placeholder="아이디"
                value={personId}
                onChange={(e) => setPersonId(e.target.value)}
            />
            <input
                type="password"
                placeholder="비밀번호"
                value={personPassword}
                onChange={(e) => setPersonPassword(e.target.value)}
            />
            <button onClick={handleLogin}>로그인</button>
        </div>
    );
}

export default Login;
