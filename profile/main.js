const CONFIG = {
  defaultBg: "url(https://tccards.tn/Assets/bg.png) center fixed",
  defaultProfilePic: "https://tccards.tn/Assets/default.png",
  googleScriptUrl: "https://script.google.com/macros/s/AKfycbyAQ9FTmH-zPAtPobZrni_XwraT8pGum0s4Qe_mWo79ij3Q_kV_x1fkN4Oe_TjCEckr/exec"
}

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

    // Update URL without reload
    const newUrl = `https://at.tccards.tn/@${hash}`;
    window.history.replaceState(null, null, newUrl);

    // Determine lookup type
    const isIdLookup = hash.startsWith("id_");
    const identifier = isIdLookup ? hash.split("_")[1] : hash;

    // ALWAYS show cached version first (if exists)
    showCachedProfileFirst(identifier, isIdLookup);
});

// Show cached version immediately, check for updates in background
async function showCachedProfileFirst(identifier, isIdLookup) {
    const cachedProfile = getCachedProfile(identifier);
    
    if (cachedProfile) {
        console.log('Showing cached profile immediately');
        handleProfileData(cachedProfile);
    } else {
        // No cache exists, show loader
        document.querySelector('.loader').style.display = 'block';
    }

    // ALWAYS check for updates in background (silent)
    try {
        console.log('Checking for profile updates in background...');
        const freshData = await loadFreshProfileData(identifier, isIdLookup);
        
        if (freshData) {
            // Cache the fresh data
            cacheProfile(identifier, freshData);
            
            // Only update UI if profile is different AND we already showed cached version
            if (cachedProfile && hasProfileChanged(cachedProfile.data, freshData.data)) {
                console.log('Profile updated, refreshing...');
                handleProfileData(freshData);
            } else if (!cachedProfile) {
                // If no cache existed, show the fresh data
                handleProfileData(freshData);
            }
        }
        // If fresh data fails, DO NOTHING - keep showing cached version
    } catch (error) {
        console.log('Background update failed, keeping cached version:', error.message);
        // DO NOTHING - keep showing cached version
    } finally {
        // Hide loader if it was shown
        document.querySelector('.loader').style.display = 'none';
    }
}

// Silent background fetch - no user feedback, no errors thrown
async function loadFreshProfileData(identifier, isIdLookup) {
    const param = isIdLookup ? "id" : "link";
    
    try {
        const response = await fetchWithTimeout(
            `${CONFIG.googleScriptUrl}?${param}=${encodeURIComponent(identifier)}`,
            { timeout: 8000 }
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
            console.log('Background update successful');
            return data;
        } else {
            throw new Error(data.message || 'Profile not found');
        }
    } catch (error) {
        // Silent fail - don't throw, just return null
        console.log('Background fetch failed (silent):', error.message);
        return null;
    }
}

// Cache management (NO EXPIRATION)
function cacheProfile(identifier, profileData) {
    try {
        const cacheKey = `profile_${identifier.toLowerCase()}`;
        const cacheData = {
            data: profileData,
            lastUpdated: Date.now()
            // NO EXPIRATION - profiles stay forever until updated
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        console.log('Profile cached');
    } catch (error) {
        console.warn('Could not cache profile:', error);
    }
}

function getCachedProfile(identifier) {
    try {
        const cacheKey = `profile_${identifier.toLowerCase()}`;
        const cached = localStorage.getItem(cacheKey);
        if (!cached) return null;
        
        return JSON.parse(cached);
    } catch (error) {
        console.error('Cache read error:', error);
        return null;
    }
}

// Check if profile data has meaningful changes
function hasProfileChanged(oldData, newData) {
    const importantFields = ['Name', 'Tagline', 'ProfilePic', 'SocialLinks', 'Email', 'Phone', 'Address', 'Style', 'Status'];
    
    return importantFields.some(field => {
        const oldValue = oldData[field] || '';
        const newValue = newData[field] || '';
        return oldValue !== newValue;
    });
}

// Helper function with timeout
async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 8000 } = options;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(resource, {
            ...options,
            signal: controller.signal,
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}

function handleProfileData(data) {
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.style.display = 'none';
    }
    
    // Open the data array received data.data to access the profile data
    data = data.data || data;

    // Check if data is valid
    if (!data || typeof data !== 'object') {
        showError("Invalid profile data received");
        return;
    }

    if (data.status === "error") {
        showError(data?.message || "Profile data could not be loaded");
        return;
    }
    
    if (!data.Name) {
        showError("Invalid profile data: Name is required");
        return;
    }
    
    if (data?.Status && data.Status !== "Active") {
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
            link: data.Link || 'tccards',
            tagline: data.Tagline || '',
            profilePic: data.ProfilePic || 'https://tccards.tn/Assets/default.png',
            socialLinks: data.SocialLinks || '',
            email: data.Email || '',
            phone: data.Phone || '',
            address: data.Address || ''
        };

        // Apply background style if available
        if (data.Style) {
            applyBackgroundStyle(data.Style);
        }

        // Render the profile card
        container.innerHTML = `
            <div class="w-full container max-w-md p-6 md:p-24 rounded-xl shadow-lg mx-auto" style="background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px);">
                <div class="flex justify-end mb-0 top-right" onclick="showShareOptions('${escapeHtml('https://at.tccards.tn/@' + profileData.link)}')">
                    <div class="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                        <i class="fas fa-share-alt text-gray-400"></i>
                    </div>
                </div>
                <div class="flex flex-col items-center">
                    <img src="${escapeHtml(profileData.profilePic)}" class="w-32 h-32 bg-gray-800 rounded-full mb-4 cover object-cover" alt="${escapeHtml(profileData.name)}'s profile" onerror="this.src='https://tccards.tn/Assets/default.png'">
                    <div class="w-full h-12 bg-gray-800 rounded mb-2 flex items-center justify-center">
                        <h1 class="text-xl text-2xl font-bold text-white">${escapeHtml(profileData.name)}</h1>
                    </div>
                    ${profileData.tagline ? `<div class="w-full h-6 bg-gray-800 rounded mb-4 flex items-center justify-center"><p class="text-gray-300">${escapeHtml(profileData.tagline)}</p></div>` : ''}
                    <div class="w-64 bg-transparent mb-4">
                        ${renderSocialLinks(profileData.socialLinks)}
                    </div>
                    ${(profileData.email || profileData.phone || profileData.address) ? 
                        `<div class="w-48 h-12 bg-gray-800 rounded mb-4 flex items-center justify-center">
                            <button class="contact-btn" onclick="showContactDetails(${escapeHtml(JSON.stringify({
                                name: profileData.name,
                                profilepic: profileData.profilePic,
                                email: profileData.email,
                                phone: profileData.phone,
                                address: profileData.address
                            }))})">Get in Touch</button>
                        </div>` : ''}
                </div>
                <div class="border-t border-gray-800">
                    <footer class="footer mt-4">
                            <div class="w-full h-4 bg-gray-800 rounded mb-2 mx-auto"><a href="https://tccards.tn"> Powered by &copy; Total Connect ${new Date().getFullYear()}</a></div>
                            <div class="w-1/2 h-4 bg-gray-800 rounded mx-auto"><a href="https://get.tccards.tn" target="_blank" style='color:springgreen'>Get Your Free Card</a></div>
                    </footer>
                </div>
            </div>
            `;
        
        console.log('Profile rendered successfully');
        
    } catch (error) {
        console.error("Profile rendering error:", error);
        showError("Error displaying profile");
    }
}

// Apply background style function
function applyBackgroundStyle(style) {
    const styles = {
        corporateGradient: "linear-gradient(145deg, rgb(9, 9, 11), rgb(24, 24, 27), rgb(9, 9, 11))",
        oceanGradient: "linear-gradient(145deg, rgb(2, 6, 23), rgb(15, 23, 42), rgb(2, 6, 23))",
        minimal: "#18181b",
        black: "#09090b",
        navy: "#020617",
        forest: "#022c22",
        wine: "#450a0a",
        clouds: "#0ea5e9",
        Pink: "#9b0055",
        SkyBlue: "#2563eb",
        paleRed: "#f00f4d"
    };

    if (style.startsWith('linear-gradient')) {
        document.body.style.background = style;
    } else {
        document.body.style.background = styles[style] || CONFIG.defaultBg;
    }
    document.body.style.backgroundSize = "cover";
}

function renderSocialLinks(links) {
    if (!links || typeof links !== 'string') return '';

    // Map of domains to their corresponding Font Awesome icons
    const platformIcons = {
        'facebook.com': 'fab fa-facebook',
        'fb.com': 'fab fa-facebook',
        'fb.me': 'fab fa-facebook',
        'messenger.com': 'fab fa-facebook-messenger',
        'm.me':'fab fa-facebook-messenger',
        'twitter.com': 'fab fa-twitter', 
        'x.com': 'fab fa-x-twitter',
        'instagram.com': 'fab fa-instagram',
        'linkedin.com': 'fab fa-linkedin',
        'youtube.com': 'fab fa-youtube',
        'tiktok.com': 'fab fa-tiktok',
        'pinterest.com': 'fab fa-pinterest',
        'snapchat.com': 'fab fa-snapchat',
        'reddit.com': 'fab fa-reddit',
        'discord.com': 'fab fa-discord',
        'twitch.tv': 'fab fa-twitch',
        'github.com': 'fab fa-github',
        'discord.gg': 'fab fa-discord',
        'cal.com': 'fas fa-calendar-alt',
        'calendly.com': 'fas fa-calendar-alt',
        'linktree.com': 'fas fa-link',
        'linktr.ee': 'fas fa-link',
        'tccards.tn': 'fas fa-id-card',
        'medium.com': 'fab fa-medium',
        'whatsapp.com': 'fab fa-whatsapp',
        'wa.me': 'fab fa-whatsapp',
        'dribbble.com': 'fab fa-dribbble',
        'behance.net': 'fab fa-behance',
        'telegram.org': 'fab fa-telegram',
        't.me': 'fab fa-telegram',
        'vimeo.com': 'fab fa-vimeo',
        'spotify.com': 'fab fa-spotify',
        'apple.com': 'fab fa-apple',
        'google.com': 'fab fa-google',
        'youtube-nocookie.com': 'fab fa-youtube',
        'soundcloud.com': 'fab fa-soundcloud',
        'paypal.com': 'fab fa-paypal',
        'github.io': 'fab fa-github',
        'stackoverflow.com': 'fab fa-stack-overflow',
        'quora.com': 'fab fa-quora'
    };

    const validLinks = links.split(",")
        .map(link => {
            link = link.trim();
            if (!link) return null;
            
            try {
                // Ensure URL has protocol
                if (!/^https?:\/\//i.test(link)) link = 'https://' + link;
                const url = new URL(link);
                const domain = url.hostname.replace(/^www\./, '');
                
                // Check if domain is in our platform icons
                const iconClass = Object.keys(platformIcons).find(key => 
                    domain.includes(key)
                ) ? platformIcons[Object.keys(platformIcons).find(key => domain.includes(key))] : 'fas fa-link';
                
                return {
                    href: url.href,
                    display: domain,
                    icon: iconClass
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
                <a href="${escapeHtml(link.href)}" target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 p-3 hover:bg-gray-700 rounded-lg transition-colors">
                    <i class="${link.icon} text-lg"></i>
                    <span>${escapeHtml(link.display)}</span>
                </a>
            `).join('')}
        </div>
    `;
}

async function showContactDetails(contact) {
    try {
        if (!contact || typeof contact !== 'object') {
            throw new Error('Invalid contact data');
        }

        const contactHtml = `
            <div class="contact-details-container">
                <div class="contact-header" style="display: flex; align-items: center; gap: 1rem; justify-content: center;">
                    <img src="${escapeHtml(contact.profilepic)}" class=" cover object-cover" alt="${escapeHtml(contact.name)}" onerror="this.src='https://tccards.tn/Assets/default.png'">
                    <h3 style="margin: 0;">${escapeHtml(contact.name)}</h3>
                </div>
            <div class="contact-table">
                ${contact.email ? `
                <div class="contact-row">
                    <div class="contact-icon"><i class="fas fa-envelope"></i></div>
                    <div class="contact-info">
                    <a href="mailto:${escapeHtml(contact.email)}" class="contact-link">${escapeHtml(contact.email)}</a>
                    </div>
                </div>` : ''}
                ${contact.phone ? `
                <div class="contact-row">
                    <div class="contact-icon"><i class="fas fa-phone"></i></div>
                    <div class="contact-info">
                    <a href="tel:${escapeHtml(contact.phone)}" class="contact-link">${escapeHtml(contact.phone)}</a>
                    </div>
                </div>` : ''}
                ${contact.address ? `
                <div class="contact-row">
                    <div class="contact-icon"><i class="fas fa-map-marker-alt"></i></div>
                    <div class="contact-info">
                    <a href="https://maps.google.com/?q=${encodeURIComponent(contact.address)}" target="_blank" class="contact-link">${escapeHtml(contact.address)}</a>
                    </div>
                </div>` : ''}
            </div>
            </div>
        `;

        const result = await Swal.fire({
            title: 'Contact Details',
            html: contactHtml,
            background: '#162949',
            confirmButtonText: 'Copy Details',
            showCancelButton: true,
            cancelButtonText: 'Close',
            color: '#fff',
            showLoaderOnConfirm: true,
            allowOutsideClick: false,
            customClass: {
                confirmButton: 'swal-confirm-button',
                cancelButton: 'swal-cancel-button'
            }
        });

        if (result.isConfirmed) {
            await copyContactDetails(contact);
        }

    } catch (error) {
        console.error('Error in showContactDetails:', error);
        await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Could not display contact details',
            background: '#1a1a1a',
            color: '#fff'
        });
    }
}

async function copyContactDetails(contact) {
    try {
        const contactText = [
            contact.name,
            contact.email && `Email: ${contact.email}`,
            contact.phone && `Phone: ${contact.phone}`,
            contact.address && `Address: ${contact.address}`
        ].filter(Boolean).join('\n');

        await navigator.clipboard.writeText(contactText);

        await Swal.fire({
            icon: 'success',
            title: 'Copied!',
            toast: true,
            position: 'center',
            showConfirmButton: false,
            timer: 2000,
            background: '#1a1a1a',
            color: '#fff'
        });
    } catch (error) {
        console.error('Copy failed:', error);
        throw new Error('Failed to copy contact details');
    }
}

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

async function showShareOptions(link) {
    try {
        // Check if Web Share API is supported
        if (navigator.share) {
            await navigator.share({
                title: 'Check out this profile',
                text: 'View my digital business card',
                url: link
            });
        } else {
            // Fallback for browsers that don't support Web Share API
            const shareHtml = `
                <div class="share-options">
                    <h3>Share this profile</h3>
                    <div class="share-links">
                        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}" target="_blank" class="share-link facebook">Facebook</a>
                        <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(link)}" target="_blank" class="share-link twitter">Twitter</a>
                        <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}" target="_blank" class="share-link linkedin">LinkedIn</a>
                        <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(link)}" target="_blank" class="share-link whatsapp">WhatsApp</a>
                    </div>
                </div>
            `;

            Swal.fire({
                title: 'Share Profile',
                html: shareHtml,
                showCancelButton: true,
                cancelButtonText: 'Close',
                background: '#162949',
                color: '#fff',
                customClass: {
                    confirmButton: 'swal-confirm-button',
                    cancelButton: 'swal-cancel-button'
                }
            });
        }
    } catch (error) {
        console.error('Error sharing:', error);
    }
}