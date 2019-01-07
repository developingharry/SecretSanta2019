    var anyErrors = ko.observable(true);

ko.extenders.required = function(target, overrideMessage) {
    //add some sub-observables to our observable
    target.hasError = ko.observable();
    target.validationMessage = ko.observable();

 
    //define a function to do validation
    function validate(newValue) {
       target.hasError(newValue ? false : true);
       target.validationMessage(newValue ? "" : overrideMessage || "This field is required");
       anyErrors(newValue ? false : true);
    }
 
    //initial validation
    validate(target());
 
    //validate whenever the value changes
    target.subscribe(validate);
 
    //return the original observable
    return target;
};

function Santa(name) {
    var self = this;
    // self.name = ko.observable(name);


     self.name = ko.observable(name).extend({ required: "Please enter a first name" });
}



var ViewModel = function() {
	var self = this;
	var anyBlanks = false;
	var matchesFound = false;

	self.santas = ko.observableArray([]);

	self.santaCount = ko.observable(self.santas().length);

	self.giftees = ko.observableArray([]);

	self.addSanta = function() {
        self.santas.push(new Santa(""));
    };

    self.removeSanta = function(data) { 
        self.santas.remove(data);
    };

	self.shuffle = function(a) {
	  var j, x, i;
	  for (i = a.length - 1; i > 0; i--) {
	    j = Math.floor(Math.random() * (i + 1));
	    x = a[i];
	    a[i] = a[j];
	    a[j] = x;
	  }
	  console.log("shuffled");
	  return a;
	}


	self.shuffleTilCorrect = function() {
		console.log("shuffleTilCorrect Starting with initial shuffle");
    	self.giftees(self.shuffle(self.santas().slice()));
    	console.log("checking shuffle");
  		self.checkShuffle();
  		console.log(matchesFound + "matches found");
 		while (matchesFound) {
 			console.log("shuffling again");
 			self.giftees(self.shuffle(self.santas().slice()));
 			console.log("match found");
			self.checkShuffle();
  		}
	}
	
	self.checkShuffle = function() {
		var a = self.santas();
		var b = self.giftees();
		var length = self.santas().length;
		matchesFound = false;
		for (var i = 0; i<a.length; i++ ) {
			console.log(a[i].name() + b[i].name());
			if (a[i].name() === b[i].name()) {
				console.log (a[i].name() + "matches" + b[i].name() + "so I'll need to shuffle again");
				matchesFound = true;
			}
			console.log (i + a[i].name());
		} 

	}

    self.assignGiftees = function() {
    	// TODO: add mechanism to assign giftees
    	console.log("assigning giftees...");
    	// self.checkShuffle();
    	console.log("removing blanks");
    	self.giftees(self.shuffle(self.santas().slice()));
		self.shuffleTilCorrect();
    }
};
 
ko.applyBindings(new ViewModel());