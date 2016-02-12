$(document).on('ready', function () {

  var startDateTextBox = $('#start_date_picker');
  var endDateTextBox = $('#end_date_picker');

  if (startDateTextBox.length > 0 && endDateTextBox.length > 0) {
    $.timepicker.datetimeRange(
      startDateTextBox,
      endDateTextBox,
      {
        minInterval: (1000*60*30), // 15 min
        dateFormat: 'M dd yy',
        timeFormat: 'HH:mm',
        start: {}, // start picker options
        end: {} // end picker options
      }
    );
  }

  $('#submit_button').on('click', function () {
    $('#schedule_meeting_button').show();
    $.ajax({
      method: "POST",
      url: "/busy_times",
      data: { emails: getEmails().concat(getRoomEmails()), start_time: getStartTime(), end_time: getEndTime() }
    }).done(function( busy_times ) {
      process_busy_times(JSON.parse(busy_times));
    });
  });

  $('#schedule_meeting_button').on('click', function () {
    $.ajax({
      method: "POST",
      url: "/schedule_meeting",
      data: {
        subject: 'this is the subject',
        body: 'this is the body',
        start_time: getStartTime(),
        end_time: getEndTime(),
        emails: getEmails(),
        location: 'Some room'
      }
    }).done(function( message ) {
      console.log(message);
    });
  });

  function getEmails () {
    var emails = $('.emails').children().map(function(){
               return $.trim($(this).attr('data-email'));
            }).get();
    return emails;
  }

  function getRoomEmails () {
    var roomEmails = $('#rooms').children().map(function(){
               return $.trim($(this).attr('data-email'));
            }).get();
    return roomEmails;
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
