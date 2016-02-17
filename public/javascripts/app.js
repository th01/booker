$(document).on('ready', function () {

  $("#dialog").dialog({
    autoOpen: false,
    modal: true,
    open: function(){
      $('.ui-widget-overlay').bind('click',function(){
        $('#dialog').dialog('close');
      });
    }
  });

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

  $('#add_button').on('click', function() {
    var email = $('#add_email').val();
    var name = email.replace(/\@.*$/, "").replace(/\./, ' ').replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
    var email_id = email.replace(/[\@\.]/g, "");
    var email_option = $('#attendees').append("<li data-email=" + email + " id='" + email_id + "' " + "'>" + name + "</li>");
  });

  $('#rooms').children().on('click', function () {
    if ($(this).attr('class').match(/selected-room/)) {
      $('#rooms').children().removeClass('selected-room');
    } else {
      $('#rooms').children().removeClass('selected-room');
      $(this).addClass('selected-room');
    }
  });

  $('#submit_button').on('click', function () {
    $('.green').removeClass('green');
    $('.red').removeClass('red');
    $('#add-subject-and-body-button').show();
    $.ajax({
      method: "POST",
      url: "/busy_times",
      data: { emails: getEmails().concat(getRoomEmails()), start_time: getStartTime(), end_time: getEndTime() }
    }).done(function( busy_times ) {
      processBusyTimes(JSON.parse(busy_times));
    });
  });

  $('#add-subject-and-body-button').on('click', function () {
    $('#dialog').dialog('open');
  });

  $('#schedule-meeting-button').on('click', function () {
    $('#dialog').dialog('close');
    $.ajax({
      method: "POST",
      url: "/schedule_meeting",
      data: {
        subject: getSubject(),
        body: getBody(),
        start_time: getStartTime(),
        end_time: getEndTime(),
        emails: getEmails(),
        location: 'Some room'
      }
    }).done(function( message ) {
      console.log(message);
    });
  });

  $('#add_email').autocomplete({
      source: emails
  });

  function getEmails () {
    var emails = $('.emails').children().children().map(function(){
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

  function getSubject () {
    return $('#subject').val();
  }

  function getBody () {
    return $('#body').val();
  }

  function processBusyTimes (busy_times) {
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
