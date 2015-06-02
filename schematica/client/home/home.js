Template.home.events({
  'click .something': function (evt, tmpl) {
    var name = tmpl.find('.name').value;
  }
});
// positions is a variable in home template, that returns all positions in collections.js
Template.home.positions = function() {
  return Positions.find();
}