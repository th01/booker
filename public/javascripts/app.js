$(document).on('ready', function () {

  $( "#datepicker" ).datetimepicker();

  var startDateTextBox = $('#start_date_picker');
  var endDateTextBox = $('#end_date_picker');

  $.timepicker.datetimeRange(
    startDateTextBox,
    endDateTextBox,
    {
      minInterval: (1000*60*30), // 15 min
      dateFormat: 'dd M yy',
      timeFormat: 'HH:mm',
      start: {}, // start picker options
      end: {} // end picker options
    }
  );

  $('#submit_button').on('click', function () {
    $.ajax({
      method: "POST",
      url: "/busy_times",
      data: { emails: getEmails(), start_time: getStartTime(), end_time: getEndTime() }
    }).done(function( busy_times ) {
      process_busy_times(JSON.parse(busy_times));
    });
  });

  function getEmails () {
    var emails = $('.emails').children().map(function(){
               return $.trim($(this).text());
            }).get();
    return emails;
  }

  function getStartTime () {
    return startDateTextBox.val();
  }

  function getEndTime () {
    return endDateTextBox.val();
  }

  function process_busy_times (busy_times) {
    for (var email in busy_times) {
      var $email = $('#' + email.replace(/[\.\@]/g, ''));
      if (busy_times[email].length > 0) {
        $($email).addClass('red');
      } else {
        $($email).addClass('green');
      }
    }
  }
});
