DBfields = new Meteor.Collection('dbfield');
Positions = new Meteor.Collection('positions');
CodeTables = new Meteor.Collection('codeTable');
points = new Meteor.Collection('pointsCollection');

Meteor.methods({
  'removeAll' : function (value) {
    points.remove({});
  }
})

