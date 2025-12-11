document.addEventListener('DOMContentLoaded', () => {
    console.log('System Initialized...');

    // Initialize Particles
    initParticles();

    // Initial Boot Sequence
    playBootSequence();

    // Initialize Skills
    initSkillModule();

    // Initialize Experience Observer
    const experienceSection = document.getElementById('experience');
    if (experienceSection) {
        observer.observe(experienceSection);
    }
});

function initParticles() {
    const container = document.getElementById('particles-container');
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('absolute', 'w-1', 'h-1', 'bg-neon-cyan', 'rounded-full', 'opacity-50');

        // Random positioning
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.top = Math.random() * 100 + 'vh';

        container.appendChild(particle);

        // Animate with Anime.js
        anime({
            targets: particle,
            translateY: [
                { value: Math.random() * -100, duration: 2000 + Math.random() * 3000 },
                { value: Math.random() * 100, duration: 2000 + Math.random() * 3000 }
            ],
            translateX: [
                { value: Math.random() * -50, duration: 2000 + Math.random() * 3000 },
                { value: Math.random() * 50, duration: 2000 + Math.random() * 3000 }
            ],
            opacity: [
                { value: 0, duration: 1000 },
                { value: 0.5, duration: 1000 },
                { value: 0, duration: 1000 }
            ],
            easing: 'linear',
            loop: true,
            delay: Math.random() * 2000
        });
    }
}

function playBootSequence() {
    const bootTextContainer = document.getElementById('boot-text');
    const subtitle = document.getElementById('hero-subtitle');
    const btn = document.getElementById('enter-btn');

    const messages = [
        "Initializing Developer Interface...",
        "Loading Core Modules...",
        "Establishing Neural Link...",
        "Boot Sequence Complete."
    ];

    let delay = 0;

    messages.forEach((msg, index) => {
        setTimeout(() => {
            const p = document.createElement('p');
            p.textContent = `> ${msg}`;
            p.classList.add('typing-effect');
            bootTextContainer.appendChild(p);

            // Scroll to bottom
            bootTextContainer.scrollTop = bootTextContainer.scrollHeight;
        }, delay);

        delay += 800;
    });

    // Final reveal
    setTimeout(() => {
        anime({
            targets: [subtitle, btn],
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 1000,
            easing: 'easeOutExpo',
            delay: anime.stagger(300)
        });
    }, delay + 500);
}

// Skill Module Logic
const skills = [
    'HTML', 'CSS', 'JS', 'React', 'Django',
    'MySQL', 'PostgreSQL', 'REST API', 'Git', 'Firebase'
];

function initSkillModule() {
    const container = document.getElementById('skills-container');
    const canvas = document.getElementById('skills-canvas');
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');

    // Resize canvas
    function resizeCanvas() {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const nodes = [];

    // Create Nodes
    skills.forEach(skill => {
        const node = document.createElement('div');
        node.classList.add('skill-node');
        node.textContent = skill;

        // Random Position
        const x = Math.random() * (container.offsetWidth - 100);
        const y = Math.random() * (container.offsetHeight - 100);

        node.style.left = `${x}px`;
        node.style.top = `${y}px`;

        container.appendChild(node);

        nodes.push({
            element: node,
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5
        });

        // Hover Effect
        node.addEventListener('mouseenter', () => {
            anime({
                targets: node,
                scale: 1.2,
                duration: 300
            });
        });

        node.addEventListener('mouseleave', () => {
            anime({
                targets: node,
                scale: 1,
                duration: 300
            });
        });
    });

    // Animation Loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.2)';
        ctx.lineWidth = 1;

        nodes.forEach(node => {
            // Update Position
            node.x += node.vx;
            node.y += node.vy;

            // Bounce off walls
            if (node.x <= 0 || node.x >= container.offsetWidth - 100) node.vx *= -1;
            if (node.y <= 0 || node.y >= container.offsetHeight - 100) node.vy *= -1;

            node.element.style.left = `${node.x}px`;
            node.element.style.top = `${node.y}px`;

            // Draw Connections
            nodes.forEach(otherNode => {
                const dx = node.x - otherNode.x;
                const dy = node.y - otherNode.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 200) {
                    ctx.beginPath();
                    ctx.moveTo(node.x + 50, node.y + 50);
                    ctx.lineTo(otherNode.x + 50, otherNode.y + 50);
                    ctx.stroke();
                }
            });
        });

        requestAnimationFrame(animate);
    }

    animate();
}

// Project Modal Logic
const projectData = {
    'WeatherApp': {
        title: 'WeatherApp',
        desc: 'A futuristic weather dashboard that visualizes real-time data using holographic charts and particle effects.',
        tech: ['React', 'OpenWeatherMap API', 'Chart.js', 'Anime.js'],
        features: [
            'Real-time temperature tracking',
            'Interactive 3D globe',
            'Severe weather alerts',
            'Historical data analysis'
        ]
    },
    'EduVision': {
        title: 'EduVision',
        desc: 'An AI-powered OCR platform that converts handwritten notes into digital text with high accuracy.',
        tech: ['Python', 'TensorFlow', 'Tesseract OCR', 'Flask'],
        features: [
            'Handwriting recognition',
            'Multi-language support',
            'Cloud storage integration',
            'Export to PDF/Word'
        ]
    },
    'E-Commerce': {
        title: 'Exclusive E-commerce',
        desc: 'A premium shopping platform featuring 3D product previews and a seamless checkout experience.',
        tech: ['Next.js', 'Three.js', 'Stripe', 'Tailwind CSS'],
        features: [
            '3D Product Viewer',
            'AR Try-on',
            'Secure Payment Gateway',
            'User Personalization'
        ]
    },
    'DataBreach': {
        title: 'Data Breach Checker',
        desc: 'A security tool that allows users to verify if their email addresses have been compromised in known data breaches.',
        tech: ['Node.js', 'HaveIBeenPwned API', 'Express', 'Security'],
        features: [
            'Instant Breach Check',
            'Password Strength Analyzer',
            'Security Tips',
            'Dark Web Monitoring'
        ]
    },
    'SkillSync': {
        title: 'SkillSync',
        desc: 'A collaborative learning platform connecting developers for peer-to-peer mentorship and skill exchange.',
        tech: ['Vue.js', 'Firebase', 'WebRTC', 'Socket.io'],
        features: [
            'Real-time Code Pairing',
            'Video Chat',
            'Skill Matching Algorithm',
            'Community Forums'
        ]
    }
};

function openProjectModal(projectId) {
    const modal = document.getElementById('project-modal');
    const modalBody = document.getElementById('modal-body');
    const data = projectData[projectId];

    if (!data) return;

    modalBody.innerHTML = `
        <h2 class="text-3xl md:text-4xl font-orbitron font-bold text-neon-cyan mb-4">${data.title}</h2>
        <p class="text-gray-300 font-rajdhani text-lg mb-6">${data.desc}</p>
        
        <div class="mb-6">
            <h3 class="text-xl font-orbitron text-white mb-2">Tech Stack</h3>
            <div class="flex flex-wrap gap-2">
                ${data.tech.map(t => `<span class="px-3 py-1 border border-neon-cyan/30 rounded text-neon-cyan text-sm">${t}</span>`).join('')}
            </div>
        </div>
        
        <div>
            <h3 class="text-xl font-orbitron text-white mb-2">Key Features</h3>
            <ul class="list-disc list-inside text-gray-400 font-rajdhani">
                ${data.features.map(f => `<li>${f}</li>`).join('')}
            </ul>
        </div>
        
        <div class="mt-8 flex justify-end">
            <button class="px-6 py-2 bg-neon-cyan/10 border border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black transition-all font-orbitron text-sm tracking-wider">
                LAUNCH PROJECT
            </button>
        </div>
    `;

    modal.classList.remove('hidden');
    // Small delay to allow display:block to apply before opacity transition
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        document.getElementById('modal-content').classList.remove('scale-95');
        document.getElementById('modal-content').classList.add('scale-100');
    }, 10);
}

function closeProjectModal() {
    const modal = document.getElementById('project-modal');
    const modalContent = document.getElementById('modal-content');

    modal.classList.add('opacity-0');
    modalContent.classList.remove('scale-100');
    modalContent.classList.add('scale-95');

    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// Close modal on outside click
document.getElementById('project-modal').addEventListener('click', (e) => {
    if (e.target.id === 'project-modal') {
        closeProjectModal();
    }
});

// Timeline Animation
const observerOptions = {
    threshold: 0.2
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            if (entry.target.id === 'experience') {
                document.getElementById('timeline-progress').style.height = '100%';

                const items = document.querySelectorAll('.timeline-item');
                items.forEach((item, index) => {
                    setTimeout(() => {
                        item.classList.remove('opacity-0', 'translate-y-10');
                    }, index * 300);
                });
            }
        }
    });
}, observerOptions);

// Navigation Scroll Spy & Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('nav a');

window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - sectionHeight / 3) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('text-neon-cyan');
        link.classList.add('text-gray-300');
        if (link.getAttribute('href').includes(current)) {
            link.classList.remove('text-gray-300');
            link.classList.add('text-neon-cyan');
        }
    });

    // Navbar background on scroll
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('bg-dark-bg/90', 'shadow-lg');
    } else {
        navbar.classList.remove('bg-dark-bg/90', 'shadow-lg');
    }
});

// Contact Form Logic
document.getElementById('contact-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const btn = e.target.querySelector('button');
    const originalText = btn.innerHTML;

    btn.innerHTML = '<span class="relative z-10">TRANSMITTING...</span><div class="absolute inset-0 bg-neon-purple w-full"></div>';

    // Simulate transmission
    setTimeout(() => {
        btn.innerHTML = '<span class="relative z-10">TRANSMISSION SENT</span><div class="absolute inset-0 bg-green-500 w-full"></div>';

        // Particle Burst
        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.classList.add('fixed', 'w-1', 'h-1', 'bg-neon-purple', 'rounded-full', 'z-50', 'pointer-events-none');
            particle.style.left = `${centerX}px`;
            particle.style.top = `${centerY}px`;
            document.body.appendChild(particle);

            anime({
                targets: particle,
                translateX: (Math.random() - 0.5) * 200,
                translateY: (Math.random() - 0.5) * 200,
                opacity: [1, 0],
                duration: 1000,
                easing: 'easeOutExpo',
                complete: () => particle.remove()
            });
        }

        // Reset form
        e.target.reset();

        setTimeout(() => {
            btn.innerHTML = originalText;
        }, 3000);
    }, 1500);
});
