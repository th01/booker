require_relative "spec_helper"
require_relative "../booker.rb"

def app
  Booker
end

describe Booker do
  it "responds with a welcome message" do
    get '/'

    last_response.body.must_include 'Welcome to the Sinatra Template!'
  end
end
