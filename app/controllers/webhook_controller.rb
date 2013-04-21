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
end
