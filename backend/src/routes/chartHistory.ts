// NOT NEEDED ANYMORE AS IT WAS GETTING ME BANNED FROM THE API ENDPOINT



// import express from "express";
// const router = express.Router();

// interface CandleData{
//     time: number;
//     open: number;
//     high: number;
//     low: number;
//     close: number;
// }
// // const SYMBOL = "BTCUSDT"

// router.post("/api/history" , async (req,res) => {
//         try{
//             const SYMBOL = req.body.symbol;
//             const url = `https://api.binance.com/api/v3/klines?symbol=${SYMBOL}&interval=1m&limit=500`;
//             const resp = await fetch(url);
//             const data = await resp.json();
//             // console.log(data)
//             if (!Array.isArray(data)) {
//                     console.error("Binance API Error:", data);
//                     return res.status(resp.status).json({ 
//                         error: data.msg || "Failed to fetch data from Binance" 
//             });
//         }
//             const formatData: CandleData[] = data.map((rawCandle: any[]) => {
//                 return{
//                     time: rawCandle[0]/1000,
//                     open: parseFloat(rawCandle[1]),
//                     high: parseFloat(rawCandle[2]),
//                     low: parseFloat(rawCandle[3]),
//                     close: parseFloat(rawCandle[4])
//                 };
//             });
//             // console.log(formatData);
//             res.json(formatData)
//         }
//         catch(e){
//             console.error("smth went wrong " , e)
//         }
//     }
// )
// export default router;