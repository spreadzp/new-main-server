import { subscribe } from 'graphql';
import { UserService } from './../../services/user.service';
import { OrderBook } from './../../shared/models/orderBook.model';
import { Component, OnInit } from '@angular/core';
import { Angular5Csv } from 'angular5-csv/Angular5-csv';

@Component({
    selector: 'app-export',
    templateUrl: './export.component.html',
    styleUrls: ['./export.component.scss']
})
export class ExportComponent implements OnInit {
    asset: any;
    countOrderbooks: number;
    timestamp: number;
    timestamp5: number;
    skip = 0;
    startDate: any;
    endDate: any;
    angular5Csv: Angular5Csv;
    selected: { start: any, end: any };
    items: OrderBook[];

    constructor(private userService: UserService) { }

    ngOnInit() { }

    getDataTimeStamp(timestamp: number) {
        this.download('orderBooks', timestamp, `timestamp_${timestamp}`);
        this.timestamp = timestamp;
    }
    getDataFiveTimeStamp(timestamp: number) {
        this.download('order5Books', timestamp, `timestamp_${timestamp}`);
        this.timestamp5 = timestamp;
    }

    async download(url: string, timestamp: number, textForNameFile?: string) {

        if (this.selected.start && this.selected.start) {
            const utcStartDate = Date.parse(this.selected.start);
            const utcEndDate = Date.parse(this.selected.end);
            console.log('object :', utcStartDate, '&', utcEndDate);
            await this.userService.getData<number>(
                `${url}/count/?startDate=${utcStartDate}&endDate=${utcEndDate}&asset=${this.asset}`)
                .subscribe(async data => {
                    this.countOrderbooks = data;
                    console.log('this.countOrderbooks :', this.countOrderbooks);
                    if (this.countOrderbooks < 40000) {
                        await this.requestOrderBookDB(url, utcStartDate, utcEndDate, this.asset, textForNameFile, timestamp);
                    } else {
                        const koef = Math.floor(this.countOrderbooks / 40000);
                        const diffTimeDay = utcEndDate - utcStartDate;
                        const iterator = Math.floor(diffTimeDay / koef);
                        this.skip = utcStartDate;
                        while (utcEndDate > this.skip) {
                            const endIntoDayPeriod = this.skip + iterator;
                            console.log('this.skip + iterator :', this.skip, iterator);
                            await this.requestOrderBookDB(url, this.skip, endIntoDayPeriod, this.asset, textForNameFile, timestamp);
                            this.skip = this.skip + iterator;
                        }
                    }
                });

        } else {
            alert('Введите даты поискового диапазона!');
        }
    }

    async requestOrderBookDB(partUrl: string, utcStartDate: number,
         utcEndDate: number, asset: string, textForNameFile: string, timeStamp: number) {
        await this.userService.getData<OrderBook[]>(
            `${partUrl}/ob-period/?startDate=${utcStartDate}&endDate=${utcEndDate}&asset=${asset}`)
            .subscribe(async data => {
                this.items = data;
                if (this.items.length > 100) {
                    const timeData = await this.convertToTimeStamp(this.items, timeStamp);
                    const convertData = await this.convertOneLine(timeData);
                    await this.createCsv(convertData, utcStartDate, utcEndDate, this.asset.toString(), textForNameFile);
                }
            });
    }

    convertToTimeStamp(data: OrderBook[], timestamp: number): OrderBook[] {
        const tempOrderBook: OrderBook[] = [];
        const orderBookIntoTimestamp: any[] = [];
        let stamp;
        for (const iterator of data) {
            const index = orderBookIntoTimestamp.findIndex(item => item.exchangeName === iterator.exchangeName);
            if (index >= 0 && stamp > +iterator.time && orderBookIntoTimestamp.length) {
                if (orderBookIntoTimestamp[index].pair === iterator.pair) {
                    orderBookIntoTimestamp[index].bid = (+iterator.bid > +orderBookIntoTimestamp[index].bid)
                        ? +iterator.bid : +orderBookIntoTimestamp[index].bid;
                    orderBookIntoTimestamp[index].bidVolume = +iterator.bidVolume;
                    orderBookIntoTimestamp[index].ask = (+orderBookIntoTimestamp[index].ask > +iterator.ask)
                        ? +iterator.ask : +orderBookIntoTimestamp[index].ask;
                    orderBookIntoTimestamp[index].askVolume = +iterator.askVolume;
                    orderBookIntoTimestamp[index].time = stamp;
                }
            } else if (stamp <= +iterator.time) {
                for (const book of orderBookIntoTimestamp) {
                    tempOrderBook.push(book);
                }
                orderBookIntoTimestamp.length = 0;
                stamp = +iterator.time + timestamp;
            } else {
                stamp = +iterator.time + timestamp;
                const newItem = {
                    exchangeName: iterator.exchangeName,
                    pair: iterator.pair,
                    bid: +iterator.bid,
                    bidVolume: +iterator.bidVolume,
                    ask: +iterator.ask,
                    askVolume: +iterator.askVolume,
                    time: stamp
                };
                orderBookIntoTimestamp.push(newItem);
            }
        }
        return tempOrderBook;
    }

    getExchange(orderBook: OrderBook[]) {
        const exchangeNames: string[] = [];
        for (const order of orderBook) {
            const index = exchangeNames.find(item => item === order.exchangeName);
            if (!index) {
                exchangeNames.push(order.exchangeName);
            }
        }
        return exchangeNames;
    }

    getExchangeHeader(orderBook: any) {
        const header: string[] = ['time'];
        for (const name of orderBook.names) {
            header.push(`pair-${name}`);
            header.push(`bid-${name}`);
            header.push(`bidVolume-${name}`);
            header.push(`ask-${name}`);
            header.push(`askVolume-${name}`);
        }
        return header;
    }

    convertOneLine(orderData: OrderBook[]) {
        const convertData: any = {
            names: [],
            data: []
        };

        const temp: any = {};
        const exchangeNames: any = {};

        for (const orderBook of orderData) {
            exchangeNames[orderBook.exchangeName] = false;
            if (!temp[orderBook.time]) {
                temp[orderBook.time] = {};
            }

            temp[orderBook.time][orderBook.exchangeName] = orderBook;
        }

        for (const name in exchangeNames) {
            if (exchangeNames.hasOwnProperty(name)) {
                convertData.names.push(name);
            }
        }

        const data = convertData.data;
        const needFiles = ['pair', 'bid', 'bidVolume', 'ask', 'askVolume'];

        for (const time in temp) {
            if (temp.hasOwnProperty(time)) {
                const last = [];
                last.push(time);

                const timeline = temp[time];

                for (const name of convertData.names) {

                    const orderBook: any = timeline[name];

                    for (let i = 0; i < needFiles.length; ++i) {
                        if (orderBook) {
                            last.push(orderBook[needFiles[i]]);
                        } else {
                            last.push('');
                        }
                    }
                }
                data.push(last);
            }
        }

        return convertData;
    }

    createCsv(orderData: any, startDate: number, endDate: number, asset: string, nameFile?: string) {
        const heders = this.getExchangeHeader(orderData);
        const stDate = new Date(startDate).toDateString();
        const finishfDate = new Date(endDate).toDateString();
        const chuckSize = 40000;
        const options = {
            fieldSeparator: ',',
            quoteStrings: '"',
            decimalseparator: '.',
            showLabels: true,
            showTitle: true,
            headers: heders
        };
        let i, j, temparray;
        const data = orderData.data;
        for (i = 0, j = data.length; i < j; i += chuckSize) {
            temparray = data.slice(i, i + chuckSize);
            const fileName = (nameFile === undefined) ? 'orderbooks' : nameFile;
            this.angular5Csv = new Angular5Csv(temparray, `${asset}_ ${fileName}_${stDate}_${finishfDate}_length${i}`, options);
        }
    }
}
