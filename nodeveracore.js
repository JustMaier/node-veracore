module.exports = function(username, password, soapUrl){
	var soap = require('soap'),
		_ = require('lodash'),
		order = require('./arguments/order'),
		url = soapUrl || 'http://pmdev.gloful.com/pmomsws/order.asmx?wsdl',
		soapClient = null,
		pendingRequests = [],
		soapRequest = function(fn){
			if(pendingRequests.length > 0){
				pendingRequests.push(fn);
			} else if(soapClient == null){
				pendingRequests.push(fn);

				methods.connect(function(client){
					//Process pending queue
					while(pendingRequests.length > 0){
						var requestFn = pendingRequests.shift();
						requestFn(soapClient);
					}
				});
			} else{
				fn(soapClient);
			}
		};

	//Methods
	var methods = {
		getOffers: {
			arguments: {sortGroups: '', categoryGroupDescription: '', customCategories: '', mailerUID: '', searchString:'%', searchID:true,searchDescription:true, priceClassDescription:''},
			parameters: ['searchString'],
			result: 'GetOfferResult'
		},
		getProduct: {
			arguments: {OwnerID:'2',ProductID:'Z0001'},
			parameters: ['ProductID','OwnerID'],
			result: 'product'
		},
		getOrder: {
			method: 'GetOrderInfo',
			arguments: {orderId:'1'},
			parameters: ['orderId']
		},
		addOrder: function(orderRequest, callback){
			var requestArguments = new order(orderRequest);

			soapRequest(function(client){
				client.AddOrder(requestArguments, function(err, result){
					if(err) return callback(err);

					try{
						callback(err, result.AddOrderResult);
					}catch(e){
						callback(err, result);
					}
				});
			})
		},
		getShippingActivity: {
			method: 'GetShippingActivity',
			arguments: {StartDate: '2015-01-01', EndDate: new Date().toISOString()},
			parameters: ['StartDate', 'EndDate']
		},
		getShippingCharge: {
			method: 'GetShippingCharge',
			arguments: {StartDate: '2015-01-01', EndDate: new Date().toISOString()},
			parameters: ['StartDate', 'EndDate']
		},
		connect: function(callback){
			soap.createClient(url, function(err, client) {
				client.addSoapHeader({AuthenticationHeader: {Username:username, Password:password}}, '', 'pm', 'http://sma-promail/');
				soapClient = client;

				return callback(soapClient);
			});
		}
	};

	//Build default methods
	_.forEach(methods, function(properties, name){
		if(_.isFunction(properties)){
			methods[name] = properties;
			return;
		}

		if(properties.method == null){
			properties.method = _.capitalize(name);
		}

		methods[name] = function(/*[optional params], callback*/){
			var requestArguments = _.cloneDeep(properties.arguments),
				args = [].slice.call(arguments),
				hasParameters = _.isArray(properties.parameters),
				callback = null;

			//Handle Parameters
			_.forEach(args, function(arg, i){
				if(_.isFunction(arg)){
					callback = arg;
					return false;
				}else if(_.isObject(arg) && args.length == 2){
					_.merge(requestArguments, arg);
				}else if(hasParameters){
					var paramName = properties.parameters[i];
					if(paramName){
						requestArguments[paramName] = arg;
					}
				}
			})

			soapRequest(function(client){
				client[properties.method](requestArguments, function(err, result){
					if(err) return callback(err);
					
					var returnResult = result;
					try{
						if(result[properties.method+'Result']) returnResult = result[properties.method+'Result'];
						if(properties.result) returnResult = returnResult[properties.result];
						callback(err, returnResult);
					}catch(e){
						callback(err, result);
					}

				});
			})
		}
	});

	return methods;
}