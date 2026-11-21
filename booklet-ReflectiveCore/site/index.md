Back in the early 90's, when I was a student, built a theorem proving system in Common Lisp Object System.
It was a fun first contact with object-oriented programming, even if at the time I did not master all the aspects. 
The following year, we got an excellent lecture on meta-object programming by M. Blay Fornarino. 
I loved the lecture where we program metaclasses and mixins.  I realize now that it was quite advanced.

However, deep inside me, I knew that I did not fully understand what was the class `Object` or what was really a metaclass. Of course, I could repeat the lecture and look smart, but there was this little voice telling me that I wasn't 100\% sure. Then, I read the article of Pierre Cointe on ObjVlisp. I got blasted by the simplicity of the model.
I spent the next 2 days reimplementing the model because it was too much fun.
For me, it is the key to my deep understanding of class-based reflective systems.
Once I finished implementing it, I went to see my teacher and told her that she must teach it. She told me to do it.
Since then I've been teaching it.

Note that while the project is historically named ObjVlisp, it has not much to do with LISP. This kernel is similar to the one of Smalltalk-78 with explicit metaclasses. 
ObjVlisp is just a little conceptual framework but it provides a condensed view and explains the forces present in larger systems such as Pharo that share the _everything is an object_ mantra I love so much. 

This book explains the consequence of having classes as objects.
In addition, it describes the design and the consequences of having a self-described reflective minimal kernel.

By doing so we will learn deeply about objects, object creation instantiation, message lookup, delegation, inheritance, and much more.

I would like to thank Christopher Fuhrman for his large copy-edit pass and kksubbu, Imen Sayar, and René-Paul for their suggestions.

— Stéphane Ducasse


<!inputFile|path=Chapters/ObjVTheory/ObjVTheory.md!>

<!inputFile|path=Chapters/ObjV/ObjV.md!>

## Selected definitions


Smith was the first to introduce reflection in a programming language with 3Lisp. He defines reflection as:

- An entity's integral ability to represent, operate on, and otherwise deal with itself in the same way that it represents, operates on, and deals with its primary subject matter.


In the context of meta-object protocols, Bobrow refines the definition as follows:

- Reflection is the ability of a program to manipulate as data, something representing the state of the program during its own execution. There are two aspects of such manipulation: _introspection_ and _intercession_ \(...\) Both aspects require a mechanism for encoding the execution state as data; providing such an encoding is called _reification_.

Maes proposed some definitions for reflexive programming:

- A _computational system_ is something that _reasons_ about and _acts_ upon some part of the world, called the _domain_ of the system.


- A computational system may also be _causally connected_ to its domain. This means that the system and its domain are linked in such a way that if one of the two changes, this leads to an effect upon the other.


- A _meta-system_ is a computational system that has as its domain another computational system, called its _object-system_. \(...\) A meta-system has a representation of its object-system in its data. Its program specifies _meta-computation_ about the object-system and is therefore called a _meta-program_.


- _Reflection_ is the process of reasoning about and/or acting upon oneself.


- A _reflective system_ is a causally connected meta-system that has as object-system itself. The data of a reflective system contain, besides the representation of some part of the external world, also a causally connected representation of itself, called _self-representation_ of the system. \[...\] When a system is reasoning or acting upon itself, we speak of _reflective computation_.


- A language with a _reflective architecture_ is a language in which all systems have access to a causally connected representation of themselves.


- A programming environment has a _meta-level architecture_ if it has an architecture that supports meta-computation, without supporting reflective computation.


- The _meta-object_ of an object X represents the explicit information about X (e.g. about its behavior and its implementation). The object X itself groups the information about the entity of the domain it represents.



