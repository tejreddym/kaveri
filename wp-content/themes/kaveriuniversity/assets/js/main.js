// ON LOAD
$(window).on("load", function () {
  navAdjest();
  $('.navbar-menu-container').css('opacity', 1);
  // infoSlickSlider('.info-message-slider', 1, true);
  heroSlider('.hero-slider');

  gridAdjust(".info-advantage-slider .card .card-body");
  gridAdjust(".info-governence-slider .card .card-body");
  gridAdjust(".info-management-slider .card .card-body");
  gridAdjust(".info-culture-slider .card .card-body");
  gridAdjust(".info-academics-slider .card .card-body");
  // gridAdjust(".info-academics-slider .card .card-body");
  gridAdjust(".info-cards .card .card-body");
  gridAdjust(".info-course-details .info-course-bg .info-course-content");
  gridAdjust(".info-bg-light .info-missions-slider .info-card-content-bg");
  gridAdjust(".bg-brand-blue .info-media-slider .info-card-content-bg");
  gridAdjust(".info-bg-light .info-card-slider .info-card-content-bg");
  gridAdjust(".bg-white .info-training-slider .info-card-content-bg");
  gridAdjust(".info-bg-light .info-card-slider .info-card-content-bg");
  gridAdjust(".info-content-section .info-highlight-slider .info-card-content-bg");
  gridAdjust(".info-content-section .info-eligibility-slider .info-card-content-bg");
  gridAdjust(".info-content-section .info-dates-slider .info-card-content-bg");

  if ($(window).width() < 767) {
    gridAdjust(".item-card-container .info-item-card-wrap");
  }
});

// Listen for clicks on elements with `data-bs-target`
document.addEventListener('click', (event) => {
const target = event.target;
if (target.hasAttribute('data-bs-target')) {
    // Call the gridAdjust function when a data-bs-target element is clicked
    gridAdjust('.info-content-section .info-eligibility-slider .info-card-content-bg');
    gridAdjust(".info-content-section .info-dates-slider .info-card-content-bg");
}
});
// ON READY
$(document).ready(function() {
  infoSlickFiveSlide('.info-presence-slider', 5, true, null);
  infoSlickThreeSlide('.info-academics-slider', 3, true, '.arrows-academics-slider');
  infoSlickThreeSlide('.info-advantage-slider', 3, true, '.arrows-advantage-slider');
  infoSlickThreeSlide('.info-culture-slider', 3, true, '.arrows-culture-slider');
  infoSlickFourSlide('.info-governence-slider', 4, true);
  infoSlickFourSlide('.info-management-slider', 4, true);
  infoSlickOneSlide('.info-message-slider', 1, true, '.info-message-arrows');
  mobileOnlySlider(".mobileSlideOnly", 1, true, true, false, 1290);
  mobileOnlySlider(".mobileSlideOnly-presence", 1, true, true, false, 767);
  mobileOnlySlider(".mobileSlideOnly-landscape", 1, true, true, false, 767);
  mobileOnlySlider(".mobileSlideOnly-core-values", 2, true, true, false, 767);
  mobileOnlySlider(".info-missions-slider", 1, true, true, false, 767);
  mobileOnlySlider(".info-media-slider", 1, true, true, false, 767);
  mobileOnlySlider(".info-training-slider", 1, true, true, false, 767);
  mobileOnlySlider(".info-card-slider", 1, true, true, false, 767);
  mobileOnlySlider(".info-highlight-slider", 1, true, true, false, 767);
  mobileOnlySlider(".nav-pills-slider-mobile", 1, false, false, true, 767);

  if ($(window).width() < 767) {
    gridAdjust(".item-card-container .info-item-card-wrap");
  }

  navAdjest();
  menuChildren();
  //
  // gridAdjust(".info-advantage-slider .card .card-body");
  // gridAdjust(".info-culture-slider .card .card-body");
  // gridAdjust(".info-academics-slider .card .card-body");

});

// ON RESIZE
$(window).resize(function () {
  navAdjest();
  // gridAdjust(".info-advantage-slider .card .card-body");
  // gridAdjust(".info-culture-slider .card .card-body");
  // gridAdjust(".info-academics-slider .card .card-body");
  // navbarArrow();
});
function navAdjest() {
  var n_b_h = $('.navbar-brand').outerHeight();
  $('.hero-bg, info-bg').css('min-height', n_b_h +'px');
  $('.main-header, .nav-dropdown-menu').css('padding-top', n_b_h +'px' );
  $('.navbar-menu-container').css('min-height', 'calc(100vh - ' + n_b_h +'px' );
  $('.navbar-menu-container').css('max-height', 'calc(100vh - ' + n_b_h +'px' );

  if ($(window).width() < 991) {
    var b_h = $('body').outerHeight();
    $('body').css('margin-top', n_b_h +'px');
      $('.hero').css('min-height', b_h - n_b_h +'px');
    }

}
$('.nav').on('click','.dropdown .nav-link', function(e){
  e.preventDefault();
  $(".nav-dropdown-menu, .dropdown-toggle").removeClass('show');
  $(this).toggleClass('show');
  if ($(this).hasClass("dropdown-toggle show")) {
      $(this).closest("li").find(".nav-dropdown-menu").addClass("show");
  }
  else{
      $(this).closest("li").find(".nav-dropdown-menu").removeClass("show");
  }
});

$('.btn-navbar-arrow').on('click', function(e){
  e.preventDefault();
  $(this).toggleClass('show');
    navbarArrow();
});

$('.btn-nav .nav-link').on('click', function(e){
  $("#exampleModal").modal('show');
});

function navbarArrow(){
  if ($(window).width() < 991) {
    $('.main-body').toggleClass('show-menu');
    if ($('.main-body').hasClass('show-menu')) {
      $('.main-header').addClass('show');
    }
    else{
      $('.main-header').removeClass('show');
    }
  }
  else {
    $('.main-body').removeClass('show-menu');
  }
}

function menuChildren() {
if($('.menu-item').hasClass('menu-item-has-children')) {
  $('.menu-item').find('.nav-dropdown-menu').prepend('<li><a href="#" class="nav-link nav-sub-link"><i class="fa-solid fa-arrow-left"></i></a></li>')
}
}


function infoSlickOneSlide($slideSelctor, $slides, $arrows, $appendArrows){

$($slideSelctor).slick({
  infinite: false,
  slidesToShow: $slides,
  slidesToScroll: 1,
  arrows: $arrows,
  swipe: false,
  swipeToSlide: false,
  appendArrows: $appendArrows,
  // adaptiveHeight: true,
}),updateImg();
$('.info-message-item-img .slick-arrow').on('click', function(e) {
  updateImg();
})
function updateImg() {

  var dataImg = $('.info-message-slider .slick-slide.slick-current').attr('data-img');
  // alert(dataImg);
  if (dataImg !== '') {
    $('.info-data-img').attr('src', dataImg);
  }
}
}

function infoSlickThreeSlide($slideSelctor, $slides, $arrows, $appendArrows){
  $($slideSelctor).slick({
    infinite: true,
    slidesToShow: $slides,
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: 1000,
    speed: 1500,
    arrows: $arrows,
    appendArrows: $appendArrows,
    // prevArrow: '<a hr><i class="fa-light fa-arrow-left"></i></a>',
    // nextArrow: '<a></a><i class="fa-light fa-arrow-right"></i></a>',
    responsive: [
      {
        breakpoint: 1100,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
      // You can unslick at a given breakpoint now by adding:
      // settings: "unslick"
      // instead of a settings object
    ]
  });
  $('a[data-bs-toggle="pill"]').on('shown.bs.tab', function (e) {
    $($slideSelctor).slick('setPosition');
     gridAdjust(".info-advantage-slider .card .card-body");
    gridAdjust(".info-culture-slider .card .card-body");
    gridAdjust(".info-academics-slider .card .card-body");
  })
}

function infoSlickFourSlide($slideSelctor, $slides, $arrows){
  $($slideSelctor).slick({
    infinite: true,
    slidesToShow: $slides,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1000,
    speed: 1500,
    arrows: $arrows,
    // appendArrows: $appendArrows,
    // prevArrow: '<a hr><i class="fa-light fa-arrow-left"></i></a>',
    // nextArrow: '<a></a><i class="fa-light fa-arrow-right"></i></a>',
    responsive: [
      {
        breakpoint: 1100,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
      // You can unslick at a given breakpoint now by adding:
      // settings: "unslick"
      // instead of a settings object
    ]
  });
}

function infoSlickFiveSlide($slideSelctor, $slides, $arrows, $appendArrows){
  $($slideSelctor).slick({
    infinite: true,
    slidesToShow: $slides,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1000,
    speed: 1500,
    arrows: $arrows,
    appendArrows: $appendArrows,
    // prevArrow: '<a hr><i class="fa-light fa-arrow-left"></i></a>',
    // nextArrow: '<a></a><i class="fa-light fa-arrow-right"></i></a>',
    responsive: [
      {
        breakpoint: 1100,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
      // You can unslick at a given breakpoint now by adding:
      // settings: "unslick"
      // instead of a settings object
    ]
  });
}

function heroSlider($slideSelctor){
  $($slideSelctor).slick({
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    speed: 1500,
    arrows: true
    // adaptiveHeight: true,
  });

  $($slideSelctor).on('afterChange', function(event, slick, currentSlide) {
    if (currentSlide === 1) {
      $($slideSelctor).slick('slickSetOption', 'autoplaySpeed', 8000, true);  // 10 seconds for slide 2
    } else {
      $($slideSelctor).slick('slickSetOption', 'autoplaySpeed', 3000, true);  // 3 seconds for other slides
    }
});
}

function mobileOnlySlider($slidername, $slidesToShow, $autoplay, $dots, $arrows, $breakpoint) {
  var slider = $($slidername);
  var settings = {
    mobileFirst: true,
    slidesToShow: $slidesToShow,
    slidesToScroll: 1,
    autoplay: $autoplay,
    autoplaySpeed: 1000,
    speed: 1500,
    dots: $dots,
    arrows: $arrows,
    infinite: true,
    responsive: [
      // {
      //   breakpoint: 1290,
      //   settings: {
      //     slidesToShow: 2,
      //     slidesToScroll: 1,
      //   }
      // },
      {
        breakpoint: $breakpoint,
        settings: "unslick"
      }
    ]
  };

  slider.slick(settings);

  $(window).on("resize", function () {
    if ($(window).width() > $breakpoint) {

      return;
    }
    if (!slider.hasClass("slick-initialized")) {
      return slider.slick(settings);
    }
  });

} // Mobile Only Slider

function gridAdjust(targertSteing) {
var targertHight = $(targertSteing);
targertHight.css("height", "auto");
var heights = [];
targertHight.each(function () {
  var elem = $(this);
  var height = elem.outerHeight();
  heights.push(height);
});
heights = heights.sort(function (a, b) {
  return b - a;
});
// console.log(heights);
var tallest = heights[0];
targertHight.css("height", tallest + "px");
if ($(window).width() < 767) {
  // mobileOnlySlider(".info-slider-testimonial", 1, true, true, 767);
}
}
setTimeout(function () {
// $("#projectFilterSlider .slick-current.slick-active .filter-item").trigger(
//   "click"
// );
}, 10);
$(".ribbon-nav").on("click", ".nav-link", function (e) {
e.preventDefault();
// $(".loader").fadeIn(0);
// (container = projectSlider.outerHeight()),
//   (filter = $(this).attr("data-filter"));
// projectSlider.parent().css("min-height", container);
// $("#projectFilterSlider .filter-item").removeClass("active");
// projectSlider.slick("unslick");
// $(this).addClass("active");
// $.ajax({
//   type: "POST",
//   url: "https://tempestwebsites.com/barsyl/wp-admin/admin-ajax.php",
//   dataType: "html",
//   data: {
//     action: "filter_projects",
//     project_tag: filter,
//   },
//   success: function (res) {
//     projectSlider.html(res);
//     projectSlider.not(".slick-initialized").slick($opts);
//     // $('#projectSlider').slick('setPosition');
//     $(".loader").fadeOut(500);
//   },
// });
});


$(window).scroll(function() {
var $countDigit = $('.count-digit');
if ($countDigit.length > 0 && visible($countDigit)) {
  if ($countDigit.hasClass('counter-loaded')) return;
  $countDigit.addClass('counter-loaded');
  $countDigit.each(function() {
    var $this = $(this);
    jQuery({ Counter: 0 }).animate({ Counter: $this.text() }, {
      duration: 2000,
      easing: 'swing',
      step: function() {
        $this.text(Math.ceil(this.Counter));
      }
    });
  });
}
});

function visible($element) {
if (!$element.length) {
  return false;
}

var $w = jQuery(window),
    viewTop = $w.scrollTop(),
    viewBottom = viewTop + $w.height(),
    _top = $element.offset().top,
    _bottom = _top + $element.height(),
    compareTop = _bottom,
    compareBottom = _top;

return ((compareBottom <= viewBottom) && (compareTop >= viewTop) && $element.is(':visible'));
}


jQuery(document).ready(function($) {
var form = $('.wpcf7 form'); // Select the Contact Form 7 form
var submitButton = form.find('input[type="submit"]'); // Find the submit button

// Disable the submit button if the form has the 'wpcf7-form-invalid' class
function toggleSubmitButton() {
    if (form.hasClass('wpcf7-form-invalid')) {
        submitButton.prop('disabled', true); // Disable the button
    } else {
        submitButton.prop('disabled', false); // Enable the button
    }
}

// Run the toggle function initially when the page loads
toggleSubmitButton();

// Listen for Contact Form 7 events to toggle the submit button
document.addEventListener('wpcf7invalid', function(event) {
    toggleSubmitButton(); // Disable the button when the form is invalid
}, false);

document.addEventListener('wpcf7mailsent', function(event) {
    toggleSubmitButton(); // Enable the button when the form is successfully submitted
}, false);

document.addEventListener('wpcf7submit', function(event) {
    toggleSubmitButton(); // Enable/Disable the button based on the form status
}, false);

document.addEventListener('wpcf7spam', function(event) {
    toggleSubmitButton(); // Disable the button if the form is flagged as spam
}, false);

document.addEventListener('wpcf7mailfailed', function(event) {
    toggleSubmitButton(); // Enable the button if mail fails to send
}, false);

// Disable the submit button after form submission to prevent multiple submissions
form.on('submit', function() {
submitButton.prop('disabled', true);
});

// Re-enable the submit button when the form is reset (if applicable)
form.on('reset', function() {
submitButton.prop('disabled', false);
});
});




// document.addEventListener('wpcf7mailsent', function(event) {
//   event.preventDefault();
//   alert('hi');
// }, false);

$(document).ready(function () {
  $('.nav-pills-slider-mobile').on('afterChange', function (event, slick, currentSlide) {
      // Remove 'active' and 'border-bottom' classes from all nav-links
      $('.nav-link').removeClass('active border-bottom');
      $('.tab-pane').removeClass('active show'); // Remove 'active' and 'show' from all tab contents

      // Get the corresponding tab button and content based on the active slide index
      let tabButtons = [
          '#pills-program-overview-tab',
          '#pills-eligibility-tab',
          '#pills-fee-structure-tab',
          '#pills-important-date-tab'
      ];

      let tabContents = [
          '#program-overview',
          '#pills-eligibility',
          '#pills-fee-structure',
          '#pills-important-date'
      ];

      // Add 'active' class to the corresponding tab button and content
      $(tabButtons[currentSlide]).addClass('active border-bottom');
      $(tabContents[currentSlide]).addClass('active show'); // Show the corresponding tab content

      // Trigger Bootstrap tab system to open the correct tab
      var tabId = $(tabButtons[currentSlide]).attr('data-bs-target');
      $(tabId).tab('show');

      // Ensure DOM updates before running gridAdjust
      setTimeout(() => {
          gridAdjust('.info-content-section .info-eligibility-slider .info-card-content-bg');
          gridAdjust(".info-content-section .info-dates-slider .info-card-content-bg");
      }, 100); // Delay of 100ms to allow DOM updates
  });
});

function gridAdjust(targetString) {
  var targetHeight = $(targetString);
  targetHeight.css("height", "auto");
  var heights = [];

  targetHeight.each(function () {
      var elem = $(this);
      var height = elem.outerHeight();
      heights.push(height);
  });

  heights = heights.sort(function (a, b) {
      return b - a;
  });

  var tallest = heights[0];
  targetHeight.css("height", tallest + "px");

  if ($(window).width() < 767) {
      // mobileOnlySlider(".info-slider-testimonial", 1, true, true, 767);
  }
}

// Handle clicks on tab navigation
document.addEventListener('click', (event) => {
  const target = event.target;
  if (target.hasAttribute('data-bs-target')) {
      setTimeout(() => {
          gridAdjust('.info-content-section .info-eligibility-slider .info-card-content-bg');
          gridAdjust(".info-content-section .info-dates-slider .info-card-content-bg");
      }, 100);
  }
});

// SEO JS start here
fetch("https://kaveriuniversity.edu.in/wp-json/wp/v2/pages/23")
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Error fetching data:", error));
// SEO JS end here


