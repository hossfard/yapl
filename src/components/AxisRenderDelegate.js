

import Konva from 'konva';
import {AbstractRenderDelegate} from './AbstractRenderDelegate';
import {VTickGenerator} from './VTickGenerator';
import {HTickGenerator} from './HTickGenerator';



/** Delegate for drawing axis and labels
 *
 */
export class HAxisRenderDelegate extends AbstractRenderDelegate{

   constructor(tickHeight, tickCount, tickGenerator){
      super(tickHeight, tickCount, tickGenerator);
      // this.tickHeight = tickHeight || 5;
      // this.tickCount = tickCount || 10;
      this.tickGenerator =
         tickGenerator || new VTickGenerator(this.tickHeight);
   }

   // Return an axis line object
   createAxisLine(range){
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
}


export class VAxisRenderDelegate extends AbstractRenderDelegate{

   constructor(tickHeight, tickCount, tickGenerator){
      super(tickHeight, tickCount, tickGenerator);
      // this.tickHeight = tickHeight || 5;
      // this.tickCount = tickCount || 10;
      this.tickGenerator =
         tickGenerator || new HTickGenerator(this.tickHeight);
   }

   // Return an axis line object
   createAxisLine(range){
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

         this.tickLabels[i].to({
            duration: duration,
            y: canv_val1 - this.tickLabels[i].height()/2,
            easing: Konva.Easings['StrongEaseOut']
         });
      }
   }
}
