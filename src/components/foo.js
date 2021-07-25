'use strict';


import Konva from 'konva';
import {LinearScale} from './LinearScale';
import {
   HAxisRenderDelegate,
   VAxisRenderDelegate} from './AxisRenderDelegate';



// eslint-disable-next-line no-unused-vars
class VTicks{
   constructor(x, y, h, dx, opts){
      this.shape = new Konva.Shape({
         sceneFunc: function (context, shape) {
            context.beginPath();
            for (let i=0; i<120; ++i){
               context.moveTo(x+dx*i, y);
               context.lineTo(x+dx*i, y-h);
            }
            // (!) Konva specific method, it is very important
            context.fillStrokeShape(shape);
         },
         ...opts
      });
   }
}


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


export function Example(){
   var stage = new Konva.Stage({
      container: 'container',
      width: window.innerWidth,
      height: window.innerHeight,
   });
   var layer = new Konva.Layer();

   var hAxisLayer = new Konva.Layer();
   var vAxisLayer = new Konva.Layer();

   var triangle = new Konva.RegularPolygon({
      x: 80,
      y: 120,
      sides: 3,
      radius: 80,
      fill: '#00D2FF',
      stroke: 'black',
      strokeWidth: 4,
   });

   let hAxisDelegate = new HAxisRenderDelegate();
   let vAxisDelegate = new VAxisRenderDelegate();

   var haxis = new Axis([0, 1000], [0, 10], hAxisDelegate);
   var vaxis = new Axis([0, 600], [0, 10], vAxisDelegate);

   layer.add(triangle);
   haxis.attach(hAxisLayer);
   vaxis.attach(vAxisLayer);

   stage.add(layer);
   stage.add(hAxisLayer);
   stage.add(vAxisLayer);

   window.setTimeout(function(){
      haxis.setDomain([-5, 15]);
      vaxis.setDomain([-10, 10]);
   }, 2000);

   // window.setTimeout(function(){
   //    console.log('timeout');
   //    triangle.x(95);
   //    // triangle.absolutePosition(95, 120);
   //    // triangle.draw();
   // }, 2000);
}

// module.exports.Foo = Foo;
