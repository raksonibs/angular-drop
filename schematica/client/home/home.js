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
  'dblclick': function (event) {
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

var ns = "http://www.w3.org/2000/svg";
var cube;

window.onload = function () {
  // Create svg element
  var svg = document.createElementNS( ns, "svg");
  var vbsize = 4;
  svg.setAttribute("viewBox", -vbsize/2 + " " + -vbsize/2 + " " + vbsize + " " + vbsize); 

  // And add it to the document
  document.body.appendChild(svg);

  // Define 3D object
  cube = Cube();
  var x = cube.init();
  svg.appendChild ( x );

  window.setInterval ( loop, 1000/60);
}

function loop () {
  cube.step();
}

var Cube = function () {
  var vertices, edges;

  var group; // reference to svg collection of lines (2D rendered edges)

  var init = function(){
    defGeometry();

    // Create svg (edges)

    group = document.createElementNS(ns, "g");
    group.setAttributeNS(null,"stroke", 'black');
    group.setAttributeNS(null,"stroke-width", 0.01);

    var persp = perspective();

    for ( var i = 0; i < edges.length; i++ ) {
      group.appendChild ( createEdge ( persp[edges[i][0]][0], persp[edges[i][0]][1], persp[edges[i][1]][0], persp[edges[i][1]][1]));
    }

    return group;
  };

  var defGeometry = function () {
    vertices = [
      [1,1,1],
      [1,1,-1],
      [-1,1,-1],
      [-1,1,1],
      [1,-1,1],
      [1,-1,-1],
      [-1,-1,-1],
      [-1,-1,1]
    ];

    edges = [
      [0,1], [1,2], [2,3], [3,0],
      [4,5], [5,6], [6,7], [7,4],
      [0,4], [1,5], [2,6], [3,7]
    ];
  }

  var rotateY = function( p, angle) {
    // z' = z*cos q - x*sin q
    // x' = z*sin q + x*cos q
    // y' = y

    var x,y,z;
    z = p[2]*Math.cos(angle) - p[0]*Math.sin(angle);
    x = p[2]*Math.sin(angle) + p[0]*Math.cos(angle);
    p[0] = x;
    p[2] = z;
  }

  var rotateX = function( p, angle) {
    var x,y,z;
    y = p[1]*Math.cos(angle) - p[2]*Math.sin(angle);
    z = p[1]*Math.sin(angle) + p[2]*Math.cos(angle);
    p[1] = y;
    p[2] = z;
  } 

  var perspective = function () {
    // Perspective test:
    // Shrink x and y, when z is large
    var persp = [];
    var z0 = -8, // Must be smaller than any z (or what?)
        z1 = 0,
        z, v, f;

    for (var i = 0; i < vertices.length; i++) {
      v = vertices[i];
      z = v[2];
      // Scale x,y according to the value of z
      f = (z1-z0)/(z-z0);
      persp.push([v[0]*f, v[1]*f]);
    };        

    return persp;
  }

  var step = function() {
    // Update vertices, like rotate em round y-axis
    var q = Math.PI/201;
    for (var i = 0; i < vertices.length; i++) {
      rotateY ( vertices[i], q);
    };
    // Ok, a bit around x too, then
    var q = Math.PI/301;
    for (var i = 0; i < vertices.length; i++) {
      rotateX ( vertices[i], q);
    };

    var persp = perspective();

    // Redraw svg by moving vertices line by line 
    for (var i = 0; i < edges.length; i++) {
      // Get line nr. i
      var line = group.childNodes[i];
      line.setAttributeNS(null,"x1", persp[edges[i][0]][0]);
      line.setAttributeNS(null,"y1", persp[edges[i][0]][1]);
      line.setAttributeNS(null,"x2", persp[edges[i][1]][0]);
      line.setAttributeNS(null,"y2", persp[edges[i][1]][1]);
    }; 
  };

  return {
    init: init,
    step: step
  };
};  

function createEdge (x1, y1, x2, y2 ) {
  var elem = document.createElementNS(ns, "line");

  elem.setAttributeNS(null,"x1", x1);
  elem.setAttributeNS(null,"y1", y1);
  elem.setAttributeNS(null,"x2", x2);
  elem.setAttributeNS(null,"y2", y2);

  return elem;
} 
