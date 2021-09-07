'use strict';


import Konva from 'konva';
import {LineSeriesGraphicsItem} from './LineSeriesGraphicsItem';
import * as utils from './utils';



/**
 * @typedef {Object} LineSeriesExtent
 * @property {array} x - The X Coordinate
 * @property {array} y - The Y Coordinate
 *
 */

/** Plottable Line Series object
 *
 */
export class LineSeries{

   /** Create a line series object
    *
    * Data is expected to be sequentially ordered for line series
    *
    * @param {array} points line series data formatted as
    *     [[x0,y0],[...]]
    * @param {dict} opts optional arguments
    */
   constructor(x, y, opts){
      this.opts = opts;
      this.setPoints(x, y);
   }

   /** Set series data
    *
    * @param {array} points line series data formatted as
    *     [[x0,y0],[...]]
    */
   setPoints(x, y){
      this._points = utils.mergeArray(x, y);
      this.update();
   }

   /** Return the existing data points
    *
    * @see LineSeries#setPoints
    * @returns {array} data points
    */
   points(){
      return this._points;
   }

   /** Append new data point(s) to line series
    *
    * Will internally update drawn line on canvas
    *
    * @see LineSeries#setPoints
    * @param {array} points new data points
    */
   append(points){
      this._points = this._points.concat(points);

      // Insert placeholder for new point. Set the placeholder equal
      // to last point, if any, for smoother transition
      let ps = this.lineObject.points();
      if (ps.length > 1){
         let last = [ps[ps.length-2], ps[ps.length-1]];
         this.lineObject.points(
            this.lineObject.points().concat(last)
         );
      }

      this.update();
   }

   /** Convert input points to canvas coords
    *
    * @private
    *
    * @param {array} pList series coordinates
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
      return new LineSeriesGraphicsItem({
         points: series,
         ...this.opts
      });
   }

   /** Attach line series to a canvas or layer
    *
    * @param {CanvasLayer} layer parent canvas or layer
    */
   attach(layer, xAxis, yAxis){
      if (!this._points){
         return;
      }

      this.xaxis = xAxis;
      this.yaxis = yAxis;
      let pList = this.__toCanvas(this._points, xAxis, yAxis);
      if (!this.lineObject){
         this.lineObject = this._createLineObject(pList);
      }

      layer.add(this.lineObject);
   }

   update(transition){
      if (!this._points || !this.lineObject){
         return;
      }

      let pList = this.__toCanvas(
         this._points,
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
    * For empty line series, values for extent ranges are of type
    * `undefined`
    *
    * @return {LineSeriesExtent} extent in x and y direction
    */
   extent(){
      let ret = {
         x: [undefined, undefined],
         y: [undefined, undefined]
      };

      for (let i=0; i<this._points.length; ++i){
         if (i === 0){
            ret.x = [this._points[i][0], this._points[i][0]];
            ret.y = [this._points[i][1], this._points[i][1]];
            continue;
         }
         ret.x[0] = Math.min(ret.x[0], this._points[i][0]);
         ret.x[1] = Math.max(ret.x[1], this._points[i][0]);
         ret.y[0] = Math.min(ret.y[0], this._points[i][1]);
         ret.y[1] = Math.max(ret.y[1], this._points[i][1]);
      }
      return ret;
   }
}
