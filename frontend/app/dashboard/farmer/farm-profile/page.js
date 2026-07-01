'use client';

import { Calendar, Edit, MapPin, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getApiUrl } from '@/lib/apiConfig';

export default function FarmProfilePage() {
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [showAddFarmModal, setShowAddFarmModal] = useState(false);
  const [showEditFarmModal, setShowEditFarmModal] = useState(false);
  const [showAddCropModal, setShowAddCropModal] = useState(false);
  const [showAreaErrorModal, setShowAreaErrorModal] = useState(false);
  const [areaErrorMessage, setAreaErrorMessage] = useState('');
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [showHarvestModal, setShowHarvestModal] = useState(false);
  const [harvestForm, setHarvestForm] = useState({ actualYield: '', totalCost: '' });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [addingCrop, setAddingCrop] = useState(false);
  const [generatingTimeline, setGeneratingTimeline] = useState(new Set());

  // Form states
  const [farmForm, setFarmForm] = useState({
    name: '',
    location: '',
    landSize: '',
    soilType: '',
    mapView: '',
    description: '',
    establishedYear: ''
  });

  const [cropForm, setCropForm] = useState({
    name: '',
    variety: '',
    area: '',
    unit: 'acres',
    plantingDate: '',
    expectedHarvestDate: '',
    estimatedYield: '',
    yieldUnit: 'kg',
    notes: ''
  });



  useEffect(() => {
    // Get user data from cookies
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    };

    const userId = getCookie('userId');
    const userName = getCookie('userName');
    const userEmail = getCookie('userEmail');
    const role = getCookie('role');

    if (userId) {
      const userData = {
        _id: userId,
        name: userName,
        email: userEmail,
        role: role
      };
      setUser(userData);
      fetchFarms(userId);
      fetchCrops(userId);
    } else {
      setLoading(false);
    }
  }, []);

  const parseLandSizeToAcres = (landSizeStr) => {
    if (!landSizeStr || typeof landSizeStr !== 'string') return NaN;
    const lower = landSizeStr.trim().toLowerCase();
    const match = lower.match(/\d+(?:\.\d+)?/);
    const value = match ? Number(match[0]) : NaN;
    if (isNaN(value)) return NaN;
    let unit = 'acres';
    if (/hectare|hectares|\bha\b/.test(lower)) unit = 'hectares';
    else if (/acre|acres|\bac\b/.test(lower)) unit = 'acres';
    else if (/square\s?meter|sqm|m2|sq\.?\s?m/.test(lower)) unit = 'sqm';
    if (unit === 'acres') return value;
    if (unit === 'hectares') return value * 2.47105;
    if (unit === 'sqm') return value / 4046.8564224;
    return value;
  };

  const getAvailableAcresForSelectedFarm = () => {
    if (!selectedFarm) return null;
    const totalAcres = parseLandSizeToAcres(selectedFarm.landSize || '');
    if (isNaN(totalAcres)) return null;
    const activeCrops = crops
      .filter(c => c.farm && c.farm._id === selectedFarm._id)
      .filter(c => c.stage !== 'harvested');
    const usedAcres = activeCrops.reduce((sum, c) => sum + Number(c.area || 0), 0);
    const remaining = Math.max(0, totalAcres - usedAcres);
    return remaining;
  };

  const fetchFarms = async (farmerId) => {
    try {
      const response = await fetch(getApiUrl(`/farms/farmer/${farmerId}`), {
        credentials: 'include' // This will send cookies with the request
      });
      const data = await response.json();
      if (data.success) {
        setFarms(data.data);
        if (data.data.length > 0) {
          setSelectedFarm(data.data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching farms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCrops = async (farmerId) => {
    try {
      const response = await fetch(getApiUrl(`/crops/farmer/${farmerId}`), {
        credentials: 'include' // This will send cookies with the request
      });
      const data = await response.json();
      if (data.success) {
        setCrops(data.data);
      }
    } catch (error) {
      console.error('Error fetching crops:', error);
    }
  };

  const handleAddFarm = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(getApiUrl('/farms'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          ...farmForm,
          farmer: user._id
        })
      });
      const data = await response.json();
      if (data.success) {
        setFarms([...farms, data.farm]);
        setShowAddFarmModal(false);
        setFarmForm({
          name: '',
          location: '',
          landSize: '',
          soilType: '',
          mapView: '',
          description: '',
          establishedYear: ''
        });
      }
    } catch (error) {
      console.error('Error adding farm:', error);
    }
  };

  const handleEditFarm = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(getApiUrl(`/farms/${selectedFarm._id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(farmForm)
      });
      const data = await response.json();
      if (data.success) {
        setFarms(farms.map(farm => farm._id === selectedFarm._id ? data.data : farm));
        setSelectedFarm(data.data);
        setShowEditFarmModal(false);
      }
    } catch (error) {
      console.error('Error updating farm:', error);
    }
  };

  const handleDeleteFarm = async (farmId) => {
    if (!confirm('Are you sure you want to delete this farm?')) return;
    
    try {
      const response = await fetch(getApiUrl(`/farms/${farmId}`), {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setFarms(farms.filter(farm => farm._id !== farmId));
        if (selectedFarm && selectedFarm._id === farmId) {
          setSelectedFarm(farms.length > 1 ? farms.find(f => f._id !== farmId) : null);
        }
      }
    } catch (error) {
      console.error('Error deleting farm:', error);
    }
  };

  const handleAddCrop = async (e) => {
    e.preventDefault();
    setAddingCrop(true);
    try {
      const response = await fetch(getApiUrl('/crops'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          ...cropForm,
          farm: selectedFarm._id,
          farmer: user._id,
          area: parseFloat(cropForm.area),
          estimatedYield: cropForm.estimatedYield ? parseFloat(cropForm.estimatedYield) : undefined
        })
      });
      const data = await response.json();
      if (data.success) {
        setCrops([...crops, data.data]);
        setShowAddCropModal(false);
        setCropForm({
          name: '',
          variety: '',
          area: '',
          unit: 'acres',
          plantingDate: '',
          expectedHarvestDate: '',
          estimatedYield: '',
          yieldUnit: 'kg',
          notes: ''
        });
        alert('Crop added successfully! AI yield prediction generated.');
      } else {
        // Show a friendly modal for insufficient area or any validation failure
        setAreaErrorMessage(data.message || 'Failed to add crop. Please check inputs.');
        setShowAreaErrorModal(true);
      }
    } catch (error) {
      console.error('Error adding crop:', error);
      setAreaErrorMessage('Failed to add crop. Please try again.');
      setShowAreaErrorModal(true);
    } finally {
      setAddingCrop(false);
    }
  };

  const handleUpdateCropStage = async (cropId, stage) => {
    try {
      if (stage === 'harvested') {
        const crop = crops.find(c => c._id === cropId);
        setSelectedCrop(crop);
        setHarvestForm({ actualYield: '', totalCost: '' });
        setShowHarvestModal(true);
        return;
      }

      const response = await fetch(getApiUrl(`/crops/${cropId}/stage`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ stage })
      });
      const data = await response.json();
      if (data.success) {
        setCrops(crops.map(crop => crop._id === cropId ? data.data : crop));
      }
    } catch (error) {
      console.error('Error updating crop stage:', error);
    }
  };

  const handleGenerateTimelineForCrop = async (cropId) => {
    setGeneratingTimeline(prev => new Set(prev).add(cropId));
    try {
      const res = await fetch(getApiUrl(`/crops/${cropId}/timeline/generate`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        alert('Timeline generated for this crop. Check Planting Calendar to manage tasks.');
      } else {
        alert(data.message || 'Failed to generate timeline');
      }
    } catch (e) {
      alert(e.message || 'Failed to generate timeline');
    } finally {
      setGeneratingTimeline(prev => {
        const newSet = new Set(prev);
        newSet.delete(cropId);
        return newSet;
      });
    }
  };



  const getStageColor = (stage) => {
    const colors = {
      planning: 'bg-white/[0.04] text-gray-800',
      planting: 'bg-sky-500/10 text-sky-300',
      growing: 'bg-emerald-500/10 text-emerald-300',
      flowering: 'bg-purple-100 text-purple-800',
      fruiting: 'bg-orange-500/10 text-orange-300',
      harvest: 'bg-amber-500/10 text-amber-300',
      harvested: 'bg-red-500/50/10 text-red-300'
    };
    return colors[stage] || 'bg-white/[0.04] text-gray-800';
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Farm Profile</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowAddFarmModal(true)}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-4 py-2 rounded-lg hover:brightness-110 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Farm
          </button>
        </div>
      </div>

      {/* Farm Selection */}
      {farms.length > 0 && (
        <div className="bg-surface-800/80 rounded-2xl shadow-sm border border-white/[0.06] p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Select Farm</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {farms.map((farm) => (
              <div 
                key={farm._id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedFarm?._id === farm._id 
                    ? 'border-teal-500 bg-teal-500/10' 
                    : 'border-white/[0.06] hover:border-teal-300'
                }`}
                onClick={() => setSelectedFarm(farm)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-white">{farm.name}</h3>
                    <p className="text-sm text-surface-500">{farm.location}</p>
                    <p className="text-sm text-surface-500">{farm.landSize}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFarm(farm);
                        setFarmForm({
                          name: farm.name,
                          location: farm.location,
                          landSize: farm.landSize,
                          soilType: farm.soilType,
                          mapView: farm.mapView,
                          description: farm.description || '',
                          establishedYear: farm.establishedYear || ''
                        });
                        setShowEditFarmModal(true);
                      }}
                      className="p-1 text-surface-500 hover:text-teal-400"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFarm(farm._id);
                      }}
                      className="p-1 text-surface-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedFarm && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Farm Information */}
          <div className="bg-surface-800/80 rounded-2xl shadow-sm border border-white/[0.06] p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Farm Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-surface-500" />
                <div>
                  <p className="text-sm text-surface-500">Location</p>
                  <p className="text-white">{selectedFarm.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-surface-500" />
                <div>
                  <p className="text-sm text-surface-500">Established</p>
                  <p className="text-white">{selectedFarm.establishedYear || 'N/A'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-surface-500 mb-1">Farm Size</p>
                <p className="text-white">{selectedFarm.landSize}</p>
              </div>
              <div>
                <p className="text-sm text-surface-500 mb-1">Available Area</p>
                <p className="text-white">{getAvailableAcresForSelectedFarm() === null ? '—' : `${getAvailableAcresForSelectedFarm().toFixed(2)} acres`}</p>
              </div>
              <div>
                <p className="text-sm text-surface-500 mb-1">Soil Type</p>
                <p className="text-white">{selectedFarm.soilType}</p>
              </div>
              {selectedFarm.description && (
                <div>
                  <p className="text-sm text-surface-500 mb-1">Description</p>
                  <p className="text-white">{selectedFarm.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Current Crops */}
          <div className="bg-surface-800/80 rounded-2xl shadow-sm border border-white/[0.06] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Current Crops</h2>
              <button
                onClick={() => setShowAddCropModal(true)}
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-3 py-1 rounded-lg hover:brightness-110 transition-colors text-sm flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add Crop
              </button>
            </div>
            <div className="space-y-3">
              {crops.filter(crop => crop.farm?._id === selectedFarm._id).map((crop) => (
                <div key={crop._id} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-white">{crop.name} - {crop.variety}</p>
                    <p className="text-sm text-surface-500">{crop.area} {crop.unit}</p>
                    <p className="text-xs text-surface-500">
                      Planted: {new Date(crop.plantingDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStageColor(crop.stage)}`}>
                      {crop.stage}
                    </span>
                    <button
                      onClick={() => handleGenerateTimelineForCrop(crop._id)}
                      disabled={generatingTimeline.has(crop._id)}
                      className="text-xs px-2 py-1 rounded border border-white/[0.06] hover:bg-white/[0.06] bg-white/[0.04] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      title="Generate timeline for this crop"
                    >
                      {generatingTimeline.has(crop._id) ? (
                        <>
                          <div className="w-3 h-3 border border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                          AI Generating...
                        </>
                      ) : (
                        'Generate Timeline'
                      )}
                    </button>
                                         {crop.stage === 'harvested' && (
                       <span className="text-xs text-emerald-400 font-medium">
                         Product created!
                       </span>
                     )}
                    <select
                      value={crop.stage}
                      onChange={(e) => handleUpdateCropStage(crop._id, e.target.value)}
                      className="text-xs border rounded px-1 py-1"
                    >
                      <option value="planning">Planning</option>
                      <option value="planting">Planting</option>
                      <option value="growing">Growing</option>
                      <option value="flowering">Flowering</option>
                      <option value="fruiting">Fruiting</option>
                      <option value="harvest">Harvest</option>
                      <option value="harvested">Harvested</option>
                    </select>
                  </div>
                </div>
              ))}
              {crops.filter(crop => crop.farm?._id === selectedFarm._id).length === 0 && (
                <p className="text-surface-500 text-center py-4">No crops added yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Farm Modal */}
      {showAddFarmModal && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddFarmModal(false)} />
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-surface-800/80 rounded-2xl border border-white/[0.06] p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add New Farm</h2>
            <form onSubmit={handleAddFarm} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">Farm Name</label>
                <input
                  type="text"
                  value={farmForm.name}
                  onChange={(e) => setFarmForm({...farmForm, name: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">Location</label>
                <input
                  type="text"
                  value={farmForm.location}
                  onChange={(e) => setFarmForm({...farmForm, location: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">Land Size</label>
                <input
                  type="text"
                  value={farmForm.landSize}
                  onChange={(e) => setFarmForm({...farmForm, landSize: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="e.g., 50 acres"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">Soil Type</label>
                <input
                  type="text"
                  value={farmForm.soilType}
                  onChange={(e) => setFarmForm({...farmForm, soilType: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">Map View URL</label>
                <input
                  type="url"
                  value={farmForm.mapView}
                  onChange={(e) => setFarmForm({...farmForm, mapView: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">Description</label>
                <textarea
                  value={farmForm.description}
                  onChange={(e) => setFarmForm({...farmForm, description: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">Established Year</label>
                <input
                  type="number"
                  value={farmForm.establishedYear}
                  onChange={(e) => setFarmForm({...farmForm, establishedYear: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-2 rounded-lg hover:brightness-110"
                >
                  Add Farm
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddFarmModal(false)}
                  className="flex-1 bg-gray-300 text-surface-300 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Farm Modal */}
      {showEditFarmModal && selectedFarm && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowEditFarmModal(false)} />
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-surface-800/80 rounded-2xl border border-white/[0.06] p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Farm</h2>
            <form onSubmit={handleEditFarm} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">Farm Name</label>
                <input
                  type="text"
                  value={farmForm.name}
                  onChange={(e) => setFarmForm({...farmForm, name: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">Location</label>
                <input
                  type="text"
                  value={farmForm.location}
                  onChange={(e) => setFarmForm({...farmForm, location: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">Land Size</label>
                <input
                  type="text"
                  value={farmForm.landSize}
                  onChange={(e) => setFarmForm({...farmForm, landSize: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">Soil Type</label>
                <input
                  type="text"
                  value={farmForm.soilType}
                  onChange={(e) => setFarmForm({...farmForm, soilType: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">Map View URL</label>
                <input
                  type="url"
                  value={farmForm.mapView}
                  onChange={(e) => setFarmForm({...farmForm, mapView: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">Description</label>
                <textarea
                  value={farmForm.description}
                  onChange={(e) => setFarmForm({...farmForm, description: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">Established Year</label>
                <input
                  type="number"
                  value={farmForm.establishedYear}
                  onChange={(e) => setFarmForm({...farmForm, establishedYear: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-2 rounded-lg hover:brightness-110"
                >
                  Update Farm
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditFarmModal(false)}
                  className="flex-1 bg-gray-300 text-surface-300 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Crop Modal */}
      {showAddCropModal && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddCropModal(false)} />
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-surface-800/80 rounded-2xl border border-white/[0.06] p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add New Crop</h2>
            <p className="text-sm text-sky-400 mb-4">✨ AI will automatically predict yield using Gemini API</p>
            <form onSubmit={handleAddCrop} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">Crop Name</label>
                <input
                  type="text"
                  value={cropForm.name}
                  onChange={(e) => setCropForm({...cropForm, name: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">Variety</label>
                <input
                  type="text"
                  value={cropForm.variety}
                  onChange={(e) => setCropForm({...cropForm, variety: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1">Area</label>
                  <input
                    type="number"
                    value={cropForm.area}
                    onChange={(e) => setCropForm({...cropForm, area: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                  <p className="text-xs text-surface-500 mt-1">
                    Available: {getAvailableAcresForSelectedFarm() === null ? '—' : `${getAvailableAcresForSelectedFarm().toFixed(2)} acres`}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1">Unit</label>
                  <input type="text" value="acres" readOnly className="w-full border rounded-lg px-3 py-2 bg-white/[0.04] text-surface-300" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1">Planting Date</label>
                  <input
                    type="date"
                    value={cropForm.plantingDate}
                    onChange={(e) => setCropForm({...cropForm, plantingDate: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1">Expected Harvest Date</label>
                  <input
                    type="date"
                    value={cropForm.expectedHarvestDate}
                    min={cropForm.plantingDate || undefined}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (cropForm.plantingDate && val && new Date(val) < new Date(cropForm.plantingDate)) {
                        return; // prevent earlier date selection
                      }
                      setCropForm({...cropForm, expectedHarvestDate: val});
                    }}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1">Expected Yield</label>
                  <input
                    type="number"
                    value={cropForm.estimatedYield}
                    onChange={(e) => setCropForm({...cropForm, estimatedYield: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1">Yield Unit</label>
                  <select
                    value={cropForm.yieldUnit}
                    onChange={(e) => setCropForm({...cropForm, yieldUnit: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="kg">kg</option>
                    <option value="lb">lb</option>
                    <option value="tons">tons</option>
                    <option value="bushels">bushels</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">Notes</label>
                <textarea
                  value={cropForm.notes}
                  onChange={(e) => setCropForm({...cropForm, notes: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  rows="3"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={addingCrop}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-2 rounded-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {addingCrop ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Generating AI Prediction...
                    </>
                  ) : (
                    'Add Crop'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCropModal(false)}
                  disabled={addingCrop}
                  className="flex-1 bg-gray-300 text-surface-300 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Area Error Modal */}
      {showAreaErrorModal && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAreaErrorModal(false)} />
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-surface-800/80 rounded-2xl border border-white/[0.06] p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-2 text-red-700">Area exceeds available land</h2>
            <p className="text-surface-300 mb-4">{areaErrorMessage}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAreaErrorModal(false)}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-2 rounded-lg hover:brightness-110"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Harvest Modal */}
      {showHarvestModal && selectedCrop && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowHarvestModal(false)} />
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-surface-800/80 rounded-2xl border border-white/[0.06] p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Mark Harvest for {selectedCrop.name} - {selectedCrop.variety}</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const response = await fetch(getApiUrl(`/crops/${selectedCrop._id}/stage`), {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ stage: 'harvested', actualYield: parseFloat(harvestForm.actualYield), totalCost: parseFloat(harvestForm.totalCost || '0') })
                  });
                  const data = await response.json();
                  if (data.success) {
                    setCrops(crops.map(c => c._id === selectedCrop._id ? data.data : c));
                    setShowHarvestModal(false);
                    setSelectedCrop(null);
                    alert('Crop harvested! A product has been created. You can set price and publish it in My Products.');
                  } else {
                    alert(data.message || 'Failed to mark as harvested');
                  }
                } catch (err) {
                  console.error('Error harvesting crop:', err);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">Actual Yield</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={harvestForm.actualYield}
                  onChange={(e) => setHarvestForm({ ...harvestForm, actualYield: e.target.value })}
                  placeholder={`Enter actual yield in ${selectedCrop.yieldUnit}`}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
                <p className="text-xs text-surface-500 mt-1">Unit: {selectedCrop.yieldUnit}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">Total Cost</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={harvestForm.totalCost}
                  onChange={(e) => setHarvestForm({ ...harvestForm, totalCost: e.target.value })}
                  placeholder="Enter total cost for this crop"
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
                <p className="text-xs text-surface-500 mt-1">Includes seeds, inputs, labor, etc.</p>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-2 rounded-lg hover:brightness-110">Confirm Harvest</button>
                <button type="button" onClick={() => { setShowHarvestModal(false); setSelectedCrop(null); }} className="flex-1 bg-gray-300 text-surface-300 py-2 rounded-lg hover:bg-gray-400">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}