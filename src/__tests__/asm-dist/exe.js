const cp = require('child_process')

cp.execFile('./fib',(err,data)=>{
    if(err){
        console.log(err)
    }else{
        console.log(data)
    }
})