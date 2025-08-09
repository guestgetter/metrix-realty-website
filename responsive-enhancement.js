// Metrix Realty - Responsive Enhancement JavaScript
// Complements responsive-enhancement.css for optimal mobile/tablet experience

document.addEventListener('DOMContentLoaded', function() {
    initializeResponsiveEnhancements();
});

function initializeResponsiveEnhancements() {
    // Core responsive utilities
    fixViewportHeight();
    optimizeTouchTargets();
    enhanceMobileNavigation();
    optimizeFormsForMobile();
    handleOrientationChanges();
    improveScrollingExperience();
    
    // Event listeners for responsive updates
    window.addEventListener('resize', debounce(handleWindowResize, 250));
    // Orientation change handling is set up inside handleOrientationChanges();
    // avoid attaching a listener to an undefined function name
    
    // Initialize mobile-specific enhancements
    if (isMobileDevice()) {
        initializeMobileOptimizations();
    }
}

// ===== VIEWPORT HEIGHT FIX =====
function fixViewportHeight() {
    // Fix viewport height issues on mobile browsers (address bar changes)
    function updateViewportHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    updateViewportHeight();
    
    // Update on resize and orientation change
    window.addEventListener('resize', updateViewportHeight);
    window.addEventListener('orientationchange', () => {
        setTimeout(updateViewportHeight, 100); // Delay to ensure proper calculation
    });
}

// ===== TOUCH TARGET OPTIMIZATION =====
function optimizeTouchTargets() {
    // Ensure all interactive elements meet WCAG touch target guidelines (44px minimum)
    const interactiveElements = document.querySelectorAll(
        'button, a, input, select, textarea, [role="button"], [tabindex="0"]'
    );
    
    interactiveElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        
        // Add touch-optimized class if element is too small
        if (rect.height < 44 || rect.width < 44) {
            element.classList.add('touch-optimized');
        }
        
        // Add touch feedback for interactive elements
        if (!element.classList.contains('no-touch-feedback')) {
            addTouchFeedback(element);
        }
    });
}

function addTouchFeedback(element) {
    element.addEventListener('touchstart', function() {
        this.style.transform = 'scale(0.98)';
        this.style.opacity = '0.8';
    }, { passive: true });
    
    element.addEventListener('touchend', function() {
        this.style.transform = '';
        this.style.opacity = '';
    }, { passive: true });
    
    element.addEventListener('touchcancel', function() {
        this.style.transform = '';
        this.style.opacity = '';
    }, { passive: true });
}

// ===== MOBILE NAVIGATION ENHANCEMENT =====
function enhanceMobileNavigation() {
    const mobileMenuButton = document.getElementById('mobile-menu-button') || 
                           document.querySelector('.mobile-menu-button') ||
                           document.querySelector('[data-mobile-menu-toggle]');
    
    const mobileMenu = document.getElementById('mobile-menu') ||
                      document.querySelector('.mobile-menu');
    
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay') ||
                             document.querySelector('.mobile-menu-overlay') ||
                             document.querySelector('.overlay');
    
    if (!mobileMenuButton || !mobileMenu) return;
    
    // Enhanced mobile menu functionality
    mobileMenuButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleMobileMenu();
    });
    
    // Close menu when clicking overlay
    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', closeMobileMenu);
    }
    
    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
            closeMobileMenu();
        }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!mobileMenu.contains(e.target) && !mobileMenuButton.contains(e.target)) {
            if (mobileMenu.classList.contains('open')) {
                closeMobileMenu();
            }
        }
    });
    
    function toggleMobileMenu() {
        const isOpen = mobileMenu.classList.contains('open') || 
                      mobileMenu.classList.contains('translate-x-0');
        
        if (isOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }
    
    function openMobileMenu() {
        mobileMenu.classList.add('open');
        mobileMenu.classList.remove('translate-x-full');
        mobileMenu.classList.add('translate-x-0');
        
        if (mobileMenuOverlay) {
            mobileMenuOverlay.classList.remove('hidden');
            mobileMenuOverlay.classList.add('show');
        }
        
        const hamburger = mobileMenuButton.querySelector('.hamburger');
        if (hamburger) {
            hamburger.classList.add('open');
        }
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        document.body.classList.add('menu-open');
        
        // Focus first menu item for accessibility
        const firstMenuItem = mobileMenu.querySelector('a, button');
        if (firstMenuItem) {
            setTimeout(() => firstMenuItem.focus(), 100);
        }
    }
    
    function closeMobileMenu() {
        mobileMenu.classList.remove('open');
        mobileMenu.classList.add('translate-x-full');
        mobileMenu.classList.remove('translate-x-0');
        
        if (mobileMenuOverlay) {
            mobileMenuOverlay.classList.add('hidden');
            mobileMenuOverlay.classList.remove('show');
        }
        
        const hamburger = mobileMenuButton.querySelector('.hamburger');
        if (hamburger) {
            hamburger.classList.remove('open');
        }
        
        // Restore body scroll
        document.body.style.overflow = '';
        document.body.classList.remove('menu-open');
        
        // Return focus to menu button
        mobileMenuButton.focus();
    }
}

// ===== FORM OPTIMIZATION FOR MOBILE =====
function optimizeFormsForMobile() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            // Prevent zoom on iOS when focusing inputs
            if (input.type !== 'range' && input.type !== 'checkbox' && input.type !== 'radio') {
                const currentFontSize = window.getComputedStyle(input).fontSize;
                const fontSize = parseFloat(currentFontSize);
                
                if (fontSize < 16) {
                    input.style.fontSize = '16px';
                }
            }
            
            // Improve input handling on mobile
            if (isMobileDevice()) {
                // Add proper input modes for better mobile keyboards
                if (input.type === 'email') {
                    input.setAttribute('inputmode', 'email');
                }
                if (input.type === 'tel') {
                    input.setAttribute('inputmode', 'tel');
                }
                if (input.type === 'number') {
                    input.setAttribute('inputmode', 'numeric');
                }
                
                // Smooth scrolling to input when focused
                input.addEventListener('focus', function() {
                    setTimeout(() => {
                        this.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center',
                            inline: 'nearest'
                        });
                    }, 300); // Delay to account for keyboard appearance
                });
            }
        });
    });
}

// ===== ORIENTATION CHANGE HANDLING =====
function handleOrientationChanges() {
    let orientationChangeTimeout;
    
    function handleOrientationChange() {
        clearTimeout(orientationChangeTimeout);
        orientationChangeTimeout = setTimeout(() => {
            // Re-calculate viewport height
            fixViewportHeight();
            
            // Close mobile menu if open (prevents layout issues)
            const mobileMenu = document.querySelector('.mobile-menu');
            if (mobileMenu && mobileMenu.classList.contains('open')) {
                const closeEvent = new Event('click');
                const overlay = document.querySelector('.mobile-menu-overlay');
                if (overlay) overlay.dispatchEvent(closeEvent);
            }
            
            // Trigger resize event for other components
            window.dispatchEvent(new Event('resize'));
        }, 150);
    }
    
    window.addEventListener('orientationchange', handleOrientationChange);
}

// ===== SCROLLING EXPERIENCE IMPROVEMENTS =====
function improveScrollingExperience() {
    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                e.preventDefault();
                
                const headerHeight = getHeaderHeight();
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Optimize scroll performance
    let ticking = false;
    
    function updateOnScroll() {
        // Add/remove scrolled class to header
        const header = document.querySelector('header');
        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
        
        ticking = false;
    }
    
    function requestScrollUpdate() {
        if (!ticking) {
            requestAnimationFrame(updateOnScroll);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestScrollUpdate, { passive: true });
}

// ===== MOBILE-SPECIFIC OPTIMIZATIONS =====
function initializeMobileOptimizations() {
    // Add mobile-specific body class
    document.body.classList.add('mobile-device');
    
    // Optimize images for mobile
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        // Add loading="lazy" if not already set
        if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
        }
        
        // Improve image aspect ratio handling
        img.addEventListener('load', function() {
            this.classList.add('image-loaded');
        });
    });
    
    // Improve button interactions on mobile
    const buttons = document.querySelectorAll('button, .btn, [role="button"]');
    buttons.forEach(button => {
        button.addEventListener('touchstart', function() {
            this.classList.add('touch-active');
        }, { passive: true });
        
        button.addEventListener('touchend', function() {
            setTimeout(() => {
                this.classList.remove('touch-active');
            }, 150);
        }, { passive: true });
    });
}

// ===== UTILITY FUNCTIONS =====
function handleWindowResize() {
    // Update viewport height
    fixViewportHeight();
    
    // Re-optimize touch targets
    optimizeTouchTargets();
    
    // Update current breakpoint indicator
    updateBreakpointIndicator();
}

function updateBreakpointIndicator() {
    const breakpoint = getCurrentBreakpoint();
    document.body.className = document.body.className.replace(/breakpoint-\w+/g, '');
    document.body.classList.add(`breakpoint-${breakpoint}`);
}

function getCurrentBreakpoint() {
    const width = window.innerWidth;
    if (width >= 1536) return '2xl';
    if (width >= 1280) return 'xl';
    if (width >= 1024) return 'lg';
    if (width >= 768) return 'md';
    if (width >= 640) return 'sm';
    return 'xs';
}

function getHeaderHeight() {
    const header = document.querySelector('header');
    return header ? header.offsetHeight : 80;
}

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           ('ontouchstart' in window) ||
           (navigator.maxTouchPoints > 0);
}

function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction() {
        const context = this;
        const args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// ===== INITIALIZE ON LOAD =====
// Additional initialization after page load
window.addEventListener('load', function() {
    // Mark as fully loaded
    document.body.classList.add('page-loaded');
    
    // Final responsive check
    setTimeout(() => {
        updateBreakpointIndicator();
        optimizeTouchTargets();
    }, 100);
});

// Export utilities for use in other scripts
window.ResponsiveUtils = {
    getCurrentBreakpoint,
    isMobileDevice,
    fixViewportHeight,
    optimizeTouchTargets,
    getHeaderHeight
}; 