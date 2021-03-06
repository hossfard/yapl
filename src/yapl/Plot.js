'use strict';


import * as utils from './utils';
import {Axis} from './Axis';
import {Tooltip} from './Tooltip';
import {LineSeries} from './LineSeries';
import {EventEmitter} from './EventEmitter';
import {Legend} from './Legend';
import {CanvasContainer} from './CanvasContainer';
import {CanvasLayer} from './CanvasLayer';
import {PlotView} from './PlotView';
import {MouseEventListener} from './MouseEventListener';


/**
 * @typedef {Object} Point
 * @property {number} x X coordinate
 * @property {number} y Y coordinate
 *
 */


/**
 * @typedef {Object} SeriesPlotOptions
 * @property {string} [label] series label
 * @property {string} [stroke='#00f'] line color
 * @property {int} [markersize] size of markers
 * @property {int} [strokeWidth=1] plot line thickness
 * @property {string} [lineCap='round']
 * @property {string} [lineJoin='round']
 * @property {array} [dash]
 */
var DEFAULT_PLOT_OPTIONS = {
   stroke: '#00f',
   strokeWidth: 1,
   lineCap: 'round',
   lineJoin: 'round'
};


/**
 * @typedef {Object} ClosestSeriesType
 * @property {LineSeries} series Series object
 * @property {number} index index of the point, or -1 if empty
 *
 */



/** Plot type
 */
export class Plot{

   constructor(parent, opts){
      let defaults = {
         width: window.innerWidth,
         height: window.innerHeight,
         showTooltip: true,
         tooltip: Tooltip.TooltipDefaultOpts
      };
      this.opts = utils.setDefaults(opts, defaults);
      opts = this.opts;

      this.series = [];
      this._eventEmitter = new EventEmitter();

      this.stage = new CanvasContainer(parent, {
         width: opts.width,
         height: opts.height
      });

      // Location of the area where graphs are plotted
      this.canvasPad = {
         left: 50,
         top: 20,
         bottom: 40,
         right: 20
      };

      // Rectangle defining the plottable area of chart
      this.canvasBoundingBox = {
         x: this.canvasPad.left,
         y: this.canvasPad.top,
         width: opts.width - this.canvasPad.left - this.canvasPad.right,
         height: opts.height - this.canvasPad.top - this.canvasPad.bottom
      };
      let canvasBoundingBox = this.canvasBoundingBox;
      let xRange = this.canvasBoundingBox.width;

      this.bottomAxis = new Axis(
         [0, xRange], [0, 10], canvasBoundingBox,
         {
            orientation: 'bottom',
            tickCount: utils.tickCountHint(xRange)
         }
      );
      this.leftAxis = new Axis(
         [canvasBoundingBox.height, 0], [0, 10],
         canvasBoundingBox,
         {
            orientation: 'left',
            tickCount: utils.tickCountHint(canvasBoundingBox.height)
         }
      );

      this.bottomAxis.attach(this.stage);
      this.leftAxis.attach(this.stage);

      this.canvasGroup = new PlotView({
         x: canvasBoundingBox.x,
         y: canvasBoundingBox.y
      }, canvasBoundingBox);

      this.legendLayer = new CanvasLayer({
         x: canvasBoundingBox.x,
         y: canvasBoundingBox.y
      });

      // Align tooltip layer with top-left of the canvaslayer
      this.tooltipLayer = new CanvasLayer({
         x: canvasBoundingBox.x,
         y: canvasBoundingBox.y
      });

      this._eventRect = new MouseEventListener({
         x: 0,
         y: 0,
         width: this.canvasBoundingBox.width,
         height: this.canvasBoundingBox.height
      });

      this._eventRect.subscribe('mousemove', this.mousemove.bind(this));
      this._eventRect.subscribe('mouseout', this.mouseout.bind(this));

      this.tooltip = new Tooltip(this, this.opts.tooltip);
      this.tooltip.attach(this.tooltipLayer);

      this.canvasGroup.attach(this.stage);
      this.tooltipLayer.attach(this.stage);
      this.legendLayer.attach(this.stage);

      this._legend = new Legend([], {
         bbox: {
            x: 0,
            y: 0,
            width: canvasBoundingBox.width,
            height: canvasBoundingBox.height
         }
      });
      this._legend.subscribe('legendmouseover', this.legendmouseover.bind(this));
      this._legend.subscribe('legendmouseend', this.legendmouseend.bind(this));
      this._eventRect.attach(this.legendLayer);
      this._legend.attach(this.legendLayer);
   }


   resize(width, height){
      height = height || this.stage.height();

      this.stage.width(width);
      this.stage.height(height);
      this.canvasGroup.width(width);
      this.canvasGroup.height(height);
      this._eventRect.width(width);
      this._eventRect.height(height);

      this.opts.width = width;
      this.opts.height = height;
      this.canvasBoundingBox = {
         x: this.canvasPad.left,
         y: this.canvasPad.top,
         width: this.opts.width - this.canvasPad.left - this.canvasPad.right,
         height: this.opts.height - this.canvasPad.top - this.canvasPad.bottom
      };

      this.bottomAxis.setOption(
         'tickCount', utils.tickCountHint(this.canvasBoundingBox.width));
      this.leftAxis.setOption(
         'tickCount', utils.tickCountHint(this.canvasBoundingBox.height));

      this.bottomAxis.setRange([0, this.canvasBoundingBox.width]);
      this.leftAxis.setRange([this.canvasBoundingBox.height, 0]);
      this.bottomAxis.setBoundingBox(this.canvasBoundingBox);
      this.leftAxis.setBoundingBox(this.canvasBoundingBox);
      this._legend.setBoundingBox(this.canvasBoundingBox);
      this.fitToContent();
   }


   /** Return plot's legend object
    *
    * @return {Legend} legend object
    */
   legend(){
      return this._legend;
   }

   showTooltip(tf){
      this.opts.showTooltip = tf;
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

   /** Return plot axis objects
    *
    * @param {('left'|'bottom')} location axis location
    * @return {Axis} axis
    */
   axis(location){
      if (location === 'left'){
         return this.leftAxis;
      }
      if (location === 'bottom'){
         return this.bottomAxis;
      }
      return undefined;
   }

   /** Add line series to plot
    *
    * @param {array} points data points in format
    *    [[x0,y0],[...]]
    * @param {SeriesPlotOptions} opts series options
    * @param {bool} autofit if true, fits plot to content
    */
   plot(x, y, opts, autofit=true){
      opts = utils.setDefaults(opts, DEFAULT_PLOT_OPTIONS);
      let pobj = new LineSeries(x, y, opts);
      this.series.push(pobj);
      pobj.attach(this.canvasGroup, this.bottomAxis, this.leftAxis);
      this._legend.setSeries(this.series);

      if (x.length < 1){
         return pobj;
      }

      if (utils.isDateObject(x[0])){
         this.axis('bottom')
            .renderDelegate
            .labelToString = utils.timeAxisLabelFormat;
      }

      if (autofit){
         this.fitToContent();
      }

      return pobj;
   }

    clear(){
        for (let i=0; i<this.series.length; ++i){
            this.series[i].detach();
        }
        this.series = [];
    }

   /** Fit canvas to contents of the plot
    *
    * @param {number} padx padding, in percet of the content width, in
    *     the x dir
    * @param {number} pady padding, in percent of the content height,
    *     in the y dir
    * @return {undefined} none
    */
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

   /** Return maximum series extent in x and y direction
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

      for (let i=0; i<this.series.length; ++i){
         let ext = this.series[i].extent();
         if (i === 0){
            ret.x = ext.x;
            ret.y = ext.y;
            continue;
         }
         if ((ext.x[0] === undefined) || (ext.y[1] === undefined)){
            continue;
         }

         ret.x[0] = Math.min(ret.x[0], ext.x[0]);
         ret.x[1] = Math.max(ret.x[1], ext.x[1]);
         ret.y[0] = Math.min(ret.y[0], ext.y[0]);
         ret.y[1] = Math.max(ret.y[1], ext.y[1]);
      }
      return ret;
   }

   /** Set left and bottom axis domains
    *
    * @param {array} x domain of the bottom axis
    * @param {array} y domain of the left axis
    */
   setDomain(x, y){
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
    * @param {Point} point plot coordinate of the query point
    * @return {ClosestSeriesType} line series object
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
      let closestIndex = -1;
      this.series.forEach((elem, index) => {
         let pIndex = utils.closestPoint(
            elem.points(), x, indexer
         );
         if (pIndex < 0){
            return;
         }

         // Update closest series and index
         if (index === 0){
            closestSeriesIndex = 0;
            closestIndex = pIndex;
         }
         else{
            // Canvas coordinates of the cursor
            let pX = this.bottomAxis.toCanvas(point[0]);
            let pY = this.leftAxis.toCanvas(point[1]);

            // Canvas coord of current series
            let p1 = elem.points()[pIndex];
            let xCoord1 = this.bottomAxis.toCanvas(p1[0]);
            let yCoord1 = this.leftAxis.toCanvas(p1[1]);

            // Canvas coord of current cloest series
            let p2 = this.series[closestSeriesIndex]
                .points()[closestIndex];
            let xCoord2 = this.bottomAxis.toCanvas(p2[0]);
            let yCoord2 = this.leftAxis.toCanvas(p2[1]);

            let d1 = utils.l2(xCoord1, yCoord1, pX, pY);
            let d2 = utils.l2(xCoord2, yCoord2, pX, pY);

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
      // Adjust for parent layer offset
      point.x -= this.canvasBoundingBox.x;
      point.y -= this.canvasBoundingBox.y;

      let px = this.bottomAxis.fromCanvas(point.x);
      let py = this.leftAxis.fromCanvas(point.y);

      if (!this.opts.showTooltip){
         return this._eventEmitter.notify('mousemove', {x: px, y: py});
      }

      let csData = this.closestSeries([px, py]);
      if (csData === undefined){
         return this._eventEmitter.notify('mousemove', {x: px, y: py});
      }

      let series = csData.series;
      let seriesIndex = csData.index;
      if (!series || (seriesIndex < 0)){
         return this._eventEmitter.notify('mousemove', {x: px, y: py});
      }

      let seriesPoints = series.points()[seriesIndex];
      if (seriesPoints.length < 1){
         return this._eventEmitter.notify('mousemove', {x: px, y: py});
      }

      this.tooltip.show(true);
      this.updateTooltip(seriesPoints, series);
      return this._eventEmitter.notify('mousemove', {x: px, y: py});
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
