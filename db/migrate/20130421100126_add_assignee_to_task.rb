class AddAssigneeToTask < ActiveRecord::Migration
  def change
    add_column :tasks, :assignee_url, :string
  end
end
