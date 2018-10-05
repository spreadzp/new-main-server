import { MatrixService } from './../db/matrix/matrix.service';
import { Trade } from './../common/models/trade';
import { ExchangeService } from './../db/exchange/exchange.service';
import { Order } from './../common/models/order';

const net = require('toa-net');
import { Parser } from './parser';
import { OrderBookService } from './../db/orderBook/orderBook.service';
import { OrderService } from './../db/order/order.service';
import { Controller } from '@nestjs/common';
import { ClientTcp } from './client-tcp';
import { TradeService } from './../db/trade/trade.service';
import { StateTrading } from './../common/models/stateTrading';
import { ExchangeData } from './../common/models/exchangeData';
import { SERVER_CONFIG } from './../../server.constants';
import { ArbitrageBalanceService } from '../db/arbit-balance/arbit-balance.service';
import { PureTrade } from '../common/models/pureTrade';
import { setInterval } from 'timers';
import { Order5BookService } from '../db/orderBook_5/orderBook_5.service';

const auth = new net.Auth('secretxxx');

@Controller()
export class ServerTcpBot {
  server: any;
  parser: Parser;
  clientsTcp: ClientTcp[] = [];
  stateTrading: StateTrading[] = [];
  startFlag = true;
  // флаг который с фронта управляет возможностью совершения сделок
  avalableArbitrage = false;

  constructor(
    private readonly orderBooksService: OrderBookService,
    private readonly order5BooksService: Order5BookService,
    private readonly orderService: OrderService,
    private readonly tradeService: TradeService,
    private readonly exchangeService: ExchangeService,
    private readonly arbitrageBalanceService: ArbitrageBalanceService,
    private readonly matrixService: MatrixService) {
    this.parser = new Parser(this.orderBooksService, this.order5BooksService, this.exchangeService, this.arbitrageBalanceService,
      this.tradeService, this.matrixService);
  }

  // запрещает ведение новых арбитражных сделок
  stopArbitrage() {
    this.avalableArbitrage = false;
    console.log('Arbitrage stoped');
  }

  // разрешает ведение новых арбитражных сделок
  startArbitrage() {
    this.avalableArbitrage = true;
    console.log('Arbitrage started');
  }

  // получаем сделки с 1 полуцикла
  async getFirstTradeArbitrage(id: string) {
    const arbitrage = await this.arbitrageBalanceService.findArbitrageById(id);
    return [arbitrage.firstCickleSell, arbitrage.firstCickleBuy];
  }

  // вызов с фронта закрытия 2 - го полуцикла
  async closeSecondArbitrage(trades: PureTrade[], arbitId: string) {
    const orders = await this.parser.closeSecondArbitrage(trades, arbitId);
    // console.log('==============object :', orders);
    if (orders.length) {
      console.log(' ++++++++++++++++closeSecondArbitrage call :sendOrdersToBot');
      this.sendOrdersToBot(orders, 'taker');
      this.arbitrageBalanceService.closeSecondCircleStatus(arbitId);
    }
  }

  async passTradeToDB(message: any, status: string) {
    const trades = this.parser.parseTrades(message);
    if (trades) {
      for (const trade of trades) {
        // const status = (trade.remainingSize === 0) ? 'done' : 'partial';
        if (trade) {
          await this.combineTrade(trade, status);
        }
      }
    }
  }

  async combineTrade(trade: Trade, status?: string) {
    this.orderService.updateStatusOrder(trade.arbitrageId, trade.typeOrder, trade.exchOrderId, status, '');
    this.parser.subTradedVolume(trade);
    this.tradeService.addNewData(trade);
    this.countPureTrade(trade);
    let newOrder;
    // console.log('trade.arbitID :', trade.arbitrageId, trade.typeOrder);
    if (this.parser.orderFullFilled(trade)) {
      const newOrderBook = this.parser.addNewOrderBookData();
      // if (this.avalableArbitrage) {
      newOrder = await this.parser.defineSellBuy(newOrderBook);
      console.log(' 80parser.defineSellBuy:', newOrder);
      //  this.parser.removeCheckerSentOrders(trade.arbitrageId);
      // }
    } else {
      if (this.avalableArbitrage) {
        console.log('85this.parser.makePartialOrder:');
        newOrder = await this.parser.makePartialOrder(trade);
      }
    }
    if (newOrder) {
      console.log(' 91 sendOrdersToBot(  :');
      await this.sendOrdersFromPromise(newOrder);
    }
  }

  async countPureTrade(trade: Trade) {
    const sameTrade = await this.tradeService.findTrade(trade);
    if (!sameTrade) {
      console.log('sameTrade :', sameTrade);
      const pureTrade = await this.parser.addNewArbitrageTrade(trade);
      await this.arbitrageBalanceService.addNewTrade(pureTrade, trade.arbitrageId);
      await this.parser.removeCheckerSentOrders(trade.arbitrageId);
    } else {
      this.checkOrder(trade.arbitrageId, trade.typeOrder, trade.exchange);
    }
  }

  async sendOrdersFromPromise(newOrder: any) {
    console.log(' 125sendOrders  FromPromise call  :sendOrdersToBot');
    await this.sendOrdersToBot(newOrder, 'taker');
  }

  generateOrderAfterCancel(message: any) {
    const trades = this.parser.parseTrades(message);
    if (trades) {
      for (const trade of trades) {
        this.orderService.updateStatusOrder(trade.arbitrageId, trade.typeOrder, trade.exchOrderId, 'cancelled', '');
        const order: Order[] = this.parser.replaceCancelledOrderByNewOrder(trade);
        if (order) {
          console.log('generateOrderAfterCancel call sendOrdersToBot :');
          this.sendOrdersToBot(order);
        }
      }
    }
  }

  createTcpServer() {
    if (!this.server) {
      this.startServer();
      this.parser.startSaverOrderBooks();
    } else if (!this.server.address()) {
      this.startServer();
    } else {
      console.log('the already started');
    }
  }

  // запуск сервера для прослушивания по TCP  на порту сообщений
  startServer() {
    this.server = new net.Server((socket: any) => {
      socket.on('message', async (message: any) => {
        // console.log('message : %j', message);
        if (message.type === 'notification' //  && message.payload.method === 'trades' ||
          && message.payload.method === 'partial' || message.payload.method === 'done') {
          console.log(' message.payload.method :', message.payload.method);
          this.passTradeToDB(message, message.payload.method);
        }
        if (message.type === 'notification' && message.payload.method === 'resCheckOrder') {
          const confirmedOrder = message.payload.params[0];
          if (confirmedOrder) {
            console.log('confirmedOrder :',
             confirmedOrder.arbitrageId, confirmedOrder.status, confirmedOrder.exchOrderId, confirmedOrder.typeOrder);
            await this.orderService.updateStatusOrder(confirmedOrder.arbitrageId, confirmedOrder.typeOrder,
              confirmedOrder.exchangeId, confirmedOrder.status, '');
            if (confirmedOrder.status === 'notSend') {
              console.log('!!!  confirmedOrder id status :', confirmedOrder.arbitrageId, confirmedOrder.status);

            } else {
              const trade = this.tradeService.findTrade(confirmedOrder);
              if (trade) {
                this.countPureTrade(confirmedOrder as Trade);
                this.parser.removeCheckerSentOrders(confirmedOrder.arbitrageId);
              }
            }
          }
        }
        if (message.type === 'notification' && message.payload.method === 'statusOrder') {

          console.log('168 ########### status=', message.payload.params[3]);
          this.orderService.updateStatusOrder(message.payload.params[0], message.payload.params[1],
            message.payload.params[2], message.payload.params[3], message.payload.params[4]);
          if (message.payload.params[3] === 'open') {
            const trade = {
              exchange: '', pair: '', price: '', volume: '', typeOrder: message.payload.params[1],
              arbitOrderId: message.payload.params[0], exchOrderId: '', time: ''
            };
            //  this.checkOrder(trade);
          }
          /*  if (message.payload.params[3] === 'done') {
              this.passTradeToDB(message, message.payload.params[3]);
           } */
          if (message.payload.params[3] === 'cancelled') {
            this.generateOrderAfterCancel(message);
          }
        }
        else {
          const parsedMessage = this.parser.parseTcpMessage(message);
          this.parser.calculateAskBid(parsedMessage);
          const newOrderBook = this.parser.addNewOrderBookData();
          // console.log('newOrderBook :', newOrderBook);
          if (this.avalableArbitrage) {
            if (this.startFlag) {
              const orders = await this.parser.defineSellBuy(newOrderBook);
              console.log('this.startFlag :', this.startFlag, this.avalableArbitrage);
              this.sendOrdersToBot(orders);
              this.startFlag = false;
            }
          }
        }
      });
    });
    this.server.listen(SERVER_CONFIG.tcpPort);
    console.log(`Tcp server listen port ${SERVER_CONFIG.tcpPort}`);

    //  Enable authentication for server
    this.server.getAuthenticator = () => {
      return (signature: string) => auth.verify(signature);
    };
  }

  private checkOrder(arbitId: string, orderType: string, exchange: string) {
    return this.orderService.findOrderByIdExchange(arbitId, orderType, exchange)
      .then((order) => {
        if (order) {
          const checkingOrder = {
            nameOrder: 'checkOrder', order: { arbitrageId: arbitId, pairOrder: order.pair, typeOrder: orderType },
            serverPort: order.port, host: order.host,
          };
          this.startClient(checkingOrder);
        }
      });
  }

  stopTcpServer() {
    this.server.close();
    console.log('Tcp server stoped');
  }

  createClient(clientSocket: any) {
    const newClientTcp = new net.Client();
    this.clientsTcp.push({ socket: clientSocket, client: newClientTcp });
    newClientTcp.getSignature = () => {
      return auth.sign({ id: 'clientIdxxx' });
    };
    newClientTcp.connect(clientSocket);
    return newClientTcp;
  }

  getSpread() {
    return this.parser.getBidAskSpread();
  }

  async getCurrentArbitrage() {
    // получаем данные для фронта для незакрытых во 2 полуцикле сделок
    const arbitrage = await this.parser.getNotClosedArbitrage();
    const timeAfterSent = Date.now() - 60000;
    const sentOpenOrders = await this.orderService.getSameStatusOrder('open', timeAfterSent);
    if (sentOpenOrders.length) {
      for (const sentOpenOrder of sentOpenOrders) {
        // console.log('251check Order :', sentOpenOrder.arbitrageId, sentOpenOrder.typeOrder);
        this.checkOrder(sentOpenOrder.arbitrageId, sentOpenOrder.typeOrder, sentOpenOrder.exchange);
      }
    }
    // проверяем список отправленных но не подтвержденных ордеров 2 полуцикла
    const notConfirmedOrders = this.parser.expiredTimeSendNotConfirmOrders(Date.now());
    if (notConfirmedOrders.length) {
      for (const secondOrders of notConfirmedOrders) {
        this.checkOrder(secondOrders.arbitId, 'sell', secondOrders.secondBuyExchange);
        this.checkOrder(secondOrders.arbitId, 'buy', secondOrders.secondSellExchange);
        // получаем список closeSecondOrders с ордерами по которым
        // не было подтверждения сделки в течение 1 мин
        this.parser.setCurrentTimeSentOrder(Date.now(), secondOrders.arbitId);
        // this.parser.closeSecondOrders = [];
      }

    }
    if (this.parser.closeSecondOrders.length && arbitrage.length) {
      // если список closeSecondOrders есть то повторно отправляем неподтвержденные ордера на зенбот
      console.log('269 sent new order :');
      this.sendOrdersToBot(this.parser.closeSecondOrders, 'taker');
      // сразу обнуляем список closeSecondOrders
      this.parser.closeSecondOrders = [];

    }
    return arbitrage;
  }

  sendOrdersToBot(orders: Order[], feeType?: string) {
    let parametersOrder;
    // console.log('============orders :', orders);
    if (orders) {
      for (const currentOrder of orders) {
        if (!feeType) {
          parametersOrder = {
            nameOrder: 'sendOrder',
            serverPort: currentOrder.port, host: currentOrder.host,
            order: currentOrder,
          };
        } else {
          parametersOrder = {
            nameOrder: 'sendTakerOrder',
            serverPort: currentOrder.port, host: currentOrder.host,
            order: currentOrder,
          };
        }
        if (parametersOrder.order.price > 0) {
          this.startClient(parametersOrder);
          this.orderService.addNewOrder(currentOrder);
        }
      }
    }
  }

  async startClient(order: any) {
    try {
      if (order.host && order.serverPort) {
        const clientSocket = `tcp://${order.host}:${order.serverPort}`;
        let currentClient = this.defineTcpClient(clientSocket);
        if (!currentClient) {
          currentClient = this.createClient(clientSocket);
        }
        currentClient.on('error', (err: any) => {
          if (err.code === 'ETIMEDOUT') {
            currentClient.destroy();
          }
          currentClient.reconnect();
        });
        const stringOrder = JSON.stringify(order.order);
        // console.log('321 order.nameOrder :', order.nameOrder);
        const countSentOpenOrders = await this.orderService.checkOpenOrders(order.order.arbitrageId, 'open', order.order.typeOrder);
        if (order.nameOrder === 'checkOrder') {
          // console.log('countSentOpenOrders  status', countSentOpenOrders, order.nameOrder);
          currentClient.notification(order.nameOrder, [`${stringOrder}`]);
        } else if (!countSentOpenOrders) {
          console.log('  Sent Orders :', countSentOpenOrders, order.order.status);
          await currentClient.notification(order.nameOrder, [`${stringOrder}`]);
          await this.parser.changeStatusInSentOrders(order.order.arbitrageId, order.order.typeOrder);
        }
      }
    } catch (e) {
      console.log('err :', e);
    }
  }

  defineTcpClient(socketTcp: any): any {
    if (this.clientsTcp) {
      for (const iterator of this.clientsTcp) {
        if (iterator.socket === socketTcp) {
          return iterator.client;
        }
      }
    }
  }

  getCurrentPrice(): ExchangeData[] {
    return this.parser.getCurrentPrice();
  }
  getExchangePrice(exchange: string, pair: string, typePrice: string) {
    return this.parser.getExchangePrice(exchange, pair, typePrice);
  }
}
