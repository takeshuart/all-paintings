import { any } from 'bluebird';
import fs from 'fs';
import path from 'path';

const loadData = (filePath: string): any => {
    const fileData = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileData);
};


// 计算定投的均价
const calculateAverageCost = (investment: number, prices: number[]): number => {
    let totalAmount = 0;
    let totalUnits = 0;

    prices.forEach(price => {
        totalUnits += investment / price;
        totalAmount += investment;
    });

    return totalAmount / totalUnits;
};

// 从每一天的数据中随机选取一个时间点的价格
const getRandomPriceForDay = (dayDates: string[], dayPrices: number[]): number => {
    const randomIndex = Math.floor(Math.random() * dayDates.length);
    //   console.log(`日期: ${dayDates[randomIndex]}，价格: ${dayPrices[randomIndex]} CNY`);
    return dayPrices[randomIndex];
};

// 将数据按日期分组，返回日期-时间点价格对的映射
const groupDataByDate = (dateTimes: string[], prices: number[]): { [date: string]: { times: string[], prices: number[] } } => {
    const groupedData: { [date: string]: { times: string[], prices: number[] } } = {};
    dateTimes.forEach((dateTime, index) => {
        const day = dateTime.split(' ')[0]
        if (!groupedData[day]) {
            groupedData[day] = { times: [], prices: [] };
        }
        groupedData[day].times.push(dateTime);
        groupedData[day].prices.push(prices[index]);
    });
    return groupedData;
};

const backtest = (dates: string[], prices: number[], investmentAmount: number, numTests: number): void => {
    const groupedData = groupDataByDate(dates, prices);

    let minAvgCost = Infinity;
    let maxAvgCost = -Infinity; 
    for (let test = 0; test < numTests; test++) {
        const selectedPrices: number[] = [];
        //从每一天中随机选择一个时间点
        const dates = Object.keys(groupedData);
        dates.forEach(date => {
            const { times: dayTimes, prices: dayPrices } = groupedData[date];
            const price = getRandomPriceForDay(dayTimes, dayPrices);
            selectedPrices.push(price);
        });

        const averageCost = calculateAverageCost(investmentAmount, selectedPrices);
        if (averageCost < minAvgCost) minAvgCost = averageCost;
        if (averageCost > maxAvgCost) maxAvgCost = averageCost;

        console.log(`回测第 ${test + 1} 次：均价为: ${averageCost.toFixed(2)} CNY`);
    }
    console.log(`回测${numTests}次，均价区间为:  ${minAvgCost.toFixed(2)}元 - ${maxAvgCost.toFixed(2)}元`);
};

const main = (filePath: string, investmentAmount: number, numTests: number) => {
    const data = loadData(filePath);
    const { seriesDataDates, grams } = data.chartData;
    const prices = grams.series.CNY.data;

    backtest(seriesDataDates, prices, investmentAmount, numTests);
};

// 调用主函数
const filePath = path.join(__dirname, '../../data/finance/7日黄金价数据（4.16-4.23).json');
const investmentAmount = 5000;  // 定投金额
const numTests = 100;  // 回测次数
main(filePath, investmentAmount, numTests);
