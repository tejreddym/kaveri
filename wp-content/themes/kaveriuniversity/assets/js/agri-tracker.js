/**
 * Kaveri University - Agriculture Admissions UTM & Source Attribution Tracker
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'ku_agri_attribution';

  function parseQueryParams() {
    var params = {};
    var queryString = window.location.search.substring(1);
    if (!queryString) return params;

    var pairs = queryString.split('&');
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].split('=');
      if (pair[0]) {
        var key = decodeURIComponent(pair[0]).trim();
        var val = decodeURIComponent((pair[1] || '').replace(/\+/g, ' ')).trim();
        params[key] = val;
      }
    }
    return params;
  }

  function getReadableSource(utmSource, rawSource) {
    if (rawSource) return rawSource;
    if (!utmSource) return 'Website Direct';
    var lower = utmSource.toLowerCase();
    if (lower.indexOf('chatgpt') !== -1) return 'ChatGPT Ad';
    if (lower.indexOf('google') !== -1) return 'Google Ads';
    if (lower.indexOf('facebook') !== -1 || lower.indexOf('fb') !== -1) return 'Facebook Ads';
    if (lower.indexOf('instagram') !== -1 || lower.indexOf('ig') !== -1) return 'Instagram Ads';
    return utmSource;
  }

  function normalizeCourseName(courseSlug) {
    if (!courseSlug) return '';
    var lower = courseSlug.toLowerCase();
    if (lower.indexOf('agri-tech') !== -1 || lower.indexOf('agritech') !== -1) {
      return 'B.Sc. (Hons.) AgriTech';
    }
    if (lower.indexOf('horticulture') !== -1) {
      return 'B.Sc. (Hons.) Horticulture';
    }
    if (lower.indexOf('agriculture') !== -1 || lower.indexOf('agri') !== -1) {
      return 'B.Sc. (Hons.) Agriculture';
    }
    return courseSlug;
  }

  function initAttribution() {
    var params = parseQueryParams();
    var existing = null;

    try {
      var stored = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
      if (stored) existing = JSON.parse(stored);
    } catch (e) {
      console.warn('Could not read storage', e);
    }

    var utm_source = params.utm_source || (existing ? existing.utm_source : '');
    var utm_medium = params.utm_medium || (existing ? existing.utm_medium : '');
    var utm_campaign = params.utm_campaign || (existing ? existing.utm_campaign : '');
    var rawCourse = params.course || (existing ? existing.rawCourse : '');
    var course = normalizeCourseName(rawCourse);

    var attributionData = {
      utm_source: utm_source,
      utm_medium: utm_medium,
      utm_campaign: utm_campaign,
      source: getReadableSource(utm_source, params.source || (existing ? existing.source : '')),
      course: course,
      rawCourse: rawCourse,
      landing_page_url: (existing && existing.landing_page_url) ? existing.landing_page_url : window.location.href,
      first_visit_time: (existing && existing.first_visit_time) ? existing.first_visit_time : new Date().toISOString(),
      last_visit_time: new Date().toISOString()
    };

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attributionData));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(attributionData));
    } catch (e) {
      console.warn('Could not save attribution storage', e);
    }

    return attributionData;
  }

  var currentAttribution = initAttribution();

  window.KaveriTracker = {
    getAttribution: function () {
      return currentAttribution;
    },
    getPreselectedCourse: function () {
      var params = parseQueryParams();
      if (params.course) return normalizeCourseName(params.course);
      return currentAttribution.course || '';
    }
  };

  // Enhance all Apply buttons on the page with pre-filled course and UTM query string
  document.addEventListener('DOMContentLoaded', function () {
    var applyLinks = document.querySelectorAll('a[href*="apply-now"], a.btn-apply-agri, .open-form');
    var params = parseQueryParams();
    
    applyLinks.forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href || href === '#') return;

      var hasQuery = href.indexOf('?') !== -1;
      var queryParts = [];

      if (params.course && href.indexOf('course=') === -1) {
        queryParts.push('course=' + encodeURIComponent(params.course));
      }
      if (params.utm_source && href.indexOf('utm_source=') === -1) {
        queryParts.push('utm_source=' + encodeURIComponent(params.utm_source));
      }
      if (params.utm_medium && href.indexOf('utm_medium=') === -1) {
        queryParts.push('utm_medium=' + encodeURIComponent(params.utm_medium));
      }
      if (params.utm_campaign && href.indexOf('utm_campaign=') === -1) {
        queryParts.push('utm_campaign=' + encodeURIComponent(params.utm_campaign));
      }

      if (queryParts.length > 0) {
        var newHref = href + (hasQuery ? '&' : '?') + queryParts.join('&');
        link.setAttribute('href', newHref);
      }
    });
  });

})();
