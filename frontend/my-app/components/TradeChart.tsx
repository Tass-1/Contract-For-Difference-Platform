"use client";
import { useStore } from '@/app/store/useStore';
import { createChart, CandlestickSeries, CandlestickData, ISeriesApi, Time, LineSeries } from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';

interface ChartItem {
    time: Time;
    open: number;
    high: number;
    low: number;
    close: number;
}

export default function TradeCharts({ symbol }: { symbol: string }) {
    const container = useRef<HTMLDivElement>(null);
    const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const ma7Ref = useRef<ISeriesApi<"Line"> | null>(null);
    const ma25Ref = useRef<ISeriesApi<"Line"> | null>(null);
    const ma99Ref = useRef<ISeriesApi<"Line"> | null>(null);
    
    const liveCandle = useStore(state => state.ChartData[symbol]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [showSlowMsg, setShowSlowMsg] = useState(false);

    useEffect(() => {
        if (!container.current) return;

        setIsLoading(true);
        setShowSlowMsg(false);
        const slowTimer = setTimeout(() => setShowSlowMsg(true), 4000);

        const chartOptions = {
            autoSize: true,
            layout: {
                textColor: '#848e9c',
                background: { type: 'solid', color: 'transparent' }, 
                fontSize: 12,
                fontFamily: 'var(--font-sans)', 
            },
            grid: {
                vertLines: { color: '#1e2329' },
                horzLines: { color: '#1e2329' },
            },
            crosshair: {
                mode: 1,
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
                borderColor: '#1e2329',
                autoScale: true,
            },
            timeScale: {
                borderColor: '#1e2329',
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
        
        const chart = createChart(container.current, chartOptions);
        
        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#4a8b66',     
            downColor: '#a84755',   
            borderVisible: false,
            wickUpColor: '#4a8b66',
            wickDownColor: '#a84755'
        });
        
        const ma7Series = chart.addSeries(LineSeries, {
            color: 'rgba(240, 185, 11, 0.7)',
            lineWidth: 1.5,
            priceLineVisible: false,
            crosshairMarkerVisible: false,
            lastValueVisible: false,
        });

        const ma25Series = chart.addSeries(LineSeries, {
            color: 'rgba(255, 0, 255, 0.6)',
            lineWidth: 1.5,
            priceLineVisible: false,
            crosshairMarkerVisible: false,
            lastValueVisible: false,
        });

        const ma99Series = chart.addSeries(LineSeries, {
            color: 'rgba(74, 0, 224, 0.6)',
            lineWidth: 1.5,
            priceLineVisible: false,
            crosshairMarkerVisible: false,
            lastValueVisible: false,
        });

        seriesRef.current = candlestickSeries;
        ma7Ref.current = ma7Series;
        ma25Ref.current = ma25Series;
        ma99Ref.current = ma99Series;

        const calculateMA = (data: ChartItem[], period: number) => {
            const maData = [];
            for (let i = 0; i < data.length; i++) {
                if (i < period - 1) continue;
                let sum = 0;
                for (let j = 0; j < period; j++) {
                    sum += data[i - j].close;
                }
                maData.push({ time: data[i].time, value: sum / period });
            }
            return maData;
        };

        const rawData = async () => {
            try {
                const response = await api.post("/api/history", { symbol: symbol }, {
                    headers: {
                        authorization: localStorage.getItem("authorization")
                    }
                });
                
                const data: ChartItem[] = response.data.map((item: any) => {
                    let cleanTime = item.time;
                    if (typeof cleanTime === 'string' || cleanTime instanceof Date) {
                        cleanTime = Math.floor(new Date(cleanTime).getTime() / 1000);
                    } else if (typeof cleanTime === 'number' && cleanTime > 2000000000) {
                        cleanTime = Math.floor(cleanTime / 1000);
                    }
                    return {
                        ...item,
                        time: cleanTime as Time
                    };
                });

                candlestickSeries.setData(data);
                
                if (data.length >= 7) ma7Series.setData(calculateMA(data, 7));
                if (data.length >= 25) ma25Series.setData(calculateMA(data, 25));
                if (data.length >= 99) ma99Series.setData(calculateMA(data, 99));

                setIsLoading(false);
            } catch (err) {
                setTimeout(rawData, 3000);
            }
        }
        
        rawData();
        
        return () => {
            clearTimeout(slowTimer);
            chart.remove();
        }
    }, [symbol]);

    useEffect(() => {
        if (liveCandle && seriesRef.current) {
            try {
                let normalizedTime = liveCandle.time;
                
                if (typeof normalizedTime === 'string' || normalizedTime instanceof Date) {
                    normalizedTime = Math.floor(new Date(normalizedTime).getTime() / 1000);
                } else if (typeof normalizedTime === 'number' && normalizedTime > 2000000000) {
                    normalizedTime = Math.floor(normalizedTime / 1000);
                } else if (typeof normalizedTime === 'object' && normalizedTime !== null) {
                    const fallback = (normalizedTime as any).seconds || (normalizedTime as any)._seconds;
                    if (fallback) {
                        normalizedTime = fallback;
                    } else {
                        normalizedTime = Math.floor(new Date(normalizedTime as any).getTime() / 1000);
                    }
                }

                seriesRef.current.update({
                    ...liveCandle,
                    time: normalizedTime as Time
                } as CandlestickData<Time>);

            } catch (err) {
                console.error("Failed to parse candle update metric:", err);
            }
        }
    }, [liveCandle]);

    return (
        <div className='relative w-full h-full bg-[#0b0e11] overflow-hidden min-h-0'>
            <div ref={container} className='absolute inset-0' />

            {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0b0e11] pointer-events-none z-10">
                    <div className="flex items-end gap-1.5 h-16">
                        {[40, 65, 30, 80, 50, 70, 35, 60].map((h, i) => (
                            <div
                                key={i}
                                className="w-2 rounded-sm bg-[#1e2329] animate-pulse"
                                style={{ height: `${h}%`, animationDelay: `${i * 100}ms` }}
                            />
                        ))}
                    </div>
                    <div className="text-[13px] font-sans text-[#848e9c] tracking-wider uppercase">
                        {showSlowMsg ? "Waking up the server..." : "Loading chart data"}
                    </div>
                </div>
            )}
        </div>
    );
}