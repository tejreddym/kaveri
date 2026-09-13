/**
 * Kaveri University - School of Agriculture Admissions Enquiry Handler
 * Designed to match Kaveri University native UI/UX, typography, and color system.
 * Simple Lead Capture Form (NO OTP Required).
 */
(function () {
  'use strict';

  function initEnquiryComponent(containerId, options) {
    options = options || {};
    var container = document.getElementById(containerId);
    if (!container) return;

    var defaultProg = options.programme || '';
    if (!defaultProg && window.KaveriTracker) {
      defaultProg = window.KaveriTracker.getPreselectedCourse();
    }

    var showProgrammeSelect = !defaultProg;

    var html = '' +
      '<div class="card border rounded-0 text-start" style="font-family: \'Figtree\', sans-serif; border-color: #cbd5e1 !important; box-shadow: 0 4px 16px rgba(0,0,0,0.1);">' +
        '<div class="card-header text-white text-center py-3 px-4" style="background-color: #22325c; border-bottom: 3px solid #b72928;">' +
          '<h2 class="h4 mb-1 text-white fw-bold text-uppercase" style="font-family: \'Lato\', sans-serif; letter-spacing: 0.5px; font-size: 1.25rem;">SCHOOL OF AGRICULTURE</h2>' +
          '<h3 class="h6 mb-2 text-uppercase fw-bold" style="font-family: \'Figtree\', sans-serif; color: #fcd000 !important; font-size: 0.875rem; letter-spacing: 0.5px;">Admissions Enquiry – 2026–27</h3>' +
          '<p class="mb-0 text-white-50" style="font-size: 0.8rem; line-height: 1.35;">Interested in our Agriculture programmes? Get admission details and guidance from Kaveri University.</p>' +
        '</div>' +
        '<div class="card-body p-4 bg-white">' +
          '<div id="' + containerId + '-alert" class="alert d-none py-2 px-3 mb-3 small" style="font-size: 0.85rem;"></div>' +

          '<!-- SIMPLE ENQUIRY FORM (NO OTP) -->' +
          '<form id="' + containerId + '-form" class="enquiry-step">' +
            '<div class="mb-3">' +
              '<label class="form-label fw-bold text-uppercase mb-1" style="font-size: 0.775rem; color: #22325c; letter-spacing: 0.5px;">FULL NAME <span class="text-danger">*</span></label>' +
              '<input type="text" id="' + containerId + '-fullname" class="form-control rounded-0" placeholder="Enter your full name" style="font-size: 0.875rem; height: 40px; border-color: #ced4da;" required />' +
            '</div>' +

            '<div class="mb-3">' +
              '<label class="form-label fw-bold text-uppercase mb-1" style="font-size: 0.775rem; color: #22325c; letter-spacing: 0.5px;">MOBILE NUMBER <span class="text-danger">*</span></label>' +
              '<div class="input-group">' +
                '<span class="input-group-text bg-light text-dark fw-bold rounded-0" style="font-size: 0.875rem; height: 40px; border-color: #ced4da;">+91</span>' +
                '<input type="tel" id="' + containerId + '-mobile" class="form-control rounded-0" placeholder="Enter 10-digit mobile number" maxlength="10" pattern="[0-9]{10}" style="font-size: 0.875rem; height: 40px; border-color: #ced4da;" required />' +
              '</div>' +
            '</div>' +

            (showProgrammeSelect ?
              '<div class="mb-3">' +
                '<label class="form-label fw-bold text-uppercase mb-1" style="font-size: 0.775rem; color: #22325c; letter-spacing: 0.5px;">INTERESTED PROGRAMME <span class="text-danger">*</span></label>' +
                '<select id="' + containerId + '-prog" class="form-select rounded-0" style="font-size: 0.875rem; height: 40px; border-color: #ced4da;" required>' +
                  '<option value="B.Sc. (Hons.) Agriculture">B.Sc. (Hons.) Agriculture</option>' +
                  '<option value="B.Sc. (Hons.) AgriTech">B.Sc. (Hons.) AgriTech</option>' +
                  '<option value="B.Sc. (Hons.) Horticulture">B.Sc. (Hons.) Horticulture</option>' +
                '</select>' +
              '</div>' :
              '<div class="mb-3">' +
                '<label class="form-label fw-bold text-uppercase mb-1" style="font-size: 0.775rem; color: #22325c; letter-spacing: 0.5px;">INTERESTED PROGRAMME</label>' +
                '<input type="text" class="form-control rounded-0 bg-light fw-bold text-dark" value="' + defaultProg + '" readonly style="font-size: 0.875rem; height: 40px; border-color: #ced4da;" />' +
              '</div>'
            ) +

            '<button type="submit" id="' + containerId + '-btn-submit" class="btn text-white w-100 fw-bold rounded-0 text-uppercase mt-2" style="background-color: #b72928; border: 1px solid #b72928; font-size: 0.875rem; height: 42px; letter-spacing: 0.5px;">' +
              '<i class="fa-solid fa-paper-plane me-2"></i> ENQUIRE NOW' +
            '</button>' +
          '</form>' +

          '<!-- SUCCESS SCREEN -->' +
          '<div id="' + containerId + '-step-success" class="enquiry-step d-none text-start py-2">' +
            '<div class="card border rounded-0 mb-4" style="border-color: #22325c !important; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">' +
              '<div class="card-header text-white py-3 px-4" style="background-color: #22325c; border-bottom: 3px solid #b72928;">' +
                '<div class="d-flex align-items-center">' +
                  '<i class="fa-solid fa-circle-check text-success fs-3 me-3 bg-white rounded-circle p-1"></i>' +
                  '<div>' +
                    '<h2 class="h5 mb-0 text-white fw-bold text-uppercase" style="font-family: \'Lato\', sans-serif; letter-spacing: 0.5px;">ENQUIRY RECEIVED</h2>' +
                    '<div class="small fw-semibold" style="color: #fcd000 !important; font-family: \'Figtree\', sans-serif; font-size: 0.85rem;">School of Agriculture – Kaveri University</div>' +
                  '</div>' +
                '</div>' +
              '</div>' +
              '<div class="card-body p-4 bg-white">' +
                '<p class="fw-bold text-dark mb-2" style="font-size: 0.95rem;">' +
                  'Thank you for your interest in Kaveri University\'s School of Agriculture.' +
                '</p>' +
                '<p class="text-muted small mb-3" style="font-size: 0.85rem; line-height: 1.45;">' +
                  'Our admissions team will contact you shortly with programme and admission details.' +
                '</p>' +

                '<div class="bg-light p-3 border rounded-0 mb-3" style="border-color: #e2e8f0 !important; font-size: 0.875rem;">' +
                  '<div class="row g-2">' +
                    '<div class="col-sm-6"><span class="text-muted small">Programme:</span> <strong id="' + containerId + '-succ-prog" class="text-dark"></strong></div>' +
                    '<div class="col-sm-6"><span class="text-muted small">Mobile Number:</span> <strong id="' + containerId + '-succ-mobile" class="text-dark"></strong></div>' +
                    '<div class="col-12"><span class="text-muted small">Enquiry Reference ID:</span> <strong id="' + containerId + '-succ-ref" class="text-danger"></strong></div>' +
                  '</div>' +
                '</div>' +

                '<div class="d-flex flex-wrap gap-2 mt-4">' +
                  '<a href="/agriculture-programmes/" class="btn text-white fw-bold rounded-0 text-uppercase py-2 px-3" style="background-color: #b72928; border: 1px solid #b72928; font-size: 0.825rem; letter-spacing: 0.5px;">' +
                    '<i class="fa-solid fa-graduation-cap me-1"></i> Explore Agriculture Programmes' +
                  '</a>' +
                  '<a href="/" class="btn text-white fw-bold rounded-0 text-uppercase py-2 px-3" style="background-color: #22325c; border: 1px solid #22325c; font-size: 0.825rem; letter-spacing: 0.5px;">' +
                    '<i class="fa-solid fa-building-columns me-1"></i> Visit Kaveri University' +
                  '</a>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +

        '</div>' +
      '</div>';

    container.innerHTML = html;

    // References
    var alertEl = document.getElementById(containerId + '-alert');
    var enquiryForm = document.getElementById(containerId + '-form');
    var stepSuccess = document.getElementById(containerId + '-step-success');

    var nameInput = document.getElementById(containerId + '-fullname');
    var mobileInput = document.getElementById(containerId + '-mobile');
    var progSelect = document.getElementById(containerId + '-prog');
    var btnSubmit = document.getElementById(containerId + '-btn-submit');

    function showAlert(msg, type) {
      alertEl.className = 'alert alert-' + (type || 'danger') + ' py-2 px-3 mb-3 small';
      alertEl.innerText = msg;
      alertEl.classList.remove('d-none');
    }

    function hideAlert() {
      alertEl.classList.add('d-none');
    }

    // Submit Handler
    enquiryForm.addEventListener('submit', function (e) {
      e.preventDefault();
      hideAlert();

      var currentName = nameInput.value.trim();
      var currentMobile = mobileInput.value.trim().replace(/\D/g, '');

      if (!currentName || currentName.length < 2) {
        showAlert('Please enter your full name.');
        return;
      }

      if (currentMobile.length !== 10 || !/^[6-9]\d{9}$/.test(currentMobile)) {
        showAlert('Please enter a valid 10-digit Indian mobile number.');
        return;
      }

      var selectedProg = defaultProg || (progSelect ? progSelect.value : 'B.Sc. (Hons.) Agriculture');
      var attribution = window.KaveriTracker ? window.KaveriTracker.getAttribution() : {};

      var payload = {
        fullName: currentName,
        mobile: currentMobile,
        programme: selectedProg,
        source: attribution.source || 'ChatGPT',
        utm_source: attribution.utm_source || 'chatgpt',
        utm_medium: attribution.utm_medium || 'paid',
        utm_campaign: attribution.utm_campaign || 'agriculture_2026',
        landing_page_url: attribution.landing_page_url || window.location.pathname
      };

      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> Submitting Enquiry...';

      fetch('/api/submit-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(function (res) { return res.json(); })
      .then(function (leadRes) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = '<i class="fa-solid fa-paper-plane me-2"></i> ENQUIRE NOW';

        if (leadRes.success) {
          enquiryForm.classList.add('d-none');
          stepSuccess.classList.remove('d-none');

          document.getElementById(containerId + '-succ-prog').innerText = leadRes.programme || selectedProg;
          document.getElementById(containerId + '-succ-mobile').innerText = '+91 ' + currentMobile;
          document.getElementById(containerId + '-succ-ref').innerText = leadRes.enquiryId || 'ENQ-2026-SUBMITTED';

          hideAlert();
        } else {
          showAlert(leadRes.message || 'Failed to submit enquiry.');
        }
      })
      .catch(function () {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = '<i class="fa-solid fa-paper-plane me-2"></i> ENQUIRE NOW';
        showAlert('Submission error. Please try again.');
      });
    });
  }

  window.KaveriEnquiry = {
    init: initEnquiryComponent
  };
})();
