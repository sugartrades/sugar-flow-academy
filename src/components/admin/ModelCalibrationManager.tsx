import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertCircle, Plus, Upload, Download, Edit2, Trash2, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface CalibrationData {
  id: string;
  event_name: string;
  event_date: string;
  xrp_price_usd: number;
  market_cap_usd: number;
  order_value_usd: number;
  order_source: string;
  order_type: string;
  expected_multiplier: number;
  actual_multiplier?: number;
  market_cap_increase_usd?: number;
  time_to_peak_minutes?: number;
  confidence_score: number;
  data_quality: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
}

export const ModelCalibrationManager: React.FC = () => {
  const [calibrationData, setCalibrationData] = useState<CalibrationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<CalibrationData>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchCalibrationData();
  }, []);

  const fetchCalibrationData = async () => {
    try {
      const { data, error } = await supabase
        .from('model_calibration_data')
        .select('*')
        .order('event_date', { ascending: false });

      if (error) throw error;
      setCalibrationData(data || []);
    } catch (error) {
      console.error('Error fetching calibration data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load calibration data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate required fields
      if (!formData.event_name || !formData.event_date || !formData.xrp_price_usd || 
          !formData.market_cap_usd || !formData.order_value_usd || !formData.expected_multiplier ||
          !formData.order_source || !formData.order_type) {
        toast({
          title: 'Error',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        });
        return;
      }

      const dataToSubmit = {
        event_name: formData.event_name!,
        event_date: formData.event_date!,
        xrp_price_usd: formData.xrp_price_usd!,
        market_cap_usd: formData.market_cap_usd!,
        order_value_usd: formData.order_value_usd!,
        order_source: formData.order_source!,
        order_type: formData.order_type!,
        expected_multiplier: formData.expected_multiplier!,
        actual_multiplier: formData.actual_multiplier,
        market_cap_increase_usd: formData.market_cap_increase_usd,
        time_to_peak_minutes: formData.time_to_peak_minutes,
        confidence_score: formData.confidence_score || 0.75,
        data_quality: formData.data_quality || 'good',
        notes: formData.notes,
        is_active: formData.is_active !== undefined ? formData.is_active : true,
      };
      
      if (editingId) {
        const { error } = await supabase
          .from('model_calibration_data')
          .update(dataToSubmit)
          .eq('id', editingId);
        
        if (error) throw error;
        toast({ title: 'Success', description: 'Calibration data updated successfully' });
      } else {
        const { error } = await supabase
          .from('model_calibration_data')
          .insert(dataToSubmit);
        
        if (error) throw error;
        toast({ title: 'Success', description: 'Calibration data added successfully' });
      }
      
      await fetchCalibrationData();
      resetForm();
    } catch (error) {
      console.error('Error saving calibration data:', error);
      toast({
        title: 'Error',
        description: 'Failed to save calibration data',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('model_calibration_data')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchCalibrationData();
      toast({ title: 'Success', description: 'Calibration data deleted successfully' });
    } catch (error) {
      console.error('Error deleting calibration data:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete calibration data',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({});
    setEditingId(null);
    setShowAddDialog(false);
  };

  const startEdit = (data: CalibrationData) => {
    setFormData(data);
    setEditingId(data.id);
    setShowAddDialog(true);
  };

  const exportData = async () => {
    try {
      const csv = [
        'Event Name,Event Date,XRP Price USD,Market Cap USD,Order Value USD,Order Source,Order Type,Expected Multiplier,Actual Multiplier,Market Cap Increase USD,Time to Peak Minutes,Confidence Score,Data Quality,Notes',
        ...calibrationData.map(row => 
          `"${row.event_name}","${row.event_date}",${row.xrp_price_usd},${row.market_cap_usd},${row.order_value_usd},"${row.order_source}","${row.order_type}",${row.expected_multiplier},${row.actual_multiplier || ''},${row.market_cap_increase_usd || ''},${row.time_to_peak_minutes || ''},${row.confidence_score},"${row.data_quality}","${row.notes || ''}"`
        )
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `calibration-data-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({ title: 'Success', description: 'Data exported successfully' });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Error',
        description: 'Failed to export data',
        variant: 'destructive',
      });
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-200';
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'fair': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'poor': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading calibration data...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Model Calibration Data Management
          </CardTitle>
          <CardDescription>
            Manage real market events for model calibration and accuracy improvement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="data" className="w-full">
            <TabsList>
              <TabsTrigger value="data">Data Management</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="data" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogTrigger asChild>
                      <Button onClick={() => resetForm()}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Data Point
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingId ? 'Edit' : 'Add'} Calibration Data
                        </DialogTitle>
                      </DialogHeader>
                      
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="event_name">Event Name</Label>
                            <Input
                              id="event_name"
                              value={formData.event_name || ''}
                              onChange={(e) => setFormData({...formData, event_name: e.target.value})}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="event_date">Event Date</Label>
                            <Input
                              id="event_date"
                              type="date"
                              value={formData.event_date || ''}
                              onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                              required
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="xrp_price_usd">XRP Price (USD)</Label>
                            <Input
                              id="xrp_price_usd"
                              type="number"
                              step="0.0001"
                              value={formData.xrp_price_usd || ''}
                              onChange={(e) => setFormData({...formData, xrp_price_usd: parseFloat(e.target.value)})}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="market_cap_usd">Market Cap (USD)</Label>
                            <Input
                              id="market_cap_usd"
                              type="number"
                              value={formData.market_cap_usd || ''}
                              onChange={(e) => setFormData({...formData, market_cap_usd: parseFloat(e.target.value)})}
                              required
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="order_value_usd">Order Value (USD)</Label>
                            <Input
                              id="order_value_usd"
                              type="number"
                              value={formData.order_value_usd || ''}
                              onChange={(e) => setFormData({...formData, order_value_usd: parseFloat(e.target.value)})}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="expected_multiplier">Expected Multiplier</Label>
                            <Input
                              id="expected_multiplier"
                              type="number"
                              step="0.01"
                              value={formData.expected_multiplier || ''}
                              onChange={(e) => setFormData({...formData, expected_multiplier: parseFloat(e.target.value)})}
                              required
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="order_source">Order Source</Label>
                            <Select
                              value={formData.order_source || ''}
                              onValueChange={(value) => setFormData({...formData, order_source: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select source" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="coinglass">Coinglass</SelectItem>
                                <SelectItem value="manual">Manual</SelectItem>
                                <SelectItem value="whale_tracker">Whale Tracker</SelectItem>
                                <SelectItem value="exchange_data">Exchange Data</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="order_type">Order Type</Label>
                            <Select
                              value={formData.order_type || ''}
                              onValueChange={(value) => setFormData({...formData, order_type: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="large_buy">Large Buy</SelectItem>
                                <SelectItem value="large_sell">Large Sell</SelectItem>
                                <SelectItem value="whale_movement">Whale Movement</SelectItem>
                                <SelectItem value="institutional_order">Institutional Order</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="confidence_score">Confidence Score (0-1)</Label>
                            <Input
                              id="confidence_score"
                              type="number"
                              step="0.01"
                              min="0"
                              max="1"
                              value={formData.confidence_score || ''}
                              onChange={(e) => setFormData({...formData, confidence_score: parseFloat(e.target.value)})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="data_quality">Data Quality</Label>
                            <Select
                              value={formData.data_quality || ''}
                              onValueChange={(value) => setFormData({...formData, data_quality: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select quality" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="excellent">Excellent</SelectItem>
                                <SelectItem value="good">Good</SelectItem>
                                <SelectItem value="fair">Fair</SelectItem>
                                <SelectItem value="poor">Poor</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="notes">Notes</Label>
                          <Textarea
                            id="notes"
                            value={formData.notes || ''}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            rows={3}
                          />
                        </div>
                        
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={resetForm}>
                            Cancel
                          </Button>
                          <Button type="submit">
                            {editingId ? 'Update' : 'Add'} Data Point
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={exportData}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Order Value</TableHead>
                      <TableHead>Expected Multiplier</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Quality</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {calibrationData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.event_name}</TableCell>
                        <TableCell>{format(new Date(item.event_date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>${(item.order_value_usd / 1000000).toFixed(1)}M</TableCell>
                        <TableCell>{item.expected_multiplier}x</TableCell>
                        <TableCell>{(item.confidence_score * 100).toFixed(0)}%</TableCell>
                        <TableCell>
                          <Badge className={getQualityColor(item.data_quality)}>
                            {item.data_quality}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEdit(item)}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Data Points</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{calibrationData.length}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Average Confidence</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {calibrationData.length > 0 
                        ? Math.round(calibrationData.reduce((sum, item) => sum + item.confidence_score, 0) / calibrationData.length * 100)
                        : 0}%
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">High Quality Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {calibrationData.filter(item => ['excellent', 'good'].includes(item.data_quality)).length}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};