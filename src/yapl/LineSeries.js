'use strict';


import Konva from 'konva';
import {LineSeriesGraphicsItem} from './LineSeriesGraphicsItem';


export class LineSeries{

   /** Create a line series object
    *
    * @param {array[array]} points line series data formatted as
    *     [[x0,y0],[...]]
    * @param {dict} opts optional arguments
    */
   constructor(points, opts){
      this.opts = opts;
      this.setPoints(points);
   }

   /** Set series data
    *
    * @param {array[array]} points line series data formatted as
    *     [[x0,y0],[...]]
    *
    */
   setPoints(points){
      this.points = points;
   }

   /** Convert input points to canvas coords
    *
    * @param {array[array]} pList series coordinates
    * @param {Axis} xAxis x-axis for points
    * @param {Axis} yAxis y-axis for points
    * @return {array} [x0,y0, y0,y1, ...] points in
    *         canvas coordinates
    */
   __toCanvas(pList, xAxis, yAxis){
      let ret = [];
      for (let i=0; i<pList.length; ++i){
         ret.push(
            xAxis.toCanvas(pList[i][0]),
            yAxis.toCanvas(pList[i][1])
         );
      }
      return ret;
   }

   _createLineObject(series){
      let misc = {};
      if ('dash' in this.opts){
         misc.dash = this.opts.dash;
      }
      if ('markersize' in this.opts){
         misc.markersize = this.opts.markersize;
      }

      return new LineSeriesGraphicsItem({
         points: series,
         stroke: this.opts.stroke || 'black',
         strokeWidth: this.opts.strokeWidth || 1,
         lineCap: this.opts.lineCap || 'round',
         lineJoin: this.opts.lineJoin || 'round',
         ...misc
      });
   }

   attach(layer, xAxis, yAxis){
      if (!this.points){
         return;
      }

      this.xaxis = xAxis;
      this.yaxis = yAxis;
      let pList = this.__toCanvas(this.points, xAxis, yAxis);
      if (!this.lineObject){
         this.lineObject = this._createLineObject(pList);
      }

      layer.add(this.lineObject);
   }

   update(transition){
      if (!this.points || !this.lineObject){
         return;
      }

      let pList = this.__toCanvas(
         this.points,
         this.xaxis, this.yaxis);

      if (transition === undefined){
         transition = true;
      }

      if (!transition){
         this.lineObject.points(pList);
      }
      else{
         this.lineObject.to({
            duration: 0.5,
            points: pList,
            easing: Konva.Easings['StrongEaseOut']
         });
      }
   }

   /** Return series extent in x and y direction
    *
    * @return {Object} extent series extent
    * @return {Array} extent.x extent in x direction
    * @return {Array} extent.y extent in y direction
    */
   extent(){
      let ret = {
         x: [undefined, undefined],
         y: [undefined, undefined]
      };

      for (let i=0; i<this.points.length; ++i){
         if (i === 0){
            ret.x = [this.points[i][0], this.points[i][0]];
            ret.y = [this.points[i][1], this.points[i][1]];
            continue;
         }
         ret.x[0] = Math.min(ret.x[0], this.points[i][0]);
         ret.x[1] = Math.max(ret.x[1], this.points[i][0]);
         ret.y[0] = Math.min(ret.y[0], this.points[i][1]);
         ret.y[1] = Math.max(ret.y[1], this.points[i][1]);
      }
      return ret;
   }
}
