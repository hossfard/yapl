'use strict';

import Konva from 'konva';
import {EventEmitter} from './EventEmitter';



export class MouseEventListener extends EventEmitter{
   constructor(opts){
      super();
      this._x = opts.x;
      this._y = opts.y;
      // this._layer = new Konva.Layer({
      //    x: opts.x,
      //    y: opts.y,
      //    listening: true
      // });

      this._eventRect = new Konva.Rect({
         x: opts.x,
         y: opts.y,
         width: opts.width,
         height: opts.height,
         // fill: 'red',
         // opacity: 0.2
      });
      // this._layer.add(this._eventRect);
      this._eventRect.on('mousemove', this._mousemove.bind(this));
      this._eventRect.on('mouseout', this._mouseout.bind(this));
   }

   attach(container){
      container.add(this._eventRect);
   }

   _mousemove(){
      let stage = this._eventRect.getStage();
      if (!stage){
         return;
      }

      var mousePos = stage.getPointerPosition();
      let point = {
         x: mousePos.x - this._x,
         y: mousePos.y - this._y
      };

      this.notify('mousemove', point);
   }

   _mouseout(){
      this.notify('mouseout');
   }

}
