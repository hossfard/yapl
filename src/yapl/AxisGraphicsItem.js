'use strict';

import Konva from 'konva';
import * as utils from './utils';
import * as axis from './Axis';



function axisLayer(orientation, bbox){
   let orient = orientation.toLowerCase();
   if (orient === 'bottom'){
      return new Konva.Layer({
         x: bbox.x,
         y: bbox.y + bbox.height
      });
   }
   if (orient === 'left'){
      return new Konva.Layer({
         x: bbox.x,
         y: bbox.y
      });
   }
   return undefined;
}


export class AxisGraphicsItem{
   constructor(axisObject, boundingBox, opts){
      this.bbox = boundingBox;
      this._views = [];
      this.axisObject = axisObject;
      this.renderDelegate = undefined;

      let defaults = {
         orientation: 'bottom'
      };

      opts = utils.setDefaults(opts, defaults);
      this.renderDelegate = axis.axisRenderDelegateFactory(
         opts.orientation, this.bbox);
      this.layer = axisLayer(opts.orientation, this.bbox);

      this.axisObject.subscribe('domainchange', (data)=>{
         let oldDomain = data.old;
         let newDomain = data.new;
         this.renderDelegate.update(oldDomain, newDomain, this.axisObject.scale);
      });
   }

   attach(view){
      this.renderDelegate.attach(this.layer, this.axisObject.scale);
      view.add(this.layer);
      this._views.push(view);
   }

   detach(view){
      let viewIndex = this._views.indexOf(view);
      if (viewIndex < 0){
         return;
      }
      this._views.splice(viewIndex, 1);
   }
}
