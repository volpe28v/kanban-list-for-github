# coding: utf-8
class TasksController < ApplicationController
  def index
    session[:book_id] = params[:book_id] if params[:book_id] != nil

    if request.smart_phone?
      @user_name = current_user.name
      @counts = get_task_counts
      @book_name = get_book_name
      @current_book_id = current_book ? current_book.id : 0
      @prefix = get_prefix
      @recent_done_num = 10
      @books = current_user.books
      @tasks = get_tasks( "", @recent_done_num )
    end
  end

  def create
    task = Task.new(:msg => params[:msg],
                    :name => current_user.name,
                    :user => current_user)
    task.update_status(:todo_m)
    task.book = current_book
    task.save
    task.create_github

    move_id = is_moved_from_book?(task) ? task.id : 0 #delete
    task_html = render_to_string :partial => 'task', :locals => {:task => task, :display => "none" }

    render :json => { id: task.id,
                      li_html: task_html,
                      move_task_id: move_id,
                      task_counts: get_task_counts,
                      all_books: get_all_book_counts },
           :callback => 'addTodoResponse'
  end

  def update
    task = Task.find(params[:id])
    task.update_status(params[:status]) if params[:status] != ""
    task.msg = params[:msg]
    task.save
    task.update_github

    move_id = is_moved_from_book?(task) ? task.id : 0  #delete

    do_hooks(task)
    render :json => { task_counts: get_task_counts,
                      move_task_id: move_id,
                      all_books: get_all_book_counts },
           :callback => 'updateTaskJson'
  end

  def destroy
    task = Task.find(params[:id])
    task.delete
    task.close_github

    render :json => { task_counts: get_task_counts,
                      move_task_id: 0,
                      all_books: get_all_book_counts },
           :callback => 'updateTaskJson'
  end

  def update_order
    if params[:id] == nil
      render :text => "update_order noop"
      return
    end

    # 並び順の変更はタイムスタンプを更新したくない
    Task.record_timestamps = false
    params[:id].each_with_index do |task_id,i|
      target_task = Task.find(task_id)
      target_task.update_attribute(:order_no, i)
    end
    Task.record_timestamps = true

    render :text => "update_order ok"
  end

  def filter_or_update
    set_layout(params[:layout])
    if current_user.books.size == 0
      sync_repos
      current_user.reload
      session[:book_id] = current_user.books.first
    end

    render_json_for_updateBookJson(params[:filter], 15)
  end

  def silent_update
    @user_name = current_user.name
    @recent_done_num = 15

    render :json => { task_list_html: get_task_list_html(params[:filter], @recent_done_num),
                      task_counts: get_task_counts,
                      all_books: get_all_book_counts },
           :callback => 'updateSilentJson'
  end

  def sync_issues
    @user_name = current_user.name
    @recent_done_num = 15

    github_client = Octokit::Client.new(login: current_user.login, oauth_token: current_user.token)
    sync_issue_by_repo( github_client, current_book.name, current_book.id )

    render_json_for_updateBookJson(params[:filter], 15)
  end

  def sync_issue_by_repo( github_client, repo_name, book_id )
    # get issues
    begin
      issues = github_client.list_issues(repo_name)
      issues += github_client.list_issues(repo_name, {state: "closed"})
      issues.each{|i|
        task = Task.find_or_create_by_user_id_and_book_id_and_issue_number(current_user.id, book_id, i.number)
        task.msg = i.title + "\n" + i.body
        task.book_id = book_id
        task.github_url = i.html_url
        if i.state == "closed"
          task.update_status(:done)
        elsif task.status == nil
          task.update_status(:todo_m)
        end

        task.save
      }
    rescue
    end
  end

  def sync_repos
    github_client = Octokit::Client.new(login: current_user.login, oauth_token: current_user.token)

    repos = github_client.repositories()
    repos.each {|r|
      current_user.books.where(repo_id: r.id, name: r.full_name, github_url: r.html_url).first_or_create!
    }
  end

  def donelist
    @tasks = current_tasks.done
    if params[:year].blank? == false
      select_month = Time.new( params[:year], params[:month])
      @tasks = @tasks.select_month(select_month)
    end
    @tasks = @tasks.paginate(:page => params[:page], :per_page => 100)

    @month_list = current_tasks.done_month_list
    @month_done_list = current_tasks.done_month_list.sort{|a,b| a[:date] <=> b[:date] }
  end

  def send_mail
    mail_addr    = params[:mail_addr]
    mail_comment = params[:comment]

    TaskMailer.all_tasks(current_user,
                         current_book,
                         mail_addr,
                         mail_comment,
                         get_tasks("", @recent_done_num)
                        ).deliver
    render :json => { addr: mail_addr }, :callback => 'showMailResult'
  end

  private

  def do_hooks(task)
    case task.status_sym
    when :done
      hook_name = "#{Rails.root}/hooks/update_task_#{current_user.email}"
      command = "source #{hook_name} \"DONE\" \"#{helper.strip_tags task.msg}\""
      system(command) if File.exist?(hook_name)
    end
  end

  def is_moved_from_book?(task)
    (current_book != nil) and (current_book.id != (task.book ? task.book.id : 0 ))
  end

  def set_layout(layout_name)
    session[:layout] = layout_name if layout_name
  end
end
