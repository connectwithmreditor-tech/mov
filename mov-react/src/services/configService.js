const DEFAULT_CONFIG = {
    "expiryTime": new Date(Date.now() + 86400000).toISOString(),
    "movies": [],
    "requests": []
};

export const fetchConfig = async () => {
    try {
        const res = await fetch('/config.json?t=' + Date.now());
        if (!res.ok) throw new Error("Failed to load config");
        const data = await res.json();
        return data;
    } catch (err) {
        console.warn("Config fetch failed, using default:", err);
        return DEFAULT_CONFIG;
    }
};
