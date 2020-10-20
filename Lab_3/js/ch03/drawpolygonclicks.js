"use strict";

const { vec2, vec4 } = glMatrix;

var canvas;
var gl;

var maxNumVertices = 500;
var index = 0;

var cIndex = 0;

var colors = [
	0.0, 0.0, 0.0, 1.0, // black
	1.0, 0.0, 0.0, 1.0 , // red
	1.0, 1.0, 0.0, 1.0 , // yellow
	0.0, 1.0, 0.0, 1.0 , // green
	0.0, 0.0, 1.0, 1.0 , // blue
	1.0, 0.0, 1.0, 1.0 , // magenta
	0.0, 1.0, 1.0, 1.0  // cyan
];

var t;
var numPolygons = 0;
var numIndices = [];
numIndices[0] = 0;
var start = [0];

function initPolygonCanvas(){
	canvas = document.getElementById( "ply-canvas" );
	gl = WebGLUtils.setupWebGL( canvas );
	if( !gl ){
		alert( "WebGL isn't available" );
	}

	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 0.5, 0.5, 0.5, 1.0 );

	var m = document.getElementById( "cmenu" );
	m.addEventListener( "click", function(){
		cIndex = m.selectedIndex;
	});

	var but = document.getElementById( "closepoly" );
	but.addEventListener( "click", function(){
		numPolygons++;
		numIndices[numPolygons] = 0;
		start[numPolygons] = index;
		renderPolygons();
	});

	canvas.addEventListener( "mousedown", function( event ){
		gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
		var rect = canvas.getBoundingClientRect();
		var cx = event.clientX - rect.left;
		var cy = event.clientY - rect.top; // offset
		t = vec2.fromValues( 2 * cx / canvas.width - 1, 2 * ( canvas.height - cy ) / canvas.height - 1 );
		gl.bufferSubData( gl.ARRAY_BUFFER, 8 * index, new Float32Array( t ) );

		gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
		//var c = Math.floor(Math.random() * 1024) % 7;
		var c = cIndex;
		c = c * 4;
		t = vec4.fromValues( colors[c], colors[c+1], colors[c+2], colors[c+3] );
		gl.bufferSubData( gl.ARRAY_BUFFER, 16 * index, new Float32Array( t ) );
		
		numIndices[numPolygons]++;
		index++;
	} );

	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( program );

	var vBuffer = gl.createBuffer(); //position
	gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, 8 * maxNumVertices, gl.STATIC_DRAW );

	var vPosition = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );

	var cBuffer = gl.createBuffer(); // color
	gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, 16 * maxNumVertices, gl.STATIC_DRAW );

	var vColor = gl.getAttribLocation( program, "vColor" );
	gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vColor );

	renderPolygons();
}

function renderPolygons(){
	gl.clear( gl.COLOR_BUFFER_BIT );
	for( var i = 0; i < numPolygons; i++ )
		gl.drawArrays( gl.TRIANGLE_FAN, start[i], numIndices[i] );
	
	window.requestAnimationFrame(renderPolygons);
}