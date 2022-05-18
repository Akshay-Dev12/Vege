const { response } = require('express');
var express = require('express');
const pdtHelper = require('../product-Helper/pdtHelper');
var router = express.Router();
var productHelper=require('../product-Helper/pdtHelper')
var userHelper=require('../product-Helper/userHelper')



function verifyLogin(req,res,next){
  if(req.session.loggedIn){
    next()
  }
  else{
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/', async(req, res, next)=> {
    let user=req.session.user
    let count=null
    if(req.session.user){
    count=await userHelper.getcount(req.session.user._id)
    }
  productHelper.getAllProduct().then((products)=>{
    let login=req.session.loggedIn
    console.log(products)
    res.render('index', {products,admin:false,user,login,count})
  })
//  let products =[
//     {
//     name:"Iphone",
//     discription:"THis is awesome",
//   src:"https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE4DypU?ver=351a&q=90&m=6&h=405&w=720&b=%23FFFFFFFF&l=f&o=t&aim=true"
//   },
// {
//   name:"One plus",
//   discription:"Wow",
//   src:"https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE4DypU?ver=351a&q=90&m=6&h=405&w=720&b=%23FFFFFFFF&l=f&o=t&aim=true"
// },
// {
//   name:"Hello",
//   discription:"SSKJSK",
//   src:"https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE4DypU?ver=351a&q=90&m=6&h=405&w=720&b=%23FFFFFFFF&l=f&o=t&aim=true"
// },
// {
//   name:"Whan",
//   discription:"Sjksjks",
//   src:"https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE4DypU?ver=351a&q=90&m=6&h=405&w=720&b=%23FFFFFFFF&l=f&o=t&aim=true"
// }]


  
});
router.get('/login',(req,res)=>{
     if(req.session.loggedIn){
       res.redirect('/')
     }else
     {
       
       res.render('./user/login',{loginErr:req.session.flag})
       req.session.flag=false
     }
    

})
router.get('/login/signup',(req,res)=>{
  res.render('./user/signup')
})
router.post('/login/signup',(req,res)=>{
  console.log(req.body)
  userHelper.getUserdata(req.body).then((Responses)=>{
    console.log(Responses);
  })
    res.render('user/signup')
  })
  router.post('/login',(req,res)=>{
    console.log(req.body)
    userHelper.doLogin(req.body).then((response)=>{
      if(response.status){
        req.session.loggedIn=true
        req.session.user=response.user
        res.redirect('/')
      }
      else{
        req.session.flag=true
        res.redirect('/login')
      }
    })
  })
  router.get('/logout',(req, res)=>{
    req.session.destroy()
    res.redirect('/')
  })
  router.get('/cart',verifyLogin,async(req, res)=>{
    
   let products=await userHelper.getProductToCart(req.session.user._id)
   let total=0;
   if(products.length>0){
    total=await userHelper.order(req.session.user._id)
   }
   console.log(products)
   let user=req.session.user
   let nam=req.session.user.Blind
   if(nam=='YES'){
    res.render('user/cartBlind',{products,user,total})
   }else{
    res.render('user/cart',{products,user,total})
   }
   
  })
  router.get('/addToCart/:id',verifyLogin,(req, res)=>{
    console.log("The body is"+req.body.name)
    console.log(req.session.user.Name)
    let nam=req.session.user.Blind;
    console.log(nam)
    let id=req.params.id
    let user=req.session.user._id
    pdtHelper.addToCart(user,id).then((response)=>{
      console.log(response)
      if(nam=='YES'){
        res.redirect('/blindCart')
      }else{
        res.redirect('/')
      }
      
    })
  })

  router.get('/remove/:id',(req, res)=>{
    console.log(req.params.id);

    userHelper.removeCart(req.params.id,req.session.user._id).then(()=>{
      res.redirect('/cart')
    })

  })
  router.get('/increment/:id',(req,res)=>{
    console.log("Item Id:"+req.params.id);
    console.log("UserID"+req.session.user._id);
    userHelper.increment(req.params.id,req.session.user._id).then(()=>{
      res.redirect('/cart')
    })
    
  })
  router.get('/decrement/:id',(req, res)=>{
    userHelper.decrement(req.params.id,req.session.user._id).then(()=>{
      res.redirect('/cart')
    })

    

  })
  router.get('/order', verifyLogin, async(req, res)=>{
    let total=await userHelper.order(req.session.user._id)
    user=req.session.user._id;
    let nam=req.session.user.Blind
    let userName=req.session.user.Name
    let userEmail=req.session.user.Email
    let userPhone=req.session.user.Phone
    let userAddress=req.session.user.Address
    if(nam=='YES'){
      res.render('user/orderBlind',{total,user,userName,userEmail,userPhone,userAddress})

    }else{
      res.render('user/order',{total,user})
    }
    
  })
  router.post('/order',async(req, res)=>{
    let total=await userHelper.order(req.session.user._id)
    let products=await userHelper.getcartdetails(req.session.user._id)
    userHelper.orderchart(req.body,total,products).then((orderId)=>{
      if(req.body['payment']=='cod'){
        res.json({codSuccess:true})
      }else{
        userHelper.generateRazorpay(orderId,total).then((response)=>{
          res.json(response)

        })
      }
      
    })
  })
  router.get('/orderSuccess',(req,res)=>{
    user=req.session.user._id
    res.render('user/orderSuccess',{user})
    
  })
  // router.get('/OrderList',(req,res)=>{
  //   res.render('user/OrderList')
  // })
  router.get('/OrderList',async(req,res)=>{
    let order=await userHelper.viewOrder(req.session.user._id)
    let user=req.session.user;
    // console.log(order);
    res.render('user/OrderList',{order,user})
  })
  router.get('/viewOrderPdt/:id',async(req,res)=>{
    console.log("+orderId",req.params.id);
    let products=await userHelper.getOrderPdts(req.params.id);
    res.render('user/viewPdtOrder',{products});

  })
  router.post('/verifyPayment',(req,res)=>{
    console.log(req.body)
    userHelper.verifyPayment(req.body).then(()=>{
      console.log("Sha256 Alogoritm Checked")
      userHelper.changeOrderStatus(req.body['order[receipt]']).then(()=>{
        console.log("Payment Success")
        res.json({status:true})
      })

    }).catch((err)=>{
      res.json({status:false})
    })
  })
  router.get('/blindCart',async(req,res)=>{
    console.log("Here we blind mode")
    let user=req.session.user
    let count=null
    if(req.session.user){
    count=await userHelper.getcount(req.session.user._id)
    }
    let login=req.session.loggedIn
    res.render('./user/indexBlind',{admin:false,user,login,count});
  })
  router.get('/blindClick/:id',verifyLogin,(req,res)=>{
    console.log(req.params.id)
    let id=req.params.id;
    userHelper.findpdt(id).then(()=>{
      console.log("Here we")
      res.redirect('/')
    })
  })
  router.get('/farmersPortal',verifyLogin,(req,res)=>{
    res.render('user/farmer')
  })
  router.post('/farmersPortal',(req,res)=>{
    console.log(req.body)
    userHelper.addFarmerPdt(req.body).then((data)=>{
      console.log(data)
    })
    res.redirect('/')
  })
module.exports = router;
