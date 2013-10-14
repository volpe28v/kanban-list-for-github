source 'https://rubygems.org'

ruby '2.0.0'

gem 'rails', '3.2.13'

# Bundle edge Rails instead:
# gem 'rails',     :git => 'git://github.com/rails/rails.git'

# Gems used only for assets and not required
# in production environments by default.
group :assets do
  gem 'sass-rails',   "~> 3.2.3"
  gem 'coffee-rails', "~> 3.2.1"
  gem 'uglifier', '>= 1.0.3'
end

gem 'jquery-rails', '~> 2.1.4'
gem 'jquery_mobile_rails', '~> 1.1.0'
gem 'twitter-bootstrap-rails'

gem 'will_paginate'
gem 'devise',"2.2.3"
gem 'omniauth-github'
gem 'octokit'
gem 'rails_autolink'
gem 'rake'

#TODO: モバイルサイトは一旦非サポート
#gem 'jpmobile'
#gem 'jpmobile-terminfo'

group :development, :test do
  gem 'sqlite3'
  gem 'rspec'
  gem 'rspec-rails'
  gem 'growl'
  gem 'guard-rspec'
  gem 'factory_girl'
  gem 'factory_girl_rails'
  gem 'quiet_assets'
end

group :production do
  gem 'pg'
end

# Use unicorn as the web server
# gem 'unicorn'

# Deploy with Capistrano
# gem 'capistrano'

# To use debugger
# gem 'ruby-debug19', :require => 'ruby-debug'

group :test do
  gem 'turn', :require => false
end
