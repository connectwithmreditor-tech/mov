import React, { useState, useEffect } from 'react';
import { getRepoContent, updateRepoContent } from '../services/githubService';
import '../styles/admin.css';

const HARDCODED_PAT = "";
const REPO_OWNER = "connectwithmreditor-tech";
const REPO_NAME = "mov";
const CONFIG_PATH = "config.json";

function Admin() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [pat, setPat] = useState("");
    const [config, setConfig] = useState(null);
    const [sha, setSha] = useState(null);
    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState("");
    const [statusType, setStatusType] = useState(""); // success, error, loading
    const [activeTab, setActiveTab] = useState("movies");

    // Login State
    const [loginPat, setLoginPat] = useState("");
    const [loginPass, setLoginPass] = useState("");

    // Timer
    const [timerVal, setTimerVal] = useState("");

    useEffect(() => {
        const session = localStorage.getItem("mv_admin_session");
        const storedPat = localStorage.getItem("mv_admin_pat");

        if (HARDCODED_PAT) {
            setPat(HARDCODED_PAT);
            if (session === "true") {
                setLoggedIn(true);
            }
        } else if (session === "true" && storedPat) {
            setPat(storedPat);
            setLoggedIn(true);
        }
    }, []);

    useEffect(() => {
        if (loggedIn && pat) {
            loadConfig();
        }
    }, [loggedIn, pat]);

    const loadConfig = async () => {
        setLoading(true);
        setStatus("Loading config from GitHub...", "loading");
        try {
            const data = await getRepoContent(pat, REPO_OWNER, REPO_NAME, CONFIG_PATH);
            const content = JSON.parse(decodeURIComponent(escape(atob(data.content))));
            setConfig(content);
            setSha(data.sha);
            // Initialize timer value from expiryTime
            if (content.expiryTime) {
                // Determine hours left or just set default
                // For simplicity, we just keep the input empty or set to current
            }
            setStatus("Config loaded successfully", "success");
        } catch (err) {
            console.error(err);
            setStatus("Failed to load config: " + err.message, "error");
            if (err.message.includes("401") || err.message.includes("403")) {
                handleLogout();
            }
        } finally {
            setLoading(false);
        }
    };

    const setStatus = (msg, type) => {
        setStatusMsg(msg);
        setStatusType(type);
        if (type === 'success' || type === 'error') {
            setTimeout(() => {
                setStatusMsg("");
                setStatusType("");
            }, 5000);
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (loginPass !== "Abd123*") {
            alert("Incorrect Password");
            return;
        }

        const tokenToUse = HARDCODED_PAT || loginPat;
        if (!tokenToUse) {
            alert("Please enter a GitHub PAT");
            return;
        }

        localStorage.setItem("mv_admin_session", "true");
        if (!HARDCODED_PAT) {
            localStorage.setItem("mv_admin_pat", tokenToUse);
        }
        setPat(tokenToUse);
        setLoggedIn(true);
    };

    const handleLogout = () => {
        localStorage.removeItem("mv_admin_session");
        if (!HARDCODED_PAT) {
            localStorage.removeItem("mv_admin_pat");
        }
        setLoggedIn(false);
        setPat("");
        setConfig(null);
    };

    const saveChanges = async () => {
        if (!config || !sha) return;
        setLoading(true);
        setStatus("Pushing changes to GitHub...", "loading");
        try {
            const res = await updateRepoContent(pat, REPO_OWNER, REPO_NAME, CONFIG_PATH, config, sha, "Update via Admin Panel");
            setSha(res.content.sha);
            setStatus("Changes saved successfully!", "success");
        } catch (err) {
            console.error(err);
            setStatus("Failed to save changes: " + err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const updateTimer = (hours) => {
        if (!config) return;
        const date = new Date();
        date.setHours(date.getHours() + hours);
        const newExpiry = date.toISOString();
        setConfig({ ...config, expiryTime: newExpiry });
        setStatus(`Timer set to ${hours} hours from now. Click Save to apply.`, "success");
    };

    const handleMovieChange = (index, field, value) => {
        const newMovies = [...config.movies];
        newMovies[index] = { ...newMovies[index], [field]: value };
        setConfig({ ...config, movies: newMovies });
    };

    const handleRecalculateQualities = (text) => {
        // This functionality was in admin.html to parse copied text. 
        // Implementation omitted for brevity, user can manually edit qualities or we can add it later.
    }

    if (!loggedIn) {
        return (
            <div className="login-overlay">
                <div className="login-card">
                    <h1 className="login-title">MovieAdmin</h1>
                    <form onSubmit={handleLogin}>
                        <input
                            type="password"
                            placeholder="Unlock Password"
                            value={loginPass}
                            onChange={e => setLoginPass(e.target.value)}
                            style={{ marginBottom: '10px' }}
                        />
                        {!HARDCODED_PAT && (
                            <input
                                type="text"
                                placeholder="GitHub PAT"
                                value={loginPat}
                                onChange={e => setLoginPat(e.target.value)}
                                style={{ marginBottom: '10px' }}
                            />
                        )}
                        {HARDCODED_PAT && (
                            <div style={{
                                color: '#81c784', fontSize: '0.8rem', marginBottom: '10px',
                                border: '1px solid #81c784', padding: '8px', borderRadius: '8px',
                                background: 'rgba(76, 175, 80, 0.1)'
                            }}>
                                🔒 Hardcoded Token Active
                            </div>
                        )}
                        <button type="submit" className="btn-primary">Login</button>
                    </form>
                </div>
            </div>
        );
    }

    if (!config) {
        return (
            <div className="admin-body" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ color: 'white' }}>Loading Dashboard...</div>
            </div>
        );
    }

    return (
        <div className="admin-body">
            <header className="admin-header">
                <div className="admin-header__logo">MovieAdmin</div>
                <div className="admin-header__sub">Control Panel</div>
                <div style={{ marginTop: '10px' }}>
                    <button onClick={handleLogout} style={{
                        background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer'
                    }}>Logout</button>
                </div>
            </header>

            <div className="admin-container">
                {statusMsg && (
                    <div className={`status status--${statusType}`}>
                        {statusMsg}
                    </div>
                )}

                {/* Timer Section */}
                <div className="section">
                    <div className="section__title">⏱️ Timer Settings</div>
                    <div className="timer-presets">
                        {[3, 4, 6, 12, 24].map(h => (
                            <button key={h} className="timer-btn" onClick={() => updateTimer(h)}>{h} Hours</button>
                        ))}
                    </div>
                    <div className="current-info">
                        <div className="info-chip">Expires: <strong>{new Date(config.expiryTime).toLocaleString()}</strong></div>
                    </div>
                </div>

                {/* Content Tabs */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <button
                        onClick={() => setActiveTab('movies')}
                        className={`timer-btn ${activeTab === 'movies' ? 'timer-btn--active' : ''}`}
                        style={{ flex: 1 }}
                    >
                        Movies ({config.movies.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`timer-btn ${activeTab === 'requests' ? 'timer-btn--active' : ''}`}
                        style={{ flex: 1 }}
                    >
                        Requests ({config.requests ? config.requests.length : 0})
                    </button>
                </div>

                {activeTab === 'movies' && (
                    <div>
                        {config.movies.map((movie, i) => (
                            <div key={i} className="movie-admin">
                                <div className="movie-admin__header">
                                    <img src={movie.poster} className="movie-admin__poster" alt="" />
                                    <div>
                                        <div className="movie-admin__title">{movie.title}</div>
                                        <div className="movie-admin__meta">{movie.year} • {movie.rating}</div>
                                    </div>
                                </div>
                                {/* Simplified editing for brevity */}
                                <div style={{ display: 'grid', gap: '8px' }}>
                                    <input
                                        type="text" value={movie.title}
                                        onChange={(e) => handleMovieChange(i, 'title', e.target.value)}
                                        placeholder="Title"
                                    />
                                    {/* Additional fields would go here */}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'requests' && (
                    <div>
                        {(!config.requests || config.requests.length === 0) && (
                            <div style={{ textAlign: 'center', opacity: 0.5, padding: '20px' }}>No requests yet</div>
                        )}
                        {config.requests && config.requests.map((req, i) => (
                            <div key={i} className="movie-admin" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{req.title}</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{new Date(req.date).toLocaleDateString()}</div>
                                </div>
                                <div>
                                    <span style={{
                                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem',
                                        background: req.status === 'approved' ? '#4caf50' : '#ff9800', color: 'white'
                                    }}>
                                        {req.status}
                                    </span>
                                </div>
                                {/* Approve/Reject buttons logic would go here */}
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ marginTop: '20px' }}>
                    <button onClick={saveChanges} className="btn-primary" disabled={loading}>
                        {loading ? 'Saving...' : '💾 Save all Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Admin;
