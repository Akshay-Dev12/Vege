
const { resolve, reject } = require('promise')
const collection = require('../config/collection')
var db=require('../config/connection')
var objectId=require('mongodb').ObjectID
module.exports={

   addproduct:(product,callback)=>{
       console.log(product)
       db.get().collection('product').insertOne(product).then((data)=>{
           callback(data.ops[0]._id)
       })
   },
   getAllProduct:()=>{
       return new Promise(async (resolve,reject)=>{
           let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
           resolve(products)
           
       })
   },
   deletePdt:(proId)=>{
       return new Promise((resolve,reject)=>{
           db.get().collection(collection.PRODUCT_COLLECTION).removeOne({_id: objectId(proId) }).then((data)=>{
               console.log(data)
               resolve(data)
           })
       })
   },
   editpdt:(body)=>{
       return new Promise(async(resolve,reject)=>{
           let product=await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id: objectId(body) })
           resolve(product)
       })
   },
   updatedata:(id,body)=>{
       return new Promise((resolve,reject)=>{
           db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id: objectId(id)},{
           $set:{
               Name:body.Name,
               Dis:body.Dis,
               Price:body.Price
           }
           }).then((response)=>{
               resolve()
           })
       })
   },
   addToCart:(user,pdtId)=>{
       let proObj={
           item:objectId(pdtId),
           quandity:1
       }
       return new Promise(async(resolve,reject)=>{
           let Usercart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(user)})
           if(Usercart){
               let proExist=Usercart.products.findIndex(product=> product.item==pdtId)
               console.log(proExist);
               if(proExist!=-1){
                   db.get().collection(collection.CART_COLLECTION).updateOne({'products.item':objectId(pdtId)},
                   {
                       $inc:{'products.$.quandity':1}
                   }).then(()=>{
                       resolve()
                   })
               }else{
                   db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(user)},
                   {
                       $push:{
                           products:proObj
                       }
                   }).then((response)=>{
                       resolve()
                   })
               }
           }
           else{
               cartObj={
                   user:objectId(user),
                   products:[proObj]
               }
               db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                   resolve()
               })
           }
       })
   }

   
   

}