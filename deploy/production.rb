set :domain,      "communa.network"
set :deploy_to,   "/var/www/html/communa-backend"
set :user, 'root'

role :web,        domain
role :app,        domain, :primary => true

set :webserver_user, "root"
set :branch, "dev"
