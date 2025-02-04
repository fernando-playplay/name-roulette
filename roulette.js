// Configuration constants
const CONFIG = {
    SPIN_DURATION: 5, // seconds
    MIN_ROTATION: 1080, // 3 full rotations
    CONFETTI: {
        DURATION: 5000,
        PARTICLE_COUNT: 80,
        CONTINUOUS_COUNT: 60,
        COLORS: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9d56e'],
        DEFAULTS: {
            startVelocity: 40,
            spread: 360,
            ticks: 80,
            zIndex: 200,
            scalar: 1.5
        }
    }
};

class Roulette {
    constructor(names) {
        this.names = names;
        this.isSpinning = false;
        this.currentRotation = 0;
        
        // Constants
        this.WHEEL_CENTER = 250; // SVG viewBox center
        this.RADIUS = 240; // Slightly smaller than viewBox to fit inside
        this.TEXT_RADIUS = 180; // Distance of text from center
        
        // DOM elements
        this.wheel = document.querySelector('.wheel');
        this.spinBtn = document.querySelector('.spin-btn');
        this.winnerOverlay = document.querySelector('.winner-overlay');
        this.winnerNameEl = document.querySelector('.winner-name');
        
        this.init();
    }
    
    init() {
        this.createWheel();
        this.setupEventListeners();
    }
    
    createWheel() {
        const angleStep = 360 / this.names.length;
        
        this.names.forEach((name, index) => {
            // Create section path
            const startAngle = index * angleStep;
            const endAngle = (index + 1) * angleStep;
            const section = this.createSectionPath(startAngle, endAngle);
            section.classList.add('wheel-section');
            section.style.fill = index % 2 === 0 ? '#4a4a4a' : '#555555';
            
            // Create text
            const textAngle = startAngle + (angleStep / 2);
            const text = this.createSectionText(name, textAngle);
            text.classList.add('wheel-text');
            
            // Add elements to wheel
            this.wheel.appendChild(section);
            this.wheel.appendChild(text);
        });
    }
    
    createSectionPath(startAngle, endAngle) {
        const startRad = (startAngle - 90) * Math.PI / 180; // -90 to start at top
        const endRad = (endAngle - 90) * Math.PI / 180;
        
        const startX = this.WHEEL_CENTER + this.RADIUS * Math.cos(startRad);
        const startY = this.WHEEL_CENTER + this.RADIUS * Math.sin(startRad);
        const endX = this.WHEEL_CENTER + this.RADIUS * Math.cos(endRad);
        const endY = this.WHEEL_CENTER + this.RADIUS * Math.sin(endRad);
        
        const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `
            M ${this.WHEEL_CENTER} ${this.WHEEL_CENTER}
            L ${startX} ${startY}
            A ${this.RADIUS} ${this.RADIUS} 0 ${largeArcFlag} 1 ${endX} ${endY}
            Z
        `);
        
        return path;
    }
    
    createSectionText(name, angle) {
        const rad = (angle - 90) * Math.PI / 180; // -90 to start at top
        const x = this.WHEEL_CENTER + this.TEXT_RADIUS * Math.cos(rad);
        const y = this.WHEEL_CENTER + this.TEXT_RADIUS * Math.sin(rad);
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', y);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('transform', `rotate(${angle}, ${x}, ${y})`);
        text.textContent = name;
        
        return text;
    }
    
    setupEventListeners() {
        this.spinBtn.addEventListener('click', () => this.spin());
        this.winnerOverlay.addEventListener('click', () => this.hideWinner());
    }
    
    spin() {
        if (this.isSpinning) return;
        
        this.isSpinning = true;
        this.spinBtn.disabled = true;
        
        // Calculate rotation with multiple stages for dramatic effect
        const minSpins = 8; // Increased number of spins
        const extraDegrees = Math.random() * 360;
        const totalRotation = minSpins * 360 + extraDegrees;
        
        // First stage: Fast spin
        this.wheel.style.transition = 'transform 2s cubic-bezier(0.2, 0, 0.3, 1)';
        this.wheel.style.transform = `rotate(${totalRotation * 0.6}deg)`;
        
        // Second stage: Slower spin
        setTimeout(() => {
            this.wheel.style.transition = 'transform 2s cubic-bezier(0.3, 0, 0.2, 1)';
            this.wheel.style.transform = `rotate(${totalRotation * 0.8}deg)`;
        }, 2000);
        
        // Final stage: Slow down to final position
        setTimeout(() => {
            this.wheel.style.transition = 'transform 3s cubic-bezier(0.1, 0, 0.2, 1)';
            this.wheel.style.transform = `rotate(${totalRotation}deg)`;
        }, 4000);
        
        // Update current rotation for tracking
        this.currentRotation = totalRotation % 360;
        
        // Show winner after final spin
        setTimeout(() => {
            const winner = this.calculateWinner();
            this.showWinner(winner);
            this.isSpinning = false;
            this.spinBtn.disabled = false;
        }, 7000);
    }
    
    calculateWinner() {
        const angleStep = 360 / this.names.length;
        const normalizedRotation = (360 - (this.currentRotation % 360)) % 360;
        const winningIndex = Math.floor(normalizedRotation / angleStep);
        return this.names[winningIndex];
    }
    
    showWinner(winner) {
        this.winnerNameEl.textContent = winner;
        this.winnerOverlay.style.display = 'flex';
        
        // More dramatic confetti animation
        const duration = 10 * 1000;
        const animationEnd = Date.now() + duration;
        
        // Initial burst
        const burstCount = 100;
        for (let i = 0; i < burstCount; i++) {
            confetti({
                particleCount: 3,
                angle: 60 + (i * 360 / burstCount),
                spread: 55,
                origin: { x: 0.5, y: 0.6 },
                colors: ['#ff6b6b', '#4ecdc4', '#ffbe0b'],
                zIndex: 2000, // Ensure it's above the overlay
                gravity: 1.2,
                scalar: 1.2,
                drift: 0
            });
        }
        
        // Continuous side confetti
        const interval = setInterval(() => {
            if (Date.now() > animationEnd) {
                clearInterval(interval);
                return;
            }
            
            // Left side
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#ff6b6b', '#4ecdc4'],
                zIndex: 2000
            });
            
            // Right side
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#ff6b6b', '#4ecdc4'],
                zIndex: 2000
            });
        }, 50);
    }
    
    hideWinner() {
        this.winnerOverlay.style.display = 'none';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const names = [
        'Margaux', 'Yoann', 'Loïc',
        'Pierrick', 'Thomas', 'Manu',
        'Abdelhamid', 'Pierre R', 'David O',
        'Abraham', 'David M', 'Pierre M',
    ];
    
    new Roulette(names);

    // Add click listener for extra confetti
    document.addEventListener('click', (event) => {
        // Don't trigger on spin button or winner overlay
        if (event.target.classList.contains('spin-btn') || 
            event.target.closest('.winner-overlay')) {
            return;
        }

        // Create a burst of confetti from click position
        const x = event.clientX / window.innerWidth;
        const y = event.clientY / window.innerHeight;

        // Random number of particles (more fun!)
        const particleCount = 8 + Math.floor(Math.random() * 15);

        // Create a circular burst
        for (let i = 0; i < 8; i++) {
            const angle = (i * 45) + (Math.random() * 20 - 10); // 45° intervals with some randomness
            confetti({
                particleCount: Math.ceil(particleCount / 8),
                angle: angle,
                spread: 40,
                origin: { x, y },
                colors: ['#ff6b6b', '#4ecdc4', '#ffbe0b', '#ff9a9e', '#a8edea'],
                zIndex: 2000,
                gravity: 1,
                scalar: 1.2,
                drift: Math.random() - 0.5,
                ticks: 200
            });
        }

        // Add some random floating confetti
        confetti({
            particleCount: 5,
            angle: 90,
            spread: 360,
            origin: { x, y },
            colors: ['#ff6b6b', '#4ecdc4', '#ffbe0b'],
            zIndex: 2000,
            gravity: 0.6,
            scalar: 1,
            drift: 0,
            ticks: 300
        });
    });
});
