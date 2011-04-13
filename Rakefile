require 'uri'
task :bookmarklet do
  s = IO.read("bookmarklet.js")
  s.gsub!(/\/\*\*.*\*\//m,"")
  s.delete!("\n")
  puts "javascript:"+(URI.escape s)
end
