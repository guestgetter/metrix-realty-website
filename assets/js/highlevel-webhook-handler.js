// Accept only a calendar iframe booking message with an appointment ID.
const trackedAppointments = new Set();

// Function to handle HighLevel calendar webhook data
function handleHighLevelBooking(webhookData) {
    if (!webhookData || !webhookData.appointment_id) return;
    
    // Extract booking information
    const bookingInfo = {
        appointmentId: webhookData.appointment_id || webhookData.id,
        calendarId: webhookData.calendar_id || webhookData.calendarId,
    };
    if (trackedAppointments.has(bookingInfo.appointmentId)) return;
    trackedAppointments.add(bookingInfo.appointmentId);

    // Send conversion to GTM (which handles GA4)
    window.dataLayer = window.dataLayer || [];
    
    // Main conversion event
    window.dataLayer.push({
        'event': 'conversion',
        'event_category': 'conversion',
        'event_label': 'highlevel_calendar_booking',
        'conversion_type': 'calendar_booking',
        'transaction_id': bookingInfo.appointmentId,
        'calendar_id': bookingInfo.calendarId,
        'page_location': window.location.href
    });

    // Custom calendar booking event
    window.dataLayer.push({
        'event': 'highlevel_calendar_booking',
        'event_category': 'conversion',
        'event_label': 'appointment_scheduled',
        'calendar_id': bookingInfo.calendarId,
        'page_location': window.location.href
    });

    console.log('✅ HighLevel booking sent to GTM');

    // Track A/B test attribution if available
    if (window.ABTest && window.ABTest.userVariants) {
        Object.keys(window.ABTest.userVariants).forEach(testName => {
            window.ABTest.trackConversion(testName, 'highlevel_booking');
        });
    }

    console.log('🎉 HighLevel booking fully tracked!');
}

// Listen for HighLevel postMessage events (if they send them)
window.addEventListener('message', function(event) {
    // Only accept a booking signal from the embedded calendar itself.
    const iframe = document.getElementById('booking-calendar-iframe');
    if (event.origin === 'https://api.leadconnectorhq.com' &&
        event.source === iframe?.contentWindow &&
        event.data?.type === 'highlevel_booking') {
        handleHighLevelBooking(event.data.booking);
    }
});
