/*!
 * jQuery Update
 *
 * Copyright 2011, Dave Furfero
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */
(function ($) {

      // Events
  var UPDATE      = 'update',
      CHANGE      = 'change',
      START       = 'focus keyup',
      STOP        = 'blur keydown',

      // Selectors
      INPUT       = 'input,select,textarea',
      TEXT_INPUT  = '[type=text],[type=password],textarea,'
                    // Support HTML 5 types with a typing component
                  + '[type=search],[type=tel],[type=url],[type=email],'
                  + '[type=time],[type=datetime],[type=number],[type=color]',
      // Data keys
      STORAGE_KEY = '__update__',
      HANDLER_KEY = '__handle__',

  update = $.event.special.update = {

    timer: null,

    interval: 600,

    // @todo default speeds when support for interval configuration is added
    // @see http://en.wikipedia.org/wiki/Words_per_minute
    // intervals: {
    //   'fast':     300,  // 40wpm "fast"     300.0000000000000ms
    //   'medium':   343,  // 35wpm "medium"   342.8571428571429ms
    //   'average':  367,  // 33wpm "average"  363.6363636363636ms
    //   'slow':     522,  // 23wpm "slow"     521.7391304347826ms
    // },

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

      if ($elem.is(INPUT)) {

        $elem.bind(CHANGE, update.test);

        if ($elem.is(TEXT_INPUT)) {
          $elem.data(STORAGE_KEY, $elem.val())
            .bind(START, update.handleStart)
            .bind(STOP, update.handleStop);
        }

      } else {

        $elem.data(HANDLER_KEY, function (evt) {
          $.event.handle.call(elem, evt);
        });

        $elem.find(INPUT).bind(UPDATE, $elem.data(HANDLER_KEY));
      }
    },

    // @todo handle namespacing?
    teardown: function(ns) {

      var $elem = $(this);

      if ($elem.is(INPUT)) {

        $elem.unbind(CHANGE, update.test);

        if ($elem.is(TEXT_INPUT)) {
          $elem.removeData(STORAGE_KEY)
            .unbind(START, update.handleStart)
            .unbind(STOP, update.handleStop);
        }

      } else {

        $elem.find(INPUT).unbind(UPDATE, $elem.data(HANDLER_KEY));

        $elem.removeData(HANDLER_KEY);
      }
    },

    handleUpdate: function (evt) {
      var udpateEvent = new $.Event(evt);
      udpateEvent.type = UPDATE;
      $.event.handle.call(this, udpateEvent);
    },

    test: function (evt) {

      var elem  = this,
          $elem = $(elem),
          value = $elem.val();

      if ($elem.data(STORAGE_KEY) !== value) {
        $elem.data(STORAGE_KEY, value);
        update.handleUpdate.call(elem, evt);
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

    handleStop: function () {
      if (update.timer) {
        update.timer = clearTimeout(update.timer);
      }
    }
  };

  $.fn.update = function (fn) {
    return fn ? this.bind(UPDATE, fn) : this.trigger(UPDATE);
  };

})(jQuery);