class WebhookController < ApplicationController
  def github
    push = JSON.parse(params[:payload])
    logger.debug "I got some JSON: #{push.inspect}"
  end
end
