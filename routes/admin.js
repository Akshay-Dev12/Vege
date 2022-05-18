var express = require('express');
var router = express.Router();
var productHelper=require('../product-Helper/pdtHelper')

/* GET users listing. */
router.get('/', function(req, res, next) {
  productHelper.getAllProduct().then((products)=>{
    // console.log(products)
    res.render('./admin/view-product',{admin:true,products})
  })
});
router.get('/add-pdts',function(req, res){
  res.render('./admin/add-pdts')
});
router.post('/add-pdts', async function(req, res){
  console.log(req.body)
  console.log(req.files.Image)
  req.body.Price=await parseInt(req.body.Price)
  productHelper.addproduct(req.body,(id)=>{
    let image=req.files.Image
    console.log(id)
    image.mv("./public/pdtImages/"+id+".jpeg",(err,done)=>{
      if(!err) res.render('./admin/add-pdts')
      else console.log(err)
    })
    res.render('admin/add-pdts')
  })
});
router.get('/delete-pdt/:id',(req,res)=>{

  let proId=req.params.id
  console.log(proId)
  productHelper.deletePdt(proId).then((response)=>{
    res.redirect('/admin')
  })
})
router.get('/edit-pdt/:id',(req, res)=>{
  let proId=req.params.id
  console.log(proId)
   productHelper.editpdt(proId).then((database)=>{
     if(database){
       console.log(database)
       res.render('admin/edit-pdt',{database})
     }else{
      res.redirect('/admin')

     }
     
    
   })
})
router.post('/edit-pdt/:id',(req, res)=>{
  let body=req.body
  let id=req.params.id
  
  productHelper.updatedata(id,body).then(()=>{
    res.redirect('/admin')
    if(req.files.Image){
      let image=req.files.Image
      image.mv("./public/pdtImages/"+id+".jpeg")
    }
  })
})

module.exports = router;
