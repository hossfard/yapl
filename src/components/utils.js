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
export function binarySearch(data, val, fn){
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
