'use strict';


import {LinearScale} from './LinearScale';
import * as utils from './utils';
import {
   HAxisRenderDelegate,
   VAxisRenderDelegate} from './AxisRenderDelegate';



export class Axis{

   constructor(range, domain, axisDelegate, opts){
      this.tickHeight = 5;
      this.range = range;
      this.domain = domain;
      this.tickCount = 20;
      this.scale = new LinearScale(this.domain, this.range);
      this.axisDelegate = axisDelegate || new HAxisRenderDelegate();
      this.opts = opts || {};
      this.axisDelegate.setGridLength(this.opts.gridLength || 0);
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


   /** Attach axis to a layer
    *
    */
   attach(layer){
      this.axisDelegate.attach(layer, this.scale);
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

      this.axisDelegate.update(
         old_domain, domain, this.scale);
   }
}


function axisRenderDelegateFactory(orientation){
   let orient = orientation.toLowerCase();

   if (orient === 'bottom'){
      return new HAxisRenderDelegate();
   }
   if (orient === 'left'){
      return new VAxisRenderDelegate();
   }

   return undefined;
}


export function axisFactory(range, domain, opts){
   opts = utils.setDefaults(opts, {
      orientation: 'bottom',
   });
   let delegate = axisRenderDelegateFactory(opts.orientation);
   return new Axis(range, domain, delegate, opts);
}
