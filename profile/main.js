const CONFIG = {
  defaultBg: "url(https://tccards.tn/Assets/bg.png) center fixed",
  defaultProfilePic: "https://tccards.tn/Assets/default.png",
  databases: {
    id: "AKfycbxKk2ihdfSzAD5qt6cMHmTRHhEyncyfK3Qlmu4ncc2NHuOigltcG837_gNxfbdjg2lE",
    plan: "free"
  },
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

  // Determine lookup type and start search
  const isIdLookup = hash.startsWith("id_");
  const identifier = isIdLookup ? hash.split("_")[1] : hash;

  searchProfile(identifier, isIdLookup);
});

// Fast profile lookup using single database, redirects to 404.html on error
async function searchProfile(identifier, isIdLookup) {
  try {
    const param = isIdLookup ? "id" : "link";
    const url = `https://script.google.com/macros/s/${CONFIG.databases.id}/exec?${param}=${encodeURIComponent(identifier)}`;

    const response = await fetchWithTimeout(url, {
      timeout: 5000
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    if (data?.status === "error") {
      showError("Profile not found");
      window.location.href = "/404.html";
      return;
    }

    if (data && typeof data === "object") {
      handleProfileData(data);
    } else {
      showError("Invalid profile data");
    }
  } catch (error) {
    console.error("Profile search error:", error);
    showError("Failed to load profile");
  }
}

// Helper function with timeout
async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 8000 } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(resource, {
    ...options,
    signal: controller.signal,
  });
  clearTimeout(id);

  return response;
}
function handleProfileData(data, plan) {
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.style.display = 'none';
    }
    // Open the data array received data.data to access the profile data
    data = data.data || data;
    plan = plan || 'free';
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
            profilePic: data['Profile Picture URL'] || 'https://tccards.tn/Assets/default.png',
            socialLinks: data['Social Links'] || '',
            email: data.Email || '',
            phone: data.Phone || '',
            address: data.Address || ''
        };

        // Apply background style if available
        if (data['Selected Style']) {
            const selectedStyle = data['Selected Style'];
            
            if (selectedStyle.startsWith('linear-gradient')) {
            document.body.style.background = `${selectedStyle}`;
            } else {
            const styles = {
              
                // Professional Gradients
                corporateGradient: { background: 'linear-gradient(145deg, rgb(9, 9, 11), rgb(24, 24, 27), rgb(9, 9, 11))' },
                oceanGradient: { background: 'linear-gradient(145deg, rgb(2, 6, 23), rgb(15, 23, 42), rgb(2, 6, 23))' },
                default: "url(https://tccards.tn/Assets/bg.png) center fixed"
            };

            document.body.style.background = styles[data['Selected Style']]?.background || styles.default;
            document.body.style.backgroundSize = "cover";
            }
        }
        const styles = {
            corporateGradient: "linear-gradient(145deg, rgb(9, 9, 11), rgb(24, 24, 27), rgb(9, 9, 11))",
            oceanGradient: "linear-gradient(145deg, rgb(2, 6, 23), rgb(15, 23, 42), rgb(2, 6, 23))",
            minimal: { background: '#18181b' },
            black: { background: '#09090b' },
            navy: { background: '#020617' },
            forest: { background: '#022c22' },
            wine: { background: '#450a0a' },
          
            // Lighter color themes
            clouds: { background: '#0ea5e9' },
            Pink: { background: '#9b0055' },
            SkyBlue: { background: '#2563eb' },
            paleRed: { background: '#f00f4d' },
          
            // Professional Gradients
            corporateGradient: { background: 'linear-gradient(145deg, rgb(9, 9, 11), rgb(24, 24, 27), rgb(9, 9, 11))' },
            oceanGradient: { background: 'linear-gradient(145deg, rgb(2, 6, 23), rgb(15, 23, 42), rgb(2, 6, 23))' },
            forestGradient: { background: 'linear-gradient(145deg, rgb(2, 44, 34), rgb(6, 78, 59), rgb(2, 44, 34))' },
            burgundyGradient: { background: 'linear-gradient(145deg, rgb(69, 10, 10), rgb(127, 29, 29), rgb(69, 10, 10))' },
            default: "url(https://tccards.tn/Assets/bg.png) center fixed"
        };
        // Render the profile card
        container.innerHTML = `
        <center>
            <div class="profile-container">
            <div class="top-right" onclick="showShareOptions('${escapeHtml(profileData.link)}')">
            <i class="fas fa-share-alt"></i>
            </div>
            
            <img src="${escapeHtml(profileData.profilePic)}" class="profile-picture" alt="${escapeHtml(profileData.name)}'s profile">
            
            <h2>${escapeHtml(profileData.name)}</h2>
            ${profileData.tagline ? `<p>${escapeHtml(profileData.tagline)}</p>` : ''}
            
            ${renderSocialLinks(profileData.socialLinks)}
            
            ${(profileData.email || profileData.phone || profileData.address) ? 
                `<button class="contact-btn" onclick="showContactDetails(${escapeHtml(JSON.stringify({
                name: profileData.name,
                profilepic: profileData.profilePic,
                email: profileData.email,
                phone: profileData.phone,
                address: profileData.address,
                style: styles[data['Selected Style']]?.background || styles.default
                }))})">Get in Touch</button>` : ''}

            <footer class="footer">
            <p>Powered by &copy; Total Connect ${new Date().getFullYear()}  </p>
            <p><a href="https://get.tccards.tn" target="_blank" style='color:springgreen'>Get Your Free Card</a></p>
            </footer>
            </div>
        </center>
        `;
        
        // Show simple success notification
        try {
            if (typeof Swal !== 'undefined' && profileData) {
                console.log('Profile found and loaded')
            }
        } catch (error) {
            console.error('Error showing welcome message:', error);
        }
    } catch (error) {
        console.error("Profile rendering error:", error);
        showError("Error displaying profile");
    }
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
            <div class="contact-header">
                <img src="${escapeHtml(contact.profilepic)}" class="profile-picture" alt="${escapeHtml(contact.name)}" onerror="this.src='https://tccards.tn/Assets/default.png'">
                <h3>${escapeHtml(contact.name)}</h3>
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
            background: typeof contact.style === 'object' ? contact.style?.background : contact.style || '#162949',
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

function showShareOptions(link) {
    
    username = `https://at.tccards.tn/@${link}`;
    // Generate a profile image with initials as fallback
    const profileName = document.querySelector('h2')?.textContent || 'User';
    const profileImage = document.querySelector('.profile-picture')?.src || 
        `<div class="avatar-fallback" style="background-color: ${stringToColor(profileName)}">
            ${getInitials(profileName)}
        </div>`;
    

    Swal.fire({
        title: 'Share Profile',
        html: `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <!-- Header with close button -->
                <div class="flex justify-end p-3">
                <button onclick="closeSharePopup()" class="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                </div>
                
                <!-- Profile section -->
                <div class="px-6 pb-2 text-center">
                <div class="mx-auto w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold mb-3">
                    {{ initials }}
                </div>
                <h3 class="text-lg font-semibold text-gray-800">@{{ username }}</h3>
                <p class="text-gray-500 text-sm mt-1">Share my profile with friends</p>
                </div>
                
                <!-- Link copy section -->
                <div class="px-6 py-4">
                <div class="flex border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                    <input 
                    type="text" 
                    value="{{ shareLink }}" 
                    readonly
                    class="flex-1 px-4 py-2 text-gray-700 truncate focus:outline-none"
                    >
                    <button 
                    onclick="copyShareLink()"
                    class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 flex items-center gap-2 transition-colors"
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    <span class="hidden sm:inline">Copy</span>
                    </button>
                </div>
                <p id="copy-message" class="text-center text-blue-500 text-xs mt-1 h-4 opacity-0 transition-opacity">Link copied!</p>
                </div>
                
                <!-- Social sharing buttons -->
                <div class="px-6 py-3 border-t border-gray-100">
                <p class="text-center text-gray-500 text-sm mb-3">Or share via</p>
                <div class="flex justify-center gap-3 flex-wrap">
                    <!-- Facebook -->
                    <button onclick="shareTo('facebook')" class="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                    </svg>
                    </button>
                    
                    <!-- WhatsApp -->
                    <button onclick="shareTo('whatsapp')" class="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    </button>
                    
                    <!-- Twitter -->
                    <button onclick="shareTo('twitter')" class="w-10 h-10 rounded-full bg-blue-400 text-white flex items-center justify-center hover:bg-blue-500 transition-colors">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                    </svg>
                    </button>
                    
                    <!-- LinkedIn -->
                    <button onclick="shareTo('linkedin')" class="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center hover:bg-blue-800 transition-colors">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                    </button>
                    
                    <!-- Telegram -->
                    <button onclick="shareTo('telegram')" class="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                    </svg>
                    </button>
                    
                    <!-- Email -->
                    <button onclick="shareTo('email')" class="w-10 h-10 rounded-full bg-gray-600 text-white flex items-center justify-center hover:bg-gray-700 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    </button>
                </div>
                </div>
                
                <!-- CTA section -->
                <div class="px-6 py-4 bg-gray-50 text-center">
                <button onclick="window.location.href='https://tccards.tn/plans/free'" class="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium py-2 px-6 rounded-full hover:shadow-md transition-all">
                    Get Started - It's Free
                </button>
                </div>
    
        `,
        showConfirmButton: false,
        showCloseButton: true,
        maxWidth: '600px',
        width: '90%',
        background: '#ffffff',
        customClass: {
            popup: 'tc-share-popup',
            closeButton: 'tc-close-btn'
        },
        footer: `

            <!-- Footer links -->
            <div class="px-6 py-3 border-t border-gray-100 flex justify-center gap-4 text-xs text-gray-500">
            <a href="https://tccards.tn/terms" class="hover:text-blue-500">Terms</a>
            <a href="https://tccards.tn/privacy" class="hover:text-blue-500">Privacy</a>
            <a href="https://tccards.tn/help" class="hover:text-blue-500">Help</a>
            </div>
        </div>
        </div>
        `
    });
}
function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 60%)`;
}

function getInitials(name) {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().substring(0, 2);
}

// Add these helper functions
function copyShareLink() {
    const input = document.getElementById('tc-share-link-input');
    input.select();
    document.execCommand('copy');
    Swal.fire({
        title: 'Copied!',
        text: 'Link copied to clipboard',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
    });
}

function shareTo(platform) {
    const shareLink = document.getElementById('tc-share-link-input').value;
    const shareText = `Check out my digital profile: ${shareLink}`;
    
    let url = '';
    switch(platform) {
        case 'facebook':
            url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`;
            break;
        case 'whatsapp':
            url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
            break;
        case 'linkedin':
            url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareLink)}`;
            break;
        case 'messenger':
            url = `fb-messenger://share/?link=${encodeURIComponent(shareLink)}`;
            break;
        case 'snapchat':
            url = `https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(shareLink)}`;
            break;
    }
    
    window.open(url, '_blank', 'noopener,noreferrer');
}
