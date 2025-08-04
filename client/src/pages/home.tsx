import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  Plus, 
  BarChart3, 
  TrendingUp, 
  Calendar,
  Download,
  Menu,
  MoreVertical,
  Bell,
  Edit3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import ReadingForm from "@/components/reading-form";
import ProfileSelector from "@/components/profile-selector";
import BurgerMenu from "@/components/burger-menu";
import DistributionChart from "@/components/charts/distribution-chart";
import TrendChart from "@/components/charts/trend-chart";
import { BloodPressureReading, Profile } from "@shared/schema";
import { getClassificationColor, parseClassification } from "@/lib/blood-pressure";
import { generateBloodPressureReport, downloadCSVReport } from "@/lib/pdf-generator";

export default function Home() {
  const [activeView, setActiveView] = useState<'readings' | 'statistics' | 'charts'>('readings');
  const [showReadingForm, setShowReadingForm] = useState(false);
  const [showProfileSelector, setShowProfileSelector] = useState(false);
  const [showBurgerMenu, setShowBurgerMenu] = useState(false);
  const [editingReading, setEditingReading] = useState<BloodPressureReading | null>(null);
  const [dateFilter, setDateFilter] = useState("30");
  const [timeFilter, setTimeFilter] = useState("any");
  const [chartType, setChartType] = useState<'distribution1' | 'distribution2' | 'trend'>('distribution1');
  const [showTrendline, setShowTrendline] = useState(false);
  const [showDataPoints, setShowDataPoints] = useState(true);

  // Queries
  const { data: activeProfile } = useQuery<Profile>({
    queryKey: ['/api/profiles/active'],
  });

  const { data: readings = [], isLoading: isLoadingReadings } = useQuery<BloodPressureReading[]>({
    queryKey: ['/api/readings'],
  });

  const { data: statistics } = useQuery({
    queryKey: ['/api/statistics', dateFilter],
    queryFn: async () => {
      const response = await fetch(`/api/statistics?days=${dateFilter}`);
      if (!response.ok) throw new Error('Failed to fetch statistics');
      return response.json();
    },
  });

  // Get latest reading
  const latestReading = readings[0];

  // Get avatar initials and color
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600', 
      'from-pink-500 to-pink-600',
      'from-green-500 to-green-600',
      'from-orange-500 to-orange-600',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const handleExportPDF = () => {
    if (activeProfile && readings.length > 0 && statistics) {
      generateBloodPressureReport(activeProfile, readings, statistics);
    }
  };

  const handleExportCSV = () => {
    if (readings.length > 0) {
      downloadCSVReport(readings);
    }
  };

  const formatReadingDate = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return `Today, ${format(d, 'h:mm a')}`;
    } else if (d.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${format(d, 'h:mm a')}`;
    } else {
      return format(d, 'dd-MM-yyyy, h:mm a');
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto bg-white shadow-xl">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-600 hover:text-slate-900"
            onClick={() => setShowBurgerMenu(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              {activeView === 'readings' && 'Readings'}
              {activeView === 'statistics' && 'Statistics'}
              {activeView === 'charts' && 'Charts'}
            </h1>
            <p className="text-sm text-slate-500">{activeProfile?.name}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-600 hover:text-slate-900"
            onClick={() => setShowProfileSelector(true)}
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
          {activeProfile && (
            <div 
              className={`w-10 h-10 bg-gradient-to-br ${getAvatarColor(activeProfile.name)} rounded-full flex items-center justify-center text-white font-semibold`}
            >
              {getInitials(activeProfile.name)}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Readings View */}
        {activeView === 'readings' && (
          <div className="p-4 space-y-4">
            {/* Quick Stats Card */}
            {latestReading && (
              <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium opacity-90">Latest Reading</h3>
                    <div className="text-2xl font-bold mt-1">
                      {latestReading.systolic}/{latestReading.diastolic}
                    </div>
                    <div className="text-xs opacity-80">
                      {formatReadingDate(latestReading.readingDate.toString())}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{latestReading.pulse} BPM</div>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${getClassificationColor(parseClassification(latestReading.classification))} text-white`}>
                      {parseClassification(latestReading.classification)}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* No Profile Message */}
            {!activeProfile && (
              <Card className="p-6 text-center bg-slate-50 border-2 border-dashed border-slate-300">
                <div className="text-slate-600 mb-3">
                  <div className="text-lg font-semibold">No Profile Selected</div>
                  <p className="text-sm text-slate-500 mt-1">
                    Create or select a profile to start tracking blood pressure readings
                  </p>
                </div>
                <Button
                  onClick={() => setShowProfileSelector(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Profile
                </Button>
              </Card>
            )}

            {/* Readings List */}
            {activeProfile && (
              <div className="space-y-3">
                {isLoadingReadings ? (
                  <div className="text-center py-8">
                    <p className="text-slate-500">Loading readings...</p>
                  </div>
                ) : readings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-500">No readings recorded yet</p>
                    <p className="text-sm text-slate-400 mt-1">Add your first reading to get started</p>
                  </div>
                ) : (
                  readings.map((reading) => (
                    <Card key={reading.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {/* Date Column */}
                          <div className="text-center min-w-[70px]">
                            <div className="text-xs font-medium text-slate-500 uppercase">
                              {format(new Date(reading.readingDate), 'EEE')}
                            </div>
                            <div className="text-sm font-semibold text-slate-900">
                              {format(new Date(reading.readingDate), 'dd-MM')}
                            </div>
                            <div className="text-xs text-slate-500">
                              {format(new Date(reading.readingDate), 'yyyy')}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                              {format(new Date(reading.readingDate), 'h:mm a')}
                            </div>
                          </div>
                          {/* Status Indicator */}
                          <div className={`w-1 h-12 ${getClassificationColor(parseClassification(reading.classification))} rounded-full`}></div>
                          {/* Reading Values */}
                          <div className="flex-1">
                            <div className="text-xl font-bold text-slate-900">
                              {reading.systolic}/{reading.diastolic} <span className="text-sm font-normal text-slate-500">mmHg</span>
                            </div>
                            <div className="text-sm text-slate-500">{parseClassification(reading.classification)}</div>
                            {reading.weight && (
                              <div className="text-xs text-slate-400 mt-1">Weight: {reading.weight}kg</div>
                            )}
                            {reading.notes && (
                              <div className="text-xs text-slate-400 mt-1 italic">"{reading.notes}"</div>
                            )}
                          </div>
                        </div>
                        {/* Pulse and Edit Button */}
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="text-lg font-semibold text-slate-900">{reading.pulse}</div>
                            <div className="text-xs text-slate-500">BPM</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-slate-600"
                            onClick={() => {
                              setEditingReading(reading);
                              setShowReadingForm(true);
                            }}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Statistics View */}
        {activeView === 'statistics' && (
          <div className="p-4 space-y-6">
            {!activeProfile ? (
              <Card className="p-6 text-center bg-slate-50 border-2 border-dashed border-slate-300">
                <div className="text-slate-600 mb-3">
                  <div className="text-lg font-semibold">No Profile Selected</div>
                  <p className="text-sm text-slate-500 mt-1">
                    Create or select a profile to view statistics
                  </p>
                </div>
                <Button
                  onClick={() => setShowProfileSelector(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Profile
                </Button>
              </Card>
            ) : (
              <>
                {/* Filter Controls */}
                <div className="flex space-x-3">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any time of day</SelectItem>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                </SelectContent>
              </Select>
            </div>

                {statistics && (
                  <>
                    {/* Current Average */}
                    <Card className="p-6">
                  <h3 className="text-sm font-medium text-slate-500 mb-2">
                    Average blood pressure ({dateFilter} days)
                  </h3>
                  {statistics.totalReadings > 0 ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold text-slate-900">
                          {statistics.averages.systolic}/{statistics.averages.diastolic}{" "}
                          <span className="text-lg font-normal text-slate-500">mmHg</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-sm font-medium text-slate-700">Hypertension Stage 1</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-slate-400 mb-2">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-slate-900 mb-1">No readings yet</h3>
                      <p className="text-sm text-slate-500">Add your first blood pressure reading to see statistics</p>
                    </div>
                  )}
                </Card>

                {/* Classification Note */}
                <div className="text-center">
                  <p className="text-xs text-slate-500">Classification: ACC/AHA 2017</p>
                </div>

                {/* Detailed Statistics */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    {statistics.totalReadings} readings {statistics.period && statistics.totalReadings > 0 ? `(${format(new Date(statistics.period.startDate), 'MMM d, yyyy')} - ${format(new Date(statistics.period.endDate), 'MMM d, yyyy')})` : '(No data yet)'}
                  </h3>

                  {statistics.totalReadings > 0 ? (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="text-xs font-medium text-slate-500 border-b border-slate-200">
                              <th className="text-left py-2"></th>
                              <th className="text-center py-2">Min</th>
                              <th className="text-center py-2">Max</th>
                              <th className="text-center py-2">Average</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm">
                            <tr className="border-b border-slate-100">
                              <td className="py-3 font-medium text-slate-900">Systolic</td>
                              <td className="text-center py-3">{statistics.ranges.systolic.min}</td>
                              <td className="text-center py-3">{statistics.ranges.systolic.max}</td>
                              <td className="text-center py-3 font-semibold">{statistics.averages.systolic}</td>
                            </tr>
                            <tr className="border-b border-slate-100">
                              <td className="py-3 font-medium text-slate-900">Diastolic</td>
                              <td className="text-center py-3">{statistics.ranges.diastolic.min}</td>
                              <td className="text-center py-3">{statistics.ranges.diastolic.max}</td>
                              <td className="text-center py-3 font-semibold">{statistics.averages.diastolic}</td>
                            </tr>
                            <tr className="border-b border-slate-100">
                              <td className="py-3 font-medium text-slate-900">Pulse</td>
                              <td className="text-center py-3">{statistics.ranges.pulse.min}</td>
                              <td className="text-center py-3">{statistics.ranges.pulse.max}</td>
                              <td className="text-center py-3 font-semibold">{statistics.averages.pulse}</td>
                            </tr>
                            <tr className="border-b border-slate-100">
                              <td className="py-3 font-medium text-slate-900">PP</td>
                              <td className="text-center py-3">-</td>
                              <td className="text-center py-3">-</td>
                              <td className="text-center py-3 font-semibold">{statistics.averages.pulseStressure}</td>
                            </tr>
                            <tr>
                              <td className="py-3 font-medium text-slate-900">MAP</td>
                              <td className="text-center py-3">-</td>
                              <td className="text-center py-3">-</td>
                              <td className="text-center py-3 font-semibold">{statistics.averages.meanArterialPressure}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-4 text-xs text-slate-500">
                        <p>PP = Pulse pressure • MAP = Mean arterial pressure</p>
                        <p>Units: Systolic, Diastolic, PP, MAP (mmHg) • Pulse (BPM)</p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <p>Start tracking your blood pressure to view detailed statistics</p>
                    </div>
                  )}
                </Card>

                {/* Export Buttons */}
                <div className="flex space-x-3">
                  <Button
                    onClick={handleExportPDF}
                    variant="outline"
                    className="flex-1"
                    disabled={!activeProfile || readings.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button
                    onClick={handleExportCSV}
                    variant="outline"
                    className="flex-1"
                    disabled={readings.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* Charts View */}
        {activeView === 'charts' && (
          <div className="p-4 space-y-6">
            {!activeProfile ? (
              <Card className="p-6 text-center bg-slate-50 border-2 border-dashed border-slate-300">
                <div className="text-slate-600 mb-3">
                  <div className="text-lg font-semibold">No Profile Selected</div>
                  <p className="text-sm text-slate-500 mt-1">
                    Create or select a profile to view charts
                  </p>
                </div>
                <Button
                  onClick={() => setShowProfileSelector(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Profile
                </Button>
              </Card>
            ) : (
              <>
                {/* Chart Type Tabs */}
                <Tabs value={chartType} onValueChange={(value) => setChartType(value as any)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="distribution1">DISTRIBUTION I</TabsTrigger>
                    <TabsTrigger value="distribution2">DISTRIBUTION II</TabsTrigger>
                    <TabsTrigger value="trend">TREND</TabsTrigger>
                  </TabsList>

              {/* Filter Controls */}
              <div className="flex space-x-3">
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any time of day</SelectItem>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="evening">Evening</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <TabsContent value="distribution1">
                <Card className="p-6">
                  <h3 className="text-sm font-medium text-slate-700 mb-4">
                    {statistics?.totalReadings || 0} readings ({format(new Date(), 'MMM d, yyyy')} - {format(new Date(), 'MMM d, yyyy')})
                  </h3>
                  
                  {statistics && (
                    <DistributionChart 
                      data={statistics.distribution} 
                      totalReadings={statistics.totalReadings}
                    />
                  )}
                  
                  <div className="mt-6 text-center">
                    <p className="text-xs text-slate-500">Classification: ACC/AHA 2017</p>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="distribution2">
                <Card className="p-6">
                  <p className="text-center text-slate-500 py-8">Distribution II chart coming soon</p>
                </Card>
              </TabsContent>

              <TabsContent value="trend">
                <Card className="p-6">
                  <h3 className="text-sm font-medium text-slate-700 mb-4">
                    {statistics?.totalReadings || 0} readings ({format(new Date(), 'MMM d, yyyy')} - {format(new Date(), 'MMM d, yyyy')})
                  </h3>
                  
                  <TrendChart 
                    readings={readings}
                    showTrendline={showTrendline}
                    showDataPoints={showDataPoints}
                  />
                  
                  {/* Chart Controls */}
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="trendline" className="text-sm text-slate-600">Trendline</Label>
                      <Switch
                        id="trendline"
                        checked={showTrendline}
                        onCheckedChange={setShowTrendline}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="datapoints" className="text-sm text-slate-600">Data point marker</Label>
                      <Switch
                        id="datapoints"
                        checked={showDataPoints}
                        onCheckedChange={setShowDataPoints}
                      />
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
              </>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-slate-200 px-4 py-2">
        <div className="flex justify-around">
          <Button
            variant="ghost"
            className={`flex flex-col items-center space-y-1 py-2 px-3 ${
              activeView === 'readings' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
            onClick={() => setActiveView('readings')}
          >
            <Calendar className="h-5 w-5" />
            <span className="text-xs font-medium">Readings</span>
          </Button>
          <Button
            variant="ghost"
            className={`flex flex-col items-center space-y-1 py-2 px-3 ${
              activeView === 'statistics' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
            onClick={() => setActiveView('statistics')}
          >
            <BarChart3 className="h-5 w-5" />
            <span className="text-xs font-medium">Statistics</span>
          </Button>
          <Button
            variant="ghost"
            className={`flex flex-col items-center space-y-1 py-2 px-3 ${
              activeView === 'charts' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
            onClick={() => setActiveView('charts')}
          >
            <TrendingUp className="h-5 w-5" />
            <span className="text-xs font-medium">Charts</span>
          </Button>
        </div>
      </nav>

      {/* Floating Action Button */}
      {activeProfile && (
        <Button
          onClick={() => setShowReadingForm(true)}
          className="fixed bottom-20 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      {/* Modals */}
      <ReadingForm
        isOpen={showReadingForm}
        onClose={() => {
          setShowReadingForm(false);
          setEditingReading(null);
        }}
        editingReading={editingReading}
      />
      <ProfileSelector
        isOpen={showProfileSelector}
        onClose={() => setShowProfileSelector(false)}
      />
      <BurgerMenu
        isOpen={showBurgerMenu}
        onClose={() => setShowBurgerMenu(false)}
      />
    </div>
  );
}
