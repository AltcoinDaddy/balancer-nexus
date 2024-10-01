"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Activity, DollarSign, TrendingUp, Zap, BarChart2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

// Define types
type Asset = {
  symbol: string;
  weight: number;
  price: number;
};

type PoolData = {
  timestamp: string;
  tvl: number;
  assets: Asset[];
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

// Define initial assets
const initialAssets: Asset[] = [
  { symbol: 'ETH', weight: 0.4, price: 2000 },
  { symbol: 'WBTC', weight: 0.3, price: 30000 },
  { symbol: 'USDC', weight: 0.2, price: 1 },
  { symbol: 'LINK', weight: 0.1, price: 15 },
];

// Define generateMockData function
const generateMockData = (days: number): PoolData[] => {
  const data: PoolData[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const tvl = Math.random() * 1000000 + 500000;
    
    data.unshift({
      timestamp: date.toISOString().split('T')[0],
      tvl,
      assets: initialAssets.map(asset => ({
        ...asset,
        weight: asset.weight + (Math.random() - 0.5) * 0.05,
        price: asset.price * (1 + (Math.random() - 0.5) * 0.03),
      })),
    });
  }
  return data;
};

const AdvancedInteractiveRebalancingDashboard: React.FC = () => {
  const [poolData, setPoolData] = useState<PoolData[]>([]);
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [rebalanceStrategy, setRebalanceStrategy] = useState<'equal' | 'marketCap' | 'inverse' | 'volatility' | 'correlation'>('equal');
  const [volatilityThreshold, setVolatilityThreshold] = useState(0.05);
  const [correlationThreshold, setCorrelationThreshold] = useState(0.7);
  const [gasPrice, setGasPrice] = useState(50);
  const [performanceMetric, setPerformanceMetric] = useState(100);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [rebalanceProgress, setRebalanceProgress] = useState(0);

  const updatePoolData = useCallback(() => {
    setPoolData(prevData => {
      const newDataPoint = generateMockData(1)[0];
      return [...prevData.slice(-29), newDataPoint];
    });
    setGasPrice(prev => Math.max(20, Math.min(150, prev + (Math.random() - 0.5) * 10)));
    setPerformanceMetric(prev => Math.max(80, Math.min(120, prev + (Math.random() - 0.5) * 2)));
  }, []);

  useEffect(() => {
    setPoolData(generateMockData(30));
    const interval = setInterval(updatePoolData, 5000 / simulationSpeed);
    return () => clearInterval(interval);
  }, [simulationSpeed, updatePoolData]);

  const rebalancePool = () => {
    setIsRebalancing(true);
    setRebalanceProgress(0);
    const interval = setInterval(() => {
      setRebalanceProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRebalancing(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    setTimeout(() => {
      const newData = [...poolData];
      const lastDataPoint = newData[newData.length - 1];
      let rebalancedAssets: Asset[];

      switch (rebalanceStrategy) {
        case 'equal':
          rebalancedAssets = lastDataPoint.assets.map(asset => ({ ...asset, weight: 1 / lastDataPoint.assets.length }));
          break;
        case 'marketCap':
          const totalMarketCap = lastDataPoint.assets.reduce((sum, asset) => sum + asset.price, 0);
          rebalancedAssets = lastDataPoint.assets.map(asset => ({ ...asset, weight: asset.price / totalMarketCap }));
          break;
        case 'inverse':
          const totalInversePrice = lastDataPoint.assets.reduce((sum, asset) => sum + 1 / asset.price, 0);
          rebalancedAssets = lastDataPoint.assets.map(asset => ({ ...asset, weight: (1 / asset.price) / totalInversePrice }));
          break;
        case 'volatility':
          // Simplified volatility-based rebalancing
          rebalancedAssets = lastDataPoint.assets.map(asset => ({ 
            ...asset, 
            weight: asset.price > lastDataPoint.assets.reduce((avg, a) => avg + a.price, 0) / lastDataPoint.assets.length ? 0.8 * asset.weight : 1.2 * asset.weight 
          }));
          break;
        case 'correlation':
          // Simplified correlation-based rebalancing (random for demonstration)
          rebalancedAssets = lastDataPoint.assets.map(asset => ({ ...asset, weight: asset.weight * (0.9 + Math.random() * 0.2) }));
          break;
        default:
          rebalancedAssets = lastDataPoint.assets;
      }

      // Normalize weights
      const totalWeight = rebalancedAssets.reduce((sum, asset) => sum + asset.weight, 0);
      rebalancedAssets = rebalancedAssets.map(asset => ({ ...asset, weight: asset.weight / totalWeight }));

      newData.push({
        ...lastDataPoint,
        timestamp: new Date().toISOString().split('T')[0],
        assets: rebalancedAssets,
      });

      setPoolData(newData);
      setIsRebalancing(false);
    }, 2000);
  };

  const currentAssets = poolData.length > 0 ? poolData[poolData.length - 1].assets : [];

  return (
    <div className="p-4 max-w-7xl mx-auto bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Balancer Nexus</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2" /> Performance Metric
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">
              {performanceMetric.toFixed(2)}
            </div>
            <AreaChart width={200} height={60} data={poolData.slice(-10)} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
              <Area type="monotone" dataKey="tvl" stroke="#8884d8" fill="#8884d8" />
            </AreaChart>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2" /> Total Value Locked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">
              ${(poolData[poolData.length - 1]?.tvl || 0).toLocaleString()}
            </div>
            <AreaChart width={200} height={60} data={poolData.slice(-10)} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
              <Area type="monotone" dataKey="tvl" stroke="#82ca9d" fill="#82ca9d" />
            </AreaChart>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2" /> Gas Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-orange-600">
              {gasPrice.toFixed(1)} Gwei
            </div>
            <AreaChart width={200} height={60} data={poolData.slice(-10).map((d, i) => ({ ...d, gas: 20 + i * 3 }))} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
              <Area type="monotone" dataKey="gas" stroke="#ffa500" fill="#ffa500" />
            </AreaChart>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={currentAssets}
                  dataKey="weight"
                  nameKey="symbol"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {currentAssets.map((entry: Asset, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Historical Asset Weights</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={poolData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
                {initialAssets.map((asset: Asset, index: number) => (
                  <Line key={asset.symbol} type="monotone" dataKey={`assets[${index}].weight`} name={asset.symbol} stroke={COLORS[index % COLORS.length]} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Rebalancing Strategy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4">
            <Select onValueChange={(value: any) => setRebalanceStrategy(value as 'equal' | 'marketCap' | 'inverse' | 'volatility' | 'correlation')}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select strategy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equal">Equal Weight</SelectItem>
                <SelectItem value="marketCap">Market Cap Weight</SelectItem>
                <SelectItem value="inverse">Inverse Price Weight</SelectItem>
                <SelectItem value="volatility">Volatility-based</SelectItem>
                <SelectItem value="correlation">Correlation-based</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              onClick={rebalancePool} 
              disabled={isRebalancing || gasPrice > 80}
            >
              {isRebalancing ? 'Rebalancing...' : (gasPrice > 80 ? 'Gas Price Too High' : 'Rebalance Pool')}
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Advanced Controls</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Advanced Rebalancing Controls</DialogTitle>
                  <DialogDescription>
                    Fine-tune your rebalancing strategy parameters.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="volatility" className="text-right">
                      Volatility Threshold
                    </label>
                    <Slider
                      id="volatility"
                      className="col-span-3"
                      value={[volatilityThreshold]}
                      onValueChange={(value) => setVolatilityThreshold(value[0])}
                      max={0.2}
                      step={0.01}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="correlation" className="text-right">
                      Correlation Threshold
                    </label>
                    <Slider
                      id="correlation"
                      className="col-span-3"
                      value={[correlationThreshold]}
                      onValueChange={(value) => setCorrelationThreshold(value[0])}
                      max={1}
                      step={0.05}
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {isRebalancing && (
            <Progress value={rebalanceProgress} className="w-full mt-4" />
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="mr-2" /> Simulation Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <span>Simulation Speed:</span>
            <Slider
              className="w-[200px]"
              value={[simulationSpeed]}
              onValueChange={(value) => setSimulationSpeed(value[0])}
              min={0.1}
              max={5}
              step={0.1}
            />
            <span>{simulationSpeed.toFixed(1)}x</span>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="assets" className="mb-6">
        <TabsList>
          <TabsTrigger value="assets">Asset Details</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
        </TabsList>
        <TabsContent value="assets">
          <Card>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">24h Change</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentAssets.map((asset: Asset) => (
                      <tr key={asset.symbol}>
                        <td className="px-6 py-4 whitespace-nowrap">{asset.symbol}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{(asset.weight * 100).toFixed(2)}%</td>
                        <td className="px-6 py-4 whitespace-nowrap">${asset.price.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={asset.price > (poolData[poolData.length - 2]?.assets.find((a: Asset) => a.symbol === asset.symbol)?.price || asset.price) ? 'text-green-600' : 'text-red-600'}>
                            {((asset.price / (poolData[poolData.length - 2]?.assets.find((a: Asset) => a.symbol === asset.symbol)?.price || asset.price) - 1) * 100).toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="transactions">
          <Card>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <div className="font-medium">Rebalance Transaction</div>
                      <div className="text-sm text-gray-500">Strategy: {['Equal Weight', 'Market Cap Weight', 'Inverse Price Weight', 'Volatility-based', 'Correlation-based'][Math.floor(Math.random() * 5)]}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">Gas Used: {(Math.random() * 500000 + 100000).toFixed(0)}</div>
                      <div className="text-sm text-gray-500">{new Date(Date.now() - Math.random() * 86400000).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="metrics">
          <Card>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium">Pool Metrics</h3>
                  <ul className="list-disc list-inside space-y-2 mt-2">
                    <li>Total Liquidity: ${(poolData[poolData.length - 1]?.tvl || 0).toLocaleString()}</li>
                    <li>24h Volume: ${(Math.random() * 1000000 + 500000).toFixed(2)}</li>
                    <li>7d Fees: ${(Math.random() * 50000 + 10000).toFixed(2)}</li>
                    <li>Number of LPs: {Math.floor(Math.random() * 1000 + 500)}</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Rebalancing Metrics</h3>
                  <ul className="list-disc list-inside space-y-2 mt-2">
                    <li>Last Rebalance: {new Date(Date.now() - Math.random() * 86400000).toLocaleString()}</li>
                    <li>Avg Rebalance Interval: {(Math.random() * 24 + 1).toFixed(1)} hours</li>
                    <li>Rebalance Efficiency: {(Math.random() * 20 + 80).toFixed(2)}%</li>
                    <li>Gas Savings: {(Math.random() * 50 + 10).toFixed(2)}%</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isRebalancing && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Rebalancing in Progress</AlertTitle>
          <AlertDescription>
            The pool is being rebalanced using the {rebalanceStrategy} strategy. This process may take a few moments.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default AdvancedInteractiveRebalancingDashboard;