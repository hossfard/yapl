'use strict';


import Konva from 'konva';
import {VTickGenerator} from './VTickGenerator';
import {HTickGenerator} from './HTickGenerator';



export class HAxisRenderDelegate{

   constructor(tickHeight, tickCount, tickGenerator){
      this.tickHeight = tickHeight || 5;
      this.tickCount = tickCount || 10;
      this.tickGenerator =
         tickGenerator || new VTickGenerator();
      this.gridLines = [];
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
            this.tickGenerator.generateTick(
               canv_val, tickLength, opts)
         );
      }
      return ret;
   }

   // Create tick label objects
   genTickLabels(ticks, scale, domain){
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
      for (let i=0; i<this.gridLines.length; ++i){
         this.gridLines[i].destroy();
      }

      this.axisLine.destroy();

      this.tickLines = [];
      this.tickLabels = [];
      this.gridLines = [];
   }

   __attach(layer, scale, oldDomain, newDomain){
      this.layer = layer;
      this.axisLine = this.__createAxisLine(scale.range);
      layer.add(this.axisLine);

      this.ticks = scale.genTicks(
         newDomain, this.tickCount);
      this.tickLines = this.__genTickLines(
         this.ticks, scale, oldDomain, this.tickHeight,
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

}


export class VAxisRenderDelegate{

   constructor(tickHeight, tickCount, tickGenerator){
      this.tickHeight = tickHeight || 5;
      this.tickCount = tickCount || 10;
      this.tickGenerator =
         tickGenerator || new HTickGenerator();
   }

   setGridLength(length){
      this.gridLength = length;
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
            this.tickGenerator.generateTick(
               canv_val, tickLength, opts)
         );
      }
      return ret;
   }

   // Create tick label objects
   genTickLabels(ticks, scale, domain){
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

      for (let i=0; i<this.gridLines.length; ++i){
         this.gridLines[i].destroy();
      }
      this.tickLines = [];
      this.tickLabels = [];
   }

   __attach(layer, scale, oldDomain, newDomain){
      this.layer = layer;
      this.axisLine = this.__createAxisLine(scale.range);
      layer.add(this.axisLine);

      this.ticks = scale.genTicks(
         newDomain, this.tickCount);
      this.tickLines = this.__genTickLines(
         this.ticks, scale, oldDomain, this.tickHeight,
         {stroke: 'black'});
      this.gridLines = this.__genTickLines(
         this.ticks, scale, oldDomain, this.gridLength,
         {stroke: '#c8c8c8'});

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
}
