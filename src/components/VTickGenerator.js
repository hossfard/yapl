'use strict';


import Konva from 'konva';



export class VTickGenerator{
   constructor(tickLength){
      this.tickLength = tickLength;
   }

   // Vertically up
   generateTick(canvasValue){
      return new Konva.Line({
         points: [
            canvasValue, 0,
            canvasValue, 0-this.tickLength
         ],
         stroke: 'black',
         strokeWidth: 1
      });
   }

   generateLabel(value, canvasValue){
      let text = new Konva.Text({
         x: canvasValue,
         y: 0,
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
