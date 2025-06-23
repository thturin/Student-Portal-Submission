import React from 'react';

const LogoutButton = ({onLogout}) =>{
    return (
    <button
            onClick={onLogout}
            style={{
                padding: '6px 16px',
                fontWeight: 'bold',
                position: 'absolute',
                top: 20,
                right: 20
            }}
        >
            Logout
        </button>
    );
};

export default LogoutButton;