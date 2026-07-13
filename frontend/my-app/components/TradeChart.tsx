'use client';
import { useStore } from '@/app/store/useStore';
import axios from 'axios';
import { createChart, CandlestickSeries, CandlestickData, ISeriesApi, IPriceLine, LineStyle, Time } from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { api } from '@/lib/api';

export default function TradeCharts({symbol} : {symbol : string}) {
    const container = useRef(null);
    const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const priceLineRef = useRef<IPriceLine | null>(null);
    const prevPriceRef = useRef<number | null>(null);
    const liveCandle = useStore(state => state.ChartData[symbol]);
    const livePrice = useStore(state => state.livePrice[symbol]);
    const [isLoading, setIsLoading] = useState(true);
    const [showSlowMsg, setShowSlowMsg] = useState(false);
  
    useEffect(() => {
            if(!container.current) return;

            setIsLoading(true);
            setShowSlowMsg(false);
            const slowTimer = setTimeout(() => setShowSlowMsg(true), 4000);
            priceLineRef.current = null;
            prevPriceRef.current = null;

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
            seriesRef.current = candlestickSeries;

            const rawData = async () => {
                try {
                    const response = await api.post("/api/history" , {symbol:symbol}, {
                        headers:{
                            authorization: localStorage.getItem("authorization")
                        }
                    });
                    const data = response.data
                    candlestickSeries.setData(data)
                    setIsLoading(false);
                } catch (err) {
                    // Backend likely cold-starting (Render free tier) — retry until it responds
                    setTimeout(rawData, 3000);
                }
            }
            rawData();
            return() => {
                clearTimeout(slowTimer);
                chart.remove();
            }    
    }, [symbol])

    
      useEffect(()=>{
        if(liveCandle && seriesRef.current){
            seriesRef.current.update(liveCandle as CandlestickData<Time>) 
        }
      } , [liveCandle])

      useEffect(() => {
        if(!seriesRef.current || !livePrice) return;
        const prev = prevPriceRef.current;
        const color = prev !== null && livePrice < prev ? '#dc5e57' : '#52a298';
        prevPriceRef.current = livePrice;

        if(!priceLineRef.current){
            priceLineRef.current = seriesRef.current.createPriceLine({
                price: livePrice,
                color: color,
                lineWidth: 1,
                lineStyle: LineStyle.Dashed,
                axisLabelVisible: true,
                title: '',
            });
        } else {
            priceLineRef.current.applyOptions({ price: livePrice, color: color });
        }
      }, [livePrice])
    

  return (
    <div className='relative w-full h-[600px] rounded-md overflow-hidden bg-[#0b0e11]'>
      <div ref={container} className='w-full h-full' />

      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0b0e11] pointer-events-none">
          <div className="flex items-end gap-1 h-24">
            {[40, 65, 30, 80, 50, 70, 35, 60, 45, 75, 55, 38].map((h, i) => (
              <div
                key={i}
                className="w-2.5 rounded-sm bg-white/10 animate-pulse"
                style={{ height: `${h}%`, animationDelay: `${i * 90}ms` }}
              />
            ))}
          </div>
          <div className="text-xs font-mono text-white/40 tracking-wider uppercase">
            {showSlowMsg ? "Waking up the server — this can take up to a minute" : "Loading market data"}
          </div>
        </div>
      )}
    </div>
  );
}