const matrix = {
    'name': 'BTC-Vasya-04-10-18-1',
    // Название инструмента + имя юзера + текущая дата + порядковый
    // день матрицы за сегодня нумеровать все подряд матрицы или отдельно
    // ETH(1, 2, 3..) EOS(1, 2, 3….) ?
    'userId': '584fe811ed936fe74d8b466f',
    // ID юзера берется из БД (фронт в форме выбирает юзера, например Vasya,
    //  в матрице или он уже залогинен под ним,  бек присваивает соответствующий userId)

    'deltas': [  //   список дельт между выбранными биржами например между bitfinex и  hitbtc
        {
            'from': '584fe811ed936fe74d8b466f', // bitfinex
            'to': '584fe811ed936fe74d8b466f', // hitbtc
            'deltaOpen': 0.35, // текущая дельта в % если продать по bid bitfinex и купить по ask hitbtc вводится с фронта
            // deltaOpen = (bid_bitfinex -  ask_hitbtc)/if(bid_bitfinex >  ask_hitbtc) ? ask_hitbtc : bid_bitfinex
            'deltaClose': 2 // в абсолютных значениях (in USD), вводится с фронта
        },
        {
            'from': '584fe811ed936fe74d8b466f', // hitbtc
            'to': '584fe811ed936fe74d8b466f', // bitfinex
            'deltaOpen': 0.26, // текущая дельта в % если продать по bid hitbtc и купить по ask bitfinex вводится с фронта
            // deltaOpen = (bid_hitbtc -  ask_bitfinex)/if(bid_hitbtc >  ask_bitfinex) ? ask_bitfinex : bid_hitbtc
            'deltaClose': 3 // в абсолютных значениях (in USD), вводится с фронта
        }
    ],

    // массив инструментов  которые юзер Vasya выбрал в этой матрице для арбитража
    'instruments': [
        { // данные юзера Vasya для bitfinex
            'tradeAccount': '584fe811ed936fe74d8b466f', // присваивается на беке после выбора пары,bitfinex для этого юзера 
            'exchangeId': '584fe811ed936fe74d8b466f', // присваивается на беке после выбора  для bitfinex
            'pair': 'BTC-USD', //
            'server': 'Asia-Ry34', // юзер выбрал сервер для коннекта зенбота с bitfinex 
            'balance': {// баланс юзера на bitfinex, данные хранятся в БД
                'fiat': 5000, // количество USD
                'crypto': 5.55 // количество BTC
            },
            'balancePaper': {
                'fiat': 50000, // количество USD
                'crypto': 100 // количество BTC
            }
        },
        {// данные юзера Vasya для hitbtc
            'tradeAccount': '584fe811ed936fe74d8b466f', // присваивается на беке после выбора пары,hitbtc для этого юзера 
            'exchangeId': '584fe811ed936fe74d8b466f', // присваивается на беке после выбора  для hitbtc
            'pair': 'BTC-USD', //
            'server': 'Asia-Ry34', // юзер выбрал сервер для коннекта зенбота с hitbtc
            'balance': {// баланс юзера на hitbtc, данные хранятся в БД
                'fiat': 3000, // количество USD
                'crypto': 3.55 // количество BTC
            },
            'balancePaper': {
                'fiat': 60000, // количество USD
                'crypto': 200 // количество BTC
            }
        }
    ],
    'deviation': 0.5,  // параметр определяющий допустимое отклонение в невыгодную для прибыли сторону, выбирается из фронта значение в %
    'lotStep': 0.1, // размер торгового лота который будет в арбитражных сделках матрицы
    'active': true, // true матрица торгует на активных счетах Vasya  по выбранным параметрам
    'paper': false,   // true - матрица  торгует на paper счетах Vasya  по выбранным параметрам
    'history': false,  // true - матрица  торгует на paper счетах Vasya  по параметрам из этой матрицы
};
