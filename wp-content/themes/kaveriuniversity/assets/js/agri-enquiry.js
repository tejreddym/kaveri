/**
 * Kaveri University - School of Agriculture Admissions Enquiry Handler
 * Designed to match Kaveri University native UI/UX, typography, and color system.
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
      '<div class="card border-0 shadow-sm rounded-0 overflow-hidden text-start" style="font-family: \'Figtree\', sans-serif;">' +
        '<div class="card-header text-white text-center py-3" style="background-color: #22325c; border-bottom: 3px solid #b72928;">' +
          '<h2 class="h4 mb-1 text-white fw-bold text-uppercase" style="font-family: \'Lato\', sans-serif; letter-spacing: 0.5px;">SCHOOL OF AGRICULTURE</h2>' +
          '<h3 class="h6 mb-2 text-warning fw-bold text-uppercase" style="font-family: \'Figtree\', sans-serif;">Admissions Enquiry – 2026–27</h3>' +
          '<p class="mb-0 text-white-50 small" style="font-size: 0.825rem;">Interested in our Agriculture programmes? Get admission details and guidance from Kaveri University.</p>' +
        '</div>' +
        '<div class="card-body p-4 bg-white">' +
          '<div id="' + containerId + '-alert" class="alert d-none py-2 px-3 mb-3 small"></div>' +

          '<!-- STEP 1: Full Name & Mobile Number -->' +
          '<form id="' + containerId + '-form-step1" class="enquiry-step">' +
            '<div class="mb-3">' +
              '<label class="form-label fw-bold text-dark small text-uppercase" style="letter-spacing: 0.3px;">FULL NAME <span class="text-danger">*</span></label>' +
              '<input type="text" id="' + containerId + '-fullname" class="form-control rounded-0" placeholder="Enter your full name" style="font-size: 0.95rem; border-color: #ced4da;" required />' +
            '</div>' +

            '<div class="mb-3">' +
              '<label class="form-label fw-bold text-dark small text-uppercase" style="letter-spacing: 0.3px;">MOBILE NUMBER <span class="text-danger">*</span></label>' +
              '<div class="input-group">' +
                '<span class="input-group-text bg-light text-muted fw-bold rounded-0">+91</span>' +
                '<input type="tel" id="' + containerId + '-mobile" class="form-control rounded-0" placeholder="Enter 10-digit mobile number" maxlength="10" pattern="[0-9]{10}" style="font-size: 0.95rem;" required />' +
              '</div>' +
            '</div>' +

            (showProgrammeSelect ?
              '<div class="mb-3">' +
                '<label class="form-label fw-bold text-dark small text-uppercase" style="letter-spacing: 0.3px;">INTERESTED PROGRAMME <span class="text-danger">*</span></label>' +
                '<select id="' + containerId + '-prog" class="form-select rounded-0" style="font-size: 0.95rem;" required>' +
                  '<option value="B.Sc. (Hons.) Agriculture">B.Sc. (Hons.) Agriculture</option>' +
                  '<option value="B.Sc. (Hons.) AgriTech">B.Sc. (Hons.) AgriTech</option>' +
                  '<option value="B.Sc. (Hons.) Horticulture">B.Sc. (Hons.) Horticulture</option>' +
                '</select>' +
              '</div>' : '') +

            '<button type="submit" id="' + containerId + '-btn-submit1" class="btn text-white w-100 fw-bold py-2 rounded-0 text-uppercase shadow-sm" style="background-color: #b72928; border: none; font-size: 0.9rem; letter-spacing: 0.5px;">' +
              '<i class="fa-solid fa-paper-plane me-2"></i> SEND OTP' +
            '</button>' +
          '</form>' +

          '<!-- STEP 2: OTP Verification -->' +
          '<div id="' + containerId + '-step-otp" class="enquiry-step d-none">' +
            '<div class="bg-light p-2 mb-3 border text-muted small d-flex justify-content-between align-items-center">' +
              '<span>OTP sent to: <strong class="text-dark" id="' + containerId + '-disp-mobile">+91 XXXXX XXXXX</strong></span>' +
              '<button type="button" id="' + containerId + '-btn-edit" class="btn btn-sm btn-link p-0 text-decoration-none">Edit</button>' +
            '</div>' +

            '<div class="mb-3">' +
              '<label class="form-label fw-bold text-dark small text-uppercase">ENTER OTP <span class="text-danger">*</span></label>' +
              '<input type="text" id="' + containerId + '-otp" class="form-control text-center fw-bold fs-4 rounded-0" placeholder="••••" maxlength="6" style="letter-spacing: 6px;" required />' +
              '<div class="d-flex justify-content-between align-items-center mt-2 small text-muted">' +
                '<span id="' + containerId + '-timer-text">Resend OTP in <strong id="' + containerId + '-timer-count">60</strong>s</span>' +
                '<button type="button" id="' + containerId + '-btn-resend" class="btn btn-link btn-sm p-0 text-decoration-none d-none">Resend OTP</button>' +
              '</div>' +
            '</div>' +

            '<button type="button" id="' + containerId + '-btn-verify" class="btn text-white w-100 fw-bold py-2 rounded-0 text-uppercase shadow-sm" style="background-color: #22325c; border: none; font-size: 0.9rem;">' +
              '<i class="fa-solid fa-shield-check me-2"></i> VERIFY OTP' +
            '</button>' +
          '</div>' +

          '<!-- STEP 3: Verification Done & Final Submit -->' +
          '<div id="' + containerId + '-step-verified" class="enquiry-step d-none text-center">' +
            '<div class="alert alert-success py-2 px-3 small mb-3">' +
              '<i class="fa-solid fa-circle-check me-2"></i> Mobile number verified successfully' +
            '</div>' +
            '<button type="button" id="' + containerId + '-btn-final-submit" class="btn text-white w-100 fw-bold py-2 rounded-0 text-uppercase shadow-sm" style="background-color: #b72928; border: none; font-size: 0.9rem;">' +
              '<i class="fa-solid fa-check me-2"></i> SUBMIT ENQUIRY' +
            '</button>' +
          '</div>' +

          '<!-- STEP 4: Success Screen -->' +
          '<div id="' + containerId + '-step-success" class="enquiry-step d-none text-center py-3">' +
            '<div class="mb-2 text-success">' +
              '<i class="fa-solid fa-circle-check display-4"></i>' +
            '</div>' +
            '<h3 class="h4 fw-bold text-success mb-2" style="font-family: \'Lato\', sans-serif;">Thank You!</h3>' +
            '<p class="fw-bold text-dark mb-2">Your enquiry has been received successfully.</p>' +
            '<p class="text-muted small mb-4">Our admissions team will contact you shortly with programme and admission details.</p>' +
            '<div class="p-3 bg-light text-start border small mb-3">' +
              '<div><strong>Programme:</strong> <span id="' + containerId + '-succ-prog"></span></div>' +
              '<div><strong>Mobile:</strong> <span id="' + containerId + '-succ-mobile"></span></div>' +
            '</div>' +
          '</div>' +

        '</div>' +
      '</div>';

    container.innerHTML = html;

    // References
    var alertEl = document.getElementById(containerId + '-alert');
    var step1Form = document.getElementById(containerId + '-form-step1');
    var stepOtp = document.getElementById(containerId + '-step-otp');
    var stepVerified = document.getElementById(containerId + '-step-verified');
    var stepSuccess = document.getElementById(containerId + '-step-success');

    var nameInput = document.getElementById(containerId + '-fullname');
    var mobileInput = document.getElementById(containerId + '-mobile');
    var progSelect = document.getElementById(containerId + '-prog');
    var otpInput = document.getElementById(containerId + '-otp');

    var btnSubmit1 = document.getElementById(containerId + '-btn-submit1');
    var btnVerify = document.getElementById(containerId + '-btn-verify');
    var btnFinalSubmit = document.getElementById(containerId + '-btn-final-submit');
    var btnEdit = document.getElementById(containerId + '-btn-edit');
    var btnResend = document.getElementById(containerId + '-btn-resend');

    var timerCount = document.getElementById(containerId + '-timer-count');
    var timerText = document.getElementById(containerId + '-timer-text');

    var currentMobile = '';
    var currentName = '';
    var timerInterval = null;

    function showAlert(msg, type) {
      alertEl.className = 'alert alert-' + (type || 'danger') + ' py-2 px-3 mb-3 small';
      alertEl.innerText = msg;
      alertEl.classList.remove('d-none');
    }

    function hideAlert() {
      alertEl.classList.add('d-none');
    }

    function startTimer() {
      clearInterval(timerInterval);
      var sec = 60;
      timerCount.innerText = sec;
      timerText.classList.remove('d-none');
      btnResend.classList.add('d-none');

      timerInterval = setInterval(function () {
        sec--;
        timerCount.innerText = sec;
        if (sec <= 0) {
          clearInterval(timerInterval);
          timerText.classList.add('d-none');
          btnResend.classList.remove('d-none');
        }
      }, 1000);
    }

    // Step 1 Submission -> Send OTP
    step1Form.addEventListener('submit', function (e) {
      e.preventDefault();
      hideAlert();

      currentName = nameInput.value.trim();
      currentMobile = mobileInput.value.trim().replace(/\D/g, '');

      if (!currentName || currentName.length < 2) {
        showAlert('Please enter your full name.');
        return;
      }

      if (currentMobile.length !== 10 || !/^[6-9]\d{9}$/.test(currentMobile)) {
        showAlert('Please enter a valid 10-digit Indian mobile number.');
        return;
      }

      btnSubmit1.disabled = true;
      btnSubmit1.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> Sending OTP...';

      fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: currentMobile })
      })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        btnSubmit1.disabled = false;
        btnSubmit1.innerHTML = '<i class="fa-solid fa-paper-plane me-2"></i> SEND OTP';

        if (data.success) {
          document.getElementById(containerId + '-disp-mobile').innerText = '+91 ' + currentMobile;
          step1Form.classList.add('d-none');
          stepOtp.classList.remove('d-none');
          startTimer();
          if (data.debugOtp) {
            showAlert('OTP sent! (Dev Code: ' + data.debugOtp + ')', 'info');
          } else {
            showAlert('OTP code sent to +91 ' + currentMobile, 'success');
          }
        } else {
          showAlert(data.message || 'Failed to send OTP.');
        }
      })
      .catch(function () {
        btnSubmit1.disabled = false;
        btnSubmit1.innerHTML = '<i class="fa-solid fa-paper-plane me-2"></i> SEND OTP';
        showAlert('Network error. Please try again.');
      });
    });

    // Edit Mobile
    btnEdit.addEventListener('click', function () {
      hideAlert();
      clearInterval(timerInterval);
      stepOtp.classList.add('d-none');
      step1Form.classList.remove('d-none');
    });

    // Resend OTP
    btnResend.addEventListener('click', function () {
      btnSubmit1.click();
    });

    // Step 2 Verification -> Show Verified & Enable Submit
    btnVerify.addEventListener('click', function () {
      hideAlert();
      var otp = otpInput.value.trim();
      if (!otp || otp.length < 4) {
        showAlert('Please enter the complete OTP code.');
        return;
      }

      btnVerify.disabled = true;
      btnVerify.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> Verifying...';

      fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: currentMobile, otp: otp })
      })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        btnVerify.disabled = false;
        btnVerify.innerHTML = '<i class="fa-solid fa-shield-check me-2"></i> VERIFY OTP';

        if (data.success) {
          clearInterval(timerInterval);
          stepOtp.classList.add('d-none');
          stepVerified.classList.remove('d-none');
          hideAlert();
        } else {
          showAlert(data.message || 'Invalid OTP code.');
        }
      })
      .catch(function () {
        btnVerify.disabled = false;
        btnVerify.innerHTML = '<i class="fa-solid fa-shield-check me-2"></i> VERIFY OTP';
        showAlert('Verification error. Please try again.');
      });
    });

    // Final Submit Enquiry
    btnFinalSubmit.addEventListener('click', function () {
      hideAlert();

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

      btnFinalSubmit.disabled = true;
      btnFinalSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> Submitting Enquiry...';

      fetch('/api/submit-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(function (res) { return res.json(); })
      .then(function (leadRes) {
        btnFinalSubmit.disabled = false;
        btnFinalSubmit.innerHTML = '<i class="fa-solid fa-check me-2"></i> SUBMIT ENQUIRY';

        if (leadRes.success) {
          stepVerified.classList.add('d-none');
          stepSuccess.classList.remove('d-none');
          document.getElementById(containerId + '-succ-prog').innerText = leadRes.programme;
          document.getElementById(containerId + '-succ-mobile').innerText = '+91 ' + currentMobile;
          hideAlert();
        } else {
          showAlert(leadRes.message || 'Failed to submit enquiry.');
        }
      })
      .catch(function () {
        btnFinalSubmit.disabled = false;
        btnFinalSubmit.innerHTML = '<i class="fa-solid fa-check me-2"></i> SUBMIT ENQUIRY';
        showAlert('Submission error. Please try again.');
      });
    });
  }

  window.KaveriEnquiry = {
    init: initEnquiryComponent
  };
})();
