require 'pry'
require 'viewpoint'
require 'dotenv'

class Booker < Sinatra::Base

  set :public_folder => "public", :static => true

  use Rack::Auth::Basic, "Restricted Area" do |username, password|
    endpoint = ENV.fetch('MS_EXCHANGE_SERVER_URL')
    client   = Viewpoint::EWSClient.new(endpoint, username, password)
    begin
      !!client.folders
    rescue Viewpoint::EWS::Errors::UnauthorizedResponseError => e
      false
    end
  end

  get "/" do
    erb :home
  end
end
