module TasksHelper
  def to_js_array(msg)
    msg = msg.gsub(/'/,"\"")
    msg = msg.gsub(/\r/,"")
    raw "[" + msg.split("\n").map{|ts| "'" + ts + "'" }.join(",") + "]"
  end

  def assignee_img(task)
    if task.name
      raw( image_tag( task.assignee_url, :class => "assignee-img", width: "16px", title: task.name, alt: task.name ) )
    end
  end

  def comment_count(task)
    if task.comments > 0
      link_to raw("<span class='label label-info'>#{task.comments}</span>"), task.github_url, target: "_blank"
    else
      link_to raw("<span class='label'>#{task.comments}</span>"), task.github_url, target: "_blank"
    end
  end
end
