require 'pry'
require 'viewpoint'
require 'dotenv'

class Booker < Sinatra::Base

  enable :sessions
  set :public_folder => "public", :static => true

  helpers do
    def logged_in?
      !!(session[:username] && session[:password])
    end

    def login(username, password)
      session[:username] = username
      session[:password] = password
    end

    def logout
      session.delete(:username)
      session.delete(:password)
    end

    def client(username, password)
      endpoint = ENV.fetch('MS_EXCHANGE_SERVER_URL')
      client   = Viewpoint::EWSClient.new(endpoint, username, password)
    end

    def authorized?(username, password)
      !!client(username, password).folders
    rescue Viewpoint::EWS::Errors::UnauthorizedResponseError => e
      false
    end
  end

  get '/' do
    redirect to('/login') unless logged_in?
    erb :home
  end

  get '/login' do
    erb :login
  end

  post '/login' do
    username = params[:username]
    password = params[:password]
    if authorized?(username, password)
      login(username, password)
      redirect to('/')
    else
      logout
      redirect to('/login')
    end
  end

  get '/logout' do
    logout
    erb :logout
  end
end
