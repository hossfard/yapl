'use strict';


import Konva from 'konva';
import {CanvasLayer} from './CanvasLayer';



export class PlotView extends CanvasLayer{
   constructor(opts, bbox){
      super(opts);
      this._group = new Konva.Group({
         clip: {
            x: 0,
            y: 0,
            width: bbox.width,
            height: bbox.height,
         }
      });
      super.add(this._group);
   }

   add(drawable){
      this._group.add(drawable);
   }
}
