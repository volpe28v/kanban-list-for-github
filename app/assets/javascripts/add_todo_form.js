$(document).ready(function(){
  function addTodoWithPrefix( prefix, msg ){
    if ( msg == "" ){
      return;
    }

    var prefix_text = "";
    if ( prefix != "" ){
      prefix_text = "[" + prefix + "]";
    }

    addTodoAjax( prefix_text + " " + msg );
  }

  function addTodoAjax(msg) {
    if ( msg == "" ){ return; }
    $.ajax({
      type: "POST",
      cache: false,
      url: "tasks",
      data: {
        msg: escapeInvalidChar(msg)
      },
      dataType: "jsonp"
   });
  }

  function escapeInvalidChar(msg){
    var escaped_msg = msg.replace(/&/g,"");
    escaped_msg = escaped_msg.replace(/'/g,"\"");
    escaped_msg = escaped_msg.replace(/!/g,"|");
    return escaped_msg;
  }

  function addTodoAction(){
    addTodoAjax(sanitize($('#add_todo_form_msg').val()));
    $('#add_todo_form_msg').val('');
    $('#add_todo_form_msg').focus();

    $("#add_todo_form_msg").maxlength({
      'feedback' : '.task-chars-left-add-form'
    });
  }

  $("#add_todo_form_msg").maxlength({
    'feedback' : '.task-chars-left-add-form'
  });

  $("#add_todo_form").submit(function(){
    addTodoAction();
    return false;
  });

  $("#add_todo_button").click(function(){
    addTodoAction();
  });

  $("#sync_issues_button").click(function(){
    ajaxLoader.start(function(){
      $.ajax({
        type: "GET",
        cache: false,
        url: "tasks/sync_issues",
        dataType: "jsonp"
      });
    });
  });

  $("#show_detail_button").click(function(){
    $('.msg-detail').each(function(){
      if ($(this).text().length > 0){
        if ($(this).css('display') == 'none'){
          $(this).fadeIn('fast');
        }else{
          $(this).fadeOut('fast');
        }
      }
    });
  });

  filterTask("");
});
