function tailFib(n1, n2, n) {
    if (n === 0) {
        return n1
    }else{
        return tailFib(n2, n1 + n2, n - 1)
    }
}

function fibHelper(n) { // (n)th number
    return tailFib(0, 1, n)
}

function main() {
    print(fibHelper(5))
}