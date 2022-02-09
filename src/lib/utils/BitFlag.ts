export const BitFlags = {
   set: function(value: number, flag: number) {
     // shorthand: value |= flag;
     return value | flag;
   },
   isSet: function(value: number, flag: number) {
     return (value & flag) == flag;
   },
   unSet: function(value: number, flag: number) {
     return value & ~flag;
   }

};
