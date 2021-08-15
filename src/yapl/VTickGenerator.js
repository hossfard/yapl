'use strict';


import Konva from 'konva';



export class VTickGenerator{
   constructor(){
      this.pad = 5;
   }

   // Vertically up
   generateTick(canvasValue, tickLength, opts){
      opts = opts || {};
      return new Konva.Line({
         points: [
            canvasValue, 0,
            canvasValue, 0-tickLength
         ],
         stroke: opts.stroke || 'black',
         strokeWidth: 1
      });
   }

   generateLabel(value, canvasValue){
      let text = new Konva.Text({
         x: canvasValue,
         y: this.pad,
         fontFamily: 'Calibri',
         fontSize: 14,
         text: value.toLocaleString(
            undefined, {minimumFractionDigits: 2}
         ),
         fill: 'black',
      });
      text.x(canvasValue - text.width()/2);
      return text;
   }
}
