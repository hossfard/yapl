'use strict';


import {VTickGenerator} from './VTickGenerator';



export class AbstractRenderDelegate{
   constructor(tickHeight, tickCount, tickGenerator){
      this.tickHeight = tickHeight || 5;
      this.tickCount = tickCount || 10;
      this.tickGenerator =
         tickGenerator || new VTickGenerator(this.tickHeight);
   }

   // Return an axis line object
   // eslint-disable-next-line no-unused-vars
   createAxisLine(range){
      return undefined;
   }

   // eslint-disable-next-line no-unused-vars
   update(oldDomain, newDomain, scale){
      return;
   }

   // Return new tick line objects
   __genTickLines(ticks, scale, domain){
      let ret = [];
      for (let i=0; i<ticks.length; ++i){
         let xval = ticks[i];
         let canv_val = scale.toCanvas(xval, domain);
         ret.push(
            this.tickGenerator.generateTick(canv_val)
         );
      }
      return ret;
   }

   // Create tick label objects
   __genTickLabels(ticks, scale, domain){
      let ret = [];
      for (let i=0; i<ticks.length; ++i){
         let xval = ticks[i];
         let canv_val = scale.toCanvas(xval, domain);
         ret.push(
            this.tickGenerator.generateLabel(xval, canv_val)
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
      this.axisLine.destroy();

      this.tickLines = [];
      this.tickLabels = [];
   }

   __attach(layer, scale, oldDomain, newDomain){
      this.layer = layer;
      this.axisLine = this.createAxisLine(scale.range);
      layer.add(this.axisLine);

      this.ticks = scale.genTicks(
         newDomain, this.tickCount);
      this.tickLines = this.__genTickLines(
         this.ticks, scale, oldDomain);
      this.tickLabels = this.__genTickLabels(
         this.ticks, scale, oldDomain);

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

}
