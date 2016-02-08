require 'pry'
require 'viewpoint'

class Booker < Sinatra::Base

  set :public_folder => "public", :static => true
  #
  # use Rack::Auth::Basic, "Restricted Area" do |username, password|
  #   endpoint = 'https://webmail04.domainlocalhost.com/EWS/Exchange.asmx'
  #   client   = Viewpoint::EWSClient.new(endpoint, username, password)
  # end

  get "/" do
    erb :home
  end
end
