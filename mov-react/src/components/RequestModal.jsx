import React, { useState } from 'react';

const RequestModal = ({ visible, onClose, onRequestSubmit }) => {
    const [title, setTitle] = useState("");

    if (!visible) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        onRequestSubmit(title);
        setTitle("");
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.8)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div className="fade-in-up" style={{
                background: '#16213e', padding: '30px', borderRadius: '16px',
                width: '90%', maxWidth: '400px', border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}>
                <h2 style={{ marginBottom: '20px', color: '#e94560' }}>Request a Movie</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter movie name..."
                        style={{
                            width: '100%', padding: '12px', borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(0,0,0,0.2)', color: 'white',
                            marginBottom: '20px', outline: 'none'
                        }}
                        autoFocus
                    />
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={onClose} style={{
                            padding: '8px 16px', borderRadius: '8px', border: 'none',
                            background: 'transparent', color: 'rgba(255,255,255,0.6)',
                            cursor: 'pointer'
                        }}>Cancel</button>
                        <button type="submit" style={{
                            padding: '8px 20px', borderRadius: '8px', border: 'none',
                            background: '#e94560', color: 'white', fontWeight: 'bold',
                            cursor: 'pointer'
                        }}>Submit Request</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RequestModal;
