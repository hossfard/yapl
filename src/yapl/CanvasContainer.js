'use strict';


import Konva from 'konva';



export class CanvasContainer{
   constructor(parent, opts){
      this._stage = new Konva.Stage({
         container: parent,
         ...opts,
      });
   }

   add(drawable){
      this._stage.add(drawable);
   }

   cursorPosition(){
      return this._stage.getPointerPosition();
   }

   width(w){
      if (w === undefined){
         return this._stage.width();
      }
      this._stage.width(w);
      return undefined;
   }

   height(h){
      if (h === undefined){
         return this._stage.height();
      }
      this._stage.height(h);
      return undefined;
   }

}
