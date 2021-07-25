'use strict';


import Konva from 'konva';
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


// eslint-disable-next-line no-unused-vars
class LinearScale{

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
      layer.y(200);
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


export class VAxis{

   constructor(range){
      // vertical position
      let x = 200;
      // tick height
      this.tickHeight = 5;

      this.range = range;
      // scale domain
      this.domain = [0, 10];

      this.tick_labels = [];
      this.tickLines = [];
      this.tickCount = 20;

      this.tick_group = new Konva.Group({
         x: x,
         y: 0,
         rotation: 0,
      });

      // this.tick_canv_values = [];
      // this.tick_coord_values = [];

      this.scale = new LinearScale(this.domain, this.range);

      // Draw ticks
      // this.__ticks(this.domain, this.tickCount);
      let ticks = this.scale.genTicks(this.domain, this.tickCount);
      this.__drawTicks(ticks, this.domain);

      // Draw axis line itself
      this.axis_line = new Konva.Line({
         points: [
            x, this.range[0],
            x, this.range[1]
         ],
         stroke: 'black',
         strokeWidth: 2,
         lineCap: 'round',
         lineJoin: 'round',
      });
   }

   /** Draw input ticks on canvas
    *
    * @param {list} ticks tick values in plot coords
    * @param {list} domain axis domain
    * @return {undefined} none
    */
   __drawTicks(ticks, domain){
      for (let i=0; i<ticks.length; ++i){
         let xval = ticks[i];
         let canv_val = this.scale.toCanvas(xval, domain);
         let line = new Konva.Line({
            points: [
               0, canv_val,
               this.tickHeight, canv_val
            ],
            stroke: 'black',
            strokeWidth: 1
         });
         this.tick_group.add(line);
         this.tickLines.push(line);
      }
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
      this.layer = layer;
      layer.add(this.axis_line);
      layer.add(this.tick_group);
      // this.tickLines.forEach((e)=>{
      //    layer.add(e);
      // });
   }


   /** Set the domain of the axis
    */
   setDomain(domain){
      if (this.domain){
         this.old_domain = [this.domain[0], this.domain[1]];
      }

      this.domain = domain;
      this.__updateDomain();
   }


   /** Animate the domain update
    *
    */
   __updateDomain(){
      if (!this.layer){
         return;
      }

      let old_domain = this.old_domain;
      let new_domain = this.domain;

      // Remove existing ticks
      for (let i=0; i<this.tickLines.length; ++i){
         this.tickLines[i].destroy();
      }

      this.tickLines = [];
      this.tickCount = 20;
      let dx1 = (new_domain[1] - new_domain[0])/this.tickCount;

      let ticks = this.scale.genTicks(this.domain, this.tickCount);
      // let ticks = this.__ticks(new_domain, this.tickCount);
      this.__drawTicks(ticks, old_domain);

      for (let i=0; i<this.tickCount; ++i){
         let xval1 = new_domain[0] + dx1*i;
         let canv_val0 = this.scale.toCanvas(xval1, old_domain);
         let canv_val1 = this.scale.toCanvas(xval1, new_domain);
         let delta = canv_val1 - canv_val0;

         let tween = new Konva.Tween({
            node: this.tickLines[i],
            duration: 1,
            y: delta,
            easing: Konva.Easings['StrongEaseOut']
         });
         tween.play();
      }
   }
}


export function Example(){
   var stage = new Konva.Stage({
      container: 'container',
      width: window.innerWidth,
      height: window.innerHeight,
   });
   var layer = new Konva.Layer();
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

   var axis = new Axis([10, 1000], [0, 10], hAxisDelegate);
   var vaxis = new Axis([10, 600], [0, 10], vAxisDelegate);

   layer.add(triangle);
   axis.attach(layer);
   vaxis.attach(layer);

   stage.add(layer);

   window.setTimeout(function(){
      axis.setDomain([-5, 15]);
      vaxis.setDomain([-10, 10]);
   }, 2000);

   // window.setTimeout(function(){
   //    console.log('timeout');
   //    triangle.x(95);
   //    // triangle.absolutePosition(95, 120);
   //    // triangle.draw();
   // }, 2000);
}


export function Foo__(){

   function writeMessage(message) {
      text.text(message);
   }

   var stage = new Konva.Stage({
      container: 'container',
      width: window.innerWidth,
      height: window.innerHeight,
   });

   var layer = new Konva.Layer();

   var triangle = new Konva.RegularPolygon({
      x: 80,
      y: 120,
      sides: 3,
      radius: 80,
      fill: '#00D2FF',
      stroke: 'black',
      strokeWidth: 4,
   });

   var text = new Konva.Text({
      x: 100,
      y: 100,
      fontFamily: 'Calibri',
      fontSize: 24,
      text: 'hi',
      fill: 'black',
   });

   triangle.on('mouseout', function () {
      writeMessage('Mouseout triangle 123.45');
   });

   triangle.on('mousemove', function () {
      var mousePos = stage.getPointerPosition();
      var x = mousePos.x - 190;
      var y = mousePos.y - 40;
      writeMessage('x: ' + x + ', y: ' + y);
   });

   var circle = new Konva.Circle({
      x: 230,
      y: 100,
      radius: 60,
      fill: 'red',
      stroke: 'black',
      strokeWidth: 4,
   });

   circle.on('mouseover', function () {
      writeMessage('Mouseover circle');
   });
   circle.on('mouseout', function () {
      writeMessage('Mouseout circle');
   });
   circle.on('mousedown', function () {
      writeMessage('Mousedown circle');
   });
   circle.on('mouseup', function () {
      writeMessage('Mouseup circle');
   });

   layer.add(triangle);
   layer.add(circle);
   layer.add(text);

   // add the layer to the stage
   stage.add(layer);
}

// module.exports.Foo = Foo;
