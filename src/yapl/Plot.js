'use strict';


import * as utils from './utils';
import {axisFactory} from './Axis';
import {Tooltip} from './Tooltip';
import {LineSeries} from './LineSeries';
import {EventEmitter} from './EventEmitter';
import {Legend} from './Legend';
import {AxisGraphicsItem} from './AxisGraphicsItem';
import {CanvasContainer} from './CanvasContainer';
import {CanvasLayer} from './CanvasLayer';
import {MouseEventListener} from './MouseEventListener';



export class Plot{

   constructor(parent, opts){
      let defaults = {
         width: window.innerWidth,
         height: window.innerHeight
      };
      opts = utils.setDefaults(opts, defaults);

      this._eventEmitter = new EventEmitter();

      this.stage = new CanvasContainer(parent, {
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

      this.bottomAxis = axisFactory(
         [0, xRange], [0, 10],
         {gridLength: canvasBoundingBox.height, orientation: 'bottom'}
      );
      this.leftAxis = axisFactory(
         [canvasBoundingBox.height, 0], [0, 10],
         {gridLength: xRange, orientation: 'left'}
      );

      this.bottomAxisGi = new AxisGraphicsItem(
         this.bottomAxis, canvasBoundingBox,
         {orientation: 'bottom'});
      this.leftAxisGi = new AxisGraphicsItem(
         this.leftAxis, canvasBoundingBox,
         {orientation: 'left'});

      this.bottomAxisGi.attach(this.stage);
      this.leftAxisGi.attach(this.stage);

      this.canvasLayer = new CanvasLayer({
         x: canvasBoundingBox.x,
         y: canvasBoundingBox.y,
      });

      this.legendLayer = new CanvasLayer({
         x: canvasBoundingBox.x,
         y: canvasBoundingBox.y
      });

      // Align tooltip layer with top-left of the canvaslayer
      this.tooltipLayer = new CanvasLayer({
         x: canvasBoundingBox.x,
         y: canvasBoundingBox.y
      });

      this._eventRect = new MouseEventListener(canvasBoundingBox);
      this._eventRect.subscribe('mousemove', this.mousemove.bind(this));
      this._eventRect.subscribe('mouseout', this.mouseout.bind(this));

      this.tooltip = new Tooltip(this);
      this.tooltip.attach(this.tooltipLayer);

      // Add series
      this.series = [];

      this.canvasLayer.attach(this.stage);
      this.tooltipLayer.attach(this.stage);
      this.legendLayer.attach(this.stage);

      this.legend = new Legend([], {
         bbox: {
            x: 0,
            y: 0,
            width: canvasBoundingBox.width,
            height: canvasBoundingBox.height
         }
      });
      this.legend.subscribe('legendmouseover', this.legendmouseover.bind(this));
      this.legend.subscribe('legendmouseend', this.legendmouseend.bind(this));
      this._eventRect.attach(this.legendLayer);
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

   fitToContent(padx=0.10, pady=0.10){
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
         [xCoord, yCoord],
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

   mousemove(point){
      this.tooltip.show(true);
      let px = this.bottomAxis.fromCanvas(point.x);
      let py = this.leftAxis.fromCanvas(point.y);
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
