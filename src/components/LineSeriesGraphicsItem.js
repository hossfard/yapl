'use strict';


import Konva from 'konva';
import {_registerNode} from 'konva/lib/Global';
import {Factory} from 'konva/lib/Factory.js';
import {getNumberValidator} from 'konva/lib/Validators.js';


export class LineSeriesGraphicsItem extends Konva.Line{
   constructor(config){
      super(config);
      this.className = 'LineSeriesGraphics';
   }

   _sceneFunc(context){
      let ret = super._sceneFunc(context);

      // Draw markers
      let rad = this.markersize();
      if (rad == 0){
         return ret;
      }
      let points = this.points();
      let N = points.length;
      for (let i=0; i<N; i+=2){
         context.beginPath();
         context.moveTo(points[i], points[i+1]);
         context.arc(
            points[i], points[i+1],
            rad, 0, 2 * Math.PI
         );
         context.fill();
      }
      return ret;
   }
}

_registerNode(LineSeriesGraphicsItem);
Factory.addGetterSetter(
   LineSeriesGraphicsItem, 'markersize', 0, getNumberValidator());

