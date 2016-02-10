require 'pry'
require 'viewpoint'
require 'dotenv'
require 'time'
require 'icalendar'
require 'digest/sha1'

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

    def client(username=session[:username], password=session[:password])
      endpoint = ENV.fetch('MS_EXCHANGE_SERVER_URL')
      Viewpoint::EWSClient.new(endpoint, username, password)
    end

    def authorized?(username, password)
      username.sub!(/^(\w)\w*\.(\w*@.*)$/, '\1\2')
      !!client(username, password).folders
    rescue Viewpoint::EWS::Errors::UnauthorizedResponseError => e
      false
    end

    def busy_times(emails, start_time, end_time)
      response = client.get_user_availability(
        emails,
        start_time:     start_time,
        end_time:       end_time,
        requested_view: :free_busy
      )
      hash = {}
      response.envelope[1][:body][:elems][0][:get_user_availability_response][:elems][0][:free_busy_response_array][:elems].each_with_index { |d, i| hash[emails[i]] = (d[:free_busy_response][:elems][1][:free_busy_view][:elems][1][:calendar_event_array][:elems].map { |e| e[:calendar_event][:elems] }.map { |f| { start_time: Time.parse(f[0][:start_time][:text]), end_time: Time.parse(f[1][:end_time][:text]) } unless f[2][:busy_type][:text] == 'Free' }.compact rescue []) }
      hash
    end

    def build_ics(opts)
      cal = Icalendar::Calendar.new
      ics_str = cal.event do |e|

        e.dtstart     = Icalendar::Values::DateTime.new(Time.now)
        e.dtend       = Icalendar::Values::DateTime.new(Time.now + 10000)
        e.summary     = "Meeting with the man."
        e.description = "Have a long lunch meeting and decide nothing..."
        e.ip_class    = "PRIVATE"
      end.to_ical
      ics_sha = Digest::SHA1.hexdigest(ics_str)
      File.open("./ics/#{ics_sha}.ics", 'w') { |file| file.write(ics_str) }
    end

    def create_meeting

    end
  end

  get '/' do
    redirect to('/login') unless logged_in?

    opts = {
      subject: 'THIS IS A TEST',
      start_time: Time.now,
      end_time: Time.now + 10000,
      emails: ['thooper@peopleadmin.com', 'travis.hooper@peopleadmin.com'],
      location: 'Austin'

    }
    ics = build_ics(opts)


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

  post '/busy_times' do
    emails     = params[:emails]
    start_time = Time.parse(params[:start_time])
    end_time   = Time.parse(params[:end_time])
    busy_times(emails, start_time, end_time).to_json
  end
end
