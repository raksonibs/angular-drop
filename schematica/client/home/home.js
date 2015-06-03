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

function Canvas() {
  var self = this;
  var svg;

  // Creates the SVG canvas.
  var createSvg = function() {
    svg = d3.select('#canvas').append('svg')
      .attr('width', '100%')
      .attr('height', '100%');
  };
  createSvg();

  // Clears the SVG canvas.
  self.clear = function() {
    d3.select('svg').remove();
    createSvg();
  };

  // Naively draws an array of simple point objects.
  self.draw = function(data) {
    if (data.length < 1) {
      self.clear();
      return;
    }
    if (svg) {
      // This is what actually does the drawing. We're not
      // going to cover d3 in any great detail here.
      svg.selectAll('circle').data(data, function(d) { return d._id; })
      .enter().append('circle')
      .attr('r', 10)
      .attr('cx', function (d) { return d.x; })
      .attr('cy', function (d) { return d.y; });
    }
  };
}

// This is our actual points collection. It's stored in an 
//internal mongo database.

// This function will publish a named subscription of points
// that the client can then subscribe to. It returns all points
// currently in the points collection.
Template.home.points = function () {
  return points.find()
}

// This declares a server side method that the client can
// remotely call, which simply removes all of the points
// from the database. This is necessary because only the server
// may remove multiple documents at once.

// Just a reference for our canvas.
var canvas;

// Runs when Meteor is all set to start. It creates our
// canvas out of the Canvas object we declared above and..
Meteor.startup( function() {
  canvas = new Canvas();

  // Creates a reactive context around us getting all points
  // out of our points collection. Fetch will turn the cursor
  // into an array. We then pass off this array to the canvas'
  // draw method to actually draw all the points.
  // (Not performant!)
  Deps.autorun( function() {
    var data = points.find({}).fetch();
    $('h2').hide();
    if (canvas) {
      canvas.draw(data);
    }
  });
});

// Totally unnecessary, but used to illustrate how
// template helpers work. By calling in {{title}}
// in our template (see below), we write out
// the title of our app.
Template.drawingSurface.title = function () {
  return 'Draw with Me!';
}

// Declares an events hash of all events scoped to
// a particular template. Here we're handling the click
// event on the clear button.

Meteor.methods({
  'removeAll' : function (value) {
    points.remove({});
  }
})

Template.drawingSurface.events({
  'click input': function (event) {
    Meteor.call('clear', function() {
      canvas.clear();
    })
  },

  'click .clearButton': function (evt, tmpl) {
      console.log('delete')
      canvas.clear();
      Meteor.call('removeAll');
    }
})

// Just some DRY for inserting a point into the points 
// collection based on the cursor position.
var markPoint = function() {
  var offset = $('#canvas').offset();
      points.insert({
      x: (event.pageX - offset.left),
      y: (event.pageY - offset.top)});
}

// Another events hash. This one handles capturing the
// drawing-related events. Just for reference, Session can
// also establish a reactive context, but we're not using that
// here.
Template.canvas.events({
  'click': function (event) {
    markPoint();
  },
  'mousedown': function (event) {
    Session.set('draw', true);
  },
  'mouseup': function (event) {
    Session.set('draw', false);
  },
  'mousemove': function (event) {
    if (Session.get('draw')) {
      markPoint();
    }
  }
});