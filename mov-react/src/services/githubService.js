const BASE_URL = 'https://api.github.com';

export const getRepoContent = async (pat, owner, repo, path) => {
    const response = await fetch(`${BASE_URL}/repos/${owner}/${repo}/contents/${path}`, {
        headers: {
            'Authorization': `token ${pat}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    if (!response.ok) {
        throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
};

export const updateRepoContent = async (pat, owner, repo, path, content, sha, message) => {
    const body = {
        message: message,
        content: btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2)))), // Handle unicode
        sha: sha
    };

    const response = await fetch(`${BASE_URL}/repos/${owner}/${repo}/contents/${path}`, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${pat}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        throw new Error(`GitHub Update Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
};
