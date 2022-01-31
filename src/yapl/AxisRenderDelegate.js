'use strict';


import Konva from 'konva';


/**
 * @typedef {Object} Font
 * @property {number} fontWidth font width
 * @property {number} fontHeight font height
 *
 */


export class HAxisRenderDelegate{

   constructor(opts){
      this.opts = opts;
      this.gridLines = [];
      this.pad = 5;
   }

   // Vertically up
   _generateTick(canvasValue, tickLength, opts){
      opts = opts || {};
      return new Konva.Line({
         points: [
            canvasValue, 0,
            canvasValue, 0-tickLength
         ],
         stroke: opts.stroke || 'black',
         strokeWidth: 1
      });
   }

   _generateLabel(value, canvasValue, dx, domain){
      let dummyText = new Konva.Text({
         fontFamily: 'Calibri',
         fontSize: 14,
         text: 'x',
         fill: 'black',
      });

      let font = {
         fontWidth: dummyText.width(),
         fontHeight: dummyText.height()
      };
      let str = this.labelToString(value, font, dx, domain);

      let text = new Konva.Text({
         x: canvasValue,
         y: this.pad,
         fontFamily: 'Calibri',
         fontSize: 14,
         text: str,
         fill: 'black',
      });
      text.x(canvasValue - text.width()/2);
      return text;
   }

   labelToString(value, font, dx, domain){
      dx, domain;
      if (typeof(value.getHours) === 'function'){
         return value.toLocaleDateString('en-US');
      }
      return value.toLocaleString(
         undefined, {minimumFractionDigits: 2}
      );
   }

   setGridLength(length){
      this.gridLength = length;
   }

   // Return an axis line object
   __createAxisLine(range){
      return new Konva.Line({
         points: [
            range[0], 0,
            range[1], 0
         ],
         stroke: 'black',
         strokeWidth: 2,
         lineCap: 'round',
         lineJoin: 'round',
      });
   }

   update(oldDomain, newDomain, scale){
      if (!this.layer){
         return;
      }

      this.clear();

      // Draw using ticks and labels on OLD domain
      this.__attach(this.layer, scale, oldDomain, newDomain);

      let duration = 0.5;

      // Then apply tween to new domain
      for (let i=0; i<this.tickLines.length; ++i){
         let xval1 = this.ticks[i];
         let canv_val0 = scale.toCanvas(xval1, oldDomain);
         let canv_val1 = scale.toCanvas(xval1, newDomain);
         let delta = canv_val1 - canv_val0;

         if (i < this.gridLines.length){
            this.gridLines[i].to({
               duration: duration,
               x: delta,
               easing: Konva.Easings['StrongEaseOut']
            });
         }

         this.tickLines[i].to({
            duration: duration,
            x: delta,
            easing: Konva.Easings['StrongEaseOut']
         });

         this.tickLabels[i].to({
            node: this.tickLabels[i],
            duration: duration,
            x: canv_val1 - this.tickLabels[i].width()/2,
            easing: Konva.Easings['StrongEaseOut']
         });
      }
   }

   // Return new tick line objects
   __genTickLines(ticks, scale, domain, tickLength, opts){
      let ret = [];
      for (let i=0; i<ticks.length; ++i){
         let xval = ticks[i];
         let canv_val = scale.toCanvas(xval, domain);
         ret.push(
            this._generateTick(
               canv_val, tickLength, opts)
         );
      }
      return ret;
   }

   // Create tick label objects
   genTickLabels(ticks, scale, domain){
      let ret = [];
      // horizontal space allocated fot a tick label
      let dx = (scale.range[1] - scale.range[0])/ticks.length + 5;
      for (let i=0; i<ticks.length; ++i){
         let xval = ticks[i];
         let canv_val = scale.toCanvas(xval, domain);
         ret.push(
            this._generateLabel(xval, canv_val, dx, domain)
         );
      }
      return ret;
   }

   // Remove axis elements
   clear(){
      for (let i=0; i<this.tickLines.length; ++i){
         this.tickLines[i].destroy();
         this.tickLabels[i].destroy();
      }
      for (let i=0; i<this.gridLines.length; ++i){
         this.gridLines[i].destroy();
      }

      this._label.destroy();
      this.axisLine.destroy();

      this.tickLines = [];
      this.tickLabels = [];
      this.gridLines = [];
   }

   __createAxisLabel(str, scale){
      let ret = new Konva.Text({
         fontFamily: 'Calibri',
         fontSize: 16,
         fontStyle: 'bold',
         text: str,
         fill: 'black',
      });
      ret.x((scale.range[1] - scale.range[0])*0.5 - ret.width()*0.5);
      ret.y(this.pad + ret.height());
      return ret;
   }

   __attach(layer, scale, oldDomain, newDomain){
      this.layer = layer;
      this._scalecache = scale;
      this.axisLine = this.__createAxisLine(scale.range);
      layer.add(this.axisLine);

      this._label = this.__createAxisLabel(this.opts.label, scale);
      layer.add(this._label);

      this.ticks = scale.genTicks(
         newDomain, this.opts.tickCount);
      this.tickLines = this.__genTickLines(
         this.ticks, scale, oldDomain, this.opts.tickLength,
         {stroke: 'black'});

      if (this.gridLength !== 0){
         this.gridLines = this.__genTickLines(
            this.ticks, scale, oldDomain, this.gridLength,
            {stroke: '#c8c8c8'});
      }

      this.tickLabels = this.genTickLabels(
         this.ticks, scale, oldDomain);

      for (let i=0; i<this.gridLines.length; ++i){
         layer.add(this.gridLines[i]);
      }

      for (let i=0; i<this.tickLines.length; ++i){
         layer.add(this.tickLines[i]);
      }
      for (let i=0; i<this.tickLabels.length; ++i){
         layer.add(this.tickLabels[i]);
      }
   }

   // Draw the axis to given layer
   attach(layer, scale){
      this.__attach(layer, scale, scale.domain, scale.domain);
   }

   setOptions(opts){
      this.opts = opts;
   }

   draw(){
      if (!this._scalecache){
         return;
      }
      this.update(
         this._scalecache.domain, this._scalecache.domain, this._scalecache);
   }

}


export class VAxisRenderDelegate{

   constructor(opts){
      this.opts = opts;
      this.pad = 5;
   }

   setGridLength(length){
      this.gridLength = length;
   }

   // Vertically up
   _generateTick(canvasValue, tickLength, opts){
      opts = opts || {};
      return new Konva.Line({
         points: [
            0, canvasValue,
            0+tickLength, canvasValue
         ],
         stroke: opts.stroke || 'black',
         strokeWidth: 1
      });
   }

   __createAxisLabel(str, scale){
      let ret = new Konva.Text({
         fontFamily: 'Calibri',
         fontSize: 16,
         fontStyle: 'bold',
         text: str,
         fill: 'black',
      });
      ret.y(-(scale.range[1] - scale.range[0])*0.5 + ret.width()*0.5);
      ret.x(-this.pad - ret.height() - this.tickLabelMaxWidth * 1.1);
      ret.rotation(270);
      return ret;
   }

   _generateLabel(value, canvasValue, dx, domain){
      domain;
      let dummyText = new Konva.Text({
         fontFamily: 'Calibri',
         fontSize: 14,
         text: 'x'
      });

      let font = {
         fontWidth: dummyText.width(),
         fontHeight: dummyText.height()
      };
      let str = this.labelToString(value, font, dx, domain);

      let text = new Konva.Text({
         x: 0,
         y: canvasValue,
         fontFamily: 'Calibri',
         fontSize: 14,
         text: str,
         fill: 'black',
      });
      text.x(-this.pad - text.width());
      text.y(canvasValue - text.height()/2);
      return text;
   }

   labelToString(value, font, dx, domain){
      let dy = domain[1] - domain[0];
      let fracDigits = 0;
      if (dy < 1){
         fracDigits = 2;
      }

      let suffix = '';
      if (dy > 10000){
         suffix = 'k';
         value /= 1000;
      }
      if (dy > 1e6){
         suffix = 'M';
         value /= 1e6;
      }

      return value.toLocaleString(undefined, {minimumFractionDigits: fracDigits})
         + suffix;
   }

   // Return an axis line object
   __createAxisLine(range){
      return new Konva.Line({
         points: [
            0, range[0],
            0, range[1]
         ],
         stroke: 'black',
         strokeWidth: 2,
         lineCap: 'round',
         lineJoin: 'round',
      });
   }

   update(oldDomain, newDomain, scale){
      if (!this.layer){
         return;
      }

      this.clear();

      // Draw using ticks and labels on OLD domain
      this.__attach(this.layer, scale, oldDomain, newDomain);
      this.scale = scale;
      let duration = 0.5;

      // Then apply tween to new domain
      for (let i=0; i<this.tickLines.length; ++i){
         let xval1 = this.ticks[i];
         let canv_val0 = scale.toCanvas(xval1, oldDomain);
         let canv_val1 = scale.toCanvas(xval1, newDomain);
         let delta = canv_val1 - canv_val0;

         this.tickLines[i].to({
            duration: duration,
            y: delta,
            easing: Konva.Easings['StrongEaseOut']
         });

         if (i < this.gridLines.length){
            this.gridLines[i].to({
               duration: duration,
               y: delta,
               easing: Konva.Easings['StrongEaseOut']
            });
         }

         this.tickLabels[i].to({
            duration: duration,
            y: canv_val1 - this.tickLabels[i].height()/2,
            easing: Konva.Easings['StrongEaseOut']
         });
      }
   }

   // Return new tick line objects
   __genTickLines(ticks, scale, domain, tickLength, opts){
      let ret = [];
      for (let i=0; i<ticks.length; ++i){
         let xval = ticks[i];
         let canv_val = scale.toCanvas(xval, domain);
         ret.push(
            this._generateTick(
               canv_val, tickLength, opts)
         );
      }
      return ret;
   }

   // Create tick label objects
   genTickLabels(ticks, scale, domain){
      let ret = [];
      this.tickLabelMaxWidth = 0;
      let dx = (scale.range[1] - scale.range[0])/ticks.length + 5;
      for (let i=0; i<ticks.length; ++i){
         let xval = ticks[i];
         let canv_val = scale.toCanvas(xval, domain);
         let item = this._generateLabel(xval, canv_val, dx, domain);
         this.tickLabelMaxWidth = Math.max(this.tickLabelMaxWidth, item.width());
         ret.push(item);
      }
      return ret;
   }

   // Remove axis elements
   clear(){
      for (let i=0; i<this.tickLines.length; ++i){
         this.tickLines[i].destroy();
         this.tickLabels[i].destroy();
      }
      this.axisLine.destroy();
      this._label.destroy();

      for (let i=0; i<this.gridLines.length; ++i){
         this.gridLines[i].destroy();
      }
      this.tickLines = [];
      this.tickLabels = [];
   }

   __attach(layer, scale, oldDomain, newDomain){
      this.layer = layer;
      this._scalecache = scale;
      this.axisLine = this.__createAxisLine(scale.range);
      layer.add(this.axisLine);

      // Final position of the ticks
      this.ticks = scale.genTicks(
         newDomain, this.opts.tickCount);

      // Draw ticks on the old position
      this.tickLines = this.__genTickLines(
         this.ticks, scale, oldDomain, this.opts.tickLength,
         {stroke: 'black'});
      this.gridLines = this.__genTickLines(
         this.ticks, scale, oldDomain, this.gridLength,
         {stroke: '#c8c8c8'});

      this.tickLabels = this.genTickLabels(
         this.ticks, scale, oldDomain);

      this._label = this.__createAxisLabel(this.opts.label, scale);
      layer.add(this._label);

      for (let i=0; i<this.gridLines.length; ++i){
         layer.add(this.gridLines[i]);
      }
      for (let i=0; i<this.tickLines.length; ++i){
         layer.add(this.tickLines[i]);
      }
      for (let i=0; i<this.tickLabels.length; ++i){
         layer.add(this.tickLabels[i]);
      }
   }

   // Draw the axis to given layer
   attach(layer, scale){
      this.__attach(layer, scale, scale.domain, scale.domain);
   }

   draw(){
      this.update(
         this._scalecache.domain, this._scalecache.domain, this._scalecache);
   }

   setOptions(opts){
      this.opts = opts;
   }
}


export function axisRenderDelegateFactory(orientation, bbox, opts){
   let orient = orientation.toLowerCase();
   let delegate = undefined;
   let gridLength = 0;
   bbox = bbox || {};

   if (orient === 'bottom'){
      delegate = new HAxisRenderDelegate(opts);
      gridLength = bbox.height || 0;
   }
   if (orient === 'left'){
      delegate = new VAxisRenderDelegate(opts);
      gridLength = bbox.width || 0;
   }

   if (delegate){
      delegate.setGridLength(gridLength);
   }

   return delegate;
}
