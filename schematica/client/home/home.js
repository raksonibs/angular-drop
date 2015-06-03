Template.home.events ({
  'dblclick .schema': function (evt, tmpl) {
    evt.preventDefault();
    evt.stopPropagation();
    if(evt.target.className === 'container-fluid schema'){
      // instert atalbe at some thing
      var id = Positions.insert({name:'New Table',left:(evt.pageX + 280) + 'px',top:(evt.pageY) + 'px'});
      //  set session variable to be editable with that id. It is a global variable, table ebeing edited at this id. ?
      Session.set('editing_table',id);
    }
  }
});

Template.home.codeTable = function () {
  return CodeTables.find()
}

Template.home.positions = function () {
  return Positions.find();
}