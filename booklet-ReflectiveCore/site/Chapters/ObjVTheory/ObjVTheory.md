## A minimal reflective class-based kernel


_The difference between classes and objects has been repeatedly emphasized. In the view presented here, these concepts belong to different worlds: the program text only contains classes; at run-time, only objects exist. This is not the only approach. One of the subcultures of object-oriented programming, influenced by Lisp and exemplified by Smalltalk, views classes as objects themselves, which still have an existence at run-time._ — B. Meyer, Object-Oriented Software Construction  {!citation|ref=Meye88b!}

As this quote expresses it, there is a realm where classes are true objects, instances of other classes. In such systems as Smalltalk, Pharo {!citation|ref=Blac09a!}, CLOS {!citation|ref=Stee90a!}, classes are described by other classes and form often reflective architectures each one describing the previous level. In this chapter, we will explore a minimal reflective class-based kernel, inspired by ObjVlisp. In the following chapter, you will implement step by step such a kernel with less than 30 methods.

### ObjVlisp inspiration


ObjVlisp was published for the first time in 1987 when the foundation of object-oriented programming was still emerging {!citation|ref=Coin87a!}. ObjVlisp has explicit metaclasses and supports metaclass reuse. It was inspired by the kernel of Smalltalk-78. The IBM SOM-DSOM kernel is similar to ObjVLisp while implemented in C++ {!citation|ref=Form99a!}. ObjVlisp is a subset of the reflective kernel of CLOS (Common Lisp Object System) since CLOS reifies instance variables, generic functions, and method combinations. It is the equivalent of the Closette implementation {!citation|ref=Kicz91a!}. In comparison to ObjVlisp, Smalltalk, and Pharo have implicit metaclasses and no metaclass reuse except by basic inheritance. However, they are more stable as explained by Bouraqadi et al  {!citation|ref=Bour98a!}.

Studying this kernel is really worth it since it has the following properties:
- It unifies classes and instances (there is only one data structure to represent all objects, classes included).
- It is composed of only two classes `Class` and `Object` (it relies on existing elements such as booleans, arrays, and strings of the underlying implementation language).
- It raises the question of meta-circularity infinite regression (a class is an instance of another class that is an instance of yet another class, etc.) and how to resolve it.
- It requires consideration of allocation, class, and object initialization, message passing as well as the bootstrap process.
- It can be implemented in less than 30 methods in Pharo.

Just remember that this kernel is self-described. We will start to explain some aspects, but since everything is linked, you may have to read the chapter twice to fully get it.

### ObjVLisp's six postulates

The original ObjVlisp kernel is defined by six postulates {!citation|ref=Coin87a!}. Some of them look a bit dated by modern standards, and the 6th postulate is simply wrong as we will explain later (a solution is simple to design and implement).

Here are the six postulates as stated in the paper for the sake of historical perspective.

- P1. An object represents a piece of knowledge and a set of capabilities.
- P2. The only protocol to activate an object is message passing: a message specifies which procedure to apply (denoted by its name, the selector) and its arguments.
- P3. Every object belongs to a class that specifies its data (attributes called fields) and its behavior (procedures called methods). Objects will be dynamically generated from this model; they are called instances of the class. Following Plato, all instances of a class have the same structure and shape but differ through the values of their common instance variables.
- P4. A class is also an object, instantiated by another class, called its metaclass. Consequently (P3), to each class is associated with a metaclass which describes its behavior as an object. The initial primitive metaclass is the class `Class`, built as its own instance.
- P5. A class can be defined as a subclass of one (or many) other class(es). This subclassing mechanism allows the sharing of instance variables and methods and is called inheritance. The class `Object` represents the most common behavior shared by all objects.
- P6. If the instance variables owned by an object define a local environment, there are also class variables defining a global environment shared by all the instances of the same class. These class variables are defined at the metaclass level according to the following equation: class variable \[an-object\] = instance variable \[an-object’s class\].



### Kernel overview


If you do not fully grasp the following overview, don't worry. This full chapter is here to make sure that you will understand it.
Let us get started.

Contrary to a real uniform language kernel, ObjVlisp does not consider arrays, booleans, strings, numbers or any other elementary objects as part of the kernel as this is the case in a real bootstrap such as the one of Pharo. ObjVLisp's kernel focuses on understanding `Class`/`Object` core relationships.

Figure *@fig:ObjVlisp@* shows the two core classes of the kernel:
- `Object` which is the root of the inheritance graph and is an instance of `Class`.
- `Class` is the first class and root of the instantiation tree and instance of itself as we will see later.


![The ObjVlisp kernel: a minimal class-based kernel. % width=60&label=fig:ObjVlisp](figures/ObjVlispMore.pdf)


Figure *@withSing@* shows that the class `Workstation` is an instance of the class `Class` since it is a class and it inherits from `Object` the default behavior objects should exhibit. The class `WithSingleton` is an instance of the class `Class` but in addition, it inherits from `Class`, since this is a metaclass: its instances are classes. As such, it changes the behavior of classes. The class `SpecialWorkstation` is an instance of the class `WithSingleton` and inherits from `Workstation`, since its instances exhibit the same behavior as `Workstation`.

 ![The kernel with specialized metaclasses. % width=70&label=withSing](figures/ObjVlispSingleton.pdf)

The two diagrams *@fig:ObjVlisp@* and *@withSing@* will be explained step by step throughout this chapter.

!!note The key point of understanding such a reflective architecture is that message passing always looks up methods in the class of the receiver of the message and then follows the inheritance chain (See Figure *@fig:kernel2@*).

![Understanding metaclasses using message passing. % width=90&label=fig:kernel2](figures/ObjVlispSingleton2.pdf)

Figure *@fig:kernel2@* illustrates two main cases:
- When we send a message to `BigMac` or `Minna`, the corresponding method is looked up in their corresponding classes `Workstation` or `SpecialWorkstation` and follows the inheritance link up to `Object`.
- When we send a message to the classes `Workstation` or `SpecialWorkstation`, the corresponding method is looked up in their class, the class `Class` and up to `Object`.

### Conclusion

ObjVLisp is a minimal kernel with its two main classes. It uses the infrastructure of the underlying language (integers, strings, booleans...). When the language is fully reflective such as Pharo all such infrastructure has to be defined at the same level as the class `Object` and `Class` but the model principles stay the same.















## Diving into the kernel

In this chapter, we will describe one by one all the aspects of the kernel. 
We will cover instance shapes, methods,  instance and inheritance relationship interplay, object allocation, object and class initialization...


### Instances


In this kernel, there is only one instantiation link; it is applied at all levels as shown by Figure  *@fig:Instantiation@*:
% +Simple instances.>file://figures/Ref-Instances.png|width=50|label=fig:Instances+
- Terminal instances are objects: a workstation named `mac1` is an instance of the class `Workstation`, a point `10@20` is an instance of the class `Point`.
- Classes are also objects (instances) of other classes: the class `Workstation` is an instance of the class `Class`, and the class `Point` is an instance of the class `Class`.


![Chain of instantiation: classes are objects, too. % width=80&label=fig:Instantiation](figures/Ref-InstantiationLink.pdf)

In our diagrams, we represent objects (mainly terminal instances) as rounded rectangles with a list of instance variable values.
Since classes are objects, _when we want to stress that classes are objects_ we use the same graphical convention as shown in Figure *@fig:PointClassAsObject@*.


#### Handling infinite recursion


A class is an object. Thus it is an instance of another class, its metaclass. This metaclass is an object, too, an instance of a metametaclass that is an object, too, an instance of another metametametaclass, etc. To stop this potential infinite recursion, ObjVlisp is similar to solutions proposed in many meta-circular systems: one instance (e.g., `Class`) is an instance of itself.

In ObjVLisp:
- `Class` is the initial class and metaclass,
- `Class` is an instance of itself, and, directly or indirectly, all other metaclasses are instances of `Class`.


We will see later the implication of this self-instantiation at the level of the class structure itself.

### Understanding metaclasses


The model unifies classes and instances. It follows from the instance-related postulates of the kernel that:
- Every object is an instance of a class,
- A class is an object instance of a metaclass, and
- A metaclass is only a class that generates classes.


At the implementation level, there is only one kind of entity: objects. There is no special treatment for classes. Classes are instantiated following the same process as terminal instances. They are sent messages in the same way that other objects are sent messages.

This unification between instances and classes does not mean that objects and classes have the same distinction.
Indeed not all the objects are classes. In particular, the sole difference between a class and an instance is the ability to respond to the creation message: `new`. Only a class knows how to respond to it. Then, metaclasses are just classes whose instances are classes as shown in Figure *@fig:InstantiationPap@*.

![Everything is an object. Classes are just objects that can create other objects, and metaclasses are just classes whose instances are classes. %width=45&label=fig:InstantiationPap](figures/instancePatatoid.pdf )


### Instance structure

The model does not really bring anything new about instance structure when compared with languages such as Pharo or Java.

Instance variables are represented as a list of instance variable defined by a class. Such
instance variables are shared by all instances.
The _values_ of such instance variables are specific to each instance.
Figure *@fig:Ref-Instances@* shows that instances of `Workstation` have two values: a name and a next node.


![Instances of `Workstation` have two values: their names and their next node.%width=60&label=fig:Ref-Instances](figures/Ref-Instances.pdf )

In addition, we note that an object has a pointer to its class. As we will see when we discuss inheritance later on, every object possesses an instance variable class (inherited from `Object`) that points to its class.


Note that this management of a class instance variable defined in `Object` is specific to the model.
In Pharo for example, the class identification is not managed as a declared instance variable, but as an element part of any object. It is an index in a class table.

### About behavior


Let us continue with basic instance behavior. As in modern class-based languages, this kernel has to represent how methods are stored and looked up.

Methods belong to a class. They define the behavior of all the instances of the class.
They are stored in a method dictionary that associates a key (the method selector) and the method body.

Since methods are stored in a class, the method dictionary should be described in the metaclass. Therefore, the method dictionary of a class is the _value_ of the instance variable `methodDict` defined on the metaclass `Class`. Each class will have its own method dictionary.

### Class as an object


Here is the minimal information that a class should have:
- A list of instance variables to describe the values that the instances will hold,
- A method dictionary to hold methods,
- A superclass to look up inherited methods.


This minimal state is similar to that of Pharo: the Pharo `Behavior` class has a format (compact description of instance variables), a method dictionary, and a superclass link.

In ObjVLisp,  we have a name to identify the class. As an instance factory, the metaclass `Class` possesses four instance variables that describe a class:
- name, the class name,
- superclass, its superclass (we limit to single inheritance),
- iv, the list of its instance variables, and
- methodDict, a method dictionary.


Since a class is an object, a class has the instance variable `class` inherited from `Object` that refers to its class as any object.

![`Point` class as an object. % width=70&label=fig:PointClassAsObject](figures/Ref-PointClassAsObject.pdf)

#### Example 1: class Point


Figure *@fig:PointClassAsObject@* shows the instance variable values for the class `Point` as declared by the programmer and before class initialization and inheritance take place.
- It is an instance of class `Class`: indeed this is a class.
- It is named `'Point'`.
- It inherits from class `Object`.
- It has two instance variables: `x` and `y`. Once the static inheritance of instance variables occurs, it will be three instance variables: `class`, `x`, and `y`.
- It has a method dictionary.



![`Class` as an object. % width=70&label=fig:ClassClassAsObject](figures/Ref-ClassClassAsObject.pdf)

#### Example 2: class Class


Figure *@fig:ClassClassAsObject@* describes the class `Class` itself. Indeed it is also an object.
- It is an instance of class `Class`: indeed this is a class.
- It is named `'Class'`.
- It inherits from class `Object`
- It has four locally defined instance variables: `name`, `superclass`, `iv`, and  `methodDict`.
- It has a method dictionary.


![Through the prism of objects. % width=70&label=fig:Instanceshier](figures/Ref-InstanceGlobalPicture.pdf)

#### Everything is an object


Figure *@fig:Instanceshier@* describes a typical situation of terminal instances, classes, and metaclasses when viewed from an object perspective.
We see three levels of instances: terminal objects (`mac1` and `mac2` which are instances of `Workstation`), class objects (`Workstation` and `Point` which are instances of `Class`) and the metaclass (`Class` which is an instance of itself).

![Sending a message is a two-step process: method lookup and execution. % width=48&label=fig:ToSteps](figures/InheritanceDiagram-sendingMessage.pdf)


### Sending a message

@sec_message

In this kernel, the second postulate states that the only way to perform computation is via message passing.

Sending a message is a two-step process as shown by Figure *@fig:ToSteps@*:
1. Method lookup: the method corresponding to the selector is looked up in the class of the receiver and its superclasses.
1. Method execution: the method is applied to the receiver. This means that `self` or `this` in the method will be bound to the receiver.


Conceptually, sending a message can be described by the following function composition:

```
sending a message (receiver argument)
	 return apply (lookup (selector classof(receiver) receiver) receiver arguments)
```



#### Method lookup

Now the lookup process is conceptually defined as follows:
1. The lookup starts in the **class** of the **receiver**.
1. If the method is defined in that class (i.e., if the method is defined in the method dictionary), it is returned.
1. Otherwise the search continues in the superclass of the currently explored class.
1. If no method is found and there is no superclass to explore (if we are in the class `Object`), this is an error (i.e., the method is not defined).


![Looking for a method is a two-step process: first, go to the class of receiver then follow inheritance. % width=58&label=fig:LookupNoError](figures/Ref-LookupNoError.pdf)

The method lookup walks through the inheritance graph one class at a time using the superclass link. Here is a possible description of the lookup algorithm that will be used for both instance and class methods.

```
lookup (selector class receiver):
   if the method is found in class
      then return it
      else if class == Object
           then send the message error to the receiver
           else lookup (selector superclass(class) receiver)
```


![When a message is not found, another message is sent to the receiver supporting reflective operation. % width=65&label=fig:LookupWithError](figures/Ref-LookupWithError.pdf)



### Handling unknown messages


When the method is not found, the message `error` is sent as shown in Figure *@fig:LookupWithError@*. Sending a message instead of simply reporting an error using a trace or an exception is a key design decision. In Pharo, this is done via the `doesNotUnderstand:` message, and it is an important reflective hook. Indeed classes can define their own implementation of the method `error` and perform specific actions to the case of messages that are not understood.  For example, it is possible to implement proxies (objects representing other remote objects) or compile code on the fly by redefining such a message locally.

Now it should be noted that the previous algorithm has a limitation when a missing method has an arbitrary number of arguments. They are not passed to the `error` message. A better way to handle this is to decompose the algorithm differently as follows:

```
lookup (selector class):
   if the method is found in class
      then return it
      else if class == Object
           then return nil
           else lookup (selector superclass(class))
```


And then we redefined sending a message as follows:

```
sending a message (receiver argument)
   methodOrNil = lookup (selector classof(receiver)).
   if methodOrNil is nil
      then send the message error to the receiver
      else return apply(methodOrNil receiver arguments)
```


#### Remarks

This lookup is conceptually the same as in Pharo where all methods are public and virtual. There are no statically bound methods; even class methods are looked up dynamically. This allows for defining very elegant and dynamic registration mechanisms.

While the lookup happens at runtime, it is often cached. Languages usually have several systems of caches, e.g., global (class, selector), one per call site, etc.

### Inheritance


In this kernel, there are two aspects of inheritance to consider:

- One static for the case where subclasses get superclass state. This instance variable inheritance is static in the sense that it happens only once at class creation time, i.e., at compilation time.


- One dynamic for behavior where methods are looked up during program execution. In this case, the inheritance tree is walked at run time.


Let's look at these two aspects.

#### Instance variable inheritance

Instance variable inheritance is done at class creation time. From that perspective, it is static and performed once.
When a class `C` is created, its instance variables are the union of the instance variables of its superclass
and the instance variables defined locally in class `C`.
Each language defines the exact semantics of instance variable inheritance, for example, if they accept instance variables with the same name or not. In our model, we decide to use the simplest way: there should be no duplicate names.

```
instance-variables(aClass) =
	union (instance-variables(superclass(aClass)), local-instance-variables(aClass))
```


A word about the union of instance variables: when the implementation of the language is based on offsets to access instance variables, the union should make sure that the locations of inherited instance variables are kept ordered compared to the superclass. In general, we want to be able to apply methods of the superclass to subclasses without copying them down and recompiling them. Indeed if a method uses a variable at a given position in the instance variable lists, applying this method to instances of subclasses should work.
In the implementation proposed next chapter, we will use accessors and will not support direct access to instance variables from a method body.

#### Method lookup

As previously described in Section *@sec_message@*, methods are looked up at runtime.
Methods defined in superclasses are reused and applied to instances of subclasses.
Contrary to instance variable inheritance, this part of inheritance is dynamic, i.e., it happens during program execution.


### Object: defining the minimal behavior of any object


`Object` represents the minimal behavior that any object should understand, e.g., returning the class of the object, being able to handle errors, and initializing the object.
This is why `Object` is the root of the hierarchy. Depending on the language, `Object` can be complex. In our kernel it is kept minimal as we will show in the implementation chapter.

Figure *@fig:inheritancegraph@* shows the inheritance graph without the presence of instantiation.
A Workstation is an object (i.e., it should at least understand the minimal behavior), so the class `Workstation` inherits directly or indirectly from the class `Object`.
A class is also an object (i.e., it should understand the minimal behavior) so the class `Class` inherits from the class `Object`. In particular, the `class` (note the lowercase) instance variable is inherited from `Object` class.


![Full inheritance graph: Every class ultimately inherits from `Object`. %width=45&label=fig:inheritancegraph](figures/Ref-InheritanceGraph.pdf )



#### Remark

In Pharo, the class `Object` is not the root of inheritance. The root is in fact `ProtoObject`, and `Object` inherits from it. Most of the classes still inherit from `Object`. The design goal of `ProtoObject` is special: It supports the maximum generation of errors. Such errors can be captured via redefinition of the message `doesNotUnderstand:`
and can support different scenarios such as implementing proxies.

### Inheritance and instantiation together


Now that we have seen the instantiation and the inheritance graphs, we can examine the complete picture.
Figure *@fig:kernel22@* shows the graphs and in particular how such graphs are used during message resolution:
- the instantiation link is used to find the starting class to look for any methods associated with the received message.
- the inheritance link is used to find inherited methods.


This process is the same when we send messages to the classes themselves. There is no difference between sending a message to an object or a class. The system _always_ performs the same steps.

![Kernel with instantiation and inheritance link. % width=60&label=fig:kernel22](figures/Ref-KernelTwo.pdf)



### Review of self and super semantics


Since our experience showed us that even some book authors got the essential semantics of object-oriented programming wrong, we review here some facts that programmers familiar with object-oriented programming should master. For further readings refer to _Pharo By Example_ or the Pharo Mooc available at [http://mooc.pharo.org](http://mooc.pharo.org).

As explained in Section *@sec_message@*, sending a message to an object always starts the lookup the corresponding method in the class of the receiver.

Now we should distinguish two cases: `self` and `super`.
In the body of a method, both `self` (also called `this` in languages like Java) and `super` always represent the receiver of the message. Yes you read it well, both `self` and `super` always represent the receiver!

The difference lies in the class from where the lookup starts:

- For **self**. When a message is sent to `self`, the lookup of the method to execute starts in the class of the receiver.


When a message is sent to `super`, the lookup starts in the superclass of the method's class.

- For **super**. When a message is sent to `super`, the method lookup starts in the superclass of the class containing the super expression.


This distinction between **self** and **super** is required to handle the case where a method is redefined locally in a class but that you need to invoke the behavior defined in its superclasses. Note that the superclass method may be defined not in a direct superclass but one of the class ancestor, so there is a need for a method lookup and this method lookup should start above the method redefined it (here the method containing the **super** expression). Hence the name **super**.

Note that the lookup of a method in the case of `super` does not look in the superclass of the class of the receiver, since this would mean that it may loop forever in the case of inheritance tree with three classes.


Looking at Figure *@fig:LookupWithSelfInSuperclassMethod@*  we see that the key point is that `B new bar` returns 50 since
the method is dynamically looked up and self represents the receiver, i.e., the instance of the class `B`. What is important to see is that sendings of `self` act as a hook and that subclasses' code can be injected in superclass code.

```
A new foo
>>> 10
B new foo
>>> 50
A new bar
>>> 10
B new bar
>>> 50
```


![self always represents the receiver. %width=40&label=fig:LookupWithSelfInSuperclassMethod](figures/LookupWithSelfInSuperclassMethod.pdf)

![Sequence diagram of self always represents the receiver. %width=60&label=fig:SelfLookupSequenceDiagram](figures/SelfLookupSequenceDiagram.pdf )


For `super`, the situation depicted in Figure *@fig:LookupWithSuperInSuperclassMethodThreeClasses@* shows that `super` represents the receiver, but that when `super` is the receiver of a message, the method is looked up differently (starting from the superclass of the class using super) hence `R new bar` returns 100, but neither 20 nor 60.

![super represents the receiver, but the method lookup starts in the superclass of the class of the method using super. %width=40&label=fig:LookupWithSuperInSuperclassMethodThreeClasses](figures/LookupWithSuperInSuperclassMethodThreeClasses2.pdf)

```
Q new bar
>>> 20
R new bar
>>> 100
```


As a conclusion, we can say that `self` is dynamic and `super` static. Let us explain this view:
- When sending a message to `self` the lookup of the method begins in the class of the receiver. `self` is bound at execution-time. We do not know its value until execution time.
- `super` is static in the sense that while the object it will point to is only known at execution time, the place to look for the method is known at compile time: it should start to look in the class above the one containing super.


### Object creation

Now we are ready to understand the creation of objects. In this model, there is only one way to create instances: we should send the message `new` to the class with a specification of the instance variable values as arguments.

### Creation of instances of the class Point

The following examples show several point instantiations. What we see is that the model inherits from the Lisp tradition of passing arguments using keys and values, and that the order of arguments is not important.

```
Point new :x 24 :y 6
>>> aPoint (24 6)
Point new :y 6 :x 24
>>> aPoint (24 6)
```


When there is no value specified, the value of an instance variable is initialized to nil. 
It is worth to see that in CLOS (Common Lisp Object System) {!citation|ref=Stee90a!}  provides the notion of default values for instance variable initialization. It can be added to ObjVlisp as an exercise and does not bring conceptual difficulties.

```testcase=true
Point new
>>> aPoint (nil nil)
```


When the same argument is passed multiple times, then the implementation takes the first occurrence.
```testcase=true
Point new :y 10 :y 15
>>> aPoint (nil 10)
```


We should not worry too much about such details: The point is that we can pass multiple arguments with a tag to identify them.

### Creation of the class Point instance of Class

Since the class `Point` is an instance of the class `Class`, to create it, we should send the message `new` to the class as follows:

```testcase=true
Class new
   :name 'Point'
   :superclass 'Object'
   :iv #(x y)
>>> aClass
```


What is interesting to see here is that we use exactly the same way to create an instance of the class `Point` as the class itself.
Note that the possibility of having the same way to create objects or classes is also due to the fact that the arguments are specified using a list of pairs.

An implementation could have two different messages to create instances and classes. As soon as the same `new`, `allocate`, or `initialize` methods are involved, the essence of the object creation is similar and uniform.

#### Instance creation: Role of the metaclass


The following diagram (Figure *@fig:metaclassrole@*) shows that despite what one might expect when we create a terminal instance the metaclass `Class` is involved in the process. Indeed, we send the message `new` to the class, to resolve this message, the system will look for the method in the class of the receiver (here `Workstation`) which is the metaclass `Class`. The method `new` is found in the metaclass and applied to the receiver, the class `Workstation`. Its effect is to create an instance of the class `Workstation`.

![Metaclass role during instance creation: Applying plain message resolution. Right: situation before - Left: situation after the instance creation.% width=68&label=fig:metaclassrole](figures/Ref-InstanceCreationMetaclassRole.pdf)

The same happens when creating a class. Figure *@fig:ClassCreation@* shows the process. We send a message, now this time, to the class `Class`. The system makes no exception and to resolve the message, it looks for the method in the class of the receiver. The class of the receiver is itself, so the method `new` found in `Class` is applied to `Class` (the receiver of the message), and a new class is created.

![Metaclass role during class creation: Applying plain message resolution - the self instantiation link is followed. % width=65&label=fig:ClassCreation](figures/Ref-ClassCreation.pdf)

#### new = allocate and initialize

Creating an instance is the composition of two actions: a memory allocation `allocate` message and an object initialization message `initialize`.

In Pharo syntax, it means:
```
aClass new: args = (aClass allocate) initialize: args
```


We should see the following:
- The message `new` is a message sent to a class. The method `new` is a class method.
- The message `allocate` is a message sent to a class. The method `allocate` is a class method.
- The message `initialize:` will be executed on any newly created instance. If it is sent to a class, a class `initialize:` method will be invoked. If it is sent to a terminal object, an instance `initialize:` method will be executed (defined in `Object`).



#### Object allocation: the message allocate

Allocating an object means allocating enough space to the object state but there's more: instances should be marked with their class name or id. There is an invariant in this model and in general in object-oriented programming models. Every single object must have an identifier to its class, else the system will break when trying to resolve a message.

Object allocation should return a newly created instance with:
- empty instance variables (pointing to nil for example);
- an identifier to its class.


In the ObjVLisp model, the marking of an object as an instance of a class is performed by setting the value of the instance variable `class` inherited from `Object`. In Pharo, this information is not recorded as an instance variable but encoded in the internal object representation in the virtual machine.

The `allocate` method is defined on the metaclass `Class`. Here are some examples of allocation.

```testcase=true
Point allocate
>>> #(Point nil nil)
```

A point allocation allocates three slots: one for the class and two for x and y values.

```testcase=true
Class allocate
>>> #(Class nil nil nil nil nil)
```


The allocation for an object representing a class allocates six slots: one for class and one for each of the class instance variables: `name`, `super`, `iv`, `keywords` (see below), and `methodDict`.

#### Object initialization

Object initialization is the process of passing arguments as key/value pairs and assigning the value(s) to the corresponding instance variable(s).

This is illustrated in the following snippet. An instance of class `Point` is created and the key/value pairs (:y 6) and (:x 24) are
specified. In the following snippet `:y` and `:x` are keywords in ObjVLisp parlance. 
They are built automatically from the instance variables and are used to uniquely identify values. 

In the following snippet, the instance is created and it receives the `initialize:` message with the key/value pairs.
The `initialize:` method is responsible for setting the corresponding variables in the receiver.

```
Point new :y 6  :x 24
>>> #(Point nil nil) initialize: (:y 6 :x 24)]
>>> #(Point 24 6)
```


When an object is initialized as a terminal instance, two actions are performed:
- First, we should get the values specified during the creation, i.e., get that the y value is 6 and the x value is 24,
- Second, we should assign the values to the corresponding instance variables of the created object.


#### Class initialization

During its initialization, a class should perform several steps:

- First, as with any initialization it should get the arguments and assign them to their corresponding instance variables. This is basically implemented by invoking the `initialize` method of `Object` via a super call, since `Object` is the superclass of `Class`.
- Second the inheritance of instance variables should be performed. Before this step, the class `iv` instance variable just contains the instance variables that are locally defined. After this step, the instance variable `iv` will contain all the instance variables inherited and local. In particular, this is where the `class` instance variable inherited from `Object` is added to the instance variables list of the subclass of `Object`.
- Third the class should be declared as a class pool or namespace so that programmers can access it via its name.


### The Class class


Now we get a better understanding of what is the class `Class`:
- It is the initial metaclass and initial class.
- It defines the behavior of all the metaclasses.
- It defines the behavior of all the classes.


In particular, metaclasses define three messages related to instance creation.
- The `new` message, which creates an initialized instance of the class. It allocates the instance using the class message `allocate` and then initializes it by sending the message `initialize:` to this instance.
- The `allocate` message. Like the message `new`, it is a class message. It allocates the structure for the newly created object.
- Finally the message `initialize:`. This message has two definitions, one on `Object` and one on `Class`.

There is a difference between the method `initialize:` executed on any instance creation and the class `initialize:` method only executed when the created instance is a class.

- The first one is a method defined on the class of the object and potentially inherited from `Object`.  This `initialize:` method just extracts the values corresponding to each instance variable from the argument list and sets them in the corresponding instance variables.


- The class `initialize:` method is executed when a new instance representing a class is executed. The message `initialize:` is sent to the newly created object but its specialization for classes will be found during method lookup and it will be executed. Usually, this method invokes the default ones, because the class parameter should be extracted from the argument list and set in their corresponding instance variables. But in addition, instance variable inheritance and class declaration in the class namespace is performed.

### Conclusion 

At this stage you saw all the concepts of this minimal object-oriented kernel where classes are themselves instances of other classes.
In the following chapter, we explore more metaclasses and we encourage you to read it because it will shed an interesting light on the model.





















## First metaclasses

In this chapter, we will study how all the concepts explained in the previous chapter fit together to let us define powerful metaclasses. Studying such entities will reinforce your understanding of the instantiation and inheritance relationships as well as their interplay. At the end of the chapter, we will explain why the sixth predicate of ObjVLisp is wrong and propose a solution that elegantly fits the model.


### Defining a new Metaclass

Now we can study how we can add new metaclasses and see how the system handles them.
To create a new metaclass is simple; it is enough to inherit from an existing one. Maybe this is obvious to you, but this is what we will check now.

![Abstract metaclass: its instance (i.e., the class Node) is abstract. %width=64&label=fig:Abstract](figures/Ref-Abstract.pdf)

#### Abstract

Imagine that we want to define abstract classes. We state that a class is abstract if it cannot create instances.
To control the creation of instances of a class, we should define a new metaclass that forbids it.
Therefore we will define a metaclass whose instances (abstract classes) cannot create instances.

We create a new metaclass named `AbstractMetaclass` which inherits from `Class` and we redefine the method `new` in this metaclass to raise an error (as shown in Figure *@fig:Abstract@*). The following code snippet defines this new metaclass.

```
Class new
	:name 'AbstractMetaclass'
	:superclass 'Class'
```


```
AbstractMetaclass
	addMethod: #new
	body: [ :receiver :initargs | receiver error: 'Cannot create instance of class' ]
```


Two facts describe the relations between this metaclass and the class `Class`:
- `AbstractMetaclass` is a class, an instance of `Class`.
- `AbstractMetaclass` defines class behavior: It inherits from `Class`.


![Abstract metaclass at work: Using message passing as a key to navigate the graph. %width=64&label=fig:AbstractLookup](figures/Ref-AbstractLookup.pdf)

Now we can define an abstract class `Node` in ObjVLisp syntax:

```
AbstractMetaclass new 
	:name 'Node' 
	:super 'Object'
```


Sending a message `new` to the class `Node` will raise an error.
```testcase=true
Node new
>>> Cannot create instance of class
```


A subclass of `Node`, for example, `Workstation`, can be a concrete class by being an instance of `Class` instead of `AbstractMetaclass` but still inheriting from `Node`. What we see in Figure *@fig:AbstractLookup@* is that there are two links, instantiation and inheritance. The method lookup follows them as we presented previously. It always starts in the class of the receiver and follows the inheritance path.

What is key to understand is that when we send the message `new` to the class `Workstation`, we look for methods first in the metaclass `Class`. When we send the message `new` to class `Node`, we look in its class: `AbstractMetaclass` as shown in Figure *@fig:AbstractLookup@*. In fact we do what we do for any instances: we look at the class of the receiver.


A class method is just implemented and follows the same semantics as instance methods:
Sending the message `error` to the class `Node` starts in `AbstractMetaclass`. Since we did not redefine it locally and it is not found there, the lookup will continue in the superclass of `AbstractClass`: the class `Class` and then the superclass of class `Class`, the class `Object`.


### About class state


Imagine that we define a metaclass `WithSingleton` whose instances are classes that will have a unique instance. The situation is described in Figure *@fig:RefSing@*. The class `WithSingleton` inherits from `Class` since it wants to reuse all of the class mechanisms. It is also an instance of class `Class`, since `WithSingleton` is a class and it can create instances. The class `Node` is an instance of class `WithSingleton`. When it receives the message `new`, the method `new` defined in the class `WithSingleton`
is executed. 
If the unique instance variable is nil, it invokes the behavior defined in `Class` and stores it in the unique instance variable, and returns it.

![A WithSingleton metaclass: its instances can only have one instance. %width=72&label=fig:RefSing](figures/Ref-Singleton.pdf )

Several questions still should be asked and answered.

- What is the instance variable list for the `WithSingleton` metaclass?
- Where is the unique instance of the class `Node` or `Process` actually stored?



#### Instance variable of WithSingleton


As with any class, a subclass gets its instance variables as well as the instance variables of its superclass. Hence `WithSingleton` instance variables are the same as the one of `Class`, and it also has `unique` instance variable as shown in Fig. *@fig:RefSing2@*.

```
Singleton objIVs
>>> #(class name superclass iv keywords methodDict unique)
```


![Storing unique instance. %width=68&label=fig:RefSing2](figures/Ref-SingletonTwo.pdf)

#### Where is the singleton stored?


Each class instance of `WithSingleton` will have an additional value after its method dictionary. This is where the actual singleton of the class is stored.
The class `Node` and `Process` are instances of the metaclass `WithSingleton`. Therefore they have
one extra field in their structure to hold the unique instance variable values.
Each instance of `WithSingleton` will have its own value: the instance of class playing the singleton role.



### About the 6th postulate

As mentioned at the start of this chapter, the 6th postulate of ObjVLisp is wrong. Let us read it again:

_"If the instance variables owned by an object define a local environment, there are also class variables defining a global environment shared by all the instances of a same class. These class variables are defined at the metaclass level according to the following equation: class variable \[an-object\] = instance variable \[an-object’s class\]."_

This says that class instance variables are equivalent to shared variables between instances, and this is wrong. Let us study this. According to the 6th postulate, a shared variable between instances is equal to an instance variable of the class. The definition is not totally clear so let us look at an example given in the article.

#### Illustrating the problem

Imagine that we would like the constant character '*' to be a class variable shared by all the points of the same class.
We redefine the `Point` class as before, but metaclass of which (let us call it `MetaPoint`) specifies this common character
For example, if a point has a shared variable named `char`, this instance variable should be defined in the class of the class `Point` called `MetaPoint`. The author proposes to define a new metaclass `MetaPoint` to hold a new instance variable to represent a shared variable between points.

```
Class new
	:name 'MetaPoint'
	:superclass 'Class'
	:iv #(char)
```


Then he proposes to use it as follows:

```
MetaPoint new
	:name Point
	:superclass 'Object'
	:iv #(x y)
	:char '*'
```


The class `Point` can define a method that accesses the character just by going to the class level.
So why is this approach is wrong? Because it mixes levels. The instance variable `char` is not class information. It describes the terminal instances and not the instance of the metaclass. Why would the _metaclass_ `MetaPoint` need a `char` instance variable?

#### The solution


The solution is that the shared variable `char` should be held in a list of the shared variables of the class `Point`. Any point instance can access this variable. The implication is that a _class_ should have extra information to describe it. That is, an instance variable `sharedVariable` holding pairs, i.e., variable and its value.  We should then be able to write:

```
Class new
	:name Point
	:superclass 'Object'
	:iv #(x y)
	:sharedivs {#char -> '*'}
```


Therefore the metaclass `Class` should get an extra instance variable named `sharedivs`, and each of its instances (the classes `Point`, `Node`, `Object`) can have different _values_. Such values can be shared among their instances by the compiler.

What we see is that `sharedivs` is from the `Class` vocabulary and we do not need an extra metaclass each time we want to share a variable. This design is similar to the one of Pharo where a class has a classVariable instance variable holding variables shared in all the subclasses of the class defining it.

### Conclusion

We presented a small kernel composed of two classes: `Object`, the root of the inheritance tree, and `Class`, the first metaclass root of the instantiation tree. We revisited all the key points related to method lookup, object and class creation, and initialization. In the subsequent chapter, we propose to you how to implement such a kernel.

#### Further readings


The kernel presented in this chapter is a kernel with explicit metaclasses and as such it is not a panacea. Indeed it results in problems with metaclass composition as explained in Bouraqadi et al.'s excellent article.
