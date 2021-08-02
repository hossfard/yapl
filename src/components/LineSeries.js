'use strict';


import Konva from 'konva';



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

   setPoints(p){
      this._points = p;
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
      return new Konva.Line({
         points: series,
         stroke: this.opts.stroke || 'black',
         strokeWidth: this.opts.strokeWidth || 1,
         lineCap: this.opts.lineCap || 'round',
         lineJoin: this.opts.lineJoin || 'round',
      });
   }

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

      // this.update(xAxis, yAxis);
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
}
