/**
 * TODOS: 目前函数体内只支持一个表达式， 多个就会出现内存问题
 * 原因：
 * 每个表达式都会往stack push一个值
 * 如果没被 callExpression等表达式消化掉就会导致内存异常
 * 优点：
 *  轻松支持多个参数传递
 * 缺点：
 *  函数体内只能支持一个表达式，同时也是返回，最后一个表达式 push到 stack的值会在函数体内 pop rax消化
 * */ 


function add(a,b){
    return a+b;
}

function main(){
    print(add(add(1,2), 3))
    print(add(add(1,2), add(3,4)))
    // add(1,2)
    // add(2,3)
}
