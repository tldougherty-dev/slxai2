import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Users, FileText, Search, Download, Eye, BarChart3 } from 'lucide-react';
import { getMetrics, AnalyticsMetrics } from '@/lib/analytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const data = await getMetrics(parseInt(timeRange));
        setMetrics(data);
      } catch (error) {
        console.error('Error loading metrics:', error);
        // Set empty metrics on error
        setMetrics({
          totalPageViews: 0,
          totalVotes: 0,
          totalFileUploads: 0,
          totalSearches: 0,
          totalExports: 0,
          activeUsers: 0,
          popularPages: [],
          recentActivity: [],
        });
      }
    };

    loadMetrics();
    const interval = setInterval(loadMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  if (!metrics) {
    return <div className="text-center py-8 text-gray-500">Loading analytics...</div>;
  }

  const chartData = [
    { name: 'Page Views', value: metrics.totalPageViews },
    { name: 'Votes', value: metrics.totalVotes },
    { name: 'File Uploads', value: metrics.totalFileUploads },
    { name: 'Searches', value: metrics.totalSearches },
    { name: 'Exports', value: metrics.totalExports },
  ];

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Metrics Overview</h3>
        <Select value={timeRange} onValueChange={(value: '7' | '30' | '90') => setTimeRange(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Page Views</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalPageViews}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Votes</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalVotes}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">File Uploads</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalFileUploads}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileText className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Searches</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalSearches}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Search className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.activeUsers}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Activity Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#0080FF" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Popular Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {!metrics.popularPages || metrics.popularPages.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No page view data yet</p>
              ) : (
                metrics.popularPages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600 w-6">{index + 1}.</span>
                      <span className="text-sm text-gray-900">{page.path}</span>
                    </div>
                    <span className="text-sm font-semibold text-electric-blue">{page.views}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-electric-blue" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {!metrics.recentActivity || metrics.recentActivity.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
            ) : (
              metrics.recentActivity.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-2 border border-gray-200 rounded-lg text-sm">
                  <div>
                    <span className="font-medium text-gray-900">{event.action}</span>
                    {event.label && <span className="text-gray-600 ml-2">• {event.label}</span>}
                  </div>
                  <span className="text-gray-500 text-xs">
                    {new Date(event.timestamp).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

