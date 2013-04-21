class AddCommentsToTask < ActiveRecord::Migration
  def change
    add_column :tasks, :comments, :integer
  end
end
