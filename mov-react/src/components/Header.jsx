import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header className="header fade-in-up">
            <div style={{ width: '90px' }} />
            <div className="header__center">
                <div className="header__logo">MovieVault</div>
                <div className="header__tagline">Your Premium Movie Collection</div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
                <Link to="/admin" className="header__admin-btn">⚙️ Admin</Link>
            </div>
        </header>
    );
};

export default Header;
