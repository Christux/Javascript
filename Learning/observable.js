'use strict';

function Observer(handlers) {
	this.handlers = handlers;
	this.isUnsubscribed = false;
}

Observer.prototype.next = function (value) {
	if (this.handlers.next && !this.isUnsubscribed) {
		this.handlers.next(value);
	}
};

Observer.prototype.error = function (error) {
	if (!this.isUnsubscribed) {
		if (this.handlers.error) {
			this.handlers.error(error);
		}
		this.unsubscribe();
	}
};

Observer.prototype.complete = function () {
	if (!this.isUnsubscribed) {
		if (this.handlers.complete) {
			this.handlers.complete();
		}
		this.unsubscribe();
	}
};

Observer.prototype.unsubscribe = function () {
	this.isUnsubscribed = true;
};


/*
 * Creation
 */

function Observable(subscribe) {
	this.subscribe = subscribe;
}

function Subscription(unsubscribe) {
	this.unsubscribe = unsubscribe;
}

Observable.of = function (value) {

	return new Observable(function (obs) {

		var observer = new Observer(obs);

		setTimeout(function () {
			observer.next(value);
			observer.complete();
		}, 0);

		return new Subscription(function () {
			console.log('Of unsubscribbed');
		});
	});
};

Observable.from = function (values) {

	var isUnsubscribed = false;

	return new Observable(function (obs) {

		var observer = new Observer(obs);

		setTimeout(function () {

			values.forEach(function (value) {
				if (!isUnsubscribed) observer.next(value);
			});

			if (!isUnsubscribed) observer.complete();
		},0);

		return new Subscription(function () {
			if(!isUnsubscribed){
				isUnsubscribed = true;
				console.log('From unsubscribbed');
			}
		});
	});
};

Observable.range = function (min, max) {

	var values = [];

	for (var i = min; i <= max; i++) {
		values.push(i);
	}
	return Observable.from(values);
}

Observable.interval = function (period) {

	var intervalHandler;
	var isUnsubscribed = false;

	return new Observable(function (obs) {

		var observer = new Observer(obs);
		var i = 0;

		intervalHandler = setInterval(function () {
			observer.next(i);
			i++;
		}, period);

		return new Subscription(function () {
			if(!isUnsubscribed) {
				clearInterval(intervalHandler);
				console.log('Interval unsubscribbed');
				isUnsubscribed = true;
			}
		});
	});
};


/*
 * Operators
 */
Observable.prototype.take = function (n) {

	var stream = this;

	return new Observable(function (obs) {

		var observer = new Observer(obs);

		var i = 0;

		var subscription = stream.subscribe(new Observer({

			next: function (value) {

				if (i < n - 1) {
					observer.next(value);
				}

				if (i === n - 1) {
					observer.next(value);
					observer.complete();
					subscription.unsubscribe();
				}

				i++;
			},
			error: function (err) {
				observer.error(err);
			},
			complete: function () {
				observer.complete();
			}
		}));

		return new Subscription(function () {
			subscription.unsubscribe();
		});
	});
};

Observable.prototype.filter = function (test) {

	var stream = this;

	return new Observable(function (obs) {

		var observer = new Observer(obs);

		var subscription = stream.subscribe(new Observer({

			next: function (value) {

				if (test(value)) {
					observer.next(value);
				}
			},
			error: function (err) {
				observer.error(err);
			},
			complete: function () {
				observer.complete();
			}
		}));

		return new Subscription(function () {
			subscription.unsubscribe();
		});
	});
};

Observable.prototype.map = function (map) {

	var stream = this;

	return new Observable(function (obs) {

		var observer = new Observer(obs);

		var subscription = stream.subscribe(new Observer({

			next: function (value) {
				observer.next(map(value));
			},
			error: function (err) {
				observer.error(err);
			},
			complete: function () {
				observer.complete();
			}
		}));

		return new Subscription(function () {
			subscription.unsubscribe();
		});
	});
};

Observable.prototype.do = function (todo) {

	var stream = this;

	return new Observable(function (obs) {

		var observer = new Observer(obs);

		var subscription = stream.subscribe(new Observer({

			next: function (value) {
				todo(value);
				observer.next(value);
			},
			error: function (err) {
				observer.error(err);
			},
			complete: function () {
				observer.complete();
			}
		}));

		return new Subscription(function () {
			subscription.unsubscribe();
		});
	});
};

Observable.prototype.merge = function() {

	var observables = [this];
	for (var i = 0; i < arguments.length; i++) {
        observables.push(arguments[i]);
    }

	var subscriptions = [];
	var completeCount = 0;

	return new Observable(function subscribe(obs) {

		var observer = new Observer(obs);

		observables.forEach(function(stream){
			subscriptions.push(stream.subscribe(new Observer({

				next: function (value) {
					observer.next(value);
				},
				error: function (err) {
					observer.error(err);
				},
				complete: function () {
					completeCount++;
					if(completeCount === subscriptions.length) {
						observer.complete();
					}
				}
			})));
		});

		return new Subscription(function unsubscribe() {
			subscriptions.forEach(function(subscription){
				subscription.unsubscribe();
			});
		});
	});
};


Observable.prototype.mergeMap = function (mergeMap) {

	var stream = this;

	return new Observable(function (obs) {

		var observer = new Observer(obs);
		var subscriptions = [];
		var completeCount = 0;

		subscriptions.push(stream.subscribe(new Observer({

			next: function (value) {

				var sub = mergeMap(value).subscribe(new Observer({
					next: function (_value) {
						observer.next(_value);
					},
					error: function (err) {
						error(err);
					},
					complete: function () {
						complete();
						//sub.unsubscribe();
					}
				}));

				subscriptions.push(sub);
			},
			error: function (err) {
				error(err);
			},
			complete: function () {
				complete();
			}
		})));

		return new Subscription(function () {
			subscriptions.forEach(function(subscription){
				subscription.unsubscribe();
			});
		});

		function error(err) {
			observer.error(err);
		}

		function complete() {
			completeCount++;
			if(completeCount === subscriptions.length) {
				observer.complete();
			}
		}
	});
};

Observable.prototype.tic = function() {

	var stream = this;

	return new Observable(function (obs) {

		var observer = new Observer(obs);
		var count = 0;

		var subscription = stream.subscribe(new Observer({

			next: function (value) {
				observer.next(count++);
			},
			error: function (err) {
				observer.error(err);
			},
			complete: function () {
				observer.complete();
			}
		}));

		return new Subscription(function () {
			subscription.unsubscribe();
		});
	});
};


const observer = {

	next: function (value) {
		console.log(value);
	},
	error: function (err) {
		console.error(err);
	},
	complete: function () {
		console.info('done');
	}
};

//const numbers$ = Observable.of(10);

//const numbers$ = Observable.from([0, 1, 2, 3, 4]).do(function(value){console.log(value)}).take(3);

//const numbers$ = Observable.range(4,8);

// const numbers$ = Observable.interval(500)
// 	.do(function (value) {
// 		console.log('Interval: ' + value.toString());
// 	})
// 	.filter(function (value) {
// 		return value % 2 === 0
// 	})
// 	.map(function (value) {
// 		return value + 1;
// 	})
// 	.mergeMap(function (value) {
// 		return Observable.from([value * 1, value * 2, value * 3]).take(2);
// 	})
// 	.take(8);

const numbers$ = Observable.of(5).merge(
					Observable.interval(500).take(10),
					Observable.interval(1000).take(2)
				).tic().take(10);

const subscription = numbers$.subscribe(observer);

/*setTimeout(function(){
	subscription.unsubscribe();
}, 15000);*/

