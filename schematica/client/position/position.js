Template.position.events ({
  'click .icon-tasks': function (evt, tmpl) {
    evt.stopPropagation();
    evt.preventDefault();
    // reset id as one being eddited.
    Session.set('editing_tablename',this._id);
  },
  'click .addfield':function(evt,tmpl){
      evt.preventDefault();
      evt.stopPropagation();
      // need compiling and edit code
    DBfields.insert({name:'New Field',tableid:this._id});
  },
  'click .close':function(evt,tmpl) {
      Positions.remove({_id:this._id});
  },
  'keyup .tablename':function(evt,tmpl){
    // input tablname and type evaluate if return key, then update name on template
    // then need to reset table null value
    evt.stopPropagation();
    evt.preventDefault();
    if(evt.which === 13){
      Positions.update(this._id,{$set:{name:tmpl.find('.tablename').value}});
      Session.set('editing_tablename',null);
    }
  }
});
Template.position.rendered = function () {
  $('.modal').draggable({
    handle:'.modal-header',
    stop:function(evt,ui){
      var left = ui.position.left;
      var top = ui.position.top;
      Positions.update($(this).attr('id'),{$set:{left:left + 'px',top:top + 'px'}});
    }
  })
};
Template.position.editing_tablename = function(){
  return Session.equals('editing_tablename',this._id)
};
Template.position.dbfields = function(){
  return DBfields.find({tableid:this._id});
}