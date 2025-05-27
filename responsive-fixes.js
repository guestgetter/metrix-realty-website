// Comprehensive Responsive Fixes for Metrix Realty Website
// This script ensures all pages are fully responsive and functional

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Functionality
    initializeMobileMenu();
    
    // Responsive Image Loading
    optimizeImages();
    
    // Touch Target Optimization
    optimizeTouchTargets();
    
    // Viewport Height Fix for Mobile
    fixViewportHeight();
    
    // Smooth Scrolling
    initializeSmoothScrolling();
});

function initializeMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const hamburger = document.querySelector('.hamburger');
    const servicesToggle = document.querySelector('.services-toggle');
    const servicesSubmenu = document.querySelector('.services-submenu');

    if (!mobileMenuButton || !mobileMenu) return;

    // Toggle mobile menu
    function toggleMobileMenu() {
        const isOpen = mobileMenu.classList.contains('translate-x-0');
        
        if (isOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }

    // Open mobile menu
    function openMobileMenu() {
        mobileMenu.classList.remove('translate-x-full');
        mobileMenu.classList.add('translate-x-0');
        if (mobileMenuOverlay) mobileMenuOverlay.classList.remove('hidden');
        if (hamburger) hamburger.classList.add('open');
        document.body.classList.add('overflow-hidden');
    }

    // Close mobile menu
    function closeMobileMenu() {
        mobileMenu.classList.remove('translate-x-0');
        mobileMenu.classList.add('translate-x-full');
        if (mobileMenuOverlay) mobileMenuOverlay.classList.add('hidden');
        if (hamburger) hamburger.classList.remove('open');
        document.body.classList.remove('overflow-hidden');
    }

    // Event listeners
    mobileMenuButton.addEventListener('click', toggleMobileMenu);
    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', closeMobileMenu);
    }

    // Services submenu toggle
    if (servicesToggle && servicesSubmenu) {
        servicesToggle.addEventListener('click', function() {
            servicesSubmenu.classList.toggle('hidden');
            const arrow = servicesToggle.querySelector('svg');
            if (arrow) arrow.classList.toggle('rotate-180');
        });
    }

    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMobileMenu();
        }
    });

    // Close menu when clicking on menu links
    const mobileMenuLinks = mobileMenu.querySelectorAll('a');
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
}

function optimizeImages() {
    // Lazy loading for images
    const images = document.querySelectorAll('img');
    
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

        images.forEach(img => {
            if (img.dataset.src) {
                imageObserver.observe(img);
            }
        });
    }
}

function optimizeTouchTargets() {
    // Ensure all interactive elements meet minimum touch target size (44px)
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
    
    interactiveElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        if (rect.height < 44 || rect.width < 44) {
            element.style.minHeight = '44px';
            element.style.minWidth = '44px';
            element.style.display = 'inline-flex';
            element.style.alignItems = 'center';
            element.style.justifyContent = 'center';
        }
    });
}

function fixViewportHeight() {
    // Fix viewport height issues on mobile browsers
    function setViewportHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);
}

function initializeSmoothScrolling() {
    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const headerHeight = document.querySelector('header')?.offsetHeight || 0;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Responsive breakpoint utilities
const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
};

function getCurrentBreakpoint() {
    const width = window.innerWidth;
    if (width >= breakpoints['2xl']) return '2xl';
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    if (width >= breakpoints.sm) return 'sm';
    return 'xs';
}

// Export utilities for use in other scripts
window.MetrixResponsive = {
    getCurrentBreakpoint,
    breakpoints,
    initializeMobileMenu,
    optimizeImages,
    optimizeTouchTargets,
    fixViewportHeight,
    initializeSmoothScrolling
};

// Add responsive classes based on screen size
function addResponsiveClasses() {
    const breakpoint = getCurrentBreakpoint();
    document.body.className = document.body.className.replace(/breakpoint-\w+/g, '');
    document.body.classList.add(`breakpoint-${breakpoint}`);
}

addResponsiveClasses();
window.addEventListener('resize', addResponsiveClasses); 