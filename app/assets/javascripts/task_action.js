KanbanList.namespace('taskAction');
KanbanList.taskAction = (function(){
  var draggableTask = KanbanList.draggableTask;
  var autoLoadingTimer = KanbanList.autoLoadingTimer;
  var utility = KanbanList.utility;
  var pomodoroTimer = KanbanList.pomodoroTimer;

  function display_filter(text){
    // for sanitize
    var filtered_text = sanitize(text);

    // for url
    filtered_text = filtered_text.replace(/((https?|ftp)(:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+))/g,
      function(){
        var matched_link = arguments[1];
        if ( matched_link.match(/(\.jpg|\.gif|\.png|\.bmp)$/)){
          return '<img src="' + matched_link + '"/>';
        }else{
          return '<a href="' + matched_link + '" target="_blank" >' + matched_link + '</a>';
        }
      });

    // for new line
    filtered_text = filtered_text.replace(/\n+$/g,'');
    filtered_text = filtered_text.replace(/\n/g,'<br>');
    return filtered_text;
  }

  function moveToDone(move_id) {
    var to_status = "done";
    var id = move_id.slice(4);
    var msg = $("#ms_" + id + "_edit" ).val();
    var msg_title = msg.split("\n")[0];
    $("#fixed_msg_" + id ).html(display_filter(msg_title));

    $("#edit_link_ms_" + id ).css("display","none");
    $("#edit_form_ms_" + id ).css("display","none");
    $("#fixed_" + id ).css("display","block");

    $(move_id).fadeOut("normal",function(){ $(move_id).prependTo($("#" + to_status)); });
    $(move_id).fadeIn("normal");

    $('#viewSortlist').html("moveToDone " + move_id);

    //TODO: グローバルのメソッドを呼んでいるので修正する
    sendCurrentTodo(id, to_status, msg);
    pomodoroTimer.addDone();
  }

  function returnToTodo(ret_id){
    var to_status = "todo_m";
    var id = ret_id.slice(4);

    $("#edit_link_ms_" + id ).css("display","block");
    $("#edit_form_ms_" + id ).css("display","none");
    $("#fixed_" + id ).css("display","none");

    $(ret_id).fadeOut("normal",function(){ $(ret_id).prependTo($("#" + to_status)); });
    $(ret_id).fadeIn("normal");

    $('#viewSortlist').html("returnToTodo " + ret_id);

    var msg = $("#ms_" + id + "_edit" ).val();
    //TODO: グローバルのメソッドを呼んでいるので修正する
    sendCurrentTodo(id, to_status, msg);
  }

  function deleteTodo( delete_id ) {
    var msg_id = '#msg_' + delete_id.slice(4);
    $('#delete_task_string').html($(msg_id).html());
    $('#delete_task_in').modal('show');

    $('#delete_task_ok_button').click(function(){
      var id = delete_id.slice(4);
      $.ajax({
        type: "DELETE",
        cache: false,
        url: "tasks/" + id,
        dataType: "jsonp"
      });

      $('#delete_task_in').modal('hide')
      $(delete_id).fadeOut("normal",function(){ $(delete_id).remove(); });
      $('#delete_task_ok_button').unbind("click");
      $('#delete_task_cancel_button').unbind("click");
    });

    $('#delete_task_cancel_button').click(function(){
      $('#delete_task_in').modal('hide')
      $('#delete_task_ok_button').unbind("click");
      $('#delete_task_cancel_button').unbind("click");
    });
  }

  function updateToDoMsg(id) {
    var $from = $('#ms_' + id + '_edit')
       ,$to = $('#msg_' + id )
       ,$detail = $('#msg_detail_' + id )
       ,msg = sanitize($from.val()).replace(/'/g,"\"")
       ,msg_array = msg.split("\n")
       ,msg_title = msg_array[0]
       ,msg_detail = msg_array.length > 1 ? msg_array.slice(1).join('\n') : "" ;

    $from.val(msg);
    $to.html(display_filter(msg_title));
    $detail.html(display_filter(msg_detail));

    var status = $("#id_" + id).parent().get(0).id;
    //TODO: グローバルのメソッドを呼んでいるので修正する
    sendCurrentTodo(id, status, msg);
  }

  function autofit(el){
    if(el.scrollHeight > el.offsetHeight){
      el.style.height = el.scrollHeight + 'px';
    } else {
      while (el.scrollHeight - 50 < parseInt(el.style.height)){
        el.style.height = parseInt(el.style.height) - 50 + 'px';
      }
      arguments.callee(el);
    }
  }

  var edit_before_msg = {};
  function realize_task(id, msg_array){
    var msg_title = msg_array[0]
       ,msg_detail = msg_array.length > 1 ? msg_array.slice(1).join('\n') : ""
       ,msg = msg_array.join('\n');

    $('#ms_' + id + '_edit').val(msg);
    $('#msg_' + id ).html(display_filter(msg_title));
    $('#msg_detail_' + id ).html(display_filter(msg_detail));
    $('#fixed_msg_' + id ).html(display_filter(msg_title));

    $('#ms_' + id + '_edit').maxlength({
      'feedback' : '.task-chars-left'
    });

    $('#check_done_' + id).iCheck({
      checkboxClass: 'icheckbox_minimal-grey'
    });

    $('#check_done_' + id).on('ifClicked', function(){
      moveToDone('#id_' + id);
      $('#check_return_' + id).iCheck('check');
      return false;
    });

    $('#check_return_' + id).iCheck({
      checkboxClass: 'icheckbox_minimal-grey'
    });

    $('#check_return_' + id).on('ifClicked', function(){
      returnToTodo('#id_' + id);
      $('#check_done_' + id).iCheck('uncheck');
      return false;
    });

    $('#delete_button_' + id ).click(function(){
      deleteTodo('#id_' + id );
      return false;
    });

    $('#fixed_delete_button_' + id ).click(function(){
      deleteTodo('#id_' + id );
      return false;
    });

    var edit_mode = false;
    function goToEditMode(id){
      autoLoadingTimer.stop();
      draggableTask.stopByElem($('#id_' + id ).parent());

      edit_before_msg[id] = $('#ms_' + id + '_edit').val();

      utility.toggleDisplay('edit_link_ms_' + id ,'edit_form_ms_' + id );
      $('#ms_' + id + '_edit').get(0).focus();
      autofit($('#ms_' + id + '_edit').get(0));
      edit_mode = true;

      return false;
    }

    $('#edit_button_' + id ).click(function(){
      return goToEditMode(id);
    });

    $('#id_' + id ).dblclick(function(){
      return goToEditMode(id);
    });

    $('#ms_' + id + '_edit').on('keyup', function(){
      if (!edit_mode){
        return true;
      }
      autofit($(this).get(0));
      return true;
    });

    $('#edit_form_' + id ).on('keydown', function(event){
      if( event.ctrlKey === true && event.which === 13 ){
        $(this).submit();
        return false;
      }
      return true;
    });

    $('#edit_form_' + id ).submit(function(){
      autoLoadingTimer.start();
      draggableTask.startByElem($('#id_' + id ).parent());
      updateToDoMsg(id);
      utility.toggleDisplay('edit_form_ms_' + id ,'edit_link_ms_' + id );
      edit_mode = false;
      return false;
    });

    $('#edit_cancel_' + id ).click(function(){
      autoLoadingTimer.start();
      draggableTask.startByElem($('#id_' + id ).parent());

      $('#ms_' + id + '_edit').val(edit_before_msg[id]);
      utility.toggleDisplay('edit_form_ms_' + id ,'edit_link_ms_' + id );
      return false;
    });
  }

  return {
    realize: realize_task,
    display_filter: display_filter
  }
}());
