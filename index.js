'use strict';

var proj4 = require('proj4');

// register 3310 projection
proj4.defs('EPSG:3310','+proj=aea +lat_1=34 +lat_2=40.5 +lat_0=0 +lon_0=-120 +x_0=0 +y_0=-4000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');

var proj_gmaps = 'EPSG:4326';
var proj_cimis = 'EPSG:3310';

class CimisGrid {

  constructor() {
    // match layers for easier checking
    this.ncols = 510;
    this.nrows = 560;
    this.xllcorner = -410000;
    this.yllcorner = -660000;
    this.cellsize = 2000;
  }

  bounds() {
    var bottomLeft = proj4(
      proj_cimis, 
      proj_gmaps, 
      [this.xllcorner, this.yllcorner]
    );

    var topRight = proj4(
      proj_cimis, 
      proj_gmaps,
      [
        this.xllcorner + this.ncols*this.cellsize, 
        this.yllcorner + this.nrows*this.cellsize
      ]);

    return [bottomLeft, topRight];
  }

  gridToBounds(row, col) {
    var bottomLeft = proj4(
      proj_cimis, 
      proj_gmaps, 
      [
        this.xllcorner + (col* this.cellsize), 
        this.yllcorner + ((this.nrows - row)*this.cellsize)
      ]
    );

    var topRight = proj4(
      proj_cimis, 
      proj_gmaps, 
      [
        this.xllcorner + ((col+1) * this.cellsize), 
        this.yllcorner + ((this.nrows -(row+1)) * this.cellsize)
      ]
    );

    return [bottomLeft, topRight];
  }

  llToGrid(lng, lat) {
    if( typeof lng === 'object' ) {
      lat = lng.lat();
      lng = lng.lng();
    }
  
    var result = proj4(proj_gmaps, proj_cimis, [lng, lat]);
  
    // Assuming this is the input to the grid....
    // Cols are X. Rows are Y and counted from the top down
    result = {
      row : this.nrows - Math.floor((result[1] - this.yllcorner) / this.cellsize),
      col : Math.floor((result[0] - this.xllcorner) / this.cellsize),
    };
  
    var y = this.yllcorner + ((this.nrows-result.row) * this.cellsize);
    var x = this.xllcorner + (result.col * this.cellsize) ;
  
    result.topRight = proj4(
      proj_cimis, 
      proj_gmaps,
      [x+this.cellsize, y+this.cellsize]
    );

    result.bottomLeft = proj4(
      proj_cimis, 
      proj_gmaps,
      [x, y]
    );
  
    return result;
  }
}

module.exports = CimisGrid;