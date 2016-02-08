# Load path
root_dir = File.expand_path('../../..', __FILE__)
app      = File.join(root_dir, 'app')
lib      = File.join(root_dir, 'lib')
$LOAD_PATH.unshift(app) unless $LOAD_PATH.include?(app)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)

# Load environment
require 'bundler'
Bundler.require(:default)
Dotenv.load
