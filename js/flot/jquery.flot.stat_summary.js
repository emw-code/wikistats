/*
Copyright (c) 2012 Emw
Dual licensed under MIT and GPL licenses

Flot plugin for plotting confidence intervals.
Currently only supports 1 confidence interval, i.e. average +/- 1 standard deviation
*/

(function ($) {
    function init(plot) {
	    
        var stat_lines = {
                show: false,
		mean: 0,
		standard_deviation: 0
            };

        function set_stat_summary(mean, standard_deviation) {
                stat_lines.show = true;
		stat_lines.mean = mean;
		stat_lines.standard_deviation = standard_deviation;
                plot.triggerRedrawOverlay(); 
        }

        plot.set_stat_summary = set_stat_summary;
	
	
	plot.hooks.drawOverlay.push(function (plot, ctx) {
            // draw selection
            if (stat_lines.show) {
                var plotOffset = plot.getPlotOffset();
                var o = plot.getOptions();
		var data = plot.getData();
                ctx.save();
                ctx.translate(plotOffset.left, plotOffset.top);

                var c = $.color.parse('#f00');

		    
                ctx.strokeStyle = c.scale('a', 0.8).toString();
                ctx.lineWidth = 1;
                ctx.lineJoin = "round";
                ctx.fillStyle = c.scale('a', 0.6).toString();

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
        name: 'stat_summary',
        version: '1.0'
    });
})(jQuery);
