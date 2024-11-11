// src/components/Register.js

import React, { useState } from 'react';
import { register, login } from '../services/authService';
import { useNavigate } from 'react-router-dom';

function Register() {
    const [personId, setPersonId] = useState('');
    const [personName, setPersonName] = useState('');
    const [personPassword, setPersonPassword] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const navigate = useNavigate();

    const handleRegister = async () => {
        try {
            await register(personId, personName, personPassword, profilePicture);
            // 회원가입 후 자동 로그인 및 메인 페이지로 이동
            await login(personId, personPassword);
            localStorage.setItem('personId', personId);
            navigate('/');
        } catch (error) {
            console.error('회원가입 실패:', error);
        }
    };

    return (
        <div>
            <h2>회원가입</h2>
            <input
                type="text"
                placeholder="아이디"
                value={personId}
                onChange={(e) => setPersonId(e.target.value)}
            />
            <input
                type="text"
                placeholder="이름"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
            />
            <input
                type="password"
                placeholder="비밀번호"
                value={personPassword}
                onChange={(e) => setPersonPassword(e.target.value)}
            />
            <input
                type="text"
                placeholder="프로필 사진 URL"
                value={profilePicture}
                onChange={(e) => setProfilePicture(e.target.value)}
            />
            <button onClick={handleRegister}>회원가입</button>
        </div>
    );
}

export default Register;
