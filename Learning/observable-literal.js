'use strict';

var Observable = (function(){

	return {
		of: of,
		from: from,
		interval: interval
	};

	function createObserver(handlers) {
		
		var isUnsubscribed = false;
	
		function unsubscribe () {
			isUnsubscribed = true;
		}

		return {
			next: function (value) {
				if (handlers.next && !isUnsubscribed) {
					handlers.next(value);
				}
			},
			error: function (error) {
				if (!isUnsubscribed) {
					if (handlers.error) {
						handlers.error(error);
					}
					unsubscribe();
				}
			},
			complete: function () {
				if (!isUnsubscribed) {
					if (handlers.complete) {
						handlers.complete();
					}
					unsubscribe();
				}
			}
		};
	}

	/*
	* Creation
	*/

	function createObservable(subscribe) {
		return {
			subscribe: subscribe,
			take: take,
			filter: filter,
			map: map,
			do: todo,
			mergeMap: mergeMap
		};
	}
	
	function createSubscription(unsubscribe) {
		return {
			unsubscribe: unsubscribe
		};
	}
	
	function of(value) {
			
		return createObservable(function (observer) {
	
			setTimeout(function () {
				observer.next(value);
				observer.complete();
			}, 0);
	
			return createSubscription(function () {
				console.log('Of unsubscribbed');
			});
		});
	}

	function from (values) {

		var isUnsubscribed = false;
	
		return createObservable(function (observer) {
	
			setTimeout(function () {
	
				values.forEach(function (value) {
					if(!isUnsubscribed) observer.next(value);
				});
	
				if(!isUnsubscribed) observer.complete();
			},
			0);
	
			return createSubscription(function () {
					isUnsubscribed = true;
					console.log('From unsubscribbed');
				}
			);
		});
	};

	function interval (period) {

		var intervalHandler;
	
		return createObservable(function (observer) {
	
			var i = 0;
	
			intervalHandler = setInterval(function () {
				observer.next(i);
				i++;
			},period);
	
			return createSubscription(function () {
					clearInterval(intervalHandler);
					console.log('Interval unsubscribbed');
				}
			);
		});
	}

	/*
	 * Operators
	 */

	function take (n) {

		var stream = this;
	
		return createObservable(function (observer) {
	
			var i = 0;
	
			var subscription = stream.subscribe(createObserver({
	
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
	
			return createSubscription(function () {
					subscription.unsubscribe();
				}
			);
		});
	}

	function filter (test) {

		var stream = this;
	
		return createObservable(function (observer) {
	
			var subscription = stream.subscribe(createObserver({
	
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
	
			return createSubscription(function () {
					subscription.unsubscribe();
				}
			);
		});
	}

	function map (map) {

		var stream = this;
	
		return createObservable(function (observer) {
	
			var subscription = stream.subscribe(createObserver({
	
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
	
			return createSubscription(function () {
					subscription.unsubscribe();
				}
			);
		});
	}

	function todo (todo) {

		var stream = this;
	
		return createObservable(function (observer) {
	
			var subscription = stream.subscribe(createObserver({
	
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
	
			return createSubscription(function () {
					subscription.unsubscribe();
				}
			);
		});
	}

	function mergeMap (mergeMap) {

		var stream = this;
	
		return createObservable(function (observer) {
	
			var subscription = stream.subscribe(createObserver({
	
				next: function (value) {
	
					var sub = mergeMap(value).subscribe(createObserver({
						next: function (_value) {
							observer.next(_value);
						},
						error: function (err) {
							observer.error(err);
						},
						complete: function () {
							sub.unsubscribe();
						}
					}));
				},
				error: function (err) {
					observer.error(err);
				},
				complete: function () {
					observer.complete();
				}
			}));
	
			return createSubscription(function () {
					subscription.unsubscribe();
				}
			);
		});
	}

})();


/////////////////////////////////////

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

//const numbers$ = Observable.from([10,12,8,3,6]).take(3);

const numbers$ = Observable.interval(500)
	.do(function (value) {
		console.log('From interval: ' + value.toString());
	})
	.filter(function (value) {
		return value % 2 === 0
	})
	.map(function (value) {
		return value + 1;
	})
	.mergeMap(function (value) {
		return Observable.from([value * 1, value * 2, value * 3]).take(2);
	})
	.take(8);

const subscription = numbers$.subscribe(observer);

