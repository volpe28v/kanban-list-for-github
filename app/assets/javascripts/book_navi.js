// BookNavi
KanbanList.namespace('bookNavi');

KanbanList.bookNavi = (function(){
  var autoLoadingTimer = KanbanList.autoLoadingTimer;
  var ajaxLoader = KanbanList.ajaxLoader;

  // private
  function newBookAction(book_name){
    autoLoadingTimer.stop();
    var filter = $('#filter_str').get(0).value;

    ajaxLoader.start(function(){
      $.ajax({
         type: "POST",
         cache: false,
         url: "books",
         data: {
          filter: filter,
          book_name: book_name
         },
         dataType: "jsonp"
      });
    });
  }

  function selectBookAction(book_id){
    autoLoadingTimer.stop();
    var filter = $('#filter_str').get(0).value;

    ajaxLoader.start(function(){
      $.ajax({
        type: "GET",
        cache: false,
        url: "books/" + book_id,
        data: {
          filter: filter
        },
        dataType: "jsonp"
      });
    });
  }

  function setAction(){
    initNewBookAction();
    initRemoveBookAction();

    $('.book_item a').click(function(){
      var book_id = $(this).data('book_id');
      selectBookAction( book_id );
    });
  }

  function initNewBookAction(){
    $('#sync_repos').click(function(){
      ajaxLoader.start(function(){
        $.ajax({
          type: "GET",
          cache: false,
          url: "books/sync",
          dataType: "jsonp"
        });
      });
    });
  }

  function initRemoveBookAction(){
    $('#remove_book').click(function(){
      $('#remove_book_in').modal('show');
    });
  }

  function init(){
    var new_book_action = function(){
      var name = $('#book_name').val();
      if ( name != "" ){
        newBookAction(name);
        $('#book_in').modal('hide')
      }
    };

    $('#book_form').submit(function(){
      new_book_action();
      return false;
    });

    $('#new_book_button').click(function(){
      new_book_action();
    });

    $('#remove_book_button').click(function(){
      autoLoadingTimer.stop();
      $('#remove_book_in').modal('hide');

      var dummy_id = 0
      var filter = $('#filter_str').get(0).value;
      ajaxLoader.start(function(){
        $.ajax({
          type: "DELETE",
          cache: false,
          url: "books/" + dummy_id,
          data: {
            filter: filter
          },
          dataType: "jsonp"
        });
      });
    });

    $('#remove_book_cancel_button').click(function(){
      $('#remove_book_in').modal('hide');
    });

    // Cancel other click event handler
    $(document).on('click', '#search-books', function() {
      return false;
    });

    // Seach book
    $(document).on('keyup', '#search-books', function() {
      var text = $(this).val();

      if (!text) {
        $('#book_list .book_item').show();
        return;
      }

      var query = new RegExp(text, 'i');

      $('#book_list .book_item').each(function() {
        var book_name = $(this).data('book_name');
        if (query.test(book_name)) {
          $(this).show();
        } else {
          $(this).hide();
        }
      });
    });
  }

  function updateByJson( book_infos ){
    if ( book_infos == null ){ return; }
    var header = '<li><a id="sync_repos" href="#"><i class="icon-refresh"></i> Sync Repositories</a></li>' +
               '<li><a id="remove_book" href="#"><i class="icon-trash"></i> Remove Current Repository</a></li>' +
               '<li class="divider"></li>';

    var lists = '';

    lists += '<li><a><input id="search-books" class="search-query span3" placeholder="Search..."/></a></li>';

    for(var i = 0; i < book_infos.length; i++ ){
      var active_todo_counts = book_infos[i].todo_h + book_infos[i].todo_m + book_infos[i].todo_l + book_infos[i].doing + book_infos[i].waiting;
      lists += '<li class="book_item" data-book_name="' + book_infos[i].name + '">' +
                 '<a href="#" data-book_id="' + book_infos[i].id + '">' +
                   '<table width="100%">' +
                     '<tr>' +
                       '<td style="text-align: left">' + book_infos[i].name + '</td>' +
                       '<td style="text-align: right">' +
                         '<table style="float: right" class="book-counts">' +
                           '<tr>' +
                             '<td><div class="counts-active" >' + active_todo_counts   + '</div></td>' +
                             '<td><div class="counts todo_h ' + (book_infos[i].todo_h == 0 ? 'zero' : '') + '" >' + book_infos[i].todo_h + '</div></td>' +
                             '<td><div class="counts todo ' + (book_infos[i].todo_m == 0 ? 'zero' : '') + '"   >' + book_infos[i].todo_m + '</div></td>' +
                             '<td><div class="counts todo_l ' + (book_infos[i].todo_l == 0 ? 'zero' : '') + '" >' + book_infos[i].todo_l + '</div></td>' +
                             '<td><div class="counts doing ' + (book_infos[i].doing == 0 ? 'zero' : '') + '"  >' + book_infos[i].doing  + '</div></td>' +
                             '<td><div class="counts waiting ' + (book_infos[i].waiting == 0 ? 'zero' : '') + '">' + book_infos[i].waiting + '</div></td>' +
                             '<td><div class="counts done ' + (book_infos[i].done == 0 ? 'zero' : '') + '"   >' + book_infos[i].done    + '</div></td>' +
                           '</tr>' +
                         '</table>' +
                       '</td>' +
                     '</tr>' +
                   '</table>' +
                 '</a>' +
               '</li>';
    }

    $('#book_list').empty();
    $('#book_list').append(header + lists);

    setAction();
  }

  return {
    // public
    init: init,
    updateByJson: updateByJson
  }
}());
