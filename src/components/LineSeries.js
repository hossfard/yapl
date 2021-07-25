'use strict';


import Konva from 'konva';



export class LineSeries{
   constructor(points){
      this._points = points;
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
         stroke: 'black',
         strokeWidth: 2,
         lineCap: 'round',
         lineJoin: 'round',
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

   update(){
      if (!this._points || !this.lineObject){
         return;
      }

      let pList = this.__toCanvas(
         this._points,
         this.xaxis, this.yaxis);
      let tweent = new Konva.Tween({
         node: this.lineObject,
         duration: .5,
         points: pList,
         easing: Konva.Easings['StrongEaseOut']
      });
      tweent.play();
   }
}
