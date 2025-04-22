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
    // Change the url to https://p.tccards.tn/@"hash" without reloading just the appearance of the url
    const newUrl = `https://p.tccards.tn/@${hash}`;
    window.history.replaceState(null, null, newUrl);
    // Determine if it's an ID or link lookup
    const isIdLookup = hash.startsWith('id_');
    const identifier = isIdLookup ? hash.split('_')[1] : hash;
    
    // Database configuration with plan types
    const databases = [
        {
            id: 'AKfycbxU8axs4Xduqc84jj_utLsi-pCxSEyw9exEO7PuNo940qQ1bJ4-NxREnUgVhdzS9plb',
            plan: 'free'
        }
    ];

    // Start searching databases
    searchDatabases(databases, identifier, isIdLookup);
});

// Enhanced database search with plan awareness
async function searchDatabases(databases, identifier, isIdLookup, index = 0) {
    if (index >= databases.length) {
        showError("Profile not found in any database");
        return;
    }

    const db = databases[index];
    
    try {
        const param = isIdLookup ? 'id' : 'link';
        const url = `https://script.google.com/macros/s/${db.id}/exec?${param}=${encodeURIComponent(identifier)}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Debug log
        console.log('Received data:', data);
        
        // If data has status error, try next database
        if (data && data.status === "error") {
            searchDatabases(databases, identifier, isIdLookup, index + 1);
            return;
        }
        
        // If we have valid data, handle it
        if (data && typeof data === 'object') {
            try {
                handleProfileData(data, db.plan);
                return;
            } catch (err) {
                console.error('Error in handleProfileData:', err);
                searchDatabases(databases, identifier, isIdLookup, index + 1);
            }
        } else {
            searchDatabases(databases, identifier, isIdLookup, index + 1);
        }
    } catch (error) {
        console.error("Database search error:", error);
        searchDatabases(databases, identifier, isIdLookup, index + 1);
    }
}

// Enhanced profile handler with plan awareness
function handleProfileData(data, planType) {
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.style.display = 'none';
    }
    // Open the data array received data.data to access the profile data
    data = data.data || data;

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
            bgImage: data['Background Image URL'] || '',
            formType: data['Form Type'] || '',
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
                        name: profileData.name,
                        profilepic: profileData.profilePic,
                        email: profileData.email,
                        phone: profileData.phone,
                        address: profileData.address,
                        style: styles[data['Selected Style']]?.background || styles.default
                    }))})">Get in Touch</button>` : ''}
                

            <footer class="footer">
                <p>Powered by &copy; Total Connect ${new Date().getFullYear()}  </p>
                <p><a href="https://tccards.tn/plan/free" target="_blank">Get Your Free Card</a></p>
            </footer>
            </div>
        </center>
        `;
        
        // Show success notification
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: "success",
                timer: 1000,
                showConfirmButton: false,
                position: 'bottom',
                toast: true,
                background: "#1a1a1a",
            });
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
        'twitter.com': 'fab fa-twitter',
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
        'gitlab.com': 'fab fa-gitlab',
        'discord.gg': 'fab fa-discord',
        'bitly.com': 'fab fa-bitly',
        'medium.com': 'fab fa-medium',
        'whatsapp.com': 'fab fa-whatsapp',
        'wa.me': 'fab fa-whatsapp',
        'vercel.com': 'fab fa-vercel',
        'netlify.com': 'fab fa-netlify',
        'dribbble.com': 'fab fa-dribbble',
        'behance.net': 'fab fa-behance',
        'flickr.com': 'fab fa-flickr',
        'tumblr.com': 'fab fa-tumblr',
        'telegram.org': 'fab fa-telegram',
        'slack.com': 'fab fa-slack',
        'vimeo.com': 'fab fa-vimeo',
        'spotify.com': 'fab fa-spotify',
        'apple.com': 'fab fa-apple',
        'google.com': 'fab fa-google',
        'amazon.com': 'fab fa-amazon',
        'microsoft.com': 'fab fa-microsoft',
        'paypal.com': 'fab fa-paypal'
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
        const contactHtml = `
            <div class="contact-details">
                <img src="${escapeHtml(contact.profilepic)}" class="profile-picture" alt="${escapeHtml(contact.name)}">
                <h3>${escapeHtml(contact.name)}</h3>
                ${contact.email ? `<p><i class="fas fa-envelope"></i> ${escapeHtml(contact.email)}</p>` : ''}
                ${contact.phone ? `<p><i class="fas fa-phone"></i> ${escapeHtml(contact.phone)}</p>` : ''}
                ${contact.address ? `<p><i class="fas fa-map-marker-alt"></i> ${escapeHtml(contact.address)}</p>` : ''}
            </div>
        `;

        const { value: saveMethod } = await Swal.fire({
            title: 'Save Contact',
            html: contactHtml,
            background: typeof contact.style === 'object' ? contact.style?.background : contact.style || '#162949',
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: 'Save to Device',
            denyButtonText: 'Copy Details',
            cancelButtonText: 'Cancel',
            color: '#fff',
            showLoaderOnConfirm: true,
            allowOutsideClick: false
        });

        if (saveMethod === 'confirm') {
            await handleSaveContact(contact);
        } else if (saveMethod === 'deny') {
            await handleCopyContact(contact);
        }

    } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', 'Failed to save contact', 'error');
    }
}

async function handleCopyContact(contact) {
    try {
        let contactText = `${contact.name}\n`;
        if (contact.email) contactText += `Email: ${contact.email}\n`;
        if (contact.phone) contactText += `Phone: ${contact.phone}\n`;
        if (contact.address) contactText += `Address: ${contact.address}\n`;
        
        await navigator.clipboard.writeText(contactText);
        await showAlert('Copied!', 'Contact details copied to clipboard');
    } catch (error) {
        console.error('Copy failed:', error);
        await showAlert('Error', 'Failed to copy details');
    }
}

async function handleSaveContact(contact) {
    try {
        // iOS Devices
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            await saveForIOS(contact);
        }
        // Android with Contacts API
        else if (navigator.contacts && typeof navigator.contacts.select === 'function') {
            await saveWithContactsAPI(contact);
        }
        // Fallback for other browsers
        else {
            await saveWithVCard(contact);
        }
    } catch (error) {
        console.error('Save failed:', error);
        await showAlert('Error', 'Failed to save contact');
    }
}

async function saveForIOS(contact) {
    const vCard = generateVCard(contact);
    const blob = new Blob([vCard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contact.name.replace(/\s+/g, '_')}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    await showAlert('Tap Share', 'Choose "Add to Contacts" from share sheet');
}

async function saveWithContactsAPI(contact) {
    const props = ['name'];
    if (contact.email) props.push('email');
    if (contact.phone) props.push('tel');
    if (contact.address) props.push('address');
    
    const contactData = {
        name: [contact.name],
        ...(contact.email && { email: [contact.email] }),
        ...(contact.phone && { tel: [contact.phone] }),
        ...(contact.address && { address: [{ address: contact.address }] })
    };
    
    const [savedContact] = await navigator.contacts.select(props, { multiple: false });
    if (savedContact) {
        await navigator.contacts.update(savedContact.id, contactData);
        await showAlert('Updated!', 'Contact updated successfully');
    } else {
        await navigator.contacts.create(contactData);
        await showAlert('Saved!', 'Contact saved to device');
    }
}

async function saveWithVCard(contact) {
    const vCard = generateVCard(contact);
    const blob = new Blob([vCard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contact.name.replace(/\s+/g, '_')}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    await showAlert('Downloaded', 'Import the vCard file to your contacts');
}

function generateVCard(contact) {
    return `BEGIN:VCARD
VERSION:3.0
FN:${escapeHtml(contact.name)}
${contact.email ? `EMAIL:${escapeHtml(contact.email)}\n` : ''}
${contact.phone ? `TEL:${escapeHtml(contact.phone)}\n` : ''}
${contact.address ? `ADR:;;${escapeHtml(contact.address)}\n` : ''}
END:VCARD`;
}

async function showAlert(title, text) {
    await Swal.fire({
        title,
        text,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        position: 'bottom',
        toast: true
    });
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
    
    username = `https://tccards.tn/@${link}`;
    // Generate a profile image with initials as fallback
    const profileName = document.querySelector('h2')?.textContent || 'User';
    const profileImage = document.querySelector('.profile-picture')?.src || 
        `<div class="avatar-fallback" style="background-color: ${stringToColor(profileName)}">
            ${getInitials(profileName)}
        </div>`;
    

    Swal.fire({
        title: 'Share Profile',
        html: `
            <div class="tc-share-container">
                <div class="tc-profile-header">
                    ${typeof profileImage === 'string' ? 
                        `<img src="${profileImage}" class="tc-profile-pic" alt="Profile">` : 
                        profileImage}
                    <h3 class="tc-username">@${link}</h3>
                </div>
                
                <div class="tc-share-link">
                    <input type="text" value="${username}" id="tc-share-link-input" readonly>
                    <button class="tc-copy-btn" onclick="copyShareLink()">
                        <i class="fas fa-copy"></i> 
                    </button>
                </div>
                
                <div class="tc-social-share">
                    <button class="tc-social-btn facebook" onclick="shareTo('facebook')">
                        <i class="fab fa-facebook-f"></i>
                    </button>
                    <button class="tc-social-btn whatsapp" onclick="shareTo('whatsapp')">
                        <i class="fab fa-whatsapp"></i>
                    </button>
                    <button class="tc-social-btn linkedin" onclick="shareTo('linkedin')">
                        <i class="fab fa-linkedin-in"></i>
                    </button>
                    <button class="tc-social-btn messenger" onclick="shareTo('messenger')">
                        <i class="fab fa-facebook-messenger"></i>
                    </button>
                    <button class="tc-social-btn snapchat" onclick="shareTo('snapchat')">
                        <i class="fab fa-snapchat-ghost"></i>
                    </button>
                </div>
                
                <div class="tc-signup-cta">
                    <p>Create your own digital card with TC Cards</p>
                    <button class="tc-signup-btn" onclick="window.location.href='https://tccards.tn/plans/free'">
                        Sign up free
                    </button>
                </div>
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
            <div class="tc-footer-links">
                <a href="/report" class="tc-footer-link">Report Profile</a>
                <a href="/privacy" class="tc-footer-link">Privacy Notice</a>
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
    const shareText = `Check out my TC Card: ${shareLink}`;
    
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
