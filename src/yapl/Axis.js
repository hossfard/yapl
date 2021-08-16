'use strict';


import {LinearScale} from './LinearScale';
import * as utils from './utils';
import {EventEmitter} from './EventEmitter';
import * as renderDelegate from './AxisRenderDelegate';



export class Axis{

   constructor(range, domain, axisDelegate, opts){
      this.tickHeight = 5;
      this.range = range;
      this.domain = domain;
      this.tickCount = 20;
      this.scale = new LinearScale(this.domain, this.range);
      this.opts = opts || {};
      this._eventEmitter = new EventEmitter();
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

   /** Set the domain of the axis
    */
   setDomain(domain){
      let old_domain = [domain[0], domain[1]];
      this.scale.domain = domain;
      if (this.domain){
         old_domain = [this.domain[0], this.domain[1]];
      }

      this.domain = domain;
      this.notify('domainchange', {
         old: old_domain,
         new: domain
      });
   }

   subscribe(event, cb){
      this._eventEmitter.subscribe(event, cb);
   }

   notify(event, data){
      this._eventEmitter.notify(event, data);
   }
}


export function axisFactory(range, domain, opts){
   opts = utils.setDefaults(opts, {
      orientation: 'bottom',
   });
   let delegate = renderDelegate.axisRenderDelegateFactory(opts.orientation);
   return new Axis(range, domain, delegate, opts);
}
