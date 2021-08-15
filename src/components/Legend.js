'use strict';


import Konva from 'konva';
import {Cursor} from './Cursor';
import {LineSeriesGraphicsItem} from './LineSeriesGraphicsItem';



export class Legend{
   constructor(series, opts){
      this.opts = opts || {};

      this.group = new Konva.Group({
         y: 20,
         x: 20
      });

      this.bg = new Konva.Rect({
         fill: 'white',
         width: 100,
         height: 100,
         opacity: 0.7,
         cornerRadius: 10,
         strokeWidth: 0.4,
         stroke: 'black'
      });

      this.group.add(this.bg);
      this.labelTexts = [];
      this.dashLines = [];
      this.setSeries(series);
   }

   attach(layer){
      layer.add(this.group);
   }

   setSeries(series){
      this.series = series || [];
      this.draw();
   }

   draw(){
      this._clear();
      let pad0 = 10,
          pad = 10,
          textPad = 30,
          dashLength = 20;

      for (const series of this.series){
         let label = series.opts.label;
         if (!label){
            continue;
         }

         // Legend text
         let text = new Konva.Text({
            y: pad,
            x: pad0 + textPad,
            text: label,
            fontSize: 14
         });

         // Legend line
         let legendLine = new LineSeriesGraphicsItem({
            points: [
               10, pad + text.height()/2,
               pad0 + dashLength, pad + text.height()/2
            ],
            strokeWidth: series.opts.strokeWidth || 1,
            stroke: series.opts.stroke || 'black',
            dash: series.opts.dash || [100, 10],
            markersize: series.opts.markersize || 0
         });

         this.labelTexts.push(text);

         text.on('mouseover', ()=>{
            Cursor.set('pointer');
            this.notify('legendmouseover', {
               legendlabel: label
            });
         });

         text.on('mouseleave', ()=>{
            Cursor.set('');
            this.notify('legendmouseend', {legendlabel: label});
         });

         this.dashLines.push(legendLine);
         this.group.add(text);
         this.group.add(legendLine);
         pad += text.height() + pad0;
      }
      this.bg.height(pad + pad0);
   }

   subscribe(event, cb){
      if (!this._subscribers){
         this._subscribers = {};
      }

      if (!(event in this._subscribers)){
         this._subscribers[event] = [cb];
         return;
      }

      if (this._subscribers['event'].indexOf(cb) < 0){
         this._subscribers['event'].push(cb);
      }
   }

   notify(event, data){
      let subs = this._subscribers[event] || [];
      for (let sub of subs){
         sub(data);
      }
   }

   _clear(){
      for (let i=0; i<this.labelTexts.length; ++i){
         this.labelTexts[i].destroy();
      }
      for (let i=0; i<this.dashLines.length; ++i){
         this.dashLines[i].destroy();
      }

      this.labelTexts = [];
      this.dashLines = [];
   }

}
