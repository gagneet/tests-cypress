const gcd = (number1, number2) =>
{
    if (number1 == 0)
        return number2;
    return gcd(number2 % number1, number1);
};

const findGCD = (array) =>
{
    if (!array || array.length === 0) {
        return 0;
    }

    let result = array[0];
    for (let i = 1; i < array.length; i++)
    {
        result = gcd(array[i], result);
 
        if(result === 1)
        {
            return 1;
        }
    }

    return result;
};

export default findGCD;