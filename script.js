document.addEventListener('DOMContentLoaded', () => {
    // Elementi del DOM
    const overlay = document.getElementById('enter-overlay');
    const mainContent = document.getElementById('main-content');
    const card = document.getElementById('profile-card');

    // --- LOGICA DI ACCESSO (OVERLAY) ---
    overlay.addEventListener('click', () => {
        // 1. Nascondi overlay
        overlay.style.opacity = '0';
        overlay.style.backdropFilter = 'blur(0px)';
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 800);

        // 2. Mostra contenuto con animazione
        mainContent.style.opacity = '1';
        card.classList.add('animate-fade-in-up');

        // 3. Avvia Macchina da Scrivere
        setTimeout(initTypewriter, 400);

        // 4. Anima Link a cascata
        const links = document.querySelectorAll('.link-cascade');
        links.forEach((link, idx) => {
            setTimeout(() => {
                link.classList.add('revealed');
            }, 600 + (idx * 100)); // Ritardo progressivo
        });

    });

    // --- MÁQUINA DE ESCRIBIR ---
    const roles = ["Arquitecto de Software", "Desarrollador Full Stack", "Nómada Tecnológico"];
    let roleIdx = 0;
    let charPos = 0;
    let deletingMode = false;
    const roleElement = document.getElementById('dynamic-role');
    let typeTimeout;

    function initTypewriter() {
        if (!roleElement) return; // Sicurezza
        clearTimeout(typeTimeout); // Pulisci eventuali timer precedenti
        typeEffect();
    }

    function typeEffect() {
        const currentText = roles[roleIdx];
        
        if (!deletingMode && charPos <= currentText.length) {
            roleElement.innerText = currentText.substring(0, charPos);
            charPos++;
            
            if (charPos > currentText.length) {
                deletingMode = true;
                typeTimeout = setTimeout(typeEffect, 2000); // Pausa al completamento della frase
            } else {
                typeTimeout = setTimeout(typeEffect, 100); // Velocità di digitazione
            }
        } else if (deletingMode && charPos >= 0) {
            roleElement.innerText = currentText.substring(0, charPos);
            charPos--;
            
            if (charPos < 0) {
                deletingMode = false;
                roleIdx = (roleIdx + 1) % roles.length;
                charPos = 0;
                typeTimeout = setTimeout(typeEffect, 500); // Pausa prima della nuova frase
            } else {
                typeTimeout = setTimeout(typeEffect, 50); // Cancella più velocemente
            }
        }
    }

    // --- EFFETTO 3D (TILT) MORBIDO ---
    // Attiva solo su dispositivi senza touch screen (desktop) per evitare lag sui cellulari
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; 
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -8; // Gradi massimi
            const rotateY = ((x - centerX) / centerX) * 8;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
    } else {
        card.style.transform = 'none';
        card.classList.remove('tilt-card');
    }

    console.log("%c⚡ Ecosistema Arnold Zamora Cargado", "color: #1DB954; font-size: 14px; font-weight: bold;");
});