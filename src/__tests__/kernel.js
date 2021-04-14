function printChar($$c){
    /**
     * First argument is stdout
     * Second argument is a pointer to a char array( of length one);
     * Third argument is the length of the char array
     */
    console.log(1,$$c,1)
}

function print(n){
    // if(n>9){
    //     print(n/9)
    // }
    // 48 is the ASCII code for '0'
    printChar(48 + n % 10);
}