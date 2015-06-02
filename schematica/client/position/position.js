Template.position.events({
  'click .something': function (evt, tmpl) {
    var name = tmpl.find('.name').value;
  }
});
Template.position.firstvar = function() {
  return "First Var"
}