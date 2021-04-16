// non recursive
function fibonacci(n) {
    let f0 = 0,
        f1 = 1,
        temp = f1,
        i = 0;

    while (i < n) {
        console.log(f1)
        temp = f1;
        f1 = f1 + f0;
        f0 = temp;
        i++;
    }

}

fibonacci(5)