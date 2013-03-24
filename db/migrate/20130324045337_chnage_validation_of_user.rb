class ChnageValidationOfUser < ActiveRecord::Migration
  def change
    change_column :users, :login, :string, :null => false
  end
end
