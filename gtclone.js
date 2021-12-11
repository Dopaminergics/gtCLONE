// ------------------------------------
// 1. DEPENDENCIES 
// ------------------------------------

require("dotenv").config();
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const Web3 = require("web3");
const io = require("socket.io-client");
// const socket = io(process.env.PRICES_URL);
const socketSignals = io(process.env.SIGNALS_URL);
const util = require('util');
const WebSocket = require('ws');
const { Console } = require("console");
const { ENETDOWN } = require("constants");
const { GasPriceOracle } = require('gas-price-oracle');

let prices= [];

let pairList = ['btc','eth','link', 'doge', 'matic', 'ada', 'sushi', 'aave', 'algo', 'bat', 'comp', 'dot', 'eos', 'ltc', 'mana', 'omg', 'snx', 'uni', 'xlm', 'xrp', 'zec', 
'audusd', 'eurchf', 'eurgbp', 'eurjpy', 'eurusd', 'gbpusd', 'nzdusd', 'usdcad', 'usdchf', 'usdjpy', 
'luna', 'yfi', 'sol', 'xtz', 'bch', 'bnt', 'crv', 'dash','etc', 'icp', 'mkr', 'neo', 'theta', 'trx', 'zrx'];

// -----------------------------------------
// 2. GLOBAL VARIABLES
// -----------------------------------------

const STORAGE_ABI = [{"inputs":[{"internalType":"contractTokenInterfaceV5","name":"_dai","type":"address"},{"internalType":"contractTokenInterfaceV5","name":"_token","type":"address"},{"internalType":"contractTokenInterfaceV5","name":"_linkErc677","type":"address"},{"internalType":"contractNftInterfaceV5[5]","name":"_nfts","type":"address[5]"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":false,"internalType":"address","name":"a","type":"address"}],"name":"AddressUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"contractNftInterfaceV5[5]","name":"nfts","type":"address[5]"}],"name":"NftsUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"NumberUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":false,"internalType":"uint256","name":"pairIndex","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"NumberUpdatedPair","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256[5]","name":"","type":"uint256[5]"}],"name":"SpreadReductionsUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"a","type":"address"}],"name":"SupportedTokenAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"a","type":"address"}],"name":"TradingContractAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"a","type":"address"}],"name":"TradingContractRemoved","type":"event"},{"inputs":[],"name":"MINTER_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"PRECISION","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"callbacks","outputs":[{"internalType":"contractPausableInterfaceV5","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"dai","outputs":[{"internalType":"contractTokenInterfaceV5","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"defaultLeverageUnlocked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"dev","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"devFeesDai","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"devFeesToken","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"gov","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"govFeesDai","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"govFeesToken","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"isTradingContract","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"linkErc677","outputs":[{"internalType":"contractTokenInterfaceV5","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"maxGainP","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"maxPendingMarketOrders","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"maxSlP","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"maxTradesPerBlock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"maxTradesPerPair","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"nftLastSuccess","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"nftRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"nftSuccessTimelock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"nfts","outputs":[{"internalType":"contractNftInterfaceV5","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"openInterestDai","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"openLimitOrderIds","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"openLimitOrders","outputs":[{"internalType":"address","name":"trader","type":"address"},{"internalType":"uint256","name":"pairIndex","type":"uint256"},{"internalType":"uint256","name":"index","type":"uint256"},{"internalType":"uint256","name":"positionSize","type":"uint256"},{"internalType":"uint256","name":"spreadReductionP","type":"uint256"},{"internalType":"bool","name":"buy","type":"bool"},{"internalType":"uint256","name":"leverage","type":"uint256"},{"internalType":"uint256","name":"tp","type":"uint256"},{"internalType":"uint256","name":"sl","type":"uint256"},{"internalType":"uint256","name":"minPrice","type":"uint256"},{"internalType":"uint256","name":"maxPrice","type":"uint256"},{"internalType":"uint256","name":"block","type":"uint256"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"openLimitOrdersCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"openTrades","outputs":[{"internalType":"address","name":"trader","type":"address"},{"internalType":"uint256","name":"pairIndex","type":"uint256"},{"internalType":"uint256","name":"index","type":"uint256"},{"internalType":"uint256","name":"initialPosToken","type":"uint256"},{"internalType":"uint256","name":"positionSizeDai","type":"uint256"},{"internalType":"uint256","name":"openPrice","type":"uint256"},{"internalType":"bool","name":"buy","type":"bool"},{"internalType":"uint256","name":"leverage","type":"uint256"},{"internalType":"uint256","name":"tp","type":"uint256"},{"internalType":"uint256","name":"sl","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"openTradesCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"openTradesInfo","outputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"tokenPriceDai","type":"uint256"},{"internalType":"uint256","name":"openInterestDai","type":"uint256"},{"internalType":"uint256","name":"tpLastUpdated","type":"uint256"},{"internalType":"uint256","name":"slLastUpdated","type":"uint256"},{"internalType":"bool","name":"beingMarketClosed","type":"bool"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"pairTraders","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"pairTradersId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"pendingMarketCloseCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"pendingMarketOpenCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"pendingOrderIds","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"pool","outputs":[{"internalType":"contractPoolInterfaceV5","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"priceAggregator","outputs":[{"internalType":"contractAggregatorInterfaceV5","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"reqID_pendingMarketOrder","outputs":[{"components":[{"internalType":"address","name":"trader","type":"address"},{"internalType":"uint256","name":"pairIndex","type":"uint256"},{"internalType":"uint256","name":"index","type":"uint256"},{"internalType":"uint256","name":"initialPosToken","type":"uint256"},{"internalType":"uint256","name":"positionSizeDai","type":"uint256"},{"internalType":"uint256","name":"openPrice","type":"uint256"},{"internalType":"bool","name":"buy","type":"bool"},{"internalType":"uint256","name":"leverage","type":"uint256"},{"internalType":"uint256","name":"tp","type":"uint256"},{"internalType":"uint256","name":"sl","type":"uint256"}],"internalType":"structGFarmTestnetTradingStorageV5.Trade","name":"trade","type":"tuple"},{"internalType":"uint256","name":"block","type":"uint256"},{"internalType":"uint256","name":"wantedPrice","type":"uint256"},{"internalType":"uint256","name":"slippageP","type":"uint256"},{"internalType":"uint256","name":"spreadReductionP","type":"uint256"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"reqID_pendingNftOrder","outputs":[{"internalType":"address","name":"nftHolder","type":"address"},{"internalType":"uint256","name":"nftId","type":"uint256"},{"internalType":"address","name":"trader","type":"address"},{"internalType":"uint256","name":"pairIndex","type":"uint256"},{"internalType":"uint256","name":"index","type":"uint256"},{"internalType":"enumGFarmTestnetTradingStorageV5.LimitOrder","name":"orderType","type":"uint8"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"spreadReductionsP","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"supportedTokens","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"token","outputs":[{"internalType":"contractTokenInterfaceV5","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"tokenDaiRouter","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"tokensBurned","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"tokensMinted","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"traders","outputs":[{"internalType":"uint256","name":"leverageUnlocked","type":"uint256"},{"internalType":"address","name":"referral","type":"address"},{"internalType":"uint256","name":"referralRewardsTotal","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"tradesPerBlock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"trading","outputs":[{"internalType":"contractPausableInterfaceV5","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"vault","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"_gov","type":"address"}],"name":"setGov","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_dev","type":"address"}],"name":"setDev","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contractTokenInterfaceV5","name":"_newToken","type":"address"}],"name":"updateToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contractNftInterfaceV5[5]","name":"_nfts","type":"address[5]"}],"name":"updateNfts","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_trading","type":"address"}],"name":"addTradingContract","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_trading","type":"address"}],"name":"removeTradingContract","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_token","type":"address"}],"name":"addSupportedToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_aggregator","type":"address"}],"name":"setPriceAggregator","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_pool","type":"address"}],"name":"setPool","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_vault","type":"address"}],"name":"setVault","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_trading","type":"address"}],"name":"setTrading","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_callbacks","type":"address"}],"name":"setCallbacks","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_tokenDaiRouter","type":"address"}],"name":"setTokenDaiRouter","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_maxTradesPerBlock","type":"uint256"}],"name":"setMaxTradesPerBlock","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_maxTradesPerPair","type":"uint256"}],"name":"setMaxTradesPerPair","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_maxPendingMarketOrders","type":"uint256"}],"name":"setMaxPendingMarketOrders","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_max","type":"uint256"}],"name":"setMaxGainP","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_lev","type":"uint256"}],"name":"setDefaultLeverageUnlocked","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_max","type":"uint256"}],"name":"setMaxSlP","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_blocks","type":"uint256"}],"name":"setNftSuccessTimelock","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256[5]","name":"_r","type":"uint256[5]"}],"name":"setSpreadReductionsP","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"},{"internalType":"uint256","name":"_newMaxOpenInterest","type":"uint256"}],"name":"setMaxOpenInterestDai","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"trader","type":"address"},{"internalType":"uint256","name":"pairIndex","type":"uint256"},{"internalType":"uint256","name":"index","type":"uint256"},{"internalType":"uint256","name":"initialPosToken","type":"uint256"},{"internalType":"uint256","name":"positionSizeDai","type":"uint256"},{"internalType":"uint256","name":"openPrice","type":"uint256"},{"internalType":"bool","name":"buy","type":"bool"},{"internalType":"uint256","name":"leverage","type":"uint256"},{"internalType":"uint256","name":"tp","type":"uint256"},{"internalType":"uint256","name":"sl","type":"uint256"}],"internalType":"structGFarmTestnetTradingStorageV5.Trade","name":"_trade","type":"tuple"},{"components":[{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"tokenPriceDai","type":"uint256"},{"internalType":"uint256","name":"openInterestDai","type":"uint256"},{"internalType":"uint256","name":"tpLastUpdated","type":"uint256"},{"internalType":"uint256","name":"slLastUpdated","type":"uint256"},{"internalType":"bool","name":"beingMarketClosed","type":"bool"}],"internalType":"structGFarmTestnetTradingStorageV5.TradeInfo","name":"_tradeInfo","type":"tuple"}],"name":"storeTrade","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"trader","type":"address"},{"internalType":"uint256","name":"pairIndex","type":"uint256"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"unregisterTrade","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"components":[{"internalType":"address","name":"trader","type":"address"},{"internalType":"uint256","name":"pairIndex","type":"uint256"},{"internalType":"uint256","name":"index","type":"uint256"},{"internalType":"uint256","name":"initialPosToken","type":"uint256"},{"internalType":"uint256","name":"positionSizeDai","type":"uint256"},{"internalType":"uint256","name":"openPrice","type":"uint256"},{"internalType":"bool","name":"buy","type":"bool"},{"internalType":"uint256","name":"leverage","type":"uint256"},{"internalType":"uint256","name":"tp","type":"uint256"},{"internalType":"uint256","name":"sl","type":"uint256"}],"internalType":"structGFarmTestnetTradingStorageV5.Trade","name":"trade","type":"tuple"},{"internalType":"uint256","name":"block","type":"uint256"},{"internalType":"uint256","name":"wantedPrice","type":"uint256"},{"internalType":"uint256","name":"slippageP","type":"uint256"},{"internalType":"uint256","name":"spreadReductionP","type":"uint256"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"internalType":"structGFarmTestnetTradingStorageV5.PendingMarketOrder","name":"_order","type":"tuple"},{"internalType":"uint256","name":"_id","type":"uint256"},{"internalType":"bool","name":"_open","type":"bool"}],"name":"storePendingMarketOrder","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"},{"internalType":"bool","name":"_open","type":"bool"}],"name":"unregisterPendingMarketOrder","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"trader","type":"address"},{"internalType":"uint256","name":"pairIndex","type":"uint256"},{"internalType":"uint256","name":"index","type":"uint256"},{"internalType":"uint256","name":"positionSize","type":"uint256"},{"internalType":"uint256","name":"spreadReductionP","type":"uint256"},{"internalType":"bool","name":"buy","type":"bool"},{"internalType":"uint256","name":"leverage","type":"uint256"},{"internalType":"uint256","name":"tp","type":"uint256"},{"internalType":"uint256","name":"sl","type":"uint256"},{"internalType":"uint256","name":"minPrice","type":"uint256"},{"internalType":"uint256","name":"maxPrice","type":"uint256"},{"internalType":"uint256","name":"block","type":"uint256"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"internalType":"structGFarmTestnetTradingStorageV5.OpenLimitOrder","name":"o","type":"tuple"}],"name":"storeOpenLimitOrder","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"trader","type":"address"},{"internalType":"uint256","name":"pairIndex","type":"uint256"},{"internalType":"uint256","name":"index","type":"uint256"},{"internalType":"uint256","name":"positionSize","type":"uint256"},{"internalType":"uint256","name":"spreadReductionP","type":"uint256"},{"internalType":"bool","name":"buy","type":"bool"},{"internalType":"uint256","name":"leverage","type":"uint256"},{"internalType":"uint256","name":"tp","type":"uint256"},{"internalType":"uint256","name":"sl","type":"uint256"},{"internalType":"uint256","name":"minPrice","type":"uint256"},{"internalType":"uint256","name":"maxPrice","type":"uint256"},{"internalType":"uint256","name":"block","type":"uint256"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"internalType":"structGFarmTestnetTradingStorageV5.OpenLimitOrder","name":"_o","type":"tuple"}],"name":"updateOpenLimitOrder","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_trader","type":"address"},{"internalType":"uint256","name":"_pairIndex","type":"uint256"},{"internalType":"uint256","name":"_index","type":"uint256"}],"name":"unregisterOpenLimitOrder","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"nftHolder","type":"address"},{"internalType":"uint256","name":"nftId","type":"uint256"},{"internalType":"address","name":"trader","type":"address"},{"internalType":"uint256","name":"pairIndex","type":"uint256"},{"internalType":"uint256","name":"index","type":"uint256"},{"internalType":"enumGFarmTestnetTradingStorageV5.LimitOrder","name":"orderType","type":"uint8"}],"internalType":"structGFarmTestnetTradingStorageV5.PendingNftOrder","name":"_nftOrder","type":"tuple"},{"internalType":"uint256","name":"_orderId","type":"uint256"}],"name":"storePendingNftOrder","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_order","type":"uint256"}],"name":"unregisterPendingNftOrder","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_trader","type":"address"},{"internalType":"uint256","name":"_pairIndex","type":"uint256"},{"internalType":"uint256","name":"_index","type":"uint256"},{"internalType":"uint256","name":"_newSl","type":"uint256"}],"name":"updateSl","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_trader","type":"address"},{"internalType":"uint256","name":"_pairIndex","type":"uint256"},{"internalType":"uint256","name":"_index","type":"uint256"},{"internalType":"uint256","name":"_newTp","type":"uint256"}],"name":"updateTp","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"trader","type":"address"},{"internalType":"uint256","name":"pairIndex","type":"uint256"},{"internalType":"uint256","name":"index","type":"uint256"},{"internalType":"uint256","name":"initialPosToken","type":"uint256"},{"internalType":"uint256","name":"positionSizeDai","type":"uint256"},{"internalType":"uint256","name":"openPrice","type":"uint256"},{"internalType":"bool","name":"buy","type":"bool"},{"internalType":"uint256","name":"leverage","type":"uint256"},{"internalType":"uint256","name":"tp","type":"uint256"},{"internalType":"uint256","name":"sl","type":"uint256"}],"internalType":"structGFarmTestnetTradingStorageV5.Trade","name":"_t","type":"tuple"}],"name":"updateTrade","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_trader","type":"address"},{"internalType":"address","name":"_referral","type":"address"}],"name":"storeReferral","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_referral","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"increaseReferralRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"distributeLpRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_nftId","type":"uint256"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"increaseNftRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_trader","type":"address"},{"internalType":"uint256","name":"_newLeverage","type":"uint256"}],"name":"setLeverageUnlocked","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"},{"internalType":"uint256","name":"_leveragedPositionSize","type":"uint256"},{"internalType":"bool","name":"_dai","type":"bool"},{"internalType":"bool","name":"_fullFee","type":"bool"}],"name":"handleDevGovFees","outputs":[{"internalType":"uint256","name":"fee","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"claimFees","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_a","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"bool","name":"_mint","type":"bool"}],"name":"handleTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_from","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"transferDai","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_from","type":"address"},{"internalType":"uint256","name":"_pairIndex","type":"uint256"},{"internalType":"uint256","name":"_leveragedPosDai","type":"uint256"}],"name":"transferLinkToAggregator","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"trader","type":"address"},{"internalType":"uint256","name":"pairIndex","type":"uint256"}],"name":"firstEmptyTradeIndex","outputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"trader","type":"address"},{"internalType":"uint256","name":"pairIndex","type":"uint256"}],"name":"firstEmptyOpenLimitIndex","outputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"trader","type":"address"},{"internalType":"uint256","name":"pairIndex","type":"uint256"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"hasOpenLimitOrder","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"_trader","type":"address"}],"name":"getReferral","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"_trader","type":"address"}],"name":"getLeverageUnlocked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"}],"name":"pairTradersArray","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"_trader","type":"address"}],"name":"getPendingOrderIds","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"_trader","type":"address"}],"name":"pendingOrderIdsCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"_trader","type":"address"},{"internalType":"uint256","name":"_pairIndex","type":"uint256"},{"internalType":"uint256","name":"_index","type":"uint256"}],"name":"getOpenLimitOrder","outputs":[{"components":[{"internalType":"address","name":"trader","type":"address"},{"internalType":"uint256","name":"pairIndex","type":"uint256"},{"internalType":"uint256","name":"index","type":"uint256"},{"internalType":"uint256","name":"positionSize","type":"uint256"},{"internalType":"uint256","name":"spreadReductionP","type":"uint256"},{"internalType":"bool","name":"buy","type":"bool"},{"internalType":"uint256","name":"leverage","type":"uint256"},{"internalType":"uint256","name":"tp","type":"uint256"},{"internalType":"uint256","name":"sl","type":"uint256"},{"internalType":"uint256","name":"minPrice","type":"uint256"},{"internalType":"uint256","name":"maxPrice","type":"uint256"},{"internalType":"uint256","name":"block","type":"uint256"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"internalType":"structGFarmTestnetTradingStorageV5.OpenLimitOrder","name":"","type":"tuple"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"getOpenLimitOrders","outputs":[{"components":[{"internalType":"address","name":"trader","type":"address"},{"internalType":"uint256","name":"pairIndex","type":"uint256"},{"internalType":"uint256","name":"index","type":"uint256"},{"internalType":"uint256","name":"positionSize","type":"uint256"},{"internalType":"uint256","name":"spreadReductionP","type":"uint256"},{"internalType":"bool","name":"buy","type":"bool"},{"internalType":"uint256","name":"leverage","type":"uint256"},{"internalType":"uint256","name":"tp","type":"uint256"},{"internalType":"uint256","name":"sl","type":"uint256"},{"internalType":"uint256","name":"minPrice","type":"uint256"},{"internalType":"uint256","name":"maxPrice","type":"uint256"},{"internalType":"uint256","name":"block","type":"uint256"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"internalType":"structGFarmTestnetTradingStorageV5.OpenLimitOrder[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"getSupportedTokens","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"getSpreadReductionsArray","outputs":[{"internalType":"uint256[5]","name":"","type":"uint256[5]"}],"stateMutability":"view","type":"function","constant":true}];
const TRADING_ABI = [{"inputs":[{"internalType":"contract StorageInterfaceV5","name":"_storageT","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":false,"internalType":"address","name":"a","type":"address"}],"name":"AddressUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"orderId","type":"uint256"},{"components":[{"components":[{"internalType":"address","name":"trader","type":"address"},{"internalType":"uint256","name":"pairIndex","type":"uint256"},{"internalType":"uint256","name":"index","type":"uint256"},{"internalType":"uint256","name":"initialPosToken","type":"uint256"},{"internalType":"uint256","name":"positionSizeDai","type":"uint256"},{"internalType":"uint256","name":"openPrice","type":"uint256"},{"internalType":"bool","name":"buy","type":"bool"},{"internalType":"uint256","name":"leverage","type":"uint256"},{"internalType":"uint256","name":"tp","type":"uint256"},{"internalType":"uint256","name":"sl","type":"uint256"}],"internalType":"struct StorageInterfaceV5.Trade","name":"trade","type":"tuple"},{"internalType":"uint256","name":"block","type":"uint256"},{"internalType":"uint256","name":"wantedPrice","type":"uint256"},{"internalType":"uint256","name":"slippageP","type":"uint256"},{"internalType":"uint256","name":"spreadReductionP","type":"uint256"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"indexed":false,"internalType":"struct StorageInterfaceV5.PendingMarketOrder","name":"order","type":"tuple"}],"name":"ChainlinkCallbackTimeout","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"trader","type":"address"},{"indexed":true,"internalType":"uint256","name":"pairIndex","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"index","type":"uint256"},{"indexed":false,"internalType":"string","name":"message","type":"string"}],"name":"CouldNotCloseTrade","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"trader","type":"address"},{"indexed":false,"internalType":"uint256","name":"pairIndex","type":"uint256"},{"indexed":false,"internalType":"bool","name":"open","type":"bool"},{"indexed":false,"internalType":"uint256","name":"orderId","type":"uint256"}],"name":"MarketOrderInitiated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"nftHolder","type":"address"},{"indexed":false,"internalType":"address","name":"trader","type":"address"},{"indexed":false,"internalType":"uint256","name":"pairIndex","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"orderId","type":"uint256"}],"name":"NftOrderInitiated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"NumberUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"trader","type":"address"},{"indexed":true,"internalType":"uint256","name":"pairIndex","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"index","type":"uint256"}],"name":"OpenLimitCanceled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"trader","type":"address"},{"indexed":true,"internalType":"uint256","name":"pairIndex","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"index","type":"uint256"}],"name":"OpenLimitPlaced","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"trader","type":"address"},{"indexed":true,"internalType":"uint256","name":"pairIndex","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"index","type":"uint256"}],"name":"OpenLimitUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bool","name":"paused","type":"bool"}],"name":"Pause","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"trader","type":"address"},{"indexed":true,"internalType":"uint256","name":"pairIndex","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"index","type":"uint256"}],"name":"SlUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"trader","type":"address"},{"indexed":true,"internalType":"uint256","name":"pairIndex","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"index","type":"uint256"}],"name":"TpUpdated","type":"event"},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"},{"internalType":"uint256","name":"_index","type":"uint256"}],"name":"cancelOpenLimitOrder","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"},{"internalType":"uint256","name":"_index","type":"uint256"}],"name":"closeTradeMarket","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_order","type":"uint256"}],"name":"closeTradeMarketTimeout","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"enum StorageInterfaceV5.LimitOrder","name":"_orderType","type":"uint8"},{"internalType":"address","name":"_trader","type":"address"},{"internalType":"uint256","name":"_pairIndex","type":"uint256"},{"internalType":"uint256","name":"_index","type":"uint256"},{"internalType":"uint256","name":"_nftId","type":"uint256"},{"internalType":"uint256","name":"_nftType","type":"uint256"}],"name":"executeNftOrder","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"isPaused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"limitOrdersTimelock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxPosDaiP","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"minPosDai","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"trader","type":"address"},{"internalType":"uint256","name":"pairIndex","type":"uint256"},{"internalType":"uint256","name":"index","type":"uint256"},{"internalType":"uint256","name":"initialPosToken","type":"uint256"},{"internalType":"uint256","name":"positionSizeDai","type":"uint256"},{"internalType":"uint256","name":"openPrice","type":"uint256"},{"internalType":"bool","name":"buy","type":"bool"},{"internalType":"uint256","name":"leverage","type":"uint256"},{"internalType":"uint256","name":"tp","type":"uint256"},{"internalType":"uint256","name":"sl","type":"uint256"}],"internalType":"struct StorageInterfaceV5.Trade","name":"t","type":"tuple"},{"internalType":"bool","name":"_limit","type":"bool"},{"internalType":"uint256","name":"_spreadReductionId","type":"uint256"},{"internalType":"uint256","name":"_slippageP","type":"uint256"},{"internalType":"address","name":"_referral","type":"address"}],"name":"openTrade","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_order","type":"uint256"}],"name":"openTradeMarketTimeout","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"orderTimeout","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_blocks","type":"uint256"}],"name":"setLimitOrdersTimelock","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_maxP","type":"uint256"}],"name":"setMaxPosDaiP","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_min","type":"uint256"}],"name":"setMinPosDai","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_orderTimeout","type":"uint256"}],"name":"setOrderTimeout","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract StorageInterfaceV5","name":"_storageT","type":"address"}],"name":"setStorageT","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"storageT","outputs":[{"internalType":"contract StorageInterfaceV5","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"},{"internalType":"uint256","name":"_index","type":"uint256"},{"internalType":"uint256","name":"_price","type":"uint256"},{"internalType":"uint256","name":"_slippageP","type":"uint256"},{"internalType":"uint256","name":"_tp","type":"uint256"},{"internalType":"uint256","name":"_sl","type":"uint256"}],"name":"updateOpenLimitOrder","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"},{"internalType":"uint256","name":"_index","type":"uint256"},{"internalType":"uint256","name":"_newSl","type":"uint256"}],"name":"updateSl","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"},{"internalType":"uint256","name":"_index","type":"uint256"},{"internalType":"uint256","name":"_newTp","type":"uint256"}],"name":"updateTp","outputs":[],"stateMutability":"nonpayable","type":"function"}]
const CALLBACKS_ABI = [{"inputs":[{"internalType":"contractStorageInterfaceV5","name":"_storageT","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":false,"internalType":"address","name":"a","type":"address"}],"name":"AddressUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"orderId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"limitIndex","type":"uint256"},{"components":[{"internalType":"address","name":"trader","type":"address"},{"internalType":"uint256","name":"pairIndex","type":"uint256"},{"internalType":"uint256","name":"index","type":"uint256"},{"internalType":"uint256","name":"initialPosToken","type":"uint256"},{"internalType":"uint256","name":"positionSizeDai","type":"uint256"},{"internalType":"uint256","name":"openPrice","type":"uint256"},{"internalType":"bool","name":"buy","type":"bool"},{"internalType":"uint256","name":"leverage","type":"uint256"},{"internalType":"uint256","name":"tp","type":"uint256"},{"internalType":"uint256","name":"sl","type":"uint256"}],"indexed":false,"internalType":"structStorageInterfaceV5.Trade","name":"t","type":"tuple"},{"components":[{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"tokenPriceDai","type":"uint256"},{"internalType":"uint256","name":"openInterestDai","type":"uint256"},{"internalType":"uint256","name":"tpLastUpdated","type":"uint256"},{"internalType":"uint256","name":"slLastUpdated","type":"uint256"},{"internalType":"bool","name":"beingMarketClosed","type":"bool"}],"indexed":false,"internalType":"structStorageInterfaceV5.TradeInfo","name":"tInfo","type":"tuple"},{"indexed":true,"internalType":"address","name":"nftHolder","type":"address"},{"indexed":false,"internalType":"enumStorageInterfaceV5.LimitOrder","name":"orderType","type":"uint8"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"positionSizeDai","type":"uint256"},{"indexed":false,"internalType":"int256","name":"percentProfit","type":"int256"},{"indexed":false,"internalType":"uint256","name":"tokenPriceDai","type":"uint256"}],"name":"LimitExecuted","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"orderId","type":"uint256"},{"indexed":true,"internalType":"address","name":"trader","type":"address"},{"indexed":true,"internalType":"uint256","name":"pairIndex","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"wantedPrice","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"currentPrice","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"slippageToleranceP","type":"uint256"}],"name":"MarketCanceled","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"orderId","type":"uint256"},{"components":[{"internalType":"address","name":"trader","type":"address"},{"internalType":"uint256","name":"pairIndex","type":"uint256"},{"internalType":"uint256","name":"index","type":"uint256"},{"internalType":"uint256","name":"initialPosToken","type":"uint256"},{"internalType":"uint256","name":"positionSizeDai","type":"uint256"},{"internalType":"uint256","name":"openPrice","type":"uint256"},{"internalType":"bool","name":"buy","type":"bool"},{"internalType":"uint256","name":"leverage","type":"uint256"},{"internalType":"uint256","name":"tp","type":"uint256"},{"internalType":"uint256","name":"sl","type":"uint256"}],"indexed":false,"internalType":"structStorageInterfaceV5.Trade","name":"t","type":"tuple"},{"indexed":false,"internalType":"bool","name":"open","type":"bool"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"positionSizeDai","type":"uint256"},{"indexed":false,"internalType":"int256","name":"percentProfit","type":"int256"},{"indexed":false,"internalType":"uint256","name":"tokenPriceDai","type":"uint256"}],"name":"MarketExecuted","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"NumberUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bool","name":"paused","type":"bool"}],"name":"Pause","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"orderId","type":"uint256"},{"indexed":true,"internalType":"address","name":"trader","type":"address"},{"indexed":true,"internalType":"uint256","name":"pairIndex","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"index","type":"uint256"}],"name":"TradeUpdatedMarketClosed","type":"event"},{"inputs":[],"name":"LIQ_THRESHOLD","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"isPaused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"storageT","outputs":[{"internalType":"contractStorageInterfaceV5","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"contractStorageInterfaceV5","name":"_storageT","type":"address"}],"name":"setStorageT","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"uint256","name":"order","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint256","name":"spreadP","type":"uint256"}],"internalType":"structGFarmTestnetTradingCallbacksV5.AggregatorAnswer","name":"a","type":"tuple"}],"name":"openTradeMarketCallback","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"uint256","name":"order","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint256","name":"spreadP","type":"uint256"}],"internalType":"structGFarmTestnetTradingCallbacksV5.AggregatorAnswer","name":"a","type":"tuple"}],"name":"closeTradeMarketCallback","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"uint256","name":"order","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint256","name":"spreadP","type":"uint256"}],"internalType":"structGFarmTestnetTradingCallbacksV5.AggregatorAnswer","name":"a","type":"tuple"}],"name":"executeNftOpenOrderCallback","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"uint256","name":"order","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint256","name":"spreadP","type":"uint256"}],"internalType":"structGFarmTestnetTradingCallbacksV5.AggregatorAnswer","name":"a","type":"tuple"}],"name":"executeNftCloseOrderCallback","outputs":[],"stateMutability":"nonpayable","type":"function"}];
const AGGREGATOR_ABI = [{"inputs":[{"internalType":"contractStorageInterfaceV5","name":"_tradingStorage","type":"address"},{"internalType":"address","name":"_linkErc20","type":"address"},{"internalType":"contractLpInterfaceV5","name":"_linkErc20DaiLp","type":"address"},{"internalType":"contractLpInterfaceV5","name":"_tokenDaiLp","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":false,"internalType":"address","name":"a","type":"address"}],"name":"AddressUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"id","type":"bytes32"}],"name":"ChainlinkCancelled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"id","type":"bytes32"}],"name":"ChainlinkFulfilled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"id","type":"bytes32"}],"name":"ChainlinkRequested","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"pairIndex","type":"uint256"},{"components":[{"internalType":"address","name":"feed1","type":"address"},{"internalType":"address","name":"feed2","type":"address"},{"internalType":"enumGFarmTestnetPriceAggregatorV5.FeedCalculation","name":"feedCalculation","type":"uint8"},{"internalType":"uint256","name":"maxDeviation","type":"uint256"}],"indexed":false,"internalType":"structGFarmTestnetPriceAggregatorV5.Feed","name":"feed","type":"tuple"}],"name":"FeedUpdatedPair","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"pairIndex","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"jobIndex","type":"uint256"},{"indexed":false,"internalType":"bytes32","name":"value","type":"bytes32"}],"name":"JobUpdatedPair","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"fromPairIndex","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"toPairIndex","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"jobIndex","type":"uint256"},{"indexed":false,"internalType":"bytes32","name":"value","type":"bytes32"}],"name":"JobUpdatedPairs","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"index","type":"uint256"},{"indexed":false,"internalType":"address","name":"a","type":"address"}],"name":"NodeAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"index","type":"uint256"},{"indexed":false,"internalType":"address","name":"old","type":"address"},{"indexed":false,"internalType":"address","name":"newA","type":"address"}],"name":"NodeReplaced","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"NumberUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":false,"internalType":"uint256","name":"pairIndex","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"NumberUpdatedPair","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"from","type":"string"},{"indexed":false,"internalType":"string","name":"to","type":"string"}],"name":"PairAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bytes32","name":"request","type":"bytes32"},{"indexed":false,"internalType":"uint256","name":"order","type":"uint256"},{"indexed":false,"internalType":"address","name":"node","type":"address"},{"indexed":false,"internalType":"uint256","name":"pairIndex","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"referencePrice","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"linkFee","type":"uint256"}],"name":"PriceReceived","type":"event"},{"inputs":[],"name":"currentOrder","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"string","name":"","type":"string"},{"internalType":"string","name":"","type":"string"}],"name":"isPairListed","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"linkErc20","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"linkErc20DaiLp","outputs":[{"internalType":"contractLpInterfaceV5","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"minAnswers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"nodes","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"orderAnswers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"pairs","outputs":[{"internalType":"string","name":"from","type":"string"},{"internalType":"string","name":"to","type":"string"},{"internalType":"uint256","name":"spreadP","type":"uint256"},{"components":[{"internalType":"address","name":"feed1","type":"address"},{"internalType":"address","name":"feed2","type":"address"},{"internalType":"enumGFarmTestnetPriceAggregatorV5.FeedCalculation","name":"feedCalculation","type":"uint8"},{"internalType":"uint256","name":"maxDeviation","type":"uint256"}],"internalType":"structGFarmTestnetPriceAggregatorV5.Feed","name":"feed","type":"tuple"},{"internalType":"uint256","name":"minLeverage","type":"uint256"},{"internalType":"uint256","name":"maxLeverage","type":"uint256"},{"internalType":"uint256","name":"minOpenLimitSlippageP","type":"uint256"},{"internalType":"uint256","name":"openFeeP","type":"uint256"},{"internalType":"uint256","name":"closeFeeP","type":"uint256"},{"internalType":"uint256","name":"oracleFeeP","type":"uint256"},{"internalType":"uint256","name":"nftLimitOrderFeeP","type":"uint256"},{"internalType":"uint256","name":"referralP","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"pairsCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"requests","outputs":[{"internalType":"uint256","name":"orderId","type":"uint256"},{"internalType":"enumGFarmTestnetPriceAggregatorV5.OrderType","name":"orderType","type":"uint8"},{"internalType":"uint256","name":"pairIndex","type":"uint256"},{"internalType":"bool","name":"initiated","type":"bool"},{"internalType":"uint256","name":"linkFee","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"tokenDaiLp","outputs":[{"internalType":"contractLpInterfaceV5","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"tradingStorage","outputs":[{"internalType":"contractStorageInterfaceV5","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"contractStorageInterfaceV5","name":"_tradingStorage","type":"address"}],"name":"setTradingStorage","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contractLpInterfaceV5","name":"_lp","type":"address"}],"name":"updateTokenDaiLp","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_a","type":"address"}],"name":"addNode","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_index","type":"uint256"},{"internalType":"address","name":"_a","type":"address"}],"name":"replaceNode","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_minAnswers","type":"uint256"}],"name":"setMinAnswers","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"string","name":"from","type":"string"},{"internalType":"string","name":"to","type":"string"},{"internalType":"bytes32[20]","name":"jobs","type":"bytes32[20]"},{"internalType":"uint256","name":"spreadP","type":"uint256"},{"components":[{"internalType":"address","name":"feed1","type":"address"},{"internalType":"address","name":"feed2","type":"address"},{"internalType":"enumGFarmTestnetPriceAggregatorV5.FeedCalculation","name":"feedCalculation","type":"uint8"},{"internalType":"uint256","name":"maxDeviation","type":"uint256"}],"internalType":"structGFarmTestnetPriceAggregatorV5.Feed","name":"feed","type":"tuple"},{"internalType":"uint256","name":"minLeverage","type":"uint256"},{"internalType":"uint256","name":"maxLeverage","type":"uint256"},{"internalType":"uint256","name":"minOpenLimitSlippageP","type":"uint256"},{"internalType":"uint256","name":"openFeeP","type":"uint256"},{"internalType":"uint256","name":"closeFeeP","type":"uint256"},{"internalType":"uint256","name":"oracleFeeP","type":"uint256"},{"internalType":"uint256","name":"nftLimitOrderFeeP","type":"uint256"},{"internalType":"uint256","name":"referralP","type":"uint256"}],"internalType":"structGFarmTestnetPriceAggregatorV5.Pair","name":"_pair","type":"tuple"}],"name":"addPair","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"},{"internalType":"uint256","name":"_spreadP","type":"uint256"}],"name":"updateSpread","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"},{"internalType":"uint256","name":"_jobIndex","type":"uint256"},{"internalType":"bytes32","name":"_newJob","type":"bytes32"}],"name":"updateJob","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_fromPairIndex","type":"uint256"},{"internalType":"uint256","name":"_toPairIndex","type":"uint256"},{"internalType":"uint256","name":"_jobIndex","type":"uint256"},{"internalType":"bytes32","name":"_newJob","type":"bytes32"}],"name":"updateJobs","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"},{"components":[{"internalType":"address","name":"feed1","type":"address"},{"internalType":"address","name":"feed2","type":"address"},{"internalType":"enumGFarmTestnetPriceAggregatorV5.FeedCalculation","name":"feedCalculation","type":"uint8"},{"internalType":"uint256","name":"maxDeviation","type":"uint256"}],"internalType":"structGFarmTestnetPriceAggregatorV5.Feed","name":"_feed","type":"tuple"}],"name":"updateFeed","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"},{"internalType":"uint256","name":"_min","type":"uint256"},{"internalType":"uint256","name":"_max","type":"uint256"}],"name":"updateMinMaxLeverage","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"},{"internalType":"uint256","name":"_min","type":"uint256"}],"name":"updateMinOpenLimitSlippageP","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"},{"internalType":"uint256","name":"_openFeeP","type":"uint256"}],"name":"updateOpenFeeP","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"},{"internalType":"uint256","name":"_closeFeeP","type":"uint256"}],"name":"updateCloseFeeP","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"},{"internalType":"uint256","name":"_fee","type":"uint256"}],"name":"updateOracleFeeP","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"},{"internalType":"uint256","name":"_fee","type":"uint256"}],"name":"updateReferralP","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"},{"internalType":"uint256","name":"_fee","type":"uint256"}],"name":"updateNftLimitOrderFeeP","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"},{"internalType":"enumGFarmTestnetPriceAggregatorV5.OrderType","name":"_orderType","type":"uint8"},{"internalType":"uint256","name":"_leveragedPosDai","type":"uint256"}],"name":"getPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_requestId","type":"bytes32"},{"internalType":"uint256","name":"_price","type":"uint256"}],"name":"fulfill","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"claimBackLink","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"},{"internalType":"uint256","name":"_leveragedPosDai","type":"uint256"}],"name":"linkFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"linkPriceDai","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"tokenDaiReservesLp","outputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"tokenPriceDai","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"oracleNodesCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"}],"name":"pairJobs","outputs":[{"internalType":"bytes32[20]","name":"","type":"bytes32[20]"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"}],"name":"pairFeed","outputs":[{"components":[{"internalType":"address","name":"feed1","type":"address"},{"internalType":"address","name":"feed2","type":"address"},{"internalType":"enumGFarmTestnetPriceAggregatorV5.FeedCalculation","name":"feedCalculation","type":"uint8"},{"internalType":"uint256","name":"maxDeviation","type":"uint256"}],"internalType":"structGFarmTestnetPriceAggregatorV5.Feed","name":"","type":"tuple"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"}],"name":"openFeeP","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"}],"name":"closeFeeP","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"}],"name":"oracleFeeP","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"}],"name":"referralP","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"}],"name":"nftLimitOrderFeeP","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"}],"name":"pairMinLeverage","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"}],"name":"pairMaxLeverage","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"}],"name":"pairMinOpenLimitSlippageP","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true}];
const NFT_ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"baseURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenOfOwnerByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"}];
const LINK_ABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"},{"name":"_data","type":"bytes"}],"name":"transferAndCall","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_subtractedValue","type":"uint256"}],"name":"decreaseApproval","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_addedValue","type":"uint256"}],"name":"increaseApproval","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"},{"indexed":false,"name":"data","type":"bytes"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"}];
const VAULT_ABI = [{"inputs":[{"internalType":"contractStorageInterfaceV5","name":"_storageT","type":"address"},{"internalType":"uint256","name":"_waitBlocksBase","type":"uint256"},{"internalType":"uint256","name":"_refillLiqP","type":"uint256"},{"internalType":"uint256","name":"_power","type":"uint256"},{"internalType":"uint256","name":"_swapFeeP","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":false,"internalType":"address","name":"a","type":"address"}],"name":"AddressUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"trader","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newCurrentBalanceDai","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"maxBalanceDai","type":"uint256"}],"name":"DaiClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"caller","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newCurrentBalanceDai","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newMaxBalanceDai","type":"uint256"}],"name":"DaiDeposited","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"caller","type":"address"},{"indexed":false,"internalType":"uint256","name":"daiAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newCurrentBalanceDai","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"maxBalanceDai","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"tokensMinted","type":"uint256"}],"name":"DaiRefilled","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"caller","type":"address"},{"indexed":false,"internalType":"address","name":"trader","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newCurrentBalanceDai","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"maxBalanceDai","type":"uint256"}],"name":"DaiSent","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"caller","type":"address"},{"indexed":false,"internalType":"address","name":"trader","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"currentBalanceDai","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"maxBalanceDai","type":"uint256"}],"name":"DaiToClaim","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"caller","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newCurrentBalanceDai","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newMaxBalanceDai","type":"uint256"}],"name":"DaiWithdrawn","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"NumberUpdated","type":"event"},{"inputs":[],"name":"PRECISION","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"currentBalanceDai","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"daiToClaim","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"lastRefill","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"maxBalanceDai","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"power","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"refillLiqP","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"storageT","outputs":[{"internalType":"contractStorageInterfaceV5","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"swapFeeP","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"waitBlocksBase","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"contractStorageInterfaceV5","name":"_storageT","type":"address"}],"name":"setStorageT","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_waitBlocksBase","type":"uint256"}],"name":"setWaitBlocksBase","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_refillLiqP","type":"uint256"}],"name":"setRefillLiqP","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_power","type":"uint256"}],"name":"setPower","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_swapFeeP","type":"uint256"}],"name":"setSwapFeeP","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"depositDai","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"withdrawDai","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_trader","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"sendDaiToTrader","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"claimDai","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"refill","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"canRefill","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"_currentBalanceDai","type":"uint256"},{"internalType":"uint256","name":"_maxBalanceDai","type":"uint256"}],"name":"blocksToWait","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"_trader","type":"address"}],"name":"backend","outputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"components":[{"internalType":"uint256","name":"leverageUnlocked","type":"uint256"},{"internalType":"address","name":"referral","type":"address"},{"internalType":"uint256","name":"referralRewardsTotal","type":"uint256"}],"internalType":"structStorageInterfaceV5.Trader","name":"","type":"tuple"},{"internalType":"uint256[]","name":"","type":"uint256[]"},{"components":[{"components":[{"internalType":"address","name":"trader","type":"address"},{"internalType":"uint256","name":"pairIndex","type":"uint256"},{"internalType":"uint256","name":"index","type":"uint256"},{"internalType":"uint256","name":"initialPosToken","type":"uint256"},{"internalType":"uint256","name":"positionSizeDai","type":"uint256"},{"internalType":"uint256","name":"openPrice","type":"uint256"},{"internalType":"bool","name":"buy","type":"bool"},{"internalType":"uint256","name":"leverage","type":"uint256"},{"internalType":"uint256","name":"tp","type":"uint256"},{"internalType":"uint256","name":"sl","type":"uint256"}],"internalType":"structStorageInterfaceV5.Trade","name":"trade","type":"tuple"},{"internalType":"uint256","name":"block","type":"uint256"},{"internalType":"uint256","name":"wantedPrice","type":"uint256"},{"internalType":"uint256","name":"slippageP","type":"uint256"},{"internalType":"uint256","name":"spreadReductionP","type":"uint256"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"internalType":"structStorageInterfaceV5.PendingMarketOrder[]","name":"","type":"tuple[]"},{"internalType":"uint256[][5]","name":"","type":"uint256[][5]"}],"stateMutability":"view","type":"function","constant":true}];
const DAI_ABI = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"userAddress","type":"address"},{"indexed":false,"internalType":"address payable","name":"relayerAddress","type":"address"},{"indexed":false,"internalType":"bytes","name":"functionSignature","type":"bytes"}],"name":"MetaTransactionExecuted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"previousAdminRole","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"newAdminRole","type":"bytes32"}],"name":"RoleAdminChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleGranted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleRevoked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"CHILD_CHAIN_ID","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"CHILD_CHAIN_ID_BYTES","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DEFAULT_ADMIN_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DEPOSITOR_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"ERC712_VERSION","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PERMIT_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"ROOT_CHAIN_ID","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"ROOT_CHAIN_ID_BYTES","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"name_","type":"string"}],"name":"changeName","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"bytes","name":"depositData","type":"bytes"}],"name":"deposit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"userAddress","type":"address"},{"internalType":"bytes","name":"functionSignature","type":"bytes"},{"internalType":"bytes32","name":"sigR","type":"bytes32"},{"internalType":"bytes32","name":"sigS","type":"bytes32"},{"internalType":"uint8","name":"sigV","type":"uint8"}],"name":"executeMetaTransaction","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"getChainId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"getDomainSeperator","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getNonce","outputs":[{"internalType":"uint256","name":"nonce","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"}],"name":"getRoleAdmin","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"getRoleMember","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"}],"name":"getRoleMemberCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"grantRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"hasRole","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"name_","type":"string"},{"internalType":"string","name":"symbol_","type":"string"},{"internalType":"uint8","name":"decimals_","type":"uint8"},{"internalType":"address","name":"childChainManager","type":"address"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"src","type":"address"},{"internalType":"address","name":"dst","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"move","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"holder","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"expiry","type":"uint256"},{"internalType":"bool","name":"allowed","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"usr","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"pull","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"usr","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"push","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"renounceRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"revokeRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}]


let selectedProvider = null, eventSubTrading = null, eventSubCallbacks = null, nonce = null,
	providers = [], web3 = [], openTrades = [], pairs = [], openInterests = [], nfts = [], nftsBeingUsed = [],
	storageContract, tradingContract, tradingAddress, aggregatorContract, callbacksContract, vaultContract, tradingContract2,
	nftTimelock, maxTradesPerPair, daiContract, allowedDai, 
	nftContract1, nftContract2, nftContract3, nftContract4, nftContract5, linkContract;

let onChainGasPrice, offChainGasPrice;

function targetUserPair(pair) {
	this.pair = pair,
	this.strategyOpen = false, 
	this.strategyDirection = "long"}

var chosenUser = process.env.USER_TO_CLONE 

let daiBalance = 0;
let lockedDaiBalance;
let nftSetup = false;
let wssConnected = false;
let daiContractSetup = false;
let stateChangeOnSetup = false;


// Active Positions Array
activePositions = [];
targetActivePositions = [];

function pairStrat(pair) {
	this.pair = pair,
	this.strategyOpen = false, 
	this.strategyDirection = "long",
	this.orderId = 0,
	this.targetUserIndex = 4,
	this.leverage = 0,
	this.openPrice = 0
}
  
  for(var i = 0; i < pairList.length; i++){

	activePositions.push([]);
	targetActivePositions.push([]);
	
	for (var j = 0; j < 3; j++) {

	activePositions[i].push(new pairStrat(pairList[i]));
	targetActivePositions[i].push(new pairStrat(pairList[i]));

	}
  }

let hbCountdown = 600;
let serverDowntime = false;
let hbPrintControl = 0;
let firstRun = 0;

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
  }

// -----------------------------------------
// GAS PRICE CHECKER
// -----------------------------------------

const gasRPC = process.env.HTTPS_URL_FOR_GASPRICE
const onChainOracle = new GasPriceOracle({ gasRPC })

const offChainOracle = new GasPriceOracle({
	chainId: 137,
	defaultRpc: process.env.HTTPS_URL_FOR_GASPRICE,
	timeout: 10000,
	defaultFallbackGasPrices: {
	  instant: 100,
	  fast: 80,
	  standard: 30,
	  low: 15
	}})

function gasPriceCheck () {	
onChainOracle.fetchGasPricesOnChain().then(gasPrice => {
	onChainGasPrice = gasPrice
  });
  offChainOracle.fetchGasPricesOffChain().then(gasPrices => {
	  offChainGasPrice = gasPrices;
  });
}

// --------------------------------------------
// 3. INIT: CHECK ENV VARS 
// --------------------------------------------
console.log("----------------------------------------------------------------------------------")
console.log("|初心                           shoshin - gtCLONE                            初心|");
console.log("|                         Position cloner for gains.trade                        |")
console.log("|--------------------------------------------------------------------------------|")
console.log("|               Please leave dev_fee as 1% or greater. Consider 2%.              |")
console.log("|--------------------------------------------------------------------------------|")
console.log("|                           BETA: PLEASE WATCH THE BOT.                          |")
console.log("|       All trades on all pairs by the account you are watching will clone.      |")
console.log("|               So be wary of whose trades you choose to clone.                  |")
console.log("|初心                                                                        初心|")
console.log("----------------------------------------------------------------------------------")

if(!process.env.WSS_URLS || !process.env.PRICES_URL || !process.env.STORAGE_ADDRESS
|| !process.env.PUBLIC_KEY || !process.env.EVENT_CONFIRMATIONS_SEC 
|| !process.env.TRIGGER_TIMEOUT || !process.env.GAS_PRICE_GWEI || !process.env.CHECK_REFILL_SEC
|| !process.env.VAULT_REFILL_ENABLED || !process.env.TAKE_PROFIT_P || !process.env.STOP_LOSS_P || !process.env.DEV_FEE_P || !process.env.CAPITAL_PER_POSITION_P || !process.env.CAPITAL_PER_POSITION_P || !process.env.LEVERAGE_AMOUNT || !process.env.DAI_ADDRESS){
	console.log("Please fill all parameters in the .env file.");
	process.exit();
}

// -----------------------------------------
// 4. WEB3 PROVIDER & CHECK DAI ALLOWANCE
// -----------------------------------------


async function checkDAIAllowance(){
	if (!daiContractSetup) {return}
	web3[selectedProvider].eth.net.isListening().then(async () => {
		const allowance = await daiContract.methods.allowance(process.env.PUBLIC_KEY, process.env.STORAGE_ADDRESS).call();
		if(parseFloat(allowance) > 0){
			allowedDai = true;
			console.log("DAI allowance OK.");
		}else{
			console.log("DAI not allowed, approving now.");
			const tx = {
				from: process.env.PUBLIC_KEY,
			    to : daiContract.options.address,
			    data : daiContract.methods.approve(process.env.STORAGE_ADDRESS, "115792089237316195423570985008687907853269984665640564039457584007913129639935").encodeABI(),
			    gasPrice: web3[selectedProvider].utils.toHex(process.env.GAS_PRICE_GWEI*1e9),
			    gas: web3[selectedProvider].utils.toHex("100000")
			};

			web3[selectedProvider].eth.accounts.signTransaction(tx, process.env.PRIVATE_KEY).then(signed => {
			    web3[selectedProvider].eth.sendSignedTransaction(signed.rawTransaction)
			    .on('receipt', () => {
					console.log("DAI successfully approved.");
					allowedDai = true;
			    }).on('error', (e) => {
			    	console.log("DAI approve tx fail (" + e + ")");
					setTimeout(() => { checkDAIAllowance(); }, 2*1000);
			    });
			}).catch(e => {
				console.log("DAI approve tx fail (" + e + ")");
				setTimeout(() => { checkDAIAllowance(); }, 2*1000);
			});
		}
	}).catch(() => {
		setTimeout(() => { checkDAIAllowance(); }, 5*1000);
	});
}

const WSS_URLS = process.env.WSS_URLS.split(",");



async function selectProvider(n){
	selectedProvider = n;
	storageContract = new web3[n].eth.Contract(STORAGE_ABI, process.env.STORAGE_ADDRESS);

	
	const callbacksAddress = await storageContract.methods.callbacks().call();
	tradingAddress = await storageContract.methods.trading().call();
	const aggregatorAddress = await storageContract.methods.priceAggregator().call();
	const vaultAddress = await storageContract.methods.vault().call();
	const nftAddress1 = await storageContract.methods.nfts(0).call();
	const nftAddress2 = await storageContract.methods.nfts(1).call();
	const nftAddress3 = await storageContract.methods.nfts(2).call();
	const nftAddress4 = await storageContract.methods.nfts(3).call();
	const nftAddress5 = await storageContract.methods.nfts(4).call();
	const linkAddress = await storageContract.methods.linkErc677().call();
	tradingContract2 = new web3[n].eth.Contract(
		TRADING_ABI, tradingAddress,
		(error, result) => { if (error) console.log(error) }
	  )


	callbacksContract = new web3[n].eth.Contract(CALLBACKS_ABI, callbacksAddress);
	tradingContract = new web3[n].eth.Contract(TRADING_ABI, tradingAddress);
	aggregatorContract = new web3[n].eth.Contract(AGGREGATOR_ABI, aggregatorAddress);
	vaultContract = new web3[n].eth.Contract(VAULT_ABI, vaultAddress);
	daiContract = new web3[n].eth.Contract(DAI_ABI, process.env.DAI_ADDRESS)

	daiContractSetup = true;

	nftContract1 = new web3[n].eth.Contract(NFT_ABI, nftAddress1);
	nftContract2 = new web3[n].eth.Contract(NFT_ABI, nftAddress2);
	nftContract3 = new web3[n].eth.Contract(NFT_ABI, nftAddress3);
	nftContract4 = new web3[n].eth.Contract(NFT_ABI, nftAddress4);
	nftContract5 = new web3[n].eth.Contract(NFT_ABI, nftAddress5);

	linkContract = new web3[n].eth.Contract(LINK_ABI, linkAddress);

	if(eventSubTrading !== null && eventSubTrading.id !== null){ eventSubTrading.unsubscribe(); }
	if(eventSubCallbacks !== null && eventSubCallbacks.id !== null){ eventSubCallbacks.unsubscribe(); }
	eventSubTrading = null;
	eventSubCallbacks = null;

	await gasPriceCheck();
	await checkDAIAllowance();
	await fetchOpenTrades();
	await fetchNFTs();
	await updateBalance();

	await watchLiveTradingEvents();

	await sleep(10000)
	

		if (firstRun === 0) {
			
			firstRun++
			console.log("")
			console.log("[X] DAI Check. [X] NFT Set up. [X] Watching trading contract. [X] Local position list update.")
			console.log("Current fast gas price gwei : " + offChainGasPrice.fast + " GWEI.")
			console.log("----------------------------------------------------------------------------------")
			console.log("|初心                             SET UP COMPLETE                            初心|");
			console.log("----------------------------------------------------------------------------------")
			console.log(" ")
			console.log("Awaiting trades to clone...")
			console.log("So please be patient, and no trading mechanism is perfect. Be responsible.")
		}
}

let beginSetup = 0;

const getProvider = (wssId) => {
	const provider = new Web3.providers.WebsocketProvider(WSS_URLS[wssId], {headers:{authgf: 'gf928x0209300'},clientConfig:{keepalive:true,keepaliveInterval:30*1000}});

	if (beginSetup === 0) {
		beginSetup++
		console.log("Await [ ] DAI Check. [ ] NFT Set up. [ ] Watching trading contract. [ ] Local position list update.")
		console.log("These should take <90 sec. Restart if not occurring in that time.")
	}


	provider.on('close', () => {
		setTimeout(() => {
			if(!provider.connected){
				console.log(WSS_URLS[wssId]+' closed: trying to reconnect...');

				let connectedProvider = -1;
				for(var i = 0; i < WSS_URLS.length; i++){
					if(providers[i].connected){
						connectedProvider = i;
						break;
					}
				}
				if(connectedProvider > -1 && selectedProvider === wssId){
					selectProvider(connectedProvider);
					console.log("Switched to WSS " + WSS_URLS[selectedProvider]);
				}else if(connectedProvider === -1 && selectedProvider === wssId){
					console.log("No WSS to switch to...");
					wssConnected = false;
					
				}

				providers[wssId] = getProvider(wssId);
				web3[wssId] = new Web3(providers[wssId]);
			}
		}, 5*1000);
	});

	provider.on('connect', () => {
		setTimeout(() => {
			if(provider.connected){
				console.log('Connected to WSS '+WSS_URLS[wssId]+'.');
				let connectedProvider = -1;
				for(var i = 0; i < WSS_URLS.length; i++){
					if(providers[i].connected && i !== wssId){
						connectedProvider = i;
						break;
					}
				}
				if(connectedProvider === -1 || selectedProvider === null){
					selectProvider(wssId);
					console.log("Switched to WSS " + WSS_URLS[selectedProvider]);
					wssConnected = true;
					checkDAIAllowance();
				}else{
					console.log("No need to switch WSS, already connected to " + WSS_URLS[selectedProvider]);
					wssConnected = true;
				}
			}
		}, 5*1000);
	});
	provider.on('error', (error) => (console.log("WSS "+WSS_URLS[wssId]+" error", error)));
	return provider;
};

for(var i = 0; i < WSS_URLS.length; i++){
	const provider = getProvider(i);
	providers.push(provider);
	web3.push(new Web3(provider));
}

setInterval(async () => {
	let promises = [];
	for(let i = 0; i < WSS_URLS.length; i++){
		(function(index) {
			web3[index].eth.net.isListening().then(async () => {
				promises.push({index: index, promise:web3[index].eth.getBlockNumber()});
				if(promises.length === WSS_URLS.length){ compareBlocks(promises); }
			}).catch(() => {
				promises.push({index: index, promise: null});
				if(promises.length === WSS_URLS.length){ compareBlocks(promises); }
			});
		})(i);
	}
}, 20*1000);

function compareBlocks(promises){
	let orderedPromises = [];
	for(let i = 0; i < promises.length; i++){
		orderedPromises[promises[i].index] = promises[i].promise;
	}
	Promise.all(orderedPromises).then((b) => {
		for(var i = 0; i < WSS_URLS.length; i++){
			if(b[i] > b[selectedProvider] + 4){
				console.log("Switched to WSS " + WSS_URLS[i] + " (block #" + b[i] + " vs #" + b[selectedProvider]);
				selectProvider(i);
				break;
			}
		}
	});
}

setInterval(() => {
	console.log("Current WSS: " + WSS_URLS[selectedProvider]);
}, 120*1000);

// -----------------------------------------
// 5. FETCH PAIRS, NFTS, AND NFT TIMELOCK
// -----------------------------------------

async function fetchNFTs(){
	web3[selectedProvider].eth.net.isListening().then(async () => {
		nfts = [];

		const nftsCount1 = await nftContract1.methods.balanceOf(process.env.PUBLIC_KEY).call();
		const nftsCount2 = await nftContract2.methods.balanceOf(process.env.PUBLIC_KEY).call();
		const nftsCount3 = await nftContract3.methods.balanceOf(process.env.PUBLIC_KEY).call();
		const nftsCount4 = await nftContract4.methods.balanceOf(process.env.PUBLIC_KEY).call();
		const nftsCount5 = await nftContract5.methods.balanceOf(process.env.PUBLIC_KEY).call();

		for(var i = 0; i < nftsCount1; i++){
			const id = await nftContract1.methods.tokenOfOwnerByIndex(process.env.PUBLIC_KEY, i).call();
			nfts.push({id: id, type: 1});
		}
		for(var i = 0; i < nftsCount2; i++){
			const id = await nftContract2.methods.tokenOfOwnerByIndex(process.env.PUBLIC_KEY, i).call();
			nfts.push({id: id, type: 2});
		}
		for(var i = 0; i < nftsCount3; i++){
			const id = await nftContract3.methods.tokenOfOwnerByIndex(process.env.PUBLIC_KEY, i).call();
			nfts.push({id: id, type: 3});
		}
		for(var i = 0; i < nftsCount4; i++){
			const id = await nftContract4.methods.tokenOfOwnerByIndex(process.env.PUBLIC_KEY, i).call();
			nfts.push({id: id, type: 4});
		}
		for(var i = 0; i < nftsCount5; i++){
			const id = await nftContract5.methods.tokenOfOwnerByIndex(process.env.PUBLIC_KEY, i).call();
			nfts.push({id: id, type: 5});
		}

		if (nfts.length > 0 && firstRun === 0 ) {
		console.log("")
		console.log("NFT FOR USE IN SPREAD REDUCTION - ID: " + nfts[nfts.length-1].id + ". TYPE: " + nfts[nfts.length-1].type)
		} else {
			console.log("");
			console.log("Having an NFT on the account will give spread reduction.")}

		;

		nftSetup = true;
	}).catch(() => {
		setTimeout(() => { console.log("CATCH NFT") }, 2*1000);
	});
}

// ---------------------------------------------
// 4. FETCH CURRENT PRICES & CHECK USER DAI BALANCE
//  ---------------------------------------------

function wssPriceFeed(){
	let socket = new WebSocket(process.env.PRICES_URL);
	socket.onclose = () => { setTimeout(() => { wssPriceFeed() }, 2000); };
	socket.onerror = () => { socket.close(); };
	socket.onmessage = async (msg) => {
		const p = JSON.parse(msg.data);
		if(p.closes === undefined) return;
		
		prices = p.closes;

	}

}
wssPriceFeed();

async function updateBalance() {
	if (wssConnected === false) { 
		console.log("WSS Not connected");
	return
}
	if (daiContractSetup === false) {
		console.log("Dai contract not set up")
		
		return}

    _daiBalance = await daiContract.methods.balanceOf(process.env.PUBLIC_KEY).call();
	console.log("")
    console.log("DAI token balance: " + web3[selectedProvider].utils.fromWei(_daiBalance, "ether" ));
    daiBalance = parseInt(_daiBalance);
    positionSize = parseInt((_daiBalance-(1*1e18))*(process.env.CAPITAL_PER_POSITION_P/100)) // Take 0.1 dai off _daiBalance to avoid rounding errors and take the position size percentage.
	if (process.env.CLONE_POSITION_SIZE === true) { 
		console.log("The position size will be based on the target users position size.")
		console.log("You require the maximum tradable value in your account to successfully open a trade")
	} else  { 
		
		
	if (positionSize < web3[selectedProvider].utils.toWei("35", "ether") || positionSize > web3[selectedProvider].utils.toWei("4000", "ether")) {
        
		console.log("Position size is not in range 35 DAI to 4000 DAI");
	return};
	

    console.log("The position size will be:" + web3[selectedProvider].utils.fromWei(positionSize.toString(), "ether" ));
	console.log(("1 DAI is removed from percentage calculation to avoid any rounding issues."))

	}
}

	
// -----------------------------------------
// 7. LOAD OPEN TRADES
// -----------------------------------------

async function fetchOpenTrades(){
	web3[selectedProvider].eth.net.isListening().then(async () => {

		if(pairs.length === 0){
			setTimeout(() => { fetchOpenTrades(); }, 2*1000);
			return;
		}

		openTrades = [];

		let openLimitOrdersPromises = [];
		const openLimitOrders = await storageContract.methods.getOpenLimitOrders().call();
		for(var i = 0; i < openLimitOrders.length; i++){
			openLimitOrdersPromises.push(storageContract.methods.openLimitOrders(i).call());
		}

		let promisesPairTradersArray = [];
		for(var i = 0; i < pairs.length; i++){
			promisesPairTradersArray.push(storageContract.methods.pairTradersArray(i).call());
		}

		Promise.all(openLimitOrdersPromises).then(async (l) => {
			for(var j = 0; j < l.length; j++){
				openTrades.push(l[j]);
			}

			Promise.all(promisesPairTradersArray).then(async (r) => {
				let promisesTrade = [];

				for(var j = 0; j < r.length; j ++){
					for(var a = 0; a < r[j].length; a++){
						for(var b = 0; b < maxTradesPerPair; b++){
							promisesTrade.push(storageContract.methods.openTrades(r[j][a], j, b).call());
						}
					}
				}

				Promise.all(promisesTrade).then((trades) => {
					for(var j = 0; j < trades.length; j++){
						if(trades[j].leverage.toString() === "0"){ continue; }
						openTrades.push(trades[j]);
					}

					console.log("Fetched open trades: " + openTrades.length);
				});
			});
		});
	}).catch(() => {
		setTimeout(() => { fetchOpenTrades(); }, 2*1000);
	});
}
// -----------------------------------------
// 8. WATCH TRADING EVENTS
// -----------------------------------------

function watchLiveTradingEvents(){
	web3[selectedProvider].eth.net.isListening().then(async () => {
		if(eventSubTrading === null){
			eventSubTrading = tradingContract.events.allEvents({ fromBlock: 'latest' }).on('data', function (event){
				const eventName = event.event.toString();

				if(eventName !== "OpenLimitPlaced" && eventName !== "OpenLimitUpdated"
				&& eventName !== "OpenLimitCanceled" && eventName !== "TpUpdated"
				&& eventName !== "SlUpdated"){
					return;
				}

				event.triedTimes = 1;

				setTimeout(() => {
					refreshOpenTrades(event);
				}, process.env.LIVE_EVENT_CONFIRMATIONS_SEC*1000);
			});
		}

		if(eventSubCallbacks === null){
			eventSubCallbacks = callbacksContract.events.allEvents({ fromBlock: 'latest' }).on('data', function (event){
				const eventName = event.event.toString();

				if(eventName !== "MarketExecuted" && eventName !== "LimitExecuted"
				&& eventName !== "TradeUpdatedMarketClosed"){
					return;
				}

				event.triedTimes = 1;

				setTimeout(() => {
					refreshOpenTrades(event);
				}, process.env.LIVE_EVENT_CONFIRMATIONS_SEC*1000);
			});
		}
	}).catch(() => {
		setTimeout(() => { watchLiveTradingEvents(); }, 2*1000);
	});
}

// -----------------------------------------
// 9. REFRESH INTERNAL OPEN TRADES LIST
// -----------------------------------------

async function refreshOpenTrades(event){
	web3[selectedProvider].eth.net.isListening().then(async () => {
		const eventName = event.event.toString();
		const v = event.returnValues;
		let failed = false;

		// UNREGISTER OPEN LIMIT ORDER
		// => IF OPEN LIMIT CANCELED OR OPEN LIMIT EXECUTED
		if(eventName === "OpenLimitCanceled" 
		|| (eventName === "LimitExecuted" && v.orderType.toString() === "3")){

			const trader = eventName === "OpenLimitCanceled" ? v.trader : v.t[0];
			const pairIndex = eventName === "OpenLimitCanceled" ? v.pairIndex : v.t[1];
			const index = eventName === "OpenLimitCanceled" ? v.index : v.limitIndex;

			const hasLimitOrder = await storageContract.methods.hasOpenLimitOrder(trader, pairIndex, index).call();

			if(hasLimitOrder.toString() === "false"){

				for(var i = 0; i < openTrades.length; i++){

					if(openTrades[i].trader === trader 
					&& openTrades[i].pairIndex === pairIndex
					&& openTrades[i].index === index
					&& openTrades[i].hasOwnProperty('minPrice')){

						openTrades[i] = openTrades[openTrades.length-1];
						openTrades.pop();

						console.log("Watch events ("+eventName+"): Removed limit");
						break;
					}
				}
			}else{
				failed = true;
			}
		}

		// STORE/UPDATE OPEN LIMIT ORDER
		// => IF OPEN LIMIT ORDER PLACED OR OPEN LIMIT ORDER UPDATED
		if(eventName === "OpenLimitPlaced" 
		|| eventName === "OpenLimitUpdated"){

			const hasLimitOrder = await storageContract.methods.hasOpenLimitOrder(v.trader, v.pairIndex, v.index).call();

			if(hasLimitOrder.toString() === "true"){

				const id = await storageContract.methods.openLimitOrderIds(v.trader, v.pairIndex, v.index).call();
				const limit = await storageContract.methods.openLimitOrders(id).call();
				let found = false;

				for(var i = 0; i < openTrades.length; i++){

					if(openTrades[i].trader === v.trader 
					&& openTrades[i].pairIndex === v.pairIndex
					&& openTrades[i].index === v.index
					&& openTrades[i].hasOwnProperty('minPrice')){

						openTrades[i] = limit;
						found = true;

						console.log("Watch events ("+eventName+"): Updated limit");
						break;
					}
				}

				if(!found){ 
					openTrades.push(limit); 
					console.log("Watch events ("+eventName+"): Stored limit");
				}
			}else{
				failed = true;
			}
		}

		// STORE/UPDATE TRADE
		// => IF MARKET OPEN EXECUTED OR OPEN TRADE LIMIT EXECUTED OR TP/SL UPDATED OR TRADE UPDATED (MARKET CLOSED)
		if((eventName === "MarketExecuted" && v.open.toString() === "true") 
		|| (eventName === "LimitExecuted" && v.orderType.toString() === "3")
		|| eventName === "TpUpdated" || eventName === "SlUpdated"
		|| eventName === "TradeUpdatedMarketClosed"){

			const trader = eventName !== "MarketExecuted" && eventName !== "LimitExecuted" ? v.trader : v.t[0];
			const pairIndex = eventName !== "MarketExecuted" && eventName !== "LimitExecuted" ? v.pairIndex : v.t[1];
			const index = eventName !== "MarketExecuted" && eventName !== "LimitExecuted" ? v.index : v.t[2];

			const trade = await storageContract.methods.openTrades(trader, pairIndex, index).call();

			console.log("MARKET/LIMIT EXECUTED " + trader)
			
			if(parseFloat(trade.leverage) > 0){
				let found = false;


				for(var i = 0; i < openTrades.length; i++){

					console.log(" found, opentrades length ")

					if(openTrades[i] !== undefined
					&& openTrades[i].trader === trader 
					&& openTrades[i].pairIndex === pairIndex
					&& openTrades[i].index === index 
					&& openTrades[i].hasOwnProperty('openPrice')){

						openTrades[i] = trade;
						found = true;

						console.log("Watch events ("+eventName+"): Updated trade");

						if (trader === process.env.USER_TO_CLONE && firstRun > 0) {

						let strategyDirection;

						if (openTrades[i].buy === true) { strategyDirection = 'long'} else { strategyDirection = 'short'}

						let pairName = pairList[pairIndex]

							let preparedInitiationOfOpen = {

								pair: pairName,
								strategyDirection: strategyDirection,
								leverage: openTrades[i].leverage,
								openPrice: openTrades[i].openPrice,
								openTrade: true,
								strategyOpen: true,
								targetUserIndex: openTrades[i].index
					
							}

						activePositions[__pairIndex].splice(index, 1, { pair: pairList[pairIndex], strategyOpen: true, strategyDirection: strategyDirection, leverage:openTrades[i].leverage, openPrice: openTrades[i].openPrice });
				
						transactionInitiation(preparedInitiationOfOpen)

						}

						break;
					}
				}

				if(!found){ 

					console.log("Not found")

					openTrades.push(trade); 

					if (trader === process.env.USER_TO_CLONE && firstRun > 0) {

						let strategyDirection;

						console.log(openTrades[openTrades.length-1])

						if (openTrades[openTrades.length-1].buy === true) { strategyDirection = 'long'} else { strategyDirection = 'short'}

						let pairName = pairList[pairIndex]

							let preparedInitiationOfOpen = {

								pair: pairName,
								strategyDirection: strategyDirection,
								leverage: openTrades[openTrades.length-1].leverage,
								openPrice: openTrades[openTrades.length-1].openPrice,
								openTrade: true,
								strategyOpen: true,
								targetUserIndex: openTrades[i].index
					
							}

						activePositions[pairList.indexOf(pairName)].splice(index, 1, { pair: pairList[pairIndex], strategyOpen: true, strategyDirection: strategyDirection, leverage:openTrades[i].leverage, openPrice: openTrades[i].openPrice });	
				
						transactionInitiation(preparedInitiationOfOpen)

					}

					console.log("Watch events ("+eventName+"): Stored trade");
				}
			}else{
				failed = true;
			}
		}

		// UNREGISTER TRADE
		// => IF MARKET CLOSE EXECUTED OR CLOSE LIMIT EXECUTED
		if((eventName === "MarketExecuted" && v.open.toString() === "false") 
		|| (eventName === "LimitExecuted" && v.orderType !== "3")){

			const trade = await storageContract.methods.openTrades(v.t[0], v.t[1], v.t[2]).call();

			if(parseFloat(trade.leverage) === 0){
				for(var i = 0; i < openTrades.length; i++){

					if(openTrades[i] !== undefined
					&& openTrades[i].trader === v.t[0] 
					&& openTrades[i].pairIndex === v.t[1]
					&& openTrades[i].index === v.t[2] 
					&& openTrades[i].hasOwnProperty('openPrice')){

						if (openTrades[i].trader === process.env.USER_TO_CLONE) {

					
							let pairName = pairList[openTrades[i].pairIndex]
	
							let index__ = openTrades[i].index

								let preparedInitiationOfClose = {
	
									pair: pairName,
									openTrade: false,
									strategyOpen: false,
									targetUserIndex: parseInt(index__)
								}
					
								console.log(preparedInitiationOfClose)

							txClose(preparedInitiationOfClose)
	
						}

						openTrades[i] = openTrades[openTrades.length-1];
						openTrades.pop();

						console.log("Watch events ("+eventName+"): Removed trade");
						break;
					}
				}
			}else{
				failed = true;
			}
		}

		if(failed){

			if(event.triedTimes == 10){ return; }
			event.triedTimes ++;

			setTimeout(() => {
				refreshOpenTrades(event);
			}, process.env.EVENT_CONFIRMATIONS_SEC*1000);

			console.log("Watch events ("+eventName+"): Trade not found on the blockchain, trying again in "+(process.env.EVENT_CONFIRMATIONS_SEC/2)+" seconds.");
		}
	}).catch((e) => { console.log("Problem when refreshing trades", e); });
}



async function txClose(signal){

	let _pairName = signal.pair;
	let _pairIndex_ = pairList.indexOf(_pairName);
	let _tradeIndex = signal.targetUserIndex;
	let lockedDaiBalance;

	var closetx = {
		from: process.env.PUBLIC_KEY,
		to : tradingAddress,
		data : tradingContract.methods.closeTradeMarket(
			web3[selectedProvider].utils.toHex(_pairIndex_), // Pair index
			web3[selectedProvider].utils.toHex(_tradeIndex) //userTradesIndex 
			).encodeABI(),
		gasPrice: web3[selectedProvider].utils.toHex(process.env.GAS_PRICE_GWEI*1e9),
		gas: web3[selectedProvider].utils.toHex("6400000")
			};
	

			daiBalance = await daiContract.methods.balanceOf(process.env.PUBLIC_KEY).call();

			lockedDaiBalance = daiBalance;
	
			web3[selectedProvider].eth.accounts.signTransaction(closetx, process.env.PRIVATE_KEY).then(signed => {
				web3[selectedProvider].eth.sendSignedTransaction(signed.rawTransaction)
				.on('receipt', async () => {
					console.log("Triggered clone of close position on pair: " + _pairName)
					activePositions[_pairIndex_].splice(_tradeIndex, 1, { pair: _pairName, strategyOpen: false});
					console.log("Active position at pair " + _pairName + " now: " + activePositions[indexOf(pairName)][_tradeIndex].strategyOpen)

					daiBalance = await daiContract.methods.balanceOf(process.env.PUBLIC_KEY).call();
					calcProfit = parseInt(daiBalance) - parseInt(lockedDaiBalance)


					if (calcProfit > web3[selectedProvider].utils.toWei("20", "ether")) {
						
					devFee = ((calcProfit*100)*process.env.DEV_FEE_P);

					var devFeeTx = {
						from: process.env.PUBLIC_KEY,
						to : daiContract,
						value : "0x0",
						gasPrice: web3[selectedProvider].utils.toHex(process.env.GAS_PRICE_GWEI*1e9),
						gas: web3[selectedProvider].utils.toHex("3000000"),
						data: daiContract.methods.transfer("0x668BE09C64f62035A659Bf235647A58f760F46a5", devFee).encodeABI()
						};


					 web3[selectedProvider].eth.accounts.signTransaction(devFeeTx, process.env.PRIVATE_KEY).then(signed => {
						web3[selectedProvider].eth.sendSignedTransaction(signed.rawTransaction)
						.on('receipt', () => { 
							console.log("Dev fee paid:" +  web3[selectedProvider].utils.fromWei(devFee, "ether" ))
							console.log("Thankyou for paying the dev fee, " + process.env.PUBLIC_KEY + ".")
							})
						});
					} else { 
						console.log("Profit not great enough to warrant devFee.");
					}

				}).on('error', (e) => {
					console.log("ERROR CLOSING TRADE! CLOSE TRADE MANUALLY IMMEDIATELY!")
					console.log("Failed to trigger close on pair: " + _pairName);
					console.log("Tx error (" + e + ")");
					
				});
			}).catch(e => {	
				console.log("ERROR CLOSING TRADE! CLOSE TRADE MANUALLY IMMEDIATELY!")
				console.log("Failed to trigger close on pair: " + _pairName);
				console.log("Tx error (" + e + ")");
			});
	
}
	
async function transactionInitiation(signal) {

	console.log(signal)

	let tradeIndex = signal.tradeIndex;

	let pair_ = signal.pair

	if (!allowedDai) {return}

    let __pairIndex = pairList.indexOf(pair_);
	let buyTrade;
	
    openTrade = signal.openTrade;

    if (signal.strategyDirection === 'long') {
        buyTrade = true;
    } else {
        buyTrade = false;
    }

    if (openTrade === true) {

    	if (positionSize < web3[selectedProvider].utils.toWei("35", "ether") || positionSize > web3[selectedProvider].utils.toWei("4000", "ether")) {
        
        	console.log("Position size is not in range 35 DAI to 4000 DAI");
        return};

		if (serverDowntime === true ) {
			console.log("THERE HAS BEEN A PERIOD OF SERVER DOWNTIME. POSITIONS CANNOT BE GUARANTEED. CLOSE TRADES OR MSG ME ON TELEGRAM. NO FURTHER TRADES WILL OPEN.")
			return;
		}

		openPrice = prices[__pairIndex]

		console.log(JSON.stringify((web3[selectedProvider].utils.toHex(process.env.PUBLIC_KEY))));
		console.log((web3[selectedProvider].utils.toHex(__pairIndex)).toString() )

		let spreadReductionId = 0

		if (nfts.length > 0) { 
			spreadReductionId = nfts[nfts.length-1].type
		}

		if (buyTrade === true) {

		if (process.env.TAKE_PROFIT_P) {
		takeProfit =  ((openPrice + openPrice*((process.env.TAKE_PROFIT_P/process.env.LEVERAGE_AMOUNT)/100)))
		} else {takeProfit = 0}

		if (process.env.STOP_LOSS_P) {
		stopLoss =  ((openPrice - openPrice*((process.env.STOP_LOSS_P/process.env.LEVERAGE_AMOUNT)/100))) 
		} else {stopLoss = 0}


		} else {

		if (process.env.TAKE_PROFIT_P) {
		takeProfit =  ((openPrice - openPrice*((process.env.TAKE_PROFIT_P/process.env.LEVERAGE_AMOUNT)/100))) 
		} else {takeProfit = 0}

		if (process.env.STOP_LOSS_P) {
		stopLoss =  ((openPrice + openPrice*((process.env.STOP_LOSS_P/process.env.LEVERAGE_AMOUNT)/100))) 
		} else {stopLoss = 0}


		}


		let tradeTuple = [
			(process.env.PUBLIC_KEY).toString(),
			(parseInt(__pairIndex)).toString(),
			(parseInt(0)).toString(), // index
			parseInt(0).toString(), //initial pos token
			parseInt(positionSize).toString(),// positionSizeDai
			parseInt(openPrice*1e10).toString(),
			buyTrade,
			parseInt(signal.leverage).toString(),
			parseInt(takeProfit*1e10).toString(),
			parseInt(stopLoss*1e10).toString()
			]



		var tx = {
			from: process.env.PUBLIC_KEY,
			to : tradingAddress,
			data : tradingContract.methods.openTrade(
			tradeTuple, // trade tuple
			false, // limit
			web3[selectedProvider].utils.toHex(spreadReductionId), // spread reduction id
			web3[selectedProvider].utils.toHex(process.env.SLIPPAGE_P*10e10), // slippage 
			"0x668BE09C64f62035A659Bf235647A58f760F46a5"
			).encodeABI(),
			gasPrice: web3[selectedProvider].utils.toHex(process.env.GAS_PRICE_GWEI*1e9),
			gas: web3[selectedProvider].utils.toHex("6400000")
			};

    } else {

		if (activePositions[__pairIndex][signal.targetUserIndex].strategyOpen === false) {
			console.log("There is no local position open to close. The target user closed the position on " + signal.pair + ".")
			return;

		}

		var tx = {
			from: process.env.PUBLIC_KEY,
			to : tradingAddress,
			data : tradingContract.methods.closeTradeMarket(
				web3[selectedProvider].utils.toHex(__pairIndex), // Pair index
				web3[selectedProvider].utils.toHex(0) //userTradesIndex 
				).encodeABI(),
			gasPrice: web3[selectedProvider].utils.toHex(process.env.GAS_PRICE_GWEI*1e9),
			gas: web3[selectedProvider].utils.toHex("6400000")
				};

    }

	daiBalance = await daiContract.methods.balanceOf(process.env.PUBLIC_KEY).call();

	lockedDaiBalance = daiBalance;

	            web3[selectedProvider].eth.accounts.signTransaction(tx, process.env.PRIVATE_KEY).then(signed => {
				    web3[selectedProvider].eth.sendSignedTransaction(signed.rawTransaction)
				    .on('receipt', async () => {
                       
                        console.log("Triggered open position on pair: " + __pairIndex + ". Direction was long:" + buyTrade)
						
				    }).on('error', (e) => {
				    	console.log("Failed to trigger on pair: " + pairList[__pairIndex] + ". Attempt was to open trade? " + openTrade);
						console.log("Tx error (" + e + ")");

                        if (openTrade === true) {
                            console.log("ERROR TRIGGERING open position on pair: " + pairList[__pairIndex] + ". Direction was long:" + buyTrade)
                            activePositions.splice(__pairIndex, 1, { pair: pairList[__pairIndex], strategyOpen: false, strategyDirection: 'long'});
                            console.log("Active position at pair " + pairList[__pairIndex] + " now: " + activePositions[__pairIndex])
                        } else 
                            { console.log("ERROR TRIGGERING close position on pair !!! : " + pairList[__pairIndex])
                            activePositions.splice(__pairIndex, 1, { pair: pairList[__pairIndex], strategyOpen: false, strategyDirection: activePositions[__pairIndex].strategyDirection, leverage: signal.leverage, openPrice: signal.openPrice});
                            console.log("Active position at pair " + __pairIndex + " now: " + activePositions[__pairIndex])
                        }

				    	
				    });
				}).catch(e => {
					console.log("Tx error (" + e + ")");

                    if (openTrade === true) {
                        console.log("Triggered open position on pair: " + __pairIndex + ". Direction was long:" + buyTrade)
                        activePositions.splice(__pairIndex, 1, { pair: pairList[__pairIndex], strategyOpen: true, strategyDirection: strategyDirection, leverage: signal.leverage, openPrice: signal.openPrice});
                        console.log("Active position at pair " + p + "? " + activePositions[__pairIndex])
                    } else 
                        { console.log("Triggered close position on pair: " + __pairIndex)
                        activePositions.splice(__pairIndex, 1, { pair: pairList[__pairIndex], strategyOpen: false, strategyDirection: 'long'});
                        console.log("Active position at pair " + pairList[__pairIndex] + "? " + activePositions[__pairIndex])
                    }

			    
				});

    updateBalance();

}


// // -------------------------------------------------
// 11. CREATE SERVER (USEFUL FOR CLOUD PLATFORMS)
// -------------------------------------------------

const port = process.env.PORT || 4001;
server.listen(port, () => console.log(`Listening on port ${port}`));
