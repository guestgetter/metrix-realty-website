// HighLevel Webhook Handler for GA4 Integration
// This handles calendar bookings from HighLevel and sends them to GA4

// Function to handle HighLevel calendar webhook data
function handleHighLevelBooking(webhookData) {
    console.log('HighLevel booking received:', webhookData);
    
    // Extract booking information
    const bookingInfo = {
        contactId: webhookData.contact_id || webhookData.contactId,
        appointmentId: webhookData.appointment_id || webhookData.id,
        calendarId: webhookData.calendar_id || webhookData.calendarId,
        contactName: webhookData.contact_name || webhookData.name,
        contactEmail: webhookData.contact_email || webhookData.email,
        contactPhone: webhookData.contact_phone || webhookData.phone,
        appointmentDate: webhookData.appointment_date || webhookData.startTime,
        source: webhookData.source || 'highlevel_calendar'
    };

    // Send conversion to GA4
    if (typeof gtag !== 'undefined') {
        // Main conversion event
        gtag('event', 'conversion', {
            'send_to': 'G-TB55XJ4B9D',
            'event_category': 'conversion',
            'event_label': 'highlevel_calendar_booking',
            'value': 100,
            'currency': 'CAD',
            'transaction_id': bookingInfo.appointmentId
        });

        // Custom calendar booking event
        gtag('event', 'highlevel_calendar_booking', {
            'event_category': 'conversion',
            'event_label': 'appointment_scheduled',
            'value': 100,
            'currency': 'CAD',
            'custom_parameter_1': bookingInfo.contactId,
            'custom_parameter_2': bookingInfo.calendarId
        });

        console.log('✅ HighLevel booking sent to GA4');
    }

    // Send to GTM Data Layer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        'event': 'highlevel_conversion',
        'conversion_type': 'calendar_booking',
        'conversion_value': 100,
        'currency': 'CAD',
        'contact_id': bookingInfo.contactId,
        'appointment_id': bookingInfo.appointmentId,
        'contact_name': bookingInfo.contactName,
        'contact_email': bookingInfo.contactEmail,
        'source': 'highlevel_calendar',
        'page_location': window.location.href
    });

    // Track A/B test attribution if available
    if (window.ABTest && window.ABTest.userVariants) {
        Object.keys(window.ABTest.userVariants).forEach(testName => {
            window.ABTest.trackConversion(testName, 'highlevel_booking', 100);
        });
    }

    console.log('🎉 HighLevel booking fully tracked!');
}

// Listen for HighLevel postMessage events (if they send them)
window.addEventListener('message', function(event) {
    // Check if message is from HighLevel calendar
    if (event.data && event.data.type === 'highlevel_booking') {
        handleHighLevelBooking(event.data.booking);
    }
});

// Alternative: Check for HighLevel calendar completion via DOM changes
function observeHighLevelCalendar() {
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            // Look for success/confirmation messages - Enhanced for HighLevel
            const confirmationElements = document.querySelectorAll('*');
            
            confirmationElements.forEach(element => {
                const text = element.textContent.toLowerCase();
                if (text.includes('your meeting has been scheduled') ||
                    text.includes('meeting has been scheduled') ||
                    text.includes('appointment scheduled') ||
                    text.includes('confirmed') || 
                    text.includes('booked') ||
                    text.includes('scheduled')) {
                    
                    // Trigger conversion tracking
                    handleHighLevelBooking({
                        source: 'highlevel_calendar_dom',
                        appointment_id: 'dom_detected_' + Date.now(),
                        contact_name: 'DOM Detection',
                        page_url: window.location.href
                    });
                    
                    // Stop observing after first detection
                    observer.disconnect();
                }
            });
        });
    });

    // Start observing the document for changes
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('HighLevel webhook handler initialized');
    
    // Start observing for calendar completions
    setTimeout(observeHighLevelCalendar, 2000); // Wait 2 seconds for calendar to load
});

// Make handler globally available
window.handleHighLevelBooking = handleHighLevelBooking;
