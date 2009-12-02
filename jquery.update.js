(function($) {


  // @todo handle HTML5 input types
  
      // Events
  var UPDATE      = 'update',
      CHANGE      = 'change',
      START       = 'focus keyup',
      STOP        = 'blur keydown',
      // Selectors
      FORM        = 'form',
      TEXT_INPUT  = 'input[type=text]',
      OTHER_INPUT = 'input[type!=text], select',
      ALL_INPUTS  = 'input, select',
      // Data keys
      STORAGE_KEY = '__update__',
      HANDLER_KEY = '__handle__',

  update = $.event.special.update = {

    timer: null,
    
    interval: 1000,
    
    children: null,
    
    // @todo handle namespacing?
    // joinNamespaces: function () {
    //   return (ns) ? '.' + ns.join('.') : '';
    // },

    // @todo handle namespacing?
    // @todo use data.interval for interval configuration - use add when available
    setup: function(data, ns) {

      var elem  = this,
          $elem = $(elem);

      if ($elem.is(TEXT_INPUT)) {

        $elem
          .bind(START, update.handleStart)
          .bind(STOP, update.handleStop);
      
      } else if ($elem.is(OTHER_INPUT)) {

        $elem
          .bind(CHANGE, update.compare);
      
      } else if ($elem.is(FORM)) {

        $elem.data(HANDLER_KEY, function (evt) {
          $.event.handle.apply(elem, arguments);
        });

        // @todo move to .live() when focus and blur are natively supported
        update.children = $elem.find(ALL_INPUTS)
          .bind(UPDATE, $elem.data(HANDLER_KEY));
      }
    },

    // @todo remove data in cleanup
    // @todo handle namespacing?
    teardown: function(ns) {

      var $elem = $(this);

      if ($elem.is(TEXT_INPUT)) {

        $elem
          .unbind(START, update.handleStart)
          .unbind(STOP, update.handleStop);
      
      } else if ($elem.is(OTHER_INPUT)) {

        $elem
          .unbind(CHANGE, update.compare);
      
      } else if ($elem.is(FORM)) {

        update.children
          .unbind(UPDATE, $elem.data(HANDLER_KEY));
      }
    },
    
    compare: function (evt) {

      var elem    = this,
          $elem   = $(elem),
          current = $elem.val(),
          stored  = $elem.data(STORAGE_KEY);

      if (current !== stored) {
        $elem.data(STORAGE_KEY, current);
        if (typeof stored !== 'undefined' || current !== '') {
          evt.type = UPDATE;
          $.event.handle.apply(elem, arguments);
        }
      }
    },
    
    handleStart: function (evt) {

      var elem = this;
      
      if (!update.timer) {
        update.timer = setInterval(function () {
          update.compare.call(elem, evt);
        }, update.interval);
      }
    },
    
    handleStop: function (evt) {
      if (update.timer) {
        update.timer = clearInterval(update.timer);
      }
    }
  };

  $.fn.update = function (fn) {
    return fn ? this.bind(UPDATE, fn) : this.trigger(UPDATE);
  };
  
})(jQuery);