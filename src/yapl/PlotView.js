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

   width(w){
      if (w === undefined){
         return this._stage.width();
      }
      this._group.width(w);
      this._group.clipWidth(w);
      return undefined;
   }

   height(h){
      if (h === undefined){
         return this._stage.height();
      }
      this._group.height(h);
      this._group.clipHeight(h);
      return undefined;
   }
}
