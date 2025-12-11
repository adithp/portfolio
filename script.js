gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

// --- CONFIGURATION ---
const CONFIG = {
    scrollLerp: 0.1, // Lower = smoother/slower
    skewIntensity: 0.15,
    particleCount: 150, // Adjusted for performance
    particleColor: '#00f3ff',
    mouseRepelDist: 150,
    connectionDist: 100
};

// --- STATE ---
const state = {
    scroll: {
        current: 0,
        target: 0,
        limit: 0
    },
    mouse: { x: 0, y: 0 }
};

// --- DOM ELEMENTS ---
const dom = {
    wrapper: document.getElementById('smooth-scroll-wrapper'),
    content: document.getElementById('content'),
    canvas: document.getElementById('bg-canvas'),
    cursor: document.getElementById('cursor'),
    follower: document.getElementById('cursor-follower'),
    coords: document.getElementById('coords'),
    heroTitle: document.getElementById('hero-title'),
    heroSubtitle: document.getElementById('hero-subtitle')
};

// --- VIRTUAL SCROLL ---
class VirtualScroll {
    constructor() {
        this.init();
    }

    init() {
        // 1. Setup ScrollTrigger Proxy
        ScrollTrigger.scrollerProxy(dom.wrapper, {
            scrollTop(value) {
                if (arguments.length) {
                    state.scroll.current = value;
                    state.scroll.target = value; // Jump to position if set
                    return;
                }
                return state.scroll.current;
            },
            getBoundingClientRect() {
                return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
            },
            // CRITICAL FIX: Since dom.content is transformed, position: fixed won't work for children.
            // We must use "transform" pinning strategy.
            pinType: "transform"
        });

        // 2. Set Defaults
        ScrollTrigger.defaults({ scroller: dom.wrapper });

        // 3. Resize Observer for accurate height
        const resizeObserver = new ResizeObserver(() => this.onResize());
        resizeObserver.observe(dom.content);

        // 4. Listeners
        window.addEventListener('resize', this.onResize.bind(this));
        window.addEventListener('wheel', this.onWheel.bind(this), { passive: false });

        // 5. Initial Render
        this.onResize();
        this.render();
    }

    onResize() {
        // CRITICAL FIX: Refresh ScrollTrigger FIRST so it adds pin spacers and adjusts layout.
        ScrollTrigger.refresh();

        // THEN measure the content height (which now includes spacers).
        const contentHeight = dom.content.getBoundingClientRect().height;
        state.scroll.limit = contentHeight - window.innerHeight;
        document.body.style.height = `${contentHeight}px`;
    }

    onWheel(e) {
        // e.preventDefault(); // Optional: prevent native scroll if we want full control, but might block other things. 
        // Since we have overflow: hidden on body, native scroll is disabled anyway.

        const delta = e.deltaY;
        state.scroll.target += delta;
        state.scroll.target = Math.max(0, Math.min(state.scroll.target, state.scroll.limit));
    }

    render() {
        // Lerp
        state.scroll.current += (state.scroll.target - state.scroll.current) * CONFIG.scrollLerp;

        // Snap to target if close enough (performance)
        if (Math.abs(state.scroll.target - state.scroll.current) < 0.1) {
            state.scroll.current = state.scroll.target;
        }

        // Velocity for skew
        const velocity = state.scroll.target - state.scroll.current;
        const skew = velocity * CONFIG.skewIntensity;

        // Apply transform
        dom.content.style.transform = `translate3d(0, -${state.scroll.current}px, 0) skewY(${skew}deg)`;

        // Update ScrollTrigger
        ScrollTrigger.update();

        requestAnimationFrame(this.render.bind(this));
    }
}

// --- CANVAS BACKGROUND ---
class ParticleSystem {
    constructor() {
        this.ctx = dom.canvas.getContext('2d');
        this.particles = [];
        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', this.resize.bind(this));

        for (let i = 0; i < CONFIG.particleCount; i++) {
            this.particles.push(new Particle(this.ctx));
        }

        this.animate();
    }

    resize() {
        dom.canvas.width = window.innerWidth;
        dom.canvas.height = window.innerHeight;
    }

    animate() {
        this.ctx.clearRect(0, 0, dom.canvas.width, dom.canvas.height);

        this.particles.forEach(p => {
            p.update();
            p.draw();
        });

        this.drawConnections();

        requestAnimationFrame(this.animate.bind(this));
    }

    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONFIG.connectionDist) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(0, 243, 255, ${1 - dist / CONFIG.connectionDist})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }
}

class Particle {
    constructor(ctx) {
        this.ctx = ctx;
        this.x = Math.random() * dom.canvas.width;
        this.y = Math.random() * dom.canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2;
    }

    update() {
        // Mouse Repulsion
        const dx = state.mouse.x - this.x;
        const dy = state.mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONFIG.mouseRepelDist) {
            const force = (CONFIG.mouseRepelDist - dist) / CONFIG.mouseRepelDist;
            const angle = Math.atan2(dy, dx);
            this.vx -= Math.cos(angle) * force * 0.5;
            this.vy -= Math.sin(angle) * force * 0.5;
        }

        this.x += this.vx;
        this.y += this.vy;

        // Bounce off walls
        if (this.x < 0 || this.x > dom.canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > dom.canvas.height) this.vy *= -1;
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.fillStyle = CONFIG.particleColor;
        this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        this.ctx.fill();
    }
}

// --- MICRO INTERACTIONS ---
class MicroInteractions {
    constructor() {
        this.initCursor();
        this.initTextScramble();
        this.initCoords();
    }

    initCursor() {
        window.addEventListener('mousemove', (e) => {
            state.mouse.x = e.clientX;
            state.mouse.y = e.clientY;

            gsap.to(dom.cursor, { x: e.clientX - 8, y: e.clientY - 8, duration: 0.1 });
            gsap.to(dom.follower, { x: e.clientX - 20, y: e.clientY - 20, duration: 0.3 });
        });
    }

    initTextScramble() {
        // Simple scramble effect
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';

        const scramble = (element, finalText) => {
            let iterations = 0;
            const interval = setInterval(() => {
                element.innerText = finalText
                    .split('')
                    .map((letter, index) => {
                        if (index < iterations) return finalText[index];
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join('');

                if (iterations >= finalText.length) clearInterval(interval);
                iterations += 1 / 3;
            }, 30);
        };

        // Trigger on load
        setTimeout(() => {
            dom.heroTitle.style.opacity = 1;
            scramble(dom.heroTitle, 'ADITH');

            setTimeout(() => {
                dom.heroSubtitle.style.opacity = 1;
                scramble(dom.heroSubtitle, 'CREATIVE TECHNOLOGIST');
            }, 1000);
        }, 500);
    }

    initCoords() {
        setInterval(() => {
            dom.coords.innerText = `X: ${state.mouse.x.toFixed(3)} | Y: ${state.mouse.y.toFixed(3)}`;
        }, 100);
    }
}

// --- ANIMATIONS ---
class Animations {
    constructor() {
        this.initHero();
        this.initSkills();
        this.initProjects();
        this.initContact();
        this.initLiquidReveal();
    }

    initHero() {
        // Hero Reveal Sequence
        const tl = gsap.timeline();

        tl.to('#hero-title', { opacity: 1, duration: 0.1 })
            .to('.cube-container', { opacity: 1, duration: 1 }, "-=0.5");
    }

    initSkills() {
        const solarSystem = document.getElementById('solar-system');
        const skills = [
            'HTML', 'CSS', 'JS', 'BOOTSTRAP', 'TAILWIND',
            'JQUERY', 'AJAX', 'REACT', 'PYTHON', 'DJANGO',
            'REACT NATIVE', 'PWA', 'REST API'
        ];
        const radiusStep = 40; // Reduced to fit more orbits

        skills.forEach((skill, index) => {
            const orbitRadius = (index + 1) * radiusStep;
            const orbitDuration = 10 + (index * 2); // Faster increment for variety

            // Create Orbit Path (Visual)
            const orbitPath = document.createElement('div');
            orbitPath.className = 'absolute border border-neon-blue/20 rounded-full';
            orbitPath.style.width = `${orbitRadius * 2}px`;
            orbitPath.style.height = `${orbitRadius * 2}px`;
            solarSystem.appendChild(orbitPath);

            // Create Planet (Skill)
            const planet = document.createElement('div');
            planet.className = 'absolute w-10 h-10 bg-black border border-neon-blue rounded-full flex items-center justify-center text-[8px] font-mono text-neon-blue shadow-[0_0_10px_rgba(0,243,255,0.5)] cursor-pointer hover:bg-neon-blue hover:text-black transition-colors z-10 text-center leading-tight';
            planet.innerText = skill;
            solarSystem.appendChild(planet);

            // Animate Orbit
            gsap.to(planet, {
                motionPath: {
                    path: [
                        { x: orbitRadius, y: 0 },
                        { x: 0, y: orbitRadius },
                        { x: -orbitRadius, y: 0 },
                        { x: 0, y: -orbitRadius },
                        { x: orbitRadius, y: 0 }
                    ],
                    curviness: 1.5,
                    autoRotate: false
                },
                duration: orbitDuration,
                repeat: -1,
                ease: "linear"
            });

            // Hover Interaction
            planet.addEventListener('mouseenter', () => {
                gsap.to(planet, { scale: 2, duration: 0.3, ease: "back.out(1.7)" });
                gsap.globalTimeline.timeScale(0.1); // Slow down time
            });

            planet.addEventListener('mouseleave', () => {
                gsap.to(planet, { scale: 1, duration: 0.3 });
                gsap.globalTimeline.timeScale(1); // Resume time
            });
        });
    }

    initProjects() {
        const carousel = document.getElementById('project-carousel');
        const cards = document.querySelectorAll('.project-card');

        // Horizontal Scroll
        gsap.to(carousel, {
            x: () => -(carousel.scrollWidth - window.innerWidth),
            ease: "none",
            scrollTrigger: {
                trigger: "#projects",
                start: "top top",
                end: () => "+=" + carousel.scrollWidth,
                scrub: 1,
                pin: true,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onUpdate: () => {
                    // 3D Rotation Effect based on position relative to center
                    const center = window.innerWidth / 2;
                    cards.forEach(card => {
                        const cardRect = card.getBoundingClientRect();
                        const cardCenter = cardRect.left + cardRect.width / 2;
                        const dist = (cardCenter - center) / center; // -1 to 1 (approx)

                        // Clamp rotation
                        const rotation = Math.max(-45, Math.min(45, dist * 45));
                        gsap.set(card, { rotateY: rotation });
                    });
                }
            }
        });
    }

    initContact() {
        // Particle Emitter on Input
        const input = document.querySelector('#contact-form input');
        const emitter = document.querySelector('.particle-emitter');

        if (input && emitter) {
            input.addEventListener('input', () => {
                // Create spark
                const spark = document.createElement('div');
                spark.className = 'absolute w-1 h-1 bg-neon-blue rounded-full pointer-events-none';
                emitter.appendChild(spark);

                gsap.fromTo(spark,
                    { x: 0, y: 0, opacity: 1 },
                    {
                        x: (Math.random() - 0.5) * 50,
                        y: (Math.random() - 0.5) * 50,
                        opacity: 0,
                        duration: 0.5,
                        onComplete: () => spark.remove()
                    }
                );
            });
        }

        // Warp Speed Send
        const form = document.getElementById('contact-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();

                // Warp Effect
                gsap.to('.vortex-container', { scale: 5, opacity: 0, duration: 1, ease: "power2.in" });
                gsap.to('#content', { scale: 5, opacity: 0, duration: 1, ease: "power2.in" });
                gsap.to('body', {
                    backgroundColor: '#ffffff', duration: 0.1, delay: 1, onComplete: () => {
                        alert('TRANSMISSION COMPLETE');
                        location.reload();
                    }
                });
            });
        }
    }

    initLiquidReveal() {
        // Apply to all images or cards
        const elements = document.querySelectorAll('.project-card, .section-title');

        elements.forEach(el => {
            gsap.fromTo(el,
                { clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)', opacity: 0 },
                {
                    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
                    opacity: 1,
                    duration: 1,
                    ease: "power4.out",
                    scrollTrigger: {
                        trigger: el,
                        start: "top 80%"
                    }
                }
            );
        });
    }
}

// --- INITIALIZATION ---
window.onload = () => {
    // Initialize Virtual Scroll FIRST so Proxy is ready
    const vs = new VirtualScroll();

    new ParticleSystem();
    new MicroInteractions();

    // Initialize Animations AFTER Proxy is setup
    new Animations();

    // Force refresh
    ScrollTrigger.refresh();
};
