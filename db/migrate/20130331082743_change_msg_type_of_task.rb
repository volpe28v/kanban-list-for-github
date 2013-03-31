class ChangeMsgTypeOfTask < ActiveRecord::Migration
  def change
    change_column :tasks, :msg, :text, :limit => 1000
  end
end
