document.addEventListener("DOMContentLoaded", function() {
    // Set initial background
    document.body.style.background = "url(https://tccards.tn/Assets/bg.png) center fixed";
    document.body.style.backgroundSize = "cover";
    document.body.style.backdropFilter = "blur(5px)";
    
    // Extract identifier from URL hash
    const hash = window.location.hash.substring(1);
    if (!hash) {
        showError("No profile link provided");
        return;
    }

    // Determine if it's an ID or link lookup
    const isIdLookup = hash.startsWith('id_');
    const identifier = isIdLookup ? hash.split('_')[1] : hash;
    
    // Database configuration with plan types
    const databases = [
        {
            id: 'AKfycbxVpxX2Dt79ZIfW6lyhPhCUaJ7QaJJUHUsoD4CgQ3AR9dVntSpKRghnlWQM0TbSxla3-Q',
            plan: 'free'
        },
        {
            id: 'AKfycbxVpXpyDZHqvtTHTshPhCUaJdsf-dsfgddsggroD4CgQ3AR23ntSpKRlaerB6Qqw7er3-Q',
            plan: 'standard'
        }
    ];

    // Start searching databases
    searchDatabases(databases, identifier, isIdLookup);
});

// Enhanced database search with plan awareness
function searchDatabases(databases, identifier, isIdLookup, index = 0) {
    if (index >= databases.length) {
        showError("Profile not found in any database");
        return;
    }

    const db = databases[index];
    const callbackName = `profileCallback_${db.plan}_${Date.now()}`;
    
    window[callbackName] = function(data) {
        delete window[callbackName];
        
        if (data && data.status !== "error") {
            // Successfully found in this database
            handleProfileData(data, db.plan);
        } else {
            // Try next database
            searchDatabases(databases, identifier, isIdLookup, index + 1);
        }
    };

    try {
        const param = isIdLookup ? 'id' : 'link';
        const script = document.createElement("script");
        script.src = `https://script.google.com/macros/s/${db.id}/exec?${param}=${encodeURIComponent(identifier)}&callback=${callbackName}`;
        script.onerror = () => {
            document.body.removeChild(script);
            searchDatabases(databases, identifier, isIdLookup, index + 1);
        };
        document.body.appendChild(script);
    } catch (error) {
        console.error("Database search error:", error);
        searchDatabases(databases, identifier, isIdLookup, index + 1);
    }
}

// Enhanced profile handler with plan awareness
function handleProfileData(data, planType) {
    document.querySelector('.loader').style.display = 'none';
    
    if (!data || data.status === "error") {
        showError(data?.message || "Profile data could not be loaded");
        return;
    }
    
    if (data.Status && data.Status !== "Active") {
        showError("This profile is currently inactive");
        return;
    }

    try {
        // Apply plan-specific features
        const container = document.querySelector(".card-container");
        container.style.display = 'block';
        
        // Safe data access with fallbacks
        const profileData = {
            name: data.Name || 'User',
            tagline: data.Tagline || '',
            profilePic: data['Profile Picture URL'] || 'https://tccards.tn/Assets/default.png',
            bgImage: data['Background Image URL'] || '',
            formType: data['Form Type'] || '',
            socialLinks: data['Social Links'] || '',
            email: data.Email || '',
            phone: data.Phone || '',
            address: data.Address || ''
        };

        // Apply background style if available
        if (data['Selected Style']) {
            const styles = {
                corporateGradient: "linear-gradient(145deg, rgb(9, 9, 11), rgb(24, 24, 27), rgb(9, 9, 11))",
                oceanGradient: "linear-gradient(145deg, rgb(2, 6, 23), rgb(15, 23, 42), rgb(2, 6, 23))",
                default: "url(https://tccards.tn/Assets/bg.png) center fixed"
            };
            document.body.style.background = styles[data['Selected Style']] || styles.default;
            document.body.style.backgroundSize = "cover";
        }

        // Render the profile card
        container.innerHTML = `
            <div class="profile-container">
                ${planType === 'standard' && profileData.bgImage ? 
                    `<div class="profile-banner" style="background-image: url('${escapeHtml(profileData.bgImage)}')"></div>` : ''}
                
                <img src="${escapeHtml(profileData.profilePic)}" class="profile-picture" alt="${escapeHtml(profileData.name)}'s profile">
                
                <h2>${escapeHtml(profileData.name)}</h2>
                ${profileData.tagline ? `<p>${escapeHtml(profileData.tagline)}</p>` : ''}
                
                ${planType === 'standard' && profileData.formType ? 
                    `<div class="plan-badge">${escapeHtml(profileData.formType)} Plan</div>` : ''}
                
                ${renderSocialLinks(profileData.socialLinks)}
                
                ${(profileData.email || profileData.phone || profileData.address) ? 
                    `<button class="contact-btn" onclick="showContactDetails(${escapeHtml(JSON.stringify({
                        email: profileData.email,
                        phone: profileData.phone,
                        address: profileData.address
                    }))})">Get in Touch</button>` : ''}
                
                <footer>
                    <p>&copy; ${new Date().getFullYear()} Total Connect</p>
                </footer>
                
                ${planType === 'free' ? 
                    `<img src="https://tccards.tn/Assets/zfooter.gif" alt="Total Connect animation" class="mt-8">` : ''}
            </div>
        `;
        
        // Show success notification
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: "Profile Loaded",
                text: `Showing ${planType} plan profile`,
                icon: "success",
                timer: 2000,
                showConfirmButton: false
            });
        }
    } catch (error) {
        console.error("Profile rendering error:", error);
        showError("Error displaying profile");
    }
}

// Social links rendering
function renderSocialLinks(links) {
    if (!links || typeof links !== 'string') return '';

    const validLinks = links.split(",")
        .map(link => {
            link = link.trim();
            if (!link) return null;
            
            try {
                if (!/^https?:\/\//i.test(link)) link = 'https://' + link;
                const url = new URL(link);
                
                if (!/^([a-z0-9-]+\.)+[a-z]{2,}$/i.test(url.hostname)) return null;
                
                return {
                    href: url.href,
                    display: url.hostname.replace(/^www\./, '')
                };
            } catch (e) {
                return null;
            }
        })
        .filter(link => link !== null);

    if (!validLinks.length) return '';

    return `
        <div class="social-links">
            ${validLinks.map(link => `
                <a href="${escapeHtml(link.href)}" target="_blank" rel="noopener noreferrer">
                    <i class="fas fa-link"></i> ${escapeHtml(link.display)}
                </a>
            `).join('')}
        </div>
    `;
}

window.showContactDetails = function(contact) {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: "Contact Details",
            html: `
                ${contact.email ? `<p><strong>Email:</strong> ${escapeHtml(contact.email)}</p>` : ''}
                ${contact.phone ? `<p><strong>Phone:</strong> ${escapeHtml(contact.phone)}</p>` : ''}
                ${contact.address ? `<p><strong>Address:</strong> ${escapeHtml(contact.address)}</p>` : ''}
            `,
            icon: "info",
            confirmButtonText: "Close",
            background: "#1a1a1a",
            color: "white",
            confirmButtonColor: "#2563eb"
        });
    } else {
        alert(`Contact Details:\nEmail: ${contact.email || 'N/A'}\nPhone: ${contact.phone || 'N/A'}\nAddress: ${contact.address || 'N/A'}`);
    }
};

// XSS protection
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return unsafe;
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Error display
function showError(message) {
    const container = document.querySelector(".card-container") || document.body;
    container.innerHTML = `
        <div class="error-message">
            <h3 class="error-title">${escapeHtml(message)}</h3>
            <p class="error-subtext">Please check the URL or try again later.</p>
        </div>
    `;
    
    // Remove loading states
    document.body.classList.remove('loading');
    const existingLoader = document.querySelector('.loader');
    if (existingLoader) existingLoader.remove();
}
