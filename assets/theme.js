/* Simple jQuery Equal Heights @version 1.5.1. Copyright (c) 2013 Matt Banks. Dual licensed under the MIT and GPL licenses. */
!function(a){a.fn.equalHeights=function(){var b=0,c=a(this);return c.each(function(){var c=a(this).innerHeight();c>b&&(b=c)}),c.css("height",b)},a("[data-equal]").each(function(){var b=a(this),c=b.data("equal");b.find(c).equalHeights()})}(jQuery);

/* Run function after window resize */
var afterResize=(function(){var t={};return function(callback,ms,uniqueId){if(!uniqueId){uniqueId="Don't call this twice without a uniqueId";}if(t[uniqueId]){clearTimeout(t[uniqueId]);}t[uniqueId]=setTimeout(callback,ms);};})();

window.theme = window.theme || {};

theme.cacheSelectors = function () {
  theme.cache = {
    // General
    $w: $(window),
    $body: $('body'),

    // Mobile Nav
    $mobileNavTrigger: $('#MobileNavTrigger'),
    $mobileNav: $('#MobileNav'),
    $mobileSublistTrigger: $('.mobile-nav__sublist-trigger'),

    // Equal height elements
    $productGridImages: $('.grid-link__image--product'),
    $featuredGridImages: $('.grid-link__image--collection'),

    // Product page
    $productImage: $('#ProductPhotoImg'),
    $productImageGallery: $('.gallery__item'),

    // Cart Page
    cartNoteAdd: '.cart__note-add',
    cartNote: '.cart__note',

    // Add to cart - Ajax
    $cartCount: $('.cart-count'),
    $addToCartBtn: $('form[action^="/cart/add"] :submit'),

    //Navigation
    $hasDropdownItem: $('.site-nav--has-dropdown')
  }
};

timber.cacheVariables = function () {
  timber.vars = {
    isTouch: timber.cache.$html.hasClass('supports-touch')
  }
};

theme.init = function () {
  theme.cacheSelectors();
  theme.mobileNav();
  timber.cacheVariables();
  theme.equalHeights();
  theme.cartPage();
  theme.toggleMenu();

  
    theme.productImageGallery();
  

  
    theme.enableAjax();
  
};

theme.mobileNav = function () {
  theme.cache.$mobileNavTrigger.on('click', function() {
    theme.cache.$mobileNav.slideToggle(220);
  });

  theme.cache.$mobileSublistTrigger.on('click', function(evt) {
    var $el = $(this);

    // Enable commented out if statement to allow direct clicking on trigger link
    // if (!$el.hasClass('is-active')) {
      evt.preventDefault();
      $el.toggleClass('is-active').next('.mobile-nav__sublist').slideToggle(200);
    // }
  });
};

theme.equalHeights = function () {
  theme.cache.$w.on('load', resizeElements());

  theme.cache.$w.on('resize',
    afterResize(function() {
      resizeElements();
    }, 250, 'equal-heights')
  );

  function resizeElements() {
    theme.cache.$productGridImages.css('height', 'auto').equalHeights();
    theme.cache.$featuredGridImages.css('height', 'auto').equalHeights();
  }
};

theme.productImageGallery = function() {

  if (!theme.cache.$productImageGallery.length) {
    return;
  };

  theme.cache.$productImageGallery.magnificPopup({
    type: 'image',
    mainClass: 'mfp-fade',
    closeOnBgClick: true,
    closeBtnInside: false,
    closeOnContentClick: true,
    tClose: 'Close (Esc)',
    removalDelay: 500,
    callbacks: {
      open: function(){
        $('html').css('overflow-y','hidden');
      },
      close: function(){
        $('html').css('overflow-y','');
      }
    },
    gallery: {
      enabled: true,
      navigateByImgClick: false,
      arrowMarkup: '<button title="%title%" type="button" class="mfp-arrow mfp-arrow-%dir%"><span class="mfp-chevron mfp-chevron-%dir%"></span></button>',
      tPrev: 'Previous (Left arrow key)',
      tNext: 'Next (Right arrow key)'
    }
  });

  theme.cache.$productImage.bind('click', function() {
    var imageId = $(this).attr('data-image-id');
    theme.cache.$productImageGallery.filter('[data-image-id="' + imageId + '"]').trigger('click');
  });
};

theme.cartPage = function () {
  
    return;
  

  theme.cache.$body.on('click', theme.cache.cartNoteAdd, function () {
    $(this).addClass('is-hidden');
    $(theme.cache.cartNote).addClass('is-active');
    ajaxifyShopify.sizeDrawer();
  });
};

theme.backButton = function () {
  var referrerDomain = urlDomain(document.referrer);
  var shopDomain = urlDomain(document.url);

  if (shopDomain === referrerDomain) {
    history.back();
    return false;
  }

  function urlDomain(url) {
    var    a      = document.createElement('a');
           a.href = url;
    return a.hostname;
  }
};

theme.addToCartflip = function ($addToCartBtn) {

  // Get label of add to cart button
  var addToCartText = $addToCartBtn.attr('data-add-to-cart') || "Add to Cart";

  // Make a copy of the add to cart button should we flip it
  $addToCartBtn
    .clone(true)
    .prop('disabled', false)
    .removeClass('disabled')
    .addClass('btn--unflipped')
    .find('span')
    .text(addToCartText)
    .end()
    .hide()
    .insertAfter($addToCartBtn);

  $addToCartBtn
    .unbind('click')
    .removeClass('disabled')
    .find('span')
    .text("View cart")
    .end()
    .bind('click', function(e) {
      e.preventDefault();
      window.location.href = '/cart';
    })
    .prop('disabled', false)
    .addClass('btn--flipped')
    .after('<span class="continue-shopping"> <a class="btn--secondary" href="/collections/all">Continue shopping</a></span>');

  $('.continue-shopping a').bind('click', theme.backButton);

  // Unflip button if another variant is selected
  $('.single-option-selector, [name="quantity"]').bind('click', function() {
    $(this).closest('form').find('.btn--flipped, .continue-shopping, .note').remove();
    $(this).closest('form').find('.btn--unflipped').removeClass('.btn--unflipped').show();
  });
};

theme.enableAjax = function () {
  theme.cache.$addToCartBtn.bind('click', function(e) {
    e.preventDefault();
    $('.note.errors').remove();
    var $addToCartBtn = $(this),
        $addToCartForm = $(this).closest('form'),
        $addToCartBtnText = $(this).find('span');
    if ($addToCartForm.length) {
      $addToCartBtn
        .attr('data-add-to-cart', $addToCartBtnText.text())
        .prop('disabled', true)
        .addClass('disabled')
        .addClass('btn--loading');
      $.ajax({
        url: '/cart/add.js',
        dataType: 'json',
        type: 'post',
        data: $addToCartForm.serialize(),
        success: function(lineItem) {
          $.getJSON('/cart.js', function(cart) {
            theme.cache.$cartCount.text(cart.item_count);
            $('.hidden-count').removeClass('hidden-count');
          });
          $addToCartBtn.removeClass('btn--loading');
          theme.addToCartflip($addToCartBtn);
        },
        error: function(XMLHttpRequest, textStatus) {
          var data = eval('(' + XMLHttpRequest.responseText + ')');
          var response = data.description;
          var status = XMLHttpRequest.status;
          $addToCartBtn.removeClass('btn--loading');
          if (status === 422 && $('#productSelect option').length === 1) {
            $addToCartBtnText.text("Sold Out");
          }
          else {
            $addToCartBtn.prop('disabled', false).removeClass('disabled');
            $addToCartBtnText.text($addToCartBtn.attr('data-add-to-cart'));
          }
          $addToCartBtn.after('<p class="note errors">' + response + '</p>');
        }
      });
    }
  });
};

theme.toggleMenu = function () {
  var $doc = $(document);
  var showDropdownClass = 'show-dropdown';

  // Open sub navs on small screens
  theme.cache.$hasDropdownItem.on('click', function(evt) {
    var $el = $(this);

    if (!$el.hasClass(showDropdownClass) && timber.vars.isTouch) {
      evt.preventDefault();
      $el.addClass(showDropdownClass);
      $doc.on('click', handleClickOutsideDropdown);
    }

    function handleClickOutsideDropdown (evt) {
      var $target = $(evt.target);

      if (!$target.is($el) && !$.contains($el[0], $target[0])) {
        $el.removeClass(showDropdownClass);
        $doc.off('click', handleClickOutsideDropdown)
      }
    }
  })
};

// Initialize theme's JS on docready
$(theme.init)
