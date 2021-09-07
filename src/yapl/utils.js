'use strict';


/** Find closest point to data
 *
 * Data is expected to be sorted in ascending order
 *
 * @param {list} data data sequence
 * @param {float} val query value
 * @param {function} fn function to retrieve value from @data at a
 *    given index -- fn(seq, index)
 * @return {int} Index of closest point to data
 */
export function closestPoint(data, val, fn){
   let highIndex = data.length-1;
   let lowIndex = 0;
   while (highIndex > lowIndex){
      let index = Math.floor((highIndex + lowIndex) / 2);
      let sub = fn(data, index);
      let highval = fn(data, highIndex);
      let lowval = fn(data, lowIndex);
      if (lowval == val){
         return lowIndex;
      }
      else if (sub == val){
         return index;
      }
      else if (highval == val){
         return highIndex;
      }
      else if (sub > val){
         if (highIndex == index){
            if (Math.abs(highval-val) > Math.abs(lowval-val)){
               return lowIndex;
            }
            return highIndex;
         }
         highIndex = index;
      }
      else{
         if (lowIndex == index){
            if (Math.abs(highval-val) > Math.abs(lowval-val)){
               return lowIndex;
            }
            return highIndex;
         }
         lowIndex = index;
      }
   }

   let highval = fn(data, highIndex);
   let lowval = fn(data, lowIndex);
   if (Math.abs(highval-val) > Math.abs(lowval-val)){
      return lowIndex;
   }
   return highIndex;
}



export function l2(x1, y1, x2, y2){
   return Math.sqrt(
      (x1 - x2)*(x1 - x2) + (y1 - y2)*(y1 - y2)
   );
}


export function setDefaults(dict, defaults){
   if (dict === undefined){
      return defaults;
   }

   for (let key in defaults){
      if (key in dict){
         continue;
      }
      dict[key] = defaults[key];
   }
   return dict;
}


/** Combine two arrays into array of points
 *
 * @param {list} x first array
 * @param {list} y second array
 * @return {int} [[x0, y0], ...] new array made up of x,y components
 */
export function mergeArray(x, y){
   let N = Math.min(x.length, y.length);
   let ret = [];
   for (let i=0; i<N; ++i){
      ret.push([x[i], y[i]]);
   }
   return ret;
}
