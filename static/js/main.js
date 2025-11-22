// Filtros da página de empreendimentos
document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const empreendimentoCards = document.querySelectorAll('.empreendimento-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Remove active de todos os botões
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Adiciona active ao botão clicado
            this.classList.add('active');
            
            // Filtra os cards
            empreendimentoCards.forEach(card => {
                const cardType = card.getAttribute('data-tipo');
                if (filter === 'all' || cardType === filter) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeInUp 0.5s ease-out';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Smooth scrolling para links internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Adiciona animação aos cards quando entram na viewport
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observa todos os cards
    document.querySelectorAll('.action-card, .empreendimento-card, .contact-item').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease-out';
        observer.observe(card);
    });

    // Contador animado para estatísticas
    function animateCounter(element, start, end, duration) {
        let startTime = null;
        
        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            const value = Math.floor(progress * (end - start) + start);
            element.textContent = value + (end > 100 ? '+' : '');
            
            if (progress < 1) {
                requestAnimationFrame(animation);
            }
        }
        
        requestAnimationFrame(animation);
    }

    // Anima contadores quando visíveis
    const counterElements = document.querySelectorAll('.stat-number');
    const counters = [
        { element: counterElements[1], start: 0, end: 15 },
        { element: counterElements[2], start: 0, end: 500 }
    ];

    const counterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = counters.find(c => c.element === entry.target);
                if (counter) {
                    animateCounter(counter.element, counter.start, counter.end, 2000);
                    counterObserver.unobserve(entry.target);
                }
            }
        });
    });

    counterElements.forEach(element => {
        if (element) counterObserver.observe(element);
    });
});

// Função para rastrear cliques nos botões do WhatsApp
function trackWhatsAppClick(source) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'whatsapp_click', {
            'event_category': 'engagement',
            'event_label': source
        });
    }
    console.log('WhatsApp click tracked:', source);
}

// Adiciona tracking aos links do WhatsApp
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
        link.addEventListener('click', function() {
            const source = this.closest('.whatsapp-section') ? 'daniel_hero' : 
                          this.closest('.contact-grid') ? 'quick_contact' : 
                          this.closest('.card-button') ? 'property_card' : 'general';
            trackWhatsAppClick(source);
        });
    });
});

// Menu mobile toggle (se implementado futuramente)
function toggleMobileMenu() {
    const nav = document.querySelector('.nav');
    nav.classList.toggle('mobile-open');
}

// Lazy loading para imagens
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
});

// Formulário de contato (se implementado futuramente)
function submitContactForm(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    // Aqui você pode implementar envio via AJAX
    console.log('Form data:', data);
    
    // Redirecionar para WhatsApp com mensagem personalizada
    const message = `Olá! Meu nome é ${data.nome}. ${data.mensagem}`;
    const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Função para compartilhar propriedade
function shareProperty(propertyName, propertyUrl) {
    if (navigator.share) {
        navigator.share({
            title: propertyName,
            text: `Confira este imóvel da Lumiar: ${propertyName}`,
            url: propertyUrl
        });
    } else {
        // Fallback para navegadores sem suporte ao Web Share API
        const shareText = `Confira este imóvel da Lumiar: ${propertyName} - ${propertyUrl}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        window.open(whatsappUrl, '_blank');
    }
}

// Service Worker para cache (PWA básico)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/static/sw.js')
            .then(function(registration) {
                console.log('SW registered: ', registration);
            })
            .catch(function(registrationError) {
                console.log('SW registration failed: ', registrationError);
            });
    });
}