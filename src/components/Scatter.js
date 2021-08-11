'use strict';

import Konva from 'konva';
import {_registerNode} from 'konva/lib/Global';
import {Factory} from 'konva/lib/Factory.js';
import {getNumberValidator,
        getNumberArrayValidator} from 'konva/lib/Validators.js';


export class Scatter extends Konva.Shape{
   constructor(config){
      super(config);
      this.className = 'Scatter';
   }

   _sceneFunc(context){
      context.fillStyle = this.fill();
      let points = this.points();
      let rad = this.radius();
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
   }
}

_registerNode(Scatter);
Factory.addGetterSetter(
   Scatter, 'radius', 0, getNumberValidator());
Factory.addGetterSetter(
   Scatter, 'points', [], getNumberArrayValidator());
