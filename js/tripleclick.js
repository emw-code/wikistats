(function($){
  
  // A collection of elements to which the tripleclick event is bound.
  var elems = $([]),
    
    // Initialize the clicks counter and last-clicked timestamp.
    clicks = 0,
    last = 0;
  
  // Click speed threshold, defaults to 500.
  $.tripleclickThreshold = 400;
  
  // Special event definition.
  $.event.special.tripleclick = {
    setup: function(){
      // Add this element to the internal collection.
      elems = elems.add( this );
      
      // If this is the first element to which the event has been bound,
      // bind a handler to document to catch all 'click' events.
      if ( elems.length === 1 ) {
        $(document).bind( 'click', click_handler );
      }
    },
    teardown: function(){
      // Remove this element from the internal collection.
      elems = elems.not( this );
      
      // If this is the last element removed, remove the document 'click'
      // event handler that "powers" this special event.
      if ( elems.length === 0 ) {
        $(document).unbind( 'click', click_handler );
      }
    }
  };
  
  // This function is executed every time an element is clicked.
  function click_handler( event ) {
    var elem = $(event.target);
    
    // If more than `threshold` time has passed since the last click, reset
    // the clicks counter.
    if ( event.timeStamp - last > $.tripleclickThreshold ) {
      clicks = 0;
    }
    
    // Update the last-clicked timestamp.
    last = event.timeStamp;
    
    // Increment the clicks counter. If the counter has reached 3, trigger
    // the "tripleclick" event and reset the clicks counter to 0. Trigger
    // bound handlers using triggerHandler so the event doesn't propagate.
    if ( ++clicks === 3 ) {
      elem.trigger( 'tripleclick' );
      clicks = 0;
    }
  };
  
})(jQuery);