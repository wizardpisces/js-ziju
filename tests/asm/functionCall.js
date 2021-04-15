// TODOS: 目前函数体内只支持一个表达式，多个就会出现内存问题

function add(a,b){
    // print(a)
    return a+b;
}

function main(){
    print(add(add(1, 2), 3))
    // add(1,2)
    // add(2,3)
}
