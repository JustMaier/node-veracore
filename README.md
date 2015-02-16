node-veracore
==============

A small node module that helps integrate your application with veracore/promail.
There are still several SOAP methods on veracore/promail that are not implemented in this module.
Feel free to fork and make pull requests, or add issues as you please.

## Install

```npm install node-veracore```

## Usage

After having installed it, simply require it, set it up with your own clientId and clientSecret, and start calling methods!

```javascript
var veracore = require('node-veracore')('username','password');

veracore.callMethods();
```

### Functions and responses
| Functions | Returns to callback | Explanation |
| ---------------- | ---------------- | ---------------- |
| **getOffers** (searchString, callback) | callback(err, results) | Gets all offers that have an ID or Description matching the search string. Use % as a wildcard character.  |
| **getProduct** (id, ownerId, callback) | callback(err, result) | Gets product by id and ownerId.  |
| **getOrder** (id, callback) | callback(err, result) | Gets an order by id.  |
| **addOrder** (orderRequest, callback) | callback(err, result) | Adds an order using the `orderRequest` object (see details on the `orderRequest` object below), and returns the order id.  |
| **getShippingActivity** (startDate, endDate, callback) | callback(err, result) | Gets all shipping activity between the start date and end date as ISO string. |
| **getShippingCharge** (startDate, endDate, callback) | callback(err, result) | Gets all shipping charges between the start date and end date as ISO string (includes tracking #). |
| **connect** (callback) | callback(client) | Connects to the SOAP client. This is mostly an internal method, but you can use it if you ever need to reconnect for some reason.  |

### `orderRequest` object
| Property | Description |
| --------------| ------------------------------------|
| **`shipTo`** `object`| The information about the user that you want to ship to. Notice that properties are capitalized, this is a requirement from veracore. |
| **`items`** `object`| An object where the key is the `offerId` and the value is `quantity`. |
| **`comments`** `string`| Comments to attached to the order. |
| **`shipping`** `object`| The `FreightCode` and [`FreightCodeDescription`] for shipping. |
| **`order`** `object` | An object that will be used to override any properties in the order. Use this to tweak an order to your heart's content. |

## Examples

### Getting Offers
```javascript
veracore.getOffers('ZB-%', function(err, results){
  if(err) throw err;

  results.forEach(function(result){
    console.log(result);
  })
});
```
### Add an Order
```javascript
var orderRequest = {
  shipTo: {
    FullName: "Justin Maier",
    Address1: "123 MadeUp St",
    City: "Redmond",
    State: "Washington",
    PostalCode: "12345",
    Country: "USA",
    Phone: "425-555-1234",
    Email: "justin@someemail.com"
  },
  items: {
  	'ZB0020':1
  },
  comments: "DO NOT PROCESS!",
  shipping: {
    FreightCode: "P01",
    FreightCodeDescription: "USPS First Class Mail"
  }
}

veracore.addOrder(orderRequest, function(err, result){
  if(err) throw err;
  
  console.log(JSON.stringify(result, null, 4));
})
```