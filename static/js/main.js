// JavaScript principal para Lumiar Linktree
document.addEventListener('DOMContentLoaded', function() {
    // Inicialização de funcionalidades
    initAnimations();
    initWhatsAppTracking();
    initMobileMenu();
    initScrollEffects();
    initTooltips();
    checkConnectionStatus();
    preloadPages();
    optimizePerformance();
    initAnalytics();
    
    // Log de inicialização
    console.log('🏡 Lumiar Linktree carregado com sucesso!');
});

// Animações de entrada e interatividade
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                entry.target.classList.add('animated');
            }
        });
    }, observerOptions);

    // Observa elementos para animação
    document.querySelectorAll('.action-card, .link-item, .hero, .whatsapp-card').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'all 0.6s ease-out';
        observer.observe(element);
    });

    // Efeito de clique nos links
    document.querySelectorAll('.action-card, .link-item, .card-button').forEach(link => {
        link.addEventListener('click', function(e) {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}

// Tracking de cliques no WhatsApp
function initWhatsAppTracking() {
    document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
        link.addEventListener('click', function() {
            const source = this.closest('.whatsapp-section') ? 'hero_section' : 
                          this.closest('.contact-grid') ? 'quick_contact' : 
                          this.closest('.action-card') ? 'action_card' : 
                          this.closest('.card-button') ? 'property_card' : 'general';
            
            trackWhatsAppClick(source);
            
            // Adiciona efeito visual
            this.style.transform = 'scale(1.05)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
        });
    });
}

// Menu mobile responsivo
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');
    
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', function() {
            nav.classList.toggle('mobile-open');
            this.classList.toggle('active');
        });
        
        // Fecha menu ao clicar em link
        nav.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                nav.classList.remove('mobile-open');
                menuToggle.classList.remove('active');
            });
        });
    }
}

// Efeitos de scroll
function initScrollEffects() {
    let lastScrollTop = 0;
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Header dinâmico
        if (header) {
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
        }
        
        // Parallax suave no hero
        const hero = document.querySelector('.hero');
        if (hero && scrollTop < hero.offsetHeight) {
            hero.style.transform = `translateY(${scrollTop * 0.5}px)`;
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Smooth scroll para links internos
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
}

// Tooltips informativos
function initTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            showTooltip(this, this.getAttribute('data-tooltip'));
        });
        
        element.addEventListener('mouseleave', function() {
            hideTooltip();
        });
    });
}

function showTooltip(element, text) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = text;
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
    
    setTimeout(() => tooltip.classList.add('show'), 10);
}

function hideTooltip() {
    const tooltip = document.querySelector('.tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// Função global para tracking
function trackWhatsAppClick(source) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'whatsapp_click', {
            'event_category': 'engagement',
            'event_label': source,
            'value': 1
        });
    }
    
    if (typeof fbq !== 'undefined') {
        fbq('track', 'Contact', {
            source: source
        });
    }
    
    console.log('WhatsApp click tracked:', source);
}

// Notificações toast
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span>${message}</span>
            <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Detecção de conexão
function checkConnectionStatus() {
    if (navigator.onLine) {
        hideOfflineMessage();
    } else {
        showOfflineMessage();
    }
}

function showOfflineMessage() {
    if (!document.querySelector('.offline-banner')) {
        const banner = document.createElement('div');
        banner.className = 'offline-banner';
        banner.innerHTML = `
            <div class="offline-content">
                📶 Você está offline. Algumas funcionalidades podem não estar disponíveis.
            </div>
        `;
        document.body.insertBefore(banner, document.body.firstChild);
    }
}

function hideOfflineMessage() {
    const banner = document.querySelector('.offline-banner');
    if (banner) {
        banner.remove();
    }
}

// Event listeners para conexão
window.addEventListener('online', checkConnectionStatus);
window.addEventListener('offline', checkConnectionStatus);

// Preload de páginas importantes
function preloadPages() {
    const importantPages = ['/empreendimentos', '/campanhas', '/vagas'];
    
    importantPages.forEach(page => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = page;
        document.head.appendChild(link);
    });
}

// Otimizações de performance
function optimizePerformance() {
    // Lazy loading de imagens
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// Analytics básico
function initAnalytics() {
    let clickCounts = JSON.parse(localStorage.getItem('linkClicks')) || {};
    
    document.querySelectorAll('.link-item, .action-card').forEach(link => {
        link.addEventListener('click', function() {
            const linkText = this.querySelector('span, .card-title')?.textContent || 'Unknown';
            clickCounts[linkText] = (clickCounts[linkText] || 0) + 1;
            localStorage.setItem('linkClicks', JSON.stringify(clickCounts));
            
            console.log('Click registrado:', linkText, clickCounts[linkText]);
        });
    });

    // Função global para mostrar estatísticas
    window.showStats = function() {
        console.table(clickCounts);
    };
}

// Função para rastrear evento personalizado
function trackEvent(category, action, label) {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': category,
            'event_label': label
        });
    }
    
    console.log('Event tracked:', { category, action, label });
}

// Tracking para links externos
document.addEventListener('click', function(e) {
    const link = e.target.closest('a[href^="http"]');
    if (link && !link.href.includes(window.location.hostname)) {
        trackEvent('engagement', 'external_link_click', link.href);
    }
});

// Função para copiar URL atual
window.copyCurrentUrl = function() {
    navigator.clipboard.writeText(window.location.href).then(function() {
        showToast('Link copiado com sucesso!', 'success');
    }).catch(function() {
        showToast('Erro ao copiar link', 'error');
    });
};

// Função para compartilhar via Web Share API
window.shareCurrentPage = function() {
    if (navigator.share) {
        navigator.share({
            title: document.title,
            text: 'Confira os empreendimentos da Lumiar Imóveis',
            url: window.location.href
        }).then(() => {
            trackEvent('engagement', 'page_shared', 'native_share');
        }).catch(() => {
            copyCurrentUrl();
        });
    } else {
        copyCurrentUrl();
    }
};

// Detecção de dispositivo móvel
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

if (isMobile) {
    document.body.classList.add('mobile-device');
}