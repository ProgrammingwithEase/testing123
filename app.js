var cors = require('cors')
const express = require('express')

const engines = require('consolidate')
const paypal = require('paypal-rest-sdk')
const cons = require('consolidate')
const app = express()
const port =5000


app.use(cors())
app.engine("ejs",engines.ejs)
app.set("views","./views");
app.set("view engine","ejs")
  // hello

app.use(express.json())

app.use(express.urlencoded({extended:true}))


paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AfQMQ-yapUsRjutKkW64OSaQoBS8zzMoa4gfsNMf7PZhgFNNQ8VKc3BahcqC4zQXJFj-YmCXDmOwpoYf',
    'client_secret': 'EIMvSHLZixTMgz97V7My4fwwRRuRCpl9TuYWpcJhRLin1o-bSljjBk8uBlP0XFMAqdky4208WYHwwyNd'
  });

  var amt = null;

app.get('/',(req,res)=>{
  res.render('./index')
})

  app.get('/test/:amt/item/:itemname', (req, res) => {
   // /users/:userId/books/:bookId
    amt = req.params.amt;
 itemname =req.params.itemname
console.log(amt)
console.log(itemname)
})

app.get('/pay/:amt/item/:itemname', (req, res) => {
     
      amt =req.params.amt;
      itemname =req.params.itemname



      const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "https://floating-citadel-33371.herokuapp.com/success",
            "cancel_url": "https://floating-citadel-33371.herokuapp.com/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": itemname,
                    "sku": "001",
                    "price":amt,
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": amt
            },
            "description": "Hat for the best team ever"
        }]
    };
    
    paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
          throw error;
      } else {
          for(let i = 0;i < payment.links.length;i++){
            if(payment.links[i].rel === 'approval_url'){
              res.redirect(payment.links[i].href);
            }
          }
      }
    });
    
    });
  
    app.get('/success', (req, res) => {
      const payerId = req.query.PayerID;
      const paymentId = req.query.paymentId;
      console.log("payerId",payerId,"paymentId",paymentId) 
      const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": amt
            }
        }]
      };
    
      paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log("error",error.response);
            throw error;
        } else {
            res.sendFile(__dirname + "/success.html")
        }
    });
  });
  
  app.get('/cancel', (req, res) => res.send('./Cancelled'));
app.listen(process.env.PORT||port,()=>console.log('server running onport 5000'))




