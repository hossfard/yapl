'use strict';

import Konva from 'konva';
import * as utils from './utils';


export class Tooltip{

   constructor(plot){
      this.plot = plot;
      this.group = new Konva.Group({});
   }

   attach(layer){
      this.pointer = new Konva.Circle({
         radius: 8,
         opacity: 0.5,
         fill: '#00000069'
      });

      this.timestampText = new Konva.Text({
         x: 0,
         y: 10,
         text: '',
         fontSize: 18,
         fontFamily: 'Calibri',
         fill: 'black',
         padding: 20,
         align: 'center',
      });

      this.tooltipBox = new Konva.Rect({
         width: 40,
         height: 80,
         fill: '#d0b0d0',
         opacity: 0.9,
         cornerRadius: 10
      });

      this.seriesLabel = new Konva.Text({
         x: 0,
         y: this.timestampText.height(),
         text: '',
         fontSize: 18,
         fontFamily: 'Calibri',
         fontStyle: 'bold',
         fill: 'blue',
         padding: 0,
         align: 'left',
      });

      this.seriesValue = new Konva.Text({
         x: 0,
         y: this.timestampText.height(),
         text: '',
         fontSize: 18,
         fontFamily: 'Calibri',
         fontStyle: 'bold',
         fill: 'black',
         padding: 0,
         align: 'left',
      });

      this.tooltipBox.x(-this.tooltipBox.width()/2);
      this.tooltipBox.y(20);

      this.group.add(this.tooltipBox);
      this.group.add(this.timestampText);
      this.group.add(this.seriesLabel);
      this.group.add(this.seriesValue);
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

      let color = series.opts.stroke || 'black';
      let label = series.opts.label || '';
      this.seriesLabel.fill(color);
      this.seriesLabel.text(label);
      this.seriesValue.text(plotCoord[1].toFixed(0));

      let str = '';
      if (utils.isDateObject(plotCoord[0])){
         str = plotCoord[0].toLocaleDateString('en-US') +
            ' ' + plotCoord[0].toLocaleTimeString();
      }
      else{
         str = plotCoord[0].toFixed(2);
      }
      this.timestampText.text(str);
      this.tooltipBox.width(this.timestampText.width() + 40);

      // Update label/value position
      let bw = this.tooltipBox.width();
      let sw = this.seriesLabel.width();
      let sv = this.seriesValue.width();
      let pad = 10;
      this.seriesLabel.x(-(sw+sv+pad-bw/2)/2);
      this.seriesValue.x(this.seriesLabel.x() + this.seriesLabel.width() + pad);

      this.pointer.fill(color);
      this.pointer.radius(0);

      this.pointer.position({
         x: canvCoord[0], y: canvCoord[1]
      });
      this.pointer.to({
         radius: 10,
         duration: 0.5,
         easing: Konva.Easings['StrongEaseOut']
      });
      this.group.to({
         x: canvCoord[0],
         y: canvCoord[1],
         duration: 0.02
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
