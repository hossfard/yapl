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


/** Check if object is a Date object
 *
 * @param {object} obj test object
 * @return {bool} True if Date object, false otherwise
 */
export function isDateObject(obj){
   return typeof(obj.getHours) === 'function';
}


/** Map of different time units to seconds
*/
const TimeToSecondsMap = {
   second: 1,
   minute: 60,
   hour: 3600,
   day: 3600*24,
   week: 3600*24*7,
   month: 3600*24*7*4.34524,
   year: 3600*24*7*52
};


/** Custom strategy for converting timestamps to str
 *
 * @param {(number|Date)} value timestamp in milliseconds since epoch
 * @param {Font} font rendering font
 * @param {number} dx available space for rendering
 */
export function timeAxisLabelFormat(value, font, dx, domain){
   let charCount = dx/font.fontWidth;
   let date = new Date(value);
   let dt_seconds = (domain[1] - domain[0])/1000;

   if (dt_seconds > TimeToSecondsMap.year){
      return date.toLocaleDateString('en-US');
   }
   else if (dt_seconds > TimeToSecondsMap.month){
      return date.toLocaleDateString('en-US', {day: 'digit', month: 'digit'});
   }
   else if (dt_seconds > TimeToSecondsMap.week){
      return date.toLocaleDateString('en-US', {day: 'digit', month: 'digit'});
   }
   else if (dt_seconds > TimeToSecondsMap.day){
      let datestr = date.toLocaleDateString('en-US', {day: 'digit', month: 'digit'});
      let timestr = date.toLocaleTimeString('en-US', {
         hour: 'digit', minute: 'digit'});
      return datestr + ' ' + timestr;
   }

   if (charCount < 'mm/dd/yyyy hh:mm:dd pm'.length){
      return date.toLocaleTimeString();
   }
   return date.toLocaleDateString('en-US')
      + ' ' + date.toLocaleTimeString();
}


/** Return suggested number of ticks for an axis size
 *
 * @param {number} length axis size in pixels
 * @return {number} suggested tick count
 */
export function tickCountHint(length){
   if (length < 150){
      return 3;
   }
   if (length < 250){
      return 5;
   }
   if (length < 500){
      return 6;
   }
   if (length < 800){
      return 8;
   }

   return 10;
}
