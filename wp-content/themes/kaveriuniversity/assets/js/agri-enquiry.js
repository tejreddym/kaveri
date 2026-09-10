/**
 * Kaveri University - Agriculture Admissions Lead Capture Enquiry Handler
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
      '<div class="card shadow-sm border-0 rounded-3 overflow-hidden bg-white">' +
        '<div class="card-header text-white text-center py-3" style="background-color: #22325c;">' +
          '<span class="badge bg-warning text-dark mb-1 px-2 py-1 fw-bold text-uppercase" style="font-size: 0.75rem;">School of Agriculture</span>' +
          '<h3 class="h5 mb-1 text-white fw-bold">Admissions Enquiry 2026–27</h3>' +
          '<p class="mb-0 text-white-50 small">Get programme details, eligibility, fees & admission guidance.</p>' +
        '</div>' +
        '<div class="card-body p-4">' +
          '<div id="' + containerId + '-alert" class="alert d-none"></div>' +

          '<!-- STEP 1: Name & Mobile -->' +
          '<form id="' + containerId + '-form-step1" class="enquiry-step">' +
            '<div class="mb-3 text-start">' +
              '<label class="form-label fw-semibold text-dark small">Full Name <span class="text-danger">*</span></label>' +
              '<input type="text" id="' + containerId + '-fullname" class="form-control form-control-lg fs-6" placeholder="Enter your full name" required />' +
            '</div>' +
            '<div class="mb-3 text-start">' +
              '<label class="form-label fw-semibold text-dark small">Mobile Number <span class="text-danger">*</span></label>' +
              '<div class="input-group input-group-lg">' +
                '<span class="input-group-text bg-light text-muted fw-bold fs-6">+91</span>' +
                '<input type="tel" id="' + containerId + '-mobile" class="form-control fs-6" placeholder="Enter 10-digit mobile number" maxlength="10" pattern="[0-9]{10}" required />' +
              '</div>' +
            '</div>' +
            (showProgrammeSelect ?
              '<div class="mb-3 text-start">' +
                '<label class="form-label fw-semibold text-dark small">Interested Programme <span class="text-danger">*</span></label>' +
                '<select id="' + containerId + '-prog" class="form-select form-select-lg fs-6" required>' +
                  '<option value="B.Sc. (Hons.) Agriculture">B.Sc. (Hons.) Agriculture</option>' +
                  '<option value="B.Sc. (Hons.) AgriTech">B.Sc. (Hons.) AgriTech</option>' +
                  '<option value="B.Sc. (Hons.) Horticulture">B.Sc. (Hons.) Horticulture</option>' +
                '</select>' +
              '</div>' : '') +
            '<button type="submit" id="' + containerId + '-btn-submit1" class="btn text-white w-100 fw-bold py-3 shadow-sm text-uppercase" style="background-color: #b72928; border: none; letter-spacing: 0.5px;">' +
              '<i class="fa-solid fa-paper-plane me-2"></i> Get Admission Details' +
            '</button>' +
          '</form>' +

          '<!-- STEP 2: OTP Verification -->' +
          '<div id="' + containerId + '-step-otp" class="enquiry-step d-none text-start">' +
            '<div class="bg-light p-3 rounded mb-3 border">' +
              '<div class="d-flex justify-content-between align-items-center">' +
                '<div>' +
                  '<span class="text-muted small">OTP sent to:</span>' +
                  '<div class="fw-bold text-dark fs-6" id="' + containerId + '-disp-mobile">+91 XXXXX XXXXX</div>' +
                '</div>' +
                '<button type="button" id="' + containerId + '-btn-edit" class="btn btn-sm btn-outline-secondary">Edit</button>' +
              '</div>' +
            '</div>' +
            '<div class="mb-3">' +
              '<label class="form-label fw-semibold text-dark small">Enter OTP Code <span class="text-danger">*</span></label>' +
              '<input type="text" id="' + containerId + '-otp" class="form-control form-control-lg text-center fw-bold fs-4" placeholder="••••" maxlength="6" style="letter-spacing: 6px;" required />' +
              '<div class="d-flex justify-content-between align-items-center mt-2">' +
                '<span id="' + containerId + '-timer-text" class="text-muted small">Resend in <strong id="' + containerId + '-timer-count">60</strong>s</span>' +
                '<button type="button" id="' + containerId + '-btn-resend" class="btn btn-link btn-sm p-0 text-decoration-none d-none">Resend OTP</button>' +
              '</div>' +
            '</div>' +
            '<button type="button" id="' + containerId + '-btn-verify" class="btn text-white w-100 fw-bold py-3 shadow-sm text-uppercase" style="background-color: #b72928; border: none;">' +
              '<i class="fa-solid fa-shield-check me-2"></i> Verify OTP & Enquire' +
            '</button>' +
          '</div>' +

          '<!-- STEP 3: Thank You Success -->' +
          '<div id="' + containerId + '-step-success" class="enquiry-step d-none text-center py-4">' +
            '<div class="mb-3 text-success">' +
              '<i class="fa-solid fa-circle-check display-3"></i>' +
            '</div>' +
            '<h3 class="fw-bold text-success mb-2">Thank You!</h3>' +
            '<p class="fw-semibold text-dark mb-2">Your enquiry has been received successfully.</p>' +
            '<p class="text-muted small mb-4">Our admissions team will contact you shortly with programme details, eligibility, fees, and hostel guidance.</p>' +
            '<div class="p-3 bg-light rounded text-start border small mb-3">' +
              '<div><strong>Programme:</strong> <span id="' + containerId + '-succ-prog"></span></div>' +
              '<div><strong>Mobile:</strong> <span id="' + containerId + '-succ-mobile"></span></div>' +
            '</div>' +
            '<a href="/b-sc-hons-agriculture/" class="btn btn-outline-dark btn-sm fw-bold">Explore Campus Facilities</a>' +
          '</div>' +

        '</div>' +
      '</div>';

    container.innerHTML = html;

    // Element references
    var alertEl = document.getElementById(containerId + '-alert');
    var step1Form = document.getElementById(containerId + '-form-step1');
    var stepOtp = document.getElementById(containerId + '-step-otp');
    var stepSuccess = document.getElementById(containerId + '-step-success');

    var nameInput = document.getElementById(containerId + '-fullname');
    var mobileInput = document.getElementById(containerId + '-mobile');
    var progSelect = document.getElementById(containerId + '-prog');
    var otpInput = document.getElementById(containerId + '-otp');

    var btnSubmit1 = document.getElementById(containerId + '-btn-submit1');
    var btnVerify = document.getElementById(containerId + '-btn-verify');
    var btnEdit = document.getElementById(containerId + '-btn-edit');
    var btnResend = document.getElementById(containerId + '-btn-resend');

    var timerCount = document.getElementById(containerId + '-timer-count');
    var timerText = document.getElementById(containerId + '-timer-text');

    var currentMobile = '';
    var currentName = '';
    var timerInterval = null;

    function showAlert(msg, type) {
      alertEl.className = 'alert alert-' + (type || 'danger');
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
        btnSubmit1.innerHTML = '<i class="fa-solid fa-paper-plane me-2"></i> Get Admission Details';

        if (data.success) {
          document.getElementById(containerId + '-disp-mobile').innerText = '+91 ' + currentMobile;
          step1Form.classList.add('d-none');
          stepOtp.classList.remove('d-none');
          startTimer();
          if (data.debugOtp) {
            showAlert('OTP sent! (Dev Code: ' + data.debugOtp + ')', 'info');
          } else {
            showAlert('OTP sent successfully to +91 ' + currentMobile, 'success');
          }
        } else {
          showAlert(data.message || 'Failed to send OTP.');
        }
      })
      .catch(function () {
        btnSubmit1.disabled = false;
        btnSubmit1.innerHTML = '<i class="fa-solid fa-paper-plane me-2"></i> Get Admission Details';
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

    // Step 2 Verification -> Submit Lead
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
        if (!data.success) {
          btnVerify.disabled = false;
          btnVerify.innerHTML = '<i class="fa-solid fa-shield-check me-2"></i> Verify OTP & Enquire';
          showAlert(data.message || 'Invalid OTP code.');
          return;
        }

        // Verified -> Post Lead
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

        return fetch('/api/submit-enquiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        .then(function (res) { return res.json(); })
        .then(function (leadRes) {
          btnVerify.disabled = false;
          btnVerify.innerHTML = '<i class="fa-solid fa-shield-check me-2"></i> Verify OTP & Enquire';

          if (leadRes.success) {
            clearInterval(timerInterval);
            stepOtp.classList.add('d-none');
            stepSuccess.classList.remove('d-none');
            document.getElementById(containerId + '-succ-prog').innerText = leadRes.programme;
            document.getElementById(containerId + '-succ-mobile').innerText = '+91 ' + currentMobile;
            hideAlert();
          } else {
            showAlert(leadRes.message || 'Failed to record enquiry.');
          }
        });
      })
      .catch(function () {
        btnVerify.disabled = false;
        btnVerify.innerHTML = '<i class="fa-solid fa-shield-check me-2"></i> Verify OTP & Enquire';
        showAlert('Verification error. Please try again.');
      });
    });
  }

  window.KaveriEnquiry = {
    init: initEnquiryComponent
  };
})();
