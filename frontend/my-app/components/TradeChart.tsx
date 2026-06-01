'use client';
import { useStore } from '@/app/store/useStore';
import axios from 'axios';
import { createChart, CandlestickSeries, CandlestickData, ISeriesApi, Time } from 'lightweight-charts';
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export default function TradeCharts({symbol} : {symbol : string}) {
    const container = useRef(null);
    const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const liveCandle = useStore(state => state.ChartData[symbol]);
    // const symbol = useStore(state => state.symbol)
  
    useEffect(() => {
            if(!container.current) return;

            const chartOptions = {
                layout: {
                    textColor: '#848e9c', 
                    background: { type: 'solid', color: '#0b0e11' }, 
                    fontSize: 12,
                    fontFamily: 'var(--font-mono)', 
                },
                grid: {
                    vertLines: { color: '#1e2329' }, 
                    horzLines: { color: '#1e2329' },
                },
                crosshair: {
                    mode: 0, 
                    vertLine: {
                        width: 1,
                        color: '#848e9c',
                        style: 3, 
                        labelBackgroundColor: '#2b3139',
                    },
                    horzLine: {
                        width: 1,
                        color: '#848e9c',
                        style: 3, 
                        labelBackgroundColor: '#2b3139',
                    },
                },
                priceScale: {
                    borderColor: '#2b3139',
                },
                timeScale: {
                    borderColor: '#2b3139',
                    timeVisible: true,
                    secondsVisible: false,
                },
                handleScroll: {
                    mouseWheel: true,
                    pressedMouseMove: true,
                },
                handleScale: {
                    axisPressedMouseMove: true,
                    pinch: true,
                },
            };
            const chart = createChart(container.current , chartOptions);
            
            const candlestickSeries = chart.addSeries(CandlestickSeries , {upColor: '#52a298', downColor: '#dc5e57', borderVisible: false , wickUpColor:'#52a298' , wickDownColor: '#dc5e57'})
            // console.log("Series created:", candlestickSeries);
            seriesRef.current = candlestickSeries;
            const rawData = async () => {
                const response = await axios.post("http://localhost:4000/api/history" , {symbol:symbol}, {
            headers:{
                authorization: localStorage.getItem("authorization")
            }
        });
                const data = response.data
                candlestickSeries.setData(data)
            }
            rawData();
            return() => {
                chart.remove();
            }    
    }, [symbol])

    
      useEffect(()=>{
        if(liveCandle && seriesRef.current){
            seriesRef.current.update(liveCandle as CandlestickData<Time>) 
        }
      } , [liveCandle])
    

  return (
    <div ref={container} className='w-full h-[600px] rounded-md overflow-hidden'>
      
    </div>
  );
}
