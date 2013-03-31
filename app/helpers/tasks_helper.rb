module TasksHelper
  def to_js_array(msg)
    msg = msg.gsub(/'/,"\"")
    msg = msg.gsub(/\r/,"")
    raw "[" + msg.split("\n").map{|ts| "'" + ts + "'" }.join(",") + "]"
  end
end
