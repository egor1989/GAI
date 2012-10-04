express = null

index = (req, res) ->
  res.render 'admin/index',
    title: "Manager panel"
 
module.exports = (app) ->
  express = app
  @index = index
  return @   