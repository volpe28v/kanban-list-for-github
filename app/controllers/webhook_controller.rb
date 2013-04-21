class WebhookController < ApplicationController
  skip_before_filter :authenticate_user!

  def github
    repository = JSON.parse(params[:repository])
    issue = JSON.parse(params[:issue])

    if book = Book.where(repo_id: repository.id).first
      update_issue(book, issue)
    end
  end
end
