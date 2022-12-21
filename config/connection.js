var MongoClient = require('mongodb').MongoClient;
const state={
    db:null
}
module.exports.connect=function(done){
    var url = 'mongodb+srv://AkshayDev:Mmsa123@cluster0.txolaq9.mongodb.net/?retryWrites=true&w=majority';
    const dbname='shopping'
    MongoClient.connect(url, (err, data)=>{
        if(err) return done(err)
        state.db=data.db(dbname)
        done()
    
    })

}
module.exports.get=function(){
    return state.db
}
