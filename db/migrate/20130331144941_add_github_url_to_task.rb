class AddGithubUrlToTask < ActiveRecord::Migration
  def change
    add_column :tasks, :github_url, :string
  end
end
