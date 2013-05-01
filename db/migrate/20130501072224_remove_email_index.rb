class RemoveEmailIndex < ActiveRecord::Migration
  def up
    remove_index :users, :column => 'email'
    change_column :users, :email, :string, :null => true
  end

  def down
  end
end
