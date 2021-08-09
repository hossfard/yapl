'use strict';


import Konva from 'konva';
import * as utils from './utils';
import {Axis} from './Axis';
import {Tooltip} from './Tooltip';
import {LineSeries} from './LineSeries';
import {
   HAxisRenderDelegate,
   VAxisRenderDelegate} from './AxisRenderDelegate';



// eslint-disable-next-line no-unused-vars
class VTicks{
   constructor(x, y, h, dx, opts){
      this.shape = new Konva.Shape({
         sceneFunc: function (context, shape) {
            context.beginPath();
            for (let i=0; i<120; ++i){
               context.moveTo(x+dx*i, y);
               context.lineTo(x+dx*i, y-h);
            }
            // (!) Konva specific method, it is very important
            context.fillStrokeShape(shape);
         },
         ...opts
      });
   }
}


function generateRandomPoints(count){
   let ret = [];
   let xlim = [0, 10];
   let ylim = [0, 1];
   let dx = (xlim[1] - xlim[0])/count;
   for (let i=0; i<count; ++i){
      let x = xlim[0] + dx*i;
      let y = 4 + 3*Math.sin(x) + 2*Math.random() * (ylim[1] - ylim[0]) + ylim[0];
      ret.push([x, y]);
   }
   return ret;
}


export class Plot{

   constructor(parent){
      parent = 'container';
      this.stage = new Konva.Stage({
         container: parent,
         width: window.innerWidth,
         height: window.innerHeight,
      });

      let hAxisLayer = new Konva.Layer({
         x: 100,
         y: 500
      });

      let vAxisLayer = new Konva.Layer({
         x: 100
      });

      let hAxisDelegate = new HAxisRenderDelegate();
      let vAxisDelegate = new VAxisRenderDelegate();

      this.haxis = new Axis([0, 1000], [0, 10], hAxisDelegate);
      this.vaxis = new Axis([500, 20], [0, 10], vAxisDelegate);

      this.haxis.attach(hAxisLayer);
      this.vaxis.attach(vAxisLayer);

      this.stage.add(hAxisLayer);
      this.stage.add(vAxisLayer);

      this.canvasLayer = new Konva.Layer({
         x: 100,
         listening: false
      });

      this.tooltipLayer = new Konva.Layer();
      this.eventRect = new Konva.Rect({
         x: 100,
         y: 20,
         width: 1000,
         height: 500-20,
         fill: '#fff',
         opacity: 0.2
      });

      this.tooltip = new Tooltip(this);
      this.tooltip.attach(this.tooltipLayer);

      this.eventRect.on('mousemove', ()=>{
         var mousePos = this.stage.getPointerPosition();

         let px = this.haxis.fromCanvas(mousePos.x - 100);
         let py = this.vaxis.fromCanvas(mousePos.y - 20);
         let csData = this.closestSeries([px, py]);
         if (csData === undefined){
            return;
         }

         let series = csData.series;
         let seriesIndex = csData.index;
         let xCoord = this.haxis.toCanvas(series.points[seriesIndex][0]);
         let yCoord = this.vaxis.toCanvas(series.points[seriesIndex][1]);
         this.updateTooltip([xCoord, yCoord], series);
      });

      // Add series
      this.series = [];

      this.plot(
         generateRandomPoints(100),
         {stroke: 'blue', strokeWidth: 3, label: 'p1'},
      );
      this.plot(
         generateRandomPoints(100),
         {stroke: 'red', strokeWidth: 1, label: 'p2'},
      );
      this.plot(
         generateRandomPoints(100),
         {stroke: 'green', label: 'p4'}
      );

      this.stage.add(this.canvasLayer);

      window.setTimeout(()=>{
         this.haxis.setDomain([-5, 15]);
         this.vaxis.setDomain([-2, 10]);

         this.__updateSeries();
      }, 2000);


      this.tooltipLayer.add(this.eventRect);
      this.stage.add(this.tooltipLayer);
   }


   /** Add line series to plot
    *
    * @param {Array[array]} points data points in format
    *    [[x0,y0],[...]]
    * @param {SeriesOptions} opts series options TODO define
    */
   plot(points, opts){
      let pobj = new LineSeries(points, opts);
      pobj.attach(this.canvasLayer, this.haxis, this.vaxis);
      this.series.push(pobj);
      return pobj;
   }

   __updateSeries(){
      this.series.forEach((elem) => {
         elem.update();
      });
   }

   updateTooltip(point, series){
      this.tooltip.draw(
         series,
         [point[0]+100, point[1]]);
   }


   /** Return the series object closest to p in plot coordinates
    *
    * Points are expected to be sequential
    *
    * @param {[x,y]} point plot coordinate of the query point
    * @return {series: LineSeries, index: index} line series object
    *     closest to point, or undefined if no series
    */
   closestSeries(point){
      if (this.series.length === 0){
         return undefined;
      }

      let x = point[0];

      // Fn to to retrieve the x-component of the series data
      let indexer = (seq, index)=>{
            return seq[index][0];
      };

      let closestSeriesIndex = 0;
      let closestIndex = 0;
      this.series.forEach((elem, index) => {
         let pIndex = utils.closestPoint(
            elem.points, x, indexer
         );

         // Update closest series and index
         if (index === 0){
            closestSeriesIndex = 0;
            closestIndex = pIndex;
         }
         else{
            let p1 = elem.points[pIndex];
            let p2 = this.series[closestSeriesIndex]
                .points[closestIndex];

            let d1 = utils.l2(p1[0], p1[1], point[0], point[1]);
            let d2 = utils.l2(p2[0], p2[1], point[0], point[1]);
            if (d1 < d2){
               closestSeriesIndex = index;
               closestIndex = pIndex;
            }
         }
      });
      return {
         series: this.series[closestSeriesIndex],
         index: closestIndex
      };
   }

}


// module.exports.Foo = Foo;
