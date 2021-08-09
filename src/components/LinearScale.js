'use strict';


/** Generate ticks in range [min, max]
 *
 * Requested number of ticks may not be honored
 *
 * @param {float} min minimum scale value
 * @param {float} max maximum scale value
 * @param {int} countHint suggested number of ticks
 */
function genScaleLimits(min, max, countHint){
   let epsilon = (max - min) / 1e6;
   max += epsilon;
   min -= epsilon;
   let range = max - min;

   let stepCount = countHint;

   // First approximation
   let roughStep = range / (stepCount - 1);

   // keep the 10 at the end
   let goodNormalizedSteps = [1, 1.5, 2, 2.5, 5, 7.5, 10];
   // Or use these if you prefer:  { 1, 2, 5, 10 };

   // Normalize rough step to find the normalized one that fits best
   let stepPower = Math.pow(
      10, -Math.floor(Math.log10(Math.abs(roughStep)))
   );
   let normalizedStep = roughStep * stepPower;
   let goodNormalizedStep = goodNormalizedSteps[0];
   for (let i=0; i<goodNormalizedSteps.length; ++i){
      if (goodNormalizedSteps[i] < normalizedStep){
         continue;
      }
      goodNormalizedStep = goodNormalizedSteps[i];
      break;
   }

   let step = goodNormalizedStep / stepPower;

   // Determine the scale limits based on the chosen step.
   let scaleMax = Math.ceil(max / step) * step;
   let scaleMin = Math.floor(min / step) * step;

   return [
      scaleMin,
      scaleMax,
      step
   ];
}


export class LinearScale{

   constructor(domain, range){
      this.domain = domain;
      this.range = range;
   }

   // Untested
   fromCanvas(x){
      let x0 = this.domain[0];
      let x1 = this.domain[1];

      let y0 = this.range[0];
      let y1 = this.range[1];
      return (x-y0)*(x1-x0)/(y1-y0) + x0;
   }

   // /** Map point to canvas pixel coordinate
   //  *
   //  */
   // toCanvas(x){
   //    let x0 = this.domain[0];
   //    let x1 = this.domain[1];

   //    let y0 = this.range[0];
   //    let y1 = this.range[1];

   //    return y0 + (y1-y0)/(x1-x0)*(x-x0);
   // }

   /** Map point to canvas pixel coordinate
    *
    */
   toCanvas(x, domain){
      domain = domain || this.domain;

      let x0 = domain[0];
      let x1 = domain[1];

      let y0 = this.range[0];
      let y1 = this.range[1];

      return y0 + (y1-y0)/(x1-x0)*(x-x0);
   }


   /** Evaluate appropriate tick values for given domain
    *
    * @param {list} domain domain of the plot
    * @param {int} count suggested number of ticks to return
    * @return {list} list of tick values in plot coordinates
    */
   genTicks(domain, count){
      let ret = [];
      let dx = (domain[1] - domain[0])/count;
      for (let i=0; i<count; ++i){
         ret.push(domain[0] + dx*i);
      }
      return ret;
   }
}
