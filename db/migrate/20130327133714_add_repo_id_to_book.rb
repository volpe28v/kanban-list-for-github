class AddRepoIdToBook < ActiveRecord::Migration
  def change
    add_column :books, :repo_id, :integer
  end
end
