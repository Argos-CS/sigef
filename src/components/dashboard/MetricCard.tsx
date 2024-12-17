import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';
import { formatarMoeda } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: number;
  type?: 'neutral' | 'positive' | 'negative';
  percentageChange?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  type = 'neutral',
  percentageChange 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'positive':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getValueColor = () => {
    switch (type) {
      case 'positive':
        return 'text-green-500';
      case 'negative':
        return 'text-red-500';
      default:
        return 'text-foreground';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {getIcon()}
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", getValueColor())}>
          {formatarMoeda(value)}
        </div>
        {percentageChange !== undefined && (
          <p className={cn(
            "text-xs mt-1",
            percentageChange > 0 ? "text-green-500" : "text-red-500"
          )}>
            {percentageChange > 0 ? "+" : ""}{percentageChange.toFixed(1)}% em relação ao período anterior
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricCard;