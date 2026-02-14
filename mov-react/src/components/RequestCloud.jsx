import React from 'react';

const RequestCloud = ({ requests }) => {
    const approved = requests.filter(r => r.status === 'approved');

    if (approved.length === 0) return null;

    return (
        <div className="floating-cloud fade-in-up fade-in-up--d2">
            {approved.map((req, i) => (
                <div key={i} className="cloud-tag" style={{
                    animationDuration: `${5 + (i % 3)}s`,
                    animationDelay: `${i * 0.5}s`
                }}>
                    ✨ {req.title}
                </div>
            ))}
        </div>
    );
};

export default RequestCloud;
