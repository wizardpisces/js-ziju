function tailFib(n1, n2, n) {
    if (n === 0) {
        return n1
    }
    return tailFib(n2, n1 + n2, n - 1)
}

function fibHelper(n) {
    return tailFib(0, 1, n)
}

function main() {
    console.log(fibHelper(5))
}

main()