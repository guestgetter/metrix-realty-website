/**
 * On-site booking screening for Metrix contact page.
 * HighLevel calendar fields cannot be edited from this repo, so we collect
 * purpose + property type + market before revealing the external booking iframe.
 */
import {
  BOOKING_WIDGET_SRC,
  isSimpleWindsorResidential,
  isWindsorMarket,
} from './booking-screening-rules.mjs';

const STORAGE_KEY = 'metrixBookingScreening';

function byId(id) {
  return document.getElementById(id);
}

function readForm(form) {
  const data = new FormData(form);
  return {
    purpose: String(data.get('purpose') || '').trim(),
    purposeDetail: String(data.get('purposeDetail') || '').trim(),
    propertyType: String(data.get('propertyType') || '').trim(),
    market: String(data.get('market') || '').trim(),
    cityDetail: String(data.get('cityDetail') || '').trim(),
  };
}

function labelFor(selectEl, value) {
  if (!selectEl) return value;
  const option = selectEl.querySelector(`option[value="${value}"]`);
  return option ? option.textContent.trim() : value;
}

function validate(answers, form) {
  const errors = [];
  if (!answers.purpose) errors.push('purpose');
  if (!answers.propertyType) errors.push('propertyType');
  if (!answers.market) errors.push('market');
  if (answers.purpose === 'other' && answers.purposeDetail.length < 8) {
    errors.push('purposeDetail');
  }
  if (
    (answers.market === 'other_swo' ||
      answers.market === 'elsewhere_ontario' ||
      answers.market === 'outside_ontario') &&
    answers.cityDetail.length < 2
  ) {
    errors.push('cityDetail');
  }

  form.querySelectorAll('[data-error-for]').forEach((el) => {
    el.hidden = true;
  });
  errors.forEach((name) => {
    const el = form.querySelector(`[data-error-for="${name}"]`);
    if (el) el.hidden = false;
  });

  return errors.length === 0;
}

function buildSummaryText(answers, form) {
  const purposeLabel = labelFor(form.elements.purpose, answers.purpose);
  const typeLabel = labelFor(form.elements.propertyType, answers.propertyType);
  const marketLabel = labelFor(form.elements.market, answers.market);
  const parts = [
    `Purpose: ${purposeLabel}`,
    `Property type: ${typeLabel}`,
    `Market: ${marketLabel}`,
  ];
  if (answers.cityDetail) parts.push(`City / area: ${answers.cityDetail}`);
  if (answers.purposeDetail) parts.push(`Details: ${answers.purposeDetail}`);
  return parts.join(' · ');
}

function persist(answers, summaryText) {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        answers,
        summaryText,
        savedAt: new Date().toISOString(),
      })
    );
  } catch {
    // Ignore storage failures (private mode, etc.)
  }
}

function track(eventName, payload) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    form_type: 'booking_screening',
    ...(payload || {}),
  });
}

function show(el) {
  if (el) el.hidden = false;
}

function hide(el) {
  if (el) el.hidden = true;
}

function revealCalendar(summaryText) {
  const stage = byId('booking-calendar-stage');
  const summary = byId('booking-screening-summary');
  const iframe = byId('booking-calendar-iframe');
  const formWrap = byId('booking-screening-panel');
  const softGate = byId('booking-soft-gate');

  hide(formWrap);
  hide(softGate);
  show(stage);

  if (summary) summary.textContent = summaryText;

  if (iframe && !iframe.getAttribute('src')) {
    iframe.setAttribute('src', BOOKING_WIDGET_SRC);
  }

  if (stage?.scrollIntoView) {
    stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function buildMailtoHref(summaryText) {
  const subject = encodeURIComponent('Windsor residential appraisal inquiry');
  const body = encodeURIComponent(
    `Hi Metrix team,\n\nI was screened on the contact page for a Windsor residential request.\n\n${summaryText}\n\nPlease let me know if you can take this or recommend a local resource.\n`
  );
  return `mailto:info@metrixrealty.com?subject=${subject}&body=${body}`;
}

function showSoftGate(summaryText) {
  const softGate = byId('booking-soft-gate');
  const formWrap = byId('booking-screening-panel');
  const softSummary = byId('booking-soft-gate-summary');
  const emailLink = byId('booking-soft-gate-email');

  hide(formWrap);
  show(softGate);
  if (softSummary) softSummary.textContent = summaryText;
  if (emailLink) emailLink.setAttribute('href', buildMailtoHref(summaryText));

  if (softGate?.scrollIntoView) {
    softGate.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function toggleConditionalFields(form) {
  const purpose = form.elements.purpose.value;
  const market = form.elements.market.value;
  const purposeDetailWrap = byId('purpose-detail-wrap');
  const cityDetailWrap = byId('city-detail-wrap');
  const purposeDetail = form.elements.purposeDetail;
  const cityDetail = form.elements.cityDetail;

  if (purposeDetailWrap) purposeDetailWrap.hidden = purpose !== 'other';
  if (purposeDetail) purposeDetail.required = purpose === 'other';

  const needsCity =
    market === 'other_swo' ||
    market === 'elsewhere_ontario' ||
    market === 'outside_ontario';
  const showCity =
    needsCity || market === 'london_middlesex' || market === 'windsor_essex';

  if (cityDetailWrap) cityDetailWrap.hidden = !showCity;
  if (cityDetail) {
    cityDetail.required = needsCity;
    cityDetail.placeholder = needsCity
      ? 'City or town (required)'
      : 'City or neighbourhood (optional, e.g. South Windsor)';
  }
}

function returnToForm() {
  hide(byId('booking-soft-gate'));
  hide(byId('booking-calendar-stage'));
  show(byId('booking-screening-panel'));
  const iframe = byId('booking-calendar-iframe');
  if (iframe) iframe.removeAttribute('src');
  byId('booking-screening-panel')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

function init() {
  const form = byId('booking-screening-form');
  if (!form) return;

  const continueComplexBtn = byId('booking-continue-complex');
  const editAnswersBtn = byId('booking-edit-answers');
  const changeAnswersBtn = byId('booking-change-answers');

  toggleConditionalFields(form);
  form.elements.purpose.addEventListener('change', () => toggleConditionalFields(form));
  form.elements.market.addEventListener('change', () => toggleConditionalFields(form));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const answers = readForm(form);
    if (!validate(answers, form)) {
      track('booking_screening_validation_error', {
        purpose: answers.purpose,
        property_type: answers.propertyType,
        market: answers.market,
      });
      return;
    }

    const summaryText = buildSummaryText(answers, form);
    persist(answers, summaryText);
    track('booking_screening_completed', {
      purpose: answers.purpose,
      property_type: answers.propertyType,
      market: answers.market,
      soft_gated: isSimpleWindsorResidential(answers),
    });

    if (isSimpleWindsorResidential(answers)) {
      track('booking_screening_soft_gate', {
        purpose: answers.purpose,
        property_type: answers.propertyType,
        market: answers.market,
      });
      showSoftGate(summaryText);
      return;
    }

    revealCalendar(summaryText);
  });

  continueComplexBtn?.addEventListener('click', () => {
    let stored = null;
    try {
      stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
    } catch {
      stored = null;
    }
    track('booking_screening_soft_gate_continue', {});
    revealCalendar(
      stored?.summaryText ||
        'Complex or capacity-check request - continue with booking.'
    );
  });

  editAnswersBtn?.addEventListener('click', returnToForm);
  changeAnswersBtn?.addEventListener('click', returnToForm);
}

window.MetrixBookingScreening = {
  isSimpleWindsorResidential,
  isWindsorMarket,
  BOOKING_WIDGET_SRC,
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
