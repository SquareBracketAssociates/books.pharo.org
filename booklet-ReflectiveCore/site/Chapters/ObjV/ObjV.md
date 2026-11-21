## Getting started with the implementation


During the previous chapters, you saw the main conceptual points of the ObjVLisp model, now you will implement it. The objective of this chapter is to help you to implement step by step the model. 
To do so, we offer a skeleton of the implementation where key method bodies have been removed and replaced with an indication that you should implement them. In addition, a set of tests specifies the methods that are missing and that you should implement.
Making the tests pass will guide you during your implementation. 


### Preparation

In this section, we discuss the setup that you will use, the implementation choices, and the conventions that we will follow during the rest of this book.

#### Getting Pharo 11

You need to download and install Pharo from [http://www.pharo.org/](http://www.pharo.org/). You need a virtual machine, and a couple image and changes. 
The best way is to use the PharoLauncher that is available at [http://www.pharo.org/download](http://www.pharo.org/download).

You can also use [http://get.pharo.org](http://get.pharo.org) to get a script to download Pharo.

The current version of this book is working with Pharo 11.0.

```
wget -O- get.pharo.org/110+vm | bash
```

You can use the book _Pharo by Example_ from [http://www.pharo.org/PharoByExample/](http://www.pharo.org/PharoByExample/) for an overview of the syntax and the system.


#### Getting infrastructure definitions

All the necessary method or class definitions are provided as a package. It contains all the classes, the method categories, and the method signatures of the methods that you have to implement. It provides additional functionality that will make your life easy and help you to concentrate on the essence of the model. It contains also all the tests of the functionality you have to implement.

To load the code, execute the following expression:

```
Metacello new
  baseline: 'ObjV';
  repository: 'github://Ducasse/ObjVLispSkeleton/tree/master/src';
  load
```


#### Running tests

For each functionality, you will have to run some tests.

For example to run a particular test named `testPrimitiveStructure`,
- evaluate the expression `(ObjTest run: #testPrimitiveStructure)`, or
- click on the icon of the method named `testPrimitiveStructure`.


### Naming conventions

We use the following conventions: we name as _primitives_ all the Pharo methods that are used to build ObjVLisp. These primitives are mainly implemented as methods of the class `Obj`. Note that in a Lisp implementation, such primitives would be just lambda expressions, in a C implementation such primitives would be represented by C functions.

We also talk about _objInstances_, _objObjects_, and _objClasses_ to refer to
specific instances, objects, or classes defined in ObjVLisp.

To help you to distinguish between classes in the implementation language (Pharo) and the ObjVLisp model, we prefix all the ObjVLisp classes by `Obj`. Finally, some of the crucial and confusing primitives (mainly the class structure ones) are all prefixed by `obj`. 

For example, the primitive that given an _objInstance_ returns its class identifier is named `objClassId`.



### Helping develop the kernel

To help you implement step by step the kernel of ObjVLisp, we defined 
tests that you will be able to execute one by one for each new aspect of ObjVLisp that you will define.

The problem is that to run a test, the kernel should be fully finished and we are defining it step by step. So we are trapped. 
Now to make sure that you can execute tests as soon as you define a method, we implemented _manually_ some mocks of the objects that represent instances and classes in the ObjVLisp world: we basically created arrays and stuffed them with the correct information to mimick what the kernel once created will do.
If you look at the methods `setUp` of the test classes you will see how we created them. Now pay attention because the setups are often taking shortcuts, so do not copy them blindly.

Finally, if you want to interact with objects during your development, for example to check manually that a pharo method is working or to explore your objClasses you can simply define a test method and put a breakpoint using `self halt`.
When you execute this test, it will open a debugger and you will be able to execute code. For example the class `RawObjectTest` has several instances holding objects representing: the objClass `Object`, an objInstance of the objClass `Point`, the objClass `Point`.... Check the instance variables of the class `RawObjectTest`.

Figure *@fig:helping@* shows a method named `testBidouille` with a halt. It also shows that we can interact and send messages to the objects that were manually created. Here we executed the primitive `objName` on the objClass `pointClass` and it returned `#ObjPoint`.

![Interacting in the debugger with some objinstances.](figures/HelpCodingTestOpen.png width=90&label=fig:helping)






### Inheriting from class Array

We do not want to implement a scanner, a parser, and a compiler for ObjVLisp but concentrate on the essence of the language. That's why we chose to use as much as possible the implementation language, here Pharo.
In our implementation, every object in the ObjVLisp world is an instance of the class `Obj`.
The class `Obj` is a subclass of `Array`.

Since the Pharo class `Obj` is a subclass of the Pharo class `Array`, the following array `#(#ObjPoint 10 15)` represents an objInstance of the objClass `ObjPoint`. 
From an implementation point of view, this objClass `ObjPoint` is just an instance of the Pharo class `Obj`. 

As we will see:
- `#(#ObjPoint 10 15)` represents an objPoint (10,15). It is an objInstance of the objClass `ObjPoint`.
- `#(#ObjClass #ObjPoint #ObjObject #(class x y) #(:x :y) nil )` is the array that represents the objClass `ObjPoint`.


### Facilitating objClass class access
@giveclass
In the previous chapter, we wrote some expressions using some objClass such as `ObjPoint objIVs` that returns the instance variables of the objClass `ObjPoint`.

If you simply execute this expression in Pharo you will get an error. 
Indeed, the objClass `ObjPoint` is not a Pharo class and it is not known to Pharo: It is not added to the Pharo namespace and this is normal because it is another world.

The question is then how can we provide simple access to objClasses once they are created.
For this, we need a way to store and access ObjVLisp classes. 
As a solution, on the _class_ level of the Pharo class `Obj`, we defined a dictionary holding the defined classes.
The keys of this dictionary are the objClass names and the values are the objClasses with the corresponding name.
This dictionary acts as the namespace for our language. We defined the following methods to store and access defined classes.

- `declareClass: anObjClass` stores the objInstance `anObjClass` given as an argument in the class repository \(here a dictionary whose keys are the class names and values the ObjVLisp classes themselves\).

- `giveClassNamed: aSymbol` returns the ObjVLisp class named `aSymbol` if it exists. The class should have been declared previously.

With such methods, we can write code like the following:
Here we get access to the objClass `ObjPoint`.

```testcase=false
Obj giveClassNamed: #ObjPoint
>>> #(#ObjClass 'ObjPoint' #ObjObject #(class x y) #(:x :y) ... )
```

Then we can access some of its state.  For example we access the instance variables of the class as follows: 

```testcase=true
(Obj giveClassNamed: #ObjPoint) objIVs
>>>  #(class x y)
```

To make class access less heavy, we also implemented a shortcut:
We trap messages not understood sent to `Obj` and look into the defined class dictionary.
Since `ObjPoint` is an unknown message, this same code is then written as:

```testcase=true
Obj ObjPoint
>>> #(#ObjClass 'ObjPoint' #ObjObject #(class x y) #(:x :y) ... )
```

Now you are ready to start.

## Primitives for a reflective class-based kernel

Now that all the infrastructure has been explained you are ready to start.
The first tasks are to define how we will manipulate objObjects. We will define Pharo methods that will act
as primitive functionalities to build later the language kernel.
Such primitives could be written in C, assembly or any other languages. They are the low-level  functionalities on top of which we will build the object model of ObjVLisp: mainly the class `ObjObject` and `ObjClass`.

### Structure and primitives

The first issue is how to represent objects. We have to agree on an initial representation. In this implementation, we chose to represent the objInstances as arrays (instances of `Obj` a subclass of `Array`). In the following, we use the term 'array' for talking about instances of the class `Obj`.

#### Your job.

Check that the class `Obj` exists and inherits from `Array`.

### Structure of a class

The first object that we will have to create is the class `ObjClass`. Therefore we
focus now on the minimal structure of the classes in our language.

An objInstance representing a class has the following structure: an identifier to its class, a name, an identifier to its superclass (we limit the model to single inheritance), a list of instance variables, a list of initialization keywords, and a method dictionary.

For example, the class `ObjPoint` has the following structure:

```
#(#ObjClass #ObjPoint #ObjObject #(class x y) #(:x :y) nil)
```



It means that the objClass `ObjPoint` is an instance of `ObjClass`, is named `#ObjPoint`, inherits from a class named `ObjObject`, has three instance variables, two initialization keywords, and an uninitialized method dictionary. To access this structure we define some primitives as shown in Figure *@fig:structure@*.


![Class structure representation.](figures/ClassRepresentationAsArray.pdf width=50&label=fig:structure)

To avoid manipulating numbers we defined some  Pharo methods returning the corresponding 
constants of the object and class structure. These methods start with the `offset` term.
We have `offsetForClassIdId`, `offsetForName`, `offsetOfSuperclassId`, and more. 
Figure *@fig:offset@* shows how offsets are used to access the information of an objClass.

Here is the definition of `offsetForName`: It just defines that given an objobject representing an objclass the name of the class is located at the second position.

```
Obj >> offsetForName
	^ 2
```	
Using the method `offsetForName` we can simply define a Pharo primitive named `objName` that returns the name of a class
as follows: 

```
Obj >> objName
	^ self at: self offsetForName
```	

The corresponding setter `objName:` is then defined as follows:

```
Obj >> objName: aString 
	^ self at: self offsetForName put: aString
```	


![Using offset to access information.](figures/AccessObjName.pdf width=45&label=fig:offset)


#### Your job.

 The test methods of the class `RawObjTest` that are in the categories `'step01-tests-structure of objects'` and `'step02-tests-structure of classes'` give some examples of structure accesses.
Here are two examples of such test methods: 
```
RawObjTest >> testPrimitiveStructureObjClassId
   self assert: pointClass objClassId equals: #ObjClass

RawObjTest >> testPrimitiveStructureObjIVs
   self assert: pointClass objIVs equals: #(#class #x #y)
```

#### Access of ClassId for any objects.

Using the method `offsetForClassIdId`, implement in protocol `'object structure primitives'` the primitives `objClassId` and `objClassId: aSymbol`. The receiver is an `objObject`. This means that this primitive can be applied on any objInstances (be it a class or an instance such as a point objObject) to get its class identifier. 
Execute the test method `testPrimitiveStructureObjClassId`.

#### Class structure access.
Now we can focus on the other primitives that give access to class information.

Implement in protocol `'class structure primitives'` the primitives that manage:
- the class name. Methods `objName` and`objName: aSymbol`. The receiver is an `objClass`. Execute test method  `testPrimitiveStructureObjName`.
- the superclass. Methods `objSuperclassId` and `objSuperclassId: aSymbol`. The receiver is an `objClass`. Execute test method `testPrimitiveStructureObjSuperclassId`
- the instance variables. Methods `objIVs` and `objIVs: anOrderedCollection`. The receiver is an `objClass`. Execute test method  `testPrimitiveStructureObjIVs`.
- the keyword list. Methods `objKeywords` and `objKeywords: anOrderedCollection`. The receiver is an `objClass`. Execute test method `testPrimitiveStructureObjKeywords`.
- the method dictionary. Methods `objMethodDict` and `objMethodDict: anIdentityDictionary`. The receiver is an `objClass`. Execute test method `testPrimitiveStructureObjMethodDict`.



### Finding the class of an object

Every object keeps the identifier of its class (its name). For example, an instance of `ObjPoint` has then the following structure: `#(#ObjPoint 10 15)` where `#ObjPoint` is a symbol identifying the class `ObjPoint`.

#### Your job.

Using the primitive `giveClassNamed: aSymbol` defined at the class level of Obj (See Section *@giveclass@*), define the primitive `objClass` in the protocol `'object-structure primitive'` that returns the `objInstance` that represents its class (classes are objects too in ObjVLisp).

Make sure that you execute the test method: `testClassAccess`

```
RawObjTest >> testClassAccess
   self assert: aPoint objClass equals: pointClass
```

Now we will be ready to manipulate objInstances via proper API. We will now use the class `ObjTest` for more elaborate tests.


### Accessing object instance variable values

![Instance variable offset asked to the class.](figures/offsetFromClass.pdf width=40&label=fig:offset2)

#### A first simple method.
Now you will implement a primitive that when sent to an objClass returns the offset of the instance variable represented by the symbol. It returns 0 if the variable is not defined.
The following test illustrates the behavior of this primitive `ivClassOffset:` (It could have been named `classOffsetForIV:`)

```
ObjTest >> testIVOffset
   self 
   	assert: (pointClass ivClassOffset: #x) 
   	equals: 2.
   self 
   	assert: (pointClass ivClassOffset: #lulu) 
   	equals: 0
```

#### Your job.

In the protocol `'iv management'` define a method called `ivClassOffset: aSymbol`  Look at the tests `#testIVOffset` of the class `ObjTest`.  Make sure that you execute the test method: `testIVOffset`.

Hints: Use the Pharo method `indexOf:`. Pay attention that such a primitive is applied to an objClass as shown in the test.

![Instance variable offset asked to the instance itself.](figures/offsetFromObject.pdf width=50&label=fig:offset3)

#### Two simple methods.
Now that we know from the class the offset for a given instance variable, we can define a primitive that performs a similar behavior but that is sent to an instance and not a class. Using it we can easily get access to the value of an instance variable of an instance.

The following test illustrates the expected behavior:

```
ObjTest >> testIVOffsetAndValue

   self 
   	assert: (aPoint ivOffset: #x) 
	equals: 2.
   self 
   	assert: (aPoint valueOfInstanceVariable: #x) 
	equals: 10
```



#### Your job.

Using the previous method, define in the protocol `'iv management'`:
1. When sent to an objObject, the primitive `ivOffset: aSymbol` that returns the offset of the instance variable. Note that this time the method is applied to an objInstance presenting an instance and not a class (as shown in Figure *@fig:offset3@*). (It could have been named `objectOffsetForIV:`).
1. the method `valueOfInstanceVariable: aSymbol` that returns the value of this instance variable in the given object as shown in the test below.

Note that for the method `ivOffset:` you can check that the instance variable exists in the class of the object and else raise an error using the Pharo method `error:`.

Make sure that you execute the test method: `testIVOffsetAndValue` and it passes.


### Object allocation and initialization

The creation of an object is the composition of two elementary operations: its _allocation_ and its _initialization_.
We now define the primitives that allow us to allocate and initialize an object. Remember that:
- allocation is a class method that returns a nearly empty structure, nearly empty because the instance represented by the structure should at least know its class, and
- initialization is an instance method that given a newly allocated instance and a list of initialization arguments fill the instance.


#### Instance allocation

As shown in the class `ObjTest`, if the class `ObjPoint` has two instance variables: `ObjPoint allocateAnInstance` returns `#(#ObjPoint nil nil)`.

```
ObjTest >> testAllocate

   | newInstance |
   newInstance := pointClass allocateAnInstance.
   self assert: (newInstance at: 1) equals: #ObjPoint.
   self assert: (newInstance size) equals: 3.
   self assert: (newInstance at: 2) isNil.
   self assert: (newInstance at: 3) isNil.
   self assert: newInstance objClass equals: pointClass
```



#### Your job.

In the protocol `'instance allocation'` implement the primitive called `allocateAnInstance` that when sent to an _objClass_ returns a new instance whose instance variable values are nil and whose objClassId represents the objClass.

Hints: in Pharo we use the message `new:` to specify the size of Arrays. For example, `Array new: 5` will create an array of 5 elements.

Make sure that you execute the test method: `testAllocate`

### Keywords primitives

The original implementation of ObjVLisp uses the facility offered by the Lisp keywords to ease the specification of the instance variable values during instance creation. It also provides a uniform and unique way to create objects.
We have to implement some functionality to support keywords. 
However, as this is not really interesting that you lose time we give you all the necessary primitives.

#### Your job.

All the functionality for managing the keywords are defined in the protocol `'keyword management'`. Read the code and the associated test called `testKeywords` in the class `ObjTest`.

```
ObjTest >> testKeywords

   | dummyObject |
   dummyObject := Obj new.
   self 
        assert: (dummyObject generateKeywords: #(#titi #toto #lulu))
        equals: #(#titi: #toto: #lulu:).
   self 
        assert:
             (dummyObject 
                  keywordValue: #x
                  getFrom: #(#toto 33 #x 23)
                  ifAbsent: 2)
        equals: 23.
   self 
         assert:
              (dummyObject 
                   keywordValue: #x
                   getFrom: #(#toto 23)
                   ifAbsent: 2)
         equals: 2.
   self 
         assert:
              (dummyObject 
                  returnValuesFrom: #(#x 22 #y 35)
                  followingSchema: #(#y #yy #x #y))
         equals: #(35 nil 22 35)
```

Make sure that you execute the test method: `testKeywords` and that it passes.

### Object initialization

Once an object is allocated, it may be initialized by the programmer by specifying a list of initialization values. We can represent such a list by an array containing alternatively
a keyword and a value like `#(#toto 33 #x 23)` where 33 is associated with `#toto` and 23 with `#x`.

#### Your job.

Read in the protocol `'instance initialization'` the primitive `initializeUsing: anArray` that, when sent to an object along with an initialization list, returns the initialized object.

```
ObjTest >> testInitialize

   | newInstance  |
   newInstance := pointClass allocateAnInstance.
   newInstance initializeUsing: #(#y: 2 #z: 3 #t: 55 #x: 1).
   self assert: (newInstance at: 1) equals: #ObjPoint.
   self assert: (newInstance at: 2) equals: 1.
   self assert: (newInstance at: 3) equals: 2.
```


### Static inheritance of instance variables

Instance variables are statically inherited at class creation time.
The simplest form of instance variable inheritance is to define the complete set of instance variables as the _ordered fusion_ between the inherited instance variables and the locally defined instance variables.
For simplicity and similarity with most languages, we chose to forbid duplicated instance variables in the inheritance chain.

#### Your job.

In the protocol `'iv inheritance'`, read and understand the primitive  `computeNewIVFrom: superIVOrdCol with: localIVOrdCol`.

The primitive takes two ordered collections of symbols and returns an ordered collection containing the union of the two ordered collections but with the extra constraint that the order of elements of the first ordered collection is kept. Look at the test method `testInstanceVariableInheritance` below for examples.

Make sure that you execute the test method: `testInstanceVariableInheritance` and that it passes.

```
ObjTest >> testInstanceVariableInheritance
   "a better choice would be to throw an exception if there are duplicates"
   self 
        assert:
    	  (Obj new 
		computeNewIVFrom: #(#a #b #c #d)
		with: #(#a #z #b #t))
        equals: #(#a #b #c #d #z #t).
   self 
         assert: (Obj new 
			computeNewIVFrom: #()
			with: #(#a #z #b #t))
         equals: #(#a #z #b #t)
```

#### Side remark

You could think that keeping the same order of the instance variables between a superclass and its subclass is not an issue. This is partly true in this simple implementation because the instance variable accessors compute each time the corresponding offset to access an instance variable using the primitive `ivClassOffset:`.  However, the structure (instance variable order) of a class is hardcoded by the primitives. That's why your implementation of the primitive `computeNewIVFrom:with:` should take care of that aspect.
In real language, compilers will try to ensure that a method defined in a superclass can be applied to instances of the subclasses.

### Method management

A class defines the instance behavior expressed by methods stored in a method dictionary. As such they are shared by all the instances of a class.
In our implementation, we represent methods by associating a symbol to a Pharo _block_ (a lexical closure).
The block is then stored in the method dictionary of an objClass.

In this implementation, we do not offer the ability to directly access instance variables of the class in which the method is defined.
This could be done by sharing a common environment among all the methods.
The programmer has to use accessors or the `setIV` and `getIV` objMethods defined on `ObjObject` to access the instance variables.
You can find the definition of those methods in the bootstrap protocol on the class side of `Obj`.

In our ObjVLisp implementation, we do not have a specific (non Pharo) syntax for message passing.
Instead, we call the primitives using the Pharo syntax for message passing using the message `send:withArguments:`.
The objVLisp expression `objself getIV: #x` is expressed as follows: `objself send: #getIV withArguments: #(#x)`.

#### Method definition.
We need a way to define a method, e.g., add a block to the method dictionary.
We use the method `addUnaryMethod: aName withBody: aString`.

The following code describes the _definition_ of the accessor method `x` defined on the objClass `ObjPoint` that invokes a field access using the message `getIV`.

```
ObjPoint
   addUnaryMethod: #x
   withBody: 'objself send: #getIV withArguments: #(#x)'.
```

As a first approximation, this code will create the following block that will get stored in the class method dictionary: `[ :objself | objself send: #getIV withArguments: #(#x) ]`.
As you may notice, in our implementation, the receiver is always an explicit argument of the method. 
Here we named it `objself`.

We propose two variations for the method definition: The primitives `addUnaryMethod:withBody:`
and `addMethod:args:withBody:`. The first one is a version that avoids having an empty list of arguments.

```
ObjPoint
   addMethod: #x
   args: ''
   withBody: 'objself send: #getIV withArguments: #(#x)'.
```
Note that the arguments of args: are expressed in a string where arguments are separated by a space.

#### Defining a method and sending a message

As we want to keep this implementation as simple as possible, we define only one primitive for sending a message: it is `send:withArguments:`. To see the mapping between Pharo and ObjVlisp ways of expressing message sent, look at the comparison below:

```
Pharo Unary: self odd
ObjVLisp: objself send: #odd withArguments: #()

Pharo Binary: a + 4
ObjVLisp: a send: #+ withArguments: #(4)

Pharo Keyword: a max: 4
ObjVLisp: a send: #max: withArguments: #(4)
```


While in Pharo you would write the following method definition:
```
bar: x 
   self foo: x
```

In our implementation of ObjVlisp you write:
```
anObjClass
   addMethod: #bar:
   args: 'x'
   withBody: 'objself send: #foo: withArguments: #(x)'.
```


#### Your job.

We provide all the primitives that handle method definition.
- Read the methods `addMethod: aSelector args: aString withBody: aStringBlock`, `removeMethod: aSelector`, and `doesUnderstand: aSelector` - they are grouped in the protocol `'method management'`.
- Implement `bodyOfMethod: aSelector`.

Make sure that you execute the test method: `testMethodManagement`

```
ObjTest >> testMethodManagement

   self assert: (pointClass doesUnderstand: #x).
   self assert: (pointClass doesUnderstand: #xx) not.

   pointClass
      addUnaryMethod: #xx
      withBody: 'objself valueOfInstanceVariable: #x '.
   self assert: ((pointClass bodyOfMethod: #xx) value: aPoint) equals: 10.
   self assert: (pointClass doesUnderstand: #xx).
   pointClass removeMethod: #xx.
   self assert: (pointClass doesUnderstand: #xx) not.
   self assert: ((pointClass bodyOfMethod: #x) value: aPoint) equals: 10
```


### Message passing and dynamic lookup

Sending a message is the result of the composition of _method lookup_ and _execution_.

The following `basicSend:withArguments:from:` primitive just implements it.
First, it looks up the method into the class or superclass of the receiver then if a
method has been found it executes it, else `lookup:` returns nil and we raise a Pharo error.

```
Obj >> basicSend: selector withArguments: arguments from: aClass
   "Execute the method found starting from aClass and whose name is selector.
   The core of message sending reused for both a normal send or a super one."

   | methodOrNil |
   methodOrNil := aClass lookup: selector.
   ^ methodOrNil
      ifNotNil: [ methodOrNil valueWithArguments: (Array with: self) , arguments ]
      ifNil: [ Error signal: 'Obj message' , selector asString, ' not understood' ]
```

Based on this primitive we can express `send:withArguments:` as follows:

```
Obj >> send: selector withArguments: arguments
   "send the message whose selector is <selector> to the receiver. The arguments of the messages are an array <arguments>. The method is looked up in the class of the receiver. self is an objObject or a objClass."

   ^ self basicSend: selector withArguments: arguments from:  self objClass
```

Note that the definition above of `basicSend:withArguments:from:` does not let us ObjVLisp developers redefine the error handing. We will propose a solution in subsequent sections.


### Method lookup

The primitive `lookup: selector` applied to an objClass should return the method associated to the selector if it found it, else nil to indicate that it failed.

#### Your job.

Implement the primitive `lookup: selector` that when sent to an objClass with a method selector, a symbol, and the initial receiver of the message, returns the method-body of the method associated with the selector in the objClass or its superclasses.  Moreover, if the method is not found, nil is returned.

Make sure that you execute the test methods: `testNilWhenErrorInLookup` and `testRaisesErrorSendWhenErrorInLookup` whose code is given below:

```
ObjTest >> testNilWhenErrorInLookup

   self assert: (pointClass lookup: #zork) isNil.
   "The method zork is NOT implemented on pointClass"
```

```
ObjTest >> testRaisesErrorSendWhenErrorInLookup

   self should: [ pointClass send: #zork withArguments: { aPoint } ] raise: Error.

```

### Managing super

To invoke a superclass hidden method, in Java and Pharo you use `super`, which means that the lookup up will start above the class defining the method containing the super expression. In fact, we can consider that in Java or Pharo, super is a syntactic sugar to refer to the receiver but changes where the method lookup starts. This is what we see in our implementation where we do not have syntactic support.

Let us see how we will express the following situation.
```
bar: x
   super foo: x
```

In our implementation of ObjVlisp we do not have a syntactic construct to express super, you have to use the `super:withArguments:from:` Pharo message as follows.

```
anObjClass
   addMethod: #bar:
   args: 'x'
   withBody: 'objself super: #foo: withArguments: #(#x) from: superclassOfClassDefiningTheMethod'.
```

Note that `superclassOfClassDefiningTheMethod` is a variable that is bound to the superclass of `anObjClass` i.e., the class defining the method `bar` (see later).

```
Pharo Unary: super odd
ObjVLisp: objself super: #odd withArguments: #() from: superclassOfClassDefiningTheMethod

Pharo Binary: super + 4
ObjVLisp: objself super: #+ withArguments: #(4) from: superclassOfClassDefiningTheMethod

Pharo Keyword: super max: 4
ObjVlisp: objself super: #max: withArguments: #(4) from: superclassOfClassDefiningTheMethod
```

### Representing super

We would like to explain to you where the `superclassOfClassDefiningTheMethod` variable comes from.
When we compare the primitive `send:withArguments:` to its variation using super, for super sends we added a third parameter to the primitive and we called it `super:withArguments:from:`.

This extra parameter corresponds to the superclass of the class in which the method is defined. This argument should always have the same name, i.e., `superclassOfClassDefiningTheMethod`. This variable will be set when the method is added to the method dictionary of an objClass.

If you want to understand how we bind the variable, here is the explanation:
In fact, a method is not only a block but it needs to know the class that defines it or its superclass. We added such information using a currification. A currification is the transformation of a function with n arguments into function with less arguments but an environment capture: `f(x,y)= (+ x y)` is transformed into a function `f(x)=f(y)(+ x y)` that returns a function of a single argument y and where x is bound to a value and obtain a function generator. For example, `f(2,y)` returns a function `f(y)=(+ 2 y)` that adds its parameter to 2. A currification acts as a generator of functions where one of the arguments of the original function is fixed.

In Pharo, we wrap the block representing the method around another block with a single parameter and we bind this parameter with the superclass of the class defining the method. When the method is added to the method dictionary, we evaluate the first block with the superclass as a parameter as illustrated as follows:

```
method := [ :superclassOfClassDefiningTheMethod |
     [ :objself :otherArgs  |
           ... method code ...
           ]]
method value: (Obj giveClassNamed: self objSuperclassId)
```

So now you know where the `superclassOfClassDefiningTheMethod` variable comes from.
Make sure that you execute the test method:  `testMethodLookup` and that i passes.

#### Your job.

Now you should implement `super: selector withArguments: arguments from: aSuperclass` using the primitive `basicSend:withArguments:from:`.

### Handling not understood messages

Now we can revisit error handling. Instead of raising a Pharo error, we want to send an ObjVlisp message to the receiver of the message to give him a chance to trap the error.

Compare the two following versions of `basicSend: selector withArguments: arguments from: aClass` and propose an implementation of `sendError: selector withArgs: arguments`.

```
Obj >> basicSend: selector withArguments: arguments from: aClass

   | methodOrNil |
   methodOrNil := (aClass lookup: selector).
   ^ methodOrNil
      ifNotNil: [ methodOrNil valueWithArguments: (Array with: self) , arguments ]
      ifNil: [ Error signal: 'Obj message' , selector asString, ' not understood' ]
```

```
Obj >> basicSend: selector withArguments: arguments from: aClass

   | methodOrNil |
   methodOrNil := (aClass lookup: selector).
   ^ methodOrNil
      ifNotNil: [ methodOrNil valueWithArguments: (Array with: self) , arguments ]
      ifNil: [ self sendError: selector withArgs: arguments ]
```


It should be noted that the obj method is defined as follows in the `ObjObject` class (see the bootstrap method on the class side of the class `Obj`). The obj `error` method expects a single parameter: an array of arguments whose first element is the selector of the not understood message.

```
objObject
   addMethod: #error
   args: 'arrayOfArguments'
   withBody: 'Transcript show: ''error '', arrayOfArguments first.  ''error '', arrayOfArguments first'.
```


```
Obj >> sendError: selector withArgs: arguments
   "send error wrapping arguments into an array with the selector as first argument. Instead of an array we should create a message object."

   ^ self send: #error withArguments:  {(arguments copyWithFirst: selector)}
```


Make sure that you read and execute the test method: `testSendErrorRaisesErrorSendWhenErrorInLookup`.
Have a look at the implementation of the `#error` method defined in `ObjObject` and in the `assembleObjectClass` of the `ObjTest` class.







## Defining  the language kernel


Now you have implemented all the primitives we need, you are ready to define the two classes that represent the ObjVLisp kernel: `ObjClass` and `ObjObject`. 
Once such classes will exist we will be able to code using ObjVLisp and not in Pharo anymore.
The moment where we go from the low-level world (here Pharo) to the high-level one (here ObjVLisp) is generally called the bootstrap of the language. Indeed after this last phase, our new language exists.

To implement these two classes we could them by manipulating low-level primitives and doing all the plumbing ourselves as what we did in the test `setUp` methods. But there is something better to do. We can use the high level language to use itself to define itself. This is what we will explain in this chapter. 


### About bootstrap

 to bootstrap the system: this means creating the kernel consisting of  `ObjObject` and `ObjClass` classes from themselves. The idea of a smart bootstrap is to be as lazy as possible and to use the system to create itself by creating a fake but working first class with which we will build the rest.

Three steps compose the ObjVlisp bootstrap:
1. Create by hand the minimal part of  the objClass `ObjClass`  and then
1. Use it to create normally `ObjObject` objClass and then
1. Recreate normally and completely `ObjClass`.


These three steps are described by the following bootstrap method of `Obj` class.
Note the bootstrap is defined as class methods of the class `Obj`.

```
Obj class >> bootstrap
      "self bootstrap"

      self initialize.
      self manuallyCreateObjClass.
      self createObjObject.
      self createObjClass.
```


To help you to implement the functionality of the objClasses `ObjClass` and
`ObjObject`, we defined another set of tests in the class `ObjTestBootstrap`.
Read them.

### Manually creating ObjClass

The first step is to create manually the class `ObjClass`. By manually we mean create an array (because we chose an array to represent instances and classes in particular) that represents the objClass `ObjClass`, then define its methods. You will implement/read this in the primitive `manuallyCreateObjClass` as shown below:

```
Obj class >> manuallyCreateObjClass
   "self manuallyCreateObjClass"

   | class |
   class := self manualObjClassStructure.
   Obj declareClass: class.
   self defineManualInitializeMethodIn: class.
   self defineAllocateMethodIn: class.
   self defineNewMethodIn: class.
   ^ class
```
We will comment some of the methods called in `manuallyCreateObjClass`.



For this purpose, you have to implement/read all the primitives that
compose it.

#### Your job.

At the class level in the protocol `'bootstrap objClass manual'` read or implement:
the primitive `manualObjClassStructure` that returns an objObject that represents the class `ObjClass`.

Make sure that you execute the test method: `testManuallyCreateObjClassStructure`

- As the `initialize` of this first phase of the bootstrap is not easy we give you its code. Note that the definition of the objMethod `initialize` is done in the primitive method `defineManualInitializeMethodIn:`.


```
Obj class >> defineManualInitializeMethodIn: class

   class
    addMethod: #initialize
    args: 'initArray'
    withBody:
      '| objsuperclass |
      objself initializeUsing: initArray.  "Initialize a class as an object. In the bootstrapped system will be done via super"
      objsuperclass := Obj giveClassNamed: objself objSuperclassId ifAbsent: [nil].
      objsuperclass isNil
        ifFalse:
          [ objself
               objIVs: (objself computeNewIVFrom: objsuperclass objIVs with: objself objIVs)]
        ifTrue:
          [ objself objIVs: (objself computeNewIVFrom: #(#class) with: objself objIVs)].
      objself
          objKeywords: (objself generateKeywords: (objself objIVs copyWithout: #class)).
      objself objMethodDict: (IdentityDictionary new: 3).
      Obj declareClass: objself.
      objself'
```


Note that this method works without inheritance since the class `ObjObject` does not exist yet.

The primitive `defineAllocateMethodIn: anObjClass` defines in anObjClass passed as argument the objMethod `allocate`. This `allocate` method takes only one argument: the class for which a new instance is created as shown below:

```
defineAllocateMethodIn: class

   class
      addUnaryMethod: #allocate
      withBody: 'objself allocateAnInstance'
```
Its definition is simple, it just calls the primitive `allocateAnInstance`.

Following the same principle, define the primitive `defineNewMethodIn: anObjClass` that defines in anObjClass passed as argument the objMethod `new`. `new` takes two arguments: a class and an initargs-list. It invokes the objMethod `allocate` and `initialize`.

#### Your job.


Make sure that you read and execute the test method: `testManuallyCreateObjClassAllocate`

#### Remarks

Read carefully the following remarks below and the code.
- In the objMethod `manualObjClassStructure`, the instance variable inheritance is simulated. Indeed the instance variable array (that represents the instance variable of the class) contains `#class` that should normally be inherited from `ObjObject` as we will see in the third phase of the bootstrap.

- Note that the class is declared into the class repository using the method `declareClass:`.

- Note the method `#initialize` is method of the metaclass `ObjClass`: when you create a class the initialize method is invoked on a class! The `initialize` objMethod defined on `ObjClass` has two aspects: the first one deals with the initialization of the class like any other instance (first line). This behavior is normally done using a super call to invoke the `initialize` method defined in `ObjObject`. The final version of the `initialize` method will do it using perform. The second one deals with the initialization of classes: it performs the instance variable inheritance, then computes the keywords of the newly created class. Note in this final step that the keyword array does not contain the `#class:` keyword because we do not want to let the user modify the class of an object.



### Creation of ObjObject

Now you are in the situation where you can create the first real and normal class of the system: the class `ObjObject`. To do that you send the message `new` to class `ObjClass` specifying that the class you are creating is named `#ObjObject` and
only has one instance variable called `class`. Then you will add the methods defining the behavior shared by all the objects.

#### Your job: objObjectStructure

Implement/read the following primitive `objObjectStructure` that creates the `ObjObject` by invoking the `new` message to the class `ObjClass`:

```
Obj class >> objObjectStructure

   ^ (self giveClassNamed: #ObjClass)
      send: #new
      withArguments: #(#(#name: #ObjObject #iv: #(#class)))
```

The class `ObjObject` is named `ObjObject`, has only one instance variable `class`, and does not have a superclass because it is the root of the inheritance graph.

#### Your job: createObjObject


Now implement the primitive `createObjObject` that calls `objObjectStructure` to obtain the `objObject` representing
`objObject` class and define methods in it. To help you we give here the beginning of such a method

```
Obj class >> createObjObject
   | objObject |
   objObject := self objObjectStructure.
   objObject addUnaryMethod: #class withBody: 'objself objClass'.
   objObject addUnaryMethod: #isClass withBody: 'false'.
   objObject addUnaryMethod: #isMetaclass withBody: 'false'.
   ...
   ...
   ^ objObject
```


Implement the following methods in `ObjObject`
- the objMethod `class` that given an objInstance returns its class \(the objInstance that represents the class\).
- the objMethod `isClass` that returns false.
- the objMethod `isMetaClass` that returns false.
- the objMethod `error` that takes two arguments the receiver and the selector of the original invocation and raises an error.
- the objMethod `getIV` that takes the receiver and an attribute name, aSymbol, and returns its value for the receiver.
- the objMethod `setIV` that takes the receiver, an attribute name and a value and sets the value of the given attribute to the given value.
- the objMethod `initialize` that takes the receiver and an initargs-list and initializes the receiver according to the specification given by the initargs-list. Note that here the `initialize` method only fills the instance according to the specification given by the initargs-list. Compare with the `initialize` method defined on `ObjClass`.

Make sure that you read and execute the test method: `testCreateObjObjectStructure`

In particular, notice that this class does not implement the class method `new` because it is not a metaclass but does implement the instance method `initialize` because any object should be initialized.

#### Your job: run the tests

- Make sure that you read and execute the test method: `testCreateObjObjectMessage`
- Make sure that you read and execute the test method: `testCreateObjObjectInstanceMessage`

### Creation of ObjClass

Following the same approach, you can now recreate completely the class `ObjClass`. The primitive `createObjClass` is responsible for creating the final class `ObjClass`. So you will implement it and define all the primitives it needs. Now we only define what is specific to classes, the rest is inherited from the superclass of the class `ObjClass`, the class `ObjObject`.

```
Obj class >> createObjClass
   "self bootstrap"

   | objClass |
   objClass := self objClassStructure.
   self defineAllocateMethodIn: objClass.
   self defineNewMethodIn: objClass.
   self defineInitializeMethodIn: objClass.
   objClass
     addUnaryMethod: #isMetaclass
     withBody: 'objself objIVs includes: #superclass'.
  "an object is a class if is class is a metaclass. cool"

   objClass
     addUnaryMethod: #isClass
     withBody: 'objself objClass send: #isMetaclass withArguments:#()'.

   ^ objClass
```


To make the method `createObjClass` work we should implement the method it calls. Implement then:

- the primitive `objClassStructure` that creates the `ObjClass` class by invoking the `new` message to the class `ObjClass`. Note that during this method the `ObjClass` symbol refers to two different entities because the new class that is created using the old one is declared in the class dictionary with the same name.



#### Your job.

Make sure that you read and execute the test method: `testCreateObjClassStructure`.
Now implement the primitive `createObjClass` that starts as follow:

```
Obj class >> createObjClass

   | objClass |
   objClass := self objClassStructure.
   self defineAllocateMethodIn: objClass.
   self defineNewMethodIn: objClass.
   self defineInitializeMethodIn: objClass.
   ...
   ^ objClass
```


Also define the following methods:
- the objMethod `isClass` that returns true.
- the objMethod `isMetaclass` that returns true.


```
objClass
   addUnaryMethod: #isMetaclass
   withBody: 'objself objIVs includes: #superclass'.

   "an object is a class if is class is a metaclass. cool"
```


```
objClass
  addUnaryMethod: #isClass
  withBody: 'objself objClass send: #isMetaclass withArguments:#()'.
```


- the primitive `defineInitializeMethodIn: anObjClass` that adds the objMethod `initialize` to the objClass passed as argument. The objMethod `initialize` takes the receiver (an objClass) and an initargs-list and initializesthe receiver according to the specification given by the initargs-list. In particular, it should be initialized as any other object, then it should compute its instance variable (i.e., inherited instance variables are computed), the keywords are also computed, the method dictionary should be defined and the class is then declared as an existing one. We provide the following template to help you.


```
Obj class>>defineInitializeMethodIn: objClass

   objClass
     addMethod: #initialize
     args: 'initArray'
     withBody:
        'objself super: #initialize withArguments: {initArray} from: superclassOfClassDefiningTheMethod.
         objself objIVs: (objself
                  computeNewIVFrom:
                        (Obj giveClassNamed: objself objSuperclassId) objIVs
                  with: objself objIVs).
        objself computeAndSetKeywords.
        objself objMethodDict: IdentityDictionary new.
        Obj declareClass: objself.
        objself'
```



```
Obj class >> defineInitializeMethodIn: objClass

  objClass
     addMethod: #initialize
     args: 'initArray'
     withBody:
         'objself super: #initialize withArguments: {initArray} from: superclassOfClassDefiningTheMethod.
         objself objIVs: (objself
           computeNewIVFrom: (Obj giveClassNamed: objself objSuperclassId) objIVs
           with: objself objIVs).
         objself computeAndSetKeywords.
         objself objMethodDict: IdentityDictionary new.
         Obj declareClass: objself.
         objself'
```


#### Your job.

Make sure that you execute the test method: `testCreateObjClassMessage`.

Note the following points:
- The locally specified instance variables now are just the instance variables that describe a class. The instance variable `class` is inherited from `ObjObject`.
- The `initialize` method now does a super send to invoke the initialization performed by `ObjObject`.



### First User Classes: ObjPoint

Now that ObjVLisp is created and we can start to program some classes.
Implement the class `ObjPoint` and `ObjColoredPoint`. Here is a possible implementation.

You can choose to implement it at the class level of the class Obj or even better in class named `ObjPointTest`.

Pay attention that your scenario covers the following aspects:
- First just create the class `ObjPoint`.
- Create an instance of the class `ObjPoint`.
- Send some messages defined in `ObjObject` to this instance.


Define the class `ObjPoint` so that we can create points as below (create a Pharo method to define it).

```
ObjClass send: #new
   withArguments: #((#name: #ObjPoint #iv: #(#x y) #superclass: #ObjObject)).
```


```
aPoint := pointClass send: #new withArguments: #((#x: 24 #y: 6)).
aPoint send: #getIV withArguments: #(#x).
aPoint send: #setIV withArguments: #(#x 25).
aPoint send: #getIV withArguments: #(#x).
```


Then add some functionality to the class `ObjPoint` like the methods `x`, `x:`, `display` which prints the receiver.

```
Obj ObjPoint
   addUnaryMethod: #givex
   withBody: 'objself valueOfInstanceVariable: #x '.
Obj ObjPoint
   addUnaryMethod: #display
   withBody:
    'Transcript cr;
      show: ''aPoint with x = ''.
    Transcript show: (objself send: #givex withArguments: #()) printString;
   cr'.
```


Then test these new functionalities.

```
aPoint send: #x withArguments: #().
aPoint send: #x: withArguments: #(33).
aPoint send: #display withArguments: #().
```



### First User Classes: ObjColoredPoint

Following the same idea, define the class `ObjColored`.

Create an instance and send it some basic messages.

```
aColoredPoint := coloredPointClass
   send: #new
   withArguments: #((#x: 24 #y: 6 #color: #blue)).
```


```
aColoredPoint send: #getIV withArguments: #(#x).
aColoredPoint send: #setIV withArguments: #(#x 25).
aColoredPoint send: #getIV withArguments: #(#x).
aColoredPoint send: #getIV withArguments: #(#color).
```


#### Your job.

Define some functionality and invoke them: the method color,  implement the method display so that it invokes the superclass and adds some information related to the color. Here is an example:

```
coloredPointClass addUnaryMethod: #display
   withBody:
     'objself super: #display withArguments: #() from: superclassOfClassDefiningTheMethod.
      Transcript cr;
         show: '' with Color = ''.
      Transcript show: (objself send: #giveColor withArguments: #()) printString; cr'.
```


```
aColoredPoint send: #x withArguments: #().
aColoredPoint send: #color withArguments: #().
aColoredPoint send: #display withArguments: #()
```


### A First User Metaclass: ObjAbstract

Now implement the metaclass `ObjAbstract` that defines instances \(classes\) that are abstract i.e., that
cannot create instances. This class should raise an error when it executes the `new` message.

Then the following shows you a possible use of this metaclass.
```
ObjAbstractClass
   send: #new
   withArguments: #(#(#name: #ObjAbstractPoint
            #iv: #()
            #superclass: #ObjPoint)).

ObjAbstractPoint send: #new
   withArguments: #(#(#x: 24 #y: 6))        "should raise an error"
```

You should redefine the `new` method. Note that the `ObjAbstractClass` is an instance of `ObjClass` because this is a class and inherits from it because this is a metaclass.


### New features that you could implement

You can implement some simple features:
- define a metaclass that automatically defines accessors for the specified instances variables.
- avoid that we can change the selector and the arguments when calling a super send.


#### Shared Variables

Note that contrary to the proposition made in the 6th postulate of the original ObjVLisp model, class instance variables are not equivalent to shared variables. According to the 6th postulate, a shared variable will be stored in the instance representing the class and not in an instance variable of the class representing the shared variables.  For example, if a workstation has a shared variable named `domain`. But the domain should not be an extra instance variable of the class of `Workstation`. Indeed domain has nothing to do with class description.

The correct solution is that `domain` is a value held into the list of the shared variable of the class `Workstation`. This means that a _class_ has extra information to describe it: an instance variable `sharedVariable` holding pairs. So we should be able to write:

```
Obj Workstation getIV: #sharedVariable
or
Obj Workstation sharedVariableValue: #domain

and get
 #((domain 'inria.fr'))
```

Introduce shared variables: add a new instance variable in the
class `ObjClass` to hold a dictionary of shared variable bindings (a
symbol and a value) that can be queried using specific methods:
`sharedVariableValue:` and `sharedVariableValue:put:`.
