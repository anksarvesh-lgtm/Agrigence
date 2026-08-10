
(function() {
    const BUCKET = "gen-lang-client-0276037966.firebasestorage.app";
    const CONFIG_URL = `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/settings%2Fleadership.json?alt=media`;

    window.AgrigenceLeadership = {
        mount: async function(containerId) {
            const container = document.getElementById(containerId);
            if (!container) return console.warn("AgrigenceLeadership: Container not found");

            container.innerHTML = '<div style="text-align:center; padding: 20px; opacity: 0.5;">Loading Leadership...</div>';

            try {
                const res = await fetch(CONFIG_URL);
                if (!res.ok) throw new Error("Config not found");
                const data = await res.json();

                const html = `
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; max-width: 1000px; margin: 0 auto;">
                        ${data.map(m => `
                            <div style="text-align: center; font-family: 'Plus Jakarta Sans', sans-serif;">
                                <div style="width: 200px; height: 200px; margin: 0 auto 1.5rem; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px -10px rgba(0,0,0,0.2);">
                                    <img src="${m.photo}" alt="${m.name}" style="width: 100%; height: 100%; object-fit: cover;">
                                </div>
                                <h3 style="font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; color: #3D2B1F; margin-bottom: 0.25rem;">${m.name}</h3>
                                <p style="color: #C29263; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.2em;">${m.role}</p>
                            </div>
                        `).join('')}
                    </div>
                `;

                container.innerHTML = html;
            } catch (e) {
                console.error("AgrigenceLeadership Error:", e);
                container.innerHTML = ''; // Hide on error
            }
        }
    };
})();
