function Santa(name,giftee) {
    var self = this;

    self.name = ko.observable(name);
    self.giftee = ko.observable(giftee);   
}


var ViewModel = function() {
	var self = this;
	var matchesFound = false;

	self.santas = ko.observableArray([]);

	self.giftees = ko.observableArray([]);

	self.addSanta = function() {
        self.santas.push(new Santa("",""));
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

 //    self.checkShuffle = function() {
 // 		var length = self.santas().length;
 //  		matchesFound = false;
 //  		for (var i = 0; i < length; i++) {
 //    		if (self.santas[i].name == self.giftees[i].name) {
 //      		matchesFound = true;
 //    		}
 //  		}
	// }

	// self.shuffleTilCorrect = function() {
	// 	console.log("shuffleTil correct startyin");
 // 		self.shuffle(self.giftees());
 //  		self.checkShuffle();
 //  		console.log(matchesFound);
 // 		while (matchesFound) {
 // 			console.log("shufflin");
 // 			self.giftees(self.shuffle(self.santas().slice()));
 // 			console.log("matchfound");
	// 		checkShuffle();
 //  		}
	// }

    self.assignGiftees = function() {
    	// TODO: add mechanism to assign giftees
    	console.log("assigning giftees...");
    	self.giftees(self.shuffle(self.santas().slice()));

		// self.shuffleTilCorrect();
    }
};
 
ko.applyBindings(new ViewModel());