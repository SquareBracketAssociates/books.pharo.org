# A simple reflective object kernel

This book explains the design of a simple reflective kernel, namely ObjVLisp and its consequences. 
The design is illustrated by proposing to the reader to implement step by step this kernel in Pharo.

The goals of this implementation are to give a concrete understanding of the concepts.
Here are some of the points you can deeply understand while writing reading and implementing this model:

- What is a possible object structure?
- What is object allocation and initialization?
- What is class initialization?
- What is the semantics of the method lookup?
- What is a reflective kernel?
- What are the roles of the classes `Class` and `Object`?
- What is the role of a metaclass?

Further are to study the reflective kernel of Pharo as described in Pharo by example [http://book.pharo.org](http://book.pharo.org) and explained in the Pharo Mooc [http://mooc.pharo.org](http://mooc.pharo.org) and in particular in this video: 
[http://rmod-pharo-mooc.lille.inria.fr/MOOC/PharoMOOC-Videos/EN/Week7/C019SD-W7-S3-EN-V1.mp4](http://rmod-pharo-mooc.lille.inria.fr/MOOC/PharoMOOC-Videos/EN/Week7/C019SD-W7-S3-EN-V1.mp4)
