import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  gradient, 
  trend, 
  trendValue,
  subtitle,
  badge 
}) {
  const isPositiveTrend = trend === 'up';
  
  return (
    <Card className="relative overflow-hidden border-0 shadow-lg hover-lift">
      <div className={`absolute inset-0 opacity-5 ${gradient}`} />
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-medium text-slate-600">{title}</h3>
              {badge && (
                <Badge variant="outline" className="text-xs">
                  {badge}
                </Badge>
              )}
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {value}
            </div>
            {subtitle && (
              <p className="text-sm text-slate-500">
                {subtitle}
              </p>
            )}
            {trend && (
              <div className="flex items-center mt-2">
                {isPositiveTrend ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  isPositiveTrend ? 'text-green-600' : 'text-red-600'
                }`}>
                  {trendValue}
                </span>
                <span className="text-sm text-slate-500 ml-1">
                  vs mês anterior
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${gradient} bg-opacity-10`}>
            <Icon className={`w-6 h-6`} style={{color: 'inherit'}} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}