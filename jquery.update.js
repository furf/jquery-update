(function ($) {
  
  // @todo handle HTML5 input types
  
      // Events
  var UPDATE      = 'update',
      CHANGE      = 'change',
      START       = 'focus keyup',
      STOP        = 'blur keydown',
      
      // Selectors
      FORM        = 'form',
      TEXT_INPUT  = 'input[type=text], input[type=password], textarea',
      OTHER_INPUT = 'input[type!=text], input[type!=password], select',
      ALL_INPUTS  = 'input, select, textarea',
      
      // Data keys
      STORAGE_KEY = '__update__',
      HANDLER_KEY = '__handle__',

  update = $.event.special.update = {

    timer: null,
    
    // @see http://en.wikipedia.org/wiki/Words_per_minute
    // intervals: {
    //   'fast':     300,  // 40wpm "fast"     300.0000000000000ms
    //   'medium':   343,  // 35wpm "medium"   342.8571428571429ms
    //   'average':  367,  // 33wpm "average"  363.6363636363636ms
    //   'slow':     522,  // 23wpm "slow"     521.7391304347826ms
    // },

    interval: 600,
    
    children: null,
    
    // @todo handle namespacing?
    // joinNamespaces: function () {
    //   return (ns) ? '.' + ns.join('.') : '';
    // },

    // @todo use data.interval for interval configuration - use add when available
    // add: function (fn, data, ns) {
    //   update.interval = data.interval && update.intervals[data.interval] || update.intervals['slow'];
    // },

    // @todo handle namespacing?
    setup: function(data, ns) {

      var elem  = this,
          $elem = $(elem);

      if ($elem.is(TEXT_INPUT)) {

        $elem.data(STORAGE_KEY, $elem.val())
          .bind(START, update.handleStart)
          .bind(STOP, update.handleStop);
      
      } else if ($elem.is(OTHER_INPUT)) {

        $elem.bind(CHANGE, update.trigger);
      
      } else if ($elem.is(FORM)) {

        // @todo make sure storing the function this way is properly tore down
        $elem.data(HANDLER_KEY, function (evt) {
          $.event.handle.call(elem, evt);
        });

        // @todo move to .live() when focus and blur are natively supported
        $elem.find(ALL_INPUTS).bind(UPDATE, $elem.data(HANDLER_KEY));
      }
    },

    // @todo handle namespacing?
    teardown: function(ns) {

      var $elem = $(this);

      if ($elem.is(TEXT_INPUT)) {

        $elem.removeData(STORAGE_KEY)
          .unbind(START, update.handleStart)
          .unbind(STOP, update.handleStop);
      
      } else if ($elem.is(OTHER_INPUT)) {

        $elem.unbind(CHANGE, update.trigger);
      
      } else if ($elem.is(FORM)) {

        $elem.find(ALL_INPUTS).unbind(UPDATE, $elem.data(HANDLER_KEY));
        
        $elem.removeData(HANDLER_KEY);
      }
    },

    trigger: function (evt) {
      // @todo reuse event or create new?
      // (don't blow out child update events)
      evt.type = UPDATE;
      evt = new jQuery.Event(evt);
      console.log(evt);
      $.event.handle.call(this, evt);
    },

    test: function (evt) {

      var elem  = this,
          $elem = $(elem),
          value = $elem.val();

      if ($elem.data(STORAGE_KEY) !== value) {
        $elem.data(STORAGE_KEY, value);
        update.trigger.call(elem, evt);
      }
    },
    
    handleStart: function (evt) {

      var elem = this;
      
      if (!update.timer) {
        update.timer = setTimeout(function () {
          update.test.call(elem, evt);
          update.timer = setTimeout(arguments.callee, update.interval);
        }, update.interval);
      }
    },
    
    handleStop: function (evt) {

      var elem = this;

      if (update.timer) {
        update.timer = clearTimeout(update.timer);
      }

      if (evt.type === 'blur') {
        update.test.call(elem, evt);
      }      
    }
  };

  $.fn.update = function (fn) {
    return fn ? this.bind(UPDATE, fn) : this.trigger(UPDATE);
  };
  
})(jQuery);