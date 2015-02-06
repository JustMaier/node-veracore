var _ = require('lodash');
module.exports = function(orderRequest){
	//Build order skeleton
	var order = {
		Header: {
			EntryDate: new Date().toISOString(),
			OrderEntryView: "",
			Comments: orderRequest.comments || ""
		},
		Classification: {Issue: ""},
		Shipping: {
			FreightCode: "P01",
			FreightCodeDescription: "USPS First Class Mail"
		},
		Money: "", Payment: "",
		OrderedBy: orderRequest.shipTo,
		ShipTo: {OrderShipTo: {Flag: "OrderedBy", Key: "1"} },
		BillTo: {Flag: "OrderedBy"},
		Offers: []
	};

	//Add shipping details
	if(orderRequest.shipping){
		order.Shipping = orderRequest.shipping;
	}

	//Add items
	_.forEach(orderRequest.items, function(quantity, itemId){
		order.Offers.push({
			OfferOrdered: {
				Offer: {
					Header: {
						ID: itemId
					}
				},
				Quantity: quantity,
				OrderShipTo: {Key: "1"}
			}
		});
	});

	//Override all using orderRequest.order
	if(_.isObject(orderRequest.order)){
		_.merge(order, orderRequest.order);
	}

	return {order: order};
}