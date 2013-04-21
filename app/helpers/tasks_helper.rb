module TasksHelper
  def to_js_array(msg)
    msg = msg.gsub(/'/,"\"")
    msg = msg.gsub(/\r/,"")
    raw "[" + msg.split("\n").map{|ts| "'" + ts + "'" }.join(",") + "]"
  end

  def assignee_img(task)
    if task.name
      raw( image_tag( task.assignee_url, width: "16px", title: task.name, alt: task.name ) )
    end
  end
end
