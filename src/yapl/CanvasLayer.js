'use strict';


import Konva from 'konva';
import * as utils from './utils';



export class CanvasLayer{
   constructor(opts){
      opts = utils.setDefaults(opts, {
         x: 0, y: 0
      });

      this._layer = new Konva.Layer({
         x: opts.x,
         y: opts.y
      });
   }

   attach(container){
      container.add(this._layer);
   }

   add(drawable){
      this._layer.add(drawable);
   }

}
