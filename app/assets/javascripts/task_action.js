KanbanList.namespace('taskAction');
KanbanList.taskAction = (function(){
  var draggableTask = KanbanList.draggableTask;
  var autoLoadingTimer = KanbanList.autoLoadingTimer;
  var utility = KanbanList.utility;
  var pomodoroTimer = KanbanList.pomodoroTimer;
  var MIN_HEIGHT = 100;

  function display_filter(text){
    return $.decora.to_html(text);
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

  function updateToDoMsg(id) {
    var $from = $('#ms_' + id + '_edit')
       ,$to = $('#msg_' + id )
       ,$detail = $('#msg_detail_' + id )
       ,msg = sanitize($from.val()).replace(/'/g,"\"")
       ,msg_array = msg.split("\n")
       ,msg_title = msg_array[0]
       ,msg_detail = msg_array.length > 1 ? msg_array.slice(1).join('\n') : "" ;

    $from.val(msg);
    $to.html(display_filter(msg_title) + (msg_detail.length == 0 ? '' : ' <span class="issue-detail-mark">...</span>'));
    $detail.html(display_filter(msg_detail));

    var status = $("#id_" + id).parent().get(0).id;
    //TODO: グローバルのメソッドを呼んでいるので修正する
    sendCurrentTodo(id, status, msg);
  }

  var edit_before_msg = {};
  function realize_task(id, msg_array){
    var msg_title = msg_array[0]
       ,msg_detail = msg_array.length > 1 ? msg_array.slice(1).join('\n') : ""
       ,msg = msg_array.join('\n');

    $('#ms_' + id + '_edit').val(msg);
    $('#msg_' + id ).html(display_filter(msg_title) + (msg_detail.length == 0 ? '' : ' <span class="issue-detail-mark">...</span>'));
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

    $('#ms_' + id + '_edit').autofit({min_height: MIN_HEIGHT});

    function goToEditMode(id){
      autoLoadingTimer.stop();
      draggableTask.stopByElem($('#id_' + id ).parent());

      edit_before_msg[id] = $('#ms_' + id + '_edit').val();

      utility.toggleDisplay('edit_link_ms_' + id ,'edit_form_ms_' + id );
      $('#ms_' + id + '_edit').get(0).focus();
      $('#ms_' + id + '_edit').keyup(); //call autofit

      return false;
    }

    $('#edit_button_' + id ).click(function(){
      return goToEditMode(id);
    });

    // クリックでタスク詳細を表示する
    var isMouseMove = false;
    var isJustShowDetail = false;
    $('#id_' + id ).mousedown(function(){
      isMouseMove = false;
    });
    $('#id_' + id ).mousemove(function(){
      isMouseMove = true;
    });
    $('#id_' + id ).click(function(){
      if (isMouseMove){ return; } // ドラッグ＆ドロップ後はタスク詳細を表示しない

      var $detail = $('#msg_detail_' + id );
      if ($detail.text().length <= 0){ return; }

      var $msg_detail = $(this).find('.msg-detail');
      if ($msg_detail.css('display') == 'none'){
        $msg_detail.fadeIn('fast');
        isJustShowDetail = true;
      }else{
        if (isJustShowDetail){
          $msg_detail.fadeOut('fast');
          isJustShowDetail = false;
        }
      }
    });
    $('#id_' + id ).hover(
      function(){},
      function(){
        if (isJustShowDetail){
          $(this).find('.msg-detail').fadeOut('fast');
          isJustShowDetail = false;
        }
      }
    );

    // ダブルクリックで編集モードへ
    $('#id_' + id ).dblclick(function(){
      return goToEditMode(id);
    });

    // チェックボックスイベント処理
    $('#id_' + id ).find('.taskBody').decora({ checkbox_callback: function(that, updateCheckboxStatus){
      $('#ms_' + id + '_edit').val(updateCheckboxStatus($('#ms_' + id + '_edit').val()));
      updateToDoMsg(id);
    }});

    // Ctrl - Enter で編集確定
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
