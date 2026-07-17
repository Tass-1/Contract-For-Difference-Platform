'use client';
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

interface CandleData{
    time: number;
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

        let chart: any = null;
        let slowTimer = setTimeout(() => setShowSlowMsg(true), 4000);
        let active = true;

        const initializeChart = () => {
            if (!container.current || !active) return;

            const width = container.current.clientWidth;
            const height = container.current.clientHeight || 350;

            if (width === 0) {
                setTimeout(initializeChart, 100);
                return;
            }

            const chartOptions = {
                width: width,
                height: height,
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

            chart = createChart(container.current, chartOptions);

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

            const handleResize = () => {
                if (container.current && chart) {
                    chart.resize(container.current.clientWidth, container.current.clientHeight || 350);
                }
            };

            window.addEventListener('resize', handleResize);

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
            const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m&limit=500`;
            const rawData = async () => {
                try {
                    const resp = await fetch(url);
                    const response = await resp.json();
                    const formatData: CandleData[] = response.map((rawCandle: any[]) => {
                        return{
                            time: rawCandle[0]/1000,
                            open: parseFloat(rawCandle[1]),
                            high: parseFloat(rawCandle[2]),
                            low: parseFloat(rawCandle[3]),
                            close: parseFloat(rawCandle[4])
                        };
                    });
                    if (!active) return;

                    const data: ChartItem[] = formatData.map((item: any) => {
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
                    if (active) setTimeout(rawData, 7000);
                }
            };

            rawData();
        };

        initializeChart();

        return () => {
            active = false;
            clearTimeout(slowTimer);
            if (chart) {
                chart.remove();
            }
        };
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
                console.error(err);
            }
        }
    }, [liveCandle]);

    return (
        <div className='relative w-full h-full min-h-[380px] md:min-h-0 bg-[#0b0e11] overflow-hidden'>
            <div ref={container} className='absolute inset-0 w-full h-full' />

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
                    <div className="text-[13px] font-sans text-[#848e9c] tracking-wider uppercase px-4 text-center">
                        {showSlowMsg ? "The server is on a free tier and is currently booting up. This will take ~30 seconds." : "Loading chart data"}
                    </div>
                </div>
            )}
        </div>
    );
}