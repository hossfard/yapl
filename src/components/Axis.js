'use strict';


import {LinearScale} from './LinearScale';
import {HAxisRenderDelegate} from './AxisRenderDelegate';



export class Axis{

   constructor(range, domain, axisDelegate){
      this.tickHeight = 5;
      this.range = range;
      this.domain = domain;
      this.tickCount = 20;
      this.scale = new LinearScale(this.domain, this.range);
      this.axisDelegate = axisDelegate || new HAxisRenderDelegate();
   }

   // Untested
   fromCanvas(x){
      let x0 = this.domain[0];
      let x1 = this.domain[1];

      let y0 = this.range[0];
      let y1 = this.range[1];
      return (x-y0)*(x1-x0)/(y1-y0) + x0;
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

      if (this.domain){
         old_domain = [this.domain[0], this.domain[1]];
      }

      this.domain = domain;

      this.axisDelegate.update(
         old_domain, domain, this.scale);
   }
}
