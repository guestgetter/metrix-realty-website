// Comprehensive Analytics Event Tracking for Metrix Realty Group
// Tracks phone calls, emails, form submissions, and key user interactions

document.addEventListener('DOMContentLoaded', function() {
    console.log('Analytics tracking initialized');

    // Track Phone Number Clicks
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        link.addEventListener('click', function() {
            const phoneNumber = this.href.replace('tel:', '');
            
            // Send to GA4
            gtag('event', 'phone_call', {
                'event_category': 'contact',
                'event_label': phoneNumber,
                'value': 1
            });
            
            // Send to GTM
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event': 'phone_call',
                'phone_number': phoneNumber,
                'page_location': window.location.href
            });
            
            console.log('Phone click tracked:', phoneNumber);
        });
    });

    // Track Email Clicks
    document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
        link.addEventListener('click', function() {
            const email = this.href.replace('mailto:', '');
            
            // Send to GA4
            gtag('event', 'email_click', {
                'event_category': 'contact',
                'event_label': email,
                'value': 1
            });
            
            // Send to GTM
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event': 'email_click',
                'email_address': email,
                'page_location': window.location.href
            });
            
            console.log('Email click tracked:', email);
        });
    });

    // Track Contact Form Submissions (if form exists)
    const contactForms = document.querySelectorAll('form');
    contactForms.forEach(form => {
        form.addEventListener('submit', function() {
            // Send to GA4
            gtag('event', 'form_submit', {
                'event_category': 'contact',
                'event_label': 'contact_form',
                'value': 1
            });
            
            // Send to GTM
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event': 'form_submit',
                'form_type': 'contact_form',
                'page_location': window.location.href
            });
            
            console.log('Form submission tracked');
        });
    });

    // Track CTA Button Clicks
    const ctaButtons = document.querySelectorAll('a[href*="contact"], .btn-primary, [class*="btn"], button[type="submit"]');
    ctaButtons.forEach(button => {
        // Skip if already tracked (phone/email)
        if (button.href && (button.href.startsWith('tel:') || button.href.startsWith('mailto:'))) {
            return;
        }
        
        button.addEventListener('click', function() {
            const buttonText = this.textContent.trim() || this.getAttribute('aria-label') || 'CTA Button';
            const destination = this.href || 'button_action';
            
            // Send to GA4
            gtag('event', 'cta_click', {
                'event_category': 'engagement',
                'event_label': buttonText,
                'value': 1
            });
            
            // Send to GTM
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event': 'cta_click',
                'button_text': buttonText,
                'destination': destination,
                'page_location': window.location.href
            });
            
            console.log('CTA click tracked:', buttonText);
        });
    });

    // Track Calendar Widget Interactions (Calendly) - Enhanced Conversion Tracking
    window.addEventListener('message', function(e) {
        if (e.data.event && e.data.event.indexOf('calendly') === 0) {
            const eventType = e.data.event;
            console.log('Calendly event detected:', eventType, e.data);
            
            // Track different Calendly events
            switch(eventType) {
                case 'calendly.event_scheduled':
                    // CONVERSION EVENT - Someone booked a meeting!
                    gtag('event', 'conversion', {
                        'send_to': 'G-TB55XJ4B9D',
                        'event_category': 'conversion',
                        'event_label': 'calendar_booking',
                        'value': 100, // Assign monetary value to conversion
                        'currency': 'CAD'
                    });
                    
                    // Also send as custom conversion event
                    gtag('event', 'calendar_booking', {
                        'event_category': 'conversion',
                        'event_label': 'calendly_scheduled',
                        'value': 100,
                        'currency': 'CAD'
                    });
                    
                    // Send to GTM for advanced tracking
                    window.dataLayer = window.dataLayer || [];
                    window.dataLayer.push({
                        'event': 'conversion',
                        'conversion_type': 'calendar_booking',
                        'conversion_value': 100,
                        'currency': 'CAD',
                        'page_location': window.location.href,
                        'calendly_event_data': e.data
                    });
                    
                    console.log('🎉 CONVERSION TRACKED: Calendar booking!');
                    break;
                    
                case 'calendly.profile_page_viewed':
                    gtag('event', 'calendar_viewed', {
                        'event_category': 'engagement',
                        'event_label': 'calendly_opened',
                        'value': 1
                    });
                    
                    window.dataLayer.push({
                        'event': 'calendar_viewed',
                        'page_location': window.location.href
                    });
                    
                    console.log('📅 Calendar viewed');
                    break;
                    
                case 'calendly.date_and_time_selected':
                    gtag('event', 'calendar_time_selected', {
                        'event_category': 'engagement',
                        'event_label': 'time_slot_selected',
                        'value': 10
                    });
                    
                    window.dataLayer.push({
                        'event': 'calendar_time_selected',
                        'page_location': window.location.href
                    });
                    
                    console.log('⏰ Time slot selected');
                    break;
                    
                default:
                    // Track any other Calendly interactions
                    gtag('event', 'calendly_interaction', {
                        'event_category': 'engagement',
                        'event_label': eventType,
                        'value': 1
                    });
                    
                    window.dataLayer.push({
                        'event': 'calendly_interaction',
                        'calendly_event': eventType,
                        'page_location': window.location.href
                    });
                    
                    console.log('Calendly interaction:', eventType);
            }
        }
    });

    // Track Page Scroll Depth (25%, 50%, 75%, 100%)
    let maxScroll = 0;
    const scrollMilestones = [25, 50, 75, 100];
    
    window.addEventListener('scroll', function() {
        const scrollPercent = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
        
        scrollMilestones.forEach(milestone => {
            if (scrollPercent >= milestone && maxScroll < milestone) {
                maxScroll = milestone;
                
                // Send to GA4
                gtag('event', 'scroll_depth', {
                    'event_category': 'engagement',
                    'event_label': milestone + '%',
                    'value': milestone
                });
                
                // Send to GTM
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                    'event': 'scroll_depth',
                    'scroll_percentage': milestone,
                    'page_location': window.location.href
                });
                
                console.log('Scroll depth tracked:', milestone + '%');
            }
        });
    });

    console.log('All analytics event tracking loaded successfully');
});
