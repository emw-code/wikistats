// Establishes behavior of the 'To' and 'From' input fields, using jQueryUI's "Datepicker" widget
$(function() {
	today = new Date()
	
	$('#from').val("12/10/2007");
	$('#to').val((today.getUTCMonth() + 1) + "/" + (today.getUTCDate() - 1 ) + "/" + today.getUTCFullYear());
	
	//$('#to').val("04/30/2010");
	var dates = $('#from, #to').datepicker({
		minDate: new Date(2007, 11, 10),
		maxDate: 0,
		changeMonth: true,
		changeYear: true,
		numberOfMonths: 3,
		onSelect: function(selectedDate) {
			minDate = new Date(2007, 11, 10);
			var option = this.id == "from" ? minDate : 1;
			var instance = $(this).data("datepicker");
			var date = $.datepicker.parseDate(instance.settings.dateFormat || $.datepicker._defaults.dateFormat, selectedDate, instance.settings);
			dates.not(this).datepicker("option", option, date);
		}
	});
});