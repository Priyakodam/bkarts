import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const Logout = () => {
    const navigate = useNavigate();
  

    const handleLogout = () => {
       
        console.log('Logged out');
        navigate('/admin');
    };

    return (
        <div>
            <FontAwesomeIcon 
                icon={faSignOutAlt} 
                className="logout-icon" 
                onClick={handleLogout} 
                style={{ cursor: 'pointer', color: 'red', fontSize: '24px' }} 
            />
        </div>
    );
};

export default Logout;