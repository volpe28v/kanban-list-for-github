# coding: utf-8
class ApplicationController < ActionController::Base
  include Jpmobile::ViewSelector
  protect_from_forgery

  before_filter :authenticate_user!
  before_filter :user_email

  class Helper
    include ::Singleton
    include ::ActionView::Helpers::SanitizeHelper
    extend ActionView::Helpers::SanitizeHelper::ClassMethods
  end

  private

  def helper
    return Helper.instance
  end

  def current_book
    if session[:book_id] != nil and session[:book_id] != 0
      current_user.books.find_by_id(session[:book_id])
    else
      nil
    end
  end

  def current_tasks
    current_book ? current_book.tasks : current_user.tasks
  end

  def user_email
    @user_email = current_user ? current_user.email : ""
  end

  def get_book_name
    current_book ? current_book.name : Book.default_name
  end

  def get_prefix
    current_book ? current_book.name : ""
  end

  def get_task_counts
    current_book ? current_book.tasks.all_counts : current_user.tasks.all_counts
  end

  def get_all_book_counts
    books_count_info_array
  end

  def all_count_info
    all_info = current_user.tasks.all_counts
    all_info['id'] = 0
    all_info['name'] = Book.default_name

    all_info
  end

  def books_count_info_array
    current_user.books.inject([]){|all_book_count_info, book|
      all_book_count_info << book.task_count_info
    }.sort{|a,b| b['active_task'] <=> a['active_task'] }
  end

  def get_tasks(filter_str = "", done_num = 10)
    target_tasks = current_tasks

    if filter_str.blank?
      get_unfiltered_tasks(target_tasks, done_num)
    else
      get_filtered_tasks(target_tasks, filter_str, done_num)
    end
  end

  def get_unfiltered_tasks(target_tasks, done_num = 10)
    tasks = {
      :todo_high_tasks => target_tasks.by_status(:todo_h),
      :todo_mid_tasks  => target_tasks.by_status(:todo_m),
      :todo_low_tasks  => target_tasks.by_status(:todo_l),
      :doing_tasks     => target_tasks.by_status(:doing),
      :waiting_tasks   => target_tasks.by_status(:waiting),
      :done_tasks      => target_tasks.done.limit(done_num),
    }
  end

  def get_filtered_tasks(target_tasks, filter_word, done_num = 10 )
    tasks = {
      :todo_high_tasks => target_tasks.by_status_and_filter(:todo_h,  filter_word),
      :todo_mid_tasks  => target_tasks.by_status_and_filter(:todo_m,  filter_word),
      :todo_low_tasks  => target_tasks.by_status_and_filter(:todo_l,  filter_word),
      :doing_tasks     => target_tasks.by_status_and_filter(:doing,   filter_word),
      :waiting_tasks   => target_tasks.by_status_and_filter(:waiting, filter_word),
      :done_tasks      => target_tasks.done_and_filter(filter_word).limit(done_num),
    }
  end

  def render_json_for_updateBookJson(filter_str = "", done_num)
    render :json => { task_list_html: get_task_list_html(filter_str, done_num),
                      book_name: get_book_name,
                      url: current_book.github_url,
                      prefix: get_prefix,
                      task_counts: get_task_counts,
                      all_books: get_all_book_counts },
           :callback => 'updateBookJson'
  end

  def get_task_list_html(filter_str, done_num)
    @tasks = get_tasks( filter_str, done_num )
    session[:layout] ||= 'default'
    render_to_string :partial => 'tasks/tasklist_' + session[:layout]
  end

  def sync_repos
    github_client = Octokit::Client.new(login: current_user.login, oauth_token: current_user.token)

    max_page = 10
    (1..max_page).each do |page|
      repos = github_client.repositories(nil, page: page)
      repos.each {|r|
        new_book = Book.where(repo_id: r.id).first
        if new_book == nil
          new_book = Book.create!(repo_id: r.id, name: r.full_name, github_url: r.html_url)
          if new_book.name == 'volpe28v/kanban-list-for-github' # for debug
            github_client.create_hook(
              new_book.name,
              'web',
              {
                url: 'http://kanban-list-for-github.herokuapp.com/webhook/github',
                content_type: 'json',
              },
              {
                events: ['issues'],
                active: true
              }
            )
          end
        end
        current_user.books << new_book unless current_user.books.exists?(repo_id: r.id)
      }
      break if repos.empty?
    end
  end

  def sync_issue_by_repo( github_client, repo_name, book_id )
    # get issues
    begin
      issues = github_client.list_issues(repo_name)
      issues += github_client.list_issues(repo_name, {state: "closed"})
      issues.each{|i|
        task = Task.find_or_create_by_book_id_and_issue_number(book_id, i.number)
        task.msg = i.title + "\n" + i.body
        task.book_id = book_id
        task.github_url = i.html_url
        if i.state == "closed"
          task.update_status(:done)
        elsif i.state == "open"
          if task.status_sym == :done
            task.update_status(:todo_m)
          end
        end
        task.save
      }
    rescue
    end
  end
end

