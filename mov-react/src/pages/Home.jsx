import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import BackgroundGlows from '../components/BackgroundGlows';
import RequestCloud from '../components/RequestCloud';
import RequestModal from '../components/RequestModal';
import MoviePoster from '../components/MoviePoster';
import DownloadSection from '../components/DownloadSection';
import { fetchConfig } from '../services/configService';
import '../styles/index.css';

// Helper to parse config
function parseConfig(config) {
    const expiresAt = new Date(config.expiryTime).getTime();
    const classMap = { "480p": "dl-btn--480", "720p": "dl-btn--720", "1080p": "dl-btn--1080" };
    return config.movies.map(m => ({
        title: m.title,
        poster: m.poster,
        rating: m.rating,
        year: m.year,
        duration: m.duration,
        genre: m.genre,
        qualities: m.qualities.map(q => ({
            label: q.label,
            size: q.size,
            url: q.url,
            className: classMap[q.label] || "dl-btn--480",
            expiresAt: expiresAt,
        })),
    }));
}

function Home() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [toastMsg, setToastMsg] = useState("");
    const [toastVisible, setToastVisible] = useState(false);
    const [now, setNow] = useState(Date.now());
    const [requests, setRequests] = useState([]);
    const [requestModalOpen, setRequestModalOpen] = useState(false);

    // Timer effect
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    // Fetch Config effect
    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchConfig();
                // Merge active requests if present in config
                if (data.requests) {
                    setRequests(prev => [...data.requests, ...prev]);
                }
                setMovies(parseConfig(data));
                setLoading(false);
            } catch (err) {
                console.error("Failed to load config:", err);
                setError("Failed to load movie data.");
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const showToast = useCallback((msg, duration = 3000) => {
        setToastMsg(msg);
        setToastVisible(true);
        const timer = setTimeout(() => setToastVisible(false), duration);
        return () => clearTimeout(timer);
    }, []);

    const handleRequestSubmit = useCallback((title) => {
        const newRequest = { title, status: 'pending', date: new Date().toISOString() };
        setRequests(prev => [newRequest, ...prev]);
        setRequestModalOpen(false);
        showToast("Request submitted for approval! 🚀");
    }, [showToast]);

    const handleDownload = useCallback((quality) => {
        // Simple download handler
        if (!quality.url || quality.url === '#') {
            showToast("Link not available");
            return;
        }

        showToast(`Starting ${quality.label} download (${quality.size})...`);
        let count = 3;
        const interval = setInterval(() => {
            count--;
            if (count > 0) {
                showToast(`Download starting in ${count}...`);
            } else {
                clearInterval(interval);
                showToast(`Downloading ${quality.label} version...`);
                window.open(quality.url, "_blank");
                setTimeout(() => showToast(`${quality.label} download started! ✅`, 3500), 2000);
            }
        }, 1000);
    }, [showToast]);

    if (loading) {
        return (
            <div style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                height: '100vh', color: 'rgba(255,255,255,0.5)', fontSize: '1.2rem',
                background: 'var(--dark)'
            }}>
                Loading MovieVault...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                height: '100vh', color: '#ef9a9a', fontSize: '1.2rem', flexDirection: 'column',
                background: 'var(--dark)'
            }}>
                <div>⚠️ {error}</div>
                <button onClick={() => window.location.reload()} style={{
                    marginTop: '20px', padding: '10px 20px', background: 'white',
                    border: 'none', borderRadius: '5px', cursor: 'pointer', color: '#333'
                }}>Retry</button>
            </div>
        );
    }

    return (
        <div className="home-page">
            <BackgroundGlows />
            <Header />

            <main className="main" style={{ marginTop: '100px' }}>
                <div className="fade-in-up">
                    <button onClick={() => setRequestModalOpen(true)} className="hero-request-btn">
                        💬 Request a Movie
                    </button>
                </div>

                <RequestCloud requests={requests} />

                {movies.map((movie, i) => (
                    <div key={i} className="movie-card fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                        <MoviePoster movie={movie} />
                        <DownloadSection qualities={movie.qualities} onDownload={handleDownload} now={now} />
                    </div>
                ))}
            </main>
            <Footer />
            <Toast message={toastMsg} visible={toastVisible} />
            <RequestModal
                visible={requestModalOpen}
                onClose={() => setRequestModalOpen(false)}
                onRequestSubmit={handleRequestSubmit}
                requests={requests}
            />
        </div>
    );
}

export default Home;
