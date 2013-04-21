class WebhookController < ApplicationController
  skip_before_filter :authenticate_user!

  def github
    issue = params['issue']
    repository = params['repository']

    if book = Book.where(repo_id: repository['id']).first
      update_issue(book, issue)
    end

    render :nothing => true
  end

  private
  def update_issue( book, issue )
    task = Task.find_or_create_by_book_id_and_issue_number(book.id, issue['number'])
    task.msg = issue['title'] + "\n" + issue['body']
    task.book_id = book.id
    task.github_url = issue['html_url']
    if issue['state'] == "closed"
      task.update_status(:done)
    elsif issue['state'] == "open"
      if task.status_sym == :done
        task.update_status(:todo_m)
      end
    end

    task.save
  end
end
