'use strict';


import Konva from 'konva';



export class HTickGenerator{
   constructor(){
      this.pad = 5;
   }

   // Vertically up
   generateTick(canvasValue, tickLength, opts){
      opts = opts || {};
      return new Konva.Line({
         points: [
            0, canvasValue,
            0+tickLength, canvasValue
         ],
         stroke: opts.stroke || 'black',
         strokeWidth: 1
      });
   }

   generateLabel(value, canvasValue){
      let text = new Konva.Text({
         x: 0,
         y: canvasValue,
         fontFamily: 'Calibri',
         fontSize: 14,
         text: value.toLocaleString(
            undefined, {minimumFractionDigits: 2}
         ),
         fill: 'black',
      });
      text.x(-this.pad - text.width());
      text.y(canvasValue - text.height()/2);
      return text;
   }
}