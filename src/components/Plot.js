'use strict';


import Konva from 'konva';
import {Axis} from './Axis';
import {LineSeries} from './LineSeries';
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


function generateRandomPoints(count){
   let ret = [];
   let xlim = [0, 10];
   let ylim = [0, 1];
   let dx = (xlim[1] - xlim[0])/count;
   for (let i=0; i<count; ++i){
      let x = xlim[0] + dx*i;
      let y = 4 + 3*Math.sin(x) + 2*Math.random() * (ylim[1] - ylim[0]) + ylim[0];
      ret.push([x, y]);
   }
   return ret;
}

export class Plot{

   constructor(parent){
      parent = 'container';
      this.stage = new Konva.Stage({
         container: parent,
         width: window.innerWidth,
         height: window.innerHeight,
      });

      let hAxisLayer = new Konva.Layer({
         x: 100,
         y: 500
      });

      let vAxisLayer = new Konva.Layer({
         x: 100
      });

      let hAxisDelegate = new HAxisRenderDelegate();
      let vAxisDelegate = new VAxisRenderDelegate();

      this.haxis = new Axis([0, 1000], [0, 10], hAxisDelegate);
      this.vaxis = new Axis([500, 20], [0, 10], vAxisDelegate);

      this.haxis.attach(hAxisLayer);
      this.vaxis.attach(vAxisLayer);

      this.stage.add(hAxisLayer);
      this.stage.add(vAxisLayer);

      this.canvasLayer = new Konva.Layer({
         x: 100,
         listening: false
      });

      this.tooltipLayer = new Konva.Layer();
      this.eventRect = new Konva.Rect({
         x: 100,
         y: 20,
         width: 1000,
         height: 500-20,
         fill: 'blue',
         opacity: 0.2
      });

      this.tooltip = new Konva.Rect({
         width: 50,
         height: 50,
         fill: 'red'
      });

      this.eventRect.on('mousemove', ()=>{
         var mousePos = this.stage.getPointerPosition();
         this.updateTooltip(mousePos.x, mousePos.y, 'val');
      });

      // Add series
      this.series = {};

      this.plot(
         generateRandomPoints(100),
         {stroke: 'red'},
         'p1');
      this.plot(
         generateRandomPoints(100),
         {stroke: 'blue', strokeWidth: 1},
         'p2');
      this.plot(
         generateRandomPoints(100),
         {stroke: 'green'},
         'p3');

      this.stage.add(this.canvasLayer);

      window.setTimeout(()=>{
         this.haxis.setDomain([-5, 15]);
         this.vaxis.setDomain([-2, 10]);

         this.__updateSeries();
      }, 2000);


      this.tooltipLayer.add(this.eventRect);
      this.tooltipLayer.add(this.tooltip);
      this.stage.add(this.tooltipLayer);
   }


   plot(points, opts, label){
      label = label || '';
      let pobj = new LineSeries(points, opts);
      pobj.attach(this.canvasLayer, this.haxis, this.vaxis);
      this.series[label] = pobj;
   }

   __updateSeries(){
      for (const label in this.series){
         this.series[label].update();
      }
   }

   // eslint-disable-next-line no-unused-vars
   updateTooltip(x, y, text){
      this.tooltip.to({
         x: x,
         y: y,
         duration: 0.125,
         easing: Konva.Easings['StrongEaseOut']
      });
   }

}




// module.exports.Foo = Foo;
