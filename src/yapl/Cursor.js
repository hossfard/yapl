'use strict';



/** Convenience methods to interact with cursor
 */
export class Cursor{

   /** Set cursor type
    *
    * @see [MDN web docs]{@link https://developer.mozilla.org/en-US/docs/Web/CSS/cursor}
    *
    * @param {string} type cursor type
    */
   static set(type){
      document.body.style.cursor = type;
   }
}
