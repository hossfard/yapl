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


export function Plot(){
   var stage = new Konva.Stage({
      container: 'container',
      width: window.innerWidth,
      height: window.innerHeight,
   });
   var layer = new Konva.Layer();

   var hAxisLayer = new Konva.Layer();
   var vAxisLayer = new Konva.Layer();
   vAxisLayer.x(100);
   hAxisLayer.y(500);
   hAxisLayer.x(100);

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
   var vaxis = new Axis([20, 500], [0, 10], vAxisDelegate, true);


   layer.add(triangle);
   haxis.attach(hAxisLayer);
   vaxis.attach(vAxisLayer);

   stage.add(layer);
   stage.add(hAxisLayer);
   stage.add(vAxisLayer);

   let canvasLayer = new Konva.Layer();
   canvasLayer.x(100);

   let series1 = [];
   // let pointCount = 10;
   // let dx = 0.2;
   let points = [
      [1.5, 3],
      [2.0, 1],
      [3.0, 0],
      [4.5, 3.4]
   ];
   series1 = new LineSeries(points);
   series1.attach(canvasLayer, haxis, vaxis);

   stage.add(canvasLayer);

   window.setTimeout(function(){
      haxis.setDomain([-5, 15]);
      vaxis.setDomain([-10, 10]);
      series1.update();
   }, 2000);

   // window.setTimeout(function(){
   //    console.log('timeout');
   //    triangle.x(95);
   //    // triangle.absolutePosition(95, 120);
   //    // triangle.draw();
   // }, 2000);
}

// module.exports.Foo = Foo;
