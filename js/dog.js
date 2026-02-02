/**
 * QZH Dog Easter Egg 🐕
 * Hidden feature: Click QZH logo 5 times quickly to summon a friendly dog!
 */

const QZHDog = (function() {
    'use strict';

    // State
    let isActive = false;
    let clickCount = 0;
    let clickTimer = null;
    let dogEl = null;
    let mouseX = 0;
    let mouseY = 0;
    let dogX = 0;
    let dogY = 0;
    let animationId = null;
    let idleTimer = null;
    let isSitting = false;
    let pawTimer = null;
    let lastPawX = 0;
    let lastPawY = 0;

    // Config
    const CLICK_THRESHOLD = 5;
    const CLICK_TIMEOUT = 2000; // ms to complete 5 clicks
    const FOLLOW_SPEED = 0.08;
    const IDLE_TIMEOUT = 1500; // ms before sitting
    const PAW_INTERVAL = 180; // ms between paw prints
    const PAW_MIN_DISTANCE = 30; // minimum px to travel for new paw

    // SVG for the dog (Bernese-inspired Swiss mountain dog!)
    const DOG_SVG = `
        <svg class="qzh-dog-svg" viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg">
            <!-- Body -->
            <ellipse class="dog-body" cx="40" cy="38" rx="22" ry="14" fill="#2a1810"/>
            
            <!-- White chest marking (Swiss style!) -->
            <ellipse cx="32" cy="40" rx="8" ry="10" fill="#f5f5f5"/>
            
            <!-- Back legs -->
            <rect class="dog-leg dog-leg-back-left" x="50" y="44" width="6" height="14" rx="3" fill="#2a1810"/>
            <rect class="dog-leg dog-leg-back-right" x="56" y="44" width="6" height="14" rx="3" fill="#2a1810"/>
            
            <!-- Front legs -->
            <rect class="dog-leg dog-leg-front-left" x="22" y="44" width="6" height="14" rx="3" fill="#2a1810"/>
            <rect class="dog-leg dog-leg-front-right" x="28" y="44" width="6" height="14" rx="3" fill="#2a1810"/>
            
            <!-- White paws -->
            <ellipse cx="25" cy="57" rx="4" ry="3" fill="#f5f5f5"/>
            <ellipse cx="31" cy="57" rx="4" ry="3" fill="#f5f5f5"/>
            <ellipse cx="53" cy="57" rx="4" ry="3" fill="#f5f5f5"/>
            <ellipse cx="59" cy="57" rx="4" ry="3" fill="#f5f5f5"/>
            
            <!-- Tan markings -->
            <ellipse cx="35" cy="35" rx="4" ry="3" fill="#c4956a"/>
            <ellipse cx="48" cy="35" rx="4" ry="3" fill="#c4956a"/>
            
            <!-- Head -->
            <ellipse class="dog-head" cx="18" cy="28" rx="14" ry="12" fill="#2a1810"/>
            
            <!-- Tan face markings -->
            <ellipse cx="14" cy="30" rx="5" ry="4" fill="#c4956a"/>
            <ellipse cx="22" cy="30" rx="5" ry="4" fill="#c4956a"/>
            
            <!-- White blaze on face -->
            <path d="M18 20 L15 32 L18 35 L21 32 Z" fill="#f5f5f5"/>
            
            <!-- Snout -->
            <ellipse cx="10" cy="32" rx="6" ry="5" fill="#2a1810"/>
            
            <!-- Nose -->
            <ellipse cx="6" cy="32" rx="3" ry="2.5" fill="#1a0f0a"/>
            <ellipse cx="6" cy="31" rx="1.5" ry="1" fill="#3a2a20"/>
            
            <!-- Eyes -->
            <ellipse cx="14" cy="26" rx="3" ry="3" fill="#1a0f0a"/>
            <ellipse cx="22" cy="26" rx="3" ry="3" fill="#1a0f0a"/>
            <ellipse cx="13.5" cy="25.5" rx="1.2" ry="1.2" fill="white"/>
            <ellipse cx="21.5" cy="25.5" rx="1.2" ry="1.2" fill="white"/>
            
            <!-- Ears -->
            <ellipse class="dog-ear dog-ear-left" cx="8" cy="18" rx="6" ry="8" fill="#2a1810" transform="rotate(-20 8 18)"/>
            <ellipse class="dog-ear dog-ear-right" cx="28" cy="18" rx="6" ry="8" fill="#2a1810" transform="rotate(20 28 18)"/>
            
            <!-- Tail -->
            <path class="dog-tail" d="M62 30 Q75 20 72 35 Q70 42 64 38" fill="#2a1810"/>
            
            <!-- Little bell on collar (Swiss touch!) -->
            <rect x="24" y="38" width="8" height="3" rx="1" fill="#c41e3a"/>
            <circle cx="28" cy="43" r="3" fill="#ffd700"/>
            <circle cx="28" cy="43" r="1.5" fill="#cc9900"/>
        </svg>
    `;

    // SVG for sitting dog
    const DOG_SITTING_SVG = `
        <svg class="qzh-dog-svg" viewBox="0 0 70 65" xmlns="http://www.w3.org/2000/svg">
            <!-- Body (sitting position) -->
            <ellipse class="dog-body" cx="35" cy="45" rx="18" ry="16" fill="#2a1810"/>
            
            <!-- White chest -->
            <ellipse cx="30" cy="42" rx="9" ry="12" fill="#f5f5f5"/>
            
            <!-- Back legs (tucked) -->
            <ellipse cx="45" cy="55" rx="10" ry="6" fill="#2a1810"/>
            <ellipse cx="25" cy="55" rx="10" ry="6" fill="#2a1810"/>
            
            <!-- White paws -->
            <ellipse cx="52" cy="58" rx="4" ry="3" fill="#f5f5f5"/>
            <ellipse cx="18" cy="58" rx="4" ry="3" fill="#f5f5f5"/>
            
            <!-- Front legs -->
            <rect class="dog-leg dog-leg-front-left" x="26" y="50" width="6" height="12" rx="3" fill="#2a1810"/>
            <rect class="dog-leg dog-leg-front-right" x="34" y="50" width="6" height="12" rx="3" fill="#2a1810"/>
            
            <!-- White front paws -->
            <ellipse cx="29" cy="61" rx="4" ry="3" fill="#f5f5f5"/>
            <ellipse cx="37" cy="61" rx="4" ry="3" fill="#f5f5f5"/>
            
            <!-- Tan markings -->
            <ellipse cx="28" cy="38" rx="3" ry="2" fill="#c4956a"/>
            <ellipse cx="42" cy="40" rx="4" ry="3" fill="#c4956a"/>
            
            <!-- Head -->
            <ellipse class="dog-head" cx="33" cy="22" rx="14" ry="12" fill="#2a1810"/>
            
            <!-- Tan face markings -->
            <ellipse cx="29" cy="24" rx="5" ry="4" fill="#c4956a"/>
            <ellipse cx="37" cy="24" rx="5" ry="4" fill="#c4956a"/>
            
            <!-- White blaze -->
            <path d="M33 14 L30 26 L33 29 L36 26 Z" fill="#f5f5f5"/>
            
            <!-- Snout -->
            <ellipse cx="25" cy="26" rx="6" ry="5" fill="#2a1810"/>
            
            <!-- Nose -->
            <ellipse cx="21" cy="26" rx="3" ry="2.5" fill="#1a0f0a"/>
            <ellipse cx="21" cy="25" rx="1.5" ry="1" fill="#3a2a20"/>
            
            <!-- Eyes (happy!) -->
            <path d="M28 18 Q30 21 32 18" stroke="#1a0f0a" stroke-width="2" fill="none" stroke-linecap="round"/>
            <path d="M34 18 Q36 21 38 18" stroke="#1a0f0a" stroke-width="2" fill="none" stroke-linecap="round"/>
            
            <!-- Ears (perked up) -->
            <ellipse class="dog-ear dog-ear-left" cx="22" cy="12" rx="5" ry="8" fill="#2a1810" transform="rotate(-15 22 12)"/>
            <ellipse class="dog-ear dog-ear-right" cx="44" cy="12" rx="5" ry="8" fill="#2a1810" transform="rotate(15 44 12)"/>
            
            <!-- Tail (wagging while sitting) -->
            <path class="dog-tail" d="M52 42 Q65 30 60 45 Q58 50 54 46" fill="#2a1810"/>
            
            <!-- Collar and bell -->
            <rect x="27" y="32" width="10" height="3" rx="1" fill="#c41e3a"/>
            <circle cx="32" cy="37" r="3" fill="#ffd700"/>
            <circle cx="32" cy="37" r="1.5" fill="#cc9900"/>
        </svg>
    `;

    // Paw print SVG
    const PAW_SVG = `
        <svg class="qzh-paw-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="12" cy="16" rx="6" ry="5" fill="#2a1810" opacity="0.3"/>
            <ellipse cx="6" cy="10" rx="2.5" ry="3" fill="#2a1810" opacity="0.3"/>
            <ellipse cx="11" cy="8" rx="2.5" ry="3" fill="#2a1810" opacity="0.3"/>
            <ellipse cx="17" cy="8" rx="2.5" ry="3" fill="#2a1810" opacity="0.3" transform="rotate(10 17 8)"/>
            <ellipse cx="20" cy="12" rx="2.5" ry="3" fill="#2a1810" opacity="0.3" transform="rotate(25 20 12)"/>
        </svg>
    `;

    /**
     * Initialize the Easter egg
     */
    function init() {
        // Find logo elements to attach click listener
        const logoElements = document.querySelectorAll('.qzh-logo-text, .app-header h1');
        
        logoElements.forEach(el => {
            el.style.cursor = 'pointer';
            el.addEventListener('click', handleLogoClick);
        });

        // Track mouse position
        document.addEventListener('mousemove', handleMouseMove);

        // Add styles
        injectStyles();
    }

    /**
     * Handle logo clicks
     */
    function handleLogoClick(e) {
        e.preventDefault();
        
        clickCount++;
        
        // Reset timer on each click
        clearTimeout(clickTimer);
        clickTimer = setTimeout(() => {
            clickCount = 0;
        }, CLICK_TIMEOUT);

        // Check if threshold reached
        if (clickCount >= CLICK_THRESHOLD) {
            clickCount = 0;
            clearTimeout(clickTimer);
            
            if (isActive) {
                deactivate();
            } else {
                activate();
            }
        }
    }

    /**
     * Handle mouse movement
     */
    function handleMouseMove(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (isActive) {
            // Reset idle timer
            clearTimeout(idleTimer);
            
            // Stand up if sitting
            if (isSitting) {
                standUp();
            }
            
            // Set new idle timer
            idleTimer = setTimeout(() => {
                sitDown();
            }, IDLE_TIMEOUT);
        }
    }

    /**
     * Activate the dog
     */
    function activate() {
        if (isActive) return;
        
        isActive = true;
        isSitting = false;

        // Create dog element
        dogEl = document.createElement('div');
        dogEl.className = 'qzh-dog';
        dogEl.innerHTML = DOG_SVG;
        document.body.appendChild(dogEl);

        // Position at mouse
        dogX = mouseX - 40;
        dogY = mouseY - 30;
        updateDogPosition();

        // Start animation loop
        animate();

        // Start paw prints
        startPawPrints();

        // Set idle timer
        idleTimer = setTimeout(() => {
            sitDown();
        }, IDLE_TIMEOUT);

        // Console Easter egg
        console.log('%c🐕 Woof! Ein Berner Sennenhund ist erschienen!', 'font-size: 16px; color: #2a1810; font-weight: bold;');
        console.log('%cKlicke nochmal 5x auf das Logo um ihn zu verabschieden.', 'font-size: 12px; color: #666;');
    }

    /**
     * Deactivate the dog
     */
    function deactivate() {
        if (!isActive) return;
        
        isActive = false;

        // Stop animation
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }

        // Stop paw prints
        clearInterval(pawTimer);

        // Clear idle timer
        clearTimeout(idleTimer);

        // Remove dog
        if (dogEl) {
            dogEl.classList.add('qzh-dog--leaving');
            setTimeout(() => {
                if (dogEl && dogEl.parentNode) {
                    dogEl.parentNode.removeChild(dogEl);
                }
                dogEl = null;
            }, 500);
        }

        // Remove all paw prints
        document.querySelectorAll('.qzh-paw').forEach(paw => {
            paw.remove();
        });

        console.log('%c🐕 Auf Wiedersehen! Der Hund ist davongelaufen.', 'font-size: 14px; color: #666;');
    }

    /**
     * Animation loop
     */
    function animate() {
        if (!isActive || !dogEl) return;

        // Calculate target (offset so dog appears to follow, not overlap cursor)
        const targetX = mouseX - 50;
        const targetY = mouseY - 20;

        // Smooth follow
        const dx = targetX - dogX;
        const dy = targetY - dogY;
        
        if (!isSitting) {
            dogX += dx * FOLLOW_SPEED;
            dogY += dy * FOLLOW_SPEED;
        }

        updateDogPosition();

        // Flip dog based on movement direction
        if (Math.abs(dx) > 2) {
            dogEl.classList.toggle('qzh-dog--flipped', dx < 0);
        }

        // Wag tail faster when moving
        const speed = Math.sqrt(dx * dx + dy * dy);
        if (speed > 5) {
            dogEl.classList.add('qzh-dog--moving');
        } else {
            dogEl.classList.remove('qzh-dog--moving');
        }

        animationId = requestAnimationFrame(animate);
    }

    /**
     * Update dog DOM position
     */
    function updateDogPosition() {
        if (dogEl) {
            dogEl.style.left = dogX + 'px';
            dogEl.style.top = dogY + 'px';
        }
    }

    /**
     * Make the dog sit down
     */
    function sitDown() {
        if (!isActive || !dogEl || isSitting) return;
        
        isSitting = true;
        dogEl.innerHTML = DOG_SITTING_SVG;
        dogEl.classList.add('qzh-dog--sitting');
        
        // Stop paw prints while sitting
        clearInterval(pawTimer);
    }

    /**
     * Make the dog stand up
     */
    function standUp() {
        if (!isActive || !dogEl || !isSitting) return;
        
        isSitting = false;
        dogEl.innerHTML = DOG_SVG;
        dogEl.classList.remove('qzh-dog--sitting');
        
        // Resume paw prints
        startPawPrints();
    }

    /**
     * Start creating paw prints
     */
    function startPawPrints() {
        clearInterval(pawTimer);
        lastPawX = dogX;
        lastPawY = dogY;

        pawTimer = setInterval(() => {
            if (!isActive || isSitting) return;

            // Only create paw if dog has moved enough
            const dist = Math.sqrt(
                Math.pow(dogX - lastPawX, 2) + 
                Math.pow(dogY - lastPawY, 2)
            );

            if (dist > PAW_MIN_DISTANCE) {
                createPawPrint(dogX + 25, dogY + 45);
                lastPawX = dogX;
                lastPawY = dogY;
            }
        }, PAW_INTERVAL);
    }

    /**
     * Create a single paw print
     */
    function createPawPrint(x, y) {
        const paw = document.createElement('div');
        paw.className = 'qzh-paw';
        paw.innerHTML = PAW_SVG;
        paw.style.left = x + 'px';
        paw.style.top = y + 'px';
        
        // Random slight rotation for natural look
        paw.style.transform = `rotate(${Math.random() * 40 - 20}deg)`;
        
        document.body.appendChild(paw);

        // Fade out and remove
        setTimeout(() => {
            paw.classList.add('qzh-paw--fading');
        }, 100);

        setTimeout(() => {
            if (paw.parentNode) {
                paw.parentNode.removeChild(paw);
            }
        }, 2500);
    }

    /**
     * Inject CSS styles
     */
    function injectStyles() {
        if (document.getElementById('qzh-dog-styles')) return;

        const style = document.createElement('style');
        style.id = 'qzh-dog-styles';
        style.textContent = `
            /* Dog Easter Egg Styles */
            .qzh-dog {
                position: fixed;
                width: 80px;
                height: 60px;
                pointer-events: none;
                z-index: 9999;
                transition: transform 0.1s ease-out;
                animation: qzh-dog-appear 0.5s ease-out;
            }

            .qzh-dog--sitting {
                width: 70px;
                height: 65px;
            }

            .qzh-dog--flipped {
                transform: scaleX(-1);
            }

            .qzh-dog--leaving {
                animation: qzh-dog-leave 0.5s ease-in forwards;
            }

            .qzh-dog-svg {
                width: 100%;
                height: 100%;
            }

            /* Tail wagging animation */
            .qzh-dog .dog-tail {
                transform-origin: 62px 38px;
                animation: qzh-tail-wag 0.8s ease-in-out infinite;
            }

            .qzh-dog--moving .dog-tail {
                animation-duration: 0.3s;
            }

            .qzh-dog--sitting .dog-tail {
                transform-origin: 52px 42px;
                animation: qzh-tail-wag-sitting 0.6s ease-in-out infinite;
            }

            /* Leg animation while moving */
            .qzh-dog--moving .dog-leg-front-left {
                animation: qzh-leg-move 0.2s ease-in-out infinite;
            }
            .qzh-dog--moving .dog-leg-front-right {
                animation: qzh-leg-move 0.2s ease-in-out infinite 0.1s;
            }
            .qzh-dog--moving .dog-leg-back-left {
                animation: qzh-leg-move 0.2s ease-in-out infinite 0.1s;
            }
            .qzh-dog--moving .dog-leg-back-right {
                animation: qzh-leg-move 0.2s ease-in-out infinite;
            }

            /* Ear animation */
            .qzh-dog--moving .dog-ear {
                animation: qzh-ear-bounce 0.3s ease-in-out infinite;
            }

            /* Paw prints */
            .qzh-paw {
                position: fixed;
                width: 24px;
                height: 24px;
                pointer-events: none;
                z-index: 9998;
                opacity: 0.6;
                transition: opacity 2s ease-out;
            }

            .qzh-paw--fading {
                opacity: 0;
            }

            .qzh-paw-svg {
                width: 100%;
                height: 100%;
            }

            /* Keyframes */
            @keyframes qzh-dog-appear {
                0% {
                    opacity: 0;
                    transform: scale(0.5) translateY(20px);
                }
                50% {
                    transform: scale(1.1) translateY(-5px);
                }
                100% {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }

            @keyframes qzh-dog-leave {
                0% {
                    opacity: 1;
                    transform: scale(1);
                }
                100% {
                    opacity: 0;
                    transform: scale(0.3) translateY(-30px);
                }
            }

            @keyframes qzh-tail-wag {
                0%, 100% { transform: rotate(-15deg); }
                50% { transform: rotate(15deg); }
            }

            @keyframes qzh-tail-wag-sitting {
                0%, 100% { transform: rotate(-10deg); }
                50% { transform: rotate(20deg); }
            }

            @keyframes qzh-leg-move {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-3px); }
            }

            @keyframes qzh-ear-bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-2px); }
            }
        `;
        document.head.appendChild(style);
    }

    // Public API
    return {
        init: init,
        activate: activate,
        deactivate: deactivate
    };
})();
