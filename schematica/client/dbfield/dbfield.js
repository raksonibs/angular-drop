Template.dbfield.events({
  'click .something': function (evt, tmpl) {
    var name = tmpl.find('.name').value;
  }
});
Template.dbfield.firstvar = function() {
  return "First Var"
}