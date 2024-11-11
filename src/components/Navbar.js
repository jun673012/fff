// src/components/Navbar.js

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';

function Navbar() {
    const navigate = useNavigate();
    const personId = localStorage.getItem('personId');

    const handleLogout = async () => {
        try {
            await logout();
            localStorage.removeItem('personId');
            navigate('/login');
        } catch (error) {
            console.error('로그아웃 실패:', error);
        }
    };

    return (
        <nav>
            {personId ? (
                <>
                    <span>{personId}님 환영합니다.</span>
                    <button onClick={handleLogout}>로그아웃</button>
                </>
            ) : (
                <>
                    <Link to="/login">로그인</Link>
                    <Link to="/register">회원가입</Link>
                </>
            )}
        </nav>
    );
}

export default Navbar;
