class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :token_authenticatable, :encryptable, :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable, :omniauthable

  # Setup accessible (or protected) attributes for your model
  attr_accessible :email, :password, :password_confirmation, :remember_me
  attr_accessible :name, :bg_img, :layout, :pomo
  attr_accessible :login, :image, :location, :github_url, :token

  has_many :tasks
  has_and_belongs_to_many :books

  scope :all_user, order('name')

  def bg_img_path
    AppConfig[:base_bg_path] + (self.bg_img == nil ? AppConfig[:default_bg_image] : self.bg_img)
  end

  def github_name
    self.name != nil ? self.name : self.login
  end

  def self.add_user(name)
    User.find_or_create_by_name(:name => name,
                :bg_img => AppConfig[:default_bg_image],
                :layout => AppConfig[:default_layout],
                :pomo => 0
               )
  end

  def self.by_name(name)
    user = nil
    (user = where(:name => name)).first != nil ? ser.first : nil
  end

  def self.exist?( name )
    where(:name => name).size != 0 ? true : false
  end

  def self.bg_img_by_name(name)
    AppConfig[:base_bg_path] + where(:name => name).first.bg_img
  end

  def self.set_bg_img(name, bg_img)
    by_name(name).update_attributes(:bg_img => bg_img)
  end

  def self.layout_by_name(name)
    where(:name => name).first.layout
  end

  def self.set_layout(name, layout)
    by_name(name).update_attributes(:layout => layout)
  end

  def self.inc_pomo(name)
    update_pomo = by_name(name).pomo + 1
    by_name(name).update_attributes(:pomo => update_pomo)
  end

  def self.find_for_github_oauth(access_token, signed_in_resource=nil)
    data = access_token.extra['raw_info']
    info = access_token.info

    # 大文字を含むユーザ名の場合、初回登録時は何故か nickname が小文字で来るが、
    # ログイン時はそのままなので一旦小文字にして比較する
    if user = User.where(:login => info['nickname'].downcase).first
      user
    else # Create a user with a stub password.
      User.create!(:login => info['nickname'],
                   :name => info['name'],
                   :email => info['email'],
                   :token => access_token['credentials']['token'],
                   :image => info['image'],
                   :github_url => info['urls']['GitHub'],
                   :password => Devise.friendly_token[0,20])
    end
  end

  def self.new_with_session(params, session)
    super.tap do |user|
      if data = session["devise.github_data"] && session["devise.github_data"]["extra"]["user_hash"]
        user.email    = data["email"]
        user.name     = data["name"]
        user.image    = data["image"]
        user.location = data["location"]
      end
    end
  end
end
