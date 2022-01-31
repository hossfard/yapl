'use strict';


import * as utils from './utils';
import * as renderDelegate from './AxisRenderDelegate';
import {LinearScale} from './LinearScale';
import {EventEmitter} from './EventEmitter';
import Konva from 'konva';



function axisLayer(orientation, bbox){
   let orient = orientation.toLowerCase();
   if (orient === 'bottom'){
      return new Konva.Layer({
         x: bbox.x,
         y: bbox.y + bbox.height
      });
   }
   if (orient === 'left'){
      return new Konva.Layer({
         x: bbox.x,
         y: bbox.y
      });
   }
   return undefined;
}


function bboxGridLength(bbox, orientation){
   let len = 0;
   let orient = orientation.toLocaleLowerCase();
   if ((orient === 'bottom') || (orient === 'top')){
      len = bbox.height;
   }
   else{
      len = bbox.width;
   }
   return len;
}


export const AxisDefaultOpts = {
   gridlineStroke: '#c8c8c8',
   gridlineStokeWidth: 1,
   tickLength: 5,
   tickCount: 10,
   orientation: 'bottom'
};

export class AxisConfig{
   constructor(opts){
      let defaults = AxisDefaultOpts;
      opts = utils.setDefaults(opts, defaults);
      for (let key in opts){
         this[key] = opts[key];
      }
   }
}


export class Axis extends EventEmitter{

   constructor(range, domain, boundingBox, opts){
      super();
      this.domain = domain;
      this.scale = new LinearScale(this.domain, range);

      this.opts = utils.setDefaults(opts, AxisDefaultOpts);
      this.cfg = new AxisConfig(this.opts);

      this.bbox = boundingBox;
      this._views = [];
      this.renderDelegate = opts.renderDelegate ||
         renderDelegate.axisRenderDelegateFactory(
            opts.orientation, boundingBox, this.opts);
      this.layer = axisLayer(opts.orientation, boundingBox);
   }

   setBoundingBox(bbox){
      this.bbox = bbox;
      if (this.opts.orientation === 'left'){
         this.renderDelegate.setGridLength(bbox.width);
      }
      else{
         this.renderDelegate.setGridLength(bbox.height);
      }
   }

   setOption(key, value){
      this.opts[key] = value;
      this.renderDelegate.setOptions(this.opts);
      this.__draw();
   }

   grid(tf){
      if (!tf){
         this.renderDelegate.gridLength = 0;
      }
      else{
         this.renderDelegate.gridLength =
            bboxGridLength(this.bbox, this.opts.orientation);
      }
      this.__draw();
   }

   __draw(){
      this.renderDelegate.draw();
   }

   // Untested
   fromCanvas(x){
      return this.scale.fromCanvas(x);
   }

   /** Map point to canvas pixel coordinate
    *
    */
   toCanvas(x){
      return this.scale.toCanvas(x, this.domain);
   }

   attach(view){
      this.renderDelegate.attach(this.layer, this.scale);
      view.add(this.layer);
      this._views.push(view);
   }

   detach(view){
      let viewIndex = this._views.indexOf(view);
      if (viewIndex < 0){
         return;
      }
      this._views.splice(viewIndex, 1);
   }

   /** Set the domain of the axis
    */
   setDomain(domain){
      let old_domain = [domain[0], domain[1]];
      this.scale.domain = domain;
      if (this.domain){
         old_domain = [this.domain[0], this.domain[1]];
      }

      this.domain = domain;
      this.renderDelegate.update(old_domain, domain, this.scale);
      this.notify('domainchange', {
         old: old_domain,
         new: domain
      });
   }

   setRange(range){
      this.scale.range = range;
      this.renderDelegate.update(this.scale.domain, this.scale.domain, this.scale);
   }


   label(str){
      if (str === undefined){
         return this._label;
      }
      this._label = str;
      this.setOption('label', str);
      return this;
   }

}
