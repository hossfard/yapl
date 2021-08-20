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


export class Axis extends EventEmitter{

   constructor(range, domain, renderDel, boundingBox, opts){
      super();
      this.range = range;
      this.domain = domain;
      this.scale = new LinearScale(this.domain, this.range);

      this.opts = utils.setDefaults(opts, {
         orientation: 'bottom'
      });

      this.bbox = boundingBox;
      this._views = [];
      this.renderDelegate = renderDel || renderDelegate.axisRenderDelegateFactory(
         opts.orientation, boundingBox);
      this.layer = axisLayer(opts.orientation, boundingBox);
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
}


export function axisFactory(range, domain, boundingBox, opts){
   opts = utils.setDefaults(opts, {
      orientation: 'bottom',
   });
   let delegate = renderDelegate.axisRenderDelegateFactory(opts.orientation, boundingBox);
   return new Axis(range, domain, delegate, boundingBox, opts);
}
