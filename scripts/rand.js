function rand(n) {
  return Math.floor(Math.random() * n);
}

var biasedWeights = [];

function biasedRand()
{
  return Math.floor(biasedWeights[rand(biasedWeights.length)]);
}

function biasedWeightsGenerate(n)
{
  for (let i = 0; i < n; i++)
    {
      for (let j = 0; j < i; j++)
        {
          biasedWeights.push(i); 
        }
    }
}