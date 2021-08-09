'use strict';


import Konva from 'konva';


export class Tooltip{

   constructor(plot){
      this.plot = plot;
      this.group = new Konva.Group({});
   }

   attach(layer){
      this.pointer = new Konva.Circle({
         radius: 2,
         fill: 'black'
      });

      this.timestampText = new Konva.Text({
         x: 0,
         y: 0,
         text: '123484937479',
         fontSize: 18,
         fontFamily: 'Calibri',
         fill: 'black',
         // width: 200,
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
         x: -this.tooltipBox.width()/2 + 10,
         y: this.timestampText.height(),
         text: 'ABCD',
         fontSize: 18,
         fontFamily: 'Calibri',
         fontStyle: 'bold',
         fill: 'blue',
         padding: 0,
         align: 'left',
      });

      this.seriesValue = new Konva.Text({
         x: 30 + this.seriesLabel.x() + this.seriesLabel.width(),
         y: this.timestampText.height(),
         text: '192.383',
         fontSize: 18,
         fontFamily: 'Calibri',
         fontStyle: 'bold',
         fill: 'black',
         padding: 0,
         align: 'center',
      });

      this.timestampText.x(-this.timestampText.width()/2);
      this.timestampText.width(this.timestampText.width());

      this.tooltipBox.x(-this.tooltipBox.width()/2);
      this.tooltipBox.y(10);

      this.group.add(this.pointer);
      this.group.add(this.tooltipBox);
      this.group.add(this.timestampText);
      this.group.add(this.seriesLabel);
      this.group.add(this.seriesValue);
      layer.add(this.group);
   }

   draw(series, point){
      let color = series.opts.stroke || 'black';
      let label = series.opts.label || '';
      this.seriesLabel.fill(color);
      this.seriesLabel.text(label);
      this.seriesValue.text(point[1].toFixed(0));
      this.timestampText.text(point[0]);
      this.group.to({
         x: point[0],
         y: point[1],
         duration: 0.018
      });
   }

}
