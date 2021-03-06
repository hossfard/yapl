'use strict';


import Konva from 'konva';
import * as utils from './utils';
import {Cursor} from './Cursor';
import {LineSeriesGraphicsItem} from './LineSeriesGraphicsItem';



/** Plottable plot legends
 */
export class Legend{
   constructor(series, opts){
      this.opts = utils.setDefaults(opts, {
         bbox: {
            x: 0,
            y: 0,
            width: 0,
            height: 0
         },
         position: 'upper right',
         enable: true
      });

      this.group = new Konva.Group({
         x: 20 + this.opts.bbox.x,
         y: 20 + this.opts.bbox.y,
      });

      this.bg = new Konva.Rect({
         fill: 'white',
         width: 100,
         height: 100,
         opacity: 0.7,
         cornerRadius: 10,
         strokeWidth: 0.4,
         stroke: 'black'
      });

      this.group.add(this.bg);
      this.labelTexts = [];
      this.dashLines = [];
      this.setSeries(series);
   }

   setBoundingBox(bbox){
      this.opts.bbox = bbox;
      this.__repositionBox();
   }

   setPosition(pos){
      this.opts.position = pos;
      this.__repositionBox();
   }

   /** Attach legend to a canvas or layer
    *
    * @param {CanvasLayer} layer parent canvas or layer
    */
   attach(layer){
      layer.add(this.group);
      this._layer = layer;
   }

   /** Toggle visibility of legend
    *
    * @param {boolean} tf true if hiding, false otherwise
    */
   hide(tf){
      if (tf){
         this.group.hide();
      }
      else{
         this.group.show();
      }
   }

   show(tf){
      this.hide(!tf);
   }

   /** Return if the legend is visible or hidden
    *
    * @return {boolean} true if visible, false otherwise
    */
   isVisible(){
      return this.group.isVisible();
   }


   /** Set series whose legends are to be displayed
    *
    * @param {Array.<LineSeries>} series list of series
    */
   setSeries(series){
      this.series = series || [];
      this.draw();
   }

   __addBox(){
      this.bg = new Konva.Rect({
         fill: 'white',
         width: 100,
         height: 100,
         opacity: 0.7,
         cornerRadius: 10,
         strokeWidth: 0.4,
         stroke: 'black'
      });
      this.group.add(this.bg);
   }

   /** (Re)draw legends on canvas
    *
    */
   draw(){
      this._clear();
      if (!this.opts.enable){
         return;
      }

      this.__addBox();

      let pad0 = 10,
          pad = 10,
          textPad = 30,
          dashLength = 20;

      let hasLabels = false;
      for (const series of this.series){
         let label = series.opts.label;
         if (!label){
            continue;
         }

         hasLabels = hasLabels || label !== '';

         // Legend text
         let text = new Konva.Text({
            y: pad,
            x: pad0 + textPad,
            text: label,
            fontSize: 14
         });

         // Legend line
         let legendLine = new LineSeriesGraphicsItem({
            points: [
               10, pad + text.height()/2,
               pad0 + dashLength, pad + text.height()/2
            ],
            strokeWidth: series.opts.strokeWidth || 1,
            stroke: series.opts.stroke || 'black',
            dash: series.opts.dash || [100, 10],
            markersize: series.opts.markersize || 0
         });

         this.labelTexts.push(text);

         text.on('mouseover', this.__onmousehover.bind(this));
         text.on('mouseleave', this.__onmouseleave.bind(this));
         text.on('click', this.__onclick.bind(this));

         this.dashLines.push(legendLine);
         this.group.add(text);
         this.group.add(legendLine);
         pad += text.height() + pad0;
      }
      this.__repositionBox();
      this.hide(!hasLabels);
   }

   __repositionBox(){
      let pad = {x: 20, y: 20};
      let boxDim = this.__computeBoxDimension(this.labelTexts);
      this.bg.width(boxDim.x + 10);

      let x = 0;
      let y = 0;
      if (this.opts.position == 'upper left'){
         x = pad.x;
         y = pad.y;
      }
      else if (this.opts.position == 'upper right'){
         x = this.opts.bbox.width - boxDim.x - pad.x;
         y = pad.y;
      }
      else if (this.opts.position == 'lower left'){
         x = boxDim.x - pad.x;
         y = this.opts.bbox.height - boxDim.y - pad.y * 2;
      }
      else if (this.opts.position == 'lower right'){
         x = this.opts.bbox.width - boxDim.x - pad.x;
         y = this.opts.bbox.height - boxDim.y - pad.y * 2;
      }

      this.group.x(x);
      this.group.y(y);
      this.bg.height(boxDim.y + 10);
   }

   __computeBoxDimension(labelTexts){
      let ret = {x: 0, y: 0};
      for (let text of labelTexts){
         ret.x = Math.max(text.x() + text.width(), ret.x);
         ret.y = Math.max(text.y() + text.height(), ret.y);
      }
      return ret;
   }

   __onmousehover(elem){
      Cursor.set('pointer');
      this.notify('legendmouseover', {
         legendlabel: elem.target.text()
      });
   }

   __onclick(elem){
      this.notify('click', {
         legendlabel: elem.target.text()
      });
   }

   __onmouseleave(elem){
      Cursor.set('');
      this.notify('legendmouseend', {legendlabel: elem.target.text()});
   }

   subscribe(event, cb){
      if (!this._subscribers){
         this._subscribers = {};
      }

      if (!(event in this._subscribers)){
         this._subscribers[event] = [cb];
         return;
      }

      if (this._subscribers['event'].indexOf(cb) < 0){
         this._subscribers['event'].push(cb);
      }
   }

   notify(event, data){
      let subs = this._subscribers[event] || [];
      for (let sub of subs){
         sub(data);
      }
   }

   _clear(){
      for (let i=0; i<this.labelTexts.length; ++i){
         this.labelTexts[i].destroy();
      }
      for (let i=0; i<this.dashLines.length; ++i){
         this.dashLines[i].destroy();
      }

      this.bg.destroy();
      this.labelTexts = [];
      this.dashLines = [];
   }

}
