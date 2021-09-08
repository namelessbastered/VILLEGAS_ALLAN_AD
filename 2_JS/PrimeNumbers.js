const isPrime = n => {
    if (n === 2 || n === 3) return true;
    if (n < 2 || n % 2 === 0) return false;

    return isPrimeRecursive(n);
}

const isPrimeRecursive = (n, i = 3, limit = Math.floor(Math.sqrt(n))) => {
    if (n % i === 0) return false;
    if (i >= limit) return true;
    return isPrimeRecursive(n, i += 2, limit);
}

for (i = 0; i <= 50; i++) {
    console.log(`${i} is ${isPrime(i) ? `a` : `not a` } prime`);
  }