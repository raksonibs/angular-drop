var codeTables = [{
  name: 'Test',
  left: '500px',
  top: '100px',
  desc: 'if y == x puts ten'
}]

Template.postsList.helpers({
  posts: codeTables
})

Template.postsList.events({
  'click .icon-lock':function(evt,tmpl){
    evt.stopPropagation();
    evt.preventDefault();
    Session.set('editing_field',this._id);
  },
  'keyup .efield':function(evt,tmpl){
    evt.stopPropagation();
    evt.preventDefault();
    var fieldname = tmpl.find('.efield').value;
    if(fieldname && evt.which == 13){
      DBfields.update(this._id,{$set:{name:fieldname}});
      Session.set('editing_field',null);
    }
  }
});