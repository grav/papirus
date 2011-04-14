require 'uri'
task :bookmarklet do
  s = IO.read("bookmarklet.js")
  s.gsub!(/\/\*\*.*\*\//m,"")
  s.delete!("\n")
  url = "javascript:"+(URI.escape s)
  html = "<html><p><a href=\"#{url}\">Papirus</a> &lt;-- drag to bookmark Bar</p>  <p><textarea>#{url}</textarea></p></html>"

  File.open("papirus.html","w") { |f| f << html}

end
