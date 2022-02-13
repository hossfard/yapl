'use strict';

import Konva from 'konva';
import * as utils from './utils';


function dateTimeToString(date){
   const dateStr = date.toLocaleDateString('en-US');
   const timeStr = date.toLocaleTimeString('en-GB', {
      hour: '2-digit', minute:'2-digit'});
   return dateStr + ' ' + timeStr;
}


function valueToString(value, digits){
   if (utils.isDateObject(value)){
      return dateTimeToString(value);
   }

   if (digits === undefined){
      digits = 2;
   }
   return value.toLocaleString(undefined, {minimumFractionDigits: digits});
}


export const TooltipDefaultOpts = {
   xValueToString: valueToString,
   yValueToString: valueToString
};


export class TooltipRectContentDraw{
   constructor(opts){
      this.opts = utils.setDefaults(opts, TooltipDefaultOpts);

      this.content = {
         tooltipRect: new Konva.Rect({
            width: 40,
            height: 80,
            fill: '#fff',
            stroke: '#666',
            strokeWidth: 1,
            opacity: 0.9,
            cornerRadius: 0
         }),

         timestampText: new Konva.Text({
            x: 0,
            y: 0,
            text: '',
            fontSize: 14,
            fill: 'black',
            padding: 0,
            align: 'left'
         }),

         labelText: new Konva.Text({
            x: 0,
            y: 0,
            text: '',
            fontSize: 14,
            fontStyle: 'bold',
            fill: 'blue',
            padding: 0,
            align: 'left'
         }),

         valueText: new Konva.Text({
            x: 0,
            y: 0,
            text: '',
            fontSize: 14,
            fontStyle: 'bold',
            fill: 'black',
            padding: 0,
            align: 'left'
         })
      };
   }

   destroy(){
      for (const key in this.content){
         this.content[key].destroy();
      }
      this.pointer.destroy();
   }

   attach(parent){
      for (const key in this.content){
         parent.add(this.content[key]);
      }
   }

   update(plotCoord, canvCoord, series){
      let color = series.opts.stroke || 'black';
      let label = series.opts.label || '';
      this.content.labelText.fill(color);
      this.content.labelText.text(label);
      this.content.timestampText.text(this.opts.xValueToString(plotCoord[0]));
      this.content.valueText.text(this.opts.yValueToString(plotCoord[1]));

      const ltw = this.content.labelText.width();
      const vtw = this.content.valueText.width();

      const pad = 5;
      const labelValueWidth = ltw + vtw + pad;
      const timestampWidth = this.content.timestampText.width();
      const tooltipRectWidth = Math.max(labelValueWidth, timestampWidth) + 5*pad;

      this.content.tooltipRect.width(tooltipRectWidth);
      const th = this.content.timestampText.height();
      const contentHeight = th + pad + this.content.valueText.height();

      // Center label and value text objects
      this.content.labelText.setPosition({
         x: -labelValueWidth/2,
         y: contentHeight/2 - th
      });
      this.content.valueText.setPosition({
         x: +labelValueWidth/2-vtw,
         y: contentHeight/2 - th
      });

      // Center timestamp object
      this.content.timestampText.setPosition({
         x: -timestampWidth/2,
         y: -contentHeight/2
      });

      this.content.tooltipRect.height(contentHeight + pad*2);
      this.content.tooltipRect.setPosition({
         x: -tooltipRectWidth/2,
         y: -this.content.tooltipRect.height()/2
      });
   }

   size(){
      return {
         width: this.content.tooltipRect.width(),
         height: this.content.tooltipRect.height()
      };
   }

}


export class Tooltip{

   constructor(plot, opts){
      this.opts = utils.setDefaults(opts, TooltipDefaultOpts);
      this.plot = plot;
      this.group = new Konva.Group({});
      this.content = new TooltipRectContentDraw(this.opts);
   }

   /** Attach tooltip to a plot
    *
    */
   attach(layer){
      this.content.attach(this.group);
      this.pointer = new Konva.Circle({
         radius: 8,
         opacity: 0.5,
         fill: '#00000069'
      });

      layer.add(this.pointer);
      layer.add(this.group);
      this.show(false);
   }

   draw(plotCoord, canvCoord, series){
      let pOld = this.pointer.position();
      let TOL = 1E-5;
      if ((Math.abs(canvCoord[0]- pOld.x)<TOL) &&
          (Math.abs(canvCoord[1]- pOld.y)<TOL)){
         return;
      }

      this.content.update(plotCoord, canvCoord, series);
      const pointerRadius = 7;

      const cSize = this.content.size();
      this.group.to({
         x: canvCoord[0],
         y: canvCoord[1] + cSize.height/2 + pointerRadius*1.5,
         duration: 0.02
      });

      let color = series.opts.stroke || 'black';
      this.pointer.fill(color);
      this.pointer.radius(0);

      this.pointer.position({
         x: canvCoord[0], y: canvCoord[1]
      });
      this.pointer.to({
         radius: pointerRadius,
         duration: 0.5,
         easing: Konva.Easings['StrongEaseOut']
      });
   }

   show(tf){
      if (tf){
         this.group.show();
         this.pointer.show();
      }
      else{
         this.pointer.hide();
         this.group.hide();
      }
   }

}
