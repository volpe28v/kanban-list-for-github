class CreateBookUser < ActiveRecord::Migration
  def up
    create_table :books_users, :id => false do |t|
      t.references :book
      t.references :user
    end
  end

  def down
    drop_table :books_users
  end
end
