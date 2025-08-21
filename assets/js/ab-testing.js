// A/B Testing Framework for Metrix Realty Group
// Simple, lightweight A/B testing with GA4 integration

class ABTesting {
    constructor() {
        this.tests = {};
        this.userVariants = {};
        this.init();
    }

    init() {
        console.log('A/B Testing framework initialized');
        
        // Load saved variants from localStorage
        const savedVariants = localStorage.getItem('ab_test_variants');
        if (savedVariants) {
            this.userVariants = JSON.parse(savedVariants);
        }
    }

    // Create a new A/B test
    createTest(testName, variants, options = {}) {
        const {
            trafficSplit = 0.5, // 50/50 split by default
            duration = 30, // 30 days by default
            targetPages = [], // Empty = all pages
            cookieDuration = 30 // Days to remember user's variant
        } = options;

        this.tests[testName] = {
            variants,
            trafficSplit,
            duration,
            targetPages,
            cookieDuration,
            startDate: new Date().toISOString()
        };

        console.log(`A/B Test created: ${testName}`, this.tests[testName]);
        return this;
    }

    // Get user's variant for a test
    getVariant(testName) {
        const test = this.tests[testName];
        if (!test) {
            console.warn(`A/B Test "${testName}" not found`);
            return null;
        }

        // Check if test should run on current page
        if (test.targetPages.length > 0) {
            const currentPage = window.location.pathname;
            const shouldRun = test.targetPages.some(page => currentPage.includes(page));
            if (!shouldRun) {
                return null;
            }
        }

        // Check if user already has a variant assigned
        if (this.userVariants[testName]) {
            return this.userVariants[testName];
        }

        // Assign new variant based on traffic split
        const random = Math.random();
        const variant = random < test.trafficSplit ? test.variants[0] : test.variants[1];
        
        // Save variant
        this.userVariants[testName] = variant;
        localStorage.setItem('ab_test_variants', JSON.stringify(this.userVariants));

        // Track variant assignment in GA4
        gtag('event', 'ab_test_assigned', {
            'event_category': 'ab_testing',
            'event_label': `${testName}_${variant}`,
            'custom_parameter_1': testName,
            'custom_parameter_2': variant
        });

        // Send to GTM
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            'event': 'ab_test_assigned',
            'test_name': testName,
            'variant': variant,
            'page_location': window.location.href
        });

        console.log(`A/B Test "${testName}" assigned variant: ${variant}`);
        return variant;
    }

    // Track conversion for A/B test
    trackConversion(testName, conversionType = 'conversion', value = 1) {
        const variant = this.userVariants[testName];
        if (!variant) {
            console.warn(`No variant found for test "${testName}"`);
            return;
        }

        // Track conversion in GA4
        gtag('event', 'ab_test_conversion', {
            'event_category': 'ab_testing',
            'event_label': `${testName}_${variant}_${conversionType}`,
            'value': value,
            'custom_parameter_1': testName,
            'custom_parameter_2': variant,
            'custom_parameter_3': conversionType
        });

        // Send to GTM
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            'event': 'ab_test_conversion',
            'test_name': testName,
            'variant': variant,
            'conversion_type': conversionType,
            'conversion_value': value,
            'page_location': window.location.href
        });

        console.log(`A/B Test conversion tracked: ${testName} - ${variant} - ${conversionType}`);
    }

    // Apply variant styling/content
    applyVariant(testName, variantConfig) {
        const variant = this.getVariant(testName);
        if (!variant || !variantConfig[variant]) {
            return;
        }

        const config = variantConfig[variant];
        
        // Apply CSS changes
        if (config.css) {
            const style = document.createElement('style');
            style.textContent = config.css;
            document.head.appendChild(style);
        }

        // Apply content changes
        if (config.content) {
            Object.keys(config.content).forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    element.innerHTML = config.content[selector];
                });
            });
        }

        // Apply attribute changes
        if (config.attributes) {
            Object.keys(config.attributes).forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    Object.keys(config.attributes[selector]).forEach(attr => {
                        element.setAttribute(attr, config.attributes[selector][attr]);
                    });
                });
            });
        }

        console.log(`Applied variant "${variant}" for test "${testName}"`);
    }

    // Get test results (for debugging)
    getTestResults(testName) {
        return {
            test: this.tests[testName],
            userVariant: this.userVariants[testName]
        };
    }
}

// Initialize global A/B testing instance
window.ABTest = new ABTesting();

// Example A/B tests - you can customize these
document.addEventListener('DOMContentLoaded', function() {
    
    // Example 1: Test different CTA button colors on contact page
    if (window.location.pathname.includes('contact')) {
        window.ABTest
            .createTest('cta_button_color', ['blue', 'black'], {
                trafficSplit: 0.5,
                targetPages: ['contact'],
                duration: 30
            })
            .applyVariant('cta_button_color', {
                'blue': {
                    css: `
                        .btn-primary, .bg-black { 
                            background-color: #2563eb !important; 
                            border-color: #2563eb !important;
                        }
                        .btn-primary:hover, .bg-black:hover { 
                            background-color: #1d4ed8 !important; 
                        }
                    `
                },
                'black': {
                    // Keep existing black styling
                }
            });
    }

    // Example 2: Test different hero headlines on homepage
    if (window.location.pathname === '/' || window.location.pathname.includes('index')) {
        window.ABTest
            .createTest('hero_headline', ['original', 'benefit_focused'], {
                trafficSplit: 0.5,
                targetPages: ['index', '/'],
                duration: 30
            })
            .applyVariant('hero_headline', {
                'original': {
                    // Keep existing headline
                },
                'benefit_focused': {
                    content: {
                        'h1': 'Get Accurate Property Valuations That Win Cases & Close Deals',
                        '.hero-subtitle': 'Trusted by lawyers, lenders, and property owners across Southwestern Ontario for expert real estate appraisals.'
                    }
                }
            });
    }

    // Track conversions when calendar bookings happen
    window.addEventListener('message', function(e) {
        if (e.data.event === 'calendly.event_scheduled') {
            // Track conversion for any active A/B tests
            Object.keys(window.ABTest.userVariants).forEach(testName => {
                window.ABTest.trackConversion(testName, 'calendar_booking', 100);
            });
        }
    });

    console.log('A/B Testing ready with example tests');
});
