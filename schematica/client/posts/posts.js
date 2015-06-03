var codeTables = [{
  name: 'Test',
  left: '500px',
  top: '100px',
  desc: 'if y == x puts ten',
  url: ''
}]

// {
//   name: "",
//   left: '1000px',
//   top: '200px',
//   desc: "image",
//   url: 'http://fc04.deviantart.net/fs71/i/2012/222/2/7/mountain_stock_1_by_solanaceae85-d5alag2.jpg'
// }]

Template.postsList.helpers({
  posts: codeTables
})

Template.postsList.editing_field_post = function(){
  return Session.equals('editing_field_post', 1)
};

Template.postsList.events({
  'click .can_change':function(evt,tmpl){
    console.log('fire event')
    // evt.stopPropagation();
    // evt.preventDefault();
    Session.set('editing_field_post',1);
  },
  'keyup .efield':function(evt,tmpl){
    evt.stopPropagation();
    evt.preventDefault();
    var fieldname = tmpl.find('.efield').value;
    if(fieldname && evt.which == 13){
      DBfields.update(this._id,{$set:{name:fieldname}});
      Session.set('editing_field_post',null);
    }
  }
});

// Template.postsList.editing_field_post = function(){
//   return Session.equals('editing_field_post', 1);
// };