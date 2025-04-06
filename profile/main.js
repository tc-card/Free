document.addEventListener("DOMContentLoaded", function() {
    // Set initial background
    document.body.style.background = "url(https://tccards.tn/Assets/bg.png) center fixed";
    document.body.style.backgroundSize = "cover";
    document.body.style.backdropFilter = "blur(5px)";
    
    // Extract link from URL path /profile/{link}
    const pathParts = window.location.hash.split('/');
    const link = pathParts[pathParts.length - 1];
    
    if (!link) {
        showError("No profile link provided in URL");
        return;
    }

    // Create unique callback
    const callbackName = 'profileCallback_' + Math.random().toString(36).substring(2, 9);
    window[callbackName] = function(data) {
        handleProfileData(data);
        delete window[callbackName];
    };

    // Start searching databases
    searchDatabases([
        'AKfycbxVpxX2Dt79ZIfW6lyhPhCUaJ7QaJJUHUsoD4CgQ3AR9dVntSpKRghnlWQM0TbSxla3-Q', // free database id
        'AKfycbxVpXpyDZHqvtTHTshPhCUaJdsf-dsfgddsggroD4CgQ3AR23ntSpKRlaerB6Qqw7er3-Q', // standard database id
    ], link, callbackName);
});

// Handle profile data response - UPDATED
function handleProfileData(data) {
    if (!data || data.status === "error") {
        showError(data?.message || "Profile data could not be loaded");
        return;
    }
    
    if (data.Status && data.Status !== "Active") {
        showError("This profile is currently inactive");
        return;
    }

    try {
        const planType = getPlanType(data);
        renderProfileCard(data, planType);
    } catch (error) {
        console.error("Profile rendering error:", error);
        showError("Error displaying profile");
    }
}

// Determine plan type - IMPROVED
function getPlanType(data) {
    // Check for standard plan features first
    if (data['Form Type'] && data['Background Image URL']) {
        return 'standard';
    }
    // Then check for basic features
    if (data['Background Image URL']) {
        return 'basic';
    }
    // Fallback to free
    return 'free';
}

// Render profile card - ENHANCED
function renderProfileCard(data, planType) {
    const container = document.querySelector(".card-container");
    if (!container) {
        console.error("Container element not found");
        return;
    }

    // Safe data access with fallbacks
    const profilePic = data['Profile Picture URL'] || 'https://www.tccards.tn/Assets/default.png';
    const name = data.Name || 'User';
    const tagline = data.Tagline || '';
    const bgImage = data['Background Image URL'] || '';
    const formType = data['Form Type'] || '';
    const socialLinks = data['Social Links'] || '';

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

    // Build profile HTML - SAFER with template literals
    container.innerHTML = `
        <div class="profile-container">
            ${planType === 'standard' && bgImage ? 
                `<div class="profile-banner" style="background-image: url('${escapeHtml(bgImage)}')"></div>` : ''}
            
            <img src="${escapeHtml(profilePic)}" class="profile-picture" alt="${escapeHtml(name)}'s profile picture">
            
            <h2>${escapeHtml(name)}</h2>
            ${tagline ? `<p>${escapeHtml(tagline)}</p>` : ''}
            
            ${planType === 'standard' && formType ? 
                `<div class="plan-badge">${escapeHtml(formType)}</div>` : ''}
            
            ${renderSocialLinks(socialLinks)}
            
            ${(data.Email || data.Phone || data.Address) ? 
                `<button class="contact-btn" onclick="showContactDetails(${escapeHtml(JSON.stringify({
                    email: data.Email || '',
                    phone: data.Phone || '',
                    address: data.Address || ''  // Fixed typo from Address to Address
                }))})">Get in Touch</button>` : ''}
            
            <footer>
                <p>&copy; ${new Date().getFullYear()} Total Connect</p>
            </footer>
            
            ${planType === 'free' ? 
                `<img src="https://tccards.tn/Assets/zfooter.gif" alt="cute animation" class="mt-8">` : ''}
        </div>
    `;
}

// Social links renderer - MORE SECURE
function renderSocialLinks(links) {
    if (!links || typeof links !== 'string') return '';

    const validLinks = links.split(",")
        .map(link => {
            link = link.trim();
            if (!link) return null;
            
            try {
                // Ensure URL has protocol
                if (!/^https?:\/\//i.test(link)) link = 'https://' + link;
                const url = new URL(link);
                
                // More flexible domain validation
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

// Database search function - MORE ROBUST
function searchDatabases(databases, link, callbackName, index = 0) {
    if (index >= databases.length) {
        showError("Profile not found in any database");
        return;
    }

    try {
        const script = document.createElement("script");
        script.src = `https://script.google.com/macros/s/${databases[index]}/exec?link=${encodeURIComponent(link)}&callback=${callbackName}`;
        script.onerror = () => {
            document.body.removeChild(script);
            searchDatabases(databases, link, callbackName, index + 1);
        };
        document.body.appendChild(script);
    } catch (error) {
        console.error("Database search error:", error);
        searchDatabases(databases, link, callbackName, index + 1);
    }
}

// Error display - IMPROVED
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

// Contact modal - MAINTAINED
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

// Helper function to prevent XSS
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return unsafe;
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}