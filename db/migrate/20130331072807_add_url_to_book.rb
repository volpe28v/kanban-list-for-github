class AddUrlToBook < ActiveRecord::Migration
  def change
    add_column :books, :github_url, :string
  end
end
