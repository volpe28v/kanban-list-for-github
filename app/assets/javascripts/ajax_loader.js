// AjaxLoader module
KanbanList.namespace('ajaxLoader');

KanbanList.ajaxLoader = (function(){
  // private
  var LoadingMsg = [
    "「Layout」メニューでタスクの表示方法を変更できます",
    "自動更新機能は多人数で使う場合に便利です",
    "自動更新機能は操作が無い場合に５秒間隔で最新の状態に更新します",
    "iPad でも使えます",
    "たまには壁紙を変えて気分転換しましょう！",
    "Doingにタスクが溜まってきたら危険信号",
    "やらないと決めてタスクを削除する勇気",
    '<i class="icon-picture"></i> で背景画像を設定できます',
    '<i class="icon-refresh"></i> で自動更新機能の ON/OFF ができます',
    'メニュー上の <img src="/assets/tomato.gif" /> をクリックするとポモドーロタイマーが使えます',
    'ポモドーロ・テクニックを使ってこまめに作業のふりかえりをしましょう',
    'ポモドーロ・テクニックは 25分のタイムボックスで区切って作業をします',
    '<i class="icon-book"></i> でリポジトリに初回アクセス時に issue を読み込みます',
    'GitHubで行った変更は「Sync Issues」ボタンで反映できます',
    'Done にした issue は GitHub で Close されます',
    '1行目は issue のタイトル、2行目以降は本文になります',
    'GitHubで追加したリポジトリは <i class="icon-book"></i> の「Sync Repositories」で取り込めます'
  ];

  function start(callback){
    var msg_no = Math.floor(Math.random() * LoadingMsg.length);
    $('#loading_msg').html(LoadingMsg[msg_no]);

    $('#task_list').fadeOut('fast', function(){
      $('#loader').fadeIn('fast', function(){
        if (callback) {
          callback();
        }
      });
    });
  }

  function stop(){
    $('#loader').fadeOut('fast',function(){
      $('#task_list').fadeIn('fast', function(){
        $('#add_todo_form_msg').focus();
      });
    });
  }

  return {
    // public
    start: start,
    stop: stop
  }
}());
