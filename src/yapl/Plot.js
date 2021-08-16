'use strict';


import Konva from 'konva';
import * as utils from './utils';
import {Axis} from './Axis';
import {Tooltip} from './Tooltip';
import {LineSeries} from './LineSeries';
import {EventEmitter} from './EventEmitter';
import {Legend} from './Legend';
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


export class Plot{

   constructor(parent, opts){
      let defaults = {
         width: window.innerWidth,
         height: window.innerHeight
      };
      opts = utils.setDefaults(opts, defaults);

      this._eventEmitter = new EventEmitter();

      this.stage = new Konva.Stage({
         container: parent,
         width: opts.width,
         height: opts.height
      });

      let canvasPad = {
         left: 100,
         top: 20,
         bottom: 40,
         right: 20
      };

      // Rectangle defining the plottable area of chart
      this.canvasBoundingBox = {
         x: canvasPad.left,
         y: canvasPad.top,
         width: opts.width - canvasPad.left - canvasPad.right,
         height: opts.height - canvasPad.top - canvasPad.bottom
      };
      let canvasBoundingBox = this.canvasBoundingBox;
      let xRange = this.canvasBoundingBox.width;

      let hAxisLayer = new Konva.Layer({
         x: canvasBoundingBox.x,
         y: canvasBoundingBox.y + canvasBoundingBox.height
      });

      let vAxisLayer = new Konva.Layer({
         x: canvasBoundingBox.x,
         y: canvasBoundingBox.y
      });

      this.bottomAxis = new Axis(
         [0, xRange], [0, 10], new HAxisRenderDelegate(),
         {gridLength: canvasBoundingBox.height});
      this.leftAxis = new Axis(
         [canvasBoundingBox.height, 0], [0, 10], new VAxisRenderDelegate(),
         {gridLength: xRange});

      this.bottomAxis.attach(hAxisLayer);
      this.leftAxis.attach(vAxisLayer);

      this.stage.add(hAxisLayer);
      this.stage.add(vAxisLayer);

      this.canvasLayer = new Konva.Layer({
         x: canvasBoundingBox.x,
         listening: false
      });

      this.legendLayer = new Konva.Layer({
         x: canvasBoundingBox.x,
         y: canvasBoundingBox.y
      });

      // Align tooltip layer with top-left of the canvaslayer
      this.tooltipLayer = new Konva.Layer({
         x: canvasBoundingBox.x,
         y: canvasBoundingBox.y
      });

      // Define a rectangle over the plottable area to listen for
      // mouse events
      this.eventRect = new Konva.Rect({
         width: canvasBoundingBox.width,
         height: canvasBoundingBox.height,
         fill: '#fff',
         opacity: 0.2
      });
      this.eventRect.on('mousemove', this.mousemove.bind(this));
      this.eventRect.on('mouseout', this.mouseout.bind(this));

      this.tooltip = new Tooltip(this);
      this.tooltip.attach(this.tooltipLayer);

      // Add series
      this.series = [];

      this.stage.add(this.canvasLayer);
      this.tooltipLayer.add(this.eventRect);
      this.stage.add(this.tooltipLayer);
      this.stage.add(this.legendLayer);

      this.legend = new Legend();
      this.legend.subscribe('legendmouseover', this.legendmouseover.bind(this));
      this.legend.subscribe('legendmouseend', this.legendmouseend.bind(this));
      this.legend.attach(this.legendLayer);
   }

   seriesByKey(key){
      for (let series of this.series){
         if (series.opts.label === key){
            return series;
         }
      }
      return undefined;
   }

   legendmouseover(data){
      let legendlabel = data.legendlabel;
      let series = this.seriesByKey(legendlabel);
      if (series === undefined){
         return;
      }
      series.lineObject._strokeWidth = series.lineObject.strokeWidth();
      series.lineObject.to({
         strokeWidth: series.lineObject.strokeWidth() * 2,
         duration: 0.1
      });
   }

   legendmouseend(data){
      let legendlabel = data.legendlabel;
      let series = this.seriesByKey(legendlabel);
      if (series === undefined){
         return;
      }
      series.lineObject.to({
         strokeWidth: series.lineObject._strokeWidth,
         duration: 0.1
      });
   }


   /** Add line series to plot
    *
    * @param {Array[array]} points data points in format
    *    [[x0,y0],[...]]
    * @param {SeriesOptions} opts series options TODO define
    */
   plot(points, opts){
      let pobj = new LineSeries(points, opts);
      pobj.attach(this.canvasLayer, this.bottomAxis, this.leftAxis);
      this.series.push(pobj);
      this.fitToContent();

      this.legend.setSeries(this.series);
      return pobj;
   }

   fitToContent(padx=0.10, pady=0.1){
      let ext = this.extent();
      if ((ext.x[0] === undefined) || (ext.y[0] === undefined)){
         return;
      }

      let dx = Math.abs(ext.x[1] - ext.x[0]);
      let dy = Math.abs(ext.y[1] - ext.y[0]);
      let x = [ext.x[0]-dx*padx, ext.x[1]+dx*padx];
      let y = [ext.y[0]-dy*pady, ext.y[1]+dy*pady];
      this.bottomAxis.setDomain(x);
      this.leftAxis.setDomain(y);
      this.__updateSeries();
   }

   extent(){
      let ret = {
         x: [undefined, undefined],
         y: [undefined, undefined]
      };

      for (let i=0; i<this.series.length; ++i){
         let ext = this.series[i].extent();
         if (i === 0){
            ret.x = ext.x;
            ret.y = ext.y;
            continue;
         }
         ret.x[0] = Math.min(ret.x[0], ext.x[0]);
         ret.x[1] = Math.max(ret.x[1], ext.x[1]);
         ret.y[0] = Math.min(ret.y[0], ext.y[0]);
         ret.y[1] = Math.max(ret.y[1], ext.y[1]);
      }
      return ret;
   }

   setExtent(x, y){
      this.bottomAxis.setDomain(x);
      this.leftAxis.setDomain(y);
      this.__updateSeries();
   }

   __updateSeries(){
      this.series.forEach((elem) => {
         elem.update();
      });
   }


   /**
    *
    * @param {array} point [x,y] plot coord where to show tooltip
    * @param {LineSeries} series Line series object
    */
   updateTooltip(point, series){
      let xCoord = this.bottomAxis.toCanvas(point[0]);
      let yCoord = this.leftAxis.toCanvas(point[1]);
      this.tooltip.draw(
         [point[0], point[1]],
         [xCoord, yCoord - this.canvasBoundingBox.y],
         series);
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

   mousemove(){
      this.tooltip.show(true);
      var mousePos = this.stage.getPointerPosition();

      let px = this.bottomAxis.fromCanvas(mousePos.x - this.canvasBoundingBox.x);
      let py = this.leftAxis.fromCanvas(mousePos.y);
      let csData = this.closestSeries([px, py]);
      if (csData === undefined){
         return;
      }

      let series = csData.series;
      let seriesIndex = csData.index;
      this.updateTooltip(series.points[seriesIndex], series);

      this._eventEmitter.notify('mousemove', {x: px, y: py});
   }

   mouseout(){
      this.tooltip.show(false);

      this._eventEmitter.notify('mousemove');
   }

   subscribe(event, cb){
      this._eventEmitter.subscribe(event, cb);
   }

}


// module.exports.Foo = Foo;
