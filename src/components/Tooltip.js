'use strict';


import Konva from 'konva';


export class Tooltip{

   constructor(plot){
      this.plot = plot;
      this.group = new Konva.Group({});
   }

   attach(layer){
      this.pointer = new Konva.Circle({
         radius: 8,
         fill: '#00000069'
      });

      this.timestampText = new Konva.Text({
         x: 0,
         y: 0,
         width: 100,
         text: '',
         fontSize: 18,
         fontFamily: 'Calibri',
         fill: 'black',
         padding: 20,
         align: 'center',
      });

      this.tooltipBox = new Konva.Rect({
         width: this.timestampText.width() + 40,
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

      this.timestampText.x(-this.timestampText.width()/2);
      this.timestampText.width(this.timestampText.width());

      this.tooltipBox.x(-this.tooltipBox.width()/2);
      this.tooltipBox.y(10);

      this.group.add(this.tooltipBox);
      this.group.add(this.timestampText);
      this.group.add(this.seriesLabel);
      this.group.add(this.seriesValue);
      layer.add(this.pointer);
      layer.add(this.group);
      this.show(false);
   }

   draw(plotCoord, canvCoord, series){
      let color = series.opts.stroke || 'black';
      let label = series.opts.label || '';
      this.seriesLabel.fill(color);
      this.seriesLabel.text(label);
      this.seriesValue.text(plotCoord[1].toFixed(0));
      this.timestampText.text(plotCoord[0].toFixed(2));

      // Update label/value position
      let sw = this.seriesLabel.width();
      let sv = this.seriesValue.width();
      let pad = 10;
      this.seriesLabel.x(-(sw+sv+pad)/2);
      this.seriesValue.x(pad);

      this.pointer.position({
         x: canvCoord[0], y: canvCoord[1]
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
      }
      else{
         this.group.hide();
      }
   }

}
