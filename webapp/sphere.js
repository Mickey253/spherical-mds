function readTextFile(file)
  {
      var rawFile = new XMLHttpRequest();
      rawFile.open("GET", file, false);
      rawFile.onreadystatechange = function ()
      {
          if(rawFile.readyState === 4)
          {
              if(rawFile.status === 200 || rawFile.status == 0)
              {
                  var allText = rawFile.responseText;
                  //alert(allText);
              }
          }
      }
      rawFile.send(null);
      return(rawFile.response)
  }

  //counterclockwise and clockwise functions are re-used code from spherical implementation.
  function toCounterClockwise(polygon) {
      var sum = 0;

      // loop through points and sum edges (x2-x1)(y2+y1)
      for (var i = 0; i + 3 < polygon.length; i += 2) {
          sum += (parseFloat(polygon[i + 2]) - parseFloat(polygon[i])) * (parseFloat(polygon[i + 3]) + parseFloat(polygon[i + 1]));
      }
      // polygon is counterclockwise else convert
      if (sum < 0) {
          return polygon;
      } else {
          // flip array by pairs of points e.g. [x1, y1, x2, y2] -> [x2, y2, x1, y1]
          var result = [];
          for (var i = polygon.length - 2, j = 0; i >= 0; i -= 2, j += 2) {
              result[j] = polygon[i]; // x val
              result[j + 1] = polygon[i + 1]; // y val
          }
      }
      return result
  }

  function toClockwise(polygon) {
      var sum = 0;

      // loop through points and sum edges (x2-x1)(y2+y1)
      for (var i = 0; i + 3 < polygon.length; i += 2) {
          sum += (parseFloat(polygon[i + 2]) - parseFloat(polygon[i])) * (parseFloat(polygon[i + 3]) + parseFloat(polygon[i + 1]));
      }

      // polygon is counterclockwise else convert
      if (sum >= 0) {
          return polygon;
      } else {
          // flip array by pairs of points e.g. [x1, y1, x2, y2] -> [x2, y2, x1, y1]
          var result = [];
          for (var i = polygon.length - 2, j = 0; i >= 0; i -= 2, j += 2) {
              result[j] = polygon[i]; // x val
              result[j + 1] = polygon[i + 1]; // y val
          }
      }
      return result
  }

  var makeMap = function(t){
    var regions;

    var color;
    var polygonsIdx = 0;
    var colorIdx = 0;
    var lineIdx = 0;
    let colors = [];
    let polygons = [[]];
    let lines = [[]];


    //Parsing code taken from http://gmap.cs.arizona.edu
    regions = t.children[0].attr_list[1].eq.trim().split(/\s+/);
    // parse xdot for region info
    for (var i = 0; i < regions.length; i++) {
        if (regions[i] == "c") { // following specifies color
            i += 2;
            colors[colorIdx] = regions[i];

            if (colors[colorIdx].charAt(0) == '-') { // some color hex's have '-' before
                colors[colorIdx] = colors[colorIdx].substring(1);
            }
            colorIdx++;

        } else if (regions[i] == "P") { // following is a polygon
            i++;
            var size = parseInt(regions[i]); // number of points in polygon

            var polygon = regions.slice(i + 1, i + 1 + size * 2);

            polygon = toCounterClockwise(polygon); // this many dimensions for GeoJson polygon coordinates
            polygons[polygonsIdx++] = polygon;
        } else if (regions[i] == "L") { // following is a line border of the polygon
            i++;
            var size = parseInt(regions[i]);

            var line = regions.slice(i + 1, i + 1 + size * 2);
            line = toCounterClockwise(line);
            lines[lineIdx++] = line;
        }
    }

    if (polygons.length > lines.length)
       l = polygons.length;
    else
       l = lines.length;

  if (typeof polygons[0] != "undefined"){
  myPolygons = [];
  preservePolygons = [];
  for(i=0; i<polygons.length; i++){
   myPolygons.push([]);
   preservePolygons.push([]);
   for (j=0; j < polygons[i].length; j+=2){
     myPolygons[i].push(polygonStrToSphere(polygons[i][j],polygons[i][j+1]));
    // preservePolygons[i].push(preserveOriginalMapNode(polygons[i][j],polygons[i][j+1]));
   }
  }
  }

  if(typeof lines[0] != "undefined") {
  myLines = [];
  preserveLines = [];
  for(i=0; i<lines.length; i++){
   myLines.push([]);
   preserveLines.push([]);
   for (j=0; j < lines[i].length; j+=2){
     myLines[i].push(polygonStrToSphere(lines[i][j],lines[i][j+1]));
     //preserveLines[i].push(preserveOriginalMapNode(lines[i][j],lines[i][j+1]));
   }
  }
  }


  polygonList = [];
  mapNodes = [];
  if (typeof lines[0][0] != "undefined"){

    for(i = 0; i<myLines.length; i++){
     polygonList.push({type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [myLines[i]]
          }
        }
      );
     //mapNodes.push(preserveLines[i]);
    }
  }
  else if (typeof polygons[0] != "undefined" && polygons[0].length > 0){
    for(i = 0; i<myPolygons.length; i++){
     polygonList.push({type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [myPolygons[i]]
          }
        });
     //mapNodes.push(preservePolygons[i]);
    }
  }


//  console.log(polygonList)

  return({
    polygonList: polygonList,
    colors: colors
  });

}

function polygonStrToSphere(xStereo,yStereo){
  xStereo = parseFloat(xStereo);
  yStereo = parseFloat(yStereo);
  cart = inv_stereo(xStereo,yStereo);

  v = new THREE.Vector3(cart[0],cart[1],cart[2]);
  vnew = vector3toLonLat(v);
  return [vnew[0],vnew[1]];
}

var parse_pos = function(strPos){
  Coords = strPos.split(',');
  return([parseFloat(Coords[0]),parseFloat(Coords[1]),parseFloat(Coords[2])]);
}

function rad2deg(r){
  return r * 180/Math.PI;
}
function deg2rad(d){
  return d * Math.PI/180;
}

function inv_stereo(x,y){
  x2 = x*x;
  y2 = y*y;
  newX = (2*x)/(1+x2+y2);
  newY = (2*y)/(1+x2+y2);
  z = (x2+y2-1)/(1+x2+y2);
  return [newX,newY,z];
}

function cartToPolar(v){
  x = v[0];
  y = v[1];
  z = v[2];

  r = Math.sqrt(x*x+y*y+z*z);
  x1 = (x/r);
  y1 = (y/r);
  z1 = (z/r);

  polar = Math.acos(y1/200)
  azimuthal = Math.atan2(x1,z1)
  return [polar,azimuthal]
}

function placeOnSphere(cartCoord){
  cartCoord = parse_pos(cartCoord);
  x = cartCoord[0];
  y = cartCoord[1];
  z = cartCoord[2];

  //v = inv_stereo(x,y)
  //v = cartToPolar([x,y,z])
  v = new THREE.Vector3(x,y,z);

  return vector3toLonLat(v)
}

function parse_pos_2(coord){
  Coords = coord.split(',');
  return([parseFloat(Coords[0]),parseFloat(Coords[1])]);
}

function placeOnSphereNew(sphereCoord){
  sphereCoord = parse_pos_2(sphereCoord);


  return [ sphereCoord[0]*(180.0/Math.PI),sphereCoord[1]*(180.0/Math.PI) ]
}

function vector3toLonLat( vector3 )
{

    vector3.normalize();

    //longitude = angle of the vector around the Y axis
    //-( ) : negate to flip the longitude (3d space specific )
    //- PI / 2 to face the Z axis
    var lng = -( Math.atan2( -vector3.z, -vector3.x ) ) - Math.PI / 2;

    //to bind between -PI / PI
    if( lng < - Math.PI )lng += Math.PI * 2;

    //latitude : angle between the vector & the vector projected on the XZ plane on a unit sphere

    //project on the XZ plane
    var p = new THREE.Vector3( vector3.x, 0, vector3.z );
    //project on the unit sphere
    p.normalize();

    //commpute the angle ( both vectors are normalized, no division by the sum of lengths )
    var lat = Math.acos( p.dot( vector3 ) );

    //invert if Y is negative to ensure teh latitude is comprised between -PI/2 & PI / 2
    if( vector3.y < 0 ) lat *= -1;

    return [ lng*(180.0/Math.PI),lat*(180.0/Math.PI) ];

}

/*var points = {
    type: "FeatureCollection",
    features: d3.range(100).map(function() {
        return {
            type: "Point",
            coordinates: [ 360 * Math.random(), 90 * (Math.random() - Math.random()) ]
        }
    })
}*/

var width = 1000,
  height = 700,
  scale = 100,
  lastX = 0,
  lastY = 0,
  origin = {
    x: 0,
    y: 0
  };

console.log(G)

//var Graph = DotParser.parse(readTextFile('new_outputs/cube_animation0.dot'));


let points = {
  type: "FeatureCollection",
  features: G['nodes'].map((val, i) => {
    return {type:"Feature",
            geometry: {
              type: "Point",
              coordinates: val['pos'],
              label: val['id']
            }
      }
  })
}
console.log(points)

myLink = {
  type: "LineString",
  coordinates: [nodes[source.id].spherePos,nodes[target.id].spherePos]
}

let edges = G['edges'].map( (val,i) => {type: "LineString",
                            coordinates: [val['source']  } )

//Map = makeMap(myGraph);


var svg = d3.select("svg");

var projection = d3.geoOrthographic(),
    path = d3.geoPath().projection(projection);


// zoom AND rotate
 svg.call(d3.zoom().on('zoom', zoomed));

 // code snippet from http://stackoverflow.com/questions/36614251
 var λ = d3.scaleLinear()
   .domain([-width, width])
   .range([-180, 180])

 var φ = d3.scaleLinear()
   .domain([-height, height])
   .range([90, -90]);


svg.append('path')
    .attr('id', 'sphere')
    .datum({ type: "Sphere" })
    .attr('d', path);

let lines = d3.geoGraticule().step([10, 10]);
let t = d3.transition().duration(750)

function updateData(points){


  svg.append('g')
      .attr('class', 'graticule')
      .selectAll('path')
      .data([lines()])
      .enter()
      .append('path')
      .attr('d', path)


  let mylinks = svg.append('g')
      .attr('class', 'links')
      .selectAll('path')
      .data(edges)
      .enter()
      .append('path')
      .attr('d', path);


  svg.append('g')
      .attr('class', 'sites')
      .selectAll('path')
      .data(points.features)
      .join(
        enter => enter.append('path')
        .attr('d', path),

        update => update.transition(t)
          .attr('d',path)
      );


  let labels = svg.append('g').attr('class', 'labels');

  svg.append('g')
      .attr('class', 'labels')
      .selectAll('path')
      .data(points.features)
      .enter()
      .append('text')
      .text(d => d.label)
      //.attr('d',d => d.label)
      .attr('font-size', 14)
      .style('text-anchor', 'middle')
      .attr('transform', function(d) {
           return 'translate(' +  path.centroid(d) + ')';
         })
         .text(function(d) {return d.geometry.label; });
  }


  function zoomed() {
    var transform = d3.event.transform;
    var r = {
      x: λ(transform.x),
      y: φ(transform.y)
    };
    var k = Math.sqrt(100 / projection.scale());
    if (d3.event.sourceEvent.wheelDelta) {
      projection.scale(scale * transform.k)
      transform.x = lastX;
      transform.y = lastY;
    } else {
      projection.rotate([origin.x + r.x, origin.y + r.y]);
      lastX = transform.x;
      lastY = transform.y;
    }
    updatePaths(svg);
  }

function updatePaths(svg){
  svg.selectAll('path')
    .attr('d',path);

    //Remove and redraw text
    d3.selectAll('text').remove()

    svg.append('g')
        .attr('class', 'labels')
        .selectAll('path')
        .data(points.features)
        .enter()
        .append('text')
        .attr('d',labels)
        .style('text-anchor', 'middle')
        .attr('transform', function(d) {
			       return 'translate(' +  path.centroid(d) + ')';
		       })
           .text(function(d) {return d.geometry.label; });

}

function changeProjection(){
  switch(document.getElementById('projection').value){
    case "stereographic":
      projection = d3.geoStereographic(),
          path = d3.geoPath().projection(projection);
      break;

    case "mercator":
      projection = d3.geoMercator(),
          path = d3.geoPath().projection(projection);
      break;

    case "equalearth":
      projection = d3.geoEqualEarth(),
          path = d3.geoPath().projection(projection);
      break;

    default:
      projection = d3.geoOrthographic(),
          path = d3.geoPath().projection(projection);
  }
  updatePaths(svg);
}


// gentle animation
d3.interval(function(elapsed) {
    projection.rotate([ elapsed / 150, 0 ]);
    svg.selectAll('path')
        .attr('d', path);
}, 50);
