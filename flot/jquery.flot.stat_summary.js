/*
Flot plugin for selecting regions.

The plugin defines the following options:

  selection: {
    mode: null or "x" or "y" or "xy",
    color: color
  }

You enable selection support by setting the mode to one of "x", "y" or
"xy". In "x" mode, the user will only be able to specify the x range,
similarly for "y" mode. For "xy", the selection becomes a rectangle
where both ranges can be specified. "color" is color of the selection.

When selection support is enabled, a "plotselected" event will be emitted
on the DOM element you passed into the plot function. The event
handler gets one extra parameter with the ranges selected on the axes,
like this:

  placeholder.bind("plotselected", function(event, ranges) {
    alert("You selected " + ranges.xaxis.from + " to " + ranges.xaxis.to)
    // similar for yaxis, secondary axes are in x2axis
    // and y2axis if present
  });

The "plotselected" event is only fired when the user has finished
making the selection. A "plotselecting" event is fired during the
process with the same parameters as the "plotselected" event, in case
you want to know what's happening while it's happening,

A "plotunselected" event with no arguments is emitted when the user
clicks the mouse to remove the selection.

The plugin allso adds the following methods to the plot object:

- setSelection(ranges, preventEvent)

  Set the selection rectangle. The passed in ranges is on the same
  form as returned in the "plotselected" event. If the selection
  mode is "x", you should put in either an xaxis (or x2axis) object,
  if the mode is "y" you need to put in an yaxis (or y2axis) object
  and both xaxis/x2axis and yaxis/y2axis if the selection mode is
  "xy", like this:

    setSelection({ xaxis: { from: 0, to: 10 }, yaxis: { from: 40, to: 60 } });

  setSelection will trigger the "plotselected" event when called. If
  you don't want that to happen, e.g. if you're inside a
  "plotselected" handler, pass true as the second parameter.
  
- clearSelection(preventEvent)

  Clear the selection rectangle. Pass in true to avoid getting a
  "plotunselected" event.

- getSelection()

  Returns the current selection in the same format as the
  "plotselected" event. If there's currently no selection, the
  function returns null.

*/

(function ($) {
    function init(plot) {
        var stat_lines = {
                show: false,
		mean: 0,
		standard_deviation: 0
            };

        function set_stat_summary(mean, standard_deviation) {
	    //alert(plot.series.length);
            //if (selection.show) {
                stat_lines.show = true;
		stat_lines.mean = mean
		stat_lines.standard_deviation = standard_deviation
                plot.triggerRedrawOverlay();
                //if (!preventEvent)
                   // plot.getPlaceholder().trigger("plotunselected", [ ]);
           // }
        }

	//alert(plot.series)
        plot.set_stat_summary = set_stat_summary;
	
	//plot.series.push(1230249600000, 44750, 1230854400000, 44750);
	
	plot.hooks.drawOverlay.push(function (plot, ctx) {
            // draw selection
            if (stat_lines.show) {
		    //alert('hello');
                var plotOffset = plot.getPlotOffset();
                var o = plot.getOptions();
		var data = plot.getData();
		//alert("data: " + data.length);
                ctx.save();
                ctx.translate(plotOffset.left, plotOffset.top);

                var c = $.color.parse('#f00');

		    
                ctx.strokeStyle = c.scale('a', 0.8).toString();
                ctx.lineWidth = 1;
                ctx.lineJoin = "round";
                ctx.fillStyle = c.scale('a', 0.6).toString();

		//218 0 6 319
		//218 0 108 319
		mean_point = {x: 0, y: parseInt(stat_lines.mean)}
		sd_upper_point = {x: 0, y: (parseInt(stat_lines.mean) + parseInt(stat_lines.standard_deviation))}
		sd_lower_point = {x: 0, y: (parseInt(stat_lines.mean) - parseInt(stat_lines.standard_deviation))}
		
		
                var x = 0,
                    y_mean = plot.pointOffset(mean_point).top,
		    y_sd_upper = plot.pointOffset(sd_upper_point).top,
		    y_sd_lower = plot.pointOffset(sd_lower_point).top
                    w = plot.width(),
                    h = 1;
		
                ctx.fillRect(x, y_mean, w, h);
                ctx.strokeRect(x, y_mean, w, h);
		
		var c = $.color.parse('#55f');
		    
                ctx.strokeStyle = c.scale('a', 0.8).toString();
                ctx.lineWidth = 1;
                ctx.lineJoin = "round";
                ctx.fillStyle = c.scale('a', 0.6).toString();
		
                ctx.fillRect(x, y_sd_upper, w, h);
                ctx.strokeRect(x, y_sd_upper, w, h);
		
		
                ctx.fillRect(x, y_sd_lower, w, h);
                ctx.strokeRect(x, y_sd_lower, w, h);
		
		//alert(ctx.fillRect);
                ctx.restore();
            }
        });
	
    }

    $.plot.plugins.push({
        init: init,
        options: {
            selection: {
                mode: null, // one of null, "x", "y" or "xy"
                color: "#e8cfac"
            }
        },
        name: 'emwtest',
        version: '1.0'
    });
})(jQuery);
