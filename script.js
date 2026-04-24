document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('enter-overlay');
    const mainContent = document.getElementById('main-content');
    const card = document.getElementById('profile-card');
    const cursor = document.getElementById('custom-cursor');
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    const debrisContainer = document.getElementById('tech-debris');
    const spotifyContainer = document.getElementById('spotify-player-container');
    const spotifyToggle = document.getElementById('spotify-toggle');
    const spotifyVisualizer = spotifyToggle.querySelector('.audio-visualizer');
    
    let spotifyEmbedController = null;
    
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let prevMouseX = 0, prevMouseY = 0;
    let mouseVelocity = 0;
    let isClicking = false, isEntering = false;

    // --- Spotify Elite Controller ---
    window.onSpotifyIframeApiReady = (IFrameAPI) => {
        const element = document.getElementById('spotify-embed');
        const options = {
            width: '100%',
            height: '152',
            uri: 'spotify:track:0vbtURX4qv1l7besfwmnD8',
            theme: 'dark'
        };
        const callback = (EmbedController) => {
            spotifyEmbedController = EmbedController;
            
            spotifyToggle.addEventListener('click', () => {
                spotifyContainer.classList.toggle('show');
                spotifyVisualizer.classList.toggle('active');
            });

            EmbedController.addListener('playback_update', e => {
                if (e.data.isPaused) {
                    spotifyVisualizer.classList.remove('active');
                } else {
                    spotifyVisualizer.classList.add('active');
                }
            });
        };
        IFrameAPI.createController(element, options, callback);
    };


    // --- Cursor & Velocity Logic ---
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Calculate velocity
        const dx = mouseX - prevMouseX;
        const dy = mouseY - prevMouseY;
        mouseVelocity = Math.sqrt(dx * dx + dy * dy);
        prevMouseX = mouseX;
        prevMouseY = mouseY;


        if (!isEntering) {
            cursor.style.opacity = '1';
            isEntering = true;
        }
    });

    const animateCursor = () => {
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;

        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
        cursorOutline.style.left = `${cursorX}px`;
        cursorOutline.style.top = `${cursorY}px`;

        if (isClicking) {
            cursorOutline.style.transform = 'translate(-50%, -50%) scale(0.8)';
        } else {
            cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
        }
        requestAnimationFrame(animateCursor);
    };
    animateCursor();

    const links = document.querySelectorAll('a, button, .cursor-pointer');
    links.forEach(link => {
        link.addEventListener('mouseenter', () => {
            document.body.classList.add('cursor-hover');
        });
        link.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    // --- Constellation Particle System ---
    let particles = [];
    const particleCount = window.innerWidth < 640 ? 40 : 100;
    const connectionDist = 120;

    class Particle {
        constructor() {
            this.init();
        }
        init() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.8;
            this.vy = (Math.random() - 0.5) * 0.8;
            this.size = Math.random() * 2 + 0.5;
            this.color = Math.random() > 0.5 ? '#3b82f6' : '#10b981';
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                this.x -= dx * 0.02;
                this.y -= dy * 0.02;
            }
            if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.init();
        }
    }

    function initParticles() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        particles = Array.from({length: particleCount}, () => new Particle());
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];
            p1.update();
            ctx.beginPath();
            ctx.arc(p1.x, p1.y, p1.size, 0, Math.PI * 2);
            ctx.fillStyle = p1.color;
            ctx.globalAlpha = 0.3;
            ctx.fill();

            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < connectionDist) {
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = p1.color;
                    ctx.lineWidth = 0.5;
                    ctx.globalAlpha = 1 - (dist / connectionDist);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animateParticles);
    }
    window.addEventListener('resize', initParticles);
    initParticles();
    animateParticles();

    // --- Debris Generation ---
    function spawnDebris() {
        for (let i = 0; i < 15; i++) {
            const d = document.createElement('div');
            d.className = 'debris-piece';
            const size = Math.random() * 20 + 5;
            d.style.width = `${size}px`;
            d.style.height = `${size}px`;
            d.style.left = `${Math.random() * 100}%`;
            d.style.top = `${Math.random() * 100}%`;
            d.style.animationDuration = `${Math.random() * 10 + 15}s`;
            d.style.animationDelay = `${Math.random() * 5}s`;
            debrisContainer.appendChild(d);
        }
    }
    spawnDebris();

    // --- Interactive Hover Depth ---
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;

        const tiltX = (y - cy) / 10;
        const tiltY = (cx - x) / 10;

        card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
        card.style.setProperty('--glare-x', `${x}px`);
        card.style.setProperty('--glare-y', `${y}px`);
        
        // Grid Warp
        document.querySelector('.ambient-grid').style.transform = `translate(${(x - cx)/15}px, ${(y - cy)/15}px) scale(1.1)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    });

    // --- Entry ---
    overlay.addEventListener('click', () => {
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
        
        // Show Spotify Player with delay for impact
        setTimeout(() => {
            spotifyContainer.classList.add('show');
            if (spotifyEmbedController) {
                // Spotify requires user interaction, which this click provides
                spotifyEmbedController.play();
            }
        }, 1500);
        
        setTimeout(() => {
            overlay.style.display = 'none';
            mainContent.style.opacity = '1';
            initTypewriter();
        }, 1000);
    });

    // --- Typewriter ---
    const roles = ['Architect of Innovation', 'Full Stack Developer', 'Cyber Identity', 'Elite Tech Creator'];
    let roleIdx = 0, charIdx = 0, isDeleting = false;
    const typeElement = document.getElementById('dynamic-role');

    function initTypewriter() {
        if (!typeElement) return;
        const currentRole = roles[roleIdx];
        typeElement.textContent = currentRole.substring(0, isDeleting ? charIdx - 1 : charIdx + 1);
        charIdx += isDeleting ? -1 : 1;

        let speed = isDeleting ? 40 : 80;
        if (!isDeleting && charIdx === currentRole.length) { speed = 2500; isDeleting = true; }
        else if (isDeleting && charIdx === 0) { isDeleting = false; roleIdx = (roleIdx + 1) % roles.length; speed = 500; }
        setTimeout(initTypewriter, speed);
    }
});
