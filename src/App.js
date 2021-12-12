import { useEffect, useState } from 'react';
import './App.css';
import { ResponsiveLine } from '@nivo/line';

function App() {
  const [loading, setLoading] = useState(true);
  const [coin, setCoin] = useState([]);
  const [coinKindList, setCoinKindList] = useState([]);
  const [selectCoinKind, setSelectCoinKind] = useState('KRW-BTC');
  const [inputNum, setInputNum] = useState(0);
  const [inverted, setInverted] = useState(false);
  const [count, setCount] = useState(7);
  const [series, setSeries] = useState([{
    id:'',
    data: [
      {
        x: '',
        y: 0
      }
    ]
  }]);

  const onChange = () => {
    setSelectCoinKind(document.querySelector('#selectCoinKind').value);  
  };

  const onInputNum = (event) => {
    setInputNum(event.target.value);
  };

  const onInverted = () => {
    setInputNum(0);
    setInverted((current) => !current);
  };

  const onCount = () => {
    setCount(parseInt(document.querySelector('#count').value));
  };

  const getCoin = async() => {
    try{
      const json = await (await fetch(`https://crix-api-endpoint.upbit.com/v1/crix/candles/days/?code=CRIX.UPBIT.${selectCoinKind}&count=${count}`)).json();
    
      const data = [];

      for(let i = 0; i<json.length; i++){
        data[json.length-1-i] = json[i];
      }
      
      setCoin(data);
      setSeries(() => [{
        id : selectCoinKind,
        data : data.map((coin) => {
          console.log(coin);
              return {
                x: coin.candleDateTime.slice(0,10),
                y: coin.tradePrice
              };
        })
      }]);

      console.log(series);
    }catch(e){
      alert(e);
    }
  };

  const getCoinKindList = () => {
    try{
      setTimeout(async() => {
        const json = await (await fetch(`https://api.upbit.com/v1/market/all`)).json();

        setCoinKindList(json);
        setLoading(false);
      },1000);

    }catch(e){
      alert(e);
    }
  };

  useEffect(() => {
      getCoinKindList();
      getCoin();
    
    console.log(series);
  }, [selectCoinKind, count]);

  return (
    <div>
      {
        loading ? 
        <div id="loading">
          <h1>Loading... Please Wait</h1>
        </div> : 
        <div id="page">
          <div className="top">
            <div>
              <select id="selectCoinKind" onChange={onChange}>
                  {coinKindList.map((kind, index) => <option key={index} value={kind.market}>{kind.korean_name}({kind.market})</option>)}
              </select> 
            </div>

            <div>
              <select id="count" onChange={onCount}>
                <option value="7">1주일</option>
                <option value="30">30일</option>
              </select> 
            </div>
          </div>

          <div className="middle">
            <div className="graph">
              <div className="coinTradePrice">
                <h1>{coin[0].tradePrice}</h1> KRW
                <p>
                  전일 대비 
                  <font className="coinChange">
                    {coin[0].change === 'RISE' ? '+' : '-'}{(coin[0].changeRate*100).toFixed(2)}%    
                  </font>
                  <font className="coinChange">  
                     {coin[0].change === 'RISE' ? '▲' : '▼'} {coin[0].changePrice}  
                  </font>
                </p>
              </div>
              <ResponsiveLine
                data={series}
                margin={{top:50, right:50, bottom:200, left:100}}
                xScale={{ type: 'point', reverse: true }}
                yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: true, reverse: false}}
                yFormat=" >-.5f"
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  orient: 'bottom',
                  tickSize: 5,
                  tickValues: 5,
                  tickPadding: 10,
                  tickRotation: 60,
                  legend: '날짜',
                  legendOffset: 75,
                  legendPosition: 'middle'
                }}
                axisLeft={{
                  orient: 'left',
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: '거래 가격',
                  legendOffset:-80,
                  legendPosition: 'middle'
                }}
                pointSize={20}
                pointColor={{theme:'background'}}
                pointBorderWidth={2}
                pointBorderColor={{from:'sereColor'}}
                pointLabelYOffset={-12}
                useMesh={true}
              />
            </div>

            <div className="coinConvertingUnit">
              <h2>코인 종류별 KRW 단위 변환</h2>

              <div>
                <label htmlFor="KRW">
                  가격(KRW) : 
                </label>
                <input 
                  id="KRW"
                  type="number"
                  value={inverted ? Math.round(inputNum * (coin[0].tradePrice === undefined ? 0 : coin[0].tradePrice)) : inputNum} 
                  onChange={onInputNum}
                  disabled={inverted}
                />
              </div>
              
              <div>
                <label htmlFor="coin">
                  수량(개) : 
                </label>
                <input 
                  id="coin"
                  type="number"
                  value={inverted ? inputNum : Math.round(inputNum / (coin[0].tradePrice === undefined ? 0 : coin[0].tradePrice))} 
                  onChange={onInputNum}
                  disabled={!inverted}
                />
              </div>
              
              <button onClick={onInverted}>단위 전환</button>
            </div>
          </div>
        </div>
      }
    </div>
  );
}


export default App;
