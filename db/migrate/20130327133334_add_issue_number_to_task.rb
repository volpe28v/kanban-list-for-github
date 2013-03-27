class AddIssueNumberToTask < ActiveRecord::Migration
  def change
    add_column :tasks, :issue_number, :integer
  end
end
