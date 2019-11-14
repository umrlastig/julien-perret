(function($) {
  "use strict"; // Start of use strict

  // Smooth scrolling using jQuery easing
  $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function() {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: (target.offset().top)
        }, 1000, "easeInOutExpo");
        return false;
      }
    }
  });

  // Closes responsive menu when a scroll trigger link is clicked
  $('.js-scroll-trigger').click(function() {
    $('.navbar-collapse').collapse('hide');
  });

  // language
	// Hide Language FR when the web page loads
  $('.lang-fr').hide();
  $('.selectpicker').on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
    if(previousValue == 'English'){
      // find all content with .lang-en under the div post-content and hide it
      $(".lang-en").fadeToggle('slow',function() {
        // find all content with .lang-fr under the div post-content and show it
        $(".lang-fr").show(); });
    }
    else {
      // find all content with .lang-fr under the div post-content and hide it
      $('.lang-fr').fadeToggle('slow',function() {
        // find all content with .lang-en under the div post-content and show it
          $('.lang-en').show();});
    }
  });

  // Activate scrollspy to add active class to navbar items on scroll
  $('body').scrollspy({
    target: '#sideNav'
  });

})(jQuery); // End of use strict
